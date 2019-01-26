import * as debug from 'debug'
import * as fs from 'fs'
import * as winston from 'winston'
import * as printf from 'printf'
// import { LoggingWinston as StackDriver } from '@google-cloud/logging-winston'

// @ts-ignore
const { combine, timestamp } = winston.format
// @ts-ignore
const winston_format = winston.format.printf(info => {
  return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`
})

export type level = 'info' | 'verbose' | 'error'
export type log_fn = (...msg: any[]) => void

// TODO  Split to ProdLogger and DevLogger
// TODO fix all the process.env['PROD'] and env['DEBUG_FILE']
export default class Logger {
  winston: winston.Logger

  // TODO read from env.DEBUG
  constructor() {
    // if (!isProd()) {
    try {
      fs.mkdirSync('logs')
    } catch (e) {}
    // }
    // const transports = isProd()
    //   ? [new StackDriver()]
    //   : [
    //       new winston.transports.File({
    //         filename: 'logs/error.log',
    //         level: 'error'
    //       }),
    //       new winston.transports.File({ filename: 'logs/combined.log' })
    //     ]
    const transports = [
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error'
      }),
      new winston.transports.File({ filename: 'logs/combined.log' })
    ]

    // @ts-ignore
    this.winston = winston.createLogger({
      level: 'verbose',
      // format: isProd()
      //   ? winston.format.json()
      //   : combine(timestamp(), winston_format),
      format: combine(timestamp(), winston_format),
      transports
    })
  }

  createLogger(name: string | TLoggerName, level: level = 'info'): log_fn {
    let base_labels: TLoggerName
    let name2: string
    if (typeof name == 'string') {
      base_labels = { name }
      name2 = name
    } else {
      base_labels = { ...name }
      name2 = `${base_labels.name}:${base_labels.user_id}`
    }
    const name_level = name2 + '-' + level
    // console.log(`Creating logger ${name_level}`)
    // keep level in the name only for the console logger
    const terminal = debug(name_level)
    return (...msgs) => {
      // First msg has to be a string
      msgs[0] = (msgs[0] && msgs[0].toString()) || ''
      // dont log to console on PROD, except for errors
      // if (!debug.disabled && (!isProd() || level == 'error')) {
      // @ts-ignore
      if (!debug.disabled) {
        // @ts-ignore
        terminal(...msgs)
      }
      // TODO temp
      console.log(name, ...msgs)
      // optional file logging
      if (!process.env['DEBUG_FILE']) return
      // const labels = { ...base_labels }
      // TODO a very bad way to add user_id to labels from json msgs
      // TODO broken by
      //   https://github.com/googleapis/nodejs-logging-winston/issues/85
      // for (const msg of msgs.slice(1)) {
      //   if (msg && msg['user_id']) {
      //     labels.user_id = msg.user_id
      //     break
      //   }
      // }
      let log_data = {
        // labels,
        labels: base_labels,
        // message: isProd() ? msgs : printf(...msgs),
        message: printf(...msgs),
        level
      }
      // provide `label` only for local (file) transports
      // if (!isProd()) {
      // @ts-ignore
      log_data.label = name2
      // }
      this.winston.log(log_data)
    }
  }
}

export type TLoggerName = {
  name: string
  user_id?: string
}
