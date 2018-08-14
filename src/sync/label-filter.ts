import { TAbortFunction } from 'asyncmachine/types'
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

  async merge(abort: TAbortFunction): Promise<number[]> {
    this.log('merge')
    let count = 0
    const records = this.root.data.where(this.config.db_query)
    if (records.length) {
      this.log(`${records.length} matches`)
    }
    for (const record of records) {
      const before = clone(record)
      const labels = this.config.modify.call(this.root, record)
      this.log(`Changing labels for '${record.title}'`)
      this.modifyLabels(record, labels)
      // TODO internal update field
      // record.updated = moment().unix()
      this.printRecordDiff(before, record)
      count++
    }
    return count ? [count] : []
  }
}
