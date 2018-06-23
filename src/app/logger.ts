// TODO wait for winston3 types

import * as debug from 'debug'
import * as winston from 'winston'
import * as printf from 'printf'
import { LoggingWinston as StackDriver } from '@google-cloud/logging-winston'

// @ts-ignore
const { combine, timestamp } = winston.format
// @ts-ignore
const winston_format = winston.format.printf(info => {
  return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`
})

export type level = 'info' | 'verbose' | 'error'
export type log_fn = (...msg: any[]) => void

export default class Logger {
  winston: winston.Logger

  // TODO read from env.DEBUG
  constructor() {
    const transports = process.env.PROD
      ? [
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error'
          }),
          new winston.transports.File({ filename: 'logs/combined.log' })
        ]
      : [new StackDriver()]
    // @ts-ignore
    this.winston = winston.createLogger({
      level: 'verbose',
      // @ts-ignore
      // format: winston.format.json(),
      // format: winston.format.simple(),
      format: combine(timestamp(), winston_format),
      transports
    })
  }

  createLogger(name, level: level = 'info'): log_fn {
    const suffix = '-' + level
    const terminal = debug(name + suffix)
    return (...msgs) => {
      msgs[0] = (msgs[0] && msgs[0].toString()) || ''
      terminal(...msgs)
      // optional file logging
      if (!process.env.DEBUG_FILE) return
      // @ts-ignore
      this.winston.log({
        label: name,
        message: printf(...msgs),
        level
      })
    }
  }
}
