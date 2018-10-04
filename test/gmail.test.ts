import { AxiosResponse } from 'axios'
import { Params$Resource$Users$Labels$List } from 'googleapis/build/src/apis/gmail/v1'
import createHelpers, { Label, Thread, Task, TaskList } from './helpers'
import { gmail_v1 } from 'googleapis'

const scenario = parseInt(process.env['SCENARIO'], 10) || 0
// types for the helpers
type Unpacked<T> = T extends Promise<infer U> ? U : T
let h: Unpacked<ReturnType<typeof createHelpers>>

jest.setTimeout(15 * 1000)
beforeAll(async function() {
  h = await createHelpers()
})
beforeAll(async function() {
  await h.gmail_sync.createLabelsIfMissing([
    'P/project_1',
    'P/project_2',
    'P/project_3'
  ])
})
afterAll(function() {
  if (h) {
    h.printDB()
  }
})

// DEBUG=root\*-info,record-diffs,db-diffs,gtasks-list-next\*,gmail-list-next\* DEBUG_AM=2
// DEBUG=tests,\*-am\*,\*-error DEBUG_AM=2
// DEBUG=tests,\*-error,record-diffs,db-diffs,connections-\*,root\*-info DEBUG_FILE=1 node_modules/jest/bin/jest.js
describe(`gmail (sync_type: ${scenario})`, function() {
  if (!scenario) {
    it.only('should create the labels', async function() {
      h.log('\n\nTEST: should create the labels')
      // TODO test with missing labels
      // TODO test adding colors to existing labels
      const list = await h.req<
        gmail_v1.Params$Resource$Users$Labels$List,
        gmail_v1.Schema$ListLabelsResponse
      >('gmail.users.labels.list', { userId: 'me' })
      const expected = [
        // name, bg, fg, hidden
        ['!S/Next Action', '#fb4c2f', '#ffffff', false],
        ['!S/Action', '#ffad47', '#ffffff', false],
        ['!T/Sync GTasks', '#b9e4d0', '#000000', true],
        ['P/project_1', '#a4c2f4', '#000000', false]
      ]
      for (const item of expected) {
        const found = list.data.labels.find((l: Label) => l.name == item[0])
        expect(found).toBeTruthy()
        expect(found.color.backgroundColor).toEqual(item[1])
        expect(found.color.textColor).toEqual(item[2])
        if (item[3]) {
          expect(found.labelListVisibility).toEqual('labelHide')
        }
      }
    })
  }

  it.skip('should sync label definitions for new labels', function() {
    // TODO test the delayed labels
  })

  if (!scenario) {
    it('refreshes on Dirty', async function() {
      h.log('\n\nTEST: refreshes on Dirty')
      await h.syncList(true, false)
      const list = h.gmail_sync.getListByName('!next')
      expect(list.shouldRead()).toBeFalsy()
      list.state.add('Dirty')
      expect(list.shouldRead()).toBeTruthy()
    })
  }

  if (!scenario) {
    it('processes "!T/Task" labels added to any email', async function() {
      h.log('\n\nTEST: processes "!T/Task" labels added to any email')
      await h.reset()
      const gtasks_list = h.gtasks_sync.getListByName('!next')
      gtasks_list.state.drop('Dirty')
      await h.gmail_sync.createThread('gmail-1', ['!T/Sync GTasks'])
      await h.syncList(true, false, 'task-labels')
      const gmail_list = h.gmail_sync.getListByName('task-labels')
      expect(gmail_list.query.threads).toHaveLength(1)
    })
  }

  describe('db', function() {
    if (!scenario) {
      it(`auto add text labels from new self emails`, async function() {
        h.log('\n\nTEST: auto add text labels from new self emails')
        await h.reset()
        await h.gmail_sync.createThread(
          'auto-label-test-1 !na #L-location_1 #R-reference_1'
        )
        // TODO 1 sync should be enough
        await h.syncList(true, false, 'inbox-labels')
        await h.syncList(true, false, 'inbox-labels')
        expect(h.sync.data.data).toHaveLength(1)
        const record = h.sync.data.data[0]

        expect(record.labels).toMatchObject({
          '!S/Next Action': { active: true },
          'R/reference_1': { active: true },
          'L/location_1': { active: true },
          UNREAD: { active: false }
        })
      })
    }
    if (!scenario) {
      it('!S label is added to existing emails with a status', async function() {
        h.log('\n\nTEST: make sure the !S label is added to existing emails')
        await h.reset()
        await h.gmail_sync.createThread('gmail-1', ['!S/Next Action'])
        await h.syncList(true, false)
        expect(h.sync.data.data).toHaveLength(1)
        const record = h.sync.data.data[0]

        expect(record.labels).toMatchObject({
          '!S/Next Action': { active: true },
          '!S': { active: true }
        })
      })
    }
  })

  describe('gtasks', function() {
    it('syncs new threads', async function() {
      h.log('\n\nTEST: syncs new threads')
      await h.reset()
      // create a new thread
      await h.gmail_sync.createThread('gmail-gtask-1', ['!S/Next Action'])
      h.log('email sent')
      await h.syncListScenario(scenario)
      // get directly from the API
      const res = await h.listTasklist()
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
      h.log('\n\nTEST: syncs labels to text label')
      await h.reset()
      // create a new thread
      await h.gmail_sync.createThread('gmail-gtask-1', [
        '!S/Next Action',
        'P/project_1',
        'P/project_2'
      ])
      await h.syncListScenario(scenario)
      const list = await h.listTasklist()
      // assert the result
      const record = {
        title: 'gmail-gtask-1 #project_1 #project_2',
        status: 'needsAction'
      }
      expect(list.items).toHaveLength(1)
      expect(list.items[0]).toMatchObject(record)
    })

    // TODO
    it.skip('syncs tasks with children between lists', async function() {
      h.log('\n\nTEST: syncs tasks with children between lists')
      await h.reset()
      const task_id = await h.addTask('gtasks-gmail-1')
      await h.addTask('gtasks-gmail-1', '!next', '', false, task_id)
      await h.syncListScenario(scenario)
    })

    it('syncs tasks between lists', async function() {
      h.log('\n\nTEST: syncs tasks between lists')
      await h.reset()
      // create a thread in !na
      const thread_id = await h.gmail_sync.createThread('gmail-gtask-1', [
        '!S/Next Action',
        'P/project_1',
        'P/project_2'
      ])
      // sync
      await h.syncList(true, false)
      // move to !a
      h.log('moving to !S/Action')
      await h.req('gmail.users.threads.modify', {
        id: thread_id,
        userId: 'me',
        fields: 'id',
        requestBody: {
          addLabelIds: [h.labelID('!S/Action')]
        }
      })
      // sync
      await h.syncListScenario(scenario)
      // list both !na and !a
      const [list_action, list_next] = await Promise.all([
        h.listTasklist('!actions'),
        h.listTasklist('!next')
      ])
      // assert the result (0 in !na, 1 in !a)
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
      h.log('\n\nTEST: syncs task completions')
      await h.reset()
      const thread_id = await h.gmail_sync.createThread('gmail-gtask-1', [
        '!S/Next Action',
        'P/project_1',
        'P/project_2'
      ])
      await h.syncList(true, false)
      h.log('adding !S/Finished')
      await h.req('gmail.users.threads.modify', {
        id: thread_id,
        userId: 'me',
        fields: 'id',
        requestBody: {
          addLabelIds: [h.labelID('!S/Finished')]
        }
      })
      await h.syncListScenario(scenario)
      const list_next = await h.listTasklist('!next')
      // assert the result
      const record = {
        status: 'completed'
      }
      expect(list_next.items).toHaveLength(1)
      expect(list_next.items[0]).toMatchObject(record)
    })

    it(`triggers a sync with '!T/Sync GTasks'`, async function() {
      h.log("\n\nTEST: triggers a sync with '!T/Sync GTasks'")
      const list = h.gtasks_sync.getListByName('!next')
      list.state.drop('Dirty')
      await h.gmail_sync.createThread('gmail-gtasks-1', [
        '!S/Action',
        '!T/Sync GTasks'
      ])
      // check if gtasks-next will be synced
      const last_read = list.last_read_end.unix()
      await h.syncListScenario(scenario, '!actions')
      expect(list.last_read_end.unix()).toBeGreaterThan(last_read)
    })

    it('syncs text labels for new self emails', async function() {
      h.log('\n\nTEST: syncs text labels for new self emails')
      await h.reset()
      // create a new thread
      await h.gmail_sync.createThread(
        'gmail-gtask-1 !na #project_1 #L-location_1 #R-reference_1'
      )
      h.log('email sent')
      await h.syncListScenario(scenario, 'inbox-labels')
      // get directly from the API
      const res = await h.listTasklist()
      // assert the result
      const record = {
        title: 'gmail-gtask-1 #project_1 #L-location_1 #R-reference_1',
        status: 'needsAction'
      }
      expect(res.items).toHaveLength(1)
      expect(res.items[0]).toMatchObject(record)
      expect(res.items[0].notes).toMatch(
        '\nEmail: https://mail.google.com/mail/u/0/#all/'
      )
    })

    it('syncs !S/Expired as a completion', async function() {
      h.log('\n\nTEST: syncs !S/Expired as a completion')
      await h.reset()
      // create a new thread
      const thread_id = await h.gmail_sync.createThread('gmail-gtask-1', [
        '!S/Next Action'
      ])
      await h.syncList(true, false)
      h.log('mark as !S/Expired')
      await h.req('gmail.users.threads.modify', {
        id: thread_id,
        userId: 'me',
        fields: 'id',
        requestBody: {
          addLabelIds: [h.labelID('!S/Expired')]
        }
      })
      await h.syncListScenario(scenario)
      // get directly from the API
      const res = await h.listTasklist()
      // expected
      const match = {
        title: 'gmail-gtask-1',
        status: 'completed'
      }
      // assert DB
      const record = h.sync.data.data[0]
      expect(record.labels).toMatchObject({
        // set
        '!S/Expired': { active: true },
        // not set
        '!S/Next Action': { active: false },
        '!S/Finished': { active: false }
      })
      // assert GTasks
      expect(res.items).toHaveLength(1)
      expect(res.items[0]).toMatchObject(match)
    })
  })
})
