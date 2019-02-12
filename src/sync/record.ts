import AsyncMachine, { machine } from 'asyncmachine'
import {
  IBind,
  IEmit,
  IJSONStates,
  IState,
  TStates
} from '../../typings/machines/sync/record'

// TODO implement internal IDs for records instead of gmail_id
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
  id: DBRecordID
  gmail_id?: DBGmailID
  title: string
  content: string
  updated: {
    // must be timestamp (miliseconds)
    latest: number | null
    gtasks: number | null
    // history ID
    gmail_hid: number | null
  }
  // TODO `id` of `gmail_id`
  // parent?: DBRecordID
  labels: { [name: string]: DBRecordLabel }
  // different task ids per list
  gtasks_ids?: {
    [task_id: string]: DBGtasksID
  }
}

export type DBRecordID = string
export type DBGmailID = string
export type DBGtasksID = string

export interface DBRecordLabel {
  // time
  updated: number
  // added or removed
  active: boolean
}
