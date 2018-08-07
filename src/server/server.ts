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
  const port = process.env['PROD'] ? 80 : 8080
  console.log(`Starting the HTTP server on ${port}`)

  const server = new Server({
    host: '0.0.0.0',
    port: port
  })

  // Add the route
  server.route([
    {
      method: 'GET',
      path: '/_ah/health',
      handler: function(request, h) {
        const res = h.response('')
        res.code(200)
      }
    },
    {
      method: 'GET',
      path: '/',
      handler: function(request, h) {
        const res = h.response('TaskBot is coming...')
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
      path: '/google/login/callback',
      handler: (req, h) => {
        const file = readFileSync('./static/privacy-policy.html')
        const res = h.response(file)
      }
    }
  ])
}

// export default async function(config, logger: Logger) {
//   const logger_info = logger.createLogger('http-server', 'info')
//   const logger_error = logger.createLogger('http-server', 'error')
//   const port = process.env['PROD'] ? 80 : 8080
//   console.log(`Starting the HTTP server on ${port}`)
//
//   await server(
//     {
//       port,
//       public: 'static'
//     },
//     ctx => {
//       ctx.config = config
//       ctx.logger = logger_info
//     },
//     [
//       // GAE health check
//       get('/_ah/health', ctx => 200),
//       get('/', ctx => send('TaskBot is coming...')),
//       get('/google/login', google_login.login),
//       get('/google/login/callback', google_login.callback),
//       get('/privacy-policy', ctx =>
//         type('html').send(readFileSync('./static/privacy-policy.html'))
//       ),
//       // 404
//       get(ctx => 404),
//       // GLOBAL ERROR HANDLER
//       error(ctx => {
//         // TODO ctx.error not needed?
//         if (ctx.error) {
//           logger_error('Global HTTP server error handler: %O', ctx.error)
//         }
//       })
//     ],
//     ctx => {
//       // dont log health checks
//       if (ctx.url == '/_ah/health') return
//       logger_info('GET %s %s', ctx.res.statusCode, ctx.url)
//     }
//   )
// }
