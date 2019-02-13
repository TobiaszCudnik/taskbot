import { machine } from 'asyncmachine'
import { TAbortFunction } from 'asyncmachine/types'
import * as clone from 'deepcopy'
import * as moment from 'moment'
import * as randomId from 'simple-random-id'
// Machine types
import {
  AsyncMachine,
  IBind,
  IEmit,
  IJSONStates,
  TStates,
  IBindBase,
  IEmitBase,
  ITransitions
} from '../../../typings/machines/google/gmail/sync-list'
import { DBRecord } from '../../sync/record'
import RootSync from '../../sync/root'
import { SyncReader, sync_reader_state } from '../../sync/reader'
import { IListConfig } from '../../types'
import GmailQuery from './query'
import GmailSync, { TThread } from './sync'
import * as _ from 'lodash'

export const sync_state: IJSONStates = {
  ...sync_reader_state,

  Ready: { auto: true, drop: ['Initializing'] }
}

export default class GmailListSync extends SyncReader<
  IListConfig,
  TStates,
  IBind,
  IEmit
>
// TODO type machine types
// implements ITransitions
{
  state: AsyncMachine<TStates, IBind, IEmit>
  query: GmailQuery

  constructor(config: IListConfig, root: RootSync, public gmail: GmailSync) {
    super(config, root)
    this.query = new GmailQuery(
      this.gmail,
      config.gmail_query,
      config.name,
      true
    )
    // this.query.state.add('Enabled')
    this.state.pipe(
      ['Enabled', 'Dirty'],
      this.query.state
    )
  }

  // ----- -----
  // Transitions
  // ----- -----

  async Reading_state(time = 1) {
    if (!this.shouldRead()) {
      return this.state.addNext('ReadingDone')
    }
    // counters
    super.Reading_state()
    this.root.last_sync_reads++
    this.last_read_tries++

    const abort = this.state.getAbort('Reading')
    this.query.state.add('FetchingThreads')
    // TODO pipe?
    await this.query.state.when('MsgsFetched')
    this.state.drop('Dirty')
    if (abort()) return
    this.state.add('ReadingDone', time)
  }

  Restarting_state() {
    // drop the download states
    this.query.state.drop(['FetchingThreads', 'FetchingMsgs'])
    super.Restarting_state()
  }

  // ----- -----
  // Methods
  // ----- -----

  // @ts-ignore
  getState() {
    return machine(sync_state).id('Gmail/list: ' + this.config.name)
  }

  // TODO extract to ListSyncFreq
  shouldRead() {
    if (!this.daily_quota_ok) {
      this.state.drop('Dirty')
      this.log_error('Skipping sync because of API daily quota')
      return false
    }
    if (this.state.is('Dirty') || !this.last_read_end) {
      this.log_verbose(`Forced read - Dirty`)
      return true
    }
    // TODO check users internal quota to avoid too many dirty refreshes
    // TODO check per user short_quota
    // TODO check global short_quota
    const since_last_read = moment.duration(moment().diff(this.last_read_start))
    let sync_frequency =
      this.gmail.config.gmail.sync_frequency || this.gmail.config.sync_frequency
    // list freq multiplier
    const list_multi = (this.config.sync_frequency || {}).gmail_multi
    if (list_multi) {
      sync_frequency *= list_multi
    }
    // per-user freq multiplier
    if (this.root.config.sync_frequency_multi) {
      sync_frequency *= this.root.config.sync_frequency_multi
    }
    // reject if frequency got exceeded
    if (sync_frequency && since_last_read.asSeconds() < sync_frequency) {
      this.log_verbose(`Reading skipped - max frequency exceeded`)
      return false
    }
    return true
  }

  // read the current list and add to the DB
  // query the DB and, compare list read time with records update time
  //   and remove labels from
  //   records in the DB but not on the list
  async merge(abort: TAbortFunction): Promise<any[]> {
    this.log_verbose('merge')
    const ids = []
    let changed = 0

    // ADD / MERGE
    for (const thread of this.query.threads) {
      const record = this.root.data.findOne({
        gmail_id: this.toDBID(thread.id)
      })
      if (!record) {
        const new_record = this.createRecord(thread)
        this.log('change')
        this.log_verbose('new record:\n %O', this.root.logRecord(new_record))
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
    // dont sync deletions if gmail is the only writer for this list
    // TODO solve when syncing 3 different sources
    if (this.config.writers && this.config.writers.length == 1) {
      return changed ? [changed] : []
    }

    // REMOVE (from this list)
    // query the db for the current list where IDs arent present locally
    // and apply the exit label changes
    // TODO use an index
    // console.log('this.query.threads', this.query.threads)
    // console.log('this.query.prev_threads', this.query.prev_threads)
    const find_orphans = (record: DBRecord) => {
      return (
        // only records with a gmail id
        record.gmail_id &&
        // only already synced
        this.gmail.threads.get(record.gmail_id) &&
        // only from this list
        this.config.db_query(record) &&
        this.root.config_parsed.lists.reduce((p, i) => {
          if (i.db_query && i.db_query(record)) {
            p++
          }
          return p
        }, 0) == 1 &&
        // only not seen in this sync so far
        !ids.includes(this.toLocalID(record)) &&
        // only ones updated earlier than this query
        record.updated.gmail_hid < this.query.history_id_synced &&
        // seen in the previous query
        this.query.prev_threads.some(t => t.id == record.gmail_id)
        // which the latest update was from gmail
      )
    }
    // TODO indexes - dont update here, update in the top merge
    this.root.data.findAndUpdate(find_orphans, (record: DBRecord) => {
      changed++
      this.log('new gmail orhpan record:\n%O', this.root.logRecord(record))
      // TODO clone only in debug
      this.root.markListsAsDirty(this, record)
      const before = clone(record)
      // remove enter labels, as the thread left the query
      this.modifyLabels(record, { remove: this.config.enter.add })
      // assume deletion and let the orphan logic handle other cases
      this.gmail.removeThreadFromCache(record.gmail_id)
      // TODO sync the local thread object
      // option 1 - re-download the thread while reading
      // option 2 - delete the thread and expect the main sync re-downloads it
      // option 3 - apply the label changes on the local thread object
      // option 4 - mark as an orphan an let FetchingOrphans handle it
      // this.gmail.threads.delete(record.gmail_id)
      this.printRecordDiff(before, record, 'threads to close')
      this.merger(record.id).add('GmailThreadMissing')
      return record
    })

    return changed ? [changed] : []
  }

  createRecord(thread: TThread): DBRecord {
    const me = this.root.config.google.username
    const from = this.gmail.getThreadAuthor(thread)
    const to = this.gmail.getThreadAddressee(thread)
    const self_sent = from == me && to == me
    const title = this.gmail.getTitleFromThread(thread)
    const hid = parseInt(thread.historyId, 10)
    const record: DBRecord = {
      id: randomId(),
      gmail_id: this.toDBID(thread.id),
      title: title,
      content: self_sent ? '' : `From ${from}\n`,
      labels: {},
      updated: {
        latest: this.gmail.timeFromHistoryID(hid),
        gmail_hid: hid,
        gtasks: null
      }
    }
    // apply labels from gmail
    const labels_from_thread = this.gmail.getLabelsFromThread(thread)
    this.modifyLabels(record, { add: labels_from_thread })
    // apply enter labels from the list definition
    this.modifyLabels(record, this.config.enter)
    // apply labels from text, but only when in inbox AND send to yourself AND
    // by yourself
    if (labels_from_thread.includes('INBOX') && self_sent) {
      this.modifyLabels(record, {
        add: this.root.getLabelsFromText(
          this.gmail.getTitleFromThread(thread, false)
        ).labels
      })
    }
    this.root.markListsAsDirty(this, record)
    return record
  }

  toDBID(source: TThread | string) {
    // TODO tmp casts
    return (<any>source).id ? (<any>source).id : source
  }

  // checks if the list has the given thread in cache
  hasThread(id: string) {
    return this.query.threads.find(t => t.id == id)
  }

  // TODO merge with FetchingOrphans
  // TODO support duplicating in case of a conflict ???
  //   or send a new email in the thread?
  //   if sending a new thread, resolve conflicts properly with other sources
  //   introduce a universal conflict resolution pattern?
  mergeRecord(thread: TThread, record: DBRecord): boolean {
    // TODO clone only in debug
    const before = clone(record)
    const hid = parseInt(thread.historyId, 10)
    if (hid <= record.updated.gmail_hid) {
      // TODO check for conflicts to resolve? since the last sync
      return false
    }
    const record_labels = Object.entries(record.labels)
      .filter(
        ([name, label]) =>
          // include only labels present during the last gmail sync
          label.active && label.updated <= this.gmail.timeFromHistoryID(hid)
      )
      .map(([name, label]) => name)
    this.log_verbose(`merging record gmail_id:${record.gmail_id}`)
    record.updated.gmail_hid = hid
    record.updated.latest = Math.max(
      record.updated.latest,
      this.gmail.timeFromHistoryID(hid)
    )
    // TODO content from emails
    // apply labels from gmail
    const thread_labels = this.gmail.getLabelsFromThread(thread)
    const to_remove = _.difference(record_labels, thread_labels)
    let to_add = _.difference(thread_labels, record_labels)
    // include the lists 'enter' labels
    if (this.config.enter && this.config.enter.add) {
      to_add = [...to_add, ...this.config.enter.add]
    }

    // mark as dirty only if theres a change
    if (to_add.length || to_remove.length) {
      this.root.markListsAsDirty(this, record)
    }

    this.modifyLabels(record, {
      add: to_add,
      remove: to_remove
    })
    // TODO confirm if unnecessary
    // this.applyLabels(record, this.config.enter)
    //   getListsForRecord(before).map( list => list.state.add('Dirty')
    this.printRecordDiff(before, record, 'gmail-merge')
    return true
  }

  toLocalID(record: DBRecord) {
    return record.gmail_id ? record.gmail_id : record
  }

  toString() {
    return (
      'Gmail - ' +
      this.config.name +
      (this.state.is('Dirty') ? ' (Dirty)' : '') +
      '\n' +
      this.query.threads
        .map((t: TThread) => {
          let ret =
            '- ' + this.root.logText(this.gmail.getTitleFromThread(t)) + '\n  '
          ret += this.gmail.getLabelsFromThread(t).join(', ')
          return ret
        })
        .join('\n')
    )
  }

  getMachines(include_inactive = true) {
    let machines = super.getMachines(include_inactive)
    machines += this.query.state.statesToString(include_inactive)
    return machines
  }
}
