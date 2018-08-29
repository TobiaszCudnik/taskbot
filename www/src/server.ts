import * as next from 'next'
import * as hapi from 'hapi'
import {
  defaultHandlerWrapper,
  nextHandlerWrapper
} from './next-wrapper'

const app = next({ dir: 'www' })

export default async function(server: hapi.Server) {
  await app.prepare()

  console.log('Starting the next.js server')

  server.route({
    method: 'GET',
    path: '/_next/{p*}' /* next specific routes */,
    handler: nextHandlerWrapper(app)
  })

  server.route({
    method: 'GET',
    path: '/{p*}' /* catch all route */,
    handler: defaultHandlerWrapper(app)
  })
}
