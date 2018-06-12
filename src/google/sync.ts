import { machine } from 'asyncmachine'
// Machine types
import {
  AsyncMachine,
  IBind,
  IEmit,
  IJSONStates,
  TStates,
  IEmitBase,
  IBindBase
} from '../../typings/machines/google/sync'
import RootSync from '../sync/root'
import { sync_writer_state, SyncWriter } from '../sync/writer'
import { IConfig } from '../types'
import Auth from './auth'
import GmailSync from './gmail/sync'
import GTasksSync from './tasks/sync'

export const sync_state: IJSONStates = {
  ...sync_writer_state,

  Authenticated: {},

  SubsInited: { require: ['Enabled'], auto: true },
  SubsReady: { require: ['Authenticated', 'SubsInited'], auto: true },
  Ready: {
    auto: true,
    require: ['ConfigSet', 'SubsReady'],
    drop: ['Initializing']
  }
}

export default class GoogleSync extends SyncWriter<
  IConfig,
  TStates,
  IBind,
  IEmit
> {
  state: AsyncMachine<TStates, IBind, IEmit>
  auth: Auth
  subs: {
    gmail: GmailSync
    tasks: GTasksSync
  }

  constructor(root: RootSync) {
    super(root.config, root)
    this.auth = new Auth(root.config)
  }

  // ----- -----
  // Transitions
  // ----- -----

  SubsInited_state() {
    this.subs = {
      tasks: new GTasksSync(this.root, this.auth),
      gmail: new GmailSync(this.root, this.auth)
    }
    this.bindToSubs()
    this.auth.pipe('Ready', this.state, 'Authenticated')
  }

  // ----- -----
  // Methods
  // ----- -----

  getState() {
    return machine(sync_state).id('Google')
  }

  getMachines() {
    const machines = super.getMachines()
    machines.push(this.auth)
    return machines
  }
}
