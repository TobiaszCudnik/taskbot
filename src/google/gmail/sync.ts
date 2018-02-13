///<reference path="../../../node_modules/typed-promisify-tob/index.ts"/>
import Query, { Thread } from './query'
import * as _ from 'underscore'
import * as google from 'googleapis'
import { IConfig, TRawEmail } from '../../types'
import { map } from 'typed-promisify-tob'
import { Sync, SyncWriter, SyncWriterState } from '../../sync/sync'
import Auth from '../auth'
import GmailTextLabelsSync from './sync-text-labels'
import GmailListSync from './sync-list'
import GmailLabelFilterSync from './sync-label-filter'
import RootSync, { DBRecord } from '../../sync/root'
import * as moment from 'moment'
import * as debug from 'debug'

export class State extends SyncWriterState {
  // -- overrides

  SubsInited = { require: ['ConfigSet'], auto: true }
  SubsReady = { require: ['SubsInited'], auto: true }
  Ready = {
    auto: true,
    require: [
      'ConfigSet',
      'SubsReady',
      'InitialHistoryIdFetched',
      'LabelsFetched'
    ],
    drop: ['Initializing']
  }

  FetchingLabels = {
    auto: true,
    require: ['Enabled'],
    drop: ['LabelsFetched']
  }
  // TODO required only for Writing
  LabelsFetched = {
    drop: ['FetchingLabels']
  }

  FetchingHistoryId = {
    auto: true,
    require: ['Enabled'],
    drop: ['HistoryIdFetched']
  }
  HistoryIdFetched = {
    drop: ['FetchingHistoryId'],
    add: ['InitialHistoryIdFetched']
  }
  InitialHistoryIdFetched = {}

  constructor(target: GmailSync) {
    super(target)
    this.registerAll()
  }
}

// TODO tmp
export interface GmailAPI extends google.gmail.v1.Gmail {
  req(api, method, c, d): Promise<any>
}

export default class GmailSync extends SyncWriter {
  state: State
  api: GmailAPI
  history_id_timeout = 1
  history_id_latest: number | null
  last_sync_time: number
  labels: google.gmail.v1.Label[]
  history_ids: { id: number; time: number }[] = []
  sub_states_outbound = [['Reading', 'Reading'], ['Enabled', 'Enabled']]
  config: IConfig
  threads = new Map<string, Thread>()
  subs: {
    query_labels: Sync[]
    lists: GmailListSync[]
  }
  log = debug('gmail')

  constructor(root: RootSync, public auth: Auth) {
    super(root.config, root)
    this.api = <GmailAPI>google.gmail('v1')
    this.api = Object.create(this.api)
    this.api.req = async (a, params, c, d) => {
      params.auth = this.auth.client
      return await this.root.req(a, params, c, d, { forever: true })
    }
  }

  // ----- -----
  // Transitions
  // ----- -----

  SubsInited_state() {
    this.subs = {
      lists: [],
      query_labels: []
    }
    for (const config of this.config.lists) {
      this.subs.lists.push(new GmailListSync(config, this.root, this))
    }
    // this.initLabelFilters()
    // this.subs.text_labels = new GmailTextLabelsSync(
    //   this.data,
    //   this.api,
    //   this.config.text_labels
    // )
    // this.subs.text_labels.state.add('Enabled')
    this.bindToSubs()
    // for (const sub of this.subs_flat) {
    //   sub.state.add('Enabled')
    // }
  }

  // TODO tmp, use SyncWriter
  WritingDone_enter() {
    return true
  }

  async Writing_state() {
    if (process.env['DRY']) {
      // TODO list expected changes
      this.state.add('WritingDone')
      return
    }
    const abort = this.state.getAbort('Writing')
    await Promise.all([this.getThreadsToAdd(abort), this.getThreadsToModify])
    // TODO add new thread from all records without gmail_id
    this.state.add('WritingDone')
  }

  async getThreadsToAdd(abort: () => boolean): Promise<void[]> {
    // TODO fake cast, wrong d.ts, missing lokijs fields
    const new_threads = <DBRecord[]>(<any>this.root.data.find({
      gmail_id: undefined
    }))
    // TODO mark as Dirty only queries related by labels
    if (new_threads.length) {
      this.subs.lists.forEach( sub => sub.query.state.add('Dirty') )
      this.log(`Creating ${new_threads.length} new threads`)
    }
    return await map(new_threads, async (record: DBRecord) => {
      const labels = Object.entries(record.labels)
        .filter(([name, data]) => data.active)
        .map(([name]) => name)
      const id = await this.createThread(record.title, labels, abort)
      record.gmail_id = id
      record.id = id
      this.root.data.update(record)
    })
  }

