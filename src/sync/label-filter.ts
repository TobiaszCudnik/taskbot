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

  Reading_state() {
    this.state.add('ReadingDone')
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
      const add = this.config.add ? this.config.add(r) : []
      const remove = this.config.remove ? this.config.remove(r) : []
      this.log(`Changing labels for '${r.title}'`)
      this.applyLabels(r, { add, remove })
      r.updated = moment().unix()
      this.printRecordDiff(before, r)
      count++
    }
    return count ? [count] : []
  }
}
