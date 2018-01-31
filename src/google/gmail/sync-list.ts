// import { IBind, IEmit, IState, TStates } from './sync-query-types'
// import AsyncMachine from 'asyncmachine'
import GmailQuery, {Thread} from './query'
import * as google from 'googleapis'
import Sync, {SyncState, Reading} from '../../sync/sync'
import * as _ from 'underscore'
import RootSync, {DBRecord} from "../../root/sync";
import GmailSync from "./sync";
import {IGmailQuery} from "../../types";

export class State extends SyncState {

  Ready = { auto: true, drop: ['Initializing'] }
  // Reading = {
  //   ...Reading,
  //   add: ['FetchingThreads']
  // }

  // ReadingDone = {
  //   require: ['Ready'],
  //   auto: true
  // }

  // TODO
  constructor(target: Sync) {
    super(target)
    this.registerAll()
  }
}

type GmailAPI = google.gmail.v1.Gmail
type DBCollection = LokiCollection
export default class GmailListSync extends Sync {
  // labels: google.gmail.v1.Label[] = []
  // last_read_start: number
  // last_read_end: number
  // last_write_start: number
  // last_write_end: number

  query: GmailQuery
  last_update: Map<string, number>
  dirty: Map<string, number>
  get is_dirty() {
    return [...this.dirty.values()].some(dirty => dirty)
  }
  last_ids: string[] = []

  constructor(
    public config: IGmailQuery,
    public root: RootSync,
    public gmail: GmailSync
  ) {
    super(config)
    this.query = new GmailQuery(this.gmail, config.query, config.name,
        true)
    this.query.state.add('Enabled')
  }

  getState() {
    const state = new State(this)
    state.id('Gmail/list: ' + this.config.name)
    return state
  }

  onEntryChanged(entry: Entry, prev?: Entry) {
    // match the entry against the gmail query conditions
    // and add to the list if it matches
  }

  async Reading_state() {
    const abort = this.state.getAbort('Reading')
    this.query.state.add('FetchingThreads')
    await this.query.state.when('MsgsFetched')
    this.state.add('ReadingDone')
  }

  threads = new Map<string, Thread>()

  sync() {
    const ids = []
    let changed = 0
    for (const thread of this.query.threads) {
      const entry = this.root.data.findOne(this.toDBID(thread.id))
      if (!entry) {
        this.onLocalEnter(thread)
        changed++
      } else {
        this.onLocalMerge(thread)
      }
      this.setThread(thread);
      ids.push(thread.id)
    }
    for (const id of _.without(this.last_ids, ids)) {
      this.onLocalExit(id)
      changed++
    }
    return changed ? [changed] : []
    // TODO compare query.threads with list.entries
    // check IDs
    // check completions
  }

  private setThread(thread) {
    this.threads.set(thread.id, thread)
    this.callbacks.setThread(thread)
  }

  toLocal(record: DBRecord): Thread {
    return {
      id: thread.id,
      // TODO subject
      text: thread.messages,
      labels: [this.config.enter.add],
      parent_id: null
    }
  }

  toLocalID(record: DBRecord) {
    return source.id ? source.id : source
  }

  toDB(
    thread: google.gmail.v1.Thread /*, create_if_missing = false*/
  ): DBRecord {
    return {
      id: thread.id
      // TODO subject[p;/≥……;//;p['=]
    }
  }

  toDBID(source: Thread | string) {
    return source.id ? source.id : source
  }

  onLocalMerge(thread: Thread) {
    // TODO labels
    // TODO ...
  }

  /**
   * This sync instance got a new record which doesnt exist in the DB
   * @param thread
   */
  onLocalEnter(thread: Thread) {
    this.last_update.set(thread.id, Date.now())
    // TODO super, use the id
    this.callbacks.onLocalEnter(this.toLocal(thread))
  }

  onLocalExit(thread: Thread) {
    this.last_update.set(thread.id, Date.now())
  }

  onDBEnter(record: DBRecord) {
    if (record.update < this.last_update.get(this.toLocalID(record))) {
      // reject the db enter
      throw Error('wrong onDBEnter')
      return false
    } else {
      // execute add labels to local IDs
      console.log('execute add labels on local IDs')
      this.last_update.set(record.id, Date.now())
      this.dirty.set(record.id, true)
    }
    // check if this.last_update[local_id] < record.update
    // this.last_update.set(thread.id, Date.now())
  }

  onDBExit(record: DBRecord) {
    if (record.update < this.last_update.get(this.toLocalID(record))) {
      // reject the db exit
      throw Error('wrong onDBExit')
      return false
    } else {
      // execute remove labels on local IDs
      console.log('execute remove labels on local IDs')
      this.last_update.set(record.id, Date.now())
      this.dirty.set(record.id, true)
    }
  }

  async write() {}
}
