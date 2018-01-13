import Auth from '../google/auth'
import TaskListSync from '../google/tasks/task-list-sync'
import { EventEmitter } from 'events'

import AsyncMachine, {
  PipeFlags
} from '../../../asyncmachine/build/asyncmachine'
import { IState, IBind, IEmit, TStates } from './sync-types'
import { promisify, promisifyArray } from 'typed-promisify'
import * as google from 'googleapis'
import Gmail from '../google/gmail/gmail'
// import { ApiError } from '../exceptions'
import { Semaphore } from 'await-semaphore'
import { IConfig, IListConfig } from '../types'
import { Logger, Network } from 'ami-logger'

export class State extends AsyncMachine<TStates, IBind, IEmit> {
  Enabled: IState = {
    auto: true
  }

  Writing = {
    drop: ['WritingDone', 'Reading', 'ReadingDone'],
    require: ['Enabled'],
    add: ['Syncing']
  }
  WritingDone = {
    drop: ['Writing', 'Reading', 'ReadingDone'],
    require: ['Enabled'],
    add: ['Synced']
  }

  Reading = {
    drop: ['ReadingDone', 'Writing', 'WritingDone'],
    require: ['Enabled'],
    add: ['Syncing']
  }
  ReadingDone = {
    drop: ['Reading', 'Writing', 'WritingDone'],
    require: ['Enabled']
  }

  Syncing: { drop: ['Synced'] }
  Synced: { drop: ['Syncing'] }

  Dirty: IState = {}

  constructor(target: Sync) {
    super(target)
    this.registerAll()
  }
}

export default class Sync extends EventEmitter {
  max_active_requests = 5
  semaphore: Semaphore = new Semaphore(this.max_active_requests)
  state: State = new State(this)
  apis: Array
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

  constructor(public config: IConfig) {
    super()
    if (process.env['DEBUG']) {
      this.initDebugging()
    }
    this.active_requests = 0
    // this.setMaxListeners(0)
  }

  initSyncs() {
    this.apis.gmail = new Gmail()
  }

  // ----- -----
  // Transitions
  // ----- -----

  WritingDone_enter() {
    return this.apis.every(api => api.state.is('WritingDone'))
  }

  // Schedule the next sync
  // TODO measure the time taken
  Synced_state() {
    console.log('!!! SYNCED !!!')
    console.log(`Requests: ${this.executed_requests}`)
    this.last_sync_end = Date.now()
    this.last_sync_time = this.last_sync_end - this.last_sync_start
    console.log(`Time: ${this.last_sync_time}ms`)
    if (this.next_sync_timeout) {
      clearTimeout(this.next_sync_timeout)
    }
    this.next_sync_timeout = setTimeout(
      this.state.addByListener('Syncing'),
      this.config.sync_frequency
    )
  }

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

  initDebugging() {
    this.state.id('Sync').logLevel(process.env['DEBUG'])
    // TODO make it less global
    global.am_network = new Network()
    global.am_network.addMachine(this.state)
    global.am_logger = new Logger(global.am_network)
    process.on('uncaughtException', function(err) {
      global.am_logger.saveFile('snapshot-exception.json')
      console.log('snapshot-exception.json')
      process.exit()
    })
    process.on('SIGINT', function(err) {
      global.am_logger.saveFile('snapshot.json')
      console.log('Saved a snapshot to snapshot.json')
      process.exit()
    })
  }

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
    if (process.env['DEBUG']) console.log(params)
    ;(params as any).auth = this.auth.client
    // TODO catch errors
    // TODO loose promisify
    let promise_method = returnArray
      ? promisifyArray(method)
      : promisify(method)
    let ret = await promise_method(params)
    release()
    //		console.log "@active_requests--"
    this.active_requests--
    this.emit('request-finished')
    this.executed_requests++

    //		delete params.auth
    //		console.log params
    //		console.log ret[0]
    return ret
  }

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
