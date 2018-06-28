import { TAsyncMachine } from 'asyncmachine'
import * as debug from 'debug'
import Logger from './app/logger'

export function machineLogToDebug(
  logger: Logger,
  machine: TAsyncMachine,
  user_id?: number
) {
  const name = machine.id(true) + '-am'
  const logger_name = user_id ? { name, user_id } : name
  const log = logger.createLogger(logger_name, 'verbose')
  machine.log_handlers.push((msg, level) => {
    if (level > (process.env['DEBUG_AM'] || 1)) return
    log(msg)
  })
}
