import { machine } from 'asyncmachine'
import { TAbortFunction } from 'asyncmachine/types'
import * as debug from 'debug'
import * as google from 'googleapis'
import * as http from 'http'
import * as _ from 'lodash'
import * as moment from 'moment'
import * as delay from 'delay'
import * as roundTo from 'round-to'
import { map } from 'typed-promisify-tob'
// Machine types
import {
  AsyncMachine,
  IBind,
  IEmit,
  IJSONStates,
  TStates,
  IBindBase,
  IEmitBase
} from '../../../typings/machines/google/tasks/sync'
import GC from '../../sync/gc'
import RootSync, { DBRecord } from '../../sync/root'
import { sync_writer_state, SyncWriter } from '../../sync/writer'
import { IConfig } from '../../types'
import Auth from '../auth'
import GTasksListSync, { Task, TaskList } from './sync-list'
import * as regexEscape from 'escape-string-regexp'

const SEC = 1000

// TODO tmp
export interface TasksAPI extends google.tasks.v1.Tasks {
  req(method, params, abort, ret_array): Promise<any>
}

export const sync_state: IJSONStates = {
  ...sync_writer_state,

  // -- overrides

  SubsInited: {
    auto: true,
    require: ['ConfigSet', 'TaskListsFetched']
  },
  SubsReady: { require: ['SubsInited'], auto: true },
  Ready: {
    auto: true,
    require: ['ConfigSet', 'SubsReady', 'TaskListsFetched'],
    drop: ['Initializing']
  },

  FetchingTaskLists: {
    auto: true,
    require: ['Enabled'],
    drop: ['TaskListsFetched']
  },
  TaskListsFetched: {
    drop: ['FetchingTaskLists']
  }
}

export type TaskTree = {
  title: string
  status: 'needsAction' | 'completed'
  notes?: string
  children: TaskTree[]
}

export default class GTasksSync extends SyncWriter<
  IConfig,
  TStates,
  IBind,
  IEmit
