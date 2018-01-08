import Auth from '../auth'
import TaskListSync from './task-list-sync'
import { EventEmitter } from 'events'

import AsyncMachine, { PipeFlags } from 'asyncmachine'
import { IState, IBind, IEmit, TStates } from './sync-types'
import { promisify, promisifyArray } from 'typed-promisify'
import * as google from 'googleapis'
import Gmail from './gmail'
// import { ApiError } from '../exceptions'
import { Semaphore } from 'await-semaphore'
import { IConfig, IListConfig } from '../types'
import Logger from 'asyncmachine-inspector/src/logger'
import Network from 'asyncmachine-inspector/src/network'

export class States extends AsyncMachine<TStates, IBind, IEmit> {
  Enabled: IState = {
    auto: true
  }

  Authenticating: IState = {
    auto: true,
    require: ['Enabled'],
    drop: ['Authenticated']
  }
  Authenticated: IState = {
    drop: ['Authenticating']
  }

  Syncing: IState = {
    auto: true,
    require: ['Enabled', 'Authenticated'],
    drop: ['Synced']
  }
  Synced: IState = {
    require: [
      'Enabled',
      'Authenticated',
      'TaskListsSynced',
      'QueryLabelsSynced'
    ],
    drop: ['Syncing']
  }

  TaskListSyncEnabled: IState = {
    auto: true,
    require: ['TaskListsFetched', 'QueryLabelsSynced']
  }

  GmailEnabled: IState = {
    auto: true
  }
  GmailSyncEnabled: IState = {
    auto: true
  }

  FetchingTaskLists: IState = {
    auto: true,
    require: ['Enabled'],
    drop: ['TaskListsFetched']
  }
  TaskListsFetched: IState = {
    drop: ['FetchingTaskLists']
  }

  QueryLabelsSynced: IState = {}

  SyncingTaskLists: IState = {}
  TaskListsSynced: IState = {}

  Dirty: IState = {}

  constructor(target: Sync) {
    super(target)
    this.registerAll()
  }
}

// TODO default
export default class Sync extends EventEmitter {
  max_active_requests = 5
  semaphore: Semaphore
  states: States
  config: IConfig
  auth: Auth
  tasks_api: google.tasks.v1.Tasks
  gmail: Gmail
  gmail_api: google.gmail.v1.Gmail
  task_lists_sync: TaskListSync[] = []
  task_lists: google.tasks.v1.TaskList[]
  active_requests: number
  labels: google.gmail.v1.Label[] = []
  executed_requests: number
  historyId: number
  etags: {
    task_lists: string | null
  } = {
    task_lists: null
  }

  last_sync_start: number | null
  last_sync_end: number | null
  last_sync_time: number | null
  next_sync_timeout: NodeJS.Timer | null

  set history_id(history_id: number) {
    this.historyId = Math.max(this.history_id, history_id)
    this.addListener()
  }

  constructor(config: IConfig) {
    super()
    this.config = config
    this.states = new States(this)
    if (process.env['DEBUG']) {
      this.states.id('Sync').logLevel(process.env['DEBUG'])
      global.am_network = new Network()
      global.am_network.addMachine(this.states)
      global.am_logger_client = new Logger(
        global.am_network,
        'http://localhost:3030/logger'
      )
    }
    this.semaphore = new Semaphore(this.max_active_requests)
    // this.task_lists = [];
    this.auth = new Auth(config)
    this.active_requests = 0
    this.setMaxListeners(0)

    this.tasks_api = google.tasks('v1', { auth: this.auth.client })
    this.gmail_api = google.gmail('v1', { auth: this.auth.client })

    this.gmail = new Gmail(this)
    this.states.pipe('GmailEnabled', this.gmail.states, 'Enabled')
    this.states.pipe('GmailSyncEnabled', this.gmail.states, 'SyncingEnabled')
    this.initTaskListsSync()

    this.auth.pipe('Ready', this.states, 'Authenticated')
  }

  // ----- -----
  // Transitions
  // ----- -----

  // Try to set Synced state in all deps
  QueryLabelsSynced_state() {
    this.states.add('Synced')
  }

  TaskListsSynced_state() {
    this.states.add('Synced')
  }

  async FetchingTaskLists_state() {
    let abort = this.states.getAbort('FetchingTaskLists')
    let [list, res] = await this.req(
      this.tasks_api.tasklists.list,
      {
        etag: this.etags.task_lists
      },
      abort,
      true
    )
    if (abort()) {
      console.log('abort', abort)
      return
    }
    if (res.statusCode !== 304) {
      console.log('[FETCHED] tasks lists')
      this.etags.task_lists = res.headers.etag
      this.task_lists = list.items
    } else {
      console.log('[CACHED] tasks lists')
    }
    return this.states.add('TaskListsFetched')
  }

  TaskListsSynced_enter() {
    return this.task_lists_sync.every(list => list.states.is('Synced'))
  }

  SyncingTaskLists_exit() {
    return !this.task_lists_sync.some(list => list.states.is('Syncing'))
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
      this.states.addByListener('Syncing'),
      this.config.sync_frequency
    )
  }

  Syncing_state() {
    console.log('--- SYNCING ---')
    this.executed_requests = 0
    // TODO define in the prototype
    this.last_sync_start = Date.now()
    this.last_sync_end = null
    this.last_sync_time = null
    if (this.states.is('Dirty')) {
      // Add after the transition
      this.states.add(this.gmail.states, 'Dirty')
      this.states.drop('Dirty')
    } else {
      // Reset synced states in children
      //			@states.drop @gmail.states, 'QueryLabelsSynced'
      this.gmail.states.drop('QueryLabelsSynced')
    }
    return this.task_lists_sync.map(list =>
      this.states.add(list.states, 'Restart')
    )
  }

  // ----- -----
  // Methods
  // ----- -----

  // TODO return a more sensible format
  findTaskForThread(
    thread_id: string
  ): { 0: google.tasks.v1.Task, 1: TaskListSync } | { 0: null, 1: null } {
    for (let list_sync of this.task_lists_sync) {
      let found = list_sync.getTaskForThread(thread_id)
      if (found) {
        return [found, list_sync]
      }
    }

    return [null, null]
  }

  initTaskListsSync() {
    for (let [name, data] of Object.entries(this.config.tasks.queries)) {
      if (name === 'labels_defaults') continue
      let task_list = new TaskListSync(name, data as IListConfig, this)
      this.states.pipe(
        'TaskListSyncEnabled',
        task_list.states,
        'Enabled',
        PipeFlags.LOCAL_QUEUE
      )
      task_list.states.pipe('Synced', this.states, 'TaskListsSynced')
      task_list.states.pipe('Syncing', this.states, 'SyncingTaskLists')
      // TODO handle error of non existing task list in the inner classes
      //			task_list.states.on 'Restart.enter', => @states.drop 'TaskListsFetched'
      this.task_lists_sync.push(task_list)
    }
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

    if (!params) params = ({}) as A
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
