import * as delay from 'delay'
import { DBRecord } from '../../src/sync/root'
import { createRawEmail } from '../../src/utils'
// declare module '../data.json' {
//   const records: DBRecord[]
//   export = records
// }
// @ts-ignore
import * as fixtures from '../data.json'
import { Gmail, google, Tasks, Thread } from './mocks'

let gmail: Gmail
let tasks: Tasks
beforeAll(() => {
  gmail = google.gmail('v1')
  tasks = google.tasks('v1')
})
beforeEach(() => {
  gmail.reset()
  tasks.reset()
})

describe('gmail', () => {
  describe('threads', () => {
    it('send email', async () => {
      const raw = createRawEmail(
        {
          from: 'from@com.com',
          to: 'test@gmail.com',
          subject: 'test subject'
        },
        'test content'
      )
      // next action
      await gmail.users.messages.send({
        requestBody: { raw }
      })
      const res = await gmail.users.threads.list({})
      expect(res.data.threads).toHaveLength(1)
      const thread = res.data.threads[0] as Thread
      // mocks-only fields (non GMail API)
      expect(thread.from).toEqual('from@com.com')
      expect(thread.to).toEqual('test@gmail.com')
      expect(thread.subject).toEqual('test subject')
    })
    it('query by a single label', async () => {
      await fixturesToThreads(gmail, fixtures)
      let res
      // next action
      res = await gmail.users.threads.list({
        q: 'label:!s-next-action'
      })
      expect(res.data.threads).toHaveLength(3)
      // action
      res = await gmail.users.threads.list({
        q: 'label:!s-action'
      })
      expect(res.data.threads).toHaveLength(5)
    })
    it('query by multiple labels', async () => {
      debugger
      await fixturesToThreads(gmail, fixtures)
      const res = await gmail.users.threads.list({
        q: 'label:!s-next-action OR label:!s-action'
      })
      expect(res.data.threads).toHaveLength(8)
    })
    it('query an empty data set', async () => {
      await gmail.users.threads.list({
        q: 'label:!s-next-action'
      })
    })
    it('query by a single email', async () => {
      await fixturesToThreads(gmail, fixtures)
      let res = await gmail.users.threads.list({
        q: 'from:from@gmail.com'
      })
      expect(res.data.threads).toHaveLength(13)
      res = await gmail.users.threads.list({
        q: 'to:test@gmail.com'
      })
      expect(res.data.threads).toHaveLength(13)
    })
    it('query by multiple emails', async () => {
      await fixturesToThreads(gmail, fixtures)
      let res = await gmail.users.threads.list({
        q: 'from:from@gmail.com OR to:test@gmail.com'
      })
      expect(res.data.threads).toHaveLength(13)
    })
    it('query by multiple emails without an operator', async () => {
      await fixturesToThreads(gmail, fixtures)
      let res = await gmail.users.threads.list({
        q: 'from:from@gmail.com to:test@gmail.com'
      })
      expect(res.data.threads).toHaveLength(13)
    })
    it("modify thread's labels", async () => {
      // next action
      await fixturesToThreads(gmail, fixtures)
      const list = await gmail.users.threads.list({
        q: 'label:!s-next-action'
      })
      const [label_action, label_next] = gmail.getLabelIDs([
        '!s-action',
        '!s-next-action'
      ])
      const thread = list.data.threads[0] as Thread
      expect(thread.labelIds).toContain(label_next)
      await gmail.users.threads.modify({
        id: thread.id,
        requestBody: {
          addLabelIds: [label_action],
          removeLabelIds: [label_next]
        }
      })
      const get = await gmail.users.threads.get({
        id: thread.id
      })
      expect(get.data.labelIds).toContain(label_action)
      expect(get.data.labelIds).not.toContain(label_next)
    })
    it('delete a thread', async () => {
      await fixturesToThreads(gmail, fixtures)
      const list = await gmail.users.threads.list({})
      await gmail.users.threads.delete({
        id: list.data.threads[0].id
      })
      const list2 = await gmail.users.threads.list({})
      expect(list.data.threads.length - list2.data.threads.length).toEqual(1)
    })
  })
  describe('labels', () => {
    it('list labels', async () => {
      await fixturesToThreads(gmail, fixtures)
      const list = await gmail.users.labels.list({})
      expect(list.data.labels).toHaveLength(15)
    })
    it('patch a label', async () => {
      await fixturesToThreads(gmail, fixtures)
      const list = await gmail.users.labels.list({})
      const id = list.data.labels[0].id
      const name = 'foo'
      await gmail.users.labels.patch({
        id,
        requestBody: {
          name
        }
      })
      const get = await gmail.users.labels.get({ id })
      expect(get.data.name).toEqual(name)
    })
  })
})

