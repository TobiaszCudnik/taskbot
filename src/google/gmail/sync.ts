import { machine } from 'asyncmachine'
import { TAbortFunction } from 'asyncmachine/types'
import * as debug from 'debug'
import * as google from 'googleapis'
import * as _ from 'lodash'
import * as delay from 'delay'
import * as moment from 'moment'
import { map } from 'typed-promisify-tob'
import * as regexEscape from 'escape-string-regexp'
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
} from '../../../typings/machines/google/gmail/sync'
import GC from '../../sync/gc'
import RootSync, { DBRecord } from '../../sync/root'
import { sync_writer_state, SyncWriter } from '../../sync/writer'
import { IConfig, ILabelDefinition, TRawEmail } from '../../types'
import Auth from '../auth'
///<reference path="../../../node_modules/typed-promisify-tob/index.ts"/>
import { Thread } from './query'
import GmailListSync from './sync-list'
import { trim } from 'lodash'
import * as merge from 'deepmerge'

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
    drop: ['FetchingOrphans', 'Reading']
  },

  Restarting: merge(sync_writer_state.Restarting, {
    drop: ['FetchingHistoryId']
  })
}

export type Label = google.gmail.v1.Label
export default class GmailSync extends SyncWriter<
  IConfig,
  TStates,
  IBind,
  IEmit
