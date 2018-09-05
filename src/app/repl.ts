import { TAsyncMachine } from 'asyncmachine'
import * as net from 'net'
import * as repl from 'repl'
import { REPLServer } from 'repl'
import RootSync from '../sync/root'
import Connections from './connections'
import Logger from './logger'

export { REPLServer }

export default function create(
  syncs: { [uid: string]: RootSync },
  connections: Connections,
  logger: Logger,
  init_am_inspector: (machines?: TAsyncMachine[]) => void,
  port = 5001
) {
  console.log(`Starting REPL on ${port}`)
  let r
  net
    .createServer(socket => {
      r = repl
        .start({
          prompt: '> ',
          input: socket,
          output: socket,
          // TODO test
          terminal: true
        })
        .on('exit', () => {
          socket.end()
        })
      r.context.syncs = syncs
      r.context.connections = connections
      r.context.logger = logger
      r.context.init_am_inspector = init_am_inspector
      return r
    })
    .listen(port, 'localhost')
  return r
}
