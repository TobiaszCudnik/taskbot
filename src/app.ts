import 'source-map-support/register'
import settings from '../settings'
import { Sync } from './sync/sync'

Object.assign(settings, {gmail_max_results: 300});

// TODO async/await ???
new Sync(settings)
