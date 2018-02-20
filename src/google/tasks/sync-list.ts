import * as moment from 'moment'
import { Sync, SyncState } from '../../sync/sync'
import * as google from 'googleapis'
import RootSync, { DBRecord } from '../../sync/root'
import GTasksSync from './sync'
import { IListConfig } from '../../types'
import * as debug from 'debug'
import * as clone from 'deepcopy'

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
  log = debug('gtasks-list')
  verbose = debug('gtasks-list-verbose')
  config: IListConfig

  constructor(config: IListConfig, root: RootSync, public gtasks: GTasksSync) {
    super(config, root)
  }

  // ----- -----
  // Transitions
  // ----- -----

  async Reading_state() {
    if (!this.list) {
      this.log(`List '${this.config.name}' doesnt exist, skipping reading`)
      return this.state.add('ReadingDone')
    }
    const abort = this.state.getAbort('Reading')

    const api_res = await this.gtasks.api.req(
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
    // TODO handle !res
    let [list, res] = api_res

    if (res.statusCode === 304) {
      this.state.add('Cached')
      this.log(`[CACHED] tasks for '${this.config.name}'`)
    } else {
      this.log(`[FETCH] tasks for '${this.config.name}'`)
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
    const record: DBRecord = {
      title: task.title,
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
    const labels =
      task.status == 'completed' ? this.config.exit : this.config.enter
    this.applyLabels(record, labels)
    return record
  }

  getContent(task: Task): string {
    return (task.notes || '').replace(/\n?\bemail:\w+\b/, '') || ''
  }

  mergeRecord(task: Task, record: DBRecord): boolean {
    const before = clone(record)
    // TODO support duplicating in case of a conflict ???
    //   or send a new email in the thread?
    //   if sending a new thread, resolve conflicts properly with other sources
    //   introduce a universal conflict resolution pattern?
    const task_updated = moment(task.updated).unix()
    // TODO resolve conflicts on text fields
    record.title = task.title
    record.content = this.getContent(task)
    // add to the gtasks id map
    record.gtasks_ids = record.gtasks_ids || {}
    record.gtasks_ids[task.id] = this.list.id
    if (task_updated <= record.updated) {
      // record.updated = task_updated
      // TODO check resolve conflict? since the last sync
      return false
    }
    record.updated = task_updated
    // TODO notes
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
