import { google, Gmail } from './mocks'
import { DBRecord } from '../../src/sync/root'
// declare module '../data.json' {
//   const records: DBRecord[]
//   export = records
// }
import * as data from '../data.json'

describe('gmail', () => {
  let gmail: Gmail
  beforeEach(() => {
    gmail = google.gmail('v1')
    let row: DBRecord
    for (row of data) {
      gmail.addThread(
        'from@gmail.com',
        row.content,
        ['test1', 'test2'],
        Object.keys(row.labels)
      )
    }
  })
  it('returns query results', async () => {
    const res = await gmail.users.threads.list({
      q: 'label:!s-next-action'
    })
    expect(res.data.threads).toHaveLength(3)
  })
})
