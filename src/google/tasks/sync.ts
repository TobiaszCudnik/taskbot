import * as google from 'googleapis'
import GTasksListSync from './sync-list'
import { IConfig } from '../../types'
import { Sync, SyncWriter, SyncWriterState } from '../../sync/sync'
import RootSync from '../../root/sync'
import Auth from '../auth'

// TODO tmp
export interface TasksAPI extends google.tasks.v1.Tasks {
  req(api, method, c, d): Promise<any>
}

export class State extends SyncWriterState {
  // -- overrides

  SubsInited = {
    auto: true,
    require: ['ConfigSet', 'TaskListsFetched']
  }
  SubsReady = { require: ['SubsInited'], auto: true }
  Ready = {
    auto: true,
    require: ['ConfigSet', 'SubsReady', 'TaskListsFetched'],
    drop: ['Initializing']
  }

  FetchingTaskLists = {
    auto: true,
    require: ['Enabled'],
    drop: ['TaskListsFetched']
  }
  TaskListsFetched = {
    drop: ['FetchingTaskLists']
  }

  constructor(target: Sync) {
    super(target)
    this.registerAll()
  }
}

export default class GTasksSync extends SyncWriter {
  etags: {
    task_lists: string | null
  } = {
    task_lists: null
  }
  api: TasksAPI
  sub_states_outbound = [['Reading', 'Reading'], ['Enabled', 'Enabled']]
  lists: google.tasks.v1.TaskList[]
  config: IConfig
  subs: {
    lists: GTasksListSync[]
  }

  constructor(public root: RootSync, public auth: Auth) {
    super(root.config)
    this.api = <TasksAPI>google.tasks('v1')
    this.api = Object.create(this.api)
    this.api.req = async (a, params, c, d, options = {}) => {
      params.auth = this.auth.client
      return await this.root.req(a, params, c, d, { forever: true, ...options })
    }
  }

  getState(): State {
    return new State(this).id('GTasks')
  }

  // TODO tmp, use SyncWriter
  WritingDone_enter() {
    return true
  }

  async Writing_state() {
    console.warn('WRITE ME (TASKS)')
    this.state.add('WritingDone')
    // TODO if any of the db records is missing a record.id, pipe a dependency
    //   on this.root.subs.gmail.WritingDone (and unpipe on local WritingDone_exit)
  }

  SubsInited_state() {
    this.subs = {
      lists: this.config.lists.map(
        config => new GTasksListSync(config, this.root, this)
      )
    }
    this.bindToSubs()
    // for (const list of this.subs.lists) {
    //   list.state.add('Enabled')
    // }
  }

  async FetchingTaskLists_state() {
    let abort = this.state.getAbort('FetchingTaskLists')
    let [list, res] = await this.api.req(
      this.api.tasklists.list,
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
      this.lists = list.items
    } else {
      console.log('[CACHED] tasks lists')
    }
    return this.state.add('TaskListsFetched')
  }
}
