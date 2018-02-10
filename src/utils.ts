import AsyncMachine from "asyncmachine";
import * as debug from 'debug'

export function machineLogToDebug(machine: AsyncMachine<any, any, any>) {
  const logger = debug(machine.id(true)+'-am')
  machine.log_handlers.push( (msg, level) => {
    if (level > (process.env['DEBUG_AM'] || 1))
      return
    logger(msg)
  })
}
