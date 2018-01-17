import GoogleSync from '../google/sync'
import { IState, IBind, IEmit, TStates } from './sync-types'
import { Semaphore } from 'await-semaphore'
import { IConfig, IListConfig } from '../types'
import Sync, { SyncState } from '../sync/sync'
// import * as assert from 'assert/'
import { DataStore, List } from './datastore'

export class State extends SyncState {

  SubsInited: IState = { require: ['ConfigSet'], auto: true }
  SubsReady: IState = { require: ['SubsInited'], auto: true }
  Ready: IState = { require: ['ConfigSet', 'SubsReady'] }

  constructor(target: Sync) {
    super(target)
    this.registerAll()
  }
}

export default class SyncManager extends Sync {
  max_active_requests = 5
  semaphore: Semaphore = new Semaphore(this.max_active_requests)
  state: State
  // TODO use map
  subs: { [index: string]: Sync }
  datastore = new DataStore<List>()
  active_requests: number
  executed_requests: number
  // historyId: number

  last_sync_start: number | null
  last_sync_end: number | null
  last_sync_time: number | null
  next_sync_timeout: NodeJS.Timer | null

  // set history_id(history_id: number) {
  //   this.historyId = Math.max(this.history_id, history_id)
  //   this.addListener()
  // }

  constructor(config: IConfig) {
    super()
    this.state.add('ConfigSet', config)
    this.active_requests = 0
    this.initLists()
    // this.setMaxListeners(0)
  }

  initLists() {
    // assert(this.config, this.datastore)
    for (const [name, config] of Object.entries(this.config.lists)) {
      this.datastore.set(
        name,
        new List(name, config, this.config.list_defaults)
      )
    }
  }

  getState() {
    const state = new State(this)
    state.id('Manager')
    return state
  }

  // ----- -----
  // Transitions
  // ----- -----

  SubsInited_state() {
    // assert(this.config, this.datastore)
    // TODO map
    this.subs = {}
    this.subs.google = new GoogleSync(this.datastore, this.config)
    this.subs.google.state.add('Enabled')
    this.bindToSubs()
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

  // // TODO take abort() as the second param
  // async req<A, T, T2>(
  //   method: (arg: A, cb: (err: any, res: T, res2: T2) => void) => void,
  //   params: A,
  //   abort: (() => boolean) | null | undefined,
  //   returnArray: true
  // ): Promise<[T, T2] | null>
  // async req<A, T>(
  //   method: (arg: A, cb: (err: any, res: T) => void) => void,
  //   params: A,
  //   abort: (() => boolean) | null | undefined,
  //   returnArray: false
  // ): Promise<T | null>
  // async req<A, T>(
  //   method: (arg: A, cb: (err: any, res: T) => void) => void,
  //   params: A,
  //   abort: (() => boolean) | null | undefined,
  //   returnArray: boolean
  // ): Promise<any> {
  //   let release = await this.semaphore.acquire()
  //   if (abort && abort()) {
  //     release()
  //     return null
  //   }
  //   this.active_requests++
  //   //		console.log "@active_requests++"
  //
  //   if (!params) params = {} as A
  //   this.log(['REQUEST', params], 3)
  //   if (process.env['DEBUG']) console.log(params)
  //   ;(params as any).auth = this.auth.client
  //   // TODO catch errors
  //   // TODO loose promisify
  //   let promise_method = returnArray
  //     ? promisifyArray(method)
  //     : promisify(method)
  //   let ret = await promise_method(params)
  //   release()
  //   //		console.log "@active_requests--"
  //   this.active_requests--
  //   this.emit('request-finished')
  //   this.executed_requests++
  //
  //   //		delete params.auth
  //   //		console.log params
  //   //		console.log ret[0]
  //   return ret
  // }

  log(msgs: string | any[], level: number) {
    if (!process.env['DEBUG']) {
      return
    }
    if (level && level > parseInt(process.env['DEBUG'], 10)) return
    if (!(msgs instanceof Array)) {
      msgs = [msgs]
    }
    return console.log.apply(console, msgs)
  }
}
