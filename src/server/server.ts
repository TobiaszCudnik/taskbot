import { readFileSync } from 'fs'
import * as server from 'server'
import Logger from '../app/logger'
import * as google_login from './google-login'
import { router, reply, utils } from 'server'

const { get, error } = router
const { send, type } = reply
const { modern } = utils

export default async function(config, logger: Logger) {
  const logger_info = logger.createLogger('http-server', 'info')
  const logger_error = logger.createLogger('http-server', 'error')
  const port = process.env['PROD'] ? 80 : 8080
  console.log(`Starting the HTTP server on ${port}`)

  await server(
    {
      port,
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
      // 404
      get(ctx => 404),
      // GLOBAL ERROR HANDLER
      error(ctx => {
        // TODO ctx.error not needed?
        if (ctx.error) {
          logger_error('Global HTTP server error handler: %O', ctx.error)
        }
      })
    ],
    ctx => {
      logger_info('GET %s %s', ctx.res.statusCode, ctx.url)
    }
  )
}
