// @ts-ignore
import { OAuth2Client } from 'googleapis'
import { reply } from 'server'

const { redirect, send } = reply

let client

function getClient(ctx) {
  if (client) return client

  client = new OAuth2Client(
    ctx.config.credentials.google.client_id,
    ctx.config.credentials.google.client_secret,
    ctx.config.credentials.google.redirect_url
  )
}

export function login(ctx) {
  const url = getClient(ctx).generateAuthUrl({
    access_type: 'offline', // will return a refresh token
    scope: ctx.config.google.scopes
  })
  redirect(url + '&approval_prompt=force')
}

export function callback(ctx) {
  if (!ctx.query.code) {
    send('No token')
  }
  // request access token
  getClient(ctx).getToken(ctx.query.code, function(err, tokens) {
    if (err) console.error(err)
    send(tokens)
  })
}
