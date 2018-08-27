import * as firebase from 'firebase-admin'
import * as fs from 'fs'
import * as google from 'googleapis'
import { test_user } from '../../config-accounts'
import { Credentials as GoogleCredentials } from 'google-auth-library/build/src/auth/credentials'
import { getInvitation, TInvitation } from '../server/google-login'
import RootSync from '../sync/root'
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

export class App {
  syncs: RootSync[] = []
  firebase: firebase.app.App
  last_id: number = 0
  log_info = this.logger.createLogger('app')
  auth: OAuth2Client
  // TODO merge with auth once googleapis are up to date
  auth_email: any

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
      this.listenToChanges()
    } else {
      this.syncs.push(this.createUserInstance(this.config, test_user.config))
    }
    this.auth = new OAuth2Client(
      config.google.client_id,
      config.google.client_secret,
      config.google.redirect_url
    )
    // TODO merge with auth once googleapis are up to date
    this.auth_email = new google.auth.OAuth2(
      config.google.client_id,
      config.google.client_secret,
      config.google.redirect_url
    )
    this.auth_email.credentials = {
      access_token: this.config.service.google_tokens.access_token,
      refresh_token: this.config.service.google_tokens.refresh_token
    }
  }

  async listenToChanges() {
    // ACCOUNTS
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
      if (account.send_welcome_email) {
        this.sendServiceEmail(
          account.email,
          `Welcome to ${this.config.service.name}`,
          email_welcome
        )
        // TODO remove instead of `false` ?
        this.firebase
          .database()
          .ref('/accounts/' + s.key)
          .update({ send_welcome_email: false })
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
    // INVITATIONS
    const invitations_ref = this.firebase.database().ref('/invitations')
    invitations_ref.on('child_changed', (s: firebase.database.DataSnapshot) => {
      const invite: TInvitation = s.val()
      if (!invite.active || invite.email_sent) return
      this.sendServiceEmail(
        invite.email,
        `Invitation to ${this.config.service.name}`,
        email_invitation
      )
      this.firebase
        .database()
        .ref('/invitations/' + s.key)
        .update({ email_sent: true })
    })
  }

  isAccountEnabled(account: IAccount) {
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

  async isAccountAdded(email: string) {
    const ref = await this.firebase
      .database()
      .ref('accounts')
      .orderByChild('email')
      .equalTo(email)
      .once('value')
    const accounts = ref.val()

    return accounts && Object.keys(accounts).length
  }

  /**
   * TODO detect if the email is already added and merge
   * @param google_tokens
   * @param email
   * @param ip
   * @param invitation_code
   */
  async addAccount(
    google_tokens: GoogleCredentials,
    email: string,
    ip: string
  ) {
    if (await this.isAccountAdded(email)) {
      this.log_info(
        `Skipping creation of account for ${email} - already present`
      )
      return true
    }

    const push_ref = this.firebase
      .database()
      .ref('accounts')
      .push()
    const registered = moment()
      .utc()
      .toISOString()
    // TODO perform on firebase
    const id = (++this.last_id).toString()

    let account: IAccount = {
      email,
      registered,
      client_data: {
        enabled: true
      },
      send_welcome_email: true,
      enabled: true,
      // create dev accounts in the dev env
      dev: !Boolean(process.env['PROD']),
      config: {
        user: {
          id
        },
        // TODO make all google_token fields required (assert)
        google: {
          username: email,
          ...google_tokens
        }
      }
    }
    // add the account
    // TODO parallel
    await push_ref.set(account)
    await this.sendServiceEmail(email, 'Welcome to TaskBot.app', email_welcome)

    const invite = await getInvitation(this, email)
    // support no-invite accounts (bypass code)
    if (invite) {
      // remove the invite
      await this.firebase
        .database()
        .ref('invitations/' + invite.key)
        .remove()
      this.log_info(`Removed invite ${invite.key}`)
    }

    this.log_info(`Added a new user ${id}: ${email}`)
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
    if (ret && ret.threadId) {
      this.log_info(`Send email ${ret.threadId} to ${to}`)
      return true
    }
  }
}
