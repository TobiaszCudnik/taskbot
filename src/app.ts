import 'source-map-support/register'
import settings from '../settings'
import settings_debug from '../settings-debug'
import ManagerSync from "./root/sync"
import { Logger, Network } from 'ami-logger/remote'

if (process.env['DEBUG']) {
  settings = settings_debug
}

settings = {
  ...settings,
  gmail_max_results: 300
}

if (process.env['DEBUG']) {
  // TODO make it less global
  global.am_network = new Network()
  global.am_logger = new Logger(global.am_network)
  // TODO dump all the network machines with states
  process.on('uncaughtException', function(err) {
    console.error(err)
    global.am_logger.saveFile('snapshot-exception.json')
    console.log('snapshot-exception.json')
    // console.log(global.am_network.toString())
    process.exit()
  })
  process.on('SIGINT', function(err) {
    global.am_logger.saveFile('snapshot.json')
    console.log('Saved a snapshot to snapshot.json')
    console.log(global.am_network.toString())
    process.exit()
  })
  process.on('exit', function(err) {
    global.am_logger.saveFile('snapshot.json')
    console.log('Saved a snapshot to snapshot.json')
    console.log(global.am_network.toString())
    process.exit()
  })
}

const manager = new ManagerSync(settings)
manager.state.add('Enabled')
