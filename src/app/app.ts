// import { Logger as LoggerRemote } from 'ami-logger/remote'
import { Logger, Network, Granularity } from 'ami-logger'
import WorkerPoolMixin from 'ami-logger/mixins/workerpool'
import FileFSStreamMixin from 'ami-logger/mixins/snapshot/fs-stream'
import { TAsyncMachine } from 'asyncmachine'
import * as fs from 'fs'
import * as debug from 'debug'
// import 'source-map-support/register'
import settings_base from '../settings'
import settings_credentials from '../settings.credentials'
import * as deepmerge from 'deepmerge'
import create_repl from './repl'
import RootSync from '../sync/root'
import { IConfig } from '../types'
// import * as os from 'os'
import * as _ from 'lodash'
import server from '../server/server'

const syncs: RootSync[] = []
const config: IConfig = <any>merge(config_base, config_credentials)

// TODO make it less global
function init_am_inspector(machines?: TAsyncMachine[]) {
  // TODO avoid globals
  global.am_network = new Network(machines)
  // build the logger class
  let LoggerClass = AMILogger
  LoggerClass = FileFSStreamMixin(LoggerClass)
  LoggerClass = RemoteNodeLoggerMixin(LoggerClass)
  // if (os.cpus().length > 1) {
  //   LoggerClass = WorkerPoolMixin(LoggerClass)
  // }
  // TODO avoid globals
  global.am_logger = new LoggerClass(
    global.am_network,
    // @ts-ignore
    {
      // granularity: Granularity.STATES,
      stream: fs.createWriteStream('logs/snapshot.json')
      // url: 'http://localhost:3757/'
    }
  )
  // TODO avoid globals
  global.am_logger.start()
}

if (process.env['DEBUG_AMI']) {
  init_am_inspector()
}

process.on('SIGINT', exit)
process.on('exit', exit)

console.log('Starting the sync service...')
// TODO APP CLASS
const logger = new Logger()
server(config, logger)
const connections = new Connections(logger)
for (const user of users) {
  const config_user = merge(config, user)
  const sync = new RootSync(config_user, logger, connections)
  // jump out of this tick
  sync.state.addNext('Enabled')
  syncs.push(sync)
}
// TODO /APP CLASS

let exit_printed = false
async function exit() {
  if (exit_printed) return
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
  for (const sync of syncs) {
    console.log(`\nUser ${sync.config.user.id}: ${sync.config.google.username}`)
    console.log(sync.getMachines())
    const data = sync.data.toString()
    if (data.trim()) {
      console.log(
        `\nUser ${sync.config.user.id}: ${sync.config.google.username}`
      )
      console.log(data)
    }
    console.log(`\nUser ${sync.config.user.id}: ${sync.config.google.username}`)
    console.log(`Restarts count: ${sync.restarts_count}`)
  }
  // TODO mark which loggers are enabled
  // TODO rename user_id to * and dont output same loggers for every user
  // @ts-ignore
  const loggers = _(debug.instances)
    .map(logger => logger.namespace.replace(/:\d+-/, ':*-'))
    .concat('record-diffs')
    .uniq()
    .sortBy()
    .value()
    .join('\n  ')
  console.log('\nLoggers:\n ', loggers)
  exit_printed = true
  process.exit()
}

create_repl(syncs, connections, logger, init_am_inspector, config.repl_port)
