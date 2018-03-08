import { Logger } from 'ami-logger/remote'
import * as net from 'net'
import * as repl from 'repl'
import { REPLServer } from 'repl'
import RootSync from './sync/root'

export { REPLServer }

export default function create(
  root: RootSync,
  init_am_inspector: (machines?: any[]) => Logger
) {
  let r
  net
    .createServer(function(socket) {
      r = repl.start('> ')
      r.context.root = root
      r.context.init_am_inspector = init_am_inspector
      return r
    })
    .listen(5001, 'localhost')
  return r
}
