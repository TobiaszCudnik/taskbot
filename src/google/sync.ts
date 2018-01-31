import GmailSync from './gmail/sync'
import Auth from './auth'
import { IBind, IEmit, TStates } from './sync-types'
import Sync, { SyncState } from '../sync/sync'
import GTasksSync from './tasks/sync'
import { IState } from './gmail/sync-types'
import { IConfig } from '../types'
import {DBRecord} from "../root/sync";

export class State extends SyncState<TStates, IBind, IEmit> {
  Authenticated: IState = {}

  SubsInited: IState = { require: ['ConfigSet', 'Authenticated'], auto: true }
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

  constructor(
    config: IConfig,
    public data: LokiCollection,
    public callbacks: {
      onLocalEntry: (record: DBRecord) => null
    }[]
  ) {
    super(config)
    this.auth = new Auth(config)
    this.auth.pipe('Ready', this.state, 'Authenticated')
  }

  getState() {
    const state = new State(this)
    state.id('Google')
    return state
  }

  getCallbacks() {
    return {
      ...this.callbacks,
      req: async (...params) => {
        // haha
        params[1].auth = this.auth.client
        return await this.callbacks.req(...params)
      }
    }
  }

  SubsInited_state() {
    // TODO use Map
    this.subs = {}
    this.subs.gmail = new GmailSync(this.config, this.data, this.getCallbacks(), this.auth)
    // this.subs.tasks = new GTasksSync(this.data, this.config, this.auth)
    this.bindToSubs()
    this.subs.gmail.state.add('Enabled')
    // this.subs.tasks.state.add('Enabled')
  }
}
