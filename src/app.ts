import 'source-map-support/register'
import settings from '../settings'
import settings_debug from '../settings-debug'
import ManagerSync from "./manager/sync"
import { Logger, Network } from 'ami-logger'

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
  process.on('uncaughtException', function(err) {
    global.am_logger.saveFile('snapshot-exception.json')
    console.log('snapshot-exception.json')
    process.exit()
  })
  process.on('SIGINT', function(err) {
    global.am_logger.saveFile('snapshot.json')
    console.log('Saved a snapshot to snapshot.json')
    process.exit()
  })
  process.on('exit', function(err) {
    global.am_logger.saveFile('snapshot.json')
    console.log('Saved a snapshot to snapshot.json')
    process.exit()
  })
}

new ManagerSync(settings)
