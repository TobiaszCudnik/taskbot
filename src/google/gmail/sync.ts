///<reference path="../../../node_modules/typed-promisify-tob/index.ts"/>
import { Thread } from './query'
import * as _ from 'lodash'
import * as google from 'googleapis'
import { IConfig, ILabelDefinition, TRawEmail } from '../../types'
import { map } from 'typed-promisify-tob'
import { Sync, SyncWriter, sync_writer_state } from '../../sync/sync'
import Auth from '../auth'
import GmailListSync from './sync-list'
import RootSync, { DBRecord } from '../../sync/root'
import * as moment from 'moment'
import * as debug from 'debug'
import { machine } from 'asyncmachine'
// Machine types
import {
  IBind,
  IEmit,
  IJSONStates,
  IState,
  TStates,
  IEmitBase,
  IBindBase,
  AsyncMachine
} from '../../../typings/machines/google/gmail/sync'

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
  InitialHistoryIdFetched: {}
}

// TODO tmp
export interface GmailAPI extends google.gmail.v1.Gmail {
  req(method, params, abort, ret_array): Promise<any>
}

export type Label = google.gmail.v1.Label
export default class GmailSync extends SyncWriter<
  IConfig,
  TStates,
  IBind,
  IEmit
> {
  state: AsyncMachine<TStates, IBind, IEmit>
  api: GmailAPI
  history_id_timeout = 1
  history_id_latest: number | null
  last_sync_time: number
  labels: Label[]
  history_ids: { id: number; time: number }[] = []
  sub_states_outbound = [['Reading', 'Reading'], ['Enabled', 'Enabled']]
  threads = new Map<string, Thread>()
  subs: {
    lists: GmailListSync[]
  }
  verbose = debug('gmail-verbose')
  thread_label_filters = [
    /^S\/[\w\s-]+$/,
    /^V\/[\w\s-]+$/,
    /^P\/[\w\s-]+$/,
    /^INBOX$/
  ]

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
      lists: []
    }
    for (const config of this.config.lists) {
      this.subs.lists.push(new GmailListSync(config, this.root, this))
    }
    // this.subs.text_labels = new GmailTextLabelsSync(
    //   this.data,
    //   this.api,
    //   this.config.text_labels
    // )
    this.bindToSubs()
  }

  async Writing_state() {
    super.Writing_state()
    if (process.env['DRY']) {
      // TODO list expected changes
      this.state.add('WritingDone')
      return
    }
    const abort = this.state.getAbort('Writing')
    await this.markThreadsToFix(abort)
    await Promise.all([
      this.getThreadsToAdd(abort),
      this.getThreadsToModify(abort)
    ])
    this.state.add('WritingDone')
  }

  async FetchingLabels_state() {
    let abort = this.state.getAbort('FetchingLabels')
    let res = await this.api.req(
      this.api.users.labels.list,
      { userId: 'me', fields: 'labels(id,name,color)' },
      abort,
      false
    )
    if (abort()) return
    this.labels = res.labels
    await this.assertLabelsColors(abort)
    this.state.add('LabelsFetched')
  }

  async assertLabelsColors(abort) {
    await map(this.labels, async (label: Label) => {
      const def = this.root.getLabelDefinition(label.name)
      if (!def || !def.colors) return
      // TODO regenerate googleapis typings
      if (
        !label.color ||
        label.color.textColor != def.colors.fg ||
        label.color.backgroundColor != def.colors.bg
      ) {
        this.log(`Setting colors for label '${label.name}'`)
        const resource = this.labelDefToGmailDef(def)
        let res = await this.api.req(
          this.api.users.labels.patch,
          { userId: 'me', id: label.id, resource },
          abort,
          false
        )
        Object.assign(label, resource)
      }
    })
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
    return machine(sync_state).id('Gmail')
  }

  async getThreadsToAdd(abort: () => boolean): Promise<void[]> {
    // TODO fake cast, wrong d.ts, missing lokijs fields
    const new_threads = <DBRecord[]>(<any>this.root.data.find({
      gmail_id: undefined
    }))
    // TODO mark as Dirty only queries related by labels
    if (new_threads.length) {
      this.subs.lists.forEach(sub => sub.query.state.add('Dirty'))
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

  async getThreadsToModify(abort: () => boolean): Promise<void[]> {
    const diff_threads = [...this.threads.values()]
      .map(thread => {
        const record = this.root.data.findOne({ gmail_id: thread.id })
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

    // TODO mark as Dirty only queries related by labels
    if (diff_threads.length) {
      this.log(`Modifying ${diff_threads.length} new threads`)
      this.subs.lists.forEach(sub => sub.query.state.add('Dirty'))
    }
    return await map(diff_threads, async ([id, add, remove]) => {
      await this.modifyLabels(id, add, remove, abort)
    })
  }

  // Checks if the referenced thread ID is:
  // - downloaded
  // - existing
  // If not, delete the bogus ID and let Writing handle adding
  async markThreadsToFix(abort: () => boolean): Promise<void[]> {
    // TODO fake cast, wrong d.ts, missing lokijs fields
    const records_without_threads = <DBRecord[]>(<any>this.root.data.where(
      (r: DBRecord) => {
        return r.gmail_id && !this.threads.get(r.gmail_id)
      }
    ))
    return await map(records_without_threads, async (record: DBRecord) => {
      try {
        await this.fetchThread(record.gmail_id, abort)
      } catch {
        // thread doesnt exist
        delete record.gmail_id
        this.root.data.update(record)
      }
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

  // TODO support thread object as a param a parseInt(r.historyId, 10)
  timeFromHistoryID(history_id: number) {
    // floor the guess (to the closest previous recorded history ID)
    // or now
    let index = _.sortedIndexBy(this.history_ids, { id: history_id }, 'id')
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
    let add_label_ids = add_labels.map(l => this.getLabelId(l))
    let remove_label_ids = remove_labels.map(l => this.getLabelId(l))
    let thread = this.getThread(thread_id, true)

    let title = thread ? `'${getTitleFromThread(thread)}'` : `ID: ${thread_id}`

    let log_msg = `Modifying labels for thread ${title} `
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
    // re-fetch the thread immediately, so its refreshed even if not a part of
    // any query any more
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

  // TODO avoid duplicate concurrent re-fetching
  async fetchThread(
    id: string,
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
      abort,
      false
    )
    if (!thread) {
      throw Error('Missing thread')
    }
    thread.fetched = moment().unix()
    this.threads.set(thread.id, thread)

    if (abort && abort()) return null

    return thread
  }

  // TODO make it async and download if msgs missing
  getThread(id: string, with_content = false): google.gmail.v1.Thread | null {
    const thread = this.threads.get(id)
    if (with_content && !(thread.messages && thread.messages.length)) {
      return null
    }
    return thread || null
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
    const message = await this.api.req(
      this.api.users.messages.insert,
      {
        userId: 'me',
        fields: 'threadId',
        resource: {
          raw: this.createEmail(subject),
          labelIds: labels.map(l => this.getLabelId(l))
        }
      },
      abort,
      false
    )
    // TODO handle no message
    this.verbose(`New thread ID - '${message.threadId}'`)
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
        if (!filter || this.thread_label_filters.some(f => !!f.exec(name))) {
          labels.add(this.getLabelName(id))
        }
      }
    }
    return [...labels]
  }

  async createLabelsIfMissing(labels: string[], abort) {
    const no_id = labels.filter(l => !this.getLabelId(l))
    return map(no_id, async name => {
      const def = this.root.getLabelDefinition(name)
      const gmail_def = def ? this.labelDefToGmailDef(def) : null
      const res = await this.api.req(
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
      this.log(`Added a new label '${name}'`)
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
