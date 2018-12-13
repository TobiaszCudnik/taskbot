import { AxiosResponse } from 'axios'
import { MethodOptions } from 'googleapis-common'
import * as sinon from 'sinon'
import { google, gmail_v1, tasks_v1 } from 'googleapis'
import { TGlobalFields } from '../src/google/sync'

sinon.stub(google, 'gmail', () => new Gmail('test@gmail.com'))

type Thread = gmail_v1.Schema$Thread
type Label = gmail_v1.Schema$Label
type Message = gmail_v1.Schema$Message
type Task = tasks_v1.Schema$Task
type TaskList = tasks_v1.Schema$TaskList

// all methods returning a promise
type ReturnsPromise<T> = {
  [K in keyof T]: T[K] extends (...args: any) => any
    ? ReturnType<T[K]> extends Promise<any> ? K : never
    : never
}[keyof T]
type AsyncMethods<T> = Pick<T, ReturnsPromise<T>>

function ok<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: 'OK',
    // TODO
    headers: {},
    // TODO?
    config: {}
  }
}

// ----- GMAIL

class Gmail {
  threads: Thread[]
  labels: Label[]
  messages: Message[]
  historyId: string

  users: Partial<AsyncMethods<gmail_v1.Resource$Users>> = new GmailUsers(this)

  constructor(public email: string) {}
}

class GmailChild {
  constructor(public gmail: Gmail) {}
}

class GmailUsers extends GmailChild {
  labels: Partial<
    AsyncMethods<gmail_v1.Resource$Users$Labels>
  > = new GmailUsersLabels(this.gmail)
  // drafts: Resource$Users$Drafts
  // history: Resource$Users$History
  messages: Partial<
    AsyncMethods<gmail_v1.Resource$Users$Messages>
  > = new GmailUsersMessages(this.gmail)
  // settings: Resource$Users$Settings
  threads: Partial<
    AsyncMethods<gmail_v1.Resource$Users$Threads>
  > = new GmailUsersThreads(this.gmail)

  async getProfile(
    params: gmail_v1.Params$Resource$Users$Getprofile & TGlobalFields,
    options?: MethodOptions
  ): Promise<AxiosResponse<gmail_v1.Schema$Profile>> {
    return ok({
      emailAddress: this.gmail.email,
      historyId: String(this.gmail.historyId),
      messagesTotal: this.gmail.messages.length,
      threadsTotal: this.gmail.threads.length
    })
  }
}

class GmailUsersMessages extends GmailChild
  implements Partial<AsyncMethods<gmail_v1.Resource$Users$Messages>> {
  async send(
    params: gmail_v1.Params$Resource$Users$Messages$Send & TGlobalFields
    // options?: MethodOptions
  ): Promise<AxiosResponse<Message>> {
    // TODO match the schema
    const threadId = Math.random().toString()
    return ok({
      threadId,
      ...params.requestBody
      // TODO missing fields?
    })
  }

  async insert(
    params: gmail_v1.Params$Resource$Users$Messages$Insert & TGlobalFields
    // options?: MethodOptions
  ): Promise<AxiosResponse<Message>> {
    const hid = (parseInt(this.gmail.historyId) + 1).toString()
    const msg = params.requestBody
    const thread: Thread = {
      historyId: hid,
      id: Math.random().toString(),
      snippet: 'foo bar',
      messages: [msg]
    }
    this.gmail.historyId = hid
    this.gmail.messages.push(msg)
    this.gmail.threads.push(thread)
    return ok(msg)
  }
}

class GmailUsersLabels extends GmailChild {
  async list(
    params: gmail_v1.Params$Resource$Users$Labels$List & TGlobalFields
    // options?: MethodOptions
  ): Promise<AxiosResponse<gmail_v1.Schema$ListLabelsResponse>> {
    // TODO query
    return ok({
      labels: this.gmail.labels
    })
  }

  async patch(
    params: gmail_v1.Params$Resource$Users$Labels$Patch & TGlobalFields
    // options?: MethodOptions
  ): Promise<AxiosResponse<Label>> {
    const label = this.gmail.labels.find(l => l.id === params.id)
    Object.assign(label, params.requestBody)
    return ok(label)
  }

  async get(
    params: gmail_v1.Params$Resource$Users$Labels$Get & TGlobalFields
    // options?: MethodOptions
  ): Promise<AxiosResponse<Label>> {
    const label = this.gmail.labels.find(l => l.id === params.id)
    return ok(label)
  }

  async create(
    params: gmail_v1.Params$Resource$Users$Labels$Create & TGlobalFields
    // options?: MethodOptions
  ): Promise<AxiosResponse<Label>> {
    const label = params.requestBody
    this.gmail.labels.push(label)
    return ok(label)
  }
}

class GmailUsersThreads extends GmailChild {
  async list(
    params: gmail_v1.Params$Resource$Users$Threads$List & TGlobalFields,
    options?: MethodOptions
  ): Promise<AxiosResponse<gmail_v1.Schema$ListThreadsResponse>> {
    // TODO query the threads based on `param.q`
    return ok({
      threads: []
    })
  }

  async get(
    params: gmail_v1.Params$Resource$Users$Threads$Get & TGlobalFields,
    options?: MethodOptions
  ): Promise<AxiosResponse<Thread>> {
    // TODO
    return ok({})
  }

  async modify(
    params: gmail_v1.Params$Resource$Users$Threads$Modify & TGlobalFields,
    options?: MethodOptions
  ): Promise<AxiosResponse<Thread>> {
    // TODO
    return ok({})
  }
}

// ----- TASKS

class Tasks {
  tasks: Task[]
  lists: TaskList[]
}

class TasksChild {
  constructor(public tasks: Tasks) {}
}

class TasksTasks extends TasksChild {
  async list(
    params: tasks_v1.Params$Resource$Tasks$List & TGlobalFields,
    options?: MethodOptions
  ): Promise<AxiosResponse<tasks_v1.Schema$Tasks>> {
    // TODO
    return ok({
      // etag
      items: [],
      kind: 'tasks#tasks'
    })
  }

  async insert(
    params: tasks_v1.Params$Resource$Tasks$Insert & TGlobalFields,
    options?: MethodOptions
  ): Promise<AxiosResponse<Task>> {
    // TODO
    return ok({})
  }

  async patch(
    params: tasks_v1.Params$Resource$Tasks$Patch & TGlobalFields,
    options?: MethodOptions
  ): Promise<AxiosResponse<Task>> {
    // TODO
    return ok({})
  }

  async delete(
    params: tasks_v1.Params$Resource$Tasks$Patch & TGlobalFields,
    options?: MethodOptions
  ): Promise<AxiosResponse<void>> {
    // TODO
    return ok(void 0)
  }
}

class TasksTasklists extends TasksChild {
  async list(
    params: tasks_v1.Params$Resource$Tasklists$List & TGlobalFields,
    options?: MethodOptions
  ): Promise<AxiosResponse<tasks_v1.Schema$TaskLists>> {
    // TODO
    return ok({
      // etag
      items: [],
      kind: 'tasks#taskLists'
    })
  }

  async insert(
    params: tasks_v1.Params$Resource$Tasklists$Insert & TGlobalFields,
    options?: MethodOptions
  ): Promise<AxiosResponse<TaskList>> {
    // TODO
    return ok({})
  }
}
