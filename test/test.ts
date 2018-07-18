///<reference path="../typings/index.d.ts"/>

const DELAY = 1000

import { promisifyArray } from 'typed-promisify-tob/index'
import Connections from '../src/app/connections'
import Logger from '../src/app/logger'
import { getConfig } from '../src/app/config'
import * as google from 'googleapis'
import * as delay from 'delay'
import { test_user } from '../config-users'
import Auth from '../src/google/auth'
import GmailSync from '../src/google/gmail/sync'
import GTasksSync from '../src/google/tasks/sync'
import GTasksListSync, { TaskList } from '../src/google/tasks/sync-list'
import RootSync from '../src/sync/root'
import * as _ from 'lodash'
import * as debug from 'debug'
import * as assert from 'assert'

let gtasks: google.tasks.v1.Tasks
let gmail: google.gmail.v1.Gmail
let auth: Auth
let sync: RootSync
let gmail_sync: GmailSync
let gtasks_sync: GTasksSync
const log = debug('tests')

jest.setTimeout(15 * 1000)
beforeAll(initTest)
afterAll(print_db)
beforeAll(async function() {
  await gmail_sync.createLabelsIfMissing([
    'P/project_1',
    'P/project_2',
    'P/project_3'
  ])
})

// DEBUG=root\*-info,record-diffs,db-diffs,gtasks-list-next\*,gmail-list-next\* DEBUG_AM=2
// DEBUG=tests,\*-am\*,\*-error DEBUG_AM=2
// DEBUG=tests,\*-error,record-diffs,db-diffs,connections-\*,root\*-info DEBUG_FILE=1 node_modules/jest/bin/jest.js
describe('gmail', function() {
  it.skip('should create the labels', function() {})
  it.skip('should set colors of existing labels', function() {})
  it('refreshes on Dirty', function() {})

  describe('db', function() {
    it('auto add text labels for new self emails', async function() {
      await gmail_sync.createThread(
        'auto-label-test-1 !na *location_1 ^reference_1'
      )
      log('email sent')
      await syncList(true, false, 'inbox-labels')
      expect(sync.data.data).toHaveLength(1)
      const record = sync.data.data[0]

      expect(record.labels).toMatchObject({
        '!S/Next Action': { active: true },
        'R/reference_1': { active: true },
        'L/location_1': { active: true }
      })
    })
  })

  describe('gtasks', function() {
    beforeEach(reset)

    it('syncs new threads', async function() {
      // create a new thread
      const thread_id = await gmail_sync.createThread('gmail-gtask-1', [
        '!S/Next Action'
      ])
      log('email sent')
      await syncList(true, false)
      // get directly from the API
      const res = await listTasklist()
      // assert the result
      const record = {
        title: 'gmail-gtask-1',
        status: 'needsAction'
      }
      expect(res.items).toHaveLength(1)
      expect(res.items[0]).toMatchObject(record)
      expect(res.items[0].notes).toMatch(
        '\nEmail: https://mail.google.com/mail/u/0/#all/'
      )
    })

    it('syncs labels to text label', async function() {
      // create a new thread
      await gmail_sync.createThread('gmail-gtask-1', [
        '!S/Next Action',
        'P/project_1',
        'P/project_2'
      ])
      await syncList(true, false)
      const list = await listTasklist()
      // assert the result
      const record = {
        title: 'gmail-gtask-1 #project_1 #project_2',
        status: 'needsAction'
      }
      expect(list.items).toHaveLength(1)
      expect(list.items[0]).toMatchObject(record)
    })

    it('syncs tasks between lists', async function() {
      const thread_id = await gmail_sync.createThread('gmail-gtask-1', [
        '!S/Next Action',
        'P/project_1',
        'P/project_2'
      ])
      await syncList(true, false)
      log('moving to !S/Action')
      await req('gmail.users.threads.modify', {
        id: thread_id,
        userId: 'me',
        fields: 'id',
        resource: {
          addLabelIds: [labelID('!S/Action')]
        }
      })
      await syncList(true, false)
      const [list_action, list_next] = await Promise.all([
        listTasklist('!actions'),
        listTasklist('!next')
      ])
      // assert the result
      const record = {
        status: 'needsAction'
      }
      if (list_next.items) {
        expect(list_next.items).toHaveLength(0)
      }
      expect(list_action.items).toHaveLength(1)
      expect(list_action.items[0]).toMatchObject(record)
    })

    it('syncs task completions', async function() {
      const thread_id = await gmail_sync.createThread('gmail-gtask-1', [
        '!S/Next Action',
        'P/project_1',
        'P/project_2'
      ])
      await syncList(true, false)
      log('moving to !S/Finished')
      await req('gmail.users.threads.modify', {
        id: thread_id,
        userId: 'me',
        fields: 'id',
        resource: {
          addLabelIds: [labelID('!S/Finished')]
        }
      })
      await syncList(true, false)
      const [list_action, list_next] = await Promise.all([
        listTasklist('!actions'),
        listTasklist('!next')
      ])
      // assert the result
      const record = {
        status: 'completed'
      }
      if (list_next.items) {
        expect(list_next.items).toHaveLength(0)
      }
      expect(list_action.items).toHaveLength(1)
      expect(list_action.items[0]).toMatchObject(record)
    })

    it(`creates new labels for non-existing text labels`, async function() {})
    it.skip(`triggers a sync with '!T/Sync GTasks'`, async function() {})

    it('syncs text labels for new self emails', async function() {
      await reset()
      // create a new thread
      await gmail_sync.createThread(
        'gmail-gtask-1 !na #project_1 *location_1 ^reference_1'
      )
      log('email sent')
      await syncList(true, false, 'inbox-labels')
      // get directly from the API
      const res = await listTasklist()
      // assert the result
      const record = {
        title: 'gmail-gtask-1 #project_1 *location_1 ^reference_1',
        status: 'needsAction'
      }
      expect(res.items).toHaveLength(1)
      expect(res.items[0]).toMatchObject(record)
      expect(res.items[0].notes).toMatch(
        '\nEmail: https://mail.google.com/mail/u/0/#all/'
      )
    })
  })
})

