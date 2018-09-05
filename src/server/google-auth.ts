import * as firebase from 'firebase-admin'
import { Request, ResponseToolkit } from 'hapi'
import { App } from '../app/app'
import { IAccount, IConfigPrivate } from '../types'
import { TContext } from './server'
import { Credentials } from 'google-auth-library/build/src/auth/credentials'

export type TInvitation = {
  remaining: number
  created: string
}

export type TInvitationsFB = {
  [code: string]: TInvitation
}

// POST /signup
export async function signup(this: TContext, req: Request, h: ResponseToolkit) {
  this.logger_info('/signup')

  const { email, uid } = await decodeFirebaseIDToken(
    this.app,
    req.payload['id_token']
  )
  if (!email) {
    return h.response('ID token not valid').code(403)
  }

  await this.app.createAccount(uid, email, getIP(req))

  return h.response().code(200)
}

// POST /authorize
export async function authorize(
  this: TContext,
  req: Request,
  h: ResponseToolkit
) {
  this.logger_info('/authorize')

  const { email, uid } = await decodeFirebaseIDToken(
    this.app,
    req.payload['id_token']
  )
  if (!email) {
    return h.response('ID token not valid').code(403)
  }

  const account = await this.app.getAccount(uid)
  if (!account.invitation_granted) {
    return h.response('Invitation not valid').code(403)
  }

  const url = this.app.auth.generateAuthUrl({
    // will return a refresh token
    access_type: 'offline',
    login_hint: email,
    prompt: 'consent',
    // @ts-ignore required to get the refresh_token every time
    approval_prompt: null,
    scope: this.app.config.google.scopes
  })
  return h.redirect(url + '&approval_prompt=force')
}

// GET /authorize/done
export async function authorizeCallback(
  this: TContext,
  req: Request,
  h: ResponseToolkit
) {
  this.logger_info('/authorize/done')
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

  const account = await this.app.getAccountByEmail(email)
  if (!account || account.email !== email) {
    return h.response('Account missing or wrong email').code(400)
  }

  await this.app.setGoogleAccessTokens(account.uid, tokens)
  // make sure syncing auto-starts
  await this.app.db
    .ref(`accounts/${account.uid}/client_data`)
    .update({ sync_enabled: true })
  return h.redirect('/account')
}

// POST /accept_invite
export async function acceptInvite(
  this: TContext,
  req: Request,
  h: ResponseToolkit
) {
  // code
  const code = req.payload['code']
  const invitations_ref = await this.app.db.ref(`invitations`).once('value')

  const invitations = invitations_ref.val() as TInvitationsFB
  const invitation = invitations && invitations[code]
  if (!invitation || invitation.remaining < 1) {
    return h.response('Code not valid').code(403)
  }
  // id_token
  const { email, uid } = await decodeFirebaseIDToken(
    this.app,
    req.payload['id_token']
  )
  if (!email) {
    return h.response('ID token not valid').code(403)
  }
  debugger
  // accept the account
  const account = await this.app.getAccount(uid)
  if (account && account.invitation_granted) {
    return h.response('Already invited').code(403)
  }
  await this.app.db
    .ref(`invitations/${code}`)
    .update({ remaining: invitation.remaining - 1 })
  await this.app.patchAccount(uid, {
    invitation_granted: true,
    invitation_code: code
  })

  return h.response().code(200)
}

// GET /remove_account
export async function removeAccount(
  this: TContext,
  req: Request,
  h: ResponseToolkit
) {
  // id_token
  const { email, uid } = await decodeFirebaseIDToken(
    this.app,
    req.payload['id_token']
  )
  if (!email) {
    return h.response('ID token not valid').code(403)
  }

  await this.app.db.ref(`accounts/${uid}`).remove()

  return h.response().code(200)
}

// POST /revoke_access
export async function revokeAccess(
  this: TContext,
  req: Request,
  h: ResponseToolkit
) {
  // id_token
  const { email, uid } = await decodeFirebaseIDToken(
    this.app,
    req.payload['id_token']
  )
  if (!email) {
    return h.response('ID token not valid').code(403)
  }

  // TODO type
  await this.app.db.ref(`accounts/${uid}/config/google`).update({
    access_token: null,
    refresh_token: null,
    id_token: null,
    token_type: null,
    scopes: null,
    expiry_date: null
  })

  // TODO call `auth2.disconnect();` on the user instance
  // TODO handle in app listeners?

  return h.response().code(200)
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

// TODO move to server.ts
function getIP(this: void, req: Request) {
  const xff_header = req.headers['x-forwarded-for']
  const ip = xff_header ? xff_header.split(',')[0] : req.info.remoteAddress
  return ip
}

export async function bulkAcceptInvites(
  this: void,
  config: IConfigPrivate,
  firebase: firebase.app.App,
  amount: number
): Promise<number> {
  // TODO optimize query
  const accounts_ref = await firebase
    .database()
    .ref('accounts')
    .once('value')
  const accounts = (accounts_ref.val() || {}) as { [uid: string]: IAccount }
  let accepted_amount = 0
  const wait = []
  for (const [uid, account] of Object.entries(accounts)) {
    if (accepted_amount >= amount) break
    if (account.invitation_granted) continue
    wait.push(
      firebase
        .database()
        .ref(`invitations/${uid}`)
        .update({ invitation_granted: true })
    )
    accepted_amount++
  }
  await Promise.all(wait)
  return accepted_amount
}
