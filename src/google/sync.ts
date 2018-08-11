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

  SubsInited: {
    auto: true,
    require: ['Enabled']
  },
  SubsReady: {
    auto: true,
    require: ['Authenticated', 'SubsInited']
  },
  Ready: {
    auto: true,
    require: ['ConfigSet', 'SubsReady', 'Authenticated'],
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
    this.auth = new Auth(root.config.google, root.config.user.id, root.logger)
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
    this.auth.on('Exception_state', err => {
      this.auth.drop('Exception')
      this.state.add('Exception', err)
    })
    this.state.pipe('Enabled', this.auth)
  }

  // ----- -----
  // Methods
  // ----- -----

  getState() {
    return machine(sync_state).id('Google')
  }

  getMachines(include_inactive = true) {
    let machines = super.getMachines(include_inactive)
    machines += this.auth.statesToString(include_inactive)
    return machines
  }
}
