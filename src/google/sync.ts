import GmailSync from './gmail/sync'
import Auth from './auth'
import { IBind, IEmit, TStates } from './sync-types'
import Sync, { SyncState } from '../sync/sync'
import GTasksSync from './tasks/sync'
import DataStore from '../manager/datastore'
import { IState } from './gmail/sync-types'
import {IConfig} from "../types";

export class State extends SyncState<TStates, IBind, IEmit> {
  Authenticated: IState = {}

  SubsInited: IState = { require: ['ConfigSet', 'Authenticated'], auto: true }
  SubsReady: IState = { require: ['SubsInited'], auto: true }
  Ready: IState = { require: ['ConfigSet', 'SubsReady'] }

  constructor(target: Sync) {
    super(target)
    this.registerAll()
  }
}

export default class GoogleSync extends Sync {
  auth: Auth
  state: State

  constructor(public datastore: DataStore, config: IConfig) {
    super()
    this.state.add('ConfigSet', config)
    this.auth = new Auth(this.config)
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
    this.subs.gmail = new GmailSync(this.datastore, this.config, this.auth)
    this.subs.gmail.state.add('Enabled')
    this.subs.tasks = new GTasksSync(this.datastore, this.config, this.auth)
    this.subs.tasks.state.add('Enabled')
    this.bindToSubs()
  }
}
