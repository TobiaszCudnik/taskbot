import { AxiosResponse } from 'axios'
import { MethodOptions } from 'googleapis-common'
// import * as sinon from 'sinon'
import { gmail_v1, tasks_v1 } from 'googleapis'
import * as assert from 'assert'
import * as moment from 'moment-timezone'
import { normalizeLabelName } from '../../src/google/gmail/sync'
import { TGlobalFields } from '../../src/google/sync'
import { simpleParser } from 'mailparser'
import { Base64 } from 'js-base64'
import * as gmailQuery from 'gmail-string-query'
import * as md5 from 'md5'
import * as clone from 'deepcopy'

// ----- COMMON

// conditional and mapped types
// all methods returning a promise
type ReturnsPromise<T> = {
  [K in keyof T]: T[K] extends (...args: any) => any
    ? ReturnType<T[K]> extends Promise<any>
      ? K
      : never
    : never
}[keyof T]
type AsyncMethods<T> = Pick<T, ReturnsPromise<T>>
// all class fields
// type NonFunctionPropertyNames<T> = {
//   [K in keyof T]: T[K] extends Function ? never : K
// }[keyof T]
// type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>

type MockedAPI<T> = Partial<AsyncMethods<T>>

type Response = {
  headers?: {}
  status?: number
  statusText?: string
}

/**
 * @param data
 * @param response
 */
function ok<T>(data: T, response: Response = {}): AxiosResponse<T> {
  return {
    data: clone(data),
    status: response.status || 200,
    statusText: response.statusText || 'OK',
    headers: response.headers || {},
    // TODO?
    config: {}
  }
}

// TODO check if return not depended on the `data`
export class NotFoundError extends Error {
  code: 404
}

