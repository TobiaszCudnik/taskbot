///<reference path="../typings/index.d.ts"/>

import { promisifyArray } from 'typed-promisify-tob/index'
import Connections from '../src/app/connections'
import Logger from '../src/app/logger'
import { getConfig } from '../src/app/config'
import * as google from 'googleapis'
import users from '../config-users'
import RootSync from '../src/sync/root'

// console.dir(users)
// debugger
// const auth = new Auth(getConfig(users[0].google), users[0].user.id, new Logger())
// console.log(google.tasks)
// const tasks_api = new google.tasks.v1.Tasks

let gtasks: google.tasks.v1.Tasks
let gmail: google.gmail.v1.Gmail
let auth

beforeAll(async function before() {
  const logger = new Logger()
  const connections = new Connections(logger)
  const sync = new RootSync(getConfig(users[0]), logger, connections)
  sync.state.addNext('Enabled')
  await sync.state.when('Ready')
  auth = sync.subs.google.auth

  gtasks = connections.apis.gtasks
  gmail = connections.apis.gmail

  console.log('connected')

  await Promise.all(
    ['label:all', 'label:trash'].map(async query => await clean(query))
  )
}, 10*1000)

async function api(method: string, params = {}, options = {}) {
  params.auth = auth.client
  void (gmail, gtasks)
  console.log(method)
  debugger
  const ret = await promisifyArray(eval(method))(params, options)
  return ret
}

async function clean(query) {
  console.log('clean', query)
  const [body, res] = await api('gmail.users.threads.list', {
    maxResults: 1000,
    q: query,
    userId: 'me',
    fields: 'nextPageToken,threads(historyId,id)'
  })

  const threads = body.threads || []
  await Promise.all(
    threads.map(
      async thread =>
        await api('gmail.users.threads.delete', { id: thread.id, userId: 'me' })
    )
  )
}

test('test1', function(cb) {
  expect(1).toEqual(1)
  cb()
})