> {
  state: AsyncMachine<TStates, IBind, IEmit>
  etags: {
    task_lists: string | null
  } = {
    task_lists: null
  }
  api: TasksAPI
  // @ts-ignore
  sub_states_outbound = [
    ['Reading', 'Reading'],
    ['Enabled', 'Enabled'],
    ['QuotaExceeded', 'QuotaExceeded']
  ]
  lists: google.tasks.v1.TaskList[]
  subs: {
    lists: GTasksListSync[]
  }
  // @ts-ignore
  subs_flat: GTasksListSync[]
  verbose = debug('gtasks-verbose')
  // TODO extract TimeArray
  requests: number[] = []
  requests_gc = new GC('gtasks', this.requests)
  // remaining quota, range between 0 (full limit) to 1 (none left)
  get short_quota_usage(): number {
    const i = _.sortedIndex(
      this.requests,
      moment()
        .subtract(100, 'seconds')
        .unix()
    )
    return roundTo(
      (this.requests.length - i) / this.config.gtasks.request_quota_100,
      2
    )
  }
  email_url = `https://${this.root.config.gmail.domain}/mail/u/0/#all/`

  constructor(root: RootSync, public auth: Auth) {
    super(root.config, root)
    this.initAPIClient()
  }

  // ----- -----
  // Transitions
  // ----- -----

  RestartingNetwork_state() {
    this.initAPIClient()
    this.state.add('NetworkRestarted')
  }

  async Writing_state() {
    super.Writing_state()
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

  SubsInited_state() {
    this.subs = {
      lists: this.config.lists.map(
        config => new GTasksListSync(config, this.root, this)
      )
    }
    this.bindToSubs()
  }

  async FetchingTaskLists_state() {
    let abort = this.state.getAbort('FetchingTaskLists')
    let params = { headers: { 'If-None-Match': this.etags.task_lists } }
    let [list, res]: [
      google.tasks.v1.TaskLists,
      http.IncomingMessage
    ] = await this.api.req(this.api.tasklists.list, params, abort, true)
    if (abort()) return
    if (res.statusCode !== 304) {
      this.log('[FETCHED] tasks lists')
      this.etags.task_lists = <string>res.headers.etag
      this.lists = list.items
    } else {
      this.log('[CACHED] tasks lists')
    }
    const missing = this.config.lists
      .filter(config => !this.lists.find(list => list.title == config.name))
      .map(config => config.name)
    if (missing.length) {
      // TODO dirty hack to redo list creation
      try {
        delete this.etags.task_lists
        await this.createTaskLists(missing, abort)
      } catch {
        await delay(3 * SEC)
      } finally {
        this.state.drop('FetchingTaskLists')
        this.state.add('FetchingTaskLists')
      }
    } else {
      this.state.add('TaskListsFetched')
    }
  }

  // ----- -----
  // Methods
  // ----- -----

  getState() {
    return machine(sync_state).id('GTasks')
  }

  initAPIClient() {
    if (this.api) {
      // TODO dispose
    }
    this.api = <TasksAPI>google.tasks('v1')
    this.api = Object.create(this.api)
    this.api.req = async (method, params, abort, ret_array, options = {}) => {
      this.requests.push(moment().unix())
      params.auth = this.auth.client
      return await this.root.req(method, params, abort, ret_array, {
        forever: true,
        ...options
      })
    }
  }

  async createTaskLists(names, abort: TAbortFunction) {
    await map(names, async name => {
      this.log(`Creating a new list tasklist '${name}'`)
      await this.api.req(
        this.api.tasklists.insert,
        { resource: { title: name } },
        abort,
        true
      )
    })
  }

  toGmailID(task: Task): string | null {
    // legacy format
    let match = (task.notes || '').match(/\bemail:([\w-]+)\b/)
    if (match) {
      return match[1]
    }
    const regexp = `\\nEmail: ${regexEscape(this.email_url)}([\\w-]+)\\b`
    match = (task.notes || '').match(regexp)
    if (match) {
      return match[1]
    }
  }

  isCompleted(task: Task) {
    return task.status == 'completed'
  }

  addGmailID(content: string, id: string) {
    return content + `\nEmail: ${this.email_url}${id}`
  }

  processTasksToModify(abort: () => boolean) {
    this.children_to_move = []
    return map(this.subs.lists, async (sync: GTasksListSync) => {
      await map(sync.getTasks(), async task => {
        const db_res = <DBRecord>(<any>this.root.data
          .chain()
          .where((record: DBRecord) => {
            // TODO implement gtasks_hidden_ids
            return Boolean(record.gtasks_ids && record.gtasks_ids[task.id])
          })
          .limit(1)
          .data())
        const record: DBRecord = db_res[0]
        // TODO type
        const patch: any = {}
        // TODO this should wait for gmail to write
        if (record.gmail_id && this.toDBID(task) != record.gmail_id) {
          // Link to email
          // TODO extract
          patch.notes = record.content + '\nemail:' + record.gmail_id
        }
        const title =
          record.title + this.root.getRecordLabelsAsText(record, sync.config)
        if (task.title != title) {
          patch.title = title
        }
        let delete_task = false
        if (sync.config.db_query(record) && this.isCompleted(task)) {
          // Un-complete
          patch.status = 'needsAction'
          patch.completed = null
        } else if (!sync.config.db_query(record)) {
          // Delete
          // TODO get the IDs - list's ID and the local tasks ID
          delete_task = this.taskIsUncompletedElsewhere(
            record,
            sync.config.name
          )
          // Complete
          if (!delete_task && !this.isCompleted(task)) {
            patch.status = 'completed'
          } else if (delete_task) {
            const children = sync.getChildren(task.id)
            this.log('TODO - move the children:\n%O', children)
            // await this.addChildren(other_list_id, children
          }
        }
        if (delete_task) {
          delete record.gtasks_ids[task.id]
          await this.deleteTask(task, sync.list, abort)
          sync.state.add('Dirty')
        } else if (Object.keys(patch).length) {
          await this.modifyTask(task, sync.list, patch, abort)
          sync.state.add('Dirty')
        }
      })
    })
  }

  async modifyTask(
    task: Task,
    list: TaskList,
    patch: object,
    abort: () => boolean
  ) {
    const params = {
      tasklist: list.id,
      task: task.id,
      resource: patch,
      // TODO test
      fields: ''
    }
    this.log(`Updating task '${task.title}' in '${list.title}'\n%O`, patch)
    await this.api.req(this.api.tasks.patch, params, abort, true)
  }

  async deleteTask(task: Task, list: TaskList, abort: () => boolean) {
    this.log(`Deleting task '${task.title}' in '${list.title}'`)
    const params = {
      tasklist: list.id,
      task: task.id
    }
    return await this.api.req(this.api.tasks.delete, params, abort, true)
  }

  getListByID(id: string): GTasksListSync {
    return this.subs_flat.find(sync => sync.list.id == id)
  }

  // TODO return the ID of the first list
  taskIsUncompletedElsewhere(record: DBRecord, name: string) {
    return this.subs_flat
      .filter(sync => sync.config.name != name)
      .some(sync => sync.config.db_query(record))
  }

  getTasksToAdd(abort: () => boolean) {
    return map(this.subs.lists, async (sync: GTasksListSync) => {
      // TODO loose the cast
      const records = <DBRecord[]>(<any>this.root.data.where(
        sync.config.db_query
      ))
      await map(records, async record => {
        const task_id = _.findKey(record.gtasks_ids, id => id == sync.list.id)
        // omit tasks who are already on the list
        if (task_id) return
        const params = {
          tasklist: sync.list.id,
          fields: 'id',
          resource: {
            title:
              record.title +
              this.root.getRecordLabelsAsText(record, sync.config),
            notes: this.addGmailID(record.content, record.gmail_id)
          }
        }
        this.log(`Adding a new task '${record.title}' to '${sync.list.title}'`)
        const res = await this.api.req(
          this.api.tasks.insert,
          params,
          abort,
          false
        )
        record.gtasks_ids = record.gtasks_ids || {}
        record.gtasks_ids[res.id] = sync.list.id
        // TODO batch
        this.root.data.update(record)
        sync.state.add('Dirty')
      })
    })
  }
}
