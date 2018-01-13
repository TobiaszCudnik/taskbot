import Gmail from './gmail/sync'
import * as google from 'googleapis'
import Auth from './auth'
import { IBind, IEmit, TStates } from './gmail/gmail-types'
import Sync, { SyncState } from '../sync/sync'

export class State extends SyncState<TStates, IBind, IEmit> {
  Authenticating = {}
  Authenticated = {}
}

export default class Google extends Sync {
  active_requests: number
  auth: Auth
  tasks_api: google.tasks.v1.Tasks

  get state_class() {
    return State
  }

  constructor(public config) {
    super()
  }

  initAPIs() {
    this.auth = new Auth(this.config)
    this.gmail_api = google.gmail('v1', { auth: this.auth.client })
    this.tasks_api = google.tasks('v1', { auth: this.auth.client })
  }

  getSyncs() {
    this.gmail = new Gmail(this.config)
  }
}
