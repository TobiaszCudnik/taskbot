import { machine } from 'asyncmachine'
import { Semaphore } from 'await-semaphore'
import 'colors'
import * as debug from 'debug'
import * as delay from 'delay'
import * as diff from 'diff'
import * as regexEscape from 'escape-string-regexp'
import * as http from 'http'
import { sortedIndex } from 'lodash'
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
import GoogleSync from '../google/sync'
import { IConfig, ILabelDefinition, IListConfig } from '../types'
import GC from './gc'
import LabelFilterSync from './label-filter'
import Logger from '../logger'
import { sync_writer_state, SyncWriter } from './writer'

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
  Exception: { drop: ['Reading', 'Writing'] },
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
}

export type DBRecordID = string

export interface DBRecordLabel {
  // time
  updated: number
  // added or removed
  active: boolean
}

export default class RootSync extends SyncWriter<IConfig, TStates, IBind, IEmit>
  implements ITransitions {
  state: AsyncMachine<TStates, IBind, IEmit>
  subs: { google: GoogleSync; label_filters: LabelFilterSync[] }

  max_active_requests = 5
  semaphore = new Semaphore(this.max_active_requests)
  active_requests = 0
  executed_requests: number

  db: Loki
  data: DB
  // @ts-ignore
  log_requests = this.logger.createLogger('requests', 'verbose')

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
  read_timeout = 2 * 60
  // seconds
  write_timeout = 2 * 60
  // seconds
  heartbeat_freq = 60
  restarts_count = 0

  constructor(config: IConfig) {
    super(config)
    this.log('Starting the sync service...')
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
    // TODO this can leak
    const restart = this.state.addByListener('RestartingNetwork')
    if (this.state.not(['Reading', 'Writing', 'Scheduled'])) {
      restart('None of the action states is set')
    } else if (
      is('Reading') &&
      this.last_read_start.unix() + this.read_timeout < now
    ) {
      restart('Reading timeout')
    } else if (
      is('Writing') &&
      this.last_write_start.unix() + this.write_timeout < now
    ) {
      restart('Writing timeout')
    }
    this.state.drop('HeartBeat')
  }

  // TODO kill all the active requests
  async RestartingNetwork_state(reason: string) {
    this.restarts_count++
    this.semaphore = new Semaphore(this.max_active_requests)
    this.log(`HeartBeat, restarting because of - '${reason}'`)
    this.logStates('Before restart')
    this.state.drop(['Exception', 'Reading', 'Writing'])
    await this.state.whenNot(['Exception', 'Reading', 'Writing'])
    this.logStates('After drop')
    this.state.add('Reading')
    await this.state.when('Reading')
    this.logStates('After restart')
  }

  Exception_enter() {
    return true
  }

  // TODO react on specific exception types
  async Exception_state(err: Error) {
    this.log_error('ERROR: %O', err)
    this.exceptions.push(moment().unix())

    // pick the correct delay
    const delay = this.isExceptionFlood()
      ? this.config.exception_flood_delay
      : this.config.exception_delay

    this.state.add('Scheduled', delay)
  }

  async Scheduled_state(wait: number) {
    const abort = this.state.getAbort('Scheduled')
    this.log(`Waiting for ${wait}sec...`)
    await delay(wait * SEC)
    if (abort()) return
    // start syncing again
    this.state.drop(['Exception', 'Scheduled'])
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
    this.log(`DB read in ${this.last_read_time.asSeconds()}sec`)
    if (debug.enabled('db-diffs')) {
      this.printDBDiffs()
    }
    this.state.add('Writing')
  }

  WritingDone_state() {
    super.WritingDone_state()
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

  // TODO take abort() as the second param
  async req<A, T, T2>(
    method: (arg: A, cb: (err: any, res: T, res2: T2) => void) => void,
    params: A,
    abort: (() => boolean) | null | undefined,
    returnArray: true,
    options?: object
  ): Promise<[T, T2] | null>
  async req<A, T>(
    method: (arg: A, cb: (err: any, res: T) => void) => void,
    params: A,
    abort: (() => boolean) | null | undefined,
    returnArray: false,
    options?: object
  ): Promise<T | null>
  async req<A, T>(
    method: (arg: A, cb: (err: any, res: T) => void) => void,
    params: A,
    abort: (() => boolean) | null | undefined,
    return_array: boolean,
    options?: object
  ): Promise<any> {
    this.pending_requests++
    let release = await this.semaphore.acquire()
    this.pending_requests--
    if (abort && abort()) {
      this.log_verbose('Request aborted by the abort() function')
      release()
      return null
    }
    this.active_requests++

    if (!params) {
      params = {} as A
    }
    this.log_requests(`REQUEST (${this.active_requests} active):\n%O`, {
      // @ts-ignore
      ...params,
      auth: 'REMOVED'
    })
    // TODO googleapis specific code should be in google/sync.ts
    let ret
    try {
      // @ts-ignore
      ret = await promisifyArray(method)(params, options)
      const res: http.IncomingMessage = ret[1]
      const was2xx = res && res.statusCode.toString().match(/^2/)
      const wasNoContent = res && res.statusMessage == 'No Content'
      if (was2xx && ret[0] === undefined && !wasNoContent) {
        throw Error('Empty response on 2xx')
      } else if (ret[1] === undefined && ret[0] === undefined) {
        throw Error('Response and body empty')
      }
    } catch (e) {
      // attach the request body
      e.params = {
        // @ts-ignore
        ...params,
        auth: 'REMOVED'
      }
      // TODO include the method name
      throw e
    } finally {
      release()
      this.active_requests--
      this.executed_requests++
    }
    this.log_verbose(`request finished (${this.pending_requests} pending)`)

    return return_array ? ret : ret[0]
  }
  pending_requests = 0

  // Extracts labels from text
  getLabelsFromText(text: string): { text: string; labels: string[] } {
    const labels = new Set<string>()
    for (const label of this.config.labels) {
      // TODO type guards
      const { symbol, name, prefix } = label
      if (!symbol) continue
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
      const short = this.labelToShortcut(label)
      if (short && !record.title.includes(short)) {
        labels.push(short)
      }
    }
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
      this.log(`MERGE LIMIT EXCEEDED`)
    }
    this.log(`SYNCED after ${c} round(s)`)
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
