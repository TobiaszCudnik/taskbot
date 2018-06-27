// @ts-ignore
import { auth } from 'googleapis'
import { reply } from 'server'
import { IConfig } from '../types'

const { redirect, send, status } = reply

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
export function login(ctx) {
  ctx.logger('/google/login')

  // @ts-ignore
  const url = getClient(ctx).generateAuthUrl({
    // will return a refresh token
    access_type: 'offline',
    scope: ctx.config.google.scopes
  })
  return redirect(url + '&approval_prompt=force')
}

// /google/login/callback
export async function callback(ctx) {
  ctx.logger('/google/login/callback')

  if (!ctx.query.code) {
    return status(400).send('No token')
  }
  // request access token
  // TODO merge with the email address and user ID
  const tokens = await new Promise(resolve =>
    // @ts-ignore
    getClient(ctx).getToken(ctx.query.code, function(err, tokens) {
      if (err) console.error(err)
      resolve(tokens)
    })
  )
  ctx.logger('tokens fetched')
  return send(tokens)
}