>
// TODO type machine types
// implements ITransitions
{
  state: AsyncMachine<TStates, IBind, IEmit>
  api: google.gmail.v1.Gmail
  history_id_timeout = 1
  history_id_latest: number | null
  last_sync_time: number
  labels: Label[]
  history_ids: { id: number; time: number }[] = []
  // @ts-ignore
  sub_states_outbound = [['Reading', 'Reading'], ['Enabled', 'Enabled']]
  threads = new Map<string, Thread>()
  subs: {
    lists: GmailListSync[]
  }
  included_labels = this.root.config.gmail.included_labels
  labels_to_fetch: string[]

  constructor(root: RootSync, public auth: Auth) {
    super(root.config, root)
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
    await map(records_without_threads, async (record: DBRecord) => {
      let thread = this.threads.get(record.gmail_id)
      // TODO time to config
      const too_old = moment()
        .subtract(this.config.gmail.orphans_freq_min || 5, 'minutes')
        .unix()
      // @ts-ignore `fetched` is set manually
      if (!thread || thread.fetched < too_old) {
        let refreshed
        try {
          refreshed = await this.fetchThread(record.gmail_id, abort)
        } catch {
          if (thread) {
            this.threads.delete(thread.id)
          }
          // thread doesnt exist
          this.log_verbose(
            `Thread '${record.gmail_id}' doesn't exist, removing the task`
          )
          delete record.gmail_id
          record.to_delete = true
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
    this.state.add('OrphansFetched')
  }

  async Writing_state() {
    super.Writing_state()
    if (process.env['DRY']) {
      // TODO list expected changes
      this.state.add('WritingDone')
      return
    }
    const abort = this.state.getAbort('Writing')
    await Promise.all([
      this.processLabelsToFetch(abort),
      this.processThreadsToDelete(abort),
      this.processThreadsToAdd(abort),
      this.processThreadsToModify(abort)
    ])
    this.state.add('WritingDone')
  }

  async FetchingLabels_state() {
    let abort = this.state.getAbort('FetchingLabels')
    let res = await this.req(
      'users.labels.list',
      this.api.users.labels.list,
      { userId: 'me', fields: 'labels(id,name,color)' },
      abort,
      false
    )
    if (abort()) return
    this.labels = res.labels
    await this.assertPredefinedLabelsExist(abort)
    // TODO simple hack for a mass label re-coloring
    try {
      await this.assertLabelsColors(abort)
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
    let response = await this.req(
      'users.getProfile',
      this.api.users.getProfile,
      {
        userId: 'me',
        fields: 'historyId'
      },
      abort,
      false
    )
    if (abort && abort()) return
    this.history_id_latest = parseInt(response.historyId, 10)
    this.history_ids.push({ id: this.history_id_latest, time: moment().unix() })
    this.last_sync_time = moment().unix()
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
   * TODO extract as a GoogleRequestMixin
   */
  async req<A, T, T2>(
    method_name: string,
    method: (arg: A, cb: (err: any, res: T, res2: T2) => void) => void,
    params: A,
    abort: (() => boolean) | null | undefined,
    returnArray: true,
    options?: object
  ): Promise<[T, T2] | null>
  async req<A, T>(
    method_name: string,
    method: (arg: A, cb: (err: any, res: T) => void) => void,
    params: A,
    abort: (() => boolean) | null | undefined,
    returnArray: false,
    options?: object
  ): Promise<T | null>
  async req<A, T>(
    method_name: string,
    method: (arg: A, cb: (err: any, res: T) => void) => void,
    params: A,
    abort: (() => boolean) | null | undefined,
    return_array: boolean,
    options?: object
  ): Promise<any> {
    // @ts-ignore
    params.auth = this.auth.client
    return await this.root.connections.req(
      this.root.config.user.id,
      'gmail.' + method_name,
      method,
      params,
      abort,
      // @ts-ignore
      return_array,
      {
        forever: true,
        ...options
      }
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

  async assertLabelsColors(abort: TAbortFunction) {
    await map(this.labels, async (label: Label) => {
      const def = this.root.getLabelDefinition(label.name)
      if (!def || !def.colors) return
      if (
        !label.color ||
        label.color.textColor != def.colors.fg ||
        label.color.backgroundColor != def.colors.bg
      ) {
        this.log(`Setting colors for label '${label.name}'`)
        const resource = this.labelDefToGmailDef(def)
        let res = await this.req(
          'users.labels.patch',
          this.api.users.labels.patch,
          {
            userId: 'me',
            id: label.id,
            resource
          },
          abort,
          false
        )
        Object.assign(label, resource)
      }
    })
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
          { userId: 'me', id, fields: 'id,name,color' },
          abort,
          false
        )
        this.labels.push(res)
      })
    )
    this.labels_to_fetch = []
    await this.assertLabelsColors(abort)
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
    return await map(to_delete, async (record: DBRecord) => {
      // Delete from gmail by moving to Trash
      await this.modifyLabels(record.gmail_id, ['TRASH'], [], abort)
      // Delete from the global gmail cache
      await this.threads.delete(record.gmail_id)
      // TODO delete also from all the matching lists?
      delete record.gmail_id
      // TODO update in bulk
      this.root.data.update(record)
    })
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
    return await map(new_threads, async (record: DBRecord) => {
      const labels = Object.entries(record.labels)
        .filter(([name, data]) => data.active)
        .map(([name]) => name)
      const id = await this.createThread(record.title, labels, abort)
      record.gmail_id = id
      this.root.data.update(record)
      await this.fetchThread(id, abort)
    })
  }

  async processThreadsToModify(abort: () => boolean): Promise<void[]> {
    const diff_threads = [...this.threads.values()]
      .map((thread: Thread) => {
        const record: DBRecord = this.root.data.findOne({ gmail_id: thread.id })
        if (!record) {
          this.log_error(
            `Missing record for the thread ${
              thread.id
            } '${this.getTitleFromThread(thread)}'`
          )
          return [thread.id, [], []]
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
        // TODO changed content -> new email in the thread
        return [thread.id, add, remove]
      })
      .filter(([id, add, remove]) => add.length || remove.length)

    if (diff_threads.length) {
      this.log(`Modifying ${diff_threads.length} new threads`)
    }
    return await map(diff_threads, async ([id, add, remove]) => {
      await this.modifyLabels(id, add, remove, abort)
    })
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

  async modifyLabels(
    thread_id: string,
    add_labels: string[] = [],
    remove_labels: string[] = [],
    abort?: () => boolean
  ): Promise<boolean> {
    await this.createLabelsIfMissing(add_labels, abort)
    let add_label_ids = add_labels.map(l => this.getLabelID(l))
    let remove_label_ids = remove_labels.map(l => this.getLabelID(l))
    let thread = this.getThread(thread_id, true)

    let title = thread
      ? `'${this.getTitleFromThread(thread)}'`
      : `ID: ${thread_id}`

    let log_msg = `Modifying labels for thread ${title} `
    if (add_labels.length) {
      log_msg += `+(${add_labels.join(' ')}) `
    }

    if (remove_labels.length) {
      log_msg += `-(${remove_labels.join(' ')})`
    }

    this.log(log_msg)

    let ret = await this.req(
      'users.threads.modify',
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
    // immediately re-fetch the thread, so its refreshed even if included in
    // any other query
    await this.fetchThread(thread_id, abort)
    return Boolean(ret)
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
    abort?: () => boolean
  ): Promise<google.gmail.v1.Thread | null> {
    // TODO limit the max msgs amount
    let thread = await this.req(
      'users.threads.get',
      this.api.users.threads.get,
      {
        id,
        userId: 'me',
        metadataHeaders: ['SUBJECT', 'FROM', 'TO'],
        format: 'metadata',
        fields: 'id,historyId,messages(id,labelIds,payload(headers))'
      },
      abort,
      false
    )
    if (!thread) {
      throw Error('Missing thread')
    }
    // memorize the time the resource was fetched
    // @ts-ignore
    thread.fetched = moment().unix()
    this.threads.set(thread.id, thread)

    if (abort && abort()) return null

    return thread
  }

  // TODO make it async and download if msgs missing, as a param ???
  getThread(id: string, with_content = false): google.gmail.v1.Thread | null {
    const thread = this.threads.get(id)
    if (!thread) return null
    if (with_content && !(thread.messages && thread.messages.length)) {
      return null
    }
    return thread
  }

  /**
   * TODO email content
   */
  async createThread(
    subject: string,
    labels: string[],
    abort?: () => boolean
  ): Promise<string | null> {
    await this.createLabelsIfMissing(labels, abort)
    this.log(`Creating thread '${subject}' (${labels.join(', ')})`)
    const ret = await this.req(
      'users.messages.insert',
      this.api.users.messages.insert,
      {
        userId: 'me',
        fields: 'threadId',
        resource: {
          raw: this.createEmail(subject),
          labelIds: labels.map(l => this.getLabelID(l))
        }
      },
      abort,
      false
    )
    // TODO handle no ret
    this.verbose(`New thread ID - '${ret.threadId}'`)
    return ret.threadId
  }

  createEmail(subject: string): TRawEmail {
    let email = [
      `From: ${this.root.config.google.username} <${
        this.root.config.google.username
      }>s`,
      `To: ${this.root.config.google.username}`,
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
    const id = this.getLabelID(label_name)
    // if (!id) {
    //   throw new Error(`Label ${label_name} doesn't exist`)
    // }
    return thread.messages.some(msg => msg.labelIds.includes(id))
  }

  getLabelsFromThread(thread: Thread, filter = true): string[] {
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
    return map(no_id, async name => {
      const def = this.root.getLabelDefinition(name)
      const gmail_def = def ? this.labelDefToGmailDef(def) : null
      this.log(`Creating a new label '${name}'`)
      const res = await this.req(
        'users.labels.create',
        this.api.users.labels.create,
        {
          userId: 'me',
          resource: {
            labelListVisibility: 'labelShow',
            messageListVisibility: 'show',
            name,
            ...gmail_def
          }
        },
        abort,
        false
      )
      this.labels.push(res)
    })
  }

  labelDefToGmailDef(
    def: ILabelDefinition
  ): { color?: { backgroundColor: string; textColor: string } } | null {
    if (def.colors) {
      return {
        color: {
          backgroundColor: def.colors.bg,
          textColor: def.colors.fg
        }
      }
    }
    return null
  }

  getTitleFromThread(
    thread: google.gmail.v1.Thread,
    filter_text_labels = true
  ) {
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

  getThreadAuthor(thread: Thread) {
    if (!thread.messages || !thread.messages.length)
      throw new Error(`Thread content not fetched, id: ${thread.id}`)
    const author = thread.messages[0].payload.headers.find(
      h => h.name == 'From'
    ).value
    const email = author.match(/<([^<]+)>$/)
    return email ? email[1] : author
  }

  getThreadAddressee(thread: Thread) {
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
