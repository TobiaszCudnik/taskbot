import { machine, PipeFlags } from 'asyncmachine'
import { TAbortFunction } from 'asyncmachine/types'
import { GaxiosPromise, GaxiosResponse } from 'gaxios'
import * as delay from 'delay'
import * as regexEscape from 'escape-string-regexp'
import { tasks_v1 } from '../../../typings/googleapis/tasks'
import { MethodOptions } from 'googleapis-common/build/src/api'
import * as _ from 'lodash'
import * as moment from 'moment'
import { Moment } from 'moment'
import * as roundTo from 'round-to'
// Machine types
import {
  AsyncMachine,
  IBind,
  IEmit,
  IJSONStates,
  TStates
} from '../../../typings/machines/google/tasks/sync'
import { DBRecord, DBRecordID, TMergeState } from '../../sync/record'
import RootSync from '../../sync/root'
import { sync_writer_state, SyncWriter } from '../../sync/writer'
import { IConfigParsed } from '../../types'
import Auth from '../auth'
import { TGlobalFields } from '../sync'
import GTasksListSync from './sync-list'

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

export type TTaskTree = {
  // ID is ignored
  id: string
  title: string
  notes?: string
  children: TTaskTree[]
  completed: boolean
}
export type TTask = tasks_v1.Schema$Task
export type TTaskList = tasks_v1.Schema$TaskList
export type TTasksRes = tasks_v1.Schema$Tasks
export type TTaskListsRes = tasks_v1.Schema$TaskLists

