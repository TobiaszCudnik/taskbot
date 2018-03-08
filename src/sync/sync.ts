import AsyncMachine, { machine } from 'asyncmachine'
import debug from 'debug'
import * as clone from 'deepcopy'
import * as diff from 'diff'
import * as moment from 'moment'
import { inspect } from 'util'
// Machine types
import {
  IBind as IBindSync,
  IJSONStates as IJSONStatesSync,
  IState as IStateSync,
  TStates as TStatesSync,
  IBindBase,
  IEmitBase
} from '../../typings/machines/sync/sync'
import {
  IBind as IBindWriter,
  IJSONStates as IJSONStatesWriter,
  IState as IStateWriter,
  TStates as TStatesWriter
} from '../../typings/machines/sync/sync-writer'
import { machineLogToDebug } from '../utils'
import Logger, { log_fn } from './logger'
import RootSync, { DBRecord } from './root'

export { IStateSync, IStateWriter }

export const sync_state: IJSONStatesSync = {
  Enabled: {},

  Initializing: { require: ['Enabled'] },
  // TODO split to ReadyForReading, ReadyForWriting
  Ready: { auto: true, drop: ['Initializing'] },
  // optional
  ConfigSet: {},
  SubsReady: {},
  SubsInited: {},

  Reading: {
    drop: ['ReadingDone'],
    require: ['Enabled', 'Ready']
  },
  ReadingDone: {
    drop: ['Reading']
  }
}

export const sync_writer_state: IJSONStatesWriter = {
  // inherit the SyncState
  ...sync_state,

  Writing: {
    drop: ['WritingDone', 'Reading', 'ReadingDone'],
    require: ['Enabled', 'Ready']
  },
  WritingDone: {
    drop: ['Writing', 'Reading', 'ReadingDone']
  },

  Reading: {
    drop: ['ReadingDone', 'Writing', 'WritingDone'],
    require: ['Enabled', 'Ready']
  },
  ReadingDone: {
    drop: ['Reading', 'Writing', 'WritingDone']
  }
}

export type TSyncState = AsyncMachine<TStatesSync, IBindSync, IBindSync>
export type TSyncStateWriter = AsyncMachine<
  TStatesWriter,
  IBindWriter,
  IBindWriter
>

