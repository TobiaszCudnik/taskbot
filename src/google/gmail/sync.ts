import { machine } from 'asyncmachine'
import { TAbortFunction } from 'asyncmachine/types'
import * as merge from 'deepmerge'
import * as delay from 'delay'
import * as regexEscape from 'escape-string-regexp'
import { GaxiosPromise, GaxiosResponse } from 'gaxios'
import { MethodOptions } from 'googleapis-common/build/src/api'
import * as _ from 'lodash'
import { trim } from 'lodash'
import * as moment from 'moment'
import { gmail_v1 } from '../../../typings/googleapis/gmail'
// Machine types
import {
  AsyncMachine,
  IBind,
  IEmit,
  IJSONStates,
  TStates
} from '../../../typings/machines/google/gmail/sync'
import RootSync, { DBRecord } from '../../sync/root'
import { sync_writer_state, SyncWriter } from '../../sync/writer'
import { IConfigParsed, ILabelDefinition, TRawEmail } from '../../types'
import Auth from '../auth'
import GmailListSync from './sync-list'

const SEC = 1000

export const sync_state: IJSONStates = {
  ...sync_writer_state,

  // -- overrides

  SubsInited: { require: ['ConfigSet'], auto: true },
  SubsReady: { require: ['SubsInited'], auto: true },
  Ready: {
    auto: true,
    require: [
      'ConfigSet',
      'SubsReady',
      'InitialHistoryIdFetched',
      'LabelsFetched'
    ],
    drop: ['Initializing']
  },

  FetchingLabels: {
    auto: true,
    require: ['Enabled'],
    drop: ['LabelsFetched']
  },
  // TODO required only for Writing
  LabelsFetched: {
    drop: ['FetchingLabels']
  },

  FetchingHistoryId: {
    auto: true,
    require: ['Enabled'],
    drop: ['HistoryIdFetched']
  },
  HistoryIdFetched: {
    drop: ['FetchingHistoryId'],
    add: ['InitialHistoryIdFetched']
  },
  InitialHistoryIdFetched: {},

  Writing: merge(sync_writer_state.Writing, {
    // TODO dropping FetchingOrphans shouldn't be necessary
    drop: ['OrphansFetched', 'FetchingOrphans']
  }),
  // ReadingDone: merge(sync_writer_state.ReadingDone, {
  //   require: ['OrphansFetched']
  // }),

  FetchingOrphans: {
    drop: ['OrphansFetched']
  },
  OrphansFetched: {
    add: ['ReadingDone'],
    // TODO check if this doesnt prevent refreshing orphaned threads
    require: ['ReadingDone'],
    drop: ['FetchingOrphans', 'Reading']
  },

  Restarting: merge(sync_writer_state.Restarting, {
    drop: ['FetchingHistoryId']
  })
}
export type TLabel = gmail_v1.Schema$Label
export type TThread = gmail_v1.Schema$Thread

export default class GmailSync extends SyncWriter<
  IConfigParsed,
  TStates,
  IBind,
  IEmit
