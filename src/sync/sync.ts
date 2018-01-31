// import { IBind, IEmit, IState, TStates } from '../google/gmail/gmail-types'
import { IBind, IEmit, IState } from 'asyncmachine/build/types'
import AsyncMachine from 'asyncmachine'
import { State } from '../google/gmail/sync-list'
import { IConfig } from '../types'
import RootSync from "../root/sync";

// TODO define SyncState as a JSON
export const Reading = {
  drop: ['ReadingDone', 'Writing', 'WritingDone'],
  require: ['Enabled', 'Ready']
}


export class SyncState extends AsyncMachine<any, IBind, IEmit>
  implements ISyncState {
  Enabled: IState = {}

  Initializing: IState = { require: ['Enabled'] }
  Ready: IState = { auto: true, drop: ['Initializing'] }
  // optional
  ConfigSet = {}
  SubsReady = {}
  SubsInited = {}

  Writing: IState = {
    drop: ['WritingDone', 'Reading', 'ReadingDone'],
    require: ['Enabled', 'Ready']
  }
  WritingDone: IState = {
    drop: ['Writing', 'Reading', 'ReadingDone']
  }

  Reading: IState = Reading
  ReadingDone: IState = {
    drop: ['Reading', 'Writing', 'WritingDone']
  }

  Dirty: IState = {}

  constructor(target: Sync) {
    super(target)
    this.registerAll()
  }
}

// TODO match SyncState
export interface ISyncState {
  Enabled: IState
  Initializing: IState
  Ready: IState

  Writing: IState
  WritingDone: IState
  Reading: IState
  ReadingDone: IState
}

export default abstract class Sync {
  state: AsyncMachine<any, any, any>
  active_requests: number
  config: IConfig | null
  sub_states_inbound = [['ReadingDone', 'ReadingDone'],
    ['WritingDone', 'WritingDone'], ['Ready', 'SubsReady']]
  sub_states_outbound = [['Reading', 'Reading'], ['Writing', 'Writing']]
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

  WritingDone_enter() {
    return Object.values(this.subs).every(sync => sync.state.is('WritingDone'))
  }

  ReadingDone_enter() {
    return Object.values(this.subs).every(sync => sync.state.is('ReadingDone'))
  }

  SubsReady_enter() {
    return Object.values(this.subs).every(sync => sync.state.is('Ready'))
  }

  // ----- -----
  // Methods
  // ----- -----

  initSubs() {}

  mapSubs(fn: (sub: Sync) => boolean) {
    // TODO
  }

  sync(): Array {
    let ret = []
    for (const sub of Object.values(this.subs)) {
      if (Array.isArray(sub)) {
        for (const sub2 of sub) {
          ret.push(...sub2.sync())
        }
      } else {
        ret.push(...sub.sync())
      }
    }
    return ret
  }

  bindToSubs() {
    // TODO support arrays, Maps
    for (const sync of Object.values(this.subs)) {
      for (const [source, target] of this.sub_states_inbound) {
        if (sync instanceof Sync) {
          sync.state.pipe(source, this.state, target)
        } else {
          for (const sync2 of sync) {
            sync2.state.pipe(source, this.state, target)
          }
        }
      }
      for (const [source, target] of this.sub_states_outbound) {
        if (sync instanceof Sync) {
          this.state.pipe(source, sync.state, target)
        } else {
          for (const sync2 of sync) {
            this.state.pipe(source, sync2.state, target)
          }
        }
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
