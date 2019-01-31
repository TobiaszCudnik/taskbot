///<reference path="../typings/index.d.ts"/>

export const DELAY = process.env['MOCK'] ? 0 : 500

import * as assert from 'assert'
import { GaxiosPromise, GaxiosResponse } from 'gaxios'
import * as debug from 'debug'
import { MethodOptions } from 'googleapis-common'
import * as _ from 'lodash'
import { test_user } from '../config-accounts'
import { getConfig } from '../src/app/config'
import Connections from '../src/app/connections'
import Logger from '../src/app/logger'
import GmailSync from '../src/google/gmail/sync'
import { TGlobalFields } from '../src/google/sync'
import GTasksSync from '../src/google/tasks/sync'
import RootSync from '../src/sync/root'
import * as delay from 'delay'
import { OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'
import { google as mocks } from './mocks/mocks'
import { gmail_v1 } from '../typings/googleapis/gmail'
import { tasks_v1 } from '../typings/googleapis/tasks'

if (process.env['MOCK']) {
  // mock 'googleapis'
  global.GOOGLEAPIS_MOCK = mocks
}

export type Label = gmail_v1.Schema$Label
export type Thread = gmail_v1.Schema$Thread
export type Task = tasks_v1.Schema$Task
export type TaskList = tasks_v1.Schema$TaskList

export default async function createHelpers() {
  let gtasks: tasks_v1.Tasks
  let gmail: gmail_v1.Gmail
  let auth: OAuth2Client
  let sync: RootSync
  let gmail_sync: GmailSync
  let gtasks_sync: GTasksSync
  const log_inner = debug('test')
  const log = (msg, ...rest) => {
    // @ts-ignore
    if (debug.disabled) return
    log_inner(msg, ...rest)
  }

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
    syncListScenario,
    getTask,
    addTask,
    patchTask,
    reset,
    labelID,
    modifyLabels,
    printDB,
    deleteTask,
    log,
    printStates
  }

  async function modifyLabels(
    thread_id: string,
    add: string[] = [],
    remove: string[] = []
  ) {
    await req(
      'gmail.users.threads.modify',
      gmail.users.threads.modify,
      gmail.users.threads,
      {
        id: thread_id,
        userId: 'me',
        fields: 'id',
        requestBody: {
          addLabelIds: add.map(labelID),
          removeLabelIds: remove.map(labelID)
        }
      }
    )
  }

  function hasLabel(thread: Thread, label: string): boolean {
    return thread.messages[0].labelIds.includes(labelID(label))
  }

  async function listQuery(
    query = 'label:!s-next-action'
  ): Promise<gmail_v1.Schema$ListThreadsResponse> {
    const res = await req(
      'gmail.users.threads.list',
      gmail.users.threads.list,
      gmail.users.threads,
      {
        maxResults: 1000,
        q: query,
        userId: 'me',
        // TODO is 'snippet' useful?
        fields: 'nextPageToken,threads(historyId,id)'
      }
    )
    return res.data
  }

  async function deleteThread(thread_id: string): Promise<true> {
    await req(
      'gmail.users.threads.delete',
      gmail.users.threads.delete,
      gmail.users.threads,
      {
        userId: 'me',
        id: thread_id
      }
    )
    return true
  }

  async function getThread(id: string): Promise<Thread> {
    const res: GaxiosResponse<Thread> = await req(
      'gmail.users.threads.get',
      gmail.users.threads.get,
      gmail.users.threads,
      {
        id,
        userId: 'me',
        metadataHeaders: ['SUBJECT', 'FROM', 'TO'],
        format: 'metadata',
        fields: 'id,historyId,messages(id,labelIds,payload(headers))'
      }
    )
    return res.data
  }

  async function listTasklist(name = '!next'): Promise<tasks_v1.Schema$Tasks> {
    const res = await req(
      'gtasks.tasks.list',
      gtasks.tasks.list,
      gtasks.tasks,
      {
        maxResults: '1000',
        tasklist: gtasks_sync.getListByName(name).list.id,
        fields: 'etag,items(id,title,notes,updated,etag,status,parent)',
        showHidden: false
      }
    )
    return res.data
  }

  function printDB() {
    // TODO print the mocks DB
    log('DB empty')
    if (!sync.data) return
    log('\nInternal DB:')
    log(sync.data.toString())
    log('\nAPI DBs:')
    log(gmail_sync.toString())
    log(gtasks_sync.toString())
    if (process.env['MOCK']) {
      log('\nMock DBs:')
      log(gmail.toString())
    }
  }

  function printStates() {
    log(sync.getMachines(false))
  }

  async function initTest() {
    disableDebug()
    // init sync
    const logger = new Logger()
    const connections = new Connections(logger)
    const config = getConfig(test_user.config)
    // disable auto sync
    config.sync_frequency = 10000 * 100
    config.gtasks.sync_frequency = 10000 * 100
    sync = new RootSync(config, logger, connections)
    // process.on('SIGINT', exit)
    // process.on('exit', exit)
    // setTimeout(() => {
    //   console.log('PRINT EXIT')
    //   exit(sync)
    // }, 6000)
    // disable heartbeat
    sync.state.on('HeartBeat_enter', () => false)
    sync.state.on('Scheduled_enter', () => false)
    // fwd exceptions
    sync.state.on('MergeLimitExceeded_state', () => {
      throw new Error('MergeLimitExceeded')
    })
    sync.state.on('MaxReadsExceeded_state', () => {
      throw new Error('MaxReadsExceeded')
    })
    sync.state.on('MaxWritesExceeded_state', () => {
      throw new Error('MaxWritesExceeded')
    })
    sync.state.on('Exception_state', err => {
      throw err
    })
    const ready_state = sync.state.get('Ready')
    // disable auto start (remove Reading being added by Ready)
    ready_state.add = _.without(ready_state.add, 'Reading')
    // jump to the next tick
    await delay(0)

    // build the API clients and the Auth object
    if (process.env['MOCK']) {
      // @ts-ignore
      gtasks = mocks.tasks('v1')
      // @ts-ignore
      gmail = mocks.gmail('v1')
      // @ts-ignore
      auth = {}
    } else {
      // TODO extract
      gtasks = google.tasks('v1')
      gmail = google.gmail('v1')
      // @ts-ignore
      auth = new google.auth.OAuth2(
        config.google.client_id,
        config.google.client_secret,
        config.google.redirect_url
      )
      auth.credentials = {
        access_token: config.google.access_token,
        refresh_token: config.google.refresh_token
      }
    }
    // TODO
    // const token = await new Promise(resolve => {
    //   auth.refreshAccessToken((err, token) => {
    //     if (err) {
    //       console.error('refreshAccessToken')
    //       throw new Error(err)
    //     }
    //     resolve(token)
    //   })
    // })
    // console.log(`New access token ${token}`)
    // process.exit()

    // delete all the data
    await truncateGmail()
    await truncateGTasks()

    // init the engine
    sync.state.addNext('Enabled')
    await sync.state.when('Ready')
    gmail_sync = sync.subs.google.subs.gmail
    gtasks_sync = sync.subs.google.subs.tasks

    // treat max reads/writes as an exceptions
    for (const sub of sync.subs_all) {
      sub.state.on('MaxReadsExceeded_state', () => {
        throw new Error('MaxReadsExceeded')
      })
      // treat quota exceeded as an exception
      sub.state.on('QuotaExceeded_state', () => {
        throw new Error('QuotaExceeded')
      })
    }
    for (const sub of sync.subs_all_writers) {
      sub.state.on('MaxWritesExceeded_state', () => {
        throw new Error('MaxWritesExceeded')
      })
    }
    assert(gtasks_sync, 'gtasks sync missing')
    assert(gmail_sync, 'gmail sync missing')
    // trigger the initial sync
    sync.state.add('Syncing')
    log('connected')
    await sync.state.when('WritingDone')
    log('initial sync OK')
    enableDebug()
  }

  // TODO retry on Backend Error
  async function req<P, R>(
    name: string,
    method: (params: P, options: MethodOptions) => GaxiosPromise<R>,
    context: object,
    params: P & TGlobalFields,
    options: MethodOptions = {}
  ): Promise<GaxiosResponse<R>> {
    log(`req ${method}:\n%O`, params)
    if (DELAY) {
      await delay(delay)
    }
    // @ts-ignore
    params.auth = auth
    // @ts-ignore prevent JIT from shadowing those, so eval works
    void (gmail, gtasks)
    // remove the method name
    // const context = eval(method.replace(/\.\w+$/, ''))
    // TODO keep alive
    return await method.call(context, params, options)
  }

  async function truncateQuery(query) {
    const res = await req(
      'gmail.users.threads.list',
      gmail.users.threads.list,
      gmail.users.threads,
      {
        maxResults: 1000,
        q: query,
        userId: 'me',
        fields: 'nextPageToken,threads(historyId,id)'
      }
    )

    const threads = res.data.threads || []
    await Promise.all(
      threads.map(
        async thread =>
          await req(
            'gmail.users.threads.delete',
            gmail.users.threads.delete,
            gmail.users.threads,
            {
              id: thread.id,
              userId: 'me'
            }
          )
      )
    )
  }

  async function truncateGTasks() {
    // get all the lists
    const res: GaxiosResponse<tasks_v1.Schema$TaskLists> = await req(
      'gtasks.tasklists.list',
      gtasks.tasklists.list,
      gtasks.tasklists,
      {}
    )
    const lists = res.data.items || []
    // delete every list
    await Promise.all(
      lists.map(async (list: TaskList) => {
        // skip the default one
        if (list.title == 'My Tasks') return
        await req(
          'gtasks.tasklists.delete',
          gtasks.tasklists.delete,
          gtasks.tasklists,
          { tasklist: list.id }
        )
      })
    )
    log('removed all tasks')
  }

  async function truncateGTasksList(name = '!next') {
    const list = gtasks_sync.getListByName(name)
    assert(list, `list doesn't exist`)
    // get all the lists
    const res: GaxiosResponse<tasks_v1.Schema$Tasks> = await req(
      'gtasks.tasks.list',
      gtasks.tasks.list,
      gtasks.tasks,
      {
        tasklist: list.list.id
      }
    )
    const lists = res.data.items || []
    // delete every list
    await Promise.all(
      lists.map(async (task: TaskList) => {
        await req('gtasks.tasks.delete', gtasks.tasks.delete, gtasks.tasks, {
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

  /*
   * Scenarios:
   * 0 - gmail & tasks sync simultaneously
   * 1 - gmail syncs x2, then gmail&tasks simultaneously
   * 2 - gmail syncs x2, then gmail&tasks simultaneously
   *   then gmail again
   */
  async function syncListScenario(scenario: number, list = '!next') {
    switch (scenario) {
      default:
        await syncList(true, true, list) // gt
        await syncList(true, false, list) // g
        await syncList(true, true, list) // gt
        break
      case 1:
        await syncList(true, false, list) // g
        await syncList(true, false, list) // g
        await syncList(true, true, list) // gt
        break
      case 2:
        await syncList(true, false, list) // g
        await syncList(true, false, list) // g
        await syncList(true, true, list) // gt
        await syncList(true, false, list) // g
        break
    }
  }

  async function syncList(
    gmail_dirty = true,
    gtasks_dirty = true,
    name = '!next'
  ) {
    // start a selective sync
    if (gtasks_dirty) {
      const list = gtasks_sync.getListByName(name)
      // skip gmail-only lists
      if (list) {
        list.state.add('Dirty')
      }
    }
    gmail_sync.getListByName(name).state.add('Dirty')
    sync.state.add('Syncing')
    await sync.state.when('SyncDone')
  }

  async function getTask(
    task_id: string,
    list: string = '!next'
  ): Promise<Task> {
    const res: GaxiosResponse<Task> = await req(
      'gtasks.tasks.get',
      gtasks.tasks.get,
      gtasks.tasks,
      {
        tasklist: gtasks_sync.getListByName(list).list.id,
        task: task_id,
        fields: 'id,title,updated,status,notes'
      }
    )
    return res.data
  }

  /**
   * @returns the ID of the new task
   */
  async function addTask(
    title,
    list = '!next',
    notes = '',
    completed = false,
    parent?: string
  ): Promise<string> {
    const res: GaxiosResponse<Task> = await req(
      'gtasks.tasks.insert',
      gtasks.tasks.insert,
      gtasks.tasks,
      {
        tasklist: gtasks_sync.getListByName(list).list.id,
        fields: 'id',
        parent,
        requestBody: {
          title,
          notes,
          status: completed ? 'completed' : 'needsAction'
        }
      }
    )
    return res.data.id
  }

  /**
   * @param id Task ID
   * @param patch Partial Task requestBody
   * @param list List name (not the ID)
   * @return Task ID
   */
  async function patchTask(id, patch: Task, list = '!next'): Promise<string> {
    const res: GaxiosResponse<Task> = await req(
      'gtasks.tasks.patch',
      gtasks.tasks.patch,
      gtasks.tasks,
      {
        tasklist: gtasks_sync.getListByName(list).list.id,
        task: id,
        fields: 'id',
        requestBody: patch
      }
    )
    return res.data.id
  }

  // TODO reset exceptions too, maybe clone states from after the inital sync
  async function reset() {
    log('reset')
    disableDebug()
    const task_lists = sync.subs.google.subs.tasks.subs.lists
    // clear all the APIs
    const wait = [truncateGmail()]
    for (const list of task_lists) {
      wait.push(truncateGTasksList(list.config.name))
    }
    await Promise.all(wait)
    // clear the local DB
    sync.data.clear()
    sync.subs.google.subs.gmail.threads.clear()
    for (const list of task_lists) {
      list.tasks = null
    }
    for (const list of sync.subs.google.subs.gmail.subs.lists) {
      list.query.threads = []
    }
    gmail_sync.history_ids = []
    gmail_sync.history_id_latest = null
    gmail_sync.last_sync_time = null
    // drop all outbound states
    sync.state.drop(
      'Scheduled',
      'Syncing',
      'SyncDone',
      'Reading',
      'Writing',
      'ReadingDone',
      'WritingDone'
    )
    await sync.subs_all.map(async sync => {
      sync.state.drop('ReadingDone')
      await sync.state.whenNot('ReadingDone')
    })
    await sync.subs_all_writers.map(async sync => {
      sync.state.drop('WritingDone')
      await sync.state.whenNot('WritingDone')
    })
    await delay(DELAY)
    enableDebug()
  }

  function labelID(name) {
    const id = gmail_sync.getLabelID(name)
    assert(id, `Label '${name}' doesnt exist`)
    return id
  }

  async function deleteTask(id, list = '!next') {
    return await req('gtasks.tasks.delete', gtasks.tasks.delete, gtasks.tasks, {
      tasklist: gtasks_sync.getListByName(list).list.id,
      task: id
    })
  }
}

function disableDebug() {
  // @ts-ignore
  debug.disabled = true
}

function enableDebug() {
  // @ts-ignore
  debug.disabled = false
}
