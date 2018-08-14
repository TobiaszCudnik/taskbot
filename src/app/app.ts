import * as firebase from 'firebase-admin'
import test_user from '../../config-users'
import { Credentials } from '../../node_modules/google-auth-library/build/src/auth/credentials'
import RootSync from '../sync/root'
import { IConfig, TConfigCredentials } from '../types'
import Connections from './connections'
import Logger from './logger'
import * as merge from 'deepmerge'
import * as moment from 'moment-timezone'

export class App {
  syncs: RootSync[] = []
  firebase: firebase.app.App
  last_id: number = 0

  constructor(
    public config: IConfig,
    public logger: Logger,
    public connections: Connections
  ) {
    this.firebase = firebase.initializeApp({
      credential: firebase.credential.cert(config.firebase_admin),
      databaseURL: 'https://gtd-bot.firebaseio.com'
    })
    this.start()
    if (!process.env['TEST']) {
      this.listenToChanges()
    }
  }

  async getUsers(): Promise<TConfigCredentials[]> {
    // TEST env
    if (process.env['TEST']) {
      return [test_user]
    }
    // DEV and PROD
    const users = await this.firebase
      .database()
      .ref('/users')
      .once('value')
    return users.val()
  }

  async start() {
    const users = await this.getUsers()
    this.last_id = 0
    for (const user of users) {
      this.last_id = Math.max(this.last_id, user.user.id)
      const sync = this.createUserInstance(this.config, user)
      if (!sync) continue
      this.syncs.push(sync)
    }
  }

  // TODO use an async iterator
  async listenToChanges() {
    const posts_ref = this.firebase.database().ref('/users')

    posts_ref.on('child_added', user => {
      const sync = this.createUserInstance(this.config, user.val())
      if (sync) {
        this.syncs.push(sync)
      }
    })
    posts_ref.on('child_removed', user => {
      this.removeSync(user.val().id)
    })
    posts_ref.on('child_changed', user => {
      this.removeSync(user.val().id)
      const sync = this.createUserInstance(this.config, user.val())
      if (sync) {
        this.syncs.push(sync)
      }
    })
  }

  removeSync(user_id) {
    const sync = this.syncs.find(sync => sync.config.user.id === user_id)
    if (!sync) return false
    sync.state.drop('Enabled')
    this.syncs = this.syncs.filter(s => s !== sync)
    return true
  }

  createUserInstance(
    config: IConfig,
    user: TConfigCredentials
  ): RootSync | false {
    if (process.env['PROD'] && user.user.dev) return false
    if (!process.env['PROD'] && !user.user.dev) return false
    if (!user.user.enabled) return false
    const config_user = merge(config, user)
    const sync = new RootSync(config_user, this.logger, this.connections)
    if (!process.env['TEST']) {
      // jump out of this tick
      sync.state.addNext('Enabled')
    }
    return sync
  }

  createNewUser(
    google_tokens: Credentials,
    email: string,
    invitation_code?: string
  ) {
    const new_user = this.firebase
      .database()
      .ref('users')
      .push()
    const registered = moment()
      .utc()
      .toISOString()
    // TODO perform on firebase
    const id = ++this.last_id

    new_user.set({
      email,
      registered,
      invitation_code,
      client_data: {
        snapshot: {}
      },
      enabled: true,
      config: {
        user: {
          id
        },
        google: {
          username: email,
          ...google_tokens
        }
      }
    })
    return true
  }
}
