///<reference path="../typings/index.d.ts"/>

import * as debug from 'debug'
import * as google from 'googleapis'
import createHelpers from './helpers'

const scenario = parseInt(process.env['SCENARIO'], 10) || 0
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
  if (h) {
    h.printDB()
  }
})

describe(`gtasks (sync_type: ${scenario})`, function() {
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
    await h.syncList()
    const list = h.gtasks_sync.getListByName('!next')
    expect(list.shouldRead()).toBeFalsy()
    list.state.add('Dirty')
    expect(list.shouldRead()).toBeTruthy()
  })

  // TODO
  it.skip('re-adds the list in case it disappears', async function() {
    const list = h.gtasks_sync.getListByName('!next')
    await h.req('gtasks.tasklists.delete', {
      tasklist: list.list.id
    })
    const last_read = list.last_read_end.unix()
    await h.syncList(false, true)
    expect(list.last_read_end.unix()).toBeGreaterThan(last_read)
  })

  it(
    'un-hides a task after its completion',
    async function() {
      await h.reset()
      const id = await h.addTask('test1')
      await h.syncList(false, true)
      await h.patchTask(id, {
        hidden: true,
        status: 'needsAction'
      })
      await h.syncListScenario(scenario)
      const task = await h.getTask(id)
      expect(task.hidden).toBeFalsy()
    }
  )

  describe.skip('db', function() {
    it('syncs new tasks', async function() {})
    it('syncs tasks removalsa', function() {})
  })

  describe('gmail', function() {
    it(
      'creates emails from new tasks',
      async function() {
        await h.reset()
        await h.addTask('gtasks-gmail-1')
        // sync
        await h.syncListScenario(scenario)
        const list = await h.listQuery('label:!s-next-action')
        // assert
        debugger
        expect(list.threads).toHaveLength(1)
        for (const field of ['historyId', 'id']) {
          expect(Object.keys(list.threads[0])).toContain(field)
        }
      }
    )

    it(
      'sync back gmail_ids to the new tasks',
      async function() {
        await h.reset()
        const task_id = await h.addTask('gtasks-gmail-1')
        // sync
        await h.syncListScenario(scenario)
        // TODO download in parallel
        const list = await h.listQuery('label:!s-next-action')
        const task = await h.getTask(task_id)
        const gmail_id = h.sync.data.data[0].gmail_id
        // assert
        expect(list.threads).toHaveLength(1)
        for (const field of ['historyId', 'id']) {
          expect(Object.keys(list.threads[0])).toContain(field)
        }
        expect(task.notes).toMatch(gmail_id)
        // TODO assert the email link
      }
    )

    it('syncs text labels', async function() {
      await h.reset()
      const wait = [
        h.addTask('gtasks-gmail-2 #project_1'),
        h.addTask('gtasks-gmail-1 #project_2 #project_3')
      ]
      await Promise.all(wait)
      // sync
      await h.syncListScenario(scenario)
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

    it(
      'syncs text labels for non-existing gmail labels',
      async function() {
        await h.reset()
        await h.addTask('gtasks-gmail-1 #project_4')
        // sync
        await h.syncListScenario(scenario)
        // assert
        const list = await h.listQuery('label:!s-next-action')
        expect(list.threads).toHaveLength(1)
        const thread_1 = await h.getThread(list.threads[0].id)
        expect(h.hasLabel(thread_1, 'P/project_4'))
      }
    )

    it(
      'syncs tasks between lists',
      async function() {
        await h.reset()
        const task_id = await h.addTask('gtasks-gmail-1')
        // sync
        await h.syncList(false, true)
        const task = await h.getTask(task_id)
        // move the task TODO parallel
        // delete the old ask from !next
        await h.deleteTask(task_id)
        // and add a copy to !actions
        await h.addTask('gtasks-gmail-1', '!actions', task.notes)
        // mark !actions and !next as Dirty
        h.gtasks_sync.getListByName('!actions').state.add('Dirty')
        await h.syncListScenario(scenario)
        // assert
        const threads = [...h.gmail_sync.threads.values()]
        expect(threads).toHaveLength(1)
        expect(h.hasLabel(threads[0], '!S/Action')).toBeTruthy()
      }
    )

    it(
      'syncs tasks between lists when only one is being synced',
      async function() {
        await h.reset()
        const task_id = await h.addTask('gtasks-gmail-1')
        // sync
        await h.syncList(false, true)
        const task = await h.getTask(task_id)
        // move the task TODO parallel
        // delete the old ask from !next
        await h.deleteTask(task_id)
        // and add a copy to !actions
        await h.addTask('gtasks-gmail-1', '!actions', task.notes)
        // sync having only !next as Dirty
        await h.syncListScenario(scenario)
        // assert
        const threads = [...h.gmail_sync.threads.values()]
        expect(threads).toHaveLength(1)
        expect(h.hasLabel(threads[0], '!S/Action')).toBeTruthy()
      }
    )

    it(
      'syncs task completions',
      async function() {
        await h.reset()
        const task_id = await h.addTask('gtasks-gmail-1')
        await h.patchTask(task_id, {
          title: 'gtasks-gmail-1 #project_1 #project_2',
          status: 'completed'
        })
        await h.syncListScenario(scenario)
        const data = h.sync.data.data
        expect(data).toHaveLength(1)
        const refresh = await h.getThread(data[0].gmail_id)
        expect(h.hasLabel(refresh, '!S/Finished')).toBeTruthy()
      }
    )

    it(
      'syncs task completions with hiding',
      async function() {
        await h.reset()
        // create a task
        const task_id = await h.addTask('gtasks-gmail-1')
        // complete and hide
        await h.patchTask(task_id, {
          title: 'gtasks-gmail-1 #project_1 #project_2',
          status: 'completed',
          hidden: true
        })
        await h.syncListScenario(scenario)
        const data = h.sync.data.data
        expect(data).toHaveLength(1)
        const refresh = await h.getThread(data[0].gmail_id)
        const task = await h.getTask(task_id)
        expect(task.hidden).toBeFalsy()
        expect(h.hasLabel(refresh, '!S/Finished')).toBeTruthy()
      }
    )

    // TODO check
    it('syncs missing threads', async function() {
      await h.reset()
      // add 2 tasks
      await Promise.all([
        h.addTask('gtasks-gmail-1'),
        h.addTask('gtasks-gmail-2')
      ])
      // sync
      await h.syncList()
      expect(h.sync.data.data).toHaveLength(2)
      // delete one thread
      const thread_1 = (await h.listQuery()).threads[0]
      await h.deleteThread(thread_1.id)
      // sync
      await h.syncListScenario(scenario)
      // check if the deletion propagated
      const [tasks, query] = await Promise.all([
        await h.listTasklist(),
        await h.listQuery()
      ])
      expect(query.threads).toHaveLength(1)
      expect(tasks.items).toHaveLength(1)
    })

    it(
      'syncs missing threads between lists',
      async function() {
        await h.reset()
        // add 2 tasks
        await Promise.all([
          h.addTask('gtasks-gmail-1'),
          h.addTask('gtasks-gmail-2', '!actions')
        ])
        // sync
        h.gtasks_sync.getListByName('!actions').state.add('Dirty')
        await h.syncList()
        expect(h.sync.data.data).toHaveLength(2)
        // delete one thread
        const thread_1 = (await h.listQuery()).threads[0]
        await h.deleteThread(thread_1.id)
        // sync
        await h.syncListScenario(scenario)
        // check if the deletion propagated
        const [tasks, tasks_actions, query, query_actions] = await Promise.all([
          await h.listTasklist(),
          await h.listTasklist('!actions'),
          await h.listQuery(),
          await h.listQuery('label:!s-action')
        ])
        expect(query.threads || []).toHaveLength(0)
        expect(query_actions.threads || []).toHaveLength(1)
        expect(tasks.items || []).toHaveLength(0)
        expect(tasks_actions.items || []).toHaveLength(1)
      }
    )

    // TODO reproduce the manual scenario
    // should fail without the last condition for 'threads to close'
    it('syncs un-completions', async function() {
      await h.reset()
      // add a task
      const id = await h.addTask('gtasks-gmail-1')
      // sync
      await h.syncList(false, true)
      // complete & hide
      await h.patchTask(id, {
        status: 'completed',
        hidden: true
      })
      // sync
      await h.syncList(false, true)
      // un-complete
      await h.patchTask(id, {
        status: 'needsAction',
        completed: null
      })
      // sync
      await h.syncListScenario(scenario)
      const [tasks, query] = await Promise.all([
        await h.listTasklist(),
        await h.listQuery()
      ])
      expect(query.threads || []).toHaveLength(1)
      expect(tasks.items || []).toHaveLength(1)
    })

    it.skip('syncs tasks removals', function() {})
  })
})
