import { TAsyncMachine } from 'asyncmachine'
import * as debug from 'debug'
import Logger from './app/logger'
import { TRawEmail } from './types'
import { Base64 } from 'js-base64'

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

export type TRawEmailInput = {
  from: string | [string, string]
  to: string
  subject: string
}

export function createRawEmail(
  input: TRawEmailInput,
  content?: string
): TRawEmail {
  let email = [
    `From: ${
      Array.isArray(input) ? `${input.from[0]} <${input.from[1]}>` : input.from
    }`,
    `To: ${input.to}`,
    'Content-type: text/plain;charset=utf-8',
    'Content-Transfer-Encoding: quoted-printable',
    'MIME-Version: 1.0',
    `Subject: ${input.subject}`
  ].join('\r\n')

  if (content) {
    email += `\r\n\r\n${content.replace(`\n`, `\r\n`)}`
  }
  return Base64.encodeURI(email) as TRawEmail
}
