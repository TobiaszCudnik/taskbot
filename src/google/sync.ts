import GmailSync from './gmail/sync'
import Auth from './auth'
import Sync, { SyncState } from '../sync/sync'
import RootSync from "../root/sync"
import GTasksSync from "./tasks/sync";

export class State extends SyncState {
  Authenticated = {}

  SubsInited = { require: ['Enabled'], auto: true }
  SubsReady = { require: ['Authenticated', 'SubsInited'], auto: true }
  Ready = {
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
    this.auth.pipe('Ready', this.state, 'Authenticated')
    this.subs.gmail.state.add('Enabled')
    this.subs.tasks.state.add('Enabled')
  }
}
