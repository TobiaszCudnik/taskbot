import * as assert from 'assert'
import { Request, ResponseToolkit, Server } from 'hapi'
import * as moment from 'moment-timezone'
import { App } from '../app/app'
import { TContext } from './server'

// POST /invite
export async function invite(this: TContext, req: Request, h: ResponseToolkit) {
  const email = await idTokenToEmail(this.app, req.payload['id_token'])
  if (!email) {
    h.response().code(403)
  }
  await addInvite(this.app, email)
  return h.response().code(200)
}

// POST /signup
export async function signup(this: TContext, req: Request, h: ResponseToolkit) {
  this.logger_info('/signup')

  const email = await idTokenToEmail(this.app, req.payload['id_token'])
  if (!email) {
    h.response('ID token not valid').code(403)
  }
  let is_valid = await isInvitationValid(this.app, email)
  if (!is_valid) {
    return h.response('Invitation not valid').code(403)
  }

  const url = this.app.auth.generateAuthUrl({
    // will return a refresh token
    access_type: 'offline',
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
  const { tokens } = await this.app.auth.getToken(code)
  this.logger_info('tokens fetched')

  if (process.env['TEST']) {
    return tokens
  }

  const email = await idTokenToEmail(
    this.app,
    tokens.id_token,
    this.app.config.google.client_id
  )
  if (!email) {
    return h.response('Email not confirmed or missing').code(400)
  }

  // save the new user to firebase
  const ip = getIP(req)
  await this.app.addUser(tokens, email, ip)

  return h.redirect('/welcome')
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
  client_id = client_id || app.config.google_website.client_id
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

async function addInvite(this: void, app: App, email: string) {
  assert(email && email.includes('@'), 'Invalid email')

  // check if the invitation already exists
  const query = await app.firebase
    .database()
    .ref('invitations')
    .orderByChild('email')
    .equalTo(email)
    .once('value')
  const invites = query.val()

  if (invites) {
    const key = Object.keys(invites)[0]
    if (key) {
      // invitation already exists
      return false
    }
  }

  // create a new invitation
  // TODO type
  const entry = {
    email,
    time: moment()
      .utc()
      .toISOString(),
    active: false,
    fulfilled: false
  }
  const push = app.firebase
    .database()
    .ref('invitations')
    .push()
  await push.set(entry)

  return true
}

async function isInvitationValid(this: void, app: App, email: string) {
  const invite = await getInvitation(app, email)
  return invite.val.active
}

export async function getInvitation(app: App, email: string) {
  const ref = await app.firebase
    .database()
    .ref('invitations')
    .orderByChild('email')
    .equalTo(email)
    .once('value')
  const invites = ref.val()
  const key = Object.keys(invites)[0]
  if (!key) {
    return null
  }
  return {
    ref: invites,
    val: invites[key]
  }
}

function getIP(this: void, req: Request) {
  const xff_header = req.headers['x-forwarded-for']
  const ip = xff_header ? xff_header.split(',')[0] : req.info.remoteAddress
  return ip
}
