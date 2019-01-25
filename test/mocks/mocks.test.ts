import { Thread } from './mocks'
import { google, Gmail, Tasks } from './mocks'
import { DBRecord } from '../../src/sync/root'
// declare module '../data.json' {
//   const records: DBRecord[]
//   export = records
// }
// @ts-ignore
import * as data from '../data.json'
import { createRawEmail } from '../../src/utils'

let gmail: Gmail
let tasks: Tasks
beforeEach(() => {
  gmail = google.gmail('v1')
  tasks = google.tasks('v1')
})

describe('gmail', () => {
  it('query by labels', async () => {
    await fixturesToThreads(gmail, data)
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
  it('modify labels', async () => {
    // next action
    await fixturesToThreads(gmail, data)
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
  // TODO test labels.patch
})

describe('tasks', () => {
  it('list tasks', async () => {
    await fixturesToTasks(tasks, data)
    const res_lists = await tasks.tasklists.list({})
    expect(res_lists.data.items).toHaveLength(3)

    const res_tasks = await tasks.tasks.list({
      tasklist: res_lists.data.items[0].id
    })
    expect(res_tasks.data.items).toHaveLength(5)
  })
  it('modify a task', async () => {
    await fixturesToTasks(tasks, data)
    const res_lists = await tasks.tasklists.list({})
    const res_tasks = await tasks.tasks.list({
      tasklist: res_lists.data.items[0].id
    })
    tasks.tasks.patch({tasklist: })
    expect(res_tasks.data.items).toHaveLength(5)
  })
  it.skip('modify a list', async () => {})
})

async function fixturesToThreads(gmail: Gmail, data: DBRecord[]) {
  for (const row of data) {
    const raw = createRawEmail(
      {
        // TODO parse "From gtd.bot.sandbox+letter@gmail.com"
        from: 'from@gmail.com',
        to: 'test@gmail.com',
        subject: 'test subject'
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
