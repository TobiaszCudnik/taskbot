///<reference path="../typings/index.d.ts"/>
import { promisifyArray } from 'typed-promisify-tob/index'
import Connections from '../src/app/connections'
import Logger from '../src/app/logger'
import { getConfig } from '../src/app/config'
import * as google from 'googleapis'
import * as delay from 'delay'
import users from '../config-users'
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

// DEBUG=root\*-info,gtasks-list-next\*,gmail-list-next\* DEBUG_AM=2
// DEBUG=tests,\*-am\*,\*-error DEBUG_AM=2
// DEBUG=tests,\*-error,record-diffs,db-diffs,connections-\*,root\*-info DEBUG_FILE=1 node_modules/jest/bin/jest.js
describe('gmail', function() {
  beforeAll(async function() {
    // TODO cleanup at the beginning
    await gmail_sync.createLabelsIfMissing(['P/label_1', 'P/label_2'])
  })
  function label_id(name) {
    const id = gmail_sync.getLabelID(name)
    assert(id, `Label '${name}' doesnt exist`)
    return id
  }
  async function sync_list(
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
  async function list_tasklist(name = '!next') {
    const [body, res] = await req('gtasks.tasks.list', {
      maxResults: 1000,
      tasklist: gtasks_sync.getListByName(name).list.id,
      fields: 'etag,items(id,title,notes,updated,etag,status,parent)',
      showHidden: false
    })
    return body
  }

  it.skip('should create the labels', function() {})
  it.skip('should set colors of existing labels', function() {})
  it.skip('refreshes on Dirty', function() {})

  describe('db', function() {
    it('auto add text labels for new self emails', async function() {
      await gmail_sync.createThread(
        'auto-label-test-1 !na *location_1 ^reference_1'
      )
      log('email sent')
      await sync_list(true, false, 'inbox-labels')
      expect(sync.data.data).toHaveLength(1)
      const record = sync.data.data[0]
      expect(Object.keys(record.labels)).toContain('!S/Next Action')
      expect(Object.keys(record.labels)).toContain('R/reference_1')
      expect(Object.keys(record.labels)).toContain('L/location_1')
    })
  })

  async function reset() {
    // clear all the APIs
    await Promise.all([
      truncate_gmail(),
      // TODO loop over the lists from conig
      truncate_gtasks_list('!next'),
      truncate_gtasks_list('!actions')
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

  describe('gtasks', function() {
    let thread_id
    beforeAll(reset)
    it('syncs new threads', async function() {
      // create a new thread
      thread_id = await gmail_sync.createThread('gmail-gtask-1', [
        '!S/Next Action'
      ])
      log('email sent')
      await sync_list(true, false)
      // get directly from the API
      const res = await list_tasklist()
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

    it('syncs label changes', async function() {
      // assign the new labels
      log('adding dummy labels')
      await req('gmail.users.threads.modify', {
        id: thread_id,
        userId: 'me',
        fields: 'id',
        resource: {
          addLabelIds: [label_id('P/label_1'), label_id('P/label_2')]
          // removeLabelIds: remove_label_ids
        }
      })
      await sync_list(true, false)
      const list = await list_tasklist()
      // assert the result
      const record = {
        title: 'gmail-gtask-1 #label_1 #label_2',
        status: 'needsAction'
      }
      expect(list.items).toHaveLength(1)
      expect(list.items[0]).toMatchObject(record)
    })

    it('syncs tasks between lists', async function() {
      log('moving to !S/Action')
      debugger
      await req('gmail.users.threads.modify', {
        id: thread_id,
        userId: 'me',
        fields: 'id',
        resource: {
          addLabelIds: [label_id('!S/Action')]
        }
      })
      await sync_list(true, false)
      const [list_action, list_next] = await Promise.all([
        list_tasklist('!actions'),
        list_tasklist('!next')
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
      log('moving to !S/Finished')
      debugger
      await req('gmail.users.threads.modify', {
        id: thread_id,
        userId: 'me',
        fields: 'id',
        resource: {
          addLabelIds: [label_id('!S/Finished')]
        }
      })
      await sync_list(true, false)
      const [list_action, list_next] = await Promise.all([
        list_tasklist('!actions'),
        list_tasklist('!next')
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

    it.skip(`triggers a sync with '!T/Sync GTasks'`, async function() {})
  })
})

describe('gtasks', function() {
  it.skip('should create the lists', function() {})
  it.skip('should cache with etags', function() {})
  it.skip('refreshes on Dirty', function() {})

  describe.skip('db', function() {})

  describe.skip('gmail', function() {
    it('syncs new tasks', function() {})
    it('syncs text labels', function() {})
    it('syncs tasks between lists', async function() {})
    it('syncs task completions', async function() {})
  })
})

describe.skip('gtasks <=> gmail', function() {
  it('syncs label changes', function() {})
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

function print_db() {
  if (!sync.data) return
  log(sync.data.toString())
}

async function initTest() {
  // init sync
  const logger = new Logger()
  const connections = new Connections(logger)
  const config = getConfig(users[0])
  // disable auto sync
  config.sync_frequency = 10000 * 100
  config.gtasks.sync_frequency = 10000 * 100
  sync = new RootSync(config, logger, connections)
  // disable heartbeat
  sync.HeartBeat_state = () => {}
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
  await truncate_gmail()
  await truncate_gtasks()
  // init the engine
  sync.state.addNext('Enabled')
  await sync.state.when('Ready')
  gmail_sync = sync.subs.google.subs.gmail
  gtasks_sync = sync.subs.google.subs.tasks
  // trigger sync
  sync.state.add('Reading')
  log('connected')
  await sync.state.when('WritingDone')
  log('initial sync OK')
}

async function req(method: string, params = {}, options = {}) {
  log(`req ${method}:\n%O`, params)
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

async function cleanup_gmail(query) {
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

async function truncate_gtasks() {
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

async function truncate_gtasks_list(name = '!next') {
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

async function truncate_gmail() {
  // TODO remove labels
  await Promise.all(
    ['label:all', 'label:trash'].map(async query => await cleanup_gmail(query))
  )
  log('removed all emails')
}
