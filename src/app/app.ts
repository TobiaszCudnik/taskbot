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

let root: RootSync
const config: IConfig = <any>deepmerge(settings_base, settings_credentials)

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
const connections = new Connections(logger)
for (const user of config.google.users) {
  root = new RootSync(config, user, logger, connections)
  // jump out of this tick
  root.state.addNext('Enabled')
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
  for (const machine of root.getMachines()) {
    console.log(machine.statesToString(true))
  }
  if (root.data) {
    console.log(root.data.toString())
  }
  const loggers = _(debug.instances)
    .map(logger => logger.namespace)
    .concat('record-diffs')
    .uniq()
    .sortBy()
    .value()
    .join('\n  ')
  console.log('\nLoggers:\n ', loggers)
  console.log(`\nRestarts count: ${root.restarts_count}`)
  exit_printed = true
  process.exit()
}

// create_repl(root, init_am_inspector, settings.repl_port)
