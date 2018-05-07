// import { Logger as LoggerRemote } from 'ami-logger/remote'
import { Logger, Network, Granularity } from 'ami-logger'
import WorkerPoolMixin from 'ami-logger/mixins/workerpool'
import FileFSMixin from 'ami-logger/mixins/file-fs'
import { TAsyncMachine } from 'asyncmachine'
import 'source-map-support/register'
import settings_base from '../settings'
import settings_credentials from '../settings.credentials'
import create_repl from './repl'
import RootSync from './sync/root'
import { IConfig } from './types'
import * as os from 'os'

let root: RootSync
const settings = { ...settings_base, ...settings_credentials }

// TODO make it less global
function init_am_inspector(machines?: TAsyncMachine[]) {
  global.am_network = new Network(machines)
  // build the logger class
  let LoggerClass = FileFSMixin(Logger)
  if (os.cpus().length > 1) {
    LoggerClass = WorkerPoolMixin(LoggerClass)
  }
  global.am_logger = new LoggerClass(global.am_network, {
    granularity: Granularity.STATES
  })
  global.am_logger.start()
}

if (process.env['DEBUG_AMI']) {
  init_am_inspector()
}

process.on('SIGINT', exit)
process.on('exit', exit)

console.log('Starting the sync service...')
root = new RootSync((<any>settings) as IConfig)
root.state.add('Enabled')

let exit_printed = false
function exit(err?) {
  if (exit_printed) return
  if (global.am_network) {
    const filename = err.name
      ? 'logs/snapshot-exception.json'
      : 'logs/snapshot.json'
    global.am_logger.saveFile(filename)
    console.log(`Saved a snapshot to ${filename}`)
  }
  for (const machine of root.getMachines()) {
    console.log(machine.statesToString(true))
  }
  if (root.data) {
    console.log(root.data.toString())
  }
  console.log(`Restarts count: ${root.restarts_count}`)
  exit_printed = true
  process.exit()
}

// create_repl(root, init_am_inspector, settings.repl_port)
