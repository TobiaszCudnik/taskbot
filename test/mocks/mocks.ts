///<reference path="../../typings/global.d.ts"/>

import * as assert from 'assert'
import { GaxiosResponse } from 'gaxios'
import * as debug from 'debug'
import * as clone from 'deepcopy'
import * as gmailQuery from 'gmail-string-query'
import { TTask } from '../../src/google/tasks/sync'
import { tasks_v1 } from '../../typings/googleapis/tasks'
import { gmail_v1 } from '../../typings/googleapis/gmail'
import { MethodOptions } from 'googleapis-common'
import { Base64 } from 'js-base64'
import { simpleParser } from 'mailparser'
import * as md5 from 'md5'
import * as moment from 'moment-timezone'
import * as randomId from 'simple-random-id'
import { normalizeLabelName } from '../../src/google/gmail/sync'
import { TGlobalFields } from '../../src/google/sync'

// ----- COMMON

type MethodNames<T> = {
  [K in keyof T]: T[K] extends (...args: any) => any ? K : never
}[keyof T]

type MockedAPI<T> = Partial<Pick<T, MethodNames<T>>>

type Response = {
  headers?: {}
  status?: number
  statusText?: string
}

/**
 * @param data
 * @param response
 */
function ok<T>(data: T, response: Response = {}): GaxiosResponse<T> {
  return {
    data: clone(data),
    status: response.status || 200,
    headers: response.headers || {},
    // TODO?
    config: {}
  }
}

// TODO check if return not depended on the `data`
export class NotFoundError extends Error {
  code: 404
}

function now() {
  return moment()
    .utc()
    .toISOString()
}

// ----- GMAIL

export interface Thread extends gmail_v1.Schema$Thread {
  labelIds: string[]
  subject: string
  from: string
  to: string
  // flattened label names for lucene queries, eg "foo,bar,!s-action"
  label: string
}
type Label = gmail_v1.Schema$Label
type Message = gmail_v1.Schema$Message

export class Gmail {
  // non-API
  email: string
  // TODO keep in `Gmail.data`
  threads: Thread[] = []
  labels: Label[] = []
  messages: Message[] = []
  historyId = 0
  // API
  users = new GmailUsers(this)
  log = debug('mock-gmail')
  log_verbose = debug('mock-gmail-verbose')

  constructor() {
    this.email = 'mock@google.com'
  }

  /**
   * Get or create labels and return IDs.
   */
  getLabelIDs(labels: string[]): string[] {
    const ids = []
    for (const name of labels) {
      const label = this.labels.find(l => l.id == normalizeLabelName(name))
      if (label) {
        ids.push(label.id)
      } else {
        let id = normalizeLabelName(name)
        const label: Label = {
          name,
          id
        }
        this.labels.push(label)
        ids.push(id)
      }
    }
    return ids
  }

  toString() {
    return (
      'GMail mock:\n' +
      this.threads
        .map(this.users.threads.mergeThreadLabels)
        .map((t: Thread) => `- ${t.subject} \n ${t.label}`)
        .join('\n')
    )
  }

  reset() {
    this.threads = []
    this.labels = []
    this.messages = []
    this.historyId = 0
    this.users = new GmailUsers(this)
  }
}

class GmailChild {
  constructor(public gmail: Gmail) {}
}

export class GmailUsers extends GmailChild
  implements MockedAPI<gmail_v1.Resource$Users> {
  labels = new GmailUsersLabels(this.gmail)
  // drafts: Resource$Users$Drafts
  // history: Resource$Users$History
  messages = new GmailUsersMessages(this.gmail)
  // settings: Resource$Users$Settings
  threads = new GmailUsersThreads(this.gmail)

  async getProfile(
    params: gmail_v1.Params$Resource$Users$Getprofile & TGlobalFields,
    options?: MethodOptions
  ): Promise<GaxiosResponse<gmail_v1.Schema$Profile>> {
    return ok({
      emailAddress: this.gmail.email,
      historyId: this.gmail.historyId.toString(),
      messagesTotal: this.gmail.messages.length,
      threadsTotal: this.gmail.threads.length
    })
  }
}

