import * as path from 'path'
import { App } from '../app/app'
import Logger, { log_fn } from '../app/logger'
import * as google_login from './google-auth'
import { Server, Request } from 'hapi'
import * as inert from 'inert'
import www_start from '../../www/src/server'

export type TContext = {
  logger_info: log_fn
  logger_error: log_fn
  app: App
}

export default async function(logger: Logger, app: App) {
  const logger_info = logger.createLogger('http-server', 'info')
  const logger_error = logger.createLogger('http-server', 'error')

  const port = 8080
  console.log(`Starting the HTTP server on ${port}`)

  // static file server
  const server = new Server({
    port,
    routes: {
      files: {
        relativeTo: path.join(process.cwd(), 'www/static')
      }
    }
  })
  await server.register(inert)

  // global context
  const context: TContext = {
    logger_info,
    logger_error,
    app
  }
  server.bind(context)

  // routes
  server.route([
    // appengine
    {
      method: 'GET',
      path: '/_ah/health',
      handler: function(request, h) {
        const res = h.response('')
        return res.code(200)
      }
    },
    // google
    {
      method: 'POST',
      path: '/signup',
      handler: google_login.signup
    },
    {
      method: 'POST',
      path: '/authorize',
      handler: google_login.authorize
    },
    {
      method: 'GET',
      path: '/authorize/done',
      handler: google_login.authorizeCallback
    },
    {
      method: 'GET',
      path: '/accept_invite',
      handler: google_login.acceptInvite
    },
    {
      method: 'GET',
      path: '/remove_account',
      handler: google_login.removeAccount
    },
    // /www/static
    {
      method: 'GET',
      path: '/static/{param*}',
      handler: {
        directory: {
          path: '.',
          redirectToSlash: true,
          index: true
        }
      }
    }
  ])

  // error handler
  server.ext('onPreResponse', (request: Request, reply: any) => {
    const response = request.response

    // no error
    // @ts-ignore
    if (!response.isBoom) {
      return reply.continue
    }

    // error
    logger_info(request.url.toString())
    logger_error(response)
    // TODO log the stack trace
    console.dir(response)

    return reply.continue
  })

  // nextjs server
  await www_start(server)

  // start listening
  await server.start()

  console.log(`HTTP started at ${server.info.uri}`)
}
