import AsyncMachine from 'asyncmachine'
import * as moment from 'moment'
import GmailSync from './sync'
import * as google from 'googleapis'
import { map } from 'typed-promisify-tob'
import { debug } from 'debug'
import * as _ from 'underscore'
import { machineLogToDebug } from '../../utils'

export type Thread = google.gmail.v1.Thread

export class State extends AsyncMachine<any, any, any> {
  Enabled = {}
  // TODO implement based on history list and label matching
  Dirty = {
    drop: ['MsgsFetched', 'ThreadsFetched']
  }

  FetchingThreads = {
    require: ['Enabled'],
    drop: ['ThreadsFetched']
  }
  ThreadsFetched = {
    require: ['Enabled'],
    drop: ['FetchingThreads']
  }

  FetchingMsgs = {
    require: ['Enabled', 'ThreadsFetched'],
    drop: ['MsgsFetched']
  }
  // TODO create a Ready state
  MsgsFetched = {
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
  history_id_synced: number | null
  threads: Thread[] = []
  completions = new Map<string, TThreadCompletion>()
  protected previous_threads: Thread[] | null = null
  log = debug('gmail-query')

  constructor(
    public gmail: GmailSync,
    public query: string,
    public name = '',
    public fetch_msgs = false
  ) {
    this.state = new State(this)
    this.state.id('Gmail/query: ' + this.name)
    if (process.env['DEBUG'] && global.am_network) {
      machineLogToDebug(this.state)
      global.am_network.addMachine(this.state)
    }
  }

  // TODO should download messages in parallel with next threads list pages
  async FetchingThreads_state() {
    let abort = this.state.getAbort('FetchingThreads')
    if (await this.isCached(abort)) {
      if (abort()) return
      this.log(`[CACHED] threads for '${this.query}'`)
      this.state.add('ThreadsFetched')
      if (this.fetch_msgs) {
        this.state.add('MsgsFetched')
      }
      return
    }
    if (abort()) return

    this.log(`[FETCH] threads' list for '${this.query}'`)
    let results: google.gmail.v1.Thread[] = []
    let prevRes: any
    while (true) {
      let params: {
        pageToken?: string
        maxResults: number
        q: string
        userId: string
        fields: string
      } = {
        maxResults: 1000,
        q: this.query,
        userId: 'me',
        // TODO is 'snippet' useful?
        fields: 'nextPageToken,threads(historyId,id,snippet)'
      }
      if (prevRes && prevRes.nextPageToken) {
        this.log(`[FETCH] next page for threads' list for '${this.query}'`)
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

      if (list.threads) {
        results.push(...list.threads)
      }

      if (!list.nextPageToken) break

      prevRes = list
    }

    // TODO could be done in parallel with downloading of the results
    let history_id = await this.gmail.getHistoryId(abort)
    if (abort()) return

    // TODO keep in GmailSync
    this.threads = results

    if (!this.fetch_msgs) {
      this.history_id_synced = history_id
    }

    this.state.add('ThreadsFetched')

    if (this.fetch_msgs) {
      abort = this.state.getAbort('ThreadsFetched')
      this.state.add('FetchingMsgs', history_id, abort)
    }
  }

  async FetchingMsgs_state(history_id: number, abort?: () => boolean) {
    abort = this.state.getAbort('FetchingMsgs', abort)

    let threads = await map(this.threads, async (thread: Thread) => {
      // check if the thread has been previously downloaded and if
      // the history ID has changed
      // TODO compare against shared this.gmail.threads
      let previous = this.gmail.threads.get(thread.id)
      if (!previous || previous.historyId != thread.historyId) {
        return await this.gmail.fetchThread(
          thread.id,
          parseInt(thread.historyId, 10),
          abort
        )
      }
      return previous
    })

    if (abort()) return

    // ensure all the requested threads were downloaded
    // TODO retry the missing ones?
    if (threads && threads.every(thread => Boolean(thread))) {
      this.history_id_synced = history_id
      this.threads = threads as Thread[]
      this.state.add('MsgsFetched')
    } else {
      this.log('[FetchingMsgs] no results or some missing')
    }
  }

  async isCached(abort: () => boolean): Promise<boolean | null> {
    return this.history_id_synced
      ? await this.gmail.isCached(this.history_id_synced, abort)
      : false
  }

  Dirty_state() {
    this.state.drop('Dirty')
  }
}
