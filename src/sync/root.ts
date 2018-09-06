import * as assert from 'assert'
import { machine } from 'asyncmachine'
import { TAbortFunction } from 'asyncmachine/types'
import { Semaphore } from 'await-semaphore'
import 'colors'
import * as debug from 'debug'
import * as delay from 'delay'
import * as diff from 'diff'
import * as clone from 'deepcopy'
import * as regexEscape from 'escape-string-regexp'
import * as http from 'http'
import { sortedIndex, reverse } from 'lodash'
import * as Loki from 'lokijs'
import * as moment from 'moment'
import { promisifyArray } from 'typed-promisify-tob'
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
} from '../../typings/machines/sync/root'
import Connections from '../app/connections'
import GoogleSync from '../google/sync'
import { IConfig, ILabelDefinition, IListConfig } from '../types'
import GC from './gc'
import LabelFilterSync from './label-filter'
import Logger, { log_fn } from '../app/logger'
import { SyncReader, sync_reader_state } from './reader'
import { SyncWriter, sync_writer_state } from './writer'
import * as _ from 'lodash'
import { TStates as TReaderStates } from '../../typings/machines/sync/reader'
import * as merge from 'deepmerge'

// TODO move to utils.ts
const SEC = 1000

export const sync_state: IJSONStates = {
  ...sync_writer_state,

  // extend writer
  Writing: merge(sync_writer_state.Writing, {
    drop: ['SyncDone']
  }),
  WritingDone: merge(sync_writer_state.WritingDone, {
    drop: ['SyncDone']
  }),

  Reading: merge(sync_writer_state.Reading, {
    drop: ['SyncDone']
  }),
  ReadingDone: merge(sync_writer_state.ReadingDone, {
    drop: ['SyncDone']
  }),

  // implement reader
  SubsInited: {
    require: ['ConfigSet', 'DBReady'],
    auto: true,
    after: ['DBReady']
  },
  SubsReady: {
    require: ['SubsInited'],
    auto: true
  },
  Ready: merge(sync_reader_state.Ready, {
    require: ['ConfigSet', 'SubsReady', 'Enabled'],
    add: ['Reading']
  }),
  DBReady: { auto: true },

  // syncing
  HeartBeat: {
    require: ['Enabled']
  },
  Scheduled: {
    drop: ['SyncDone']
  },
  Syncing: {
    add: ['Reading'],
    drop: ['SyncDone']
  },
  SyncDone: {
    drop: ['Syncing', 'Reading', 'Writing', 'ReadingDone', 'WritingDone']
  },
  MergeLimitExceeded: {},

  // extend asyncmachine
  Exception: {
    multi: true,
    drop: ['Reading', 'Writing']
  }
}

export type DB = Loki.Collection<DBRecord>
// TODO
// export enum GTasksStatus {
//   COMPLETED,
//   HIDDEN,
//   DELETED,
//   MISSING
// }

/**
 * Local DB record format.
 */
export interface DBRecord {
  gmail_id?: DBRecordID
  title: string
  content: string
  updated: {
    // must be timestamp
    latest: number | null
    gtasks: number | null
    // history ID
    gmail_hid: number | null
  }
  parent?: DBRecordID
  labels: { [name: string]: DBRecordLabel }
  // different task ids per list
  gtasks_ids?: { [task_id: string]: string }
  // TODO
  // gtasks_ids?: {
  //   [task_id: string]: {
  //     list_id: string
  //     status: GTasksStatus
  //     updated: string
  //   }
  // }
  // marks the record for deletion
  to_delete?: boolean
  gtasks_moving?: boolean
  gtasks_uncompleted?: boolean
  // TODO maybe store as gmail_lists[id] = boolean instead?
  gmail_orphan?: boolean
  gtasks_hidden_completed?: boolean
}

export type DBRecordID = string

export interface DBRecordLabel {
  // time
  updated: number
  // added or removed
  active: boolean
}

export type TStatsUser = {
  // client
  client_last_read: string
  // node
  last_sync_gmail: string
  last_sync_gtasks: string
  ongoing_tasks: number
  total_tasks: number
  completed_tasks: number
}

