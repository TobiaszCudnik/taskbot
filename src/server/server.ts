import * as server from 'server'
import * as google_login from './google-login'

const { get, post } = server.router

// TODO logger
export default function(config) {
  // server({ port: 80 }, [get('/_ah/health', ctx => status(200).send())]),
  server(
    { port: process.env['PROD'] ? 80 : 8080 },
    ctx => (ctx.config = config),
    [
      // GAE health check
      get('/_ah/health', ctx => 200),
      get('/google/login', google_login.login),
      get('/google/login/callback', google_login.callback)
    ]
  )
}
