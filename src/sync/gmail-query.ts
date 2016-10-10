/// <reference path="../../node_modules/google-api-nodejs-tsd/dist/googleapis.gmail.v1/googleapis.gmail.v1.d.ts" />
import AsyncMachine from 'asyncmachine';
import * as moment from 'moment';
import { Gmail } from './gmail'


class States extends AsyncMachine {


  Enabled = {};
  Dirty = { blocks: ['MsgsFetched', 'ThreadsFetched'] };


  FetchingThreads = {
    auto: true,
    requires: ['Enabled'],
    blocks: ['ThreadsFetched']
  };
  ThreadsFetched = {
    requires: ['Enabled'],
    blocks: ['FetchingThreads']
  };


  FetchingMsgs = {
    requires: ['Enabled', 'ThreadsFetched'],
    blocks: ['MsgsFetched']
  };
  MsgsFetched =
  { blocks: ['FetchingMsgs'] };
}



class GmailQuery {
  synced_history_id: number;
  states: States;
  result;
  name: string;
  completions;
  previous_results;
  query: string;
  fetch_msgs;
  gmail: Gmail;
	api: google.gmail.v1.Gmail = null;

  get threads() { return this.result.threads; }


  constructor(gmail: Gmail, query, name = '', fetch_msgs = false) {
    this.gmail = gmail;
    this.query = query;
    this.name = name;
    this.fetch_msgs = fetch_msgs;
    this.api = this.gmail.api;
    this.completions = {};
    this.states = new States;
    this.states.setTarget(this);
    if (process.env['DEBUG']) {
      this.states.id(`GmailQuery(${name})`).logLevel(parseInt(process.env['DEBUG'], 10))
    }
  }

  // TODO should download messages in parallel with next threads list pages
  async FetchingThreads_state(states) {
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
    while (true) {
      let params = {
        q: this.query,
        userId: "me",
        fields: "nextPageToken,threads(historyId,id)",
        pageToken: null
      };
      if (res && res[0].nextPageToken) {
        console.log(`[FETCH] next page for threads' list for '${this.query}'`);
        params.pageToken = res[0].nextPageToken;
      }

      var res = await this.req(this.api.users.threads.list, params);
      if (abort())
        return

      if (!results) {
        var results = res[0];
      } else {
        results.threads.union(res[0].threads);
      }

      if (!res[0].nextPageToken) { break; }
    }

    // TODO could be done in parallel with downloading of the results
    let history_id = await this.gmail.getHistoryId(abort);
    if (__guardFunc__(abort, f2 => f2())) { return; }

    this.previous_results = this.result;
    this.result = results;
    if (this.result.threads == null) { this.result.threads = []; }
    this.updateThreadsCompletions();

//    console.log "Found #{@result.threads.length} threads"
    if (!this.fetch_msgs) {
      this.synced_history_id = history_id;
    }

    this.states.add('ThreadsFetched');

    if (this.fetch_msgs) {
      abort = this.states.getAbort('ThreadsFetched');
      return this.states.add('FetchingMsgs', history_id, abort);
    } else {
      return this.previous_results = null;
    }
  }

  async FetchingMsgs_state(states, history_id, abort) {
    abort = this.states.getAbort('FetchingMsgs', abort);

    let threads = await Promise.all(this.threads.map(async (thread) => {
      // check if the thread has been previously downloaded and if
      // the history ID has changed
      let previous = __guard__(this.previous_results, x => x.threads.find(item => item.id === thread.id && item.historyId === thread.historyId));

      if (previous)
        return previous;
      else
        return await this.gmail.fetchThread(thread.id, thread.historyId, abort);
    }))

    if (abort())
      return;

    this.synced_history_id = history_id;
    this.result.threads = threads;
    this.previous_results = null;
    this.states.add('MsgsFetched');
  }

  Dirty_state() {
    this.states.drop('Dirty');
  }

  async isCached(abort) {
    return await this.gmail.isCached(this.synced_history_id, abort);
  }

  req(method, params) {
    return this.gmail.req(method, params);
  }


  // update completion statuses
  updateThreadsCompletions() {
    let non_completed_ids = [];
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
    this.completions.each(function(row, id) {
      // TODO build non_completed
      if (non_completed_ids.includes(id))
        return
      if (row.completed)
        return
      row.completed = true;
      row.time = moment();
      console.log(`Marking thread as completed by query (${id})`);
    });
  }


  threadWasCompleted(id) {
    if (__guard__(this.completions[id], x => x.completed) === true) {
      return this.completions[id].time;
    } else { return false; }
  }


  threadWasNotCompleted(id) {
    if (__guard__(this.completions[id], x => x.completed) === false) {
      return this.completions[id].time;
    } else { return false; }
  }


  threadSeen(id) {
    return Boolean(this.completions[id]);
  }
}


export { GmailQuery, States };

// TODO remove
function __guardFunc__(func, transform) {
  return typeof func === 'function' ? transform(func) : undefined;
}
function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
function __in__(needle, haystack) {
  return haystack.indexOf(needle) >= 0;
}