import * as firebase from 'firebase-admin'
import * as fs from 'fs'
import * as google from 'googleapis'
import { test_user } from '../../config-accounts'
import { Credentials as GoogleCredentials } from 'google-auth-library/build/src/auth/credentials'
import RootSync, { TStatsUser } from '../sync/root'
import { IConfig, IAccount, IConfigAccount, TRawEmail } from '../types'
import Connections from './connections'
import Logger from './logger'
import * as merge from 'deepmerge'
import * as moment from 'moment-timezone'
import { OAuth2Client } from 'google-auth-library'
import * as removeHtmlComments from 'remove-html-comments'
import { Base64 } from 'js-base64'

const email_invitation = removeHtmlComments(
  fs.readFileSync('www/pages/content/email-invitation.md')
).data
const email_welcome = removeHtmlComments(
  fs.readFileSync('www/pages/content/email-welcome.md')
).date

type DataSnapshot = firebase.database.DataSnapshot

export class App {
  firebase: firebase.app.App
  log_info = this.logger.createLogger('app')
  auth: OAuth2Client
  // TODO merge with `this.auth` once googleapis are up to date
  auth_email: any
  syncs: { [uid: string]: RootSync } = {}
  accounts: { [uid: string]: IAccount } = {}

  get db() {
    return this.firebase.database()
  }

  constructor(
    public config: IConfig,
    public logger: Logger,
    public connections: Connections
  ) {
    this.firebase = firebase.initializeApp({
      credential: firebase.credential.cert(config.firebase.admin),
      // TODO move to the config
      databaseURL: config.firebase.url
    })
    if (!process.env['TEST']) {
      this.listenToAccountsChanges()
    } else {
      this.syncs['test'] = this.createUserInstance(
        'test',
        this.config,
        test_user.config
      )
    }
    this.auth = new OAuth2Client(
      config.google.client_id,
      config.google.client_secret,
      config.google.redirect_url
    )
    // TODO merge with auth once googleapis are up to date
    // @ts-ignore
    this.auth_email = new google.auth.OAuth2(
      config.google.client_id,
      config.google.client_secret,
      config.google.redirect_url
    )
    this.auth_email.credentials = {
      // @ts-ignore
      access_token: this.config.service.google_tokens.access_token,
      // @ts-ignore
      refresh_token: this.config.service.google_tokens.refresh_token
    }
  }

  async listenToAccountsChanges() {
    const accounts_ref = this.db.ref('/accounts')

    // ADD
    accounts_ref.on('child_added', async (s: DataSnapshot) => {
      const account = s.val() as IAccount
      // cache the account data for diffs
      this.accounts[s.key] = account
      if (!this.isAccountEnabled(account)) {
        return false
      }
      await this.handleWelcomeEmail(account)
      this.createUserInstance(s.key, this.config, account.config)
    })

    // REMOVE
    accounts_ref.on('child_removed', (s: DataSnapshot) => {
      this.removeUserInstance(s.key)
    })

    // CHANGE
    accounts_ref.on('child_changed', async (s: DataSnapshot) => {
      const account = s.val() as IAccount
      const old_account = this.accounts[s.key]

      const config_changed =
        JSON.stringify(old_account.config) !== JSON.stringify(account.config)
      const isEnabled = this.isAccountEnabled(account)
      const wasEnabled = this.isAccountEnabled(old_account)
      // cache the account data for diffs
      this.accounts[s.key] = account

      if (config_changed || (wasEnabled && !isEnabled)) {
        this.removeUserInstance(account.uid)
      }
      if (!isEnabled) {
        return false
      }
      if (!this.syncs[s.key]) {
        this.createUserInstance(s.key, this.config, account.config)
      } else {
        // force gtasks sync only on existing instances
        await this.handleGTasksSync(account)
      }
      await this.handleWelcomeEmail(account)
    })
  }

  async handleWelcomeEmail(account: IAccount) {
    if (!account.welcome_email_sent) {
      await this.sendServiceEmail(
        account.email,
        'Welcome to TaskBot.app',
        email_welcome
      )
      await this.patchAccount(account.uid, {
        welcome_email_sent: true
      })
    }
  }

  // force re-sync of all gtasks lists
  async handleGTasksSync(account: IAccount) {
    const sync = this.syncs[account.uid]
    if (account.client_data.sync_gtasks) {
      this.log_info(`Forced sync of GTasks for ${account.uid}`)
      for (const list of sync.subs.google.subs.tasks.subs.lists) {
        if (!list.state.is('QuotaExceeded')) {
          list.state.add('Dirty')
        }
      }
    }
    await this.db
      .ref(`accounts/${account.uid}/client_data`)
      .update({ sync_gtasks: false })
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
    if (!account.sync_enabled || !account.client_data.sync_enabled) {
      return false
    }
    // skip when no access token
    if (!account.config.google.access_token) {
      return false
    }
    return true
  }

  removeUserInstance(uid: string) {
    const sync = this.syncs[uid]
    if (!sync) return false

    this.log_info(`Removing sync for ${sync.config.user.id} (uid: ${uid})`)
    sync.state.drop('Enabled')
    delete this.syncs[uid]
    // dispose emitter
    sync.removeAllListeners('stats')
    // dispose firebase
    for (const listener of this.stats_uid[uid].firebase) {
      listener()
    }
    return true
  }