export default class GTasksSync extends SyncWriter<
  IConfigParsed,
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
  lists: TTaskList[]
  subs: {
    lists: GTasksListSync[]
  }
  // @ts-ignore
  subs_flat: GTasksListSync[]
  // TODO ideally loose this
  children_to_move: {
    list_id: string
    gmail_id: string
    children: TTaskTree[]
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
      parseInt(
        moment()
          .subtract(100, 'seconds')
          .format('x'),
        10
      )
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
    super(root.config_parsed, root)
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
      this.merger(record.gmail_id).drop('GtasksHiddenCompleted')
      return false
    })
    const last_read = moment.max(this.subs_flat.map(s => s.last_read_start))
    this.root.emitStats({
      last_sync_gtasks: last_read.toISOString()
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
    let params: tasks_v1.Params$Resource$Tasklists$List & TGlobalFields = {
      headers: {}
    }
    if (this.etags.task_lists) {
      params.headers['If-None-Match'] = this.etags.task_lists
    }
    const res = await this.req(
      'tasklists.list',
      this.api.tasklists.list,
      this.api.tasklists,
      // @ts-ignore typed manually
      params,
      null // abort
    )

    if (abort()) return
    if (res.status !== 304) {
      this.log('[FETCHED] tasks lists')
      this.etags.task_lists = <string>res.headers.etag
      this.lists = res.data.items
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
  async req<P extends tasks_v1.StandardParameters, R>(
    method_name: string,
    method: (params: P, options: MethodOptions) => GaxiosPromise<R>,
    context: object,
    params: P,
    abort: (() => boolean) | null | undefined,
    options?: MethodOptions
    // @ts-ignore TODO fix type
  ): Promise<GaxiosResponse<R>> {
    this.root.connections.requests.gtasks.push(
      parseInt(moment().format('x'), 10)
    )
    // @ts-ignore
    params.auth = this.auth.client
    // ID for the quota calculation
    params.quotaUser = this.root.config.user.uid
    // check the internal per-user quota
    if (this.root.subs.google.honor_quotas && this.user_quota == 1) {
      this.state.add('QuotaExceeded')
    }
    return await this.root.connections.req(
      this.root.config.user.id,
      'gtasks' + method_name,
      method,
      context,
      params,
      abort,
      options
    )
  }

  async createTaskLists(names, abort: TAbortFunction) {
    await Promise.all(
      names.map(async name => {
        this.log(`Creating a new list tasklist '${name}'`)
        await this.req(
          'tasklists.insert',
          this.api.tasklists.insert,
          this.api.tasklists,
          {
            requestBody: {
              title: name
            }
          },
          abort
        )
      })
    )
  }

  toString() {
    return this.subs.lists.map(l => l.toString()).join('\n') + '\n'
  }

  toGmailID(task: TTask): string | null {
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

  isCompleted(task: TTask) {
    return task.status == 'completed'
  }

  addGmailID(content: string, id: string) {
    return content + `\nEmail: ${this.email_url}${id}`
  }

  processTasksToModify(abort: () => boolean) {
    this.children_to_move = []
    return Promise.all(
      this.subs.lists.map(async (sync: GTasksListSync) => {
        await Promise.all(
          sync.getTasks().map(async (task: TTask) => {
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
              record.title +
              this.root.getRecordLabelsAsText(record, sync.config)
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
                  await Promise.all(
                    children.all_tasks.map(async t =>
                      // @ts-ignore TODO pass the IDs only
                      this.deleteTask(t, sync.list, abort)
                    )
                  )
                }
              }
            }
            if (other_list_id) {
              delete record.gtasks_ids[task.id]
              // @ts-ignore TODO pass IDs
              await this.deleteTask(task, sync.list, abort)
              sync.state.add('Dirty')
            } else if (Object.keys(patch).length) {
              await this.modifyTask(task, sync.list, patch, abort)
              sync.state.add('Dirty')
            }
          })
        )
      })
    )
  }

  processTasksToDelete(abort: () => boolean) {
    return Promise.all(
      this.subs.lists.map(async (sync: GTasksListSync) => {
        await Promise.all(
          sync.getTasks().map(async task => {
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
            await Promise.all(
              children.all_tasks.map(async t =>
                // @ts-ignore TODO pass the IDs only
                this.deleteTask(t, sync.list, abort)
              )
            )
            // @ts-ignore TODO pass IDs only
            await this.deleteTask(task, sync.list, abort)
            // update the local cache manually
            sync.tasks.items = _.without(sync.tasks.items, task)
            // mark as dirty to force re-read
            sync.state.add('Dirty')
          })
        )
      })
    )
  }

  async saveChildren(
    list_id: string,
    parent_id: string,
    children: TTaskTree[],
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
      const params: tasks_v1.Params$Resource$Tasks$Insert & TGlobalFields = {
        tasklist: list_id,
        fields: 'id',
        parent: parent_id,
        requestBody: {
          title: task.title,
          notes: task.notes,
          status: task.completed ? 'completed' : 'needsAction'
        }
      }
      if (previous_sibling_id) {
        params.previous = previous_sibling_id
      }
      const res = await this.req(
        'tasks.insert',
        this.api.tasks.insert,
        this.api.tasks,
        // @ts-ignore manually typed
        params,
        abort
      )
      previous_sibling_id = res.data.id
      // add nested tasks, if any
      // process children in parallel, but wait for all to finish
      // TODO use proper tree traversal, avoid recursion
      if (task.children.length) {
        process_children.push(
          this.saveChildren(list_id, res.data.id, task.children, abort)
        )
      }
    }
    // process children in parallel, but wait for all to finish
    await Promise.all(process_children)
  }

  // TODO require IDs only
  async modifyTask(
    task: TTask,
    list: TTaskList,
    patch: object,
    abort: () => boolean
  ) {
    const params: tasks_v1.Params$Resource$Tasks$Patch = {
      tasklist: list.id,
      task: task.id,
      requestBody: patch,
      // @ts-ignore
      fields: ''
    }
    this.log(`Updating task '${task.title}' in '${list.title}'\n%O`, patch)
    await this.req(
      'tasks.patch',
      this.api.tasks.patch,
      this.api.tasks,
      // @ts-ignore typed manually
      params,
      abort
    )
  }

  /**
   * TODO accept IDs as params
   *
   * @param task
   * @param list
   * @param abort
   */
  async deleteTask(
    task: { id: string; title: string },
    list: { id: string; title: string },
    abort: () => boolean
  ) {
    this.log(`Deleting task '${task.title}' in '${list.title}'`)
    const params: tasks_v1.Params$Resource$Tasks$Delete = {
      tasklist: list.id,
      task: task.id
    }
    await this.req(
      'tasks.delete',
      this.api.tasks.delete,
      this.api.tasks,
      // @ts-ignore typed manually
      params,
      abort
    )
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
    return Promise.all(
      this.subs.lists.map(async (sync: GTasksListSync) => {
        const records = this.root.data.where((record: DBRecord) => {
          // TODO implement gtasks_hidden_ids
          return !record.to_delete && sync.config.db_query(record)
        })
        await Promise.all(
          records.map(async (record: DBRecord) => {
            const task_id = _.findKey(
              record.gtasks_ids,
              id => id == sync.list.id
            )
            // omit tasks who are already on the list
            if (task_id) return
            // omit tasks marked for deletion
            if (record.to_delete) return
            this.log(
              `Adding a new task '${record.title}' to '${sync.list.title}'`
            )
            const res = await this.req(
              'tasks.insert',
              this.api.tasks.insert,
              this.api.tasks,
              {
                tasklist: sync.list.id,
                fields: 'id',
                requestBody: {
                  title:
                    record.title +
                    this.root.getRecordLabelsAsText(record, sync.config),
                  notes: this.addGmailID(record.content, record.gmail_id)
                }
              },
              abort
            )
            if (abort && abort()) abort()
            record.gtasks_ids = record.gtasks_ids || {}
            record.gtasks_ids[res.data.id] = sync.list.id
            const to_move = this.children_to_move.find(
              item =>
                item.gmail_id == record.gmail_id && item.list_id == sync.list.id
            )
            if (to_move) {
              await this.saveChildren(
                sync.list.id,
                res.data.id,
                to_move.children,
                abort
              )
              if (abort && abort()) abort()
              this.children_to_move = _.without(this.children_to_move, to_move)
            }
            // TODO batch
            this.root.data.update(record)
            sync.state.add('Dirty')
          })
        )
      })
    )
  }
}
