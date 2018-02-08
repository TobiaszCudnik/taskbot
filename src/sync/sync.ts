// import { IBind, IEmit, IState, TStates } from '../google/gmail/gmail-types'
import { IBind, IEmit, IState } from 'asyncmachine/build/types'
import AsyncMachine from 'asyncmachine'
import { State } from '../google/gmail/sync-list'
import { IConfig } from '../types'
import RootSync from "../root/sync";

// TODO define SyncState as a JSON
export const Reading = {
  drop: ['ReadingDone'],
  require: ['Enabled', 'Ready']
}

// TODO JSON
export class SyncState extends AsyncMachine<any, IBind, IEmit> {

  Enabled: IState<any> = {}

  Initializing: IState<any> = { require: ['Enabled'] }
  Ready: IState<any> = { auto: true, drop: ['Initializing'] }
  // optional
  ConfigSet = {}
  SubsReady = {}
  SubsInited = {}

  Reading: IState<any> = Reading
  ReadingDone: IState<any> = {
    drop: ['Reading']
  }

  Dirty: IState<any> = {}

  constructor(target: Sync) {
    super(target)
    this.registerAll()
  }
}

// TODO JSON
export class SyncWriterState extends SyncState {

  Writing: IState<any> = {
    drop: ['WritingDone', 'Reading', 'ReadingDone'],
    require: ['Enabled', 'Ready']
  }
  WritingDone: IState<any> = {
    drop: ['Writing', 'Reading', 'ReadingDone']
  }

  Reading: IState<any> = {
    drop: ['ReadingDone', 'Writing', 'WritingDone'],
    require: ['Enabled', 'Ready']
  }

  ReadingDone: IState<any> = {
    drop: ['Reading', 'Writing', 'WritingDone']
  }

  constructor(target: Sync) {
    super(target)
    this.registerAll()
  }
}

// TODO match SyncState
export interface ISyncState {
  Enabled: IState<any>
  Initializing: IState<any>
  Ready: IState<any>

  Writing: IState<any>
  WritingDone: IState<any>
  Reading: IState<any>
  ReadingDone: IState<any>
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

  constructor(config?, root?) {
    this.config = config
    if (root) {
      this.root = root
    }
    this.state = this.getState()
    this.state.add('Initializing')
    if (process.env['DEBUG'] && global.am_network) {
      this.state.logLevel(process.env['DEBUG'])
      global.am_network.addMachine(this.state)
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

  ReadingDone_enter() {
    return this.subs_flat.every(sync => sync.state.is('ReadingDone'))
  }

  SubsReady_enter() {
    return this.subs_flat.every(sync => sync.state.is('Ready'))
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

  sync(): any[] {
    let ret = []
    for (const sub of this.subs_flat) {
      ret.push(...sub.sync())
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

  log(msgs: string | any[], level: number) {
    if (!process.env['DEBUG']) {
      return
    }
    if (level && level > parseInt(process.env['DEBUG'], 10)) return
    if (!(msgs instanceof Array)) {
      msgs = [msgs]
    }
    return console.log.apply(console, msgs)
  }
}

export class SyncWriter extends Sync {
  // subs: { [index: string]: Sync | Sync[] | SyncWriter | SyncWriter[] } = {}

  get subs_flat_writers() {
    return this.subs_flat.filter( sync => sync instanceof SyncWriter )
  }

  WritingDone_enter() {
    return this.subs_flat_writers.every(sync => sync.state.is('WritingDone'))
  }

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
