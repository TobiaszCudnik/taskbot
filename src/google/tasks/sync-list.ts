import { machine } from 'asyncmachine'
import { TAbortFunction } from 'asyncmachine/types'
import * as debug from 'debug'
import * as clone from 'deepcopy'
import * as delay from 'delay'
import { AxiosResponse } from 'axios'
import { tasks_v1 } from 'googleapis/build/src/apis/tasks/v1'
import * as _ from 'lodash'
import * as moment from 'moment'
// Machine types
import {
  AsyncMachine,
  IBind,
  IEmit,
  IJSONStates,
  TStates,
  IBindBase,
  IEmitBase
} from '../../../typings/machines/google/tasks/sync-list'
import RootSync, { DBRecord } from '../../sync/root'
import { SyncReader, sync_reader_state } from '../../sync/reader'
import { IListConfig } from '../../types'
import GTasksSync, { TTask, TTaskList, TTasksRes, TTaskTree } from './sync'
import * as regexEscape from 'escape-string-regexp'

export const sync_state: IJSONStates = sync_reader_state

export default class GTasksListSync extends SyncReader<
  IListConfig,
  TStates,
  IBind,
  IEmit
> {
  state: AsyncMachine<TStates, IBind, IEmit>
  tasks: TTasksRes | null
  prev_tasks: TTasksRes | null
  // TODO theres no other etags?
  etags: {
    tasks: string | null
    tasks_reqs: number
    // tasks_completed: string | null
  } = {
    tasks: null,
    tasks_reqs: 0
    // tasks_completed: null
  }
  get list(): TTaskList | null {
    if (!this.gtasks.lists) {
      throw Error('Lists not fetched')
    }
    return this.gtasks.lists.find(l => l.title == this.config.name)
  }

  constructor(config: IListConfig, root: RootSync, public gtasks: GTasksSync) {
    super(config, root)
  }

  // ----- -----
  // Transitions
  // ----- -----

  // TODO propagate to GTasksSYnc
  async QuotaExceeded_state() {
    const SEC = 1000
    await delay(this.gtasks.config.gtasks.quota_exceeded_delay * SEC)
    this.state.drop('QuotaExceeded')
  }

  async Reading_state() {
    if (!this.shouldRead()) {
      return this.state.addNext('ReadingDone')
    }
    // counters
    super.Reading_state()
    this.root.last_sync_reads++
    this.gtasks.reads_today++
    this.last_read_tries++

    const quota = this.gtasks.short_quota_usage
    const abort = this.state.getAbort('Reading')
    type TResponse = AxiosResponse<TTasksRes>
    const res: TResponse = await this.gtasks.req(
      'api.tasks.list',
      this.gtasks.api.tasks.list,
      this.gtasks.api.tasks,
      {
        // TODO manually type params
        tasklist: this.list.id,
        fields: 'etag,items(id,title,notes,updated,etag,status,parent)',
        // TODO paging
        maxResults: '1000',
        showHidden: false,
        // request a cached version after an etag is confirmed twice
        // its a gtasks' api bug, where the same etag can be attached to 2
        // different responses
        headers: this.etags.tasks_reqs++
          ? { 'If-None-Match': this.etags.tasks }
          : {}
      },
      abort
    )

    if (abort()) return

    this.state.drop('Dirty')
    if (res.status === 304) {
      this.state.add('Cached')
      this.log(`[CACHED:${quota}] tasks for '${this.config.name}'`)
    } else {
      this.state.drop('Cached')
      this.log(`[FETCH:${quota}] tasks for '${this.config.name}'`)
      if (!res.data.items) {
        res.data.items = []
      }
      // preserve the request counter per etag
      if (this.etags.tasks != res.headers['etag']) {
        // @ts-ignore
        this.etags.tasks = res.headers['etag']
        this.etags.tasks_reqs = 0
      }
      this.prev_tasks = this.tasks
      this.tasks = res.data
    }

    this.state.add('ReadingDone')
  }

  mark_to_delete = []
  ReadingDone_state() {
    super.ReadingDone_state()
    this.mark_to_delete = []
  }

  // ----- -----
  // Methods
  // ----- -----

  // @ts-ignore
  getState() {
    return machine(sync_state).id('GTasks/list: ' + this.config.name)
  }

  // return a filtered list of tasks
  getTasks(): TTask[] {
    return this.tasks ? this.tasks.items.filter(this.tasksFilter) : []
  }

  // return a filtered list of tasks
  getPrevTasks(): TTask[] {
    return this.prev_tasks ? this.prev_tasks.items.filter(this.tasksFilter) : []
  }

  private tasksFilter(task: TTask) {
    return !task.parent && task.title && task.title[0] != '-'
  }

  // TODO extract to ListSyncFreq
  shouldRead() {
    if (!this.list) {
      this.log(`List doesn't exist, skipping reading`)
      return false
    }
    if (this.state.is('QuotaExceeded')) {
      this.log(`QuotaExceeded, skipping reading`)
      return false
    }
    if (this.state.is('Dirty') || !this.last_read_end) {
      this.log_verbose(`Forced read - Dirty`)
      return true
    }
    // TODO check users internal quota to avoid too many dirty refreshes
    // Reuse the previous version if running out of quota and data is expected
    // to be the same
    // TODO move to the config
    if (this.gtasks.short_quota_usage >= 0.25) {
      this.log_verbose(
        `Reading skipped - short quota is ${this.gtasks.short_quota_usage}`
      )
      return false
    }
    const since_last_read = moment.duration(moment().diff(this.last_read_start))
    const sync_frequency = this.sync_frequency
    if (sync_frequency && since_last_read.asSeconds() < sync_frequency) {
      this.log_verbose(`Reading skipped - max frequency exceeded`)
      return false
    }
    return true
  }

  // Returns the number of seconds between reads
  get sync_frequency(): number {
    let sync_frequency =
      this.gtasks.config.gtasks.sync_frequency ||
      this.gtasks.config.sync_frequency
    const list_multi = (this.config.sync_frequency || {}).gtasks_multi
    if (list_multi) {
      sync_frequency *= list_multi
    }
    if (this.root.config.sync_frequency_multi) {
      sync_frequency *= this.root.config.sync_frequency_multi
    }
    return sync_frequency
  }

  /**
   * Return tree like structure of children tasks.
   *
   * To move children to a new list you have to remove the old IDs.
   *
   * @param task_id
   * @returns `null` in case of no children
   */
  getChildren(
    task_id: string
  ): { root_tasks: TTaskTree[]; all_tasks: TTaskTree[] } {
    const tasks = this.tasks.items
    const root_tasks = []
    const index = tasks.findIndex(t => t.id == task_id)
    // assume sorted, if next has a parent, its a child
    let i
    let all_tasks = []
    for (i = index + 1; tasks[i] && tasks[i].parent; i++) {
      let target: TTaskTree[]
      if (tasks[i].parent == task_id) {
        target = root_tasks
      } else {
        target = all_tasks.find(p => p.id == tasks[i].parent).children
      }
      // TODO extract the type
      target.push({
        id: tasks[i].id,
        title: tasks[i].title,
        completed: this.gtasks.isCompleted(tasks[i]),
        children: [],
        notes: tasks[i].notes ? this.getContent(tasks[i].notes) : null
      })
      all_tasks.push(target[target.length - 1])
    }
    return { root_tasks, all_tasks }
  }

  async merge(abort: TAbortFunction) {
    this.log_verbose('merge')
    let changed = 0
    // add / merge
    for (const task of this.getTasks()) {
      const record = this.getFromDB(task)
      if (!record) {
        const new_record = this.createRecord(task)
        this.log('change')
        this.log_verbose('new record:\n %O', this.root.logRecord(new_record))
        this.root.data.insert(new_record)
        this.root.markListsAsDirty(this, new_record)
        changed++
      } else if (this.mergeRecord(task, record)) {
        this.log('change')
        changed++
      }
    }
    // delete
    // TODO extract
    const deleted = _.uniq(
      _.differenceBy(this.getPrevTasks(), this.getTasks(), t => t.id)
    )
    if (deleted.length) {
      this.log_verbose(`Checking ${deleted.length} task(s) missing`)
    }
    for (const task of deleted) {
      const record = this.getFromDB(task)
      if (!record || record.gtasks_hidden_completed) {
        continue
      }
      type TResponse = AxiosResponse<TTask>
      // check if not hidden (new google's clients behavior)
      // only during the first merge run
      const refreshed: TResponse | null =
        this.root.merge_tries == 1
          ? await this.gtasks.req(
              'api.tasks.patch',
              this.gtasks.api.tasks.patch,
              this.gtasks.api.tasks,
              // TODO manually type params
              {
                tasklist: this.list.id,
                task: task.id,
                // fields: 'id',
                resource: {
                  hidden: false
                }
              },
              abort
            )
          : null
      // hidden and completed
      if (
        refreshed &&
        !refreshed.data.deleted &&
        this.gtasks.isCompleted(refreshed)
      ) {
        changed++
        this.state.add('Dirty')
        // add back to the cache
        this.tasks.items.push(refreshed)
        record.gtasks_hidden_completed = true
      } else {
        // task was really deleted
        this.log(`Task '${record.title}' deleted in GTasks`)
        // mark the local ID as deleted
        // if (record.gtasks_ids) {
        //   record.gtasks_ids[refreshed.id].status = GTasksStatus.DELETED
        // }
        this.mark_to_delete.push(task.id)
        // loop at least three times to let others alter the DB
        if (this.root.merge_tries < 3) {
          changed++
        }
        // mark all the other lists as Dirty on the first run
        if (this.root.merge_tries == 1) {
          this.log_verbose('Marking all GTasks lists as Dirty')
          this.gtasks.subs.lists.forEach(l => l.state.add('Dirty'))
        }
        // loop at least three times to let others alter the DB
        if (changed) continue
        // mark records without any existing task as pending deletion
        if (
          Object.keys(record.gtasks_ids).length == 1 &&
          this.mark_to_delete.includes(task.id)
        ) {
          this.log(`Marking record '${record.title}' for deletion`)
          record.to_delete = true
          record.gtasks_moving = true
        } else {
          // if the task was moved, delete the old ID
          delete record.gtasks_ids[task.id]
        }
        // TODO use complex gtasks_ids with statuses and dates or equivalents
        // record.gtasks_ids = record.gtasks_ids || {}
        // const deleted_everywhere = !Object.values(record.gtasks_ids).every(
        //   t => t.status == GTasksStatus.DELETED
        // )
        // if (deleted_everywhere) {
        //   this.log(`Marking record '${refreshed.title}' for deletion`)
        //   record.to_delete = true
        // }
      }
    }
    return changed ? [changed] : []
  }

  // TODO try to make it in one query, indexes
  getFromDB(task: TTask): DBRecord | null {
    const id = this.gtasks.toGmailID(task)
    if (id) {
      const record = this.root.data.findOne({ gmail_id: id })
      if (record) return record
    }
    const ret = this.root.data
      .chain()
      .where((obj: DBRecord) => {
        return Boolean(obj.gtasks_ids && obj.gtasks_ids[task.id])
      })
      .limit(1)
      .data()
    return ret[0] || null
  }

  createRecord(task: TTask): DBRecord {
    const id = this.gtasks.toGmailID(task)
    const text_labels = this.root.getLabelsFromText(task.title, true)
    const record: DBRecord = {
      title: text_labels.text,
      content: this.getContent(task.notes),
      labels: {},
      updated: {
        latest: moment(task.updated).unix(),
        gtasks: moment(task.updated).unix(),
        gmail_hid: null
      },
      gtasks_ids: {
        [task.id]: this.list.id
      }
    }
    if (id) {
      record.gmail_id = id
    }
    // apply labels from the list definition
    const labels =
      task.status == 'completed' ? this.config.exit : this.config.enter
    this.modifyLabels(record, labels)
    // apply labels from text
    this.modifyLabels(record, { add: text_labels.labels })
    return record
  }

  getContent(content: string): string {
    const regex = new RegExp(
      `\\n?\\bEmail: ${regexEscape(this.gtasks.email_url)}[\\w-]+\\b`
    )
    return (
      (content || '')
        // legacy format
        .replace(/\n?\bemail:[\w-]+\b/, '')
        .replace(regex, '') || ''
    )
  }

  updateTextLabels(record: DBRecord, new_title: string) {
    const text_labels = this.root.getLabelsFromText(new_title, true)
    const old_title =
      record.title + this.root.getRecordLabelsAsText(record, this.config)
    const text_labels_old = this.root.getLabelsFromText(old_title, true)
    if (old_title != new_title) {
      record.title = text_labels.text
      this.modifyLabels(record, {
        add: text_labels.labels,
        remove: _.difference(text_labels_old.labels, text_labels.labels)
      })
    }
  }

  // TODO support duplicating in case of a conflict ???
  mergeRecord(task: TTask, record: DBRecord): boolean {
    const before = clone(record)
    const task_updated = moment(task.updated).unix()
    // apply title labels on the initial record's sync
    let text_labels_updated = false
    record.gtasks_ids = record.gtasks_ids || {}
    if (!record.gtasks_ids[task.id]) {
      this.updateTextLabels(record, task.title)
      text_labels_updated = true
    }
    record.content = this.getContent(task.notes)
    // mark as found in case of moving
    if (record.gtasks_moving) {
      record.to_delete = false
    }
    // add to the gtasks id map
    record.gtasks_ids[task.id] = this.list.id
    if (task_updated <= record.updated.gtasks) {
      // TODO check resolve conflict? since the last sync
      this.printRecordDiff(before, record)
      return false
    }
    this.log_verbose('merging')
    // update the record with changes from gtasks
    record.updated.gtasks = task_updated
    record.updated.latest = Math.max(record.updated.latest, task_updated)
    if (!text_labels_updated) {
      this.updateTextLabels(record, task.title)
    }
    const labels =
      task.status == 'completed' ? this.config.exit : this.config.enter
    // if (task.status == 'completed' && before.status == 'needsAction') {
    //   record.gtasks_uncompleted = true
    // }
    this.modifyLabels(record, labels)
    this.root.markListsAsDirty(this, record)
    this.printRecordDiff(before, record)
    return true
  }

  toString() {
    return (
      'GTasks - ' +
      this.config.name +
      (this.state.is('Dirty') ? ' (Dirty)' : '') +
      '\n' +
      this.getTasks()
        .map(
          (t: TTask) =>
            (t.status == 'completed' ? 'c ' : '- ') + this.root.logText(t.title)
        )
        .join('\n')
    )
  }
}
