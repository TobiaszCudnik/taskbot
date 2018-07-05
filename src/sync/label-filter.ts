import * as clone from 'deepcopy'
import * as moment from 'moment'
// Machine types
import {
  AsyncMachine,
  IBind,
  IEmit,
  TStates,
  IBindBase,
  IEmitBase
} from '../../typings/machines/sync/reader'
import { ILabelFilter } from '../types'
import { DBRecord } from './root'
import { SyncReader } from './reader'

export default class LabelFilterSync extends SyncReader<
  ILabelFilter,
  TStates,
  IBind,
  IEmit
> {
  state: AsyncMachine<TStates, IBind, IEmit>

  Dirty_enter() {
    // label filters can never be dirty, as its not an actual list
    return false
  }

  Reading_state() {
    this.state.addNext('ReadingDone')
  }

  getState() {
    return super.getState().id('label-filter: ' + this.config.name)
  }

  merge(): number[] {
    let count = 0
    const records = <DBRecord[]>(<any>this.root.data.where(
      this.config.db_query
    ))
    for (const r of records) {
      const before = clone(r)
      const labels = this.config.modify ? this.config.modify(r) : []
      this.log(`Changing labels for '${r.title}'`)
      this.applyLabels(r, modify)
      r.updated = moment().unix()
      this.printRecordDiff(before, r)
      count++
    }
    return count ? [count] : []
  }
}