export abstract class Sync<TConfig, TStates, IBind, IEmit> {
  state: AsyncMachine<any, any, any>
  get state_reader(): TSyncState {
    return this.state
  }
  active_requests: number
  // config: IConfig | null
  config: TConfig
  // TODO types?
  sub_states_inbound: [TStates | TStatesSync, TStates | TStatesSync][] = [
    ['ReadingDone', 'ReadingDone'],
    ['Ready', 'SubsReady']
  ]
  // TODO types?
  sub_states_outbound: [TStates | TStatesSync, TStates | TStatesSync][] = [
    ['Reading', 'Reading'],
    ['Enabled', 'Enabled']
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

  log: log_fn
  log_error: log_fn
  log_verbose: log_fn

  get subs_flat(): Sync<TConfig, TStates, IBind, IEmit>[] {
    let ret = []
    for (const sub of Object.values(this.subs)) {
      if (Array.isArray(sub)) {
        ret.push(...sub)
      } else {
        ret.push(sub)
      }
    }
    return ret
  }

  constructor(config, root?: RootSync) {
    this.config = config
    // config and ConfigSet force us to do this here
    if (!root) {
      this.root = <RootSync>(<any>this)
      this.root.logger = new Logger()
    } else {
      this.root = root
    }
    this.state = this.getState()
    this.state.setTarget(this)
    this.state_reader.add('Initializing')
    if (process.env['DEBUG_AM'] || global.am_network) {
      machineLogToDebug(this.state_reader)
      if (global.am_network) {
        global.am_network.addMachine(this.state_reader)
      }
    }
    this.state_reader.add('ConfigSet', config)
    this.initLoggers()
  }

  // ----- -----
  // Transitions
  // ----- -----

  Exception_enter(err, ...rest): boolean {
    this.log('Error: %O', err)
    if (this.root) {
      this.root.state.add('Exception', err, ...rest)
      return false
    }
  }

  Enabled_state() {
    if (!this.state.is('Ready')) {
      this.state.add('Initializing')
    }
  }

  ConfigSet_state(config: TConfig) {
    this.config = config
  }

  SubsReady_enter() {
    return this.subs_flat.every(sync => sync.state.is('Ready'))
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

  // ----- -----
  // Methods
  // ----- -----

  getState() {
    return machine(sync_state).id('Sync')
  }

  merge(): any[] {
    let ret = []
    for (const sub of this.subs_flat) {
      ret.push(...sub.merge())
    }
    return ret
  }

  bindToSubs() {
    for (const sync of this.subs_flat) {
      for (const [source, target] of this.sub_states_inbound) {
        sync.state.pipe(source, this.state, target)
      }
      for (const [source, target] of this.sub_states_outbound) {
        this.state.pipe(source, sync.state, target)
      }
    }
  }

  applyLabels(record: DBRecord, labels: { add?: string[]; remove?: string[] }) {
    record.labels = record.labels || {}
    for (const label of labels.remove || []) {
      record.labels[label] = {
        active: false,
        updated: record.updated
      }
    }
    for (const label of labels.add || []) {
      record.labels[label] = {
        active: true,
        updated: record.updated
      }
    }
  }

  // TODO output to the logger, loose ID in the msg
  printRecordDiff(before, record, title = '') {
    if (!debug.enabled('record-diffs')) {
      return
    }
    if (JSON.stringify(before) == JSON.stringify(record)) {
      return
    }
    delete before.$loki
    delete before.meta
    const after = clone(record)
    delete after.$loki
    delete after.meta
    let msg = 'DB diff'
    if (title) {
      msg += ` '${title}'`
    }
    msg += ` from '${this.state.id()}'\n`
    for (const chunk of diff.diffChars(inspect(before), inspect(after))) {
      const color = chunk.added ? 'green' : chunk.removed ? 'red' : 'white'
      msg += chunk.value[color]
    }
    this.log(msg)
  }

  getMachines() {
    const machines = [this.state]
    for (const sub of this.subs_flat) {
      machines.push(...sub.getMachines())
    }
    return machines
  }

  initLoggers() {
    let name = this.state.id(true)

    this.log = this.root.logger.createLogger(name)
    this.log_verbose = this.root.logger.createLogger(name, 'verbose')
    this.log_error = this.root.logger.createLogger(name, 'error')
  }
}

// TODO consider moving to a separate file?
export abstract class SyncWriter<TConfig, TStates, IBind, IEmit> extends Sync<
  TConfig,
  TStates,
  IBind,
  IEmit
> {
  get state_writer(): TSyncStateWriter {
    return this.state
  }
  // sub_states_inbound: [TStatesWriter, TStatesWriter][]
  // sub_states_outbound: [TStatesWriter, TStatesWriter][]

  last_write_end: moment.Moment
  last_write_start: moment.Moment
  last_write_time: moment.Duration

  get subs_flat_writers(): SyncWriter<any, any, any, any>[] {
    // TODO cast
    return <any>this.subs_flat.filter(sync => sync instanceof SyncWriter)
  }

  // ----- -----
  // Transitions
  // ----- -----

  Writing_enter() {
    if (!this.last_read_end) {
      return false
    }
  }

  Writing_state() {
    this.last_write_start = moment()
  }

  WritingDone_enter() {
    return this.subs_flat_writers.every(sync => sync.state.is('WritingDone'))
  }

  WritingDone_state() {
    this.last_write_end = moment()
    this.last_write_time = moment.duration(
      this.last_write_end.diff(this.last_write_start)
    )
  }

  // ----- -----
  // Methods
  // ----- -----

  getState(): AsyncMachine<any, any, any> {
    return machine(sync_writer_state).id('SyncWriter')
  }

  bindToSubs() {
    super.bindToSubs()
    for (const sync of this.subs_flat_writers) {
      sync.state.pipe('WritingDone', this.state_writer, 'WritingDone')
      this.state_writer.pipe('Writing', sync.state, 'Writing')
    }
  }
}
