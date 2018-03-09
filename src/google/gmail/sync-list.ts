import { machine } from 'asyncmachine'
import { debug } from 'debug'
import * as clone from 'deepcopy'
import * as google from 'googleapis'
import * as moment from 'moment'
// Machine types
import {
  AsyncMachine,
  IBind,
  IEmit,
  IJSONStates,
  TStates,
  IBindBase,
  IEmitBase
} from '../../../typings/machines/google/gmail/sync-list'
import RootSync, { DBRecord } from '../../sync/root'
import { Sync, sync_state as base_state } from '../../sync/sync'
import { IListConfig } from '../../types'
import GmailQuery, { Thread } from './query'
import GmailSync from './sync'

export const sync_state: IJSONStates = {
  ...base_state,

  Ready: { auto: true, drop: ['Initializing'] }
}

type GmailAPI = google.gmail.v1.Gmail
type DBCollection = LokiCollection<DBRecord>
export default class GmailListSync extends Sync<
  IListConfig,
  TStates,
  IBind,
  IEmit
> {
  state: AsyncMachine<TStates, IBind, IEmit>
  query: GmailQuery
  verbose = debug(this.state.id(true) + '-verbose')

  constructor(config: IListConfig, root: RootSync, public gmail: GmailSync) {
    super(config, root)
    this.query = new GmailQuery(
      this.gmail,
      config.gmail_query,
      config.name,
      true
    )
    // this.query.state.add('Enabled')
    this.state.pipe('Enabled', this.query.state)
  }

  // ----- -----
  // Transitions
  // ----- -----

  async Reading_state() {
    super.Reading_state()
    const abort = this.state.getAbort('Reading')
    this.query.state.add('FetchingThreads')
    // TODO pipe?
    await this.query.state.when('MsgsFetched')
    if (abort()) return
    this.state.add('ReadingDone')
  }

  // ----- -----
  // Methods
  // ----- -----

  getState() {
    return machine(sync_state).id('Gmail/list: ' + this.config.name)
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
      const record = this.root.data.findOne({
        gmail_id: this.toDBID(thread.id)
      })
      if (!record) {
        const new_record = this.toDB(thread)
        this.log('change')
        this.verbose('new record:\n %O', new_record)
        this.root.data.insert(new_record)
        changed++
      } else if (this.mergeRecord(thread, record)) {
        this.log('change')
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
        // only already synced
        this.gmail.threads.get(record.gmail_id) &&
        // only from this list
        this.config.db_query(record) &&
        // only not seen in this sync so far
        !ids.includes(this.toLocalID(record)) &&
        // only ones updated earlier than this query
        record.updated <
          this.gmail.timeFromHistoryID(this.query.history_id_synced)
      )
    }
    // TODO indexes - dont update here, update in the top merge
    this.root.data.findAndUpdate(find, (record: DBRecord) => {
      changed++
      this.log('change')
      // TODO clone only in debug
      const before = clone(record)
      // remove enter labels, as the thread left the query
      // TODO maybe re-download the thread while reading? to be sure
      //   else - delete the thread and expect the main sync re-downloads it
      this.applyLabels(record, { remove: this.config.enter.add })
      this.printRecordDiff(before, record, 'threads to close')
      return record
    })
    return changed ? [changed] : []
  }

  toDB(thread: google.gmail.v1.Thread): DBRecord {
    const sender = this.gmail.getThreadAuthor(thread)
    const self_sent = sender == this.root.config.gmail_username
    let title = this.gmail.getTitleFromThread(thread)
    if (!self_sent) {
      title += ` (from ${sender})`
    }
    const record: DBRecord = {
      gmail_id: this.toDBID(thread.id),
      title: title,
      content: thread.snippet || '',
      labels: {},
      updated: moment().unix()
    }
    // apply labels from gmail
    const labels_from_thread = this.gmail.getLabelsFromThread(thread)
    this.applyLabels(record, { add: labels_from_thread })
    // apply labels from text, only when in inbox AND send to yourself
    if (labels_from_thread.includes('INBOX') && self_sent) {
      this.applyLabels(record, {
        add: this.root.getLabelsFromText(record.title).labels
      })
    }
    return record
  }

  toDBID(source: Thread | string) {
    // TODO tmp casts
    return (<any>source).id ? (<any>source).id : source
  }

  mergeRecord(thread: Thread, record: DBRecord): boolean {
    // TODO clone only in debug
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
    // apply labels from gmail
    this.applyLabels(record, { add: this.gmail.getLabelsFromThread(thread) })
    // TODO confirm if unnecessary
    // this.applyLabels(record, this.config.enter)
    this.printRecordDiff(before, record)
    return true
  }

  toLocalID(record: DBRecord) {
    return record.gmail_id ? record.gmail_id : record
  }

  toString() {
    return (
      'Gmail - ' +
      this.config.name +
      '\n' +
      this.query.threads
        .map((t: Thread) => {
          let ret = '- ' + this.gmail.getTitleFromThread(t) + '\n  '
          ret += this.gmail.getLabelsFromThread(t).join(', ')
          return ret
        })
        .join('\n')
    )
  }

  getMachines() {
    const machines = super.getMachines()
    machines.push(this.query.state)
    return machines
  }
}
