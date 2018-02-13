import * as google from 'googleapis'
import GTasksListSync, { Task } from './sync-list'
import { IConfig } from '../../types'
import { Sync, SyncWriter, SyncWriterState } from '../../sync/sync'
import RootSync, { DBRecord } from '../../sync/root'
import { map } from 'typed-promisify-tob'
import Auth from '../auth'
import * as debug from 'debug'
import * as moment from 'moment'
import * as _ from 'underscore'

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
  verbose = debug('gtasks-verbose')
  requests = []

  constructor(public root: RootSync, public auth: Auth) {
    super(root.config)
    this.api = <TasksAPI>google.tasks('v1')
    this.api = Object.create(this.api)
    this.api.req = async (a, params, c, d, options = {}) => {
      this.requests.push(moment().unix())
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

  toDBID(task: Task): string | null {
    const match = (task.notes || '').match(/\bemail:([\w-]+)\b/)
    if (match) {
      return match[1]
    }
  }

  isCompleted(task: Task) {
    return task.status == 'completed'
  }

  async Writing_state() {
    // TODO check if temporary IDs work
    if (process.env['DRY']) {
      // TODO list expected changes
      this.state.add('WritingDone')
      return
    }
    const abort = this.state.getAbort('Writing')
    const ids = []
    await Promise.all([this.getTasksToModify(abort), this.getTasksToAdd(abort)])
    this.state.add('WritingDone')
  }

  getTasksToModify(abort: () => boolean) {
    return map(this.subs.lists, async (sync: GTasksListSync) => {
      // TODO fake cast, wrong d.ts
      await map(sync.tasks.items, async task => {
        // TODO extract
        if (!task.title) return
        const db_res = <DBRecord>(<any>this.root.data
          .chain()
          .where((record: DBRecord) => {
            return Boolean(record.tasks_ids && record.tasks_ids[task.id])
          })
          .limit(1)
          .data())
        const record = db_res[0]
        // TODO type
        const patch: any = {}
        if (this.toDBID(task) != record.id) {
          // TODO extract
          patch.notes = record.content + '\nemail:' + record.id
        }
        if (sync.config.db_query(record) && this.isCompleted(task)) {
          patch.status = 'needsAction'
        }
        if (!Object.keys(patch).length) {
          return
        }
        const params = {
          tasklist: sync.list.id,
          task: task.id,
          resource: patch
        }
        this.log(
          `Updating task '${task.title}' in '${sync.list.title}'\n%O`,
          patch
        )
        await this.api.req(this.api.tasks.patch, params, abort, true)
      })
    })
  }

  getTasksToAdd(abort: () => boolean) {
    return map(this.subs.lists, async (sync: GTasksListSync) => {
      const records = <DBRecord[]>(<any>this.root.data.where(
        sync.config.db_query
      ))
      await records.map(async record => {
        const task_id = _.findKey(record.tasks_ids, id => id == sync.list.id)
        // omit tasks who are already on the list
        if (task_id) return
        const params = {
          tasklist: sync.list.id,
          resource: {
            title: record.title,
            // fields: 'id',
            // TODO extract
            notes: record.content + '\nemail:' + record.id
          }
        }
        this.log(`Adding a new task to '${sync.list.title}'\n%O`, params)
        const res = await this.api.req(
          this.api.tasks.insert,
          params,
          abort,
          false
        )
        record.tasks_ids = record.tasks_ids || {}
        record.tasks_ids[res.id] = sync.list.id
        this.root.data.update(record)
      })
    })
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
