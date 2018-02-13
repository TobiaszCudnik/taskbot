// import { IBind, IEmit, IState, TStates } from './sync-query-types'
// import AsyncMachine from 'asyncmachine'
import GmailQuery, { Thread } from './query'
import * as google from 'googleapis'
import { Sync, SyncState, Reading } from '../../sync/sync'
import * as _ from 'underscore'
import * as moment from 'moment'
import RootSync, { DBRecord } from '../../sync/root'
import GmailSync, { getTitleFromThread } from './sync'
import { IListConfig } from '../../types'
import * as clone from 'deepcopy'
import { debug } from 'debug'

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
type DBCollection = LokiCollection<DBRecord>
export default class GmailListSync extends Sync {
  query: GmailQuery
  log = debug('gmail-list')
  verbose = debug('gmail-list-verbose')

  constructor(
    public config: IListConfig,
    public root: RootSync,
    public gmail: GmailSync
  ) {
    super(config)
    this.query = new GmailQuery(
      this.gmail,
      config.gmail_query,
      config.name,
      true
    )
    // this.query.state.add('Enabled')
    this.state.pipe('Enabled', this.query.state)
  }

  getState() {
    const state = new State(this)
    state.id('Gmail/list: ' + this.config.name)
    return state
  }

  async Reading_state() {
    const abort = this.state.getAbort('Reading')
    this.query.state.add('FetchingThreads')
    // TODO pipe?
    await this.query.state.when('MsgsFetched')
    if (abort()) return
    this.state.add('ReadingDone')
  }

  // read the current list and add to the DB
  // query the DB and, compare list read time with records update time
  //   and remove labels from
  //   records in the DB but not on the list
  merge() {
    const ids = []
    let changed = 0
    // add / merge
    for (const thread of this.query.threads) {
      const record = this.root.data.findOne({ gmail_id: this.toDBID(thread.id) })
      if (!record) {
        const new_record = this.toDB(thread)
        this.verbose('new record:\n %O', new_record)
        this.root.data.insert(new_record)
        changed++
      } else if (this.mergeRecord(thread, record)) {
        changed++
      }
      // TODO should be done in the query class
      this.gmail.threads.set(thread.id, thread)
      ids.push(thread.id)
    }
    // remove
    // query the db for the current list where IDs arent present locally
    // and apply the exit label changes
    // TODO use an index
    const find = (record: DBRecord) => {
      return (
        // only records with a gmail id
        record.gmail_id &&
        // only from this list
        this.config.db_query(record) &&
        // only not seen in this sync so far
        !ids.includes(this.toLocalID(record)) &&
        // only ones updated later than this query
        record.updated <
          this.gmail.timeFromHistoryID(this.query.history_id_synced)
      )
    }
    this.root.data.findAndUpdate(find, (record: DBRecord) => {
      changed++
      const before = clone(record)
      this.applyLabels(record, this.config.exit)
      this.compareRecord(before, record, 'threads to close')
      return record
    })
    return changed ? [changed] : []
  }

  toDB(thread: google.gmail.v1.Thread): DBRecord {
    const record: DBRecord = {
      gmail_id: this.toDBID(thread.id),
      title: getTitleFromThread(thread),
      content: thread.snippet || '',
      labels: {},
      updated: moment().unix()
    }
    this.applyLabels(record, this.config.enter)
    return record
  }

  toDBID(source: Thread | string) {
    // TODO tmp casts
    return (<any>source).id ? (<any>source).id : source
  }

  mergeRecord(thread: Thread, record: DBRecord): boolean {
    const before = clone(record)
    // TODO support duplicating in case of a conflict ???
    //   or send a new email in the thread?
    if (
      this.gmail.timeFromHistoryID(parseInt(thread.historyId, 10)) <=
      record.updated
    ) {
      // TODO check resolve conflict? since the last sync
      return false
    }
    // TODO compare the date via history_id
    record.updated = moment().unix()
    // TODO content from emails
    this.applyLabels(record, this.config.enter)
    this.compareRecord(before, record)
    return true
  }

  toLocalID(record: DBRecord) {
    return record.gmail_id ? record.gmail_id : record
  }
}
