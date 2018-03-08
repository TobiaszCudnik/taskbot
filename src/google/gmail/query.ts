import { machine } from 'asyncmachine'
import { debug } from 'debug'
import * as google from 'googleapis'
import { map } from 'typed-promisify-tob'
// Machine types
import {
  AsyncMachine,
  IBind,
  IEmit,
  IJSONStates,
  TStates
} from '../../../typings/machines/google/gmail/query'
import { log_fn } from '../../logger'
import { machineLogToDebug } from '../../utils'
import GmailSync, { getTitleFromThread } from './sync'

export type Thread = google.gmail.v1.Thread

export const sync_state: IJSONStates = {
  Enabled: {},
  // TODO implement based on history list and label matching
  Dirty: {
    drop: ['MsgsFetched', 'ThreadsFetched', 'FetchingThreads', 'FetchingMsgs']
  },

  FetchingThreads: {
    require: ['Enabled'],
    drop: ['ThreadsFetched', 'MsgsFetched']
  },
  ThreadsFetched: {
    require: ['Enabled'],
    drop: ['FetchingThreads']
  },

  FetchingMsgs: {
    require: ['Enabled', 'ThreadsFetched'],
    drop: ['MsgsFetched']
  },
  // TODO create a Ready state
  MsgsFetched: {
    require: ['Enabled'],
    drop: ['FetchingMsgs']
  },

  Exception: {
    drop: ['FetchingThreads', 'FetchingMsgs']
  }
}

export default class GmailQuery {
  state: AsyncMachine<TStates, IBind, IEmit>
  // history ID from the moment of reading
  history_id_synced: number | null
  threads: Thread[] = []
  protected previous_threads: Thread[] | null = null

  log: log_fn

  constructor(
    public gmail: GmailSync,
    public query: string,
    public name = '',
    public fetch_msgs = false
  ) {
    // TODO loose the cast
    this.state = <AsyncMachine<TStates, IBind, IEmit>>(<any>machine(
      sync_state
    ).id('Gmail/query: ' + this.name))
    this.state.setTarget(this)
    this.log = this.gmail.root.logger.createLogger(this.state.id(true))
    if (process.env['DEBUG_AM'] || global.am_network) {
      machineLogToDebug(this.state)
      if (global.am_network) {
        global.am_network.addMachine(this.state)
      }
    }
  }

  // ----- -----
  // Transitions
  // ----- -----

  Exception_state(...params) {
    // TODO log errors per query, using this.log_error
    // forward the exception to the gmail class and effectively the root
    this.state.drop('Exception')
    this.gmail.state.add('Exception', ...params)
  }

  // ----- -----
  // Methods
  // ----- -----

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

    this.log(`[FETCH] threads list for '${this.query}'`)
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
        fields: 'nextPageToken,threads(historyId,id)'
      }
      if (prevRes && prevRes.nextPageToken) {
        this.log(`[FETCH] next page for threads list for '${this.query}'`)
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

  // TODO history_id is redundant
  async FetchingMsgs_state(history_id: number, abort?: () => boolean) {
    abort = this.state.getAbort('FetchingMsgs', abort)

    let threads = await map(this.threads, async (thread: Thread) => {
      // check if the thread has been previously downloaded and if
      // the history ID has changed
      const previous = this.gmail.threads.get(thread.id)
      if (!previous || previous.historyId != thread.historyId) {
        const refreshed = await this.gmail.fetchThread(thread.id, abort)
        if (previous) {
          this.log(
            `History ID changed for thread '${getTitleFromThread(
              refreshed
            )}', re-fetched`
          )
        }
        return refreshed
      }
      return previous
    })

    if (abort()) return

    // ensure all the requested threads were downloaded
    // TODO retry the missing ones?
    if (threads && threads.every(thread => Boolean(thread))) {
      this.history_id_synced = history_id
      this.threads = threads
      this.state.add('MsgsFetched')
    } else {
      this.log('[FetchingMsgs] no results or some missing')
    }
  }

  Dirty_state() {
    this.history_id_synced = null
    this.state.drop('Dirty')
  }

  async isCached(abort: () => boolean): Promise<boolean | null> {
    return this.history_id_synced
      ? await this.gmail.isCached(this.history_id_synced, abort)
      : false
  }
}