describe('gtasks', function() {
  it.skip('should create the lists', function() {})
  it.skip('should cache with etags', function() {})
  it.skip('refreshes on Dirty', function() {})
  it.skip('re-adds the list in case it disappears', function() {})

  describe('db', function() {})

  describe('gmail', function() {
    beforeEach(reset)

    it('syncs new tasks', async function() {
      await addTask('gtasks-gmail-1')
      // sync
      await syncList(false, true)
      // assert
      const list = await listQuery('label:!s-next-action')
      expect(list.threads).toHaveLength(1)
      for (const field of ['historyId', 'id']) {
        expect(Object.keys(list.threads[0])).toContain(field)
      }
    })

    it('syncs text labels', async function() {
      const wait = [
        addTask('gtasks-gmail-2 #project_1'),
        addTask('gtasks-gmail-1 #project_2 #project_3')
      ]
      await Promise.all(wait)
      // sync
      await syncList(false, true)
      // assert
      const list = await listQuery('label:!s-next-action')
      expect(list.threads).toHaveLength(2)
      const load_threads = [
        getThread(list.threads[0].id),
        getThread(list.threads[1].id)
      ]
      const [thread_1, thread_2] = await Promise.all(load_threads)
      expect(hasLabel(thread_1, 'P/project_2'))
      expect(hasLabel(thread_1, 'P/project_3'))
      expect(hasLabel(thread_2, 'P/project_1'))
    })

    it.skip('syncs tasks between lists', async function() {
      // create a new task in next
      // sync
      // delete the one in next, but copy the notes
      // create another task in actions
      // sync
      // check if the new thread has S/Actions
    })

    it('syncs task completions', async function() {
      const task_id = await addTask('gtasks-gmail-1')
      await patchTask(
        task_id,
        'gtasks-gmail-1 #project_1 #project_2',
        '!next',
        null,
        true
      )
      await syncList(false, true)
      const data = sync.data.data
      expect(data).toHaveLength(1)
      const refresh = await getThread(data[0].gmail_id)
      expect(hasLabel(refresh, '!S/Finished')).toBeTruthy()
    })

    it('syncs task completions with hiding', async function() {
      const task_id = await addTask('gtasks-gmail-1')
      await patchTask(
        task_id,
        'gtasks-gmail-1 #project_1 #project_2',
        '!next',
        null,
        true,
        true
      )
      await syncList(false, true)
      const data = sync.data.data
      expect(data).toHaveLength(1)
      const refresh = await getThread(data[0].gmail_id)
      const task = await getTask(task_id)
      expect(task.hidden).toBeFalsy()
      expect(hasLabel(refresh, '!S/Finished')).toBeTruthy()
    })

    it('syncs missing threads', async function() {
      // add 2 tasks
      await Promise.all([addTask('gtasks-gmail-1'), addTask('gtasks-gmail-2')])
      // sync
      await syncList(true, true)
      expect(sync.data.data).toHaveLength(2)
      // delete one thread
      const thread_1 = (await listQuery()).threads[0]
      await deleteThread(thread_1.id)
      // sync
      await syncList(true, true)
      // check if the deletion propagated
      const [tasks, query] = await Promise.all([
        await listTasklist(),
        await listQuery()
      ])
      expect(query.threads).toHaveLength(1)
      expect(tasks.items).toHaveLength(1)
    })
  })
})

