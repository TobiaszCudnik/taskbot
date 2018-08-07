// @ts-ignore
import { auth } from 'googleapis'
// import { reply } from 'server'
import { Request, ResponseToolkit, Server } from 'hapi'
import { IConfig } from '../types'

// const { redirect, send, status } = reply

let client

function getClient(ctx): object {
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
export function login(req: Request, h: ResponseToolkit) {
  this.logger_info('/google/login')

  // @ts-ignore
  const url = getClient(this).generateAuthUrl({
    // will return a refresh token
    access_type: 'offline',
    scope: this.config.google.scopes
  })
  return h.redirect(url + '&approval_prompt=force')
}

// /google/login/callback
export async function callback(req: Request, h: ResponseToolkit) {
  this.logger_info('/google/login/callback')
  const code = req.query['code']

  if (!code) {
    return h.response('Missing token code').code(400)
  }

  // request access token
  // TODO merge with the email address and user ID
  const tokens = await new Promise((resolve, reject) =>
    // @ts-ignore
    getClient(this).getToken(code, function(err, tokens) {
      if (err) {
        this.logger_error(err)
        console.error(err)
        reject(null)
      }
      resolve(tokens)
    })
  )
  this.logger_info('tokens fetched')
  // json mime type
  return h.response(tokens)
}
