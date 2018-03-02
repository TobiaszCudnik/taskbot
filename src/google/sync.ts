import { machine } from 'asyncmachine'
import GmailSync from './gmail/sync'
import Auth from './auth'
import { SyncWriter, sync_writer_state } from '../sync/sync'
import RootSync from '../sync/root'
import GTasksSync from './tasks/sync'
import { IConfig } from '../types'
// Machine types
import {
  IBind,
  IEmit,
  IJSONStates,
  IState,
  TStates,
  IEmitBase,
  IBindBase,
  AsyncMachine
} from '../../typings/machines/google/sync'

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

  listMachines() {
    let ret = super.listMachines()
    ret += this.auth.statesToString(true)
    return ret
  }
}