function log(...msgs: any[]) {
  console.log('[mock]', ...msgs)
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
  historyId: string = '0'
  // API
  users = new GmailUsers(this)

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
    options?: MethodOptions,
    // TODO this sould error
    a?: string
  ): Promise<AxiosResponse<gmail_v1.Schema$Profile>> {
    return ok({
      emailAddress: this.gmail.email,
      historyId: String(this.gmail.historyId),
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
  ): Promise<AxiosResponse<Message>> {
    const hid = (parseInt(this.gmail.historyId) + 1).toString()
    // TODO match the schema
    const threadId = Math.random().toString()
    const mail = await simpleParser(Base64.decode(params.requestBody.raw))
    const msg: Message = {
      id: Math.random().toString(),
      threadId,
      labelIds: clone(params.requestBody.labelIds) || []
      // TODO more fields
    }
    const thread: Thread = {
      historyId: hid,
      id: threadId,
      snippet: (mail.text || '').substr(0, 200),
      messages: [msg],
      labelIds: clone(params.requestBody.labelIds) || [],
      subject: mail.subject,
      to: mail.to.text,
      from: mail.from.text,
      label: ''
    }
    const res = clone(params.requestBody)
    this.gmail.historyId = hid
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
  ): Promise<AxiosResponse<Message>> {
    throw Error('TODO')
  }
}

export class GmailUsersLabels extends GmailChild
  implements MockedAPI<gmail_v1.Resource$Users$Labels> {
  async list(
    params: gmail_v1.Params$Resource$Users$Labels$List & TGlobalFields
    // options?: MethodOptions
  ): Promise<AxiosResponse<gmail_v1.Schema$ListLabelsResponse>> {
    return ok({
      labels: this.gmail.labels
    })
  }

  async patch(
    params: gmail_v1.Params$Resource$Users$Labels$Patch & TGlobalFields
    // options?: MethodOptions
  ): Promise<AxiosResponse<Label>> {
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
  ): Promise<AxiosResponse<Label>> {
    const label = this.gmail.labels.find(l => l.id === params.id)
    if (!label) {
      throw new NotFoundError()
    }
    return ok(label)
  }

  async create(
    params: gmail_v1.Params$Resource$Users$Labels$Create & TGlobalFields
    // options?: MethodOptions
  ): Promise<AxiosResponse<Label>> {
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
  ): Promise<AxiosResponse<gmail_v1.Schema$ListThreadsResponse>> {
    let threads = this.gmail.threads

    // evaluate the search expression
    if (params.q) {
      threads = this.query(params.q)
    }

    return ok({
      threads
    })
  }

  async get(
    params: gmail_v1.Params$Resource$Users$Threads$Get & TGlobalFields,
    options?: MethodOptions
  ): Promise<AxiosResponse<Thread>> {
    assert(params.id)
    const thread = this.gmail.threads.find(t => t.id === params.id)
    if (!thread) {
      throw new NotFoundError()
    }
    return ok(thread)
  }

  async modify(
    params: gmail_v1.Params$Resource$Users$Threads$Modify & TGlobalFields,
    options?: MethodOptions
  ): Promise<AxiosResponse<Thread>> {
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
    // add
    for (const id of add) {
      if (!thread.labelIds.includes(id)) {
        thread.labelIds.push(id)
      }
    }
    return ok(thread)
  }

  async delete(
    params: gmail_v1.Params$Resource$Users$Threads$Delete & TGlobalFields,
    options?: MethodOptions
  ): Promise<AxiosResponse<void>> {
    assert(params.id)
    const data = this.gmail.threads
    const i = data.findIndex(t => t.id === params.id)
    if (!data[i]) {
      throw new NotFoundError()
    }
    // remove in place
    data.splice(i, 1)
    log(`deleted thread ${params.id}`)
    return ok(void 0)
  }

  protected query(query: string) {
    // merge labels into a string
    const threads = this.gmail.threads.map((thread: Thread) => {
      // TODO dont replace in text
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
        .toLocaleLowerCase()
      return thread
    })
    return threads.filter(gmailQuery(query))
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

  tasks = new TasksTasks(this)
  tasklists = new TasksTasklists(this)
}

export class TasksChild {
  constructor(public root: Tasks) {}
}

export class TasksTasks extends TasksChild
  implements MockedAPI<tasks_v1.Resource$Tasks> {
  async list(
    params: tasks_v1.Params$Resource$Tasks$List & TGlobalFields,
    options?: MethodOptions
  ): Promise<AxiosResponse<tasks_v1.Schema$Tasks>> {
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
  ): Promise<AxiosResponse<Task>> {
    assert(params.task)
    assert(params.tasklist)
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
  ): Promise<AxiosResponse<Task>> {
    assert(params.tasklist)
    assert(params.requestBody)
    // TODO check params.parent
    // TODO calculate params.position
    const defaults = {
      kind: 'tasks#task'
    }
    const task: Task = clone(params.requestBody)
    task.updated = moment()
      .utc()
      .toISOString()
    // TODO dates
    task.kind = 'tasks#task'
    task.id = Math.random().toString()
    task.tasklist = params.tasklist
    this.root.data.tasks.push(task)
    return ok(task)
  }

  async patch(
    params: tasks_v1.Params$Resource$Tasks$Patch & TGlobalFields,
    options?: MethodOptions
  ): Promise<AxiosResponse<Task>> {
    assert(params.requestBody)
    assert(params.task)
    assert(params.tasklist)
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
    patched.updated = moment()
      .utc()
      .toISOString()
    data[i] = patched
    return ok(patched)
  }

  async delete(
    params: tasks_v1.Params$Resource$Tasks$Patch & TGlobalFields,
    options?: MethodOptions
  ): Promise<AxiosResponse<void>> {
    assert(params.task)
    assert(params.tasklist)
    const task = this.root.data.tasks.find(
      t => t.tasklist === params.tasklist && t.id === params.task
    )
    if (!task) {
      throw new NotFoundError()
    }
    task.updated = moment()
      .utc()
      .toISOString()
    // mark as deleted
    task.deleted = true
    return ok(void 0)
  }

  // TODO update?
}

export class TasksTasklists extends TasksChild {
  async list(
    params: tasks_v1.Params$Resource$Tasklists$List & TGlobalFields,
    options?: MethodOptions
  ): Promise<AxiosResponse<tasks_v1.Schema$TaskLists>> {
    log('tasks.tasklists.list', params)
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
  ): Promise<AxiosResponse<TaskList>> {
    assert(params.requestBody)
    const list: TaskList = clone(params.requestBody)
    list.updated = moment()
      .utc()
      .toISOString()
    list.kind = 'tasks#taskList'
    list.id = Math.random().toString()
    this.root.data.lists.push(list)
    log(`added tasklist ${list.title}`)
    return ok(list)
  }

  async patch(
    params: tasks_v1.Params$Resource$Tasklists$Patch & TGlobalFields,
    options?: MethodOptions
  ): Promise<AxiosResponse<TaskList>> {
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
  ): Promise<AxiosResponse<TaskList>> {
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
  ): Promise<AxiosResponse<void>> {
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
    log(`deleted tasklist ${params.tasklist}`)
    return ok(void 0)
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
