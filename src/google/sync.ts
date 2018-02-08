import GmailSync from './gmail/sync'
import Auth from './auth'
import { Sync, SyncWriter, SyncWriterState } from '../sync/sync'
import RootSync from "../root/sync"
import GTasksSync from "./tasks/sync";

export class State extends SyncWriterState {
  Authenticated = {}

  SubsInited = { require: ['Enabled'], auto: true }
  SubsReady = { require: ['Authenticated', 'SubsInited'], auto: true }
  Ready = {
    auto: true,
    require: ['ConfigSet', 'SubsReady'],
    drop: ['Initializing']
  }

  constructor(target: GoogleSync) {
    super(target)
    this.registerAll()
  }
}

export default class GoogleSync extends SyncWriter {
  auth: Auth
  state: State
  subs: {
    gmail: Sync,
    tasks: Sync
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
    this.subs = {
      tasks: new GTasksSync(this.root, this.auth),
      gmail: new GmailSync(this.root, this.auth),
    }
    this.bindToSubs()
    this.auth.pipe('Ready', this.state, 'Authenticated')
    // this.subs.gmail.state.add('Enabled')
    // this.subs.tasks.state.add('Enabled')
  }
}
