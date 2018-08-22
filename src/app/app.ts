import * as firebase from 'firebase-admin'
import { test_user } from '../../config-accounts'
import { Credentials as GoogleCredentials } from 'google-auth-library/build/src/auth/credentials'
import { getInvitation } from '../server/google-login'
import RootSync from '../sync/root'
import { IConfig, IAccount, IConfigAccount } from '../types'
import Connections from './connections'
import Logger from './logger'
import * as merge from 'deepmerge'
import * as moment from 'moment-timezone'
import { OAuth2Client } from 'google-auth-library'

export class App {
  syncs: RootSync[] = []
  firebase: firebase.app.App
  last_id: number = 0
  log_info = this.logger.createLogger('app')
  auth: OAuth2Client

  constructor(
    public config: IConfig,
    public logger: Logger,
    public connections: Connections
  ) {
    this.firebase = firebase.initializeApp({
      credential: firebase.credential.cert(config.firebase_admin),
      databaseURL: 'https://gtd-bot.firebaseio.com'
    })
    if (!process.env['TEST']) {
      this.listenToChanges()
    } else {
      this.syncs.push(this.createUserInstance(this.config, test_user.config))
    }
    this.auth = new OAuth2Client(
      config.google.client_id,
      config.google.client_secret,
      config.google.redirect_url
    )
  }

  async listenToChanges() {
    const accounts_ref = this.firebase.database().ref('/accounts')

    accounts_ref.on('child_added', (s: firebase.database.DataSnapshot) => {
      const account: IAccount = s.val()
      // TODO use last_id from firebase
      this.last_id = Math.max(
        this.last_id,
        parseInt(account.config.user.id, 10)
      )
      if (!this.isAccountEnabled(account)) {
        return false
      }
      const sync = this.createUserInstance(this.config, account.config)
      this.syncs.push(sync)
    })
    accounts_ref.on('child_removed', (s: firebase.database.DataSnapshot) => {
      const account: IAccount = s.val()
      this.removeUserInstance(account.config.user.id)
    })
    accounts_ref.on('child_changed', (s: firebase.database.DataSnapshot) => {
      const account: IAccount = s.val()
      this.removeUserInstance(account.config.user.id)
      if (!this.isAccountEnabled(account)) {
        return false
      }
      const sync = this.createUserInstance(this.config, account.config)
      this.syncs.push(sync)
    })
  }

  isAccountEnabled(account: IAccount) {
    // handle dev accounts
    if (process.env['PROD'] && account.dev) {
      return false
    }
    if (!process.env['PROD'] && !account.dev) {
      return false
    }
    // skip disabled ones
    if (!account.enabled || !account.client_data.enabled) {
      return false
    }
    return true
  }

  removeUserInstance(user_id: string) {
    this.log_info(`Remove sync for user ${user_id}`)
    const sync = this.syncs.find(sync => sync.config.user.id === user_id)
    if (!sync) return false
    sync.state.drop('Enabled')
    this.syncs = this.syncs.filter(s => s !== sync)
    return true
  }

  createUserInstance(config: IConfig, user: IConfigAccount): RootSync {
    const config_user = merge(config, user)
    const sync = new RootSync(config_user, this.logger, this.connections)
    if (!process.env['TEST']) {
      // jump out of this tick
      sync.state.addNext('Enabled')
    }
    return sync
  }

  /**
   * TODO detect if the email is already added and merge
   * @param google_tokens
   * @param email
   * @param ip
   * @param invitation_code
   */
  async addUser(google_tokens: GoogleCredentials, email: string, ip: string) {
    const ref = this.firebase
      .database()
      .ref('accounts')
      .push()
    const registered = moment()
      .utc()
      .toISOString()
    // TODO perform on firebase
    const id = ++this.last_id

    await ref.set({
      email,
      registered,
      client_data: {
        enabled: true
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

    const invite = await getInvitation(this, email)
    // support no-invite accounts (bypass code)
    if (invite) {
      invite.ref.set({
        ...invite.val,
        fulfilled: true
      })
    }

    this.log_info(`Added a new user ${id}: ${email}`)
    return true
  }
}
