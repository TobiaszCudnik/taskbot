import 'source-map-support/register'
import * as debug from 'debug'
// import settings from '../settings'
import settings_debug from '../settings-debug'
import RootSync from './root/sync'
import { Logger, Network } from 'ami-logger/remote'
import { IConfig } from './types'

// const app_settings = process.env['DEBUG'] ? settings_debug : settings

let root

if (process.env['DEBUG']) {
  // TODO make it less global
  global.am_network = new Network()
  global.am_logger = new Logger(global.am_network)
  function exit(err?) {
    global.am_logger.saveFile(err ? 'snapshot-exception.json' : 'snapshot.json')
    console.log('Saved a snapshot to snapshot.json')
    console.log(global.am_network.toString())
    console.log(root.data.toString())
    process.exit()
  }

  process.on('uncaughtException', function(err) {
    console.error(err)
    exit(err)
  })
  process.on('SIGINT', exit)
}

root = new RootSync((<any>settings_debug) as IConfig)
root.state.add('Enabled')
