///<reference path="../../../node_modules/typed-promisify-tob/index.ts"/>
import Query, {Thread} from './query'
import * as _ from 'underscore'
import * as google from 'googleapis'
import { IConfig, TRawEmail } from '../../types'
import { map } from 'typed-promisify-tob'
import { Sync, SyncWriter, SyncWriterState } from '../../sync/sync'
import Auth from '../auth'
import GmailTextLabelsSync from './sync-text-labels'
import GmailListSync from './sync-list'
import GmailLabelFilterSync from './sync-label-filter'
import RootSync from "../../root/sync";
import * as moment from 'moment'

export class State extends SyncWriterState {
  // -- overrides

  SubsInited = { require: ['ConfigSet'], auto: true }
  SubsReady = { require: ['SubsInited'], auto: true }
  Ready = {
    auto: true,
    require: ['ConfigSet', 'SubsReady', 'HistoryIdFetched', 'LabelsFetched'],
    drop: ['Initializing']
  }

  // -- own

  // SyncingQueryLabels: IState = {
  //   auto: true,
  //   require: ['Enabled', 'LabelsFetched'],
  //   drop: ['QueryLabelsSynced']
  // }
  // QueryLabelsSynced: IState = {
  //   drop: ['SyncingQueryLabels']
  // }

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
    drop: ['FetchingHistoryId']
  }

  constructor(target: GmailSync) {
    super(target)
    this.registerAll()
  }
}

// TODO tmp
export interface GmailAPI extends google.gmail.v1.Gmail {
  req(api, method, c, d): Promise<any>;
}

export default class GmailSync extends SyncWriter {
  state: State
  api: GmailAPI
  // sync: GoogleSync
  // completions = new Map<string, {
  // 	completed: boolean,
  // 	time: number
  // }>();
  history_id_timeout = 3000
  history_id: number | null
  last_sync_time: number
  queries: Query[] = []
  labels: google.gmail.v1.Label[]
  history_ids: {id: number, time: number}[] = []
  sub_states_outbound = [['Reading', 'Reading'], ['Enabled', 'Enabled']]
  config: IConfig

  constructor(public root: RootSync, public auth: Auth) {
    super(root.config, root)
    // this.api = google.gmail('v1', { auth: this.auth.client })
    this.api = <GmailAPI>google.gmail('v1')
    this.api = Object.create(this.api)
    this.api.req = async (a, params, c, d) => {
      params.auth = this.auth.client
      // params.options = { forever: true }
      return await this.root.req(a, params, c, d, { forever: true })
    }
  }

  getState() {
    const state = new State(this)
    state.id('Gmail')
    return state
  }

  // bindToSubs() {
  //   super.bindToSubs()
  //
  //   // this.state.pipe('QueryLabelsSynced', this.sync.state)
  // }

  // ----- -----
  // Transitions
  // ----- -----

  threads = new Map<string, Thread>()
  subs: {
    query_labels: Sync[],
    lists: Sync[]
  }

  SubsInited_state() {
    this.subs = {
      lists: [],
      query_labels: [],
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
    console.warn('WRITE ME (GMAIL)')
    this.state.add('WritingDone')
    // process.exit()
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
  //   return console.log(`QueryLabels synced in: ${this.last_sync_time}ms`)
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
    console.log('[FETCH] history ID')
    let response = await this.api.req(
      this.api.users.getProfile,
      {
        userId: 'me',
        fields: 'historyId'
      },
      abort,
      false
    )
    // TODO redo when no response?
    if (!response || (abort && abort())) return
    this.history_id = parseInt(response.historyId, 10)
    this.history_ids.push({id: this.history_id, time: moment().unix()})
    this.last_sync_time = moment().unix()
    this.state.add('HistoryIdFetched')
  }

  // ----- -----
  // Methods
  // ----- -----

  // TODO return a more sensible format
  // findTaskForThread(
  //   thread_id: string
  // ): { 0: google.tasks.v1.Task; 1: TaskListSync } | { 0: null; 1: null } {
  //   for (let list_sync of this.task_lists_sync) {
  //     let found = list_sync.getTaskForThread(thread_id)
  //     if (found) {
  //       return [found, list_sync]
  //     }
  //   }
  //
  //   return [null, null]
  // }

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
    if (abort && abort()) return null

    return thread
  }

  // Searches all present gmail queries for the thread with the given ID.
  // TODO use this.threads
  getThread(id: string, with_content = false): google.gmail.v1.Thread | null {
    for (let query of this.queries) {
      for (let thread of query.threads) {
        if (thread.id !== id) continue
        // TODO should break here?
        if (with_content && thread.messages && !thread.messages.length) continue
        return thread
      }
    }
    return null
  }

  isHistoryIdValid() {
    return (
      this.history_id &&
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

    return this.history_id <= history_id
  }

  getLabelsIds(labels: string[] | string): string[] {
    if (!Array.isArray(labels)) {
      labels = [labels]
    }

    let ret: string[] = []
    for (let name of labels) {
      let label = this.labels.find(
        label => label.name.toLowerCase() === name.toLowerCase()
      )
      if (label) ret.push(label.id)
    }
    return ret
  }

  async modifyLabels(
    thread_id: string,
    add_labels: string[] = [],
    remove_labels: string[] = [],
    abort?: () => boolean
  ): Promise<boolean> {
    let add_label_ids = this.getLabelsIds(add_labels)
    let remove_label_ids = this.getLabelsIds(remove_labels)
    let thread = this.getThread(thread_id, true)

    let label = thread
      ? `"${getTitleFromThread(thread)}"`
      : `ID: ${thread_id}`

    let log_msg = `Modifing labels for thread ${label} `
    if (add_labels.length) log_msg += `+(${add_labels.join(' ')}) `

    if (remove_labels.length) log_msg += `-(${remove_labels.join(' ')})`

    console.log(log_msg)

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

  // TODO
  //    # sync the DB
  //    thread = @threads?.threads?.find (thread) ->
  //      thread.id is thread_id
  //    return if not thread
  //
  //    for msg in thread.messages
  //      msg.labelIds = msg.labelIds.without.apply msg.labelIds, remove_label_ids
  //      msg.labelIds.push add_label_ids

  async getHistoryId(abort?: () => boolean): Promise<number | null> {
    if (!this.history_id) {
      this.state.add('FetchingHistoryId', abort)
      await this.state.when('HistoryIdFetched')
    }

    return this.history_id
  }

  // TODO check raw_email
  /**
	 * @returns Thread ID or null
	 */
  async createThread(
    raw_email: string,
    labels: string[],
    abort?: () => boolean
  ): Promise<string | null> {
    console.log(`Creating thread (${labels.join(' ')})`)
    let message = await this.api.req(
      this.api.users.messages.insert,
      {
        userId: 'me',
        resource: {
          raw: raw_email,
          labelIds: this.getLabelsIds(labels)
        }
      },
      abort,
      false
    )
    // TODO labels?
    this.state.add('Dirty', labels)
    if (!message || (abort && abort())) return null
    return message.threadId
  }

  createEmail(subject: string): TRawEmail {
    let email = [
      `From: ${this.config.gmail_username} <${this.config
        .gmail_username}>s`,
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

  // TODO static or move to the thread class
  // threadHasLabels(thread: google.gmail.v1.Thread, labels: strings[]) {}
  // if not @gmail.is 'LabelsFetched'
  // 	throw new Error
  // for msg in thread.messages
  // 	for label_id in msg.labelIds
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
