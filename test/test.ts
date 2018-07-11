///<reference path="../typings/index.d.ts"/>

import { promisifyArray } from 'typed-promisify-tob/index'
import Connections from '../src/app/connections'
import Logger from '../src/app/logger'
import { getConfig } from '../src/app/config'
import * as google from 'googleapis'
import users from '../config-users'
import Auth from '../src/google/auth'
import GmailSync from '../src/google/gmail/sync'
import GTasksSync from '../src/google/tasks/sync'
import RootSync from '../src/sync/root'
import * as _ from 'lodash'

let gtasks: google.tasks.v1.Tasks
let gmail: google.gmail.v1.Gmail
let auth: Auth
let sync: RootSync
let gmail_sync: GmailSync
let gtasks_sync: GTasksSync

jest.setTimeout(10 * 1000)
beforeAll(initTest)

// DEBUG=root\*-info,gtasks-list-next\*,gmail-list-next\* DEBUG_AM=2
describe('gmail', function() {
  it.skip('should create the labels', function() {})
  it.skip('should set colors of existing labels', function() {})
  it.skip('auto add text labels for new self emails', function() {})

  describe.skip('db', function() {})

  describe('gtasks', function() {
    let tasklist
    let query
    beforeAll(async function() {
      tasklist = gtasks_sync.getListByName('!next')
      query = gmail_sync.getListByName('!next')
      // TODO cleanup at the beginning
      await gmail_sync.createLabelsIfMissing(['P/label_1', 'P/label_2'])
    })
    function label_id(name) {
      return gmail_sync.getLabelID(name)
    }
    async function sync_next() {
      // start a selective sync
      tasklist.state.add('Dirty')
      query.state.add('Dirty')
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

    it('syncs new threads', async function() {
      // create a new thread
      await gmail_sync.createThread('test 1', ['!S/Next Action'])
      console.log('email sent')
      await sync_next()
      // get directly from the API
      const res = await list_tasklist()
      // assert the result
      const record = {
        title: 'test 1',
        status: 'needsAction'
      }
      expect(res.items[0]).toMatchObject(record)
      expect(res.items[0].notes).toMatch(
        '\nEmail: https://mail.google.com/mail/u/0/#all/'
      )
    })

    it('syncs label changes', async function() {
      // console.dir(labels)
      // assign the new labels
      await req('gmail.users.threads.modify', {
        id: sync.data.data[0].gmail_id,
        userId: 'me',
        fields: 'id',
        resource: {
          addLabelIds: [label_id('P/label_1'), label_id('P/label_2')]
          // removeLabelIds: remove_label_ids
        }
      })
      await sync_next()
      const res = await list_tasklist()
      // assert the result
      const record = {
        title: 'test 1 #label_1 #label_2',
        status: 'needsAction'
      }
      expect(res.items[0]).toMatchObject(record)
    })

    it.skip('syncs tasks between lists', async function() {})

    it.skip('syncs task completions', async function() {})

    it.skip('triggers pulling with a label', async function() {})
  })
})

describe('gtasks', function() {
  it.skip('should create the lists', function() {})
  it.skip('should cache with etags', function() {})

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
})

// ----- ----- -----
// FUNCTIONS
// ----- ----- -----

async function initTest() {
  // init sync
  const logger = new Logger()
  const connections = new Connections(logger)
  const config = getConfig(users[0])
  // disable auto sync
  config.sync_frequency = 10000 * 100
  config.gtasks.sync_frequency = 10000 * 100
  sync = new RootSync(config, logger, connections)
  const ready_state = sync.state.get('Ready')
  // disable auto start
  ready_state.add = _.without(ready_state.add, 'Reading')
  sync.state.addNext('Enabled')
  await sync.state.when('Ready')
  // assign apis
  gtasks = connections.apis.gtasks
  gtasks_sync = sync.subs.google.subs.tasks
  gmail = connections.apis.gmail
  gmail_sync = sync.subs.google.subs.gmail
  auth = sync.subs.google.auth
  // prepare to start
  // delete all the old emails
  await truncate_gmail()
  // trigger sync
  sync.state.add('Reading')
  console.log('connected')
  await sync.state.when('WritingDone')
  console.log('initial sync OK')
}

async function req(method: string, params = {}, options = {}) {
  params.auth = auth.client
  // prevent JIT from shadowing those
  void (gmail, gtasks)
  // console.log(method)
  return await promisifyArray(eval(method))(params, options)
}

async function clean(query) {
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

async function truncate_gmail() {
  await Promise.all(
    ['label:all', 'label:trash'].map(async query => await clean(query))
  )
  console.log('removed all emails')
}
