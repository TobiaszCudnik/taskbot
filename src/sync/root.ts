import { machine } from 'asyncmachine'
import { Semaphore } from 'await-semaphore'
import 'colors'
import * as debug from 'debug'
import * as delay from 'delay'
import * as diff from 'diff'
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
import Logger from '../app/logger'
import { sync_writer_state, SyncWriter } from './writer'
import * as _ from 'lodash'

// TODO move to utils.ts
const SEC = 1000

export const sync_state: IJSONStates = {
  ...sync_writer_state,

  SubsInited: {
    require: ['ConfigSet', 'DBReady'],
    auto: true,
    after: ['DBReady']
  },
  SubsReady: { require: ['SubsInited'], auto: true },
  Ready: {
    auto: true,
    require: ['ConfigSet', 'SubsReady', 'Enabled'],
    drop: ['Initializing'],
    add: ['Reading']
  },
  DBReady: { auto: true },
  Exception: { multi: true, drop: ['Reading', 'Writing'] },
  HeartBeat: {},
  Scheduled: {}
}

export type DB = LokiCollection<DBRecord>

/**
 * Local DB record format.
 */
export interface DBRecord {
  gmail_id?: DBRecordID
  title: string
  content: string
  updated: number
  parent?: DBRecordID
  labels: { [index: string]: DBRecordLabel }
  // different task ids per list
  gtasks_ids?: { [task_id: string]: string }
  // marks the record for deletion
  to_delete?: boolean
  // TODO maybe store as gmail_lists[id] = boolean instead?
  gmail_orphan?: boolean
}

export type DBRecordID = string

export interface DBRecordLabel {
  // time
  updated: number
  // added or removed
  active: boolean
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
  // seconds
  // TODO to the config
  write_timeout = 2 * 60
  // seconds
  heartbeat_freq = 10
  restarts_count = 0

  network_errors = ['EADDRNOTAVAIL', 'ETIMEDOUT']

  constructor(
    config: IConfig,
    // assigned in /sync/reader.ts
    logger: Logger,
    public connections: Connections
  ) {
    super(config, logger)
    const username = config.google.username
    this.log(
      `Starting the sync service for user ${config.user.id}: ${
        config.google.username
      }`
    )
    connections.addUser(username)
    // HeartBeat scheduler
    setInterval(() => {
      this.state.add('HeartBeat')
    }, this.heartbeat_freq * SEC)
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
      sync.state.drop('Restarted')
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

  // TODO react on specific exception types
  async Exception_state(err: Error) {
    this.log_error('ERROR: %O', err)
    this.exceptions.push(moment().unix())

    // Exception is a multi state, handle one at-a-time
    if (this.state.from().includes('Exception')) return

    // Restart the network in case of a network error
    // TODO type the err (http request, google api request)
    // @ts-ignore
    if (err.code && this.network_errors.includes(err.code)) {
      this.connections.restartNetwork()
    }

    this.logStates('Before restart')
    this.state.add('Restarting', 'Network error')
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
    this.state.add('Reading')
  }

  DBReady_state() {
    this.db = new Loki('gtd-bot')
    this.data = this.db.getCollection('todos') || this.db.addCollection('todos')
    this.data.toString = function() {
      return this.data
        .map((r: DBRecord) => {
          let ret = '- ' + r.title
          const snippet = r.content.replace(/\n/g, '')
          ret += snippet ? ` (${snippet})\n  ` : '\n  '
          ret += Object.entries(r.labels)
            .filter(([name, data]) => {
              return data.active
            })
            .map(([name, data]) => {
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

  ReadingDone_state() {
    super.ReadingDone_state()
    this.merge()
    this.log_verbose(`DB read in ${this.last_read_time.asSeconds()}sec`)
    if (debug.enabled('db-diffs')) {
      this.printDBDiffs()
    }
    this.state.add('Writing')
  }

  WritingDone_state() {
    super.WritingDone_state()
    // remove records pending for removal from the DB
    this.root.data
      .chain()
      .find({ to_delete: true })
      .remove()
    // TODO show how many sources were actually synced
    this.log(
      `SYNC DONE:\nRead: ${this.last_read_time.asSeconds()}sec\n` +
        `Write: ${this.last_write_time.asSeconds()}sec`
    )
    this.state.add('Scheduled', this.config.sync_frequency)
  }

  // ----- -----
  // Methods
  // ----- -----

  getState() {
    return machine(sync_state).id('root')
  }

  logStates(msg?: string, include_inactive = false) {
    if (msg) {
      this.log_verbose(msg)
    }
    let states = ''
    for (const machine of this.getMachines()) {
      states += machine.statesToString(include_inactive)
    }
    this.log_verbose(states)
  }

  // Returns true in case of more than 100 exceptions during the last 10 minutes
  isExceptionFlood() {
    const min_range = moment()
      .subtract(10, 'minutes')
      .unix()
    const index = sortedIndex(this.exceptions, min_range)
    return this.exceptions.length - index > 100
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

  // Shortcuts record's labels as text, omitting the ones defined in the list's
  // config
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
    for (const def of this.config.labels) {
      if (
        (def.name && def.prefix + def.name == label) ||
        (!def.name && label.startsWith(def.prefix))
      ) {
        return def
      }
    }
  }

  // TODO call.update() on all the changed records (to rebuild the indexes?)
  //   do it in batch and only here
  merge() {
    let changes,
      c = 0
    const MAX = 10
    do {
      changes = this.subs_flat.reduce((a, r) => {
        const changes = r.merge()
        if (changes) {
          a.push(...changes)
        }
        return a
      }, [])
      if (changes.length) {
        this.log('changes: %o', changes)
      }
    } while (changes.length && ++c < MAX)
    if (c == MAX) {
      this.log_error(`MERGE LIMIT EXCEEDED`)
    }
    if (c) {
      this.log(`MERGED after ${c} round(s)`)
    }
    return []
  }

  printDBDiffs() {
    const db = this.data.toString() + '\n'
    const gmail_sync = this.subs.google.subs.gmail
    const gmail = gmail_sync.subs.lists.map(l => l.toString()).join('\n') + '\n'
    const gtasks_sync = this.subs.google.subs.tasks
    const gtasks =
      gtasks_sync.subs.lists.map(l => l.toString()).join('\n') + '\n'
    const dbs = [
      [db, this.last_db],
      [gmail, this.last_gmail],
      [gtasks, this.last_gtasks]
    ]
    for (const [current, previous] of dbs) {
      const db_diff = this.getDBDiff(current, previous)
      if (!db_diff) continue
      this.log_verbose(db_diff)
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
