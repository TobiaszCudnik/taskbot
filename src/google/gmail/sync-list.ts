import { IBind, IEmit, IState, TStates } from './sync-query-types'
import Gmail from './sync'
import AsyncMachine from 'asyncmachine'
import GmailQuery from './gmail-query'
import { Entry, List } from '../../manager/datastore'
import * as google from 'googleapis'
import Sync, { SyncState } from '../../sync/sync'

export class State extends SyncState<TStates, IBind, IEmit> {
  Authenticating = {}
  Authenticated = {}
}

export default class QueryGoogle extends Sync {
  gmail: Gmail
  labels: google.gmail.v1.Label[] = []
  last_read_start: number
  last_read_end: number
  last_write_start: number
  last_write_end: number

  get state_class() {
    return State
  }

  constructor(public query: GmailQuery, public list: List) {
    super()
    this.gmail = query.gmail
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
