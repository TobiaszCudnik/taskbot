import { machine, PipeFlags } from 'asyncmachine'
import { TAbortFunction } from 'asyncmachine/types'
import * as debug from 'debug'
import { google } from 'googleapis'
import * as http from 'http'
import * as _ from 'lodash'
import { Moment } from 'moment'
import * as moment from 'moment'
import * as delay from 'delay'
import * as roundTo from 'round-to'
import { map } from 'typed-promisify-tob'
import { tasks_v1 } from 'googleapis/build/src/apis/tasks/v1'
// Machine types
import {
  AsyncMachine,
  IBind,
  IEmit,
  IJSONStates,
  TStates,
  IBindBase,
  IEmitBase,
  ITransitions
} from '../../../typings/machines/google/tasks/sync'
import GC from '../../sync/gc'
import RootSync, { DBRecord } from '../../sync/root'
import { sync_writer_state, SyncWriter } from '../../sync/writer'
import { IConfig } from '../../types'
import Auth from '../auth'
import GTasksListSync, { Task, TaskList } from './sync-list'
import * as regexEscape from 'escape-string-regexp'

const SEC = 1000

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

type TaskLists = tasks_v1.Schema$TaskLists

export default class GTasksSync extends SyncWriter<
  IConfig,
  TStates,
  IBind,
  IEmit
