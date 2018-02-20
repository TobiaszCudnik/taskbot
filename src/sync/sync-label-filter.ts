import { Sync, SyncState } from './sync'
import { ILabelFilter } from '../types'
import * as debug from 'debug'
import RootSync from './root'
import * as clone from 'deepcopy'

export class State extends SyncState {
  constructor(target: Sync) {
    super(target)
    this.registerAll()
  }
}

export default class LabelFilterSync extends Sync {
  log = debug(this.state.id(true))

  constructor(public config: ILabelFilter, public root: RootSync) {
    super(config)
  }

  Reading_state() {
    this.state.add('ReadingDone')
  }

  getState() {
    return new State(this).id('label-filter: ' + this.config.name)
  }

  merge(): number[] {
    let count = 0
    for (const r of this.root.data.where(this.config.db_query).data()) {
      const before = clone(r)
      const { add, remove } = this.config
      this.applyLabels(r, { add, remove })
      this.compareRecord(before, r)
      count++
    }
    return count ? [count] : []
  }
}
