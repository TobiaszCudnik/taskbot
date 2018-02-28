import GmailSync from './gmail/sync'
import Auth from './auth'
import { SyncWriter, sync_writer_state } from '../sync/sync'
import RootSync from '../sync/root'
import GTasksSync from './tasks/sync'
import { factory } from 'asyncmachine'

export const sync_state = {
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

export default class GoogleSync extends SyncWriter {
  auth: Auth
  subs: {
    gmail: GmailSync
    tasks: GTasksSync
  }

  constructor(root: RootSync) {
    super(root.config, root)
    this.auth = new Auth(root.config)
  }

  getState() {
    return factory(sync_state).id('Google')
  }

  SubsInited_state() {
    this.subs = {
      tasks: new GTasksSync(this.root, this.auth),
      gmail: new GmailSync(this.root, this.auth)
    }
    this.bindToSubs()
    this.auth.pipe('Ready', this.state, 'Authenticated')
    // this.subs.gmail.state.add('Enabled')
    // this.subs.tasks.state.add('Enabled')
  }
}
