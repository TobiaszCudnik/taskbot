import 'source-map-support/register'
import * as debug from 'debug'
// import settings from '../settings'
import settings_debug from '../settings-debug'
import settings_credentials from '../settings.credentials'
import RootSync from './sync/root'
import { Logger, Network } from 'ami-logger/remote'
import { IConfig } from './types'

// const app_settings = process.env['DEBUG'] ? settings_debug : settings

let root
const settings = { ...settings_debug, ...settings_credentials }

if (process.env['DEBUG_AMI']) {
  // TODO make it less global
  global.am_network = new Network()
  global.am_logger = new Logger(global.am_network)
}

function exit(err?) {
  if (global.am_network) {
    global.am_logger.saveFile(err ? 'snapshot-exception.json' : 'snapshot.json')
    console.log(global.am_network.toString())
    console.log('Saved a snapshot to snapshot.json')
  }
  console.log(root.data.toString())
  process.exit()
}

process.on('SIGINT', exit)
process.on('exit', exit)

root = new RootSync((<any>settings) as IConfig)
root.state.add('Enabled')
