import { machine } from 'asyncmachine'
import * as debug from 'debug'
import * as clone from 'deepcopy'
import * as delay from 'delay'
import * as google from 'googleapis'
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
import GTasksSync, { TaskTree } from './sync'
import * as regexEscape from 'escape-string-regexp'

export type Task = google.tasks.v1.Task
export type TaskList = google.tasks.v1.TaskList

// TODO use from googleapis
export interface ITasks {
  etag: string
  items: Task[]
  kind: string
  nextPageToken: string
}

export const sync_state: IJSONStates = sync_reader_state

export default class GTasksListSync extends SyncReader<
  IListConfig,
  TStates,
  IBind,
  IEmit
> {
  state: AsyncMachine<TStates, IBind, IEmit>
  tasks: ITasks | null
  prev_tasks: ITasks | null
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
  get list(): google.tasks.v1.TaskList | null {
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

  async QuotaExceeded_state() {
    const SEC = 1000
    await delay(this.gtasks.config.gtasks.quota_exceeded_delay * SEC)
    this.state.drop('QuotaExceeded')
  }

  async Reading_state() {
    if (!this.shouldRead()) {
      return this.state.add('ReadingDone')
    }
    super.Reading_state()
    const quota = this.gtasks.short_quota_usage
    const abort = this.state.getAbort('Reading')
    const [list, res] = await this.gtasks.req(
      'api.tasks.list',
      this.gtasks.api.tasks.list,
      {
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
      abort,
      true
    )

    if (abort()) return

    this.state.drop('Dirty')
    if (res.statusCode === 304) {
      this.state.add('Cached')
      this.log(`[CACHED:${quota}] tasks for '${this.config.name}'`)
    } else {
      this.state.drop('Cached')
      this.log(`[FETCH:${quota}] tasks for '${this.config.name}'`)
      if (!list.items) {
        list.items = []
      }
      // preserve the request counter per etag
      if (this.etags.tasks != res.headers['etag']) {
        // @ts-ignore
        this.etags.tasks = res.headers['etag']
        this.etags.tasks_reqs = 0
      }
      this.prev_tasks = this.tasks
      this.tasks = list
    }

    this.state.add('ReadingDone')
  }

  // ----- -----
  // Methods
  // ----- -----

  // @ts-ignore
  getState() {
    return machine(sync_state).id('GTasks/list: ' + this.config.name)
  }

  // return a filtered list of tasks
  getTasks(): Task[] {
    return this.tasks ? this.tasks.items.filter(this.tasksFilter) : []
  }

  // return a filtered list of tasks
  getPrevTasks(): Task[] {
    return this.prev_tasks ? this.prev_tasks.items.filter(this.tasksFilter) : []
  }

  private tasksFilter(task: Task) {
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
    if (sync_frequency && since_last_read.asSeconds() < sync_frequency) {
      this.log_verbose(`Reading skipped - max frequency exceeded`)
      return false
    }
    return true
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
  ): { root_tasks: TaskTree[]; all_tasks: TaskTree[] } {
    const tasks = this.tasks.items
    const root_tasks = []
    const index = tasks.findIndex(t => t.id == task_id)
    // assume sorted, if next has a parent, its a child
    let i
    let all_tasks = []
    for (i = index + 1; tasks[i] && tasks[i].parent; i++) {
      let target: TaskTree[]
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

  merge() {
    let changed = 0
    // add / merge
    for (const task of this.getTasks()) {
      const record = this.getFromDB(task)
      if (!record) {
        const new_record = this.createRecord(task)
        this.log('change')
        this.log_verbose('new record:\n %O', new_record)
        this.root.data.insert(new_record)
        changed++
      } else if (this.mergeRecord(task, record)) {
        this.log('change')
        changed++
      }
    }
    const deleted = _.differenceBy(
      this.getPrevTasks(),
      this.getTasks(),
      t => t.id
    )
    for (const task of deleted) {
      this.log(`Task '${task.title}' deleted in GTasks`)
      const record = this.getFromDB(task)
      if (!record) continue
      if (record.gtasks_ids) {
        delete record.gtasks_ids[task.id]
      }
      // mark records without any existing task as pending deletion
      // TODO doesnt work
      if (!record.gtasks_ids || !Object.keys(record.gtasks_ids).length) {
        this.log(`Marking record '${task.title}' to deletion`)
        record.to_delete = true
      }
    }
    return changed ? [changed] : []
  }

  // TODO try to make it in one query, indexes
  getFromDB(task: Task): DBRecord | null {
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

  createRecord(task: Task): DBRecord {
    const id = this.gtasks.toGmailID(task)
    const text_labels = this.root.getLabelsFromText(task.title, true)
    const record: DBRecord = {
      title: text_labels.text,
      content: this.getContent(task.notes),
      labels: {},
      updated: moment(task.updated).unix(),
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
    this.applyLabels(record, labels)
    // apply labels from text
    this.applyLabels(record, { add: text_labels.labels })
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
      this.applyLabels(record, {
        add: text_labels.labels,
        remove: _.difference(text_labels_old.labels, text_labels.labels)
      })
    }
  }

  mergeRecord(task: Task, record: DBRecord): boolean {
    const before = clone(record)
    // TODO support duplicating in case of a conflict ???
    //   or send a new email in the thread?
    //   if sending a new thread, resolve conflicts properly with other sources
    //   introduce a universal conflict resolution pattern?
    const task_updated = moment(task.updated).unix()
    // apply title labels on the initial record's sync
    let text_labels_updated = false
    if (!record.gtasks_ids[task.id]) {
      this.updateTextLabels(record, task.title)
      text_labels_updated = true
    }
    record.content = this.getContent(task.notes)
    // add to the gtasks id map
    record.gtasks_ids = record.gtasks_ids || {}
    record.gtasks_ids[task.id] = this.list.id
    if (task_updated <= record.updated) {
      // TODO check resolve conflict? since the last sync
      this.printRecordDiff(before, record)
      return false
    }
    // update the record with changes from gtasks
    record.updated = task_updated
    if (!text_labels_updated) {
      this.updateTextLabels(record, task.title)
    }
    const labels =
      task.status == 'completed' ? this.config.exit : this.config.enter
    this.applyLabels(record, labels)
    this.printRecordDiff(before, record)
    return true
  }

  toString() {
    return (
      'GTasks - ' +
      this.config.name +
      '\n' +
      this.getTasks()
        .map((t: Task) => (t.status == 'completed' ? 'c ' : '- ') + t.title)
        .join('\n')
    )
  }
}