describe('tasks', () => {
  it('list tasks', async () => {
    await fixturesToTasks(tasks, fixtures)
    const res_lists = await tasks.tasklists.list({})
    expect(res_lists.data.items).toHaveLength(3)

    const res_tasks = await tasks.tasks.list({
      tasklist: res_lists.data.items[0].id
    })
    expect(res_tasks.data.items).toHaveLength(5)
  })
  it('patch a task', async () => {
    await fixturesToTasks(tasks, fixtures)
    const res_lists = await tasks.tasklists.list({})
    const tasklist = res_lists.data.items[0].id
    let res_tasks = await tasks.tasks.list({
      tasklist
    })
    let task = res_tasks.data.items[0]
    const title = Math.random().toString()
    const old_updated = task.updated
    // delay to assert the updated date
    await delay(1)
    tasks.tasks.patch({
      tasklist,
      task: task.id,
      requestBody: {
        title
      }
    })
    // re-read
    res_tasks = await tasks.tasks.list({
      tasklist
    })
    task = res_tasks.data.items[0]
    // assert
    expect(task.title).toEqual(title)
    expect(task.updated).not.toEqual(old_updated)
  })
  it('patch a list', async () => {
    await fixturesToTasks(tasks, fixtures)
    const res_lists = await tasks.tasklists.list({})
    let tasklist = res_lists.data.items[0]
    const title = Math.random().toString()
    const old_updated = tasklist.updated
    // delay to assert the updated date
    await delay(1)
    tasks.tasklists.patch({
      tasklist: tasklist.id,
      requestBody: {
        title
      }
    })
    // re-read
    const res_list = await tasks.tasklists.get({
      tasklist: tasklist.id
    })
    tasklist = res_list.data
    // assert
    expect(tasklist.title).toEqual(title)
    expect(tasklist.updated).not.toEqual(old_updated)
  })
  it('remove tasklist', async () => {
    await fixturesToTasks(tasks, fixtures)
    const list = await tasks.tasklists.list({})
    const tasklist = list.data.items[0].id
    await tasks.tasklists.delete({
      tasklist
    })
    const list2 = await tasks.tasklists.list({})
    expect(list.data.items.length - list2.data.items.length).toEqual(1)
    // TODO assert all the lists tasks have been deleted too
  })
  it.skip('remove task', () => {})
})

async function fixturesToThreads(gmail: Gmail, data: DBRecord[]) {
  for (const row of data) {
    const raw = createRawEmail(
      {
        // TODO parse "From gtd.bot.sandbox+letter@gmail.com"
        from: 'from@gmail.com',
        to: 'test@gmail.com',
        subject: row.title
      },
      row.content
    )
    // next action
    await gmail.users.messages.send({
      requestBody: { raw, labelIds: gmail.getLabelIDs(Object.keys(row.labels)) }
    })
  }
}

async function fixturesToTasks(tasks: Tasks, data: DBRecord[]) {
  const lists = ['!S/Action', '!S/Next Action', '!S/Pending']
  const list_ids = new Map<string, string>()
  // create the lists
  for (const title of lists) {
    const res = await tasks.tasklists.insert({
      requestBody: {
        title
      }
    })
    list_ids.set(title, res.data.id)
  }
  // insert the tasks
  for (const row of data) {
    // check if tasks is in any of the predefined lists
    const list_title = lists.find(title => {
      return row.labels[title] && row.labels[title].active
    })
    if (!list_title) {
      continue
    }
    tasks.tasks.insert({
      requestBody: {
        title: row.title
      },
      tasklist: list_ids.get(list_title)
    })
  }
}