export class GmailUsersMessages extends GmailChild
  implements MockedAPI<gmail_v1.Resource$Users$Messages> {
  async send(
    params: gmail_v1.Params$Resource$Users$Messages$Send & TGlobalFields
    // options?: MethodOptions
  ): Promise<GaxiosResponse<Message>> {
    this.gmail.historyId++
    const historyId = this.gmail.historyId.toString()
    const threadId = randomId()
    const mail = await simpleParser(Base64.decode(params.requestBody.raw))
    const labelIds = clone(params.requestBody.labelIds) || []
    labelIds.push('UNREAD', 'INBOX')
    const msg: Message = {
      id: randomId(),
      historyId,
      threadId,
      labelIds,
      payload: {
        headers: [
          {
            name: 'From',
            value: mail.from.text
          },
          {
            name: 'To',
            value: mail.to.text
          },
          {
            name: 'Subject',
            value: mail.subject
          }
        ]
      }
      // TODO more fields
    }
    const thread: Thread = {
      historyId,
      id: threadId,
      snippet: (mail.text || '').substr(0, 200),
      messages: [msg],
      labelIds,
      subject: mail.subject,
      to: mail.to.text,
      from: mail.from.text,
      label: ''
    }
    const res = clone(params.requestBody)
    this.gmail.messages.push(msg)
    this.gmail.threads.push(thread)
    return ok({
      threadId,
      ...res
      // TODO missing fields?
    })
  }

  async insert(
    params: gmail_v1.Params$Resource$Users$Messages$Insert & TGlobalFields
    // options?: MethodOptions
  ): Promise<GaxiosResponse<Message>> {
    return this.send(params)
  }
}

export class GmailUsersLabels extends GmailChild
  implements MockedAPI<gmail_v1.Resource$Users$Labels> {
  constructor(gmail: Gmail) {
    super(gmail)
    // create predefined (system) labels
    this.gmail.labels.push({
      id: 'INBOX',
      name: 'INBOX',
      type: 'system'
    })
    this.gmail.labels.push({
      id: 'UNREAD',
      name: 'UNREAD',
      type: 'system'
    })
  }

  async list(
    params: gmail_v1.Params$Resource$Users$Labels$List & TGlobalFields
    // options?: MethodOptions
  ): Promise<GaxiosResponse<gmail_v1.Schema$ListLabelsResponse>> {
    return ok({
      labels: this.gmail.labels
    })
  }

  async patch(
    params: gmail_v1.Params$Resource$Users$Labels$Patch & TGlobalFields
    // options?: MethodOptions
  ): Promise<GaxiosResponse<Label>> {
    assert(params.id)
    assert(params.requestBody)
    const data = this.gmail.labels
    const i = data.findIndex(l => l.id === params.id)
    data[i] = cloneAndPatch(data[i], params.requestBody)
    return ok(data[i])
  }

  async get(
    params: gmail_v1.Params$Resource$Users$Labels$Get & TGlobalFields
    // options?: MethodOptions
  ): Promise<GaxiosResponse<Label>> {
    const label = this.gmail.labels.find(l => l.id === params.id)
    if (!label) {
      throw new NotFoundError()
    }
    return ok(label)
  }

  async create(
    params: gmail_v1.Params$Resource$Users$Labels$Create & TGlobalFields
    // options?: MethodOptions
  ): Promise<GaxiosResponse<Label>> {
    const label = clone(params.requestBody)
    label.id = normalizeLabelName(label.name)
    this.gmail.labels.push(label)
    return ok(label)
  }
}

