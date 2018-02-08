// import { IBind, IEmit, IState, TStates } from './sync-query-types'
// import AsyncMachine from 'asyncmachine'
import GmailQuery, { Thread } from './query'
import * as google from 'googleapis'
import { Sync, SyncState, Reading } from '../../sync/sync'
import * as _ from 'underscore'
import * as moment from 'moment'
import RootSync, { DBRecord } from '../../root/sync'
import GmailSync, { getTitleFromThread } from './sync'
import { IListConfig } from '../../types'

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
  // labels: google.gmail.v1.Label[] = []
  // last_read_start: number
  // last_read_end: number
  // last_write_start: number
  // last_write_end: number

  query: GmailQuery
  // // id => [date, seen_or_not]
  // last_seen: Map<string, [number, boolean]>
  // dirty: Map<string, number>
  // get is_dirty() {
  //   return [...this.dirty.values()].some(dirty => dirty)
  // }
  // last_ids: string[] = []

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
  sync() {
    const ids = []
    let changed = 0
    // add / merge
    for (const thread of this.query.threads) {
      const record = this.root.data.findOne({ id: this.toDBID(thread.id) })
      if (!record) {
        this.root.data.insert(this.toDB(thread))
        changed++
      } else if (this.merge(thread, record)) {
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
        this.config.db_query(record) &&
        !ids.includes(this.toLocalID(record)) &&
        record.updated < this.timeFromHistoryID(this.query.synced_history_id)
      )
    }
    this.root.data.findAndUpdate(find, (record: DBRecord) => {
      changed++
      this.applyLabels(record, this.config.exit)
    })
    return changed ? [changed] : []
  }

  toDB(thread: google.gmail.v1.Thread): DBRecord {
    const record: DBRecord = {
      id: this.toDBID(thread.id),
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

  merge(thread: Thread, record: DBRecord): boolean {
    // TODO support duplicating in case of a conflict ???
    //   or send a new email in the thread?
    if (
      this.timeFromHistoryID(parseInt(thread.historyId, 10)) <= record.updated
    ) {
      // TODO check resolve conflict? since the last sync
      return false
    }
    // TODO compare the date via history_id
    record.updated = moment().unix()
    // TODO content from emails
    this.applyLabels(record, this.config.enter)
    return true
  }

  // toLocal(record: DBRecord): Thread {
  //   return {
  //     id: thread.id,
  //     // TODO subject
  //     text: thread.messages,
  //     labels: [this.config.enter.add],
  //     parent_id: null
  //   }
  // }
  //
  toLocalID(record: DBRecord) {
    return record.id ? record.id : record
  }

  // gmail specific

  // TODO support thread object as a param a parseInt(r.historyId, 10)
  timeFromHistoryID(history_id: number) {
    // floor the guess (to the closest previous recorded history ID)
    // or now
    let index = _.sortedIndex(this.gmail.history_ids, { id: history_id }, 'id')
    return index
      ? this.gmail.history_ids[index - 1].time
      : // TODO initial guess to avoid a double merge
        this.gmail.history_ids[0].time
  }

  applyLabels(record: DBRecord, labels: { add: string[]; remove: string[] }) {
    record.labels = record.labels || {}
    for (const label of labels.remove) {
      record.labels[label] = {
        active: false,
        updated: moment().unix()
      }
    }
    for (const label of labels.add) {
      record.labels[label] = {
        active: true,
        updated: moment().unix()
      }
    }
  }

  // /**
  //  * This sync instance got a new record which doesnt exist in the DB
  //  * @param thread
  //  */
  // onLocalEnter(thread: Thread) {
  //   this.last_seen.set(thread.id, [moment().unix(), true])
  //   // TODO super, use the id
  //   this.gmail.onLocalEnter(this.toLocal(thread))
  // }
  //
  // onLocalExit(thread: Thread) {
  //   this.last_seen.set(thread.id, [moment().unix(), false])
  // }
  //
  // onDBEnter(record: DBRecord) {
  //   if (record.update < this.last_seen.get(this.toLocalID(record))) {
  //     // reject the db enter
  //     throw Error('wrong onDBEnter')
  //     return false
  //   } else {
  //     // execute add labels to local IDs
  //     console.log('execute add labels on local IDs')
  //     this.last_seen.set(record.id, moment().unix())
  //     this.dirty.set(record.id, true)
  //   }
  //   // check if this.last_update[local_id] < record.update
  //   // this.last_update.set(thread.id, moment().unix())
  // }
  //
  // onDBMerge(record: DBRecord) {
  //   if (record.update < this.last_seen.get(this.toLocalID(record))) {
  //     // reject the db exit
  //     throw Error('wrong onDBExit')
  //     return false
  //   } else {
  //     // execute remove labels on local IDs
  //     console.log('execute remove labels on local IDs')
  //     this.last_seen.set(record.id, moment().unix())
  //     this.dirty.set(record.id, true)
  //   }
  // }

  async write() {}
}
