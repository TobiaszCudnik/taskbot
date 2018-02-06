import AsyncMachine from 'asyncmachine'
import { IState, IBind, IEmit, TStates } from './query-types'
import * as moment from 'moment'
import GmailSync from './sync'
import * as google from 'googleapis'
import { map } from 'typed-promisify-tob'

export type Thread = google.gmail.v1.Thread

export class State extends AsyncMachine<TStates, IBind, IEmit> {
  Enabled: IState = {}
  Dirty: IState = {
    drop: ['MsgsFetched', 'ThreadsFetched']
  }

  FetchingThreads: IState = {
    auto: true,
    require: ['Enabled'],
    drop: ['ThreadsFetched']
  }
  ThreadsFetched: IState = {
    require: ['Enabled'],
    drop: ['FetchingThreads']
  }

  FetchingMsgs: IState = {
    require: ['Enabled', 'ThreadsFetched'],
    drop: ['MsgsFetched']
  }
  // TODO create a Ready state
  MsgsFetched: IState = {
    require: ['Enabled'],
    drop: ['FetchingMsgs']
  }

  constructor(target: GmailQuery) {
    super(target)
    this.registerAll()
  }
}

export type TThreadCompletion = {
  completed: boolean
  time: moment.Moment
}

export default class GmailQuery {
  // api: google.gmail.v1.Gmail
  state: State
  // history ID from the moment of reading
  synced_history_id: number | null

  threads: Thread[] = []
  completions = new Map<string, TThreadCompletion>()
  previous_threads: Thread[] | null = null

  constructor(
    public gmail: GmailSync,
    public query: string,
    public name = '',
    public fetch_msgs = false
  ) {
    this.state = new State(this)
    this.state.id('Gmail/query: ' + this.name)
    if (process.env['DEBUG']) {
      this.state.logLevel(process.env['DEBUG'])
      global.am_network.addMachine(this.state)
    }
  }

  // TODO should download messages in parallel with next threads list pages
  async FetchingThreads_state() {
    let abort = this.state.getAbort('FetchingThreads')
    if (await this.isCached(abort)) {
      if (abort()) return
      console.log(`[CACHED] threads for '${this.query}'`)
      this.state.add('ThreadsFetched')
      if (this.fetch_msgs) {
        this.state.add('MsgsFetched')
      }
      return
    }
    if (abort()) return

    console.log(`[FETCH] threads' list for '${this.query}'`)
    let results: google.gmail.v1.Thread[] = []
    let prevRes: any
    while (true) {
      let params: {
        pageToken?: string,
        maxResults: number,
        q: string,
        userId: string,
        fields: string
      } = {
        // TODO this should be optional
        // labelIds: '',
        // pageToken: ''
        // includeSpamTrash: false,
        maxResults: 1000,
        q: this.query,
        userId: 'me',
        // TODO is 'snippet' useful?
        // fields: 'nextPageToken,threads(historyId,id)'
        fields: 'nextPageToken,threads(historyId,id,snippet)'
      }
      if (prevRes && prevRes.nextPageToken) {
        console.log(`[FETCH] next page for threads' list for '${this.query}'`)
        params.pageToken = prevRes.nextPageToken
      }

      let list = await this.gmail.api.req(
        this.gmail.api.users.threads.list,
        params,
        abort,
        false
      )
      if (!list) break
      if (abort()) return

      if (list.threads) results.push(...list.threads)

      if (!list.nextPageToken) break

      prevRes = list
    }

    // TODO could be done in parallel with downloading of the results
    let history_id = await this.gmail.getHistoryId(abort)
    if (abort()) return

    // TODO keep in GmailSync
    this.previous_threads = this.threads
    this.threads = results

    //    console.log "Found #{@result.threads.length} threads"
    if (!this.fetch_msgs) {
      this.synced_history_id = history_id
    }

    this.state.add('ThreadsFetched')

    if (this.fetch_msgs) {
      abort = this.state.getAbort('ThreadsFetched')
      this.state.add('FetchingMsgs', history_id, abort)
    } else {
      this.previous_threads = null
    }
  }

  async FetchingMsgs_state(history_id: number, abort?: () => boolean) {
    abort = this.state.getAbort('FetchingMsgs', abort)

    let threads = await map(
      this.threads,
      async (thread: google.gmail.v1.Thread) => {
        // check if the thread has been previously downloaded and if
        // the history ID has changed
        // TODO compare against shared this.gmail.threads
        let previous =
          this.previous_threads &&
          this.previous_threads.find(
            item => item.id === thread.id && item.historyId === thread.historyId
          )

        if (previous) return previous
        else
          return await this.gmail.fetchThread(
            thread.id,
            parseInt(thread.historyId, 10),
            abort
          )
      }
    )

    if (abort()) return

    // ensure all the requested threads were downloaded
    // TODO retry the missing ones?
    if (threads && threads.every(thread => Boolean(thread))) {
      this.synced_history_id = history_id
      this.threads = threads as google.gmail.v1.Thread[]
      this.previous_threads = null
      this.state.add('MsgsFetched')
    } else {
      console.log('[FetchingMsgs] no results or some missing')
    }
  }

  Dirty_state() {
    this.state.drop('Dirty')
  }

  async isCached(abort: () => boolean): Promise<boolean | null> {
    return this.synced_history_id
      ? await this.gmail.isCached(this.synced_history_id, abort)
      : false
  }
}
