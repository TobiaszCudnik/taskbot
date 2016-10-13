/// <reference path="../../node_modules/google-api-nodejs-tsd/dist/googleapis.gmail.v1/googleapis.gmail.v1.d.ts" />
import AsyncMachine, {
  IState
} from 'asyncmachine';
import * as moment from 'moment';
import { Gmail } from './gmail'
import { Semaphore } from 'await-semaphore';

type Thread = google.gmail.v1.Thread

class States extends AsyncMachine {

  Enabled: IState = {};
  Dirty: IState = {
    blocks: ['MsgsFetched', 'ThreadsFetched']
  };

  FetchingThreads: IState = {
    auto: true,
    requires: ['Enabled'],
    blocks: ['ThreadsFetched']
  };
  ThreadsFetched: IState = {
    requires: ['Enabled'],
    blocks: ['FetchingThreads']
  };

  FetchingMsgs: IState = {
    requires: ['Enabled', 'ThreadsFetched'],
    blocks: ['MsgsFetched']
  };
  MsgsFetched: IState = {
    blocks: ['FetchingMsgs']
  };
}


class GmailQuery {
  gmail: Gmail;
	api: google.gmail.v1.Gmail;
  states: States;
	semaphore: Semaphore;
  synced_history_id: number | null;

  threads: Thread[] = [];
  query: string;
  name: string;
  completions: Map<string, Thread> = new Map
  previous_threads: Thread[] | null = null;
  fetch_msgs: boolean;

  constructor(gmail: Gmail, query: string, name = '', fetch_msgs = false) {
    this.gmail = gmail;
    this.query = query;
    this.name = name;
    this.semaphore = gmail.semaphore
    this.fetch_msgs = fetch_msgs;
    this.api = this.gmail.api;
    this.states = new States;
    this.states.setTarget(this);
    if (process.env['DEBUG']) {
      this.states
        .id(`GmailQuery(${name})`)
        .logLevel(process.env['DEBUG'])
    }
  }

	async req<A,T>(method: (arg: A, cb: (err: any, res: T) => void) => void, params?: A, abort?: () => boolean): Promise<T | null> {
    return this.gmail.req(method, params, abort)
  }

  // TODO should download messages in parallel with next threads list pages
  async FetchingThreads_state() {
    let abort = this.states.getAbort('FetchingThreads');
    if (await this.isCached(abort)) {
      if (abort()) { return; }
      console.log(`[CACHED] threads for '${this.query}'`);
      this.states.add('ThreadsFetched');
      if (this.fetch_msgs) { this.states.add('MsgsFetched'); }
      return;
    }
    if (abort())
      return

    console.log(`[FETCH] threads' list for '${this.query}'`);
    let results: google.gmail.v1.Thread[] = []
    let prevRes: any
    while (true) {
      let params = {
        q: this.query,
        userId: "me",
        foo: 'bar',
        fields: "nextPageToken,threads(historyId,id)",
        pageToken: undefined
      };
      if (prevRes && prevRes[0].nextPageToken) {
        console.log(`[FETCH] next page for threads' list for '${this.query}'`);
        params.pageToken = prevRes[0].nextPageToken;
      }

      let res = await this.req(this.api.users.threads.list, params, abort)
      if (abort() || !res)
        return 

      results.push(...res.threads)

      if (!res.nextPageToken)
        break

      prevRes = res
    }

    // TODO could be done in parallel with downloading of the results
    let history_id = await this.gmail.getHistoryId(abort);
    if (abort())
      return

    this.previous_threads = this.threads;
    this.threads = results

    this.updateThreadsCompletions();

//    console.log "Found #{@result.threads.length} threads"
    if (!this.fetch_msgs) {
      this.synced_history_id = history_id;
    }

    this.states.add('ThreadsFetched');

    if (this.fetch_msgs) {
      abort = this.states.getAbort('ThreadsFetched');
      this.states.add('FetchingMsgs', history_id, abort);
    } else {
      this.previous_threads = null;
    }
  }

  async FetchingMsgs_state(history_id: number, abort?: () => boolean) {
    abort = this.states.getAbort('FetchingMsgs', abort);

    // TODO use the awaitable map
    let threads = await Promise.all(this.threads.map(async (thread) => {
      // check if the thread has been previously downloaded and if
      // the history ID has changed
      let previous = this.previous_threads && this.previous_threads.find(item => (
        item.id === thread.id && item.historyId === thread.historyId))

      if (previous)
        return previous;
      else
        return await this.gmail.fetchThread(thread.id, parseInt(thread.historyId, 10), abort);
    }))

    if (abort())
      return;

    this.synced_history_id = history_id;
    this.threads = threads;
    this.previous_threads = null;
    this.states.add('MsgsFetched');
  }

  Dirty_state() {
    this.states.drop('Dirty');
  }

  async isCached(abort: () => boolean) {
    return await this.gmail.isCached(this.synced_history_id, abort);
  }


  // update completion statuses
  updateThreadsCompletions() {
    let non_completed_ids: string[] = [];
    // create / update existing threads completion data
    for (let thread of this.threads) {
      let completion = this.completions[thread.id];
      // update the completion if thread is new or completion status has changed
      if (completion && completion.completed || !completion) {
        this.completions[thread.id] = {
          completed: false,
          time: moment()
        }
      }

      non_completed_ids.push(thread.id)
    }

    // complete threads not found in the query results
    for (let [id, row] of Object.entries(this.completions)) {
      // TODO build non_completed
      if (non_completed_ids.includes(id))
        return
      if (row.completed)
        return
      row.completed = true;
      row.time = moment();
      console.log(`Marking thread as completed by query (${id})`);
    }
  }


  threadWasCompleted(id: string): boolean {
    if (this.completions[id] && this.completions[id].completed)
      return this.completions[id].time;
    return false
  }


  threadWasNotCompleted(id: string): boolean {
    if (this.completions[id] && !this.completions[id].completed)
      return this.completions[id].time;
    return false
  }


  threadSeen(id: string) {
    return Boolean(this.completions[id]);
  }
}


export { GmailQuery, States };
