///<reference path="../typings/index.d.ts"/>

const DELAY = 1000

import * as assert from 'assert'
import * as google from 'googleapis'
import * as _ from 'lodash'
import { promisifyArray } from 'typed-promisify-tob/index'
import { test_user } from '../config-users'
import { getConfig } from '../src/app/config'
import Connections from '../src/app/connections'
import Logger from '../src/app/logger'
import Auth from '../src/google/auth'
import GmailSync from '../src/google/gmail/sync'
import GTasksSync from '../src/google/tasks/sync'
import RootSync from '../src/sync/root'
import * as delay from 'delay'

export type Label = google.gmail.v1.Label
export type Thread = google.gmail.v1.Thread
export type Task = google.tasks.v1.Task
export type TaskList = google.tasks.v1.TaskList

export default async function createHelpers(log) {
  let gtasks: google.tasks.v1.Tasks
  let gmail: google.gmail.v1.Gmail
  let auth: Auth
  let sync: RootSync
  let gmail_sync: GmailSync
  let gtasks_sync: GTasksSync

  await initTest()

  return {
    gtasks,
    gmail,
    auth,
    sync,
    gmail_sync,
    gtasks_sync,
    hasLabel,
    listQuery,
    deleteThread,
    getThread,
    listTasklist,
    req,
    truncateQuery,
    truncateGmail,
    truncateGTasks,
    truncateGTasksList,
    syncList,
    getTask,
    addTask,
    patchTask,
    reset,
    labelID,
    modifyLabels,
    printDB
  }

  async function modifyLabels(
    thread_id: string,
    add: string[] = [],
    remove: string[] = []
  ) {
    await req('gmail.users.threads.modify', {
      id: thread_id,
      userId: 'me',
      fields: 'id',
      resource: {
        addLabelIds: add.map(labelID),
        removeLabelIds: remove.map(labelID)
      }
    })
  }

  function hasLabel(thread: google.gmail.v1.Thread, label: string): boolean {
    return thread.messages[0].labelIds.includes(labelID(label))
  }

  async function listQuery(
    query = 'label:!s-next-action'
  ): Promise<google.gmail.v1.ListThreadsResponse> {
    const [list, res] = await req('gmail.users.threads.list', {
      maxResults: 1000,
      q: query,
      userId: 'me',
      // TODO is 'snippet' useful?
      fields: 'nextPageToken,threads(historyId,id)'
    })
    return list
  }

  async function deleteThread(thread_id: string): Promise<true> {
    await req('gmail.users.threads.delete', {
      userId: 'me',
      id: thread_id
    })
    return true
  }

  async function getThread(id: string): Promise<Thread> {
    const [body, res] = await req('gmail.users.threads.get', {
      id,
      userId: 'me',
      metadataHeaders: ['SUBJECT', 'FROM', 'TO'],
      format: 'metadata',
      fields: 'id,historyId,messages(id,labelIds,payload(headers))'
    })
    return body
  }

  async function listTasklist(name = '!next'): Promise<google.tasks.v1.Tasks> {
    const [body, res] = await req('gtasks.tasks.list', {
      maxResults: 1000,
      tasklist: gtasks_sync.getListByName(name).list.id,
      fields: 'etag,items(id,title,notes,updated,etag,status,parent)',
      showHidden: false
    })
    return body
  }

  function printDB() {
    if (!sync.data) return
    log('Internal DB:')
    log(sync.data.toString())
  }

  async function initTest() {
    // init sync
    const logger = new Logger()
    const connections = new Connections(logger)
    const config = getConfig(test_user)
    // disable auto sync
    config.sync_frequency = 10000 * 100
    config.gtasks.sync_frequency = 10000 * 100
    sync = new RootSync(config, logger, connections)
    // disable heartbeat
    sync.HeartBeat_state = () => {}
    // fwd exceptions
    sync.state.on('Exception_state', err => {
      throw err
    })
    const ready_state = sync.state.get('Ready')
    // disable auto start
    ready_state.add = _.without(ready_state.add, 'Reading')
    // jump to the next tick
    await delay(0)
    // assign apis
    gtasks = connections.apis.gtasks
    gmail = connections.apis.gmail
    // wait for the google auth
    await sync.subs.google.auth.when('Ready')
    auth = sync.subs.google.auth
    // delete all the data
    await truncateGmail()
    await truncateGTasks()
    // init the engine
    sync.state.addNext('Enabled')
    await sync.state.when('Ready')
    gmail_sync = sync.subs.google.subs.gmail
    gtasks_sync = sync.subs.google.subs.tasks
    assert(gtasks_sync, 'gtasks sync missing')
    assert(gmail_sync, 'gmail sync missing')
    // trigger sync
    sync.state.add('Reading')
    log('connected')
    await sync.state.when('WritingDone')
    log('initial sync OK')
  }

  // TODO retry on Backend Error
  async function req(method: string, params = {}, options = {}) {
    log(`req ${method}:\n%O`, params)
    if (DELAY) {
      await delay(delay)
    }
    // @ts-ignore
    params.auth = auth.client
    // prevent JIT from shadowing those
    // @ts-ignore
    void (gmail, gtasks)
    // log(method)
    // @ts-ignore
    options = {
      forever: true,
      options
    }
    // @ts-ignore
    return await promisifyArray(eval(method))(params, options)
  }

  async function truncateQuery(query) {
    const [body, res] = await req('gmail.users.threads.list', {
      maxResults: 1000,
      q: query,
      userId: 'me',
      fields: 'nextPageToken,threads(historyId,id)'
    })

    const threads = body.threads || []
    await Promise.all(
      threads.map(
        async thread =>
          await req('gmail.users.threads.delete', {
            id: thread.id,
            userId: 'me'
          })
      )
    )
  }

  async function truncateGTasks() {
    // get all the lists
    const [body, res] = await req('gtasks.tasklists.list', {})
    const lists = body.items || []
    // delete every list
    await Promise.all(
      lists.map(async (list: TaskList) => {
        // skip the default one
        if (list.title == 'My Tasks') return
        await req('gtasks.tasklists.delete', { tasklist: list.id })
      })
    )
    log('removed all tasks')
  }

  async function truncateGTasksList(name = '!next') {
    const list = gtasks_sync.getListByName(name)
    assert(list, `list doesn't exist`)
    // get all the lists
    const [body, res] = await req('gtasks.tasks.list', {
      tasklist: list.list.id
    })
    const lists = body.items || []
    // delete every list
    await Promise.all(
      lists.map(async (task: TaskList) => {
        await req('gtasks.tasks.delete', {
          tasklist: list.list.id,
          task: task.id
        })
      })
    )
    log('removed all tasks')
  }

  async function truncateGmail() {
    // TODO remove labels
    await Promise.all(
      ['label:all', 'label:trash'].map(
        async query => await truncateQuery(query)
      )
    )
    log('removed all emails')
  }

  async function syncList(
    gmail_dirty = true,
    gtasks_dirty = true,
    name = '!next'
  ) {
    // start a selective sync
    if (gtasks_dirty) {
      gtasks_sync.getListByName(name).state.add('Dirty')
    }
    if (gmail_dirty) {
      gmail_sync.getListByName(name).state.add('Dirty')
    }
    sync.state.add('Reading')
    await sync.state.when('WritingDone')
  }

  async function getTask(
    task_id: string,
    list: string = '!next'
  ): Promise<google.tasks.v1.Task> {
    const [body, res] = await req('gtasks.tasks.get', {
      tasklist: gtasks_sync.getListByName(list).list.id,
      task: task_id
    })
    return body
  }

  // @returns the ID of the new task
  async function addTask(
    title,
    list = '!next',
    notes = '',
    completed = false,
    parent?: string
  ): Promise<string> {
    const [body, res] = await req('gtasks.tasks.insert', {
      tasklist: gtasks_sync.getListByName(list).list.id,
      fields: 'id',
      parent,
      resource: {
        title,
        notes,
        status: completed ? 'completed' : 'needsAction'
      }
    })
    return body.id
  }

  /**
   * @param id Task ID
   * @param patch Partial Task resource
   * @param list List name (not the ID)
   * @return Task ID
   */
  async function patchTask(
    id,
    patch: Partial<google.tasks.v1.Task>,
    list = '!next'
  ): Promise<string> {
    const [body, res] = await req('gtasks.tasks.patch', {
      tasklist: gtasks_sync.getListByName(list).list.id,
      task: id,
      fields: 'id',
      resource: patch
    })
    return body.id
  }

  async function reset() {
    log('reset')
    // clear all the APIs
    await Promise.all([
      truncateGmail(),
      // TODO loop over the lists from conig
      truncateGTasksList('!next'),
      truncateGTasksList('!actions')
    ])
    // clear the local DB
    sync.data.clear()
    sync.subs.google.subs.gmail.threads.clear()
    for (const list of sync.subs.google.subs.tasks.subs.lists) {
      list.tasks = null
    }
    for (const list of sync.subs.google.subs.gmail.subs.lists) {
      list.query.threads = []
    }
    await delay(1000)
  }

  function labelID(name) {
    const id = gmail_sync.getLabelID(name)
    assert(id, `Label '${name}' doesnt exist`)
    return id
  }
}