  async getThreadsToModify(abort: () => boolean): Promise<void[]> {
    const diff_threads = this.threads
      .values()
      .map(thread => {
        const record = this.root.data.findOne({ id: thread.id })
        // TODO time of write (and latter reading) should not update
        //   record.updated?
        const add = Object.entries(record.labels)
          .filter(([name, data]) => {
            return data.active ? this.threadHasLabel(thread, name) : false
          })
          .map(([name, data]) => name)
        const remove = Object.entries(record.labels)
          .filter(([name, data]) => {
            return !data.active ? this.threadHasLabel(thread, name) : false
          })
          .map(([name, data]) => name)
        // TODO changed content -> new email in the thread
        return [thread.id, add, remove]
      })
      .filter(([id, add, remove]) => add.length || remove.length)

    // TODO mark as Dirty only queries related by labels
    if (diff_threads.length) {
      this.log(`Modifying ${diff_threads.length} new threads`)
      this.subs.lists.forEach( sub => sub.query.state.add('Dirty') )
    }
    return await map(diff_threads, async ([id, add, remove]) => {
      await this.modifyLabels(id, add, remove, abort)
    })
  }

  // initLabelFilters() {
  //   let count = 0
  //   for (let config of this.config.query_labels) {
  //     this.subs.query_labels.push(
  //       new GmailLabelFilterSync(this, this.api, config, `GQL ${++count}`)
  //     )
  //   }
  // }

  // TODO extract to a separate class
  async SyncingQueryLabels_state() {
    // this.query_labels_timer = moment().unix()
    // let abort = this.state.getAbort('SyncingQueryLabels')
    //
    // let dirty = false
    // await map(
    //   [...this.query_labels],
    //   async ([name, query]: [string, Query]) => {
    //     query.states.add('Enabled')
    //     // TODO timeout?
    //     debugger
    //     await query.states.when('MsgsFetched')
    //     if (abort()) return
    //     // TODO this probably resets the download states, while still
    //     // keeping the cache
    //     query.states.drop('Enabled')
    //
    //     let labels = this.config.query_labels[name]
    //     await Promise.all(
    //       query.threads.map(async thread => {
    //         await this.modifyLabels(thread.id, labels[0], labels[1], abort)
    //         dirty = true
    //       })
    //     )
    //   }
    // )
    //
    // if (dirty) this.state.add('Dirty')
    //
    // if (abort()) return
    //
    // if (!dirty) this.state.add('QueryLabelsSynced')
  }

  // TODO extract to a separate class
  // QueryLabelsSynced_state() {
  //   this.last_sync_time = moment().unix() - this.query_labels_timer
  //   this.query_labels_timer = null
  //   return this.log(`QueryLabels synced in: ${this.last_sync_time}ms`)
  // }

  async FetchingLabels_state() {
    let abort = this.state.getAbort('FetchingLabels')
    let res = await this.api.req(
      this.api.users.labels.list,
      { userId: 'me' },
      null,
      false
    )
    if (abort() || !res) return
    this.labels = res.labels
    this.state.add('LabelsFetched')
  }

  async FetchingHistoryId_state(abort?: () => boolean) {
    this.log('[FETCH] history ID')
    let response = await this.api.req(
      this.api.users.getProfile,
      {
        userId: 'me',
        fields: 'historyId'
      },
      abort,
      false
    )
    // TODO redo when no response
    if (!response || (abort && abort())) return
    this.history_id_latest = parseInt(response.historyId, 10)
    this.history_ids.push({ id: this.history_id_latest, time: moment().unix() })
    this.last_sync_time = moment().unix()
    this.state.add('HistoryIdFetched')
  }

  // ----- -----
  // Methods
  // ----- -----

  getState() {
    const state = new State(this)
    state.id('Gmail')
    return state
  }

  async fetchThread(
    id: string,
    historyId: number | null,
    abort?: () => boolean
  ): Promise<google.gmail.v1.Thread | null> {
    // TODO limit the max msgs amount
    let thread = await this.api.req(
      this.api.users.threads.get,
      {
        id,
        userId: 'me',
        metadataHeaders: 'SUBJECT',
        format: 'metadata',
        fields: 'id,historyId,messages(id,labelIds,payload(headers))'
      },
      null,
      false
    )
    thread.fetched = moment().unix()
    this.threads.set(thread.id, thread)

    if (abort && abort()) return null

    return thread
  }

