import * as assert from 'assert'
import * as firebase from 'firebase-admin'
import { Request, ResponseToolkit } from 'hapi'
import * as moment from 'moment-timezone'
import { App } from '../app/app'
import { IConfigPrivate } from '../types'
import { TContext } from './server'
import { Credentials } from 'google-auth-library/build/src/auth/credentials'

// POST /invite
export async function invite(this: TContext, req: Request, h: ResponseToolkit) {
  this.logger_info('/invite')

  const { email, uid } = await decodeFirebaseIDToken(
    this.app,
    req.payload['id_token']
  )
  if (!email) {
    h.response('ID token not valid').code(403)
  }
  await addInvitation(this.app, email, uid)

  return h.response().code(200)
}

// POST /signup
export async function signup(this: TContext, req: Request, h: ResponseToolkit) {
  this.logger_info('/signup')

  const { email, uid } = await decodeFirebaseIDToken(
    this.app,
    req.payload['id_token']
  )
  if (!email) {
    h.response('ID token not valid').code(403)
  }

  let is_valid = await isInvitationValid(this.app, uid)
  if (!is_valid) {
    return h.response('Invitation not valid').code(403)
  }

  const url = this.app.auth.generateAuthUrl({
    // will return a refresh token
    access_type: 'offline',
    prompt: 'consent',
    // @ts-ignore required to get the refresh_token every time
    approval_prompt: null,
    scope: this.app.config.google.scopes
  })
  return h.redirect(url + '&approval_prompt=force')
}

// GET /signup/done
export async function signupCallback(
  this: TContext,
  req: Request,
  h: ResponseToolkit
) {
  this.logger_info('/signup/done')
  const code = req.query['code']

  if (!code) {
    return h.response('Missing token code').code(400)
  }

  // request access tokens
  // const { tokens } = await this.app.auth.getToken(code)
  const tokens: Credentials = await new Promise((resolve, reject) =>
    // @ts-ignore
    this.app.auth.getToken(code, (err, tokens) => {
      if (err) {
        return reject(err)
      }
      resolve(tokens)
    })
  )
  this.logger_info('tokens fetched')

  if (process.env['TEST']) {
    return tokens
  }

  const email = await idTokenToEmail(this.app, tokens.id_token)
  if (!email) {
    return h.response('Email not confirmed or missing').code(400)
  }

  // save the new user to firebase
  const ip = getIP(req)
  await this.app.addAccount(tokens, email, ip, true)

  return h.redirect('/account')
}

// HELPER FUNCTIONS

/**
 * Get an (confirmed) email from an id_token.
 *
 * @param app
 * @param id_token
 * @param client_id Target audience, defaults to the website client_id
 */
async function idTokenToEmail(
  this: void,
  app: App,
  id_token: string,
  client_id = null
): Promise<string | null> {
  client_id = client_id || app.config.google.client_id

  const login_ticket = await app.auth.verifyIdToken({
    idToken: id_token,
    audience: client_id
  })

  const payload = login_ticket.getPayload()
  if (!payload.email_verified || !payload.email) {
    return null
  }
  return payload.email
}

/**
 * Decodes email and uid from a Firebase ID token.
 *
 * @param app
 * @param id_token
 */
async function decodeFirebaseIDToken(
  this: void,
  app: App,
  id_token: string
): Promise<{ uid: string; email: string }> {
  const payload = await firebase
    .auth()
    .verifyIdToken(id_token, app.config.firebase.admin.project_id)
  if (!payload.email_verified || !payload.email) {
    return null
  }
  return { email: payload.email, uid: payload.uid }
}

async function addInvitation(this: void, app: App, email: string, uid: string) {
  assert(email && email.includes('@'), 'Invalid email')
  assert(uid)

  const existing = await getInvitationByUID(app, uid)
  if (existing) {
    return false
  }

  // create a new invitation
  const invitation: TInvitation = {
    email,
    uid,
    time: moment()
      .utc()
      .unix(),
    active: false,
    email_sent: false
  }

  // set under the uid key
  await app.firebase
    .database()
    .ref(`invitations/${uid}`)
    .set(invitation)

  return true
}

export type TInvitation = {
  email: string
  email_sent: boolean
  time: number
  active: boolean
  // Firebase UID
  uid: string
}

async function isInvitationValid(
  this: void,
  app: App,
  uid: string
): Promise<boolean> {
  const invite = await getInvitationByUID(app, uid)
  return Boolean(invite && invite.active)
}

export async function getInvitationByEmail(
  app: App,
  email: string
): Promise<TInvitation | null> {
  const ref = await app.firebase
    .database()
    .ref('invitations')
    .orderByChild('email')
    .equalTo(email)
    .once('value')
  const invites = ref.val()
  if (!invites) {
    return null
  }
  const key = Object.keys(invites)[0]
  if (!key) {
    return null
  }
  return invites[key] as TInvitation
}

export async function getInvitationByUID(
  app: App,
  uid: string
): Promise<TInvitation | null> {

  const prev = await app.firebase
    .database()
    .ref(`invitations/${uid}`)
    .once('value')

  return (prev && prev.val()) || null
}

// TODO move to server.ts
function getIP(this: void, req: Request) {
  const xff_header = req.headers['x-forwarded-for']
  const ip = xff_header ? xff_header.split(',')[0] : req.info.remoteAddress
  return ip
}

export async function acceptInvites(
  this: void,
  config: IConfigPrivate,
  firebase: firebase.app.App,
  amount: number
): Promise<number> {
  const query_ref = await firebase
    .database()
    .ref('invitations')
    .orderByChild('time')
    .limitToFirst(amount)
    .once('value')
  const query_val:
    | { [index: string]: TInvitation }
    | undefined = query_ref.val()
  if (!query_val) {
    return 0
  }
  const wait = []
  for (const [key, invite] of Object.entries(query_val)) {
    wait.push(
      firebase
        .database()
        .ref(`invitations/${key}`)
        .update({ ...invite, active: true } as TInvitation)
    )
  }
  await Promise.all(wait)
  return wait.length
}
