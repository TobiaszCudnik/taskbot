import { OAuth2Client } from 'google-auth-library'

// @ts-ignore
import { auth } from 'googleapis'
// import { reply } from 'server'
import { Request, ResponseToolkit, Server } from 'hapi'
import { Credentials } from 'google-auth-library/build/src/auth/credentials'
import { IConfig } from '../types'
import { App } from '../app/app'
import { TContext } from './server'

// const { redirect, send, status } = reply

let client

function getClient(ctx): OAuth2Client {
  if (client) return client
  const config: IConfig = ctx.config

  client = new auth.OAuth2(
    config.google.client_id,
    config.google.client_secret,
    config.google.redirect_url
  )
  return client
}

// /google/login
export function signup(this: TContext, req: Request, h: ResponseToolkit) {
  this.logger_info('/signup')

  if (!this.app.isInvitationValid(req.params['invitation_code'])) {
    // TODO 403 page
    return h.redirect('/')
  }

  // @ts-ignore
  const url = getClient(this).generateAuthUrl({
    // will return a refresh token
    access_type: 'offline',
    scope: this.config.google.scopes
  })
  return h.redirect(url + '&approval_prompt=force')
}

// /google/login/callback
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

  // request access token
  // TODO merge with the email address and user ID
  const tokens: Credentials = await new Promise((resolve, reject) =>
    // @ts-ignore
    getClient(this).getToken(code, (err, tokens) => {
      if (err) {
        return reject(err)
      }
      resolve(tokens)
    })
  )
  this.logger_info('tokens fetched')
  if (process.env['TEST']) {
    // TODO json mime type
    return h.response(tokens)
  }
  const id_token = await new Promise((resolve, reject) => {
    // @ts-ignore
    getClient(this).verifyIdToken(
      tokens.id_token,
      this.config.google.client_id,
      (err, ret) => {
        if (err) return reject(err)
        resolve(ret)
      }
    )
  })
  // @ts-ignore
  const payload = id_token.getPayload()
  debugger // TODO
  if (!payload.email_verified || !payload.email) {
    return h.response('Email not confirmed or missing').code(400)
  }
  // save the new user to firebase
  const xff_header = req.headers['x-forwarded-for']
  const ip = xff_header ? xff_header.split(',')[0] : req.info.remoteAddress
  this.app.addUser(tokens, payload.email, ip)

  // TODO redir to a success page with some docs
  return h.response(tokens)
}