describe('gtasks <=> gmail', function() {
  beforeEach(reset)

  it('syncs label changes', async function() {
    const task_id_1 = await addTask('gtasks<->gmail-1')
    // create a new thread
    // thread_id = await gmail_sync.createThread('gmail<->gtasks-2', [
    //   '!S/Next Action'
    // ])
    await syncList(true, true)
    const thread_1 = gmail_sync.threads.values().next().value
    // remove 1, add 2
    let promise_tasks = patchTask(task_id_1, 'gtasks-gmail-1 #project_2')
    // add 3
    let promise_gmail = modifyLabels(thread_1.id, ['P/project_3'])
    await Promise.all([promise_tasks, promise_gmail])
    await syncList(true, true)
    expect(sync.data.data).toHaveLength(1)
    const record = sync.data.data[0]
    expect(record.labels).toMatchObject({
      '!S/Next Action': { active: true },
      'P/project_2': { active: true },
      'P/project_3': { active: true }
    })
  })
  it.skip('syncs notes', function() {})
})

describe.skip('sync', function() {
  it('auto starts', function() {})
  it('auto syncs', function() {})
  it('auto restarts', function() {})

  describe.skip('label filters', function() {})
})

// ----- ----- -----
// FUNCTIONS
// ----- ----- -----

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

async function getThread(id: string): Promise<google.gmail.v1.Thread> {
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

function print_db() {
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

async function cleanupGmail(query) {
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
        await req('gmail.users.threads.delete', { id: thread.id, userId: 'me' })
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
    ['label:all', 'label:trash'].map(async query => await cleanupGmail(query))
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
  const [body, res] = await req('gtasks.tasks.insert', {
    tasklist: gtasks_sync.getListByName(list).list.id,
    task: task_id
  })
  return body
}

// @returns the ID of the new task
async function addTask(
  title = '',
  list = '!next',
  notes = '',
  completed = false
): Promise<string> {
  const [body, res] = await req('gtasks.tasks.insert', {
    tasklist: gtasks_sync.getListByName(list).list.id,
    fields: 'id',
    resource: {
      title,
      notes,
      status: completed ? 'completed' : 'needsAction'
    }
  })
  return body.id
}

async function patchTask(
  id,
  title: string,
  list = '!next',
  notes = '',
  completed = undefined,
  hidden = undefined
): Promise<string> {
  let resource = { title }
  if (notes) {
    // @ts-ignore
    resource.notes = notes
  }
  if (typeof completed !== undefined) {
    // @ts-ignore
    resource.status = completed ? 'completed' : 'needsAction'
  }
  if (typeof hidden !== undefined) {
    // @ts-ignore
    resource.hidden = hidden
  }
  const [body, res] = await req('gtasks.tasks.patch', {
    tasklist: gtasks_sync.getListByName(list).list.id,
    task: id,
    fields: 'id',
    resource
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
