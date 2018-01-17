// import { IBind, IEmit, IState, TStates } from './sync-query-types'
import Gmail from './sync'
// import AsyncMachine from 'asyncmachine'
import GmailQuery from './query'
import { Entry, List } from '../../manager/datastore'
import * as google from 'googleapis'
import Sync, { SyncState } from '../../sync/sync'
import DataStore from '../../manager/datastore'

export class State extends SyncState {
  // TODO
  constructor(target: Sync) {
    super(target)
    this.registerAll()
  }
}

export default class GmailQuerySync extends Sync {
  labels: google.gmail.v1.Label[] = []
  last_read_start: number
  last_read_end: number
  last_write_start: number
  last_write_end: number

  constructor(
    public datastore: DataStore,
    public api: google.gmail.v1.Gmail,
    public name
  ) {
    super()
  }

  getState() {
    const state = new State(this)
    state.id(this.name)
    return state
  }

  onEntryChanged(entry: Entry, prev?: Entry) {
    // match the entry against the gmail query conditions
    // and add to the list if it matches
  }

  async read() {
    this.state.add('Reading')
    this.query.states.add('FetchingThreads')
    await this.state.when('ReadingDone')
    // TODO compare query.threads with list.entries
    // check IDs
    // check completions
  }

  async write() {}
}