export class GmailUsersThreads extends GmailChild
  implements MockedAPI<gmail_v1.Resource$Users$Threads> {
  async list(
    params: gmail_v1.Params$Resource$Users$Threads$List & TGlobalFields,
    options?: MethodOptions
  ): Promise<GaxiosResponse<gmail_v1.Schema$ListThreadsResponse>> {
    let threads = this.gmail.threads

    // evaluate the search expression
    if (params.q) {
      threads = this.query(params.q)
    }

    this.gmail.log(`list threads ${params.q}`)
    this.gmail.log_verbose(threads)
    return ok({
      threads
    })
  }

  async get(
    params: gmail_v1.Params$Resource$Users$Threads$Get & TGlobalFields,
    options?: MethodOptions
  ): Promise<GaxiosResponse<Thread>> {
    assert(params.id)
    const thread = this.gmail.threads.find(t => t.id === params.id)
    if (!thread) {
      throw new NotFoundError()
    }
    this.gmail.log(`get thread ${params.id}`)
    return ok(thread)
  }

  async modify(
    params: gmail_v1.Params$Resource$Users$Threads$Modify & TGlobalFields,
    options?: MethodOptions
  ): Promise<GaxiosResponse<Thread>> {
    assert(params.id)
    assert(params.requestBody)
    const thread = this.gmail.threads.find(t => t.id === params.id)
    if (!thread) {
      throw new NotFoundError()
    }
    const remove = clone(
      (params.requestBody && params.requestBody.removeLabelIds) || []
    )
    const add = clone(
      (params.requestBody && params.requestBody.addLabelIds) || []
    )
    // remove
    thread.labelIds = thread.labelIds.filter(id => !remove.includes(id))
    // add from every message
    for (const msg of thread.messages) {
      msg.labelIds = msg.labelIds.filter(id => !remove.includes(id))
    }
    // add
    for (const id of add) {
      if (!thread.labelIds.includes(id)) {
        thread.labelIds.push(id)
      }
      // add to every message
      for (const msg of thread.messages) {
        if (!msg.labelIds.includes(id)) {
          msg.labelIds.push(id)
        }
      }
    }
    this.gmail.historyId++
    const hid = this.gmail.historyId.toString()
    thread.historyId = hid
    for (const msg of thread.messages) {
      msg.historyId = hid
    }
    this.gmail.log(`modified thread ${params.id}`, thread.subject, add, remove)
    return ok(thread)
  }

  async delete(
    params: gmail_v1.Params$Resource$Users$Threads$Delete & TGlobalFields,
    options?: MethodOptions
  ): Promise<GaxiosResponse<void>> {
    assert(params.id)
    const data = this.gmail.threads
    const i = data.findIndex(t => t.id === params.id)
    if (!data[i]) {
      throw new NotFoundError()
    }
    // remove in place
    data.splice(i, 1)
    this.gmail.historyId++
    this.gmail.log(`deleted thread ${params.id}`)
    return ok(void 0, { status: 204, statusText: 'No Content' })
  }

  protected query(query: string): Thread[] {
    // merge labels into a string
    return this.gmail.threads
      .map(this.mergeThreadLabels.bind(this))
      .filter(gmailQuery(query))
  }

  mergeThreadLabels: (thread: Thread) => Thread = thread => {
    thread.label = thread.labelIds
      .map(id => {
        const label = this.gmail.labels.find(l => l.id == id)
        if (!label) {
          throw new Error(`label ${id} doesnt exist`)
        }
        return label.name
      })
      .join(',')
      .replace(/ /g, '-')
      .replace(/\//g, '-')
      .toLowerCase()
    // always add the "all" label when no "trash"
    if (!thread.label.match(/(^|,)trash($|,)/)) {
      thread.label += ',all'
    }
    return thread
  }
}

// ----- TASKS

export interface Task extends tasks_v1.Schema$Task {
  tasklist: string
}
type TaskList = tasks_v1.Schema$TaskList

export class Tasks {
  data: {
    tasks: Task[]
    lists: TaskList[]
  } = {
    tasks: [],
    lists: []
  }
  log = debug('mock-gtasks')

  tasks = new TasksTasks(this)
  tasklists = new TasksTasklists(this)

  reset() {
    this.tasks = new TasksTasks(this)
    this.tasklists = new TasksTasklists(this)
  }

  // TODO order by position
  // TODO support nesting
  toString() {
    return (
      this.data.lists
        .map(l => {
          return (
            `GTasks mock - ${l.title}\n` +
            this.data.tasks
              .filter(t => t.tasklist === l.id)
              .filter(t => t.title && t.title.trim())
              .map(
                t =>
                  (t.status == 'completed' ? 'c ' : '- ') +
                  (t.hidden ? '(h) ' : '') +
                  t.title
              )
              .join('\n')
          )
        })
        .join('\n') + '\n'
    )
  }
}

export class TasksChild {
  constructor(public root: Tasks) {}
}

export class TasksTasks extends TasksChild
  implements MockedAPI<tasks_v1.Resource$Tasks> {
  async list(
    params: tasks_v1.Params$Resource$Tasks$List & TGlobalFields,
    options?: MethodOptions
  ): Promise<GaxiosResponse<tasks_v1.Schema$Tasks>> {
    assert(params.tasklist)
    const items = []
    for (const item of this.root.data.tasks) {
      if (item.tasklist !== params.tasklist) {
        continue
      }
      if (item.hidden && !params.showHidden) {
        continue
      }
      // snow completed by default
      if (item.completed && params.showCompleted === false) {
        continue
      }
      if (item.deleted && !params.showDeleted) {
        continue
      }
      items.push(item)
    }
    this.root.log('list tasks', items.length, params)
    // TODO support the 'If-None-Match' header
    return ok(
      {
        items,
        kind: 'tasks#tasks'
      },
      {
        headers: {
          etag: md5(JSON.stringify(items))
        }
      }
    )
  }

  async get(
    params?: tasks_v1.Params$Resource$Tasks$Get & TGlobalFields,
    options?: MethodOptions
  ): Promise<GaxiosResponse<Task>> {
    assert(params.task)
    assert(params.tasklist)
    this.root.log('get task', params)
    // TODO check params.maxResults
    const task = this.root.data.tasks.find(
      t => t.tasklist === params.tasklist && t.id === params.task
    )
    if (!task) {
      throw new NotFoundError()
    }
    return ok(task)
  }

  async insert(
    params: tasks_v1.Params$Resource$Tasks$Insert & TGlobalFields,
    options?: MethodOptions
  ): Promise<GaxiosResponse<Task>> {
    assert(params.tasklist)
    assert(params.requestBody)
    this.root.log('insert task', params)
    // TODO check params.parent
    // TODO calculate params.position
    const defaults = {
      kind: 'tasks#task',
      status: 'needsAction'
    }
    const task: Task = Object.assign(defaults, clone(params.requestBody))
    task.updated = now()
    task.kind = 'tasks#task'
    task.id = randomId()
    task.tasklist = params.tasklist
    if (task.status === 'completed') {
      task.completed = now()
    }
    this.root.data.tasks.push(task)
    return ok(task)
  }

  async patch(
    params: tasks_v1.Params$Resource$Tasks$Patch & TGlobalFields,
    options?: MethodOptions
  ): Promise<GaxiosResponse<Task>> {
    assert(params.requestBody)
    assert(params.task)
    assert(params.tasklist)
    this.root.log('patch task', params)
    // TODO check params.requestBody.parent
    // TODO calculate params.position
    const data = this.root.data.tasks
    const i = data.findIndex(
      t => t.tasklist === params.tasklist && t.id === params.task
    )
    const task = data[i]
    if (!task) {
      throw new NotFoundError()
    }
    const patched = cloneAndPatch(task, params.requestBody)
    patched.updated = now()
    patched.completed =
      patched.status === 'completed' && task.status !== 'completed'
        ? now()
        : null
    data[i] = patched
    return ok(patched)
  }

  async delete(
    params: tasks_v1.Params$Resource$Tasks$Delete & TGlobalFields,
    options?: MethodOptions
  ): Promise<GaxiosResponse<void>> {
    assert(params.task)
    assert(params.tasklist)
    this.root.log('delete task', params)
    const task = this.root.data.tasks.find(
      t => t.tasklist === params.tasklist && t.id === params.task
    )
    if (!task) {
      throw new NotFoundError()
    }
    task.updated = now()
    // mark as deleted
    task.deleted = true
    return ok(void 0, { status: 204, statusText: 'No Content' })
  }

  // TODO update?
}

export class TasksTasklists extends TasksChild {
  async list(
    params: tasks_v1.Params$Resource$Tasklists$List & TGlobalFields,
    options?: MethodOptions
  ): Promise<GaxiosResponse<tasks_v1.Schema$TaskLists>> {
    this.root.log('tasks.tasklists.list', params)
    // TODO support the 'If-None-Match' header
    // TODO check params.maxResults
    const items = this.root.data.lists
    return ok(
      {
        items,
        kind: 'tasks#taskLists'
      },
      {
        headers: {
          etag: md5(JSON.stringify(items))
        }
      }
    )
  }

  async insert(
    params: tasks_v1.Params$Resource$Tasklists$Insert & TGlobalFields,
    options?: MethodOptions
  ): Promise<GaxiosResponse<TaskList>> {
    assert(params.requestBody)
    const list: TaskList = clone(params.requestBody)
    list.updated = moment()
      .utc()
      .toISOString()
    list.kind = 'tasks#taskList'
    list.id = randomId()
    this.root.data.lists.push(list)
    this.root.log(`added tasklist ${list.title}`)
    return ok(list)
  }

  async patch(
    params: tasks_v1.Params$Resource$Tasklists$Patch & TGlobalFields,
    options?: MethodOptions
  ): Promise<GaxiosResponse<TaskList>> {
    assert(params.requestBody)
    assert(params.tasklist)
    const data = this.root.data.lists
    const i = data.findIndex(l => l.id === params.tasklist)
    const list = data[i]
    if (!list) {
      throw new NotFoundError()
    }
    const patched = cloneAndPatch(list, params.requestBody)
    patched.updated = moment()
      .utc()
      .toISOString()
    data[i] = patched
    return ok(patched)
  }

  async get(
    params?: tasks_v1.Params$Resource$Tasklists$Get & TGlobalFields,
    options?: MethodOptions
  ): Promise<GaxiosResponse<TaskList>> {
    assert(params.tasklist)
    const list = this.root.data.lists.find(l => l.id === params.tasklist)
    if (!list) {
      throw new NotFoundError()
    }
    return ok(list)
  }

  async delete(
    params?: tasks_v1.Params$Resource$Tasklists$Delete & TGlobalFields,
    options?: MethodOptions
  ): Promise<GaxiosResponse<void>> {
    assert(params.tasklist)
    const data = this.root.data.lists
    const i = data.findIndex(l => l.id === params.tasklist)
    if (!data[i]) {
      throw new NotFoundError()
    }
    // remove in-place
    data.splice(i, 1)
    // remove tasks from the deleted list
    this.root.data.tasks = this.root.data.tasks.filter(
      t => t.tasklist === params.tasklist
    )
    this.root.log(`deleted tasklist ${params.tasklist}`)
    return ok(void 0, { status: 204, statusText: 'No Content' })
  }
}

// ----- PUBLIC API

global.GMAIL_MOCK = new Gmail()
global.TASKS_MOCK = new Tasks()

const api = {
  gmail(version: string): Gmail {
    return global.GMAIL_MOCK
  },
  tasks(version: string): Tasks {
    return global.TASKS_MOCK
  }
}

export { api as google }

// ----- HELPER FUNCTIONS

function cloneAndPatch<T extends object>(source: T, patch: Partial<T>) {
  const patched = clone(source)
  Object.assign(patched, patch)
  return patched
}
