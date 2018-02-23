import * as moment from 'moment'
import { Sync, SyncState } from '../../sync/sync'
import * as google from 'googleapis'
import RootSync, { DBRecord } from '../../sync/root'
import GTasksSync from './sync'
import { IListConfig } from '../../types'
import * as debug from 'debug'
import * as clone from 'deepcopy'
import * as delay from 'delay'
import * as _ from 'lodash'

export type Task = google.tasks.v1.Task
export type TaskList = google.tasks.v1.TaskList

// TODO use from googleapis
export interface ITasks {
  etag: string
  items: Task[]
  kind: string
  nextPageToken: string
}

export class State extends SyncState {
  Cached = {}
  Dirty = { drop: ['Cached'] }

  QuotaExceeded = { drop: ['Reading'] }

  constructor(target) {
    super(target)
    this.registerAll()
  }
}

export default class GTasksListSync extends Sync {
  // data: IGTasksList
  state: State
  tasks: ITasks | null
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
    for (const list of this.gtasks.lists) {
      if (list.title == this.config.name) {
        return list
      }
    }
  }
  log = debug(this.state.id(true))
  verbose = debug(this.state.id(true) + '-verbose')
  config: IListConfig

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

  Reading_enter() {
    const cancel = () => {
      // ReadingDone need to be dropped manually, as we cancel the transition
      this.state.drop('ReadingDone')
      this.state.add('ReadingDone')
      return false
    }
    if (!this.list) {
      this.log(`List doesn't exist, skipping reading`)
      return cancel()
    }
    if (this.state.is('Dirty') || !this.last_read_end) {
      this.verbose(`Forced read - Dirty`)
      return true
    }
    // Reuse the previous version if running out of quota and data is expected
    // to be the same
    // TODO move to the config
    if (this.gtasks.short_quota_usage >= 0.25) {
      this.verbose(
        `Reading skipped - short quota is ${this.gtasks.short_quota_usage}`
      )
      return cancel()
    }
    const since_last_read = moment.duration(moment().diff(this.last_read_start))
    const sync_frequency =
      this.config.sync_frequency || this.gtasks.config.gtasks.sync_frequency
    if (sync_frequency && since_last_read.asSeconds() < sync_frequency) {
      this.verbose(`Reading skipped - max frequency exceeded`)
      return cancel()
    }
  }

  async Reading_state() {
    super.Reading_state()
    const quota = this.gtasks.short_quota_usage
    const abort = this.state.getAbort('Reading')
    let api_res = await this.gtasks.api.req(
      this.gtasks.api.tasks.list,
      {
        tasklist: this.list.id,
        fields: 'etag,items(id,title,notes,updated,etag,status)',
        maxResults: '1000',
        showHidden: false,
        // request a cached version after an etag is confirmed twice
        // its a gtasks' api bug, where same etag can be attached to 2 different
        // responses
        headers: this.etags.tasks_reqs++
          ? { 'If-None-Match': this.etags.tasks }
          : {}
      },
      abort,
      true
    )

    if (abort()) return

    let [list, res] = api_res

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
        this.etags.tasks = res.headers['etag']
        this.etags.tasks_reqs = 0
      }
      this.tasks = list
    }

    this.state.add('ReadingDone')
  }

  // ----- -----
  // Methods
  // ----- -----

  getState(): State {
    return new State(this).id('GTasks/list: ' + this.config.name)
  }

  // return a filtered list of tasks
  getTasks(): Task[] {
    return this.tasks ? this.tasks.items.filter(t => !t.parent && t.title) : []
  }

  merge() {
    let changed = 0
    // add / merge
    for (const task of this.getTasks()) {
      const record = this.getFromDB(task)
      if (!record) {
        const new_record = this.toDB(task)
        this.verbose('new record:\n %O', new_record)
        this.root.data.insert(new_record)
        changed++
      } else if (this.mergeRecord(task, record)) {
        changed++
      }
    }
    // remove
    // TODO mark record to be hidden using gtasks_hidden_ids
    return changed ? [changed] : []
  }

  // TODO try to make it in one query, indexes
  getFromDB(task) {
    const id = this.gtasks.toDBID(task)
    if (id) {
      const record = this.root.data.findOne({ gmail_id: id })
      if (record) return record
    }
    // return this.root.data.findOne({tasks_ids: { [task.id]: { $exists: true } }})
    return this.root.data
      .chain()
      .where((obj: DBRecord) => {
        return Boolean(obj.gtasks_ids && obj.gtasks_ids[task.id])
      })
      .limit(1)
      .data()[0]
  }

  toDB(task: Task): DBRecord {
    const id = this.gtasks.toDBID(task)
    const text_labels = this.root.getLabelsFromText(task.title)
    const record: DBRecord = {
      title: text_labels.text,
      content: this.getContent(task),
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

  getContent(task: Task): string {
    return (task.notes || '').replace(/\n?\bemail:\w+\b/, '') || ''
  }

  updateTextLabels(record: DBRecord, new_title: string) {
    const text_labels = this.root.getLabelsFromText(new_title)
    const old_title =
      record.title + this.root.getLabelsAsText(record, this.config)
    const text_labels_old = this.root.getLabelsFromText(old_title)
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
    record.content = this.getContent(task)
    // add to the gtasks id map
    record.gtasks_ids = record.gtasks_ids || {}
    record.gtasks_ids[task.id] = this.list.id
    if (task_updated <= record.updated) {
      // TODO check resolve conflict? since the last sync
      this.compareRecord(before, record)
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
    this.compareRecord(before, record)
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
