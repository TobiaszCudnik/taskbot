import * as debug from 'debug'
import * as winston from 'winston'
import * as printf from 'printf'

const { combine, timestamp } = winston.format
const winston_format = winston.format.printf(info => {
  return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`
})

export type level = 'info' | 'verbose' | 'error'
export type log_fn = (...msg: any[]) => void

export default class Logger {
  winston: winston.Winston

  // TODO read from env.DEBUG
  constructor() {
    // TODO add timestamp and the name to entries
    // @ts-ignore
    this.winston = winston.createLogger({
      level: 'verbose',
      // @ts-ignore
      // format: winston.format.json(),
      // format: winston.format.simple(),
      format: combine(timestamp(), winston_format),
      transports: [
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error'
        }),
        new winston.transports.File({ filename: 'logs/combined.log' })
      ]
    })
  }

  createLogger(name, level: level = 'info'): log_fn {
    const console = debug(name)
    return (...msgs) => {
      console(...msgs)
      // optional file logging
      if (!process.env.DEBUG_FILE) return
      // @ts-ignore TODO wait for winston3 types
      this.winston.log({
        label: name,
        // TODO better printf
        message: printf(...msgs),
        level
      })
    }
  }
}
