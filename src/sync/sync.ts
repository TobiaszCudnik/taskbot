// import { IBind, IEmit, IState, TStates } from '../google/gmail/gmail-types'
// import { IBind, IEmit, IState } from 'asyncmachine/build/types'
import AsyncMachine from 'asyncmachine'
import { IConfig } from '../types'
import RootSync, { DBRecord } from './root'
import * as moment from 'moment'
import { machineLogToDebug } from '../utils'
import * as clone from 'deepcopy'
import * as diff from 'diff'
import { inspect } from 'util'
import debug from 'debug'

// TODO define SyncState as a JSON
export const Reading = {
  drop: ['ReadingDone'],
  require: ['Enabled', 'Ready']
}

// TODO JSON
export class SyncState extends AsyncMachine<any, any, any> {
  Enabled = {}

  Initializing = { require: ['Enabled'] }
  // TODO split to ReadyForReading, ReadyForWriting
  Ready = { auto: true, drop: ['Initializing'] }
  // optional
  ConfigSet = {}
  SubsReady = {}
  SubsInited = {}

  Reading = Reading
  ReadingDone = {
    drop: ['Reading']
  }

  constructor(target: Sync) {
    super(target)
    this.registerAll()
  }
}

// TODO JSON
export class SyncWriterState extends SyncState {
  Writing = {
    drop: ['WritingDone', 'Reading', 'ReadingDone'],
    require: ['Enabled', 'Ready']
  }
  WritingDone = {
    drop: ['Writing', 'Reading', 'ReadingDone']
  }

  Reading = {
    drop: ['ReadingDone', 'Writing', 'WritingDone'],
    require: ['Enabled', 'Ready']
  }

  ReadingDone = {
    drop: ['Reading', 'Writing', 'WritingDone']
  }

  constructor(target: Sync) {
    super(target)
    this.registerAll()
  }
}

// TODO match SyncState
export interface ISyncState {
  Enabled
  Initializing
  Ready

  Writing
  WritingDone
  Reading
  ReadingDone
}

export abstract class Sync {
  state: AsyncMachine<any, any, any>
  active_requests: number
  // config: IConfig | null
  config: any
  sub_states_inbound = [['ReadingDone', 'ReadingDone'], ['Ready', 'SubsReady']]
  sub_states_outbound = [['Reading', 'Reading'], ['Enabled', 'Enabled']]
  subs: { [index: string]: Sync | Sync[] } = {}
  root: RootSync

  last_read_end: moment.Moment
  last_read_start: moment.Moment
  last_read_time: moment.Duration

  constructor(config?, root?) {
    this.config = config
    if (root) {
      this.root = root
    }
    this.state = this.getState()
    this.state.add('Initializing')
    if (process.env['DEBUG_AM'] || global.am_network) {
      machineLogToDebug(this.state)
      if (global.am_network) {
        global.am_network.addMachine(this.state)
      }
    }
    if (config) {
      this.state.add('ConfigSet', config)
    }
  }

  getState(): SyncState {
    return new SyncState(this).id('Sync')
  }

  // ----- -----
  // Transitions
  // ----- -----

  Enabled_state() {
    if (!this.state.is('Ready')) {
      this.state.add('Initializing')
    }
  }

  ConfigSet_state(config: IConfig) {
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

  get subs_flat(): Sync[] {
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
  compareRecord(before, record, title = '') {
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
    msg += ` from ${this.state.id()}`
    console.log(msg)
    for (const chunk of diff.diffChars(inspect(before), inspect(after))) {
      const color = chunk.added ? 'green' : chunk.removed ? 'red' : 'white'
      process.stderr.write(chunk.value[color])
    }
    process.stderr.write('\n')
  }
}

export abstract class SyncWriter extends Sync {
  last_write_end: moment.Moment
  last_write_start: moment.Moment
  last_write_time: moment.Duration

  get subs_flat_writers(): SyncWriter[] {
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

  getState(): SyncState {
    return new SyncWriterState(this).id('SyncWriter')
  }

  bindToSubs() {
    super.bindToSubs()
    for (const sync of this.subs_flat_writers) {
      sync.state.pipe('WritingDone', this.state, 'WritingDone')
      this.state.pipe('Writing', sync.state, 'Writing')
    }
  }
}
