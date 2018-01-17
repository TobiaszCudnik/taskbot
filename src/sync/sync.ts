// import { IBind, IEmit, IState, TStates } from '../google/gmail/gmail-types'
import { IBind, IEmit, IState } from 'asyncmachine/build/types'
import AsyncMachine from 'asyncmachine'
import { State } from '../google/gmail/sync-list'
import { IConfig } from '../types'

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
    require: ['Enabled', 'Ready'],
    add: ['Syncing']
  }
  WritingDone: IState = {
    drop: ['Writing', 'Reading', 'ReadingDone']
  }

  Reading: IState = {
    drop: ['ReadingDone', 'Writing', 'WritingDone'],
    require: ['Enabled', 'Ready'],
    add: ['Syncing']
  }
  ReadingDone: IState = {
    drop: ['Reading', 'Writing', 'WritingDone']
  }

  Syncing: IState = { drop: ['Synced'], require: ['Ready'] }
  Synced: IState = { drop: ['Syncing'] }

  Dirty: IState = {}

  constructor(target: Sync) {
    super(target)
    this.registerAll()
  }
}

export interface ISyncState {
  Enabled: IState
  Initializing: IState
  Ready: IState
  Writing: IState
  WritingDone: IState
  Reading: IState
  ReadingDone: IState
  Syncing: IState
  Synced: IState
}

export default abstract class Sync {
  state: AsyncMachine<any, any, any>
  active_requests: number
  config: IConfig | null
  sub_states = [
    'Synced',
    'Syncing',
    'Reading',
    'Writing',
    'Ready',
    'ReadingDone',
    'WritingDone'
  ]
  subs: { [index: string]: Sync | Sync[] }

  constructor() {
    this.state = this.getState()
    this.state.add('Initializing')
    if (process.env['DEBUG'] && global.am_network) {
      this.state.logLevel(process.env['DEBUG'])
      global.am_network.addMachine(this.state)
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
    return this.subs.every(sync => sync.state.is('WritingDone'))
  }

  ReadingDone_enter() {
    return this.subs.every(sync => sync.state.is('WritingDone'))
  }

  // ----- -----
  // Methods
  // ----- -----

  initSubs() {}

  bindToSubs() {
    // TODO support arrays, Maps
    for (const sync of Object.values(this.subs)) {
      for (const state of this.sub_states) {
        if (sync instanceof Sync) {
          sync.state.pipe(state, this.state)
        } else {
          for (const sync2 of sync) {
            sync2.state.pipe(state, this.state)
          }
        }
      }
    }
  }
}
