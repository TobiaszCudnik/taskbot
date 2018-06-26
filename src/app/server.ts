import * as server from 'server'

const { get, post } = server.router
const { status } = server.reply

// TODO logger
export default function() {
  // server({ port: 80 }, [get('/_ah/health', ctx => status(200).send())]),
  server({ port: 80 }, [get('/_ah/health', ctx => 200)])
}
