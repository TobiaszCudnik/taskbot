///<reference path="../typings/index.d.ts"/>

import * as debug from 'debug'
import createHelpers from './helpers'

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

describe(`sync (sync_type: ${scenario})`, function() {
  it('syncs label changes', async function() {
    h.log('\n\nsyncs label changes')
    await h.reset()
    const task_id_1 = await h.addTask('gtasks<->gmail-1')
    // create a new thread
    // thread_id = await gmail_sync.createThread('gmail<->gtasks-2', [
    //   '!S/Next Action'
    // ])
    await h.syncList()
    const thread_1 = h.gmail_sync.threads.values().next().value
    // remove 1, add 2
    let promise_tasks = h.patchTask(task_id_1, {
      title: 'gtasks-gmail-1 #project_2'
    })
    // add 3
    let promise_gmail = h.modifyLabels(thread_1.id, ['P/project_3'])
    await Promise.all([promise_tasks, promise_gmail])
    await h.syncListScenario(scenario)
    expect(h.sync.data.data).toHaveLength(1)
    const record = h.sync.data.data[0]
    expect(record.labels).toMatchObject({
      '!S/Next Action': { active: true },
      'P/project_2': { active: true },
      'P/project_3': { active: true }
    })
  })
  it.skip('syncs notes', function() {})
  it('new status removes the old one', async function() {
    h.log('\n\nnew status removes the old one')
    await h.reset()
    const thread_id_1 = await h.gmail_sync.createThread('sync-1', [
      '!S/Next Action'
    ])
    const thread_id_2 = await h.gmail_sync.createThread('sync-2', [
      '!S/Next Action'
    ])
    await h.syncList()
    // add !S/Action
    await h.req('gmail.users.threads.modify', {
      id: thread_id_1,
      userId: 'me',
      fields: 'id',
      resource: {
        addLabelIds: [h.labelID('!S/Finished')]
      }
    })
    // add !S/Expired
    await h.req('gmail.users.threads.modify', {
      id: thread_id_2,
      userId: 'me',
      fields: 'id',
      resource: {
        addLabelIds: [h.labelID('!S/Expired')]
      }
    })
    await h.syncListScenario(scenario)
    // assert
    expect(h.sync.data.data).toHaveLength(2)
    const record_1 = h.gmail_sync.getRecordByGmailID(thread_id_1)
    expect(record_1.labels).toMatchObject({
      '!S/Next Action': { active: false },
      '!S/Finished': { active: true },
    })
    const record_2 = h.gmail_sync.getRecordByGmailID(thread_id_2)
    expect(record_2.labels).toMatchObject({
      '!S/Next Action': { active: false },
      '!S/Expired': { active: true },
    })
  })
})
