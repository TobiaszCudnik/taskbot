import * as firebase from 'firebase-admin'
import { argv } from 'yargs'
import config from '../config-private'
import { bulkAcceptInvites, TInvitation } from '../src/server/google-auth'
import * as moment from 'moment-timezone'
import * as randomId from 'simple-random-id'

start()
async function start() {
  const accounts = parseInt(argv.accounts, 10)
  if (!accounts) {
    return console.error('--accounts missing')
  }
  if (accounts < 1) {
    return console.error('--accounts has to be > 1')
  }

  const db = firebase.initializeApp({
    credential: firebase.credential.cert(config.firebase.admin),
    databaseURL: config.firebase.url
  })
  const code = randomId(15)
  const invitation: TInvitation = {
    remaining: accounts,
    created: moment().utc().toISOString()
  }
  await db.database().ref(`/invitations/${code}`).set(invitation)
  console.log(`Created an invite ${code} for ${accounts} accounts`)
  process.exit()
}