  getThread(id: string, with_content = false): google.gmail.v1.Thread | null {
    const thread = this.threads.get(id)
    if (with_content && !(thread.messages && thread.messages.length)) {
      return null
    }
    return thread || null
  }

  isHistoryIdValid() {
    return (
      this.history_id_latest &&
      moment().unix() < this.last_sync_time + this.history_id_timeout
    )
  }

  async isCached(
    history_id: number,
    abort: () => boolean
  ): Promise<boolean | null> {
    if (!this.isHistoryIdValid()) {
      if (!this.state.is('FetchingHistoryId')) {
        this.state.add('FetchingHistoryId', abort)
        // We need to wait for FetchingHistoryId being really added, not only queued
        await this.state.when('FetchingHistoryId', abort)
        if (abort && abort()) return null
      }
      await this.state.when('HistoryIdFetched', abort)
      if (abort && abort()) return null
    }

    return this.history_id_latest <= history_id
  }
  // TODO support thread object as a param a parseInt(r.historyId, 10)
  timeFromHistoryID(history_id: number) {
    // floor the guess (to the closest previous recorded history ID)
    // or now
    let index = _.sortedIndex(this.history_ids, { id: history_id }, 'id')
    return index
      ? this.history_ids[index - 1].time
      : // TODO initial guess to avoid a double merge
        this.history_ids[0].time
  }

  getLabelId(label: string): string {
    const gmail_label = this.labels.find(
      gmail_label => gmail_label.name.toLowerCase() == label.toLowerCase()
    )
    return gmail_label && gmail_label.id
  }

  async modifyLabels(
    thread_id: string,
    add_labels: string[] = [],
    remove_labels: string[] = [],
    abort?: () => boolean
  ): Promise<boolean> {
    let add_label_ids = add_labels.map(l => this.getLabelId(l))
    let remove_label_ids = remove_labels.map(l => this.getLabelId(l))
    let thread = this.getThread(thread_id, true)

    let label = thread ? `"${getTitleFromThread(thread)}"` : `ID: ${thread_id}`

    let log_msg = `Modifing labels for thread ${label} `
    if (add_labels.length) {
      log_msg += `+(${add_labels.join(' ')}) `
    }

    if (remove_labels.length) {
      log_msg += `-(${remove_labels.join(' ')})`
    }

    this.log(log_msg)

    let ret = await this.api.req(
      this.api.users.threads.modify,
      {
        id: thread_id,
        userId: 'me',
        fields: 'id',
        resource: {
          addLabelIds: add_label_ids,
          removeLabelIds: remove_label_ids
        }
      },
      abort,
      false
    )
    return Boolean(ret)
  }

  async getHistoryId(abort?: () => boolean): Promise<number | null> {
    if (!this.history_id_latest) {
      this.state.add('FetchingHistoryId', abort)
      await this.state.when('HistoryIdFetched')
    }

    return this.history_id_latest
  }

  /**
   * TODO email content
   */
  async createThread(
    subject: string,
    labels: string[],
    abort?: () => boolean
  ): Promise<string | null> {
    this.log(`Creating thread (${labels.join(' ')})`)
    let message = await this.api.req(
      this.api.users.messages.insert,
      {
        userId: 'me',
        resource: {
          raw: this.createEmail(subject),
          labelIds: labels.map(l => this.getLabelId(l))
        }
      },
      abort,
      false
    )
    if (!message || (abort && abort())) return null
    return message.threadId
  }

  createEmail(subject: string): TRawEmail {
    let email = [
      `From: ${this.config.gmail_username} <${this.config.gmail_username}>s`,
      `To: ${this.config.gmail_username}`,
      'Content-type: text/html;charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${subject}`
    ].join('\r\n')

    return new Buffer(email)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_') as TRawEmail
  }

  threadHasLabel(thread: google.gmail.v1.Thread, label_name: string) {
    if (!this.state.is('LabelsFetched')) {
      throw new Error('Labels not fetched')
    }
    const id = this.getLabelId(label_name)
    if (!id) {
      throw new Error(`Label ${label_name} doesn't exist`)
    }
    return thread.messages.some(msg => msg.labelIds.includes(id))
  }
}

export function getTitleFromThread(thread: google.gmail.v1.Thread) {
  try {
    return thread.messages[0].payload.headers[0].value
  } catch (e) {
    throw new Error('Thread content not fetched')
  }
}

export function normalizeLabelName(label: string) {
  return label
    .replace('/', '-')
    .replace(' ', '-')
    .toLowerCase()
}
