import * as google from 'googleapis'
import GTasksListSync from './sync-list'
import { IConfig } from '../../types'
import { Sync, SyncWriter, SyncWriterState } from '../../sync/sync'
import RootSync from '../../sync/root'
import Auth from '../auth'
import * as debug from 'debug'
import * as moment from 'moment'

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
  log = debug('gtasks')
  queries = []

  constructor(public root: RootSync, public auth: Auth) {
    super(root.config)
    this.api = <TasksAPI>google.tasks('v1')
    this.api = Object.create(this.api)
    this.api.req = async (a, params, c, d, options = {}) => {
      this.queries.push(moment().unix())
      // TODO handle quota exceeded
      params.auth = this.auth.client
      try {
        return await this.root.req(a, params, c, d, {
          forever: true,
          ...options
        })
      } catch (e) {
        console.dir(e)
        debugger
      }
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
    this.log('WRITE ME (TASKS)')
    this.state.add('WritingDone')
    // TODO check if notes have the fresh gmail_id
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
      this.log('abort', abort)
      return
    }
    if (res.statusCode !== 304) {
      this.log('[FETCHED] tasks lists')
      this.etags.task_lists = res.headers.etag
      this.lists = list.items
    } else {
      this.log('[CACHED] tasks lists')
    }
    return this.state.add('TaskListsFetched')
  }
}
