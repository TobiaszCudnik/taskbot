import { readFileSync } from 'fs'
import * as path from 'path'
import { App } from '../app/app'
import Logger, { log_fn } from '../app/logger'
import { IConfig } from '../types'
import * as google_login from './google-login'
// import { router, reply, utils } from 'server'
import { Server, Request, ResponseToolkit } from 'hapi'
import * as inert from 'inert'

// const { get, error } = router
// const { send, type } = reply

export type TContext = {
  logger_info: log_fn
  logger_error: log_fn
  config: IConfig
  app: App
}

export default async function(config: IConfig, logger: Logger, app: App) {
  const logger_info = logger.createLogger('http-server', 'info')
  const logger_error = logger.createLogger('http-server', 'error')

  const port = 8080
  console.log(`Starting the HTTP server on ${port}`)

  const context: TContext = {
    logger_info,
    logger_error,
    config,
    app
  }

  const server = new Server({
    port,
    routes: {
      files: {
        relativeTo: path.join(process.cwd(), 'www')
      }
    }
  })
  await server.register(inert)
  console.log(`HTTP started at ${server.info.uri}`)
  server.bind(context)

  // Add the route
  server.route([
    {
      method: 'GET',
      path: '/_ah/health',
      handler: function(request, h) {
        const res = h.response('')
        return res.code(200)
      }
    },
    {
      method: 'GET',
      path: '/signup',
      handler: google_login.signup
    },
    {
      method: 'POST',
      path: '/invite',
      handler: function(this: TContext, req: Request, h: ResponseToolkit) {
        this.logger_info('/invite')
        this.app.addInvite(req.payload['email'])
        return h.redirect('./requested')
      }
    },
    {
      method: 'GET',
      path: '/signup/done',
      handler: google_login.signupCallback
    },
    {
      method: 'GET',
      path: '/privacy-policy',
      handler: (req, h: ResponseToolkit) => {
        return h.file('./privacy-policy.html')
      }
    },
    {
      method: 'GET',
      path: '/requested',
      handler: (req, h: ResponseToolkit) => {
        return h.file('./requested.html')
      }
    },
    {
      method: 'GET',
      path: '/{param*}',
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
    // @ts-ignore

    if (!response.isBoom) {
      // if not error then continue :)
      return reply.continue
    }

    // error
    // @ts-ignore
    logger_info(request.url.toString())
    logger_error(response)
    console.dir(response)
    return reply.continue
  })
  await server.start()
}
