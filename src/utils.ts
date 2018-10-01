import { TAsyncMachine } from 'asyncmachine'
import * as debug from 'debug'
import Logger from './app/logger'

export function machineLogToDebug(
  logger: Logger,
  machine: TAsyncMachine,
  user_id?: string
) {
  const name = machine.id(true) + '-am'
  // TODO https://github.com/googleapis/nodejs-logging-winston/issues/85
  // const logger_name = user_id ? { name, user_id } : name
  const logger_name = `${name}:${user_id}`
  const log = logger.createLogger(logger_name, 'verbose')
  machine.log_handlers.push((msg, level) => {
    if (level > (process.env['DEBUG_AM'] || 1)) return
    log(msg)
  })
}

export type TUnboxPromise<T> = T extends Promise<infer U> ? U : T;

export function isProdEnv() {
  return process.env['TB_ENV'] == 'production'
}

export function isStagingEnv() {
  return process.env['TB_ENV'] == 'staging'
}

export function isDevEnv() {
  return process.env['TB_ENV'] == 'dev' || !process.env['TB_ENV']
}

export function isTestEnv() {
  return process.env['TB_ENV'] == 'test' || process.env['TEST']
}
