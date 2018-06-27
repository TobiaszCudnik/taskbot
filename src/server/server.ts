import { readFileSync } from 'fs'
import * as server from 'server'
import Logger from '../app/logger'
import * as google_login from './google-login'
import { router, reply } from 'server'

const { get, error } = router
const { send, type } = reply

// TODO logger
export default function(config, logger: Logger) {
  const logger_info = logger.createLogger('http-server', 'info')
  const logger_error = logger.createLogger('http-server', 'error')
  console.log('Starting the HTTP server')

  server(
    {
      port: process.env['PROD'] ? 80 : 8080,
      public: 'static'
    },
    ctx => {
      ctx.config = config
      ctx.logger = logger_info
    },
    [
      // GAE health check
      get('/_ah/health', ctx => 200),
      get('/', ctx => send('TaskBot is coming...')),
      get('/google/login', google_login.login),
      get('/google/login/callback', google_login.callback),
      get('/privacy-policy', ctx =>
        type('html').send(readFileSync('./static/privacy-policy.html'))
      ),
      // GLOBAL ERROR HANDLER
      error(ctx => {
        if (ctx.error) {
          console.log('Global HTTP server error handler:')
          console.error(ctx.error)
          logger_error(ctx.error)
        }
      })
    ]
  )
}