  createUserInstance(
    uid: string,
    config: IConfig,
    user: IConfigAccount
  ): RootSync {
    const config_user = merge(config, user)
    this.log_info(`Adding sync for ${config_user.user.id} (uid: ${uid})`)
    const sync = new RootSync(config_user, this.logger, this.connections)
    if (!process.env['TEST']) {
      // jump out of this tick
      sync.state.addNext('Enabled')
    }
    this.syncs[uid] = sync
    sync.on('stats', this.handleStats.bind(this))
    this.stats_uid[uid] = this.stats_uid[uid] || {
      firebase: [],
      cache: {}
    }
    this.stats_uid[uid].firebase.push(
      this.db
        .ref(`stats/users/${uid}`)
        .on('value', this.handleStatsClient.bind(this))
    )
    return sync
  }

  // ACCOUNTS

  // per uid stats data
  stats_uid: {
    [uid: string]: {
      // TODO extract a generic firebase-per-uid listeners array
      firebase: Function[]
      // cache of stats, available to trasmit to the user
      cache: Partial<TStatsUser>
    }
  } = {}

  // TODO use last_sync_gmail instead of last_cache_push, reduce
  // number of changes
  async handleStatsClient(s: DataSnapshot) {
    const val = s.val() as TStatsUser
    if (!val.client_last_read) return
    const seconds_ago = moment(moment().utc()).diff(
      val.client_last_read,
      'seconds'
    )
    // quit in case client was seen longer than 5 sec ago or already has
    // cache pushed
    if (seconds_ago > 5 || val.last_cache_push === val.client_last_read) {
      return
    }
    await this.db.ref(`stats/users/${s.key}`).update({
      ...this.stats_uid[s.key].cache,
      last_cache_push: val.client_last_read
    })
  }

  async handleStats({
    uid,
    stats
  }: {
    uid: string
    stats: Partial<TStatsUser>
  }) {
    const client_last_read_ref = await this.db
      .ref(`stats/users/${uid}/client_last_read`)
      .once('value')
    const client_last_read = client_last_read_ref.val()
    // check if the client is active
    if (client_last_read) {
      const seconds_ago = moment(moment().utc()).diff(
        client_last_read,
        'seconds'
      )
      if (seconds_ago > 5) {
        // skip as client isnt active
        return
      }
    } else {
      // no client
      return
    }

    // update the cache
    this.stats_uid[uid].cache = {
      ...this.stats_uid[uid].cache,
      ...stats
    }
  }

  async getAccount(uid: string): Promise<IAccount | null> {
    const ref = await this.db.ref(`accounts`).once('value')

    const accounts = ref.val()
    return accounts && accounts[uid]
  }

  async getAccountByEmail(email: string): Promise<IAccount | null> {
    const ref = await this.db
      .ref('accounts')
      .orderByChild('email')
      .equalTo(email)
      .once('value')

    const accounts = ref.val()
    return (accounts && accounts[Object.keys(accounts)[0]]) || null
  }

  async patchAccount(uid: string, patch: Partial<IAccount>) {
    await this.db.ref(`accounts/${uid}`).update(patch)
  }

  // TODO transaction
  async nextID() {
    const ref = await this.db.ref('registered_users').once('value')
    const amount = ref.val() || 0
    await this.db.ref('registered_users').set(amount + 1)
    return amount + 1
  }

  async createAccount(
    // google_tokens: GoogleCredentials,
    uid: string,
    email: string,
    ip: string
    // enabled: boolean = false
  ) {
    if (await this.getAccount(uid)) {
      this.log_info(
        `Skipping creation of account for ${uid} (${email}) - already present`
      )
      return true
    }

    const registered = moment()
      .utc()
      .toISOString()
    const id = await this.nextID()

    let account: IAccount = {
      uid,
      email,
      registered,
      client_data: {
        sync_enabled: true
      },
      // requires an invitation
      invitation_granted: false,
      welcome_email_sent: false,
      // create a disabled account by default
      sync_enabled: false,
      ip,
      // create dev accounts in the dev env
      dev: !Boolean(process.env['PROD']),
      config: {
        user: {
          id,
          uid
        },
        // TODO make all google_token fields required (assert)
        google: {
          username: email
        }
      }
    }

    // add the account
    await this.db.ref(`accounts/${uid}`).set(account)

    this.log_info(`Added a new user ${uid} (${email})`)
    return true
  }

  // TODO type tokens
  async setGoogleAccessTokens(uid: string, tokens: any): Promise<boolean> {
    const account = await this.getAccount(uid)
    if (!account) {
      return false
    }

    const config = account.config
    config.google = merge(config.google, tokens)

    // set the updated config and enable the account
    await this.patchAccount(uid, {
      config,
      sync_enabled: true
    })

    return true
  }

  async sendServiceEmail(to: string, subject: string, content?: string) {
    let email = [
      `From: ${this.config.service.name} <${this.config.service.email}>`,
      `To: ${to}`,
      'Content-type: text/plain;charset=utf-8',
      'Content-Transfer-Encoding: quoted-printable',
      'MIME-Version: 1.0',
      `Subject: ${subject}`
    ].join('\r\n')

    if (content) {
      email += `\r\n\r\n${content.replace(`\n`, `\r\n`)}`
    }

    // TODO port Base64 to the gmail sync client
    const raw = Base64.encodeURI(email) as TRawEmail

    const ret = await new Promise((resolve, reject) => {
      this.connections.apis.gmail.users.messages.send(
        {
          userId: 'me',
          fields: 'threadId',
          // @ts-ignore
          resource: {
            raw: raw
          },
          // payload: { mimeType: 'text/html' },
          auth: this.auth_email
        },
        (err, body) => {
          if (err) return reject(err)
          resolve(body)
        }
      )
    })
    // @ts-ignore TODO
    if (ret && ret.threadId) {
      // @ts-ignore
      this.log_info(`Sent email ${ret.threadId} to ${to}`)
      return true
    }
  }
}
