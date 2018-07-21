///<reference path="../typings/index.d.ts"/>

import * as google from 'googleapis'
import * as debug from 'debug'
import createHelpers, { Label, Thread, Task, TaskList } from './helpers'

// types for the helpers
type Unpacked<T> = T extends Promise<infer U> ? U : T
let h: Unpacked<ReturnType<typeof createHelpers>>

const log = debug('tests')
jest.setTimeout(15 * 1000)
beforeAll(async function() {
  h = await createHelpers(log)
})
beforeAll(async function() {
  await h.gmail_sync.createLabelsIfMissing([
    'P/project_1',
    'P/project_2',
    'P/project_3'
  ])
})
afterAll(function() {
  h.printDB()
})

// DEBUG=root\*-info,record-diffs,db-diffs,gtasks-list-next\*,gmail-list-next\* DEBUG_AM=2
// DEBUG=tests,\*-am\*,\*-error DEBUG_AM=2
// DEBUG=tests,\*-error,record-diffs,db-diffs,connections-\*,root\*-info DEBUG_FILE=1 node_modules/jest/bin/jest.js
describe('gmail', function() {
  it.skip('should create the labels', function() {})
  it('should sync label definitions', async function() {
    // TODO test with missing labels
    // TODO test adding colors to existing labels
    const [list]: [google.gmail.v1.ListLabelsResponse] = await h.req(
      'gmail.users.labels.list',
      { userId: 'me' }
    )
    const expected = [
      // name, bg, fg, hidden
      ['!S/Next Action', '#fb4c2f', '#ffffff', false],
      ['!S/Action', '#ffad47', '#ffffff', false],
      ['!T/Sync GTasks', '#b9e4d0', '#000000', true],
      ['P/project_1', '#a4c2f4', '#000000', false]
    ]
    for (const item of expected) {
      const found = list.labels.find((l: Label) => l.name == item[0])
      expect(found).toBeTruthy()
      expect(found.color.backgroundColor).toEqual(item[1])
      expect(found.color.textColor).toEqual(item[2])
      if (item[3]) {
        expect(found.labelListVisibility).toEqual('labelHide')
      }
    }
  })
  it('refreshes on Dirty', async function() {
    await h.syncList(true, true)
    const list = h.gmail_sync.getListByName('!next')
    expect(list.shouldRead()).toBeFalsy()
    list.state.add('Dirty')
    expect(list.shouldRead()).toBeTruthy()
  })

  describe('db', function() {
    it('auto add text labels from new self emails', async function() {
      await h.gmail_sync.createThread(
        'auto-label-test-1 !na *location_1 ^reference_1'
      )
      log('email sent')
      await h.syncList(true, false, 'inbox-labels')
      expect(h.sync.data.data).toHaveLength(1)
      const record = h.sync.data.data[0]

      expect(record.labels).toMatchObject({
        '!S/Next Action': { active: true },
        'R/reference_1': { active: true },
        'L/location_1': { active: true }
      })
    })
  })

  describe('gtasks', function() {
    it('syncs new threads', async function() {
      await h.reset()
      // create a new thread
      await h.gmail_sync.createThread('gmail-gtask-1', ['!S/Next Action'])
      log('email sent')
      await h.syncList(true, false)
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
      await h.reset()
      // create a new thread
      await h.gmail_sync.createThread('gmail-gtask-1', [
        '!S/Next Action',
        'P/project_1',
        'P/project_2'
      ])
      await h.syncList(true, false)
      const list = await h.listTasklist()
      // assert the result
      const record = {
        title: 'gmail-gtask-1 #project_1 #project_2',
        status: 'needsAction'
      }
      expect(list.items).toHaveLength(1)
      expect(list.items[0]).toMatchObject(record)
    })

    it('syncs tasks between lists', async function() {
      await h.reset()
      const thread_id = await h.gmail_sync.createThread('gmail-gtask-1', [
        '!S/Next Action',
        'P/project_1',
        'P/project_2'
      ])
      await h.syncList(true, false)
      log('moving to !S/Action')
      await h.req('gmail.users.threads.modify', {
        id: thread_id,
        userId: 'me',
        fields: 'id',
        resource: {
          addLabelIds: [h.labelID('!S/Action')]
        }
      })
      await h.syncList(true, false)
      const [list_action, list_next] = await Promise.all([
        h.listTasklist('!actions'),
        h.listTasklist('!next')
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
      await h.reset()
      const thread_id = await h.gmail_sync.createThread('gmail-gtask-1', [
        '!S/Next Action',
        'P/project_1',
        'P/project_2'
      ])
      await h.syncList(true, false)
      log('adding !S/Finished')
      await h.req('gmail.users.threads.modify', {
        id: thread_id,
        userId: 'me',
        fields: 'id',
        resource: {
          addLabelIds: [h.labelID('!S/Finished')]
        }
      })
      await h.syncList(true, false)
      const list_next = await h.listTasklist('!next')
      // assert the result
      const record = {
        status: 'completed'
      }
      expect(list_next.items).toHaveLength(1)
      expect(list_next.items[0]).toMatchObject(record)
    })

    it(`creates new labels for non-existing text labels`, async function() {})
    it.skip(`triggers a sync with '!T/Sync GTasks'`, async function() {})

    it('syncs text labels for new self emails', async function() {
      await h.reset()
      // create a new thread
      await h.gmail_sync.createThread(
        'gmail-gtask-1 !na #project_1 *location_1 ^reference_1'
      )
      log('email sent')
      await h.syncList(true, false, 'inbox-labels')
      // get directly from the API
      const res = await h.listTasklist()
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
  it('should create the lists', async function() {
    const [lists]: [google.tasks.v1.TaskLists] = await h.req(
      'gtasks.tasklists.list'
    )
    const list_names = lists.items.map(l => l.title.toLowerCase())
    for (const list of h.sync.config.lists) {
      // skip gmail-only lists
      if (list.writers && !list.writers.includes('gtasks')) {
        continue
      }
      expect(list_names).toContain(list.name.toLowerCase())
    }
  })

  it.skip('should cache with etags', function() {})

  it('refreshes on Dirty', async function() {
    await h.syncList(true, true)
    const list = h.gtasks_sync.getListByName('!next')
    expect(list.shouldRead()).toBeFalsy()
    list.state.add('Dirty')
    expect(list.shouldRead()).toBeTruthy()
  })

  it.skip('re-adds the list in case it disappears', async function() {
    const list = h.gtasks_sync.getListByName('!next')
    await h.req('gtasks.tasklists.delete', {
      tasklist: list.list.id
    })
    const last_read = list.last_read_end.unix()
    await h.syncList(false, true)
    expect(list.last_read_end.unix()).toBeGreaterThan(last_read)
  })

  it.skip('un-hides a task after its completion', function() {})

  describe.skip('db', function() {
    it('syncs new tasks', async function() {})
    it('syncs tasks removalsa', function() {})
  })

  describe('gmail', function() {
    it('syncs new tasks', async function() {
      await h.reset()
      await h.addTask('gtasks-gmail-1')
      // sync
      await h.syncList(false, true)
      // assert
      const list = await h.listQuery('label:!s-next-action')
      expect(list.threads).toHaveLength(1)
      for (const field of ['historyId', 'id']) {
        expect(Object.keys(list.threads[0])).toContain(field)
      }
    })

    it('syncs text labels', async function() {
      await h.reset()
      const wait = [
        h.addTask('gtasks-gmail-2 #project_1'),
        h.addTask('gtasks-gmail-1 #project_2 #project_3')
      ]
      await Promise.all(wait)
      // sync
      await h.syncList(false, true)
      // assert
      const list = await h.listQuery('label:!s-next-action')
      expect(list.threads).toHaveLength(2)
      const load_threads = [
        h.getThread(list.threads[0].id),
        h.getThread(list.threads[1].id)
      ]
      const [thread_1, thread_2] = await Promise.all(load_threads)
      expect(h.hasLabel(thread_1, 'P/project_2'))
      expect(h.hasLabel(thread_1, 'P/project_3'))
      expect(h.hasLabel(thread_2, 'P/project_1'))
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
      await h.reset()
      const task_id = await h.addTask('gtasks-gmail-1')
      await h.patchTask(
        task_id,
        'gtasks-gmail-1 #project_1 #project_2',
        '!next',
        null,
        true
      )
      await h.syncList(false, true)
      const data = h.sync.data.data
      expect(data).toHaveLength(1)
      const refresh = await h.getThread(data[0].gmail_id)
      expect(h.hasLabel(refresh, '!S/Finished')).toBeTruthy()
    })

    it('syncs task completions with hiding', async function() {
      await h.reset()
      // create a task
      const task_id = await h.addTask('gtasks-gmail-1')
      // complete and hide
      await h.patchTask(
        task_id,
        'gtasks-gmail-1 #project_1 #project_2',
        '!next',
        null,
        true,
        true
      )
      await h.syncList(false, true)
      const data = h.sync.data.data
      expect(data).toHaveLength(1)
      const refresh = await h.getThread(data[0].gmail_id)
      const task = await h.getTask(task_id)
      expect(task.hidden).toBeFalsy()
      expect(h.hasLabel(refresh, '!S/Finished')).toBeTruthy()
    })

    it('syncs missing threads', async function() {
      await h.reset()
      // add 2 tasks
      await Promise.all([
        h.addTask('gtasks-gmail-1'),
        h.addTask('gtasks-gmail-2')
      ])
      // sync
      await h.syncList(true, true)
      expect(h.sync.data.data).toHaveLength(2)
      // delete one thread
      const thread_1 = (await h.listQuery()).threads[0]
      await h.deleteThread(thread_1.id)
      // sync
      await h.syncList(true, true)
      // check if the deletion propagated
      const [tasks, query] = await Promise.all([
        await h.listTasklist(),
        await h.listQuery()
      ])
      expect(query.threads).toHaveLength(1)
      expect(tasks.items).toHaveLength(1)
    })

    it.skip('syncs tasks removals', function() {})
  })
})

describe('gtasks <=> gmail', function() {
  it('syncs label changes', async function() {
    await h.reset()
    const task_id_1 = await h.addTask('gtasks<->gmail-1')
    // create a new thread
    // thread_id = await gmail_sync.createThread('gmail<->gtasks-2', [
    //   '!S/Next Action'
    // ])
    await h.syncList(true, true)
    const thread_1 = h.gmail_sync.threads.values().next().value
    // remove 1, add 2
    let promise_tasks = h.patchTask(task_id_1, 'gtasks-gmail-1 #project_2')
    // add 3
    let promise_gmail = h.modifyLabels(thread_1.id, ['P/project_3'])
    await Promise.all([promise_tasks, promise_gmail])
    await h.syncList(true, true)
    expect(h.sync.data.data).toHaveLength(1)
    const record = h.sync.data.data[0]
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
