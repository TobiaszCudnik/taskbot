import AsyncMachine, { machine } from 'asyncmachine'
import {
  IBind,
  IEmit,
  IJSONStates,
  IState,
  TStates
} from '../../typings/machines/sync/record'

// TODO create Root.mergers and keep a merger-per-record
//   dispose then deleting
// TODO port to states
//   - to_delete?: boolean
//   - gtasks_moving?: boolean
//   - gtasks_uncompleted?: boolean
//   - gmail_orphan?: boolean
//   - gtasks_hidden_completed?: boolean
//   - gtasks_moving?: boolean
export { IState }
export const merge_state: IJSONStates = {
  // TODO define what Merged means
  Merged: {
    drop: ['Merging']
  },
  Merging: {
    drop: ['Merged']
  },
  ToDelete: {},
  // TODO split those into mixins
  // GTasks
  GtasksDeleted: {},
  GtasksUncompletedElsewhere: {},
  GtasksHiddenCompleted: {},
  GtasksMoving: {
    drop: ['ToDelete']
  },
  // GMail
  GmailThreadMissing: {}
}
export type TMergeState = AsyncMachine<TStates, IBind, IEmit>

const record_merger = machine(merge_state)

// efficient (prototype-based) child of the record_merger
export function createRecordMerger(): TMergeState {
  // @ts-ignore TODO generic not honored by `this` return type
  return record_merger.createChild()
}

/**
 * Local DB record format.
 */
export interface DBRecord {
  // TODO internal ID
  gmail_id?: DBRecordID
  title: string
  content: string
  updated: {
    // must be timestamp
    latest: number | null
    gtasks: number | null
    // history ID
    gmail_hid: number | null
  }
  parent?: DBRecordID
  labels: { [name: string]: DBRecordLabel }
  // different task ids per list
  gtasks_ids?: {
    [task_id: string]: string
  }
}

export type DBRecordID = string

export interface DBRecordLabel {
  // time
  updated: number
  // added or removed
  active: boolean
}
