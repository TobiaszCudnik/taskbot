import { Thread } from '../mocks'
import { google, Gmail } from './mocks'
import { DBRecord } from '../../src/sync/root'
// declare module '../data.json' {
//   const records: DBRecord[]
//   export = records
// }
import * as data from '../data.json'
import { createRawEmail } from '../../src/utils'

let gmail: Gmail
beforeEach(() => {
  gmail = google.gmail('v1')
})

describe('gmail', () => {
  it('query by labels', async () => {
    await readFixture(gmail, data)
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
})

async function readFixture(gmail: Gmail, data: DBRecord[]) {
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
