import AsyncMachine, { machine, PipeFlags } from 'asyncmachine'
import { TAbortFunction } from 'asyncmachine/types'
import * as debug from 'debug'
import * as clone from 'deepcopy'
import * as diff from 'diff'
import * as moment from 'moment-timezone'
import { inspect } from 'util'
// Machine types
import {
  IBind,
  IEmit,
  IJSONStates,
  IState,
  TStates,
  IBindBase,
  IEmitBase,
  ITransitions
} from '../../typings/machines/sync/reader'
import { TModifyLabels } from '../types'
import { machineLogToDebug } from '../utils'
import Logger, { log_fn } from '../app/logger'
import RootSync, { DBRecord } from './root'

export { IState }
export const sync_reader_state: IJSONStates = {
  Enabled: {},

  Initializing: { require: ['Enabled'] },
  // TODO split to ReadyForReading, ReadyForWriting
  Ready: {
    auto: true,
    drop: ['Initializing']
  },
  // optional
  ConfigSet: {},
  SubsInited: {},
  SubsReady: {},

  Reading: {
    after: ['Syncing'],
    drop: ['ReadingDone'],
    require: ['Enabled', 'Ready']
  },
  ReadingDone: {
    drop: ['Reading']
  },

  // controller by the RootSync
  Syncing: { drop: ['SyncDone'] },
  SyncDone: { drop: ['Syncing'] },

  Cached: {},
  Dirty: { drop: ['Cached'] },

  QuotaExceeded: {},

  Restarting: {
    drop: ['Restarted', 'Reading', 'ReadingDone']
  },
  Restarted: {
    drop: ['Restarting']
  },

  MaxReadsExceeded: {}
}
export type TSyncState = AsyncMachine<TStates, IBind, IEmit>

