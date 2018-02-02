import GmailSync from './gmail/sync'
import Auth from './auth'
import { IBind, IEmit, TStates } from './sync-types'
import Sync, { SyncState } from '../sync/sync'
// import GTasksSync from './tasks/sync'
import { IState } from './gmail/sync-types'
import { IConfig } from '../types'
import {DBRecord, default as RootSync} from "../root/sync";

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
    this.subs = {}
    this.subs.gmail = new GmailSync(this.root, this.auth)
    // this.subs.tasks = new GTasksSync(this.data, this.config, this.auth)
    this.bindToSubs()
    this.subs.gmail.state.add('Enabled')
    // this.subs.tasks.state.add('Enabled')
  }
}
