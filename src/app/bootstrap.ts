// import { Logger as LoggerRemote } from 'ami-logger/remote'
import { Granularity, Logger as AMILogger, MachineNetwork } from 'ami-logger'
// @ts-ignore
import FileFSStreamMixin from 'ami-logger/mixins/snapshot/fs-stream'
// TODO fix the default exports
// @ts-ignore
// import RemoteNodeLoggerMixin from 'ami-logger/mixins/remote-node'
import WorkerPoolMixin from 'ami-logger/mixins/workerpool'
import { TAsyncMachine } from 'asyncmachine'
import * as debug from 'debug'
import * as merge from 'deepmerge'
import * as fs from 'fs'
// import * as os from 'os'
import * as _ from 'lodash'
import * as os from 'os'
import 'source-map-support/register'
import config_base from '../../config'
import config_credentials from '../../config-private'
import config_www from '../../www/config.json'
import server from '../server/server'
import { IConfig, IConfigWWW } from '../types'
import { App } from './app'
import Connections from './connections'
import Logger from './logger'
import create_repl from './repl'

const config: IConfig = <any>merge(config_base, config_credentials)
config.www = config_www as IConfigWWW

// TODO make it less global
function init_am_inspector(machines?: TAsyncMachine[]) {
  // create the network
  global.am_network = new MachineNetwork(machines)

  // build the logger class
  let LoggerClass = AMILogger

  // save to a file
  // LoggerClass = FileFSStreamMixin(LoggerClass)

  // LoggerClass = RemoteNodeLoggerMixin(LoggerClass)

  // spread diffing among worker threads
  if (os.cpus().length > 1) {
    LoggerClass = WorkerPoolMixin(LoggerClass)
  }
  global.am_logger = new LoggerClass(
    global.am_network,
    // @ts-ignore
    {
      // granularity: Granularity.STATES,
      stream: fs.createWriteStream('logs/snapshot.json')
      // url: 'http://localhost:3757/'
    }
  )
  // start logging
  global.am_logger.start()
}

if (process.env['DEBUG_AMI']) {
  init_am_inspector()
}

process.on('SIGINT', exit)
process.on('exit', exit)

console.log('Starting the sync service...')
// TODO move to app.ts
const logger = new Logger()
const connections = new Connections(logger)
const app = new App(config, logger, connections)
server(logger, app)

let exit_printed = false
async function exit() {
  if (exit_printed) return
  // console.dir(global.times)
  exit_printed = true

  // TODO avoid globals
  if (global.am_network) {
    // const filename = err.name
    //   ? 'logs/snapshot-exception.json'
    //   : 'logs/snapshot.json'
    // global.am_logger.saveFile(filename)
    // console.log(`Saved a snapshot to ${filename}`)
    // TODO avoid globals
    await global.am_logger.dispose()
    console.log(`Saved a snapshot to logs/snapshot.json`)
  }
  // TODO debug
  process.exit()
  for (const sync of Object.values(app.syncs)) {
    console.log(`\nUser ${sync.config.user.id}: ${sync.config.google.username}`)
    console.log(sync.getMachines())
    const data = (sync.data && sync.data.toString()) || ''
    if (data.trim()) {
      console.log(
        `\nUser ${sync.config.user.id}: ${sync.config.google.username}`
      )
      console.log(data)
      const subs = sync.subs.google.subs
      console.log(subs.gmail.toString())
      console.log(subs.tasks.toString())
    }
    console.log(`\nUser ${sync.config.user.id}: ${sync.config.google.username}`)
    console.log(`Restarts count: ${sync.restarts_count}`)
  }
  // TODO mark which loggers are enabled
  // TODO rename user_id to * and dont output same loggers for every user
  // @ts-ignore
  const loggers = _(debug.instances)
    .map(logger => logger.namespace.replace(/:\d+-/, ':*-'))
    .concat('record-diff')
    .uniq()
    .sortBy()
    .value()
    .join('\n  ')
  console.log('\nLoggers:\n ', loggers)
  // TODO extract
  // TODO add info about exceeded quotas
  exit_printed = true
  process.exit()
}

// TODO move to app
create_repl(app.syncs, connections, logger, init_am_inspector, config.repl_port)