>
// TODO type machine types
// implements ITransitions
{
  state: AsyncMachine<TStates, IBind, IEmit>
  etags: {
    task_lists: string | null
  } = {
    task_lists: null
  }
  api: tasks_v1.Tasks
  // @ts-ignore
  sub_states_outbound = [
    ['Reading', 'Reading', PipeFlags.FINAL],
    ['Enabled', 'Enabled', PipeFlags.FINAL],
    ['QuotaExceeded', 'QuotaExceeded', PipeFlags.FINAL],
    ['Restarting', 'Restarting', PipeFlags.FINAL]
  ]
  lists: TaskLists
  subs: {
    lists: GTasksListSync[]
  }
  // @ts-ignore
  subs_flat: GTasksListSync[]
  // TODO ideally loose this
  children_to_move: {
    list_id: string
    gmail_id: string
    children: TaskTree[]
  }[]
  // internal user sync quota per day, range between 0 (full limit) to
  email_url = `https://${this.root.config.gmail.domain}/mail/u/0/#all/`
  reads_today_last_reset: Moment = null
  reads_today = 0

  get short_quota_usage(): number {
    // TODO quota should be per user
    const requests = this.root.connections.requests.gtasks
    const i = _.sortedIndex(
      requests,
      moment()
        .subtract(100, 'seconds')
        .unix()
    )
    return Math.min(
      1,
      roundTo(
        (requests.length - i) / this.config.gtasks.request_quota_100_user,
        2
      )
    )
  }

  // remaining quota, range between 0 (full limit) to 1 (none left)
  // 1 (none left)
  get user_quota(): number {
    const now = moment().tz('America/Los_Angeles')
    let last_reset = this.reads_today_last_reset
    // reset once per day (in the timezone of the quota)
    if (!last_reset || last_reset.diff(now, 'days')) {
      this.reads_today = 0
      this.reads_today_last_reset = moment()
        .tz('America/Los_Angeles')
        .startOf('day')
    }
    return Math.min(1, roundTo(this.reads_today / this.calculateQuota(), 2))
  }

  constructor(root: RootSync, public auth: Auth) {
    super(root.config, root)
    this.api = this.root.connections.apis.gtasks
  }

  // ----- -----
  // Transitions
  // ----- -----

  async Writing_state() {
    this.last_write_tries++
    const abort = this.state.getAbort('Writing')
    // get and modify tasks
    await this.processTasksToModify(abort)
    await this.processTasksToAdd(abort)
    await this.processTasksToDelete(abort)
    this.state.add('WritingDone')
  }

  SyncDone_state() {
    // cleanup the tmp flags
    // TODO dont use `where`, update the indexes
    this.root.data.where((record: DBRecord) => {
      delete record.gtasks_hidden_completed
      return false
    })
  }

  SubsInited_state() {
    this.subs = {
      lists: this.config.lists
        .filter(config => !config.writers || config.writers.includes('gtasks'))
        .map(config => new GTasksListSync(config, this.root, this))
    }
    this.bindToSubs()
  }

  async FetchingTaskLists_state() {
    let abort = this.state.getAbort('FetchingTaskLists')
    let params = { headers: { 'If-None-Match': this.etags.task_lists } }
    const res = await this.req(
      'tasklists.list',
      this.api.tasklists.list,
      [this.api.tasklists, this.api.tasklists.list],
      params,
      null, // abort
    )
    const {data } = res

    if (abort()) return
    if (res.statusCode !== 304) {
      this.log('[FETCHED] tasks lists')
      this.etags.task_lists = <string>res.headers.etag
      this.lists = data.items
    } else {
      this.log('[CACHED] tasks lists')
    }
    const missing = this.config.lists
      .filter(config => !config.writers || config.writers.includes('gtasks'))
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
    return machine(sync_state).id('GTasks/root')
  }

  /**
   * Request decorator
   * TODO extract as a GoogleRequestMixin
   */
  async req<A, T>(
    method_name: string,
    method: (params: A) => T,
    pointer: [object, Function],
    params: A,
    abort: (() => boolean) | null | undefined,
    options?: object
  ): T {
    this.root.connections.requests.gtasks.push(moment().unix())
    // @ts-ignore
    params.auth = this.auth.client
    // check the internal per-user quota
    if (this.user_quota == 1) {
      this.state.add('QuotaExceeded')
    }
    return await this.root.connections.req(
      this.root.config.user.id,
      'gtasks.' + method_name,
      method,
      pointer,
      params,
      abort,
      {
        // TODO keep alive
        // shouldKeepAlive
        forever: true,
        ...options
      }
    )
  }

  async createTaskLists(names, abort: TAbortFunction) {
    await map(names, async name => {
      this.log(`Creating a new list tasklist '${name}'`)
      await this.req(
        'tasklists.insert',
        this.api.tasklists.insert,
        { resource: { title: name } },
        abort,
        true
      )
    })
  }

  toString() {
    return this.subs.lists.map(l => l.toString()).join('\n') + '\n'
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
      await map(sync.getTasks(), async (task: Task) => {
        const db_res = <DBRecord>(<any>this.root.data
          .chain()
          .where((record: DBRecord) => {
            // TODO implement gtasks_hidden_ids
            return Boolean(record.gtasks_ids && record.gtasks_ids[task.id])
          })
          .limit(1)
          .data())
        const record: DBRecord = db_res[0]
        if (record.to_delete) {
          return
        }
        // TODO type
        const patch: any = {}
        // TODO this should wait for gmail to write
        // @ts-ignore
        if (record.gmail_id && this.toGmailID(task) != record.gmail_id) {
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
                `Moving ${children.root_tasks.length} children for '${
                  task.title
                }'`
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

  processTasksToDelete(abort: () => boolean) {
    return map(this.subs.lists, async (sync: GTasksListSync) => {
      await map(sync.getTasks(), async task => {
        const db_res = this.root.data
          .chain()
          .where((record: DBRecord) => {
            // TODO implement gtasks_hidden_ids
            return Boolean(
              record.gtasks_ids &&
                record.gtasks_ids[task.id] &&
                record.to_delete
            )
          })
          .limit(1)
          .data()
        if (!db_res[0]) return
        const record: DBRecord = db_res[0]
        delete record.gtasks_ids[task.id]
        const children = sync.getChildren(task.id)
        // remove children, if any
        await map(children.all_tasks, async t =>
          this.deleteTask(t, sync.list, abort)
        )
        await this.deleteTask(task, sync.list, abort)
        // update the local cache manually
        sync.tasks.items = _.without(sync.tasks.items, task)
        // mark as dirty to force re-read
        sync.state.add('Dirty')
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
      const res = await this.req(
        'tasks.insert',
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
    await this.req('tasks.patch', this.api.tasks.patch, params, abort, true)
  }

  async deleteTask(task: Task, list: TaskList, abort: () => boolean) {
    this.log(`Deleting task '${task.title}' in '${list.title}'`)
    const params = {
      tasklist: list.id,
      task: task.id
    }
    await this.req('tasks.delete', this.api.tasks.delete, params, abort, true)
    // delete from cache
    const cache = this.getListByID(list.id).tasks
    cache.items = cache.items.filter(t => t.id != task.id)
  }

  getListByID(id: string): GTasksListSync {
    return this.subs_flat.find(sync => sync.list.id == id)
  }

  getListByName(name: string): GTasksListSync {
    return this.subs_flat.find(
      sync => sync.list.title.toLocaleLowerCase() == name.toLocaleLowerCase()
    )
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

  // amount of sync reads (not requests) per day
  // TODO make it a mixin, add to Gmail
  calculateQuota() {
    const day = 24 * 60 * 60
    let estimated = 0
    for (const sync of this.subs_flat) {
      estimated += day / sync.sync_frequency
    }
    // at least 100 syncs per day
    return Math.max(100, estimated * 1.5)
  }

  processTasksToAdd(abort: () => boolean) {
    return map(this.subs.lists, async (sync: GTasksListSync) => {
      const records = this.root.data.where((record: DBRecord) => {
        // TODO implement gtasks_hidden_ids
        return !record.to_delete && sync.config.db_query(record)
      })
      await map(records, async (record: DBRecord) => {
        const task_id = _.findKey(record.gtasks_ids, id => id == sync.list.id)
        // omit tasks who are already on the list
        if (task_id) return
        // omit tasks marked for deletion
        if (record.to_delete) return
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
        const res = await this.req(
          'tasks.insert',
          this.api.tasks.insert,
          params,
          abort,
          false
        )
        if (abort && abort()) abort()
        record.gtasks_ids = record.gtasks_ids || {}
        record.gtasks_ids[res.id] = sync.list.id
        const to_move = this.children_to_move.find(
          item =>
            item.gmail_id == record.gmail_id && item.list_id == sync.list.id
        )
        if (to_move) {
          await this.saveChildren(sync.list.id, res.id, to_move.children, abort)
          if (abort && abort()) abort()
          this.children_to_move = _.without(this.children_to_move, to_move)
        }
        // TODO batch
        this.root.data.update(record)
        sync.state.add('Dirty')
      })
    })
  }
}
