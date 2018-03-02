import 'source-map-support/register'
import * as debug from 'debug'
// import settings from '../settings'
import settings_debug from '../settings-debug'
import settings_credentials from '../settings.credentials'
import RootSync from './sync/root'
import { Logger, Network } from 'ami-logger/remote'
import { IConfig } from './types'

// const app_settings = process.env['DEBUG'] ? settings_debug : settings

let root: RootSync
const settings = { ...settings_debug, ...settings_credentials }

if (process.env['DEBUG_AMI']) {
  // TODO make it less global
  global.am_network = new Network()
  global.am_logger = new Logger(global.am_network)
}

let exit_printed = false
function exit(err?) {
  if (exit_printed) return
  if (global.am_network) {
    const filename = err ? 'logs/snapshot-exception.json' : 'logs/snapshot.json'
    global.am_logger.saveFile(filename)
    console.log(`Saved a snapshot to ${filename}`)
  }
  console.log(root.listMachines())
  if (root.data) {
    console.log(root.data.toString())
  }
  exit_printed = true
  process.exit()
}

process.on('SIGINT', exit)
process.on('exit', exit)

root = new RootSync((<any>settings) as IConfig)
root.state.add('Enabled')
