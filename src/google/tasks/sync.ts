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
  // ID is ignored
  id: string
  title: string
  notes?: string
  children: TaskTree[]
  completed: boolean
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
  children_to_move: {
    list_id: string
    gmail_id: string
    children: TaskTree[]
  }[]
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
    // get and modify tasks
    await this.processTasksToModify(abort)
    await this.processTasksToAdd(abort)
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
        if (record.gmail_id && this.toGmailID(task) != record.gmail_id) {
          // Link to email
          patch.notes = this.addGmailID(record.content, record.gmail_id)
        }
        const title =
          record.title + this.root.getRecordLabelsAsText(record, sync.config)
        if (task.title != title) {
          patch.title = title
        }
        let other_list_id
        if (sync.config.db_query(record) && this.isCompleted(task)) {
          // Un-complete
          patch.status = 'needsAction'
          patch.completed = null
        } else if (!sync.config.db_query(record)) {
          // Delete
          // TODO get the IDs - list's ID and the local tasks ID
          other_list_id = this.taskIsUncompletedElsewhere(
            record,
            sync.config.name
          )
          // Complete
          if (!other_list_id && !this.isCompleted(task)) {
            patch.status = 'completed'
          } else if (other_list_id) {
            const children = sync.getChildren(task.id)
            if (children.root_tasks.length) {
              this.log(
                `Moving ${children.root_tasks.length} for '${task.title}'`
              )
              // defer writing children until all the lists are done
              // TODO ideally wait only for the target list
              this.children_to_move.push({
                list_id: other_list_id,
                gmail_id: record.gmail_id,
                children: children.root_tasks
              })
              // remove children from this list
              await map(children.all_tasks, async t =>
                this.deleteTask(t, sync.list, abort)
              )
            }
          }
        }
        if (other_list_id) {
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

  async saveChildren(
    list_id: string,
    parent_id: string,
    children: TaskTree[],
    abort: TAbortFunction
  ) {
    const list = this.getListByID(list_id)
    const process_children: Promise<void>[] = []
    let previous_sibling_id
    for (const task of children) {
      this.log(
        `Adding a new child task '${task.title}' for '${parent_id}' in ${
          list.list.title
        }`
      )
      // add the task
      const params = {
        tasklist: list_id,
        fields: 'id',
        parent: parent_id,
        resource: {
          title: task.title,
          notes: task.notes,
          status: task.completed ? 'completed' : 'needsAction'
        }
      }
      if (previous_sibling_id) {
        // @ts-ignore
        params.previous = previous_sibling_id
      }
      const res = await this.api.req(
        this.api.tasks.insert,
        params,
        abort,
        false
      )
      previous_sibling_id = res.id
      // add nested tasks, if any
      // process children in parallel, but wait for all to finish
      // TODO use proper tree traversal, avoid recursion
      if (task.children.length) {
        process_children.push(
          this.saveChildren(list_id, res.id, task.children, abort)
        )
      }
    }
    // process children in parallel, but wait for all to finish
    await Promise.all(process_children)
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

  /**
   * Returns the ID of the list where the task is uncompleted.
   */
  taskIsUncompletedElsewhere(record: DBRecord, name: string): string | false {
    const list = this.subs_flat
      .filter(sync => sync.config.name != name)
      .find(sync => sync.config.db_query(record))
    return list ? list.list.id : false
  }

  processTasksToAdd(abort: () => boolean) {
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
        const to_move = this.children_to_move.find(
          item =>
            item.gmail_id == record.gmail_id && item.list_id == sync.list.id
        )
        if (to_move) {
          await this.saveChildren(sync.list.id, res.id, to_move.children, abort)
          this.children_to_move = _.without(this.children_to_move, to_move)
        }
        // TODO batch
        this.root.data.update(record)
        sync.state.add('Dirty')
      })
    })
  }
}
