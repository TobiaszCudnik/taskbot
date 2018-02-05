import GmailSync from './gmail/sync'
import Auth from './auth'
import { IBind, IEmit, TStates } from './sync-types'
import Sync, { SyncState } from '../sync/sync'
import { IState } from './gmail/sync-types'
import { IConfig } from '../types'
import {DBRecord, default as RootSync} from "../root/sync"
import GTasksSync from "./tasks/sync";

export class State extends SyncState {
  Authenticated: IState = {}

  SubsInited: IState = { require: ['Authenticated', 'Enabled'], auto: true }
  SubsReady: IState = { require: ['SubsInited'], auto: true }
  Ready: IState = {
    auto: true,
    require: ['ConfigSet', 'SubsReady'],
    drop: ['Initializing']
  }

  constructor(target: Sync) {
    super(target)
    this.registerAll()
  }
}

export default class GoogleSync extends Sync {
  auth: Auth
  state: State
  subs: {
    gmail: GmailSync,
    tasks: GTasksSync
  }

  constructor(root: RootSync) {
    super(root.config, root)
    this.auth = new Auth(root.config)
    this.auth.pipe('Ready', this.state, 'Authenticated')
  }

  getState() {
    const state = new State(this)
    state.id('Google')
    return state
  }

  SubsInited_state() {
    // TODO use Map
    this.subs = {
      gmail: new GmailSync(this.root, this.auth),
      tasks: new GTasksSync(this.root, this.auth)
    }
    this.bindToSubs()
    this.subs.gmail.state.add('Enabled')
    this.subs.tasks.state.add('Enabled')
  }
}