export default class RootSync extends SyncWriter<IConfig, TStates, IBind, IEmit>
// TODO type the machine types
// implements ITransitions
{
  state: AsyncMachine<TStates, IBind, IEmit>
  subs: { google: GoogleSync; label_filters: LabelFilterSync[] }
  db: Loki
  data: DB

  exceptions: number[] = []
  exceptions_gc = new GC('gtasks', this.exceptions)
  get last_exception(): number | null {
    return this.exceptions[this.exceptions.length - 1] || null
  }

  // TODO debug only
  last_db: string
  last_gmail: string
  last_gtasks: string

  logger: Logger

  // seconds
  // TODO to the config
  read_timeout = 2 * 60
  // TODO react on specific exception types
  // TODO to the config
  write_timeout = 2 * 60
  // seconds
  heartbeat_freq = 10
  restarts_count = 0
  last_sync_reads = 0
  network_errors = ['EADDRNOTAVAIL', 'ETIMEDOUT']
  // seconds
  merge_tries: number

  log_db_diff: log_fn

  constructor(
    config: IConfig,
    // assigned in /sync/reader.ts
    logger: Logger,
    public connections: Connections
  ) {
    super(config, logger)
    this.log(
      `Starting the sync service for user ${config.user.id}: ${
        config.google.username
      }`
    )
    connections.addUser(config.user.id)
    // HeartBeat scheduler
    const hb = () => {
      this.state.add('HeartBeat')
      setTimeout(hb, this.heartbeat_freq * SEC)
    }
    setTimeout(hb, this.heartbeat_freq * SEC)
  }

  // ----- -----
  // Transitions
  // ----- -----

  HeartBeat_state() {
    const now = moment().unix()
    const is = state => this.state.is(state)
    if (is('Restarting')) {
      // TODO timeout
      this.state.drop('HeartBeat')
      return
    }
    // TODO this can leak
    const restart = this.state.addByListener('Restarting')
    if (this.state.not(['Reading', 'Writing', 'Scheduled'])) {
      this.logStates('Before restart')
      restart('None of the action states is set')
    } else if (
      is('Reading') &&
      this.last_read_start.unix() + this.read_timeout < now
    ) {
      this.logStates('Before restart')
      restart('Reading timeout')
    } else if (
      is('Writing') &&
      this.last_write_start.unix() + this.write_timeout < now
    ) {
      this.logStates('Before restart')
      restart('Writing timeout')
    }
    this.state.drop('HeartBeat')
  }

  async Restarting_state(reason: string) {
    this.restarts_count++
    this.log(`Restarting, reason - '${reason}'`)
    this.state.drop('Exception')
  }

  async Restarted_state() {
    this.log('Restart completed')
    // drop the state manually everywhere
    const sub_syncs = [this, ...this.subs_all]
    this.log_verbose('Dropping Restarted everywhere')
    for (const sync of reverse(sub_syncs)) {
      // @ts-ignore TODO
      sync.state.drop('Restarted')
      // @ts-ignore TODO
      await sync.state.whenNot('Restarted')
    }
    this.logStates('After restart')

    // pick the correct delay
    const delay = this.isExceptionFlood()
      ? this.config.exception_flood_delay
      : this.config.exception_delay

    this.state.add('Scheduled', delay)
  }

  Exception_enter() {
    return true
  }

  // TODO support ETIMEDOUT
  async Exception_state(err: Error) {
    this.log_error('ERROR: %O', err, { user_id: this.config.user.id })
    this.exceptions.push(moment().unix())

    // TODO merge with Restarted_state()
    if (this.isExceptionFlood()) {
      this.state.drop('Enabled')
      await delay(this.config.exception_flood_delay)
      this.state.add('Enabled')
    }

    // Exception is a multi state, handle one at-a-time
    // TODO react to "not during an (own) transition"
    // if (this.state.from().includes('Exception')) return

    this.logStates('Before restart')
    this.state.add('Restarting', 'Exception')
  }

  async Scheduled_state(wait: number) {
    const abort = this.state.getAbort('Scheduled')
    this.log_verbose(`Waiting for ${wait}sec...`)
    await delay(wait * SEC)
    if (abort()) {
      this.log('Scheduled aborted')
      return
    }
    // start syncing again
    this.state.drop(['Exception', 'Scheduled'])
    this.log_verbose('Scheduled adds Reading')
    this.state.add(['Syncing'])
  }

  DBReady_state() {
    this.db = new Loki('gtd-bot')
    this.data = this.db.getCollection('todos') || this.db.addCollection('todos')
    this.data.toString = function() {
      return this.data
        .map((r: DBRecord) => {
          let ret = '- ' + r.title
          const snippet = r.content.replace(/\n/g, '')
          ret += snippet ? `  (${snippet})\n  ` : '\n  '
          ret += r.to_delete ? `  TO DELETE\n` : ''
          ret += Object.entries(r.labels)
            .filter(([name, data]) => {
              return data.active
            })
            .map(([name]) => {
              return name
            })
            .join(', ')
          return ret
        })
        .join('\n')
    }
  }

  SubsInited_state() {
    this.subs = {
      google: new GoogleSync(this),
      label_filters: this.config.label_filters.map(
        c => new LabelFilterSync(c, this)
      )
    }
    this.bindToSubs()
  }

  async ReadingDone_state() {
    super.ReadingDone_state()
    const abort = this.state.getAbort('ReadingDone')
    await this.merge(abort)
    if (abort()) return
    // if any of the readers is marked as Dirty by other ones, re-read
    const dirty = this.dirtyReaders()
    // TODO `time` to the config
    if (dirty.length && this.last_read_tries <= 10) {
      this.log_verbose(`Re-reading because Dirty: ${dirty.join(', ')}`)
      // forcefully drop the done state because Reading is negotiable
      await this.subs_all.map(async sync => {
        sync.state.drop('ReadingDone')
        await sync.state.whenNot('ReadingDone')
      })
      return this.state.add('Reading')
      // TODO `time` to the config
    } else if (this.last_read_tries > 10) {
      this.log_error('Max re-read exceeded')
      this.state.add('MaxReadsExceeded')
    }
    // log
    this.log_verbose(`DB read in ${this.last_read_time.asSeconds()}sec`)
    if (debug.enabled('db-verbose')) {
      this.printDBDiffs()
    }
    // go to the next step
    this.state.add('Writing')
  }

  // TODO abort function
  async WritingDone_state() {
    await super.WritingDone_state()
    // if any of the writers is marked as Dirty by other ones, re-read
    const dirty = this.dirtyWriters()
    // TODO `time` to the config
    if (dirty.length && this.last_write_tries <= 10) {
      this.log(`Re-writing because of Dirty: ${dirty.join(', ')}`)
      // forcefully drop the done state because Writing is negotiable
      await this.subs_all_writers.map(async sync => {
        sync.state.drop('WritingDone')
        await sync.state.whenNot('WritingDone')
      })
      this.state.add('Writing')
      // TODO `time` to the config
    } else if (this.last_write_tries > 10) {
      this.log_error('Max re-writes exceeded')
      this.state.add('MaxWritesExceeded')
      // } else if (this.dirtyReaders().length) {
      //   this.log('Re-syncing because of Dirty: ' + this.dirtyReaders().join(', '))
      //   // Re-read in case of a change. Early reads help with merged
      //   this.state.drop('ReadingDone')
      //   this.state.add('Reading')
    } else {
      this.state.add('SyncDone')
    }
  }

  dirtyWriters() {
    return this.subs_all_writers
      .filter(s => s.state.is('Dirty') && s.state.not('QuotaExceeded'))
      .map(s => s.state.id())
  }

  // TODO show how many sources were actually synced
  SyncDone_state() {
    // remove records pending for removal from the DB
    for (const record of this.data.data) {
      // delete merge flags
      delete record.gtasks_uncompleted
      delete record.gtasks_moving
      delete record.gtasks_hidden_completed
    }
    this.data
      .chain()
      .find({ to_delete: true })
      .remove()
    this.log(
      `SYNC DONE (${this.last_sync_reads} reads):\n` +
        `Usage: T/${this.subs.google.subs.tasks.user_quota}\n` +
        `Read: ${this.last_read_time.asSeconds()}sec\n` +
        `Write: ${this.last_write_time.asSeconds()}sec`
    )
    this.last_sync_reads = 0
    this.state.add('Scheduled', this.config.sync_frequency)
    const completed_tasks = this.countTasks(r =>
      Boolean(this.recordHasLabel(r, '!S/Finished'))
    )
    const ongoing_tasks = this.countTasks(
      r => !this.recordHasLabel(r, '!S/Finished')
    )
    this.emitStats({
      ongoing_tasks,
      completed_tasks,
      total_tasks: completed_tasks + ongoing_tasks
    })
  }

  countTasks(query: (record: DBRecord) => boolean) {
    return this.data.where(query).length
  }

  MergeLimitExceeded_state() {
    this.state.drop('MergeLimitExceeded')
  }

  // ----- -----
  // Methods
  // ----- -----

  init(config: IConfig) {
    // shallow copy the config
    this.config = { ...config }
    // parse lazy list configs
    this.config.lists = this.config.lists.map(
      list => (_.isFunction(list) ? list(this.config) : list)
    )
  }

  getState() {
    return machine(sync_state).id('root')
  }

  logStates(msg?: string, include_inactive = false) {
    if (msg) {
      this.log_verbose(msg)
    }
    let states = this.getMachines(include_inactive)
    this.log_verbose(states)
  }

  // Returns true in case of more than 100 exceptions during the last 10 minutes
  isExceptionFlood() {
    // TODO values from the config
    const min_range = moment()
      .subtract(10, 'minutes')
      .unix()
    const index = sortedIndex(this.exceptions, min_range)
    return this.exceptions.length - index > 100
  }

  async emitStats(stats: Partial<TStatsUser>) {
    this.emit('stats', {
      uid: this.config.user.uid,
      stats
    })
  }

  // Extracts labels from text
  getLabelsFromText(
    text: string,
    skip_statuses = false
  ): { text: string; labels: string[] } {
    const labels = new Set<string>()
    for (const label of this.config.labels) {
      // TODO type guards
      const { symbol, name, prefix } = label
      if (!symbol) continue
      if (prefix == '!S/' && skip_statuses) continue
      const query = label.shortcut || '[\\w-\\d]+'
      let matched
      // TODO lack of look behinds, use some magic...
      do {
        matched = false
        text = text.replace(
          new RegExp(`(?:\\s|^)${regexEscape(symbol)}(${query})(?:\\s|$)`, 'g'),
          (m, found) => {
            labels.add(prefix + (name || found))
            matched = true
            return ' '
          }
        )
      } while (matched)
    }
    text = text.trim()
    return { text: text, labels: [...labels] }
  }

  // config
  // TODO skip hidden labels
  getRecordLabelsAsText(record: DBRecord, list_config: IListConfig): string {
    const skip = [
      ...(list_config.enter.add || []),
      ...(list_config.enter.remove || []),
      ...(list_config.exit.add || []),
      ...(list_config.exit.remove || [])
    ]
    let labels = []
    for (const [label, data] of Object.entries(record.labels)) {
      if (!data.active) continue
      if (skip.includes(label)) continue
      // skip status labels completely
      if (/^!S\//.test(label)) continue
      const short = this.labelToShortcut(label)
      if (short && !record.title.includes(short)) {
        labels.push(short)
      }
    }
    labels = _.sortBy(labels)
    return labels.length ? ' ' + labels.join(' ') : ''
  }

  labelToShortcut(label: string): string | null {
    for (const data of this.config.labels) {
      // TODO type guards
      if (!data.symbol) continue
      if (data.prefix + data.name == label) {
        return data.symbol + data.shortcut
      } else if (!data.name && label.startsWith(data.prefix)) {
        return (
          data.symbol +
          label.replace(new RegExp('^' + regexEscape(data.prefix)), '')
        )
      }
    }
    return null
  }

  getLabelDefinition(label: string): ILabelDefinition {
    label = label.toLowerCase()
    for (const def of this.config.labels) {
      if (
        (def.name && (def.prefix + def.name).toLowerCase() == label) ||
        (!def.name && label.startsWith(def.prefix.toLowerCase()))
      ) {
        return def
      }
    }
  }

  /**
   * Result of one writer potentially influences another one (eg gmail ID need
   * to be synced back to google tasks, but both are saved at the same time).
   *
   * @param origin
   * @param record
   */
  markWritersAsDirty(
    origin: SyncReader<any, TReaderStates, any, any>,
    record: DBRecord
  ) {
    const id = origin.state.id(true)
    this.log(`Write change from ${id}, marking related lists as Dirty`)
    // TODO use record to narrow down parent writers
    for (const sync of this.subs_all_writers) {
      if (sync === origin) continue
      // TODO GoogleSync should be a SyncReader?
      if (sync instanceof GoogleSync) continue
      this.log_verbose(`${sync.state.id()} Dirty`)
      sync.state.add('Dirty')
    }
  }

  markListsAsDirty(
    origin: SyncReader<any, TReaderStates, any, any>,
    record: DBRecord
  ) {
    assert(record, 'Record required')
    const id = origin.state.id(true)
    this.log(`Record change from ${id}, marking related lists as Dirty`)
    let lists = this.getListsForRecord(record)
    for (const sync of lists.filter(s => s !== origin)) {
      this.log_verbose(`${sync.state.id()} Dirty`)
      sync.state.add('Dirty')
    }
  }

  /**
   * Returns a number of matching labels.
   *
   * Aliases are considered only if a string label if passed.
   *
   * @param record
   * @param label
   */
  recordHasLabel(record: DBRecord, label: string | RegExp): number {
    let ret = this.checkLabel(record, label)
    // TODO read aliases from the config
    if (label == '!S/Finished') {
      ret = ret || this.checkLabel(record, '!S/Expired')
    } else if (label == '!S/Expired') {
      ret = ret || this.checkLabel(record, '!S/Finished')
    }
    return ret
  }

  private checkLabel(record: DBRecord, match: string | RegExp) {
    let matches = 0
    for (const [label, data] of Object.entries(record.labels)) {
      if (!data.active) continue
      if (match instanceof RegExp && match.test(label)) {
        matches++
      } else if (
        !(match instanceof RegExp) &&
        match.toLowerCase() == label.toLowerCase()
      ) {
        matches++
      }
    }
    return matches
  }

  getListsForRecord(
    record: DBRecord
  ): SyncReader<IListConfig, TReaderStates, any, any>[] {
    assert(record, 'Record required')
    const ret = []
    for (let list of this.subs_all) {
      if (list instanceof SyncWriter) continue
      list = list as SyncReader<IListConfig, TReaderStates, any, any>
      if (!list.config.db_query(record)) continue

      ret.push(list)
    }
    return ret
  }

  // TODO call.update() on all the changed records (to rebuild the indexes?)
  //   do it in batch and only here
  async merge(abort: TAbortFunction): Promise<any[]> {
    this.log_verbose('merge')
    this.merge_tries = 1
    let changes
    // TODO config
    const MAX = 10
    // TODO extract as a label filter
    this.ensureSLabel()
    do {
      changes = await this.subs_flat.reduce(
        async (
          prev: Promise<any[]>,
          reader: SyncReader<any, any, any, any>
        ) => {
          // execute the prev promise
          const ret = await prev
          const changes = await reader.merge(abort)
          if (changes) {
            ret.push(...changes)
          }
          return ret
        },
        Promise.resolve([])
      )
      if (changes.length) {
        this.log('changes: %o', changes)
      }
    } while (changes.length && ++this.merge_tries < MAX && !this.dirtyReaders())
    if (this.merge_tries == MAX) {
      this.log_error(`MERGE LIMIT EXCEEDED (${this.merge_tries})`)
      this.state.add('MergeLimitExceeded')
    } else if (this.merge_tries) {
      this.log(`MERGED after ${this.merge_tries} round(s)`)
    }
    return []
  }

  /**
   * Add !S label to every record
   * // TODO migrate to a label filter
   */
  private ensureSLabel() {
    const no_s = this.data.where(r => !Boolean(this.recordHasLabel(r, '!S')))
    for (const r of no_s) {
      this.log_verbose(`Adding !S label to '${r.title}'`)
      this.modifyLabels(r, { add: ['!S'] })
    }
  }

  // TODO should be an inbound state?
  dirtyReaders() {
    return (
      this.subs_all
        .filter(s => s.state.is('Dirty') && s.state.not('QuotaExceeded'))
        // TODO sth wrong here...
        .filter(s => !(s instanceof SyncWriter))
        .map(s => s.state.id())
    )
  }

  printDBDiffs() {
    this.log_verbose('db-diff')
    const db = this.data.toString() + '\n'
    const gmail_sync = this.subs.google.subs.gmail
    const gmail = gmail_sync.toString()
    const gtasks_sync = this.subs.google.subs.tasks
    const gtasks = gtasks_sync.toString()
    const dbs = [
      [db, this.last_db],
      [gmail, this.last_gmail],
      [gtasks, this.last_gtasks]
    ]
    for (const [current, previous] of dbs) {
      const db_diff = this.getDBDiff(current, previous)
      if (!db_diff) continue
      this.log_db(db_diff)
    }
    this.last_db = db
    this.last_gmail = gmail
    this.last_gtasks = gtasks
  }

  getDBDiff(current, previous) {
    if (!previous) {
      // print the initial version at the start
      return current
    } else if (current != previous) {
      // print the diff in case of a change
      let output = ''
      for (const chunk of diff.diffChars(previous, current)) {
        const color = chunk.added ? 'green' : chunk.removed ? 'red' : 'white'
        output += chunk.value[color]
      }
      return output
    }
  }
}
