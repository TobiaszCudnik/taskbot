import GoogleSync from '../google/sync'
import {IState} from './sync-types'
import {Semaphore} from 'await-semaphore'
import Sync, {SyncState} from '../sync/sync'
// import * as assert from 'assert/'
import * as Loki from 'lokijs'
import {promisify, promisifyArray} from "typed-promisify-tob";

export class State extends SyncState {
  SubsInited = {
    require: ['ConfigSet', 'DBReady'],
    auto: true,
    after: ['DBReady']
  }
  SubsReady = { require: ['SubsInited'], auto: true }
  Ready = {
    auto: true,
    require: ['ConfigSet', 'SubsReady'],
    drop: ['Initializing']
  }
  DBReady = { auto: true }

  Reading = {
    auto: true,
    drop: ['ReadingDone', 'Writing', 'WritingDone'],
    require: ['Enabled', 'Ready']
  }

  // Reading = {
  //   auto: true,
  //   drop: ['ReadingDone', 'Writing', 'WritingDone'],
  //   require: ['Enabled', 'Ready']
  // }

  constructor(target: Sync) {
    super(target)
    this.registerAll()
  }
}

export type DB = LokiCollection<DBRecord>

/**
 * Local DB record format.
 */
export interface DBRecord {
  id: DBRecordID
  title: string
  content: string
  updated: number
  parent?: DBRecordID
  labels: { [index: string]: DBRecordLabel }
  gmail_id?: string
  // different task ids per list
  tasks_ids?: {[list_id: string]: string}
}

export type DBRecordID = string

export interface DBRecordLabel {
  // time
  updated: number
  // added or removed
  active: boolean
}

export default class RootSync extends Sync {
  state: State
  // TODO use map
  subs: { [index: string]: Sync }

  max_active_requests = 5
  semaphore: Semaphore = new Semaphore(this.max_active_requests)
  active_requests = 0
  executed_requests: number

  // last_sync_start: number | null
  // last_sync_end: number | null
  // last_sync_time: number | null
  // next_sync_timeout: NodeJS.Timer | null

  db: Loki
  data: DB

  // set history_id(history_id: number) {
  //   this.historyId = Math.max(this.history_id, history_id)
  //   this.addListener()
  // }

  // ----- -----
  // Transitions
  // ----- -----

  DBReady_state() {
    this.db = new Loki('gtd-bot')
    this.data = this.db.getCollection('todos') || this.db.addCollection('todos')
    this.data.toString = function() {
      return this.data.map( (r: DBRecord) => {
        let ret = '- ' + r.title
        const snippet = r.content.replace(/\n/g, '')
        ret += snippet ? ` (${snippet})\n  ` : '\n  '
        ret += Object.entries(r.labels).filter(([name, data]) => {
          return data.active
        }).map( ([name, data]) => {
          return name
        }).join(', ')
        return ret
      }).join('\n')
    }
  }

  SubsInited_state() {
    // assert(this.config, this.datastore)
    // TODO map
    this.subs = {}
    this.subs.google = new GoogleSync(this)
    this.bindToSubs()
    // this.subs.google.state.add('Enabled')
  }

  ReadingDone_state() {
    this.sync()
    this.data.toString()
    this.state.add('Writing')
  }

  // // Schedule the next sync
  // // TODO measure the time taken
  // Synced_state() {
  //   console.log('!!! SYNCED !!!')
  //   console.log(`Requests: ${this.executed_requests}`)
  //   this.last_sync_end = Date.now()
  //   this.last_sync_time = this.last_sync_end - this.last_sync_start
  //   console.log(`Time: ${this.last_sync_time}ms`)
  //   if (this.next_sync_timeout) {
  //     clearTimeout(this.next_sync_timeout)
  //   }
  //   this.next_sync_timeout = setTimeout(
  //     this.state.addByListener('Syncing'),
  //     this.config.sync_frequency
  //   )
  // }

  // Syncing_state() {
  //   console.log('--- SYNCING ---')
  //   this.executed_requests = 0
  //   // TODO define in the prototype
  //   this.last_sync_start = Date.now()
  //   this.last_sync_end = null
  //   this.last_sync_time = null
  //   if (this.state.is('Dirty')) {
  //     // Add after the transition
  //     this.state.add(this.gmail.states, 'Dirty')
  //     this.state.drop('Dirty')
  //   } else {
  //     // Reset synced states in children
  //     //			@states.drop @gmail.states, 'QueryLabelsSynced'
  //     this.gmail.states.drop('QueryLabelsSynced')
  //   }
  //   return this.task_lists_sync.map(list =>
  //     this.state.add(list.states, 'Restart')
  //   )
  // }

  // ----- -----
  // Methods
  // ----- -----

  // TODO take abort() as the second param
  async req<A, T, T2>(
    method: (arg: A, cb: (err: any, res: T, res2: T2) => void) => void,
    params: A,
    abort: (() => boolean) | null | undefined,
    returnArray: true
  ): Promise<[T, T2] | null>
  async req<A, T>(
    method: (arg: A, cb: (err: any, res: T) => void) => void,
    params: A,
    abort: (() => boolean) | null | undefined,
    returnArray: false
  ): Promise<T | null>
  async req<A, T>(
    method: (arg: A, cb: (err: any, res: T) => void) => void,
    params: A,
    abort: (() => boolean) | null | undefined,
    returnArray: boolean
  ): Promise<any> {
    let release = await this.semaphore.acquire()
    if (abort && abort()) {
      release()
      return null
    }
    this.active_requests++
    //		console.log "@active_requests++"

    if (!params) params = {} as A
    this.log(['REQUEST', params], 3)
    // TODO catch errors
    // TODO loose promisify
    let promise_method = returnArray
      ? promisifyArray(method)
      : promisify(method)
    let ret = await promise_method(params)
    release()
    //		console.log "@active_requests--"
    this.active_requests--
    // this.emit('request-finished')
    console.log('emit: request-finished')
    this.executed_requests++

    //		delete params.auth
    //		console.log params
    //		console.log ret[0]
    return ret
  }

  getState() {
    const state = new State(this)
    state.id('root')
    return state
  }

  sync() {
    let changes, c = 0
    const MAX = 10
    do {
      changes = Object.values(this.subs).reduce((a, r) => {
        const changes = r.sync()
        if (changes) {
          a.push(...changes)
        }
        return a
      }, [])
      console.log('changes', changes)
    } while (changes.length && ++c < MAX)
    console.log(`SYNCED after ${c} rounds`)
    return []
  }
}