export abstract class SyncReader<GConfig, GStates, GBind, GEmit>
// TODO type the machine types
// implements ITransitions
{
  state: AsyncMachine<any, any, any>
  get state_reader(): TSyncState {
    return this.state
  }
  // config: IConfig | null
  config: GConfig
  sub_states_inbound: [GStates | TStates, GStates | TStates, PipeFlags][] = [
    ['ReadingDone', 'ReadingDone', PipeFlags.FINAL],
    ['Ready', 'SubsReady', PipeFlags.FINAL],
    ['Restarted', 'Restarted', PipeFlags.FINAL]
  ]
  sub_states_outbound: [GStates | TStates, GStates | TStates, PipeFlags][] = [
    ['Reading', 'Reading', PipeFlags.NEGOTIATION_ENTER | PipeFlags.FINAL_EXIT],
    ['Enabled', 'Enabled', PipeFlags.NEGOTIATION_ENTER | PipeFlags.FINAL_EXIT],
    ['Restarting', 'Restarting', PipeFlags.FINAL],
    ['Syncing', 'Syncing', PipeFlags.FINAL],
    ['SyncDone', 'SyncDone', PipeFlags.FINAL]
  ]
  subs: {
    [index: string]: any
    // | Sync<any, TStates, IBind, IEmit>
    // | Sync<any, TStates, IBind, IEmit>[]
  } = {}
  root: RootSync

  last_read_end: moment.Moment
  last_read_start: moment.Moment
  last_read_time: moment.Duration
  last_read_tries = 0

  log: log_fn
  log_error: log_fn
  log_verbose: log_fn
  log_db: log_fn

  quota_error: string | null
  quota_next_sync: number | null

  // TODO google specific
  // TODO use TimeArray, calculate the daily quota
  get daily_quota_ok() {
    const check =
      !this.quota_next_sync || this.quota_next_sync < moment().unix()
    // clean up
    if (check && this.quota_next_sync) {
      this.state.drop('QuotaExceeded')
      this.quota_next_sync = null
    }
    return check
  }

  // TODO use SyncReader<unknown,
  get subs_flat(): SyncReader<any, TStates, IBind, IEmit>[] {
    const ret = []
    for (const sub of Object.values(this.subs)) {
      if (Array.isArray(sub)) {
        ret.push(...sub)
      } else {
        ret.push(sub)
      }
    }
    return ret
  }

  // TODO use SyncReader<unknown,
  get subs_all(): SyncReader<any, TStates, IBind, IEmit>[] {
    const ret = []
    for (const sub of this.subs_flat) {
      ret.push(sub, ...sub.subs_all)
    }
    return ret
  }

  // TODO fix the params
  constructor(config: GConfig, root?: RootSync | Logger) {
    this.init(config)
    // required for this.initLoggers()
    if (root instanceof Logger) {
      this.root = <RootSync>(<any>this)
      this.root.logger = root
    } else {
      this.root = root
    }
    this.state = this.getState()
    this.initLoggers()
    this.state.setTarget(this)
    this.state_reader.add('Initializing')
    if (process.env['DEBUG_AM'] || global.am_network) {
      machineLogToDebug(
        this.root.logger,
        this.state_reader,
        this.root.config.user.id
      )
      if (global.am_network) {
        global.am_network.addMachine(this.state_reader)
      }
    }
    // set config on the next tick
    this.state_reader.addNext('ConfigSet', this.config)
  }

  init(config: GConfig) {
    this.config = config
  }

  // ----- -----
  // Transitions
  // ----- -----

  Restarting_state(reason?: string) {
    this.state.add('Restarted')
  }

  Restarted_enter() {
    return this.subs_flat.every(sync => sync.state.is('Restarted'))
  }

  // TODO extract google specific code to GoogleAPIMixin
  Exception_enter(err, ...rest): boolean {
    this.log_error('ERROR: %O', err)
    if (err && err.errors) {
      let quota_err = false
      for (const error of err.errors) {
        if (error.domain == 'usageLimits') {
          this.state.add('QuotaExceeded', error.reason)
          quota_err = true
        }
      }
      if (quota_err) {
        return false
      }
    }
    if (this.root) {
      this.root.state.add('Exception', err, ...rest)
      return false
    }
  }

  // TODO extract google specific code to GoogleAPIMixin
  QuotaExceeded_state(reason: string) {
    this.quota_error = reason
    switch (reason) {
      case 'dailyLimitExceeded':
        // delay syncing per API endpoint until midnight PDF
        const next_sync = moment()
          .tz('America/Los_Angeles')
          .add(1, 'day')
          .startOf('day')
          .tz(moment.tz.guess())
          .unix()
        // TODO extract google specific code to GoogleAPIMixin
        // @ts-ignore
        if (this.gtasks) {
          // @ts-ignore
          this.gtasks.quota_next_sync = next_sync
          // @ts-ignore
        } else if (this.gmail) {
          // @ts-ignore
          this.gmail.quota_next_sync = next_sync
        } else {
          this.quota_next_sync = next_sync
        }
        break
    }
  }

  Enabled_state() {
    if (!this.state.is('Ready')) {
      this.state.add('Initializing')
    }
  }

  ConfigSet_state(config: GConfig) {
    this.config = config
  }

  SubsReady_enter() {
    return this.subs_flat.every(sync => sync.state.is('Ready'))
  }

  Syncing_state() {
    this.last_read_tries = 0
  }

  Reading_state() {
    this.last_read_start = moment()
  }

  ReadingDone_enter() {
    return this.subs_flat.every(sync => sync.state.is('ReadingDone'))
  }

  ReadingDone_state() {
    this.last_read_end = moment()
    this.last_read_time = moment.duration(
      this.last_read_end.diff(this.last_read_start)
    )
  }

  MaxReadsExceeded_state() {
    this.state.drop('MaxReadsExceeded')
  }

  // ----- -----
  // Methods
  // ----- -----

  getState() {
    return machine(sync_reader_state).id('SyncReader')
  }

  async merge(abort: TAbortFunction): Promise<any[]> {
    this.log_verbose('merge')
    let ret = []
    for (const sub of this.subs_flat) {
      const sub_ret = await sub.merge(abort)
      if (sub_ret) {
        ret.push(...sub_ret)
      }
      if (abort()) return
    }
    return ret
  }

  bindToSubs() {
    for (const sync of this.subs_flat) {
      // inbound
      for (const [source, target, flags] of this.sub_states_inbound) {
        sync.state.pipe(source, this.state, target, flags)
      }
      // outbound
      for (const [source, target, flags] of this.sub_states_outbound) {
        this.state.pipe(source, sync.state, target, flags)
      }
    }
  }

  applyLabels(record: DBRecord, labels: TModifyLabels) {
    record.labels = record.labels || {}
    for (const label of labels.remove || []) {
      // dont remove labels which are about to be added
      if (labels.add && labels.add.includes(label)) continue
      // dont remove labels which are aliases of those to be added
      const def = this.root.getLabelDefinition(label)
      if (def.alias) {
        let skip = false
        for (const alias of def.alias) {
          if (labels.add && labels.add.includes(alias)) {
            skip = true
            break
          }
        }
        if (skip) continue
      }
      // update the time only when something changes
      if (record.labels[label] && !record.labels[label].active) continue
      record.labels[label] = {
        active: false,
        updated: record.updated.latest
      }
    }
    for (const label of labels.add || []) {
      // add only labels who's aliases arent set
      if (this.root.recordHasLabel(record, label)) continue
      // update the time only when something changes
      if (record.labels[label] && record.labels[label].active) continue
      record.labels[label] = {
        active: true,
        updated: record.updated.latest
      }
    }
  }

  // TODO output to the logger, loose ID in the msg
  printRecordDiff(before, record, title = '') {
    if (!debug.enabled('db-verbose')) {
      return
    }
    if (JSON.stringify(before) == JSON.stringify(record)) {
      return
    }
    this.log_verbose('record-diff')
    delete before.$loki
    delete before.meta
    const after = clone(record)
    delete after.$loki
    delete after.meta
    let msg = 'Record diff'
    if (title) {
      msg += ` '${title}'`
    }
    msg += ` from '${this.state.id()}'`
    this.log_db(msg)
    const text_diff = diff.diffChars(
      inspect(before, false, 3),
      inspect(after, false, 3)
    )
    msg = ''
    for (const chunk of text_diff) {
      const color = chunk.added ? 'green' : chunk.removed ? 'red' : 'white'
      msg += chunk.value[color]
    }
    this.log_db(msg)
  }

  getMachines(inactive_states = true): string {
    const machines = [this.state]
    machines.push(...this.subs_all.map(sync => sync.state))
    return machines.map(m => m.statesToString(inactive_states)).join('\n')
  }

  // TODO extract to a mixin
  initLoggers() {
    // TODO https://github.com/googleapis/nodejs-logging-winston/issues/85
    // const name = {
    //   name: this.state.id(true),
    //   user_id: this.root.config.user.id
    // }
    const name = `${this.state.id(true)}:${this.root.config.user.id}`
    this.log = this.root.logger.createLogger(name)
    this.log_verbose = this.root.logger.createLogger(name, 'verbose')
    this.log_error = this.root.logger.createLogger(name, 'error')
    this.log_db = this.root.logger.createLogger('db', 'verbose')
  }
}
