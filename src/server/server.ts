import { readFileSync } from 'fs'
import Logger from '../app/logger'
import * as google_login from './google-login'
// import { router, reply, utils } from 'server'
import { Server } from 'hapi'

// const { get, error } = router
// const { send, type } = reply

export default async function(config, logger: Logger) {
  const logger_info = logger.createLogger('http-server', 'info')
  const logger_error = logger.createLogger('http-server', 'error')
  // const port = process.env['PROD'] ? 80 : 8080
  const port = 8080
  console.log(`Starting the HTTP server on ${port}`)
  // TODO type
  const context = {
    logger_info,
    logger_error,
    config
  }

  const server = new Server({ port })
  await server.start()
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
      path: '/',
      handler: function(request, h) {
        return h.response('TaskBot is coming...')
      }
    },
    {
      method: 'GET',
      path: '/google/login',
      handler: google_login.login
    },
    {
      method: 'GET',
      path: '/google/login/callback',
      handler: google_login.callback
    },
    {
      method: 'GET',
      path: '/privacy-policy',
      handler: (req, h) => {
        const file = readFileSync('./static/privacy-policy.html')
        return h.response(file)
      }
    }
  ])
}
