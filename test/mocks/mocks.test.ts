import { google, Gmail } from './mocks'

describe('gmail', () => {
  let gmail: Gmail
  beforeEach(() => {
    gmail = google.gmail('v1')
    // TODO labels
    gmail.addThread('from@gmail.com', 'subject', ['test1', 'test2'], ['S/Next Action'])
  })
  it('returns query results', async () => {
    const res = await gmail.users.threads.list({
      maxResults: 1000,
      q: 'label:s-next-action',
      // fields: 'nextPageToken,threads(historyId,id)'
    })
    expect(res.data.threads).toHaveLength(1)
    console.log(res)
    console.dir(gmail.threads)
    console.dir(gmail.labels)
    return res.data
  })
})
