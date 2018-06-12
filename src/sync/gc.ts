import * as debug from 'debug'
import * as delay from 'delay'
import { sortedIndex } from 'lodash'
import * as moment from 'moment'
import Timer = NodeJS.Timer

const SEC = 1000

/**
 * GC for date based lists.
 * TODO refactor to TimeArray, extract common methods
 */
export default class GC {
  timeout: Timer | number
  log: (msg) => void
  stop = false

  constructor(
    public name: string,
    public data: Array<any>,
    public max_entries = 5000,
    public max_time_minutes = 60 * 24,
    public interval_sec = 10 * 60
  ) {
    this.scheduler()
    this.log = debug('gc-' + name)
  }

  async scheduler() {
    while (!this.stop) {
      await delay(this.interval_sec * SEC)
      this.gc()
    }
  }

  gc() {
    let index
    // truncate to the max number of entries
    if (this.max_entries && this.data.length > this.max_entries) {
      index = this.data.length - this.max_entries
    }
    // truncate to the oldest possible entry
    if (this.max_time_minutes) {
      const oldest = moment()
        .subtract(this.max_time_minutes, 'minutes')
        .unix()
      index = Math.max(index, sortedIndex(this.data, oldest))
    }
    if (!index) return

    this.data.splice(0, index)
    this.log(`GCing ${index} entries from '${this.name}'`)
  }
}