>
// TODO type machine types
// implements ITransitions
{
  state: AsyncMachine<TStates, IBind, IEmit>
  api: gmail_v1.Gmail
  // miliseconds
  history_id_timeout = 1000
  history_id_latest: number | null
  last_sync_time: number
  labels: TLabel[]
  history_ids: { id: number; time: number }[] = []
  // @ts-ignore
  sub_states_outbound = [['Reading', 'Reading'], ['Enabled', 'Enabled']]
  threads = new Map<string, TThread>()
  subs: {
    lists: GmailListSync[]
  }
  included_labels = this.root.config.gmail.included_labels
  labels_to_fetch: string[]

  constructor(root: RootSync, public auth: Auth) {
    super(root.config_parsed, root)
    this.api = this.root.connections.apis.gmail
  }

  // ----- -----
  // Transitions
  // ----- -----

  SubsInited_state() {
    this.subs = {
      lists: this.config.lists
        .filter(config => !config.writers || config.writers.includes('gmail'))
        .map(config => new GmailListSync(config, this.root, this))
    }
    this.bindToSubs()
  }

  ReadingDone_enter() {
    if (!super.ReadingDone_enter()) {
      return false
    }
    // allow ReadingDone if the orphaned threads are fetched
    if (this.state.to().includes('OrphansFetched')) {
      return true
    }
    // fetch the orphaned threads after all the lists finish reading
    if (this.state.not('FetchingOrphans')) {
      this.state.add('FetchingOrphans')
    }
    return false
  }

  ReadingDone_state() {
    // get new labels while merging
    this.labels_to_fetch = []
    return super.ReadingDone_state()
  }

  removeThreadFromCache(thread_id: string) {
    this.threads.delete(thread_id)
  }

  /**
   * TODO type the google apis error
   * @param err
   * @param params
   * @constructor
   */
  Exception_enter(err: Error, ...params) {
    if (
      err &&
      // @ts-ignore
      err.errors &&
      // @ts-ignore
      err.errors.message &&
      // @ts-ignore
      err.errors.message[0] == 'No label add or removes specified'
    ) {
      // allowed error
      return false
    }
    return super.Exception_enter(err, ...params)
  }

  // Checks if the referenced thread ID is:
  // - downloaded
  // - existing
  // If not, delete the bogus ID and let Writing handle adding
  async FetchingOrphans_state() {
    const abort = this.state.getAbort('FetchingOrphans')
    // TODO fake cast, wrong d.ts, missing lokijs fields
    // TODO GC the orphaned threads after some time
    const records_without_threads = this.root.data.where((r: DBRecord) => {
      return (r.gmail_id && !this.threads.get(r.gmail_id)) || r.gmail_orphan
    })
    this.log_verbose(
      `Processing ${records_without_threads.length} orphaned threads`
    )
    await Promise.all(
      records_without_threads.map(async (record: DBRecord) => {
        let thread = this.threads.get(record.gmail_id)
        // TODO time to config
        const too_old = parseInt(
          moment()
            .subtract(this.config.gmail.orphans_freq_min || 5, 'minutes')
            .format('x'),
          10
        )
        // @ts-ignore `fetched` is set manually
        if (!thread || thread.fetched < too_old) {
          this.log_verbose('re-fetching')
          let refreshed
          try {
            refreshed = await this.fetchThread(
              record.gmail_id,
              abort,
              'FetchingOrphans_state'
            )
          } catch {
            if (thread) {
              this.threads.delete(thread.id)
            }
            // thread doesnt exist
            this.log_verbose(
              `Thread '${
                record.gmail_id
              }' doesn't exist, marking the record for deletion`
            )
            delete record.gmail_id
            record.to_delete = true
            // @ts-ignore
            this.root.markListsAsDirty(this, record)
            this.root.data.update(record)
            return
          }
          thread = refreshed
        }
        // TODO OMG WHAT HAVE I DONE !!!1111!!1
        // TODO extract as GmailMergeMixin or GmailReader or OrphanedThreadsList
        const context = Object.create(this)
        context.gmail = this
        GmailListSync.prototype.mergeRecord.call(context, thread, record)
        // TODO update in bulk
        this.root.data.update(record)
      })
    )
    this.state.add('OrphansFetched')
  }

  async Writing_state() {
    this.last_write_tries++

    const abort = this.state.getAbort('Writing')
    await Promise.all([
      this.processLabelsToFetch(abort),
      this.processThreadsToDelete(abort),
      this.processThreadsToAdd(abort),
      this.processThreadsToModify(abort)
    ])
    this.state.add('WritingDone')
  }

  SyncDone_state() {
    // TODO this is not really true, but almost true
    this.root.emitStats({
      last_sync_gmail: moment()
        .utc()
        .toISOString()
    })
  }

  async FetchingLabels_state() {
    const abort = this.state.getAbort('FetchingLabels')
    const res = await this.req(
      'users.labels.list',
      this.api.users.labels.list,
      this.api.users.labels,
      {
        userId: 'me',
        fields:
          'labels(id,name,color,labelListVisibility,messageListVisibility)'
      },
      abort
    )
    if (abort()) return
    this.labels = res.data.labels
    await this.assertPredefinedLabelsExist(abort)
    // TODO simple hack for a mass label re-coloring
    try {
      await this.syncLabels(abort)
    } catch {
      await delay(3 * SEC)
      this.state.drop('FetchingLabels')
      this.state.add('FetchingLabels')
      return
    }
    this.state.add('LabelsFetched')
  }

  async FetchingHistoryId_state(abort?: () => boolean) {
    this.log('[FETCH] history ID')
    const response = await this.req(
      'users.getProfile',
      this.api.users.getProfile,
      this.api.users,
      {
        userId: 'me',
        fields: 'historyId'
      },
      abort
    )
    if (abort && abort()) return
    this.history_id_latest = parseInt(response.data.historyId, 10)
    this.history_ids.push({
      id: this.history_id_latest,
      time: parseInt(moment().format('x'), 10)
    })
    this.last_sync_time = parseInt(moment().format('x'), 10)
    this.state.add('HistoryIdFetched')
  }

  // ----- -----
  // Methods
  // ----- -----

  getState() {
    return machine(sync_state).id('GMail/root')
  }

  /**
   * Request decorator
   */
  async req<P extends gmail_v1.StandardParameters, R>(
    method_name: string,
    method: (params: P, options: MethodOptions) => GaxiosPromise<R>,
    context: object,
    params: P,
    abort: (() => boolean) | null | undefined,
    options?: MethodOptions
    // @ts-ignore TODO fix type
  ): Promise<GaxiosResponse<R>> {
    // @ts-ignore
    params.auth = this.auth.client
    return await this.root.connections.req(
      this.root.config.user.id,
      'gmail.' + method_name,
      method,
      context,
      params,
      abort,
      options
    )
  }

  getListByName(name: string): GmailListSync {
    return this.subs.lists.find(
      (sync: GmailListSync) =>
        sync.config.name.toLocaleLowerCase() == name.toLocaleLowerCase()
    )
  }

  async assertPredefinedLabelsExist(abort?) {
    const labels = []
    for (const def of this.config.labels) {
      if (!def.prefix || !def.name) continue
      labels.push(def.prefix + def.name)
    }
    await this.createLabelsIfMissing(labels, abort)
  }

  toString() {
    return this.subs.lists.map(l => l.toString()).join('\n') + '\n'
  }

  async syncLabels(abort: TAbortFunction) {
    await Promise.all(
      this.labels.map(async (label: TLabel) => {
        const def = this.root.getLabelDefinition(label.name)
        if (!def) return
        let sync = false
        // sync colors
        if (
          def.colors &&
          (!label.color ||
            label.color.textColor != def.colors.fg ||
            label.color.backgroundColor != def.colors.bg)
        ) {
          sync = true
        }
        // sync visibility
        if (
          (def.hide_menu && label.labelListVisibility != 'labelHide') ||
          (def.hide_list && label.messageListVisibility != 'hide')
        ) {
          sync = true
        }
        // sync the definition
        if (sync) {
          this.log(`Syncing label '${label.name}'`)
          const patch = this.labelDefToGmailDef(def)
          await this.req(
            'users.labels.patch',
            this.api.users.labels.patch,
            this.api.users.labels,
            // @ts-ignore params typed manually
            {
              userId: 'me',
              id: label.id,
              requestBody: patch
            },
            abort
          )
          Object.assign(label, patch)
        }
      })
    )
  }

  async processLabelsToFetch(abort: TAbortFunction) {
    if (this.labels_to_fetch.length) {
      this.log(`Processing ${this.labels_to_fetch.length} unknown labels`)
    }
    await Promise.all(
      this.labels_to_fetch.map(async id => {
        const res = await await this.req(
          'users.labels.get',
          this.api.users.labels.get,
          this.api.users.labels,
          {
            userId: 'me',
            id,
            fields: 'id,name,color'
          },
          abort
        )
        this.labels.push(res.data)
      })
    )
    this.labels_to_fetch = []
    await this.syncLabels(abort)
  }

  async processThreadsToDelete(abort: () => boolean): Promise<void[]> {
    const to_delete = this.root.data
      .find({
        to_delete: true
      })
      .filter((record: DBRecord) => Boolean(record.gmail_id))

    if (to_delete.length) {
      this.log(`Deleting ${to_delete.length} threads`)
    }
    return await Promise.all(
      to_delete.map(async (record: DBRecord) => {
        // Delete from gmail by moving to Trash
        await this.writeThreadLabels(record.gmail_id, ['TRASH'], [], abort)
        // Delete from the global gmail cache
        await this.threads.delete(record.gmail_id)
        // TODO delete also from all the matching lists?
        delete record.gmail_id
        // mark touched lists as Dirty to trigger a re-read
        // @ts-ignore
        this.root.markListsAsDirty(this, record)
        // TODO update in bulk
        this.root.data.update(record)
      })
    )
  }

  async processThreadsToAdd(abort: () => boolean): Promise<void[]> {
    const new_threads = this.root.data
      .find({
        gmail_id: undefined
      })
      .filter((record: DBRecord) => !record.to_delete)

    if (new_threads.length) {
      this.log(`Creating ${new_threads.length} new threads`)
    }
    return await Promise.all(
      new_threads.map(async (record: DBRecord) => {
        const labels = Object.entries(record.labels)
          .filter(([name, data]) => data.active)
          .map(([name]) => name)
        const id = await this.createThread(record.title, labels, abort)
        record.gmail_id = id
        this.root.data.update(record)
        // mark touched lists as Dirty to trigger a re-read
        // @ts-ignore
        this.root.markListsAsDirty(this, record)
        // @ts-ignore
        this.root.markWritersAsDirty(this, record)
        await this.fetchThread(id, abort, 'processThreadsToAdd')
      })
    )
  }

  async processThreadsToModify(abort: () => boolean): Promise<void[]> {
    type LabelsChange = {
      id: string
      add?: string[]
      remove?: string[]
    }
    const diff_threads: LabelsChange[] = [...this.threads.values()]
      .map((thread: TThread) => {
        const record: DBRecord = this.getRecordByGmailID(thread.id)
        if (!record) {
          this.log_error(
            `Missing record for the thread ${thread.id} '${this.root.logText(
              this.getTitleFromThread(thread)
            )}'`
          )
          return null
        }
        // TODO time of write (and latter reading) should not update
        //   record.updated?
        const add = Object.entries(record.labels)
          .filter(([name, data]) => {
            return data.active ? !this.threadHasLabel(thread, name) : false
          })
          .map(([name, data]) => name)
        const remove = Object.entries(record.labels)
          .filter(([name, data]) => {
            return !data.active ? this.threadHasLabel(thread, name) : false
          })
          .map(([name, data]) => name)
        if (!add.length && !remove.length) {
          return null
        }
        // mark touched lists as Dirty to trigger a re-read
        // @ts-ignore TODO fix SyncReader
        this.root.markListsAsDirty(this, record)
        // check cache of other lists if the thread was there before
        // TODO get this info from the record's history
        for (const list of this.subs.lists) {
          if (!list.hasThread(record.gmail_id)) continue
          list.state.add('Dirty')
        }
        return { id: thread.id, add, remove }
      })
      .filter(Boolean)

    if (diff_threads.length) {
      this.log(`Modifying ${diff_threads.length} new threads`)
    }
    return await Promise.all(
      diff_threads.map(async ({ id, add, remove }) => {
        await this.writeThreadLabels(id, add, remove, abort)
      })
    )
  }

  getRecordByGmailID(id: string) {
    return this.root.data.findOne({ gmail_id: id })
  }

  isHistoryIdValid() {
    return (
      this.history_id_latest &&
      parseInt(moment().format('x'), 10) <
        this.last_sync_time + this.history_id_timeout
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

  timeFromHistoryID(history_id: number) {
    // floor the guess (to the closest previous recorded history ID)
    // or now
    let index = _.sortedIndexBy(this.history_ids, { id: history_id }, 'id')
    return index
      ? this.history_ids[index - 1].time
      : // TODO initial guess to avoid a double merge
        this.history_ids[0].time
  }

  getLabelID(label: string): string {
    const gmail_label = this.labels.find(
      gmail_label => gmail_label.name.toLowerCase() == label.toLowerCase()
    )
    return gmail_label && gmail_label.id
  }

  getLabelName(id: string): string {
    const gmail_label = this.labels.find(gmail_label => gmail_label.id == id)
    return gmail_label && gmail_label.name
  }

  /**
   * TODO handle No label add or removes specified??
   * @param thread_id
   * @param add_labels
   * @param remove_labels
   * @param abort
   */
  async writeThreadLabels(
    thread_id: string,
    add_labels: string[] = [],
    remove_labels: string[] = [],
    abort?: () => boolean
  ): Promise<boolean> {
    await this.createLabelsIfMissing(add_labels, abort)
    let add_label_ids = add_labels.map(l => this.getLabelID(l))
    let remove_label_ids = remove_labels
      .map(l => this.getLabelID(l))
      // dont remove labels which are supposed to be added
      .filter(id => !add_label_ids.includes(id))
    let thread = this.getThread(thread_id, true)

    let title = thread
      ? `'${this.getTitleFromThread(thread)}'`
      : `ID: ${thread_id}`

    let log_msg = `Modifying labels for thread ${this.root.logText(title)} `
    if (add_labels.length) {
      log_msg += `+('${add_labels.join("', '")}') `
    }

    if (remove_labels.length) {
      log_msg += `-('${remove_labels.join("', '")}')`
    }

    this.log(log_msg)

    let ret = await this.req(
      'users.threads.modify',
      this.api.users.threads.modify,
      this.api.users.threads,
      {
        id: thread_id,
        userId: 'me',
        fields: 'id',
        requestBody: {
          addLabelIds: add_label_ids,
          removeLabelIds: remove_label_ids
        }
      },
      abort
    )
    // immediately re-fetch the thread, so its refreshed even if included in
    // any other query
    // TODO catch the error when thread disappears
    await this.fetchThread(thread_id, abort, 'writeThreadLabels')
    return Boolean(ret.data)
  }

  async getHistoryId(abort?: () => boolean): Promise<number | null> {
    if (!this.history_id_latest) {
      this.state.add('FetchingHistoryId', abort)
      await this.state.when('HistoryIdFetched')
    }

    return this.history_id_latest
  }

  async fetchThread(
    id: string,
    abort?: () => boolean,
    caller = ''
  ): Promise<TThread | null> {
    // TODO limit the max msgs amount
    let thread = await this.req(
      'users.threads.get',
      this.api.users.threads.get,
      this.api.users.threads,
      {
        id,
        userId: 'me',
        format: 'metadata',
        fields: 'id,historyId,messages(id,labelIds,payload(headers))',
        // @ts-ignore wrong d.ts
        metadataHeaders: ['SUBJECT', 'FROM', 'TO']
      },
      abort
    )
    if (!thread) {
      // TODO stacktrace / label
      const previous = this.threads.get(id)
      let msg = `Missing thread ${id}`
      if (caller) {
        msg += ` (caller: ${caller})`
      }
      if (previous) {
        msg += `, previous: "${this.getTitleFromThread(previous)}"`
      }
      throw Error(msg)
    }
    // memorize the time the resource was fetched
    // @ts-ignore
    thread.data.fetched = parseInt(moment().format('x'), 10)
    this.threads.set(thread.data.id, thread.data)

    if (abort && abort()) return null

    return thread.data
  }

  // TODO make it async and download if msgs missing, as a param ???
  getThread(id: string, with_content = false): TThread | null {
    const thread = this.threads.get(id)
    if (!thread) return null
    if (with_content && !(thread.messages && thread.messages.length)) {
      return null
    }
    return thread
  }

  /**
   * TODO email content
   * @return New thread ID
   */
  async createThread(
    subject: string,
    labels: string[] = ['UNREAD', 'INBOX'],
    abort?: () => boolean
  ): Promise<string | null> {
    await this.createLabelsIfMissing(labels, abort)
    this.log(`Creating thread '${subject}' (${labels.join(', ')})`)
    const ret = await this.req(
      'users.messages.insert',
      this.api.users.messages.insert,
      this.api.users.messages,
      {
        userId: 'me',
        fields: 'threadId',
        requestBody: {
          raw: this.createEmail(subject),
          labelIds: labels.map(l => this.getLabelID(l))
        }
      },
      abort
    )
    this.log_verbose(`New thread ID - '${ret.data.threadId}'`)
    return ret.data.threadId
  }

  createEmail(subject: string): TRawEmail {
    let email = [
      `From: ${this.root.config.google.username} <${
        this.root.config.google.username
      }>`,
      `To: ${this.root.config.google.username}`,
      'Content-type: text/html;charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${subject}`
    ].join('\r\n')

    // TODO [DEP0005] DeprecationWarning: Buffer() is deprecated due to security
    //   and usability issues. Please use the Buffer.alloc(),
    //   Buffer.allocUnsafe(), or Buffer.from() methods instead
    return new Buffer(email)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_') as TRawEmail
  }

  threadHasLabel(thread: TThread, label_name: string) {
    if (!this.state.is('LabelsFetched')) {
      throw new Error('Labels not fetched')
    }
    const id = this.getLabelID(label_name)
    // if (!id) {
    //   throw new Error(`Label ${label_name} doesn't exist`)
    // }
    return thread.messages.some(msg => msg.labelIds.includes(id))
  }

  getLabelsFromThread(thread: TThread, filter = true): string[] {
    const labels = new Set<string>()
    for (const msg of thread.messages) {
      for (const id of msg.labelIds) {
        const name = this.getLabelName(id)
        if (!name) {
          this.labels_to_fetch.push(id)
        } else if (!filter || this.included_labels.some(f => !!f.exec(name))) {
          labels.add(name)
        }
      }
    }
    return [...labels]
  }

  async createLabelsIfMissing(labels: string[], abort?) {
    const no_id = labels.filter(name => !this.getLabelID(name))
    return Promise.all(
      no_id.map(async name => {
        const def = this.root.getLabelDefinition(name)
        // decorate with local definiton
        const gmail_def = def ? this.labelDefToGmailDef(def) : null
        this.log(`Creating a new label '${name}'`)
        const res = (await this.req(
          'users.labels.create',
          this.api.users.labels.create,
          this.api.users.labels,
          {
            userId: 'me',
            requestBody: {
              labelListVisibility: 'labelShow',
              messageListVisibility: 'show',
              name,
              ...gmail_def
            }
          },
          abort
        )) as any
        this.labels.push(res.data)
        return res
      })
    )
  }

  labelDefToGmailDef(
    def: ILabelDefinition
  ): {
    color?: { backgroundColor: string; textColor: string }
    labelListVisibility?: 'labelHide'
  } | null {
    const ret = {}
    if (def.colors) {
      Object.assign(ret, {
        color: {
          backgroundColor: def.colors.bg,
          textColor: def.colors.fg
        }
      })
    }
    if (def.hide_menu) {
      Object.assign(ret, {
        labelListVisibility: 'labelHide'
      })
    }
    if (def.hide_list) {
      Object.assign(ret, {
        messageListVisibility: 'hide'
      })
    }
    return Object.keys(ret).length ? ret : null
  }

  getTitleFromThread(thread: TThread, filter_text_labels = true) {
    if (!thread.messages || !thread.messages.length)
      throw new Error(`Thread content not fetched, id: ${thread.id}`)
    let title
    try {
      title = thread.messages[0].payload.headers.find(h => h.name == 'Subject')
        .value
    } catch (e) {}
    title = trim(title)
    if (filter_text_labels) {
      title = this.removeTextLabelSymbols(this.removeStatusTextLabels(title))
    }
    return title || '(no subject)'
  }

  getThreadAuthor(thread: TThread) {
    if (!thread.messages || !thread.messages.length)
      throw new Error(`Thread content not fetched, id: ${thread.id}`)
    const author = thread.messages[0].payload.headers.find(
      h => h.name == 'From'
    ).value
    const email = author.match(/<([^<]+)>$/)
    return email ? email[1] : author
  }

  // TODO change to getThreadRecipient
  getThreadAddressee(thread: TThread) {
    if (!thread.messages || !thread.messages.length)
      throw new Error(`Thread content not fetched, id: ${thread.id}`)
    const author = thread.messages[0].payload.headers.find(h => h.name == 'To')
      .value
    const email = author.match(/<([^<]+)>$/)
    return email ? email[1] : author
  }

  // eg 'foo #bar baz' -> 'foo bar baz'
  removeTextLabelSymbols(text: string) {
    // get all label symbols
    const symbols = new Set<string>()
    for (const label of this.config.labels) {
      if (label.symbol) {
        symbols.add(label.symbol)
      }
    }
    // replace
    for (const symbol of symbols.values()) {
      text.replace(new RegExp(regexEscape(symbol) + '(\\w)', 'g'), '$1')
    }
    return text
  }

  removeStatusTextLabels(text: string) {
    return text.replace(/\s!\w+\b/g, '')
  }
}

export function normalizeLabelName(label: string) {
  return label
    .replace('/', '-')
    .replace(' ', '-')
    .toLowerCase()
}
