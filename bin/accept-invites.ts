import * as firebase from 'firebase-admin'
import { argv } from 'yargs'
import config from '../config-private'
import { bulkAcceptInvites } from '../src/server/google-auth'

start()
async function start() {
  const amount = parseInt(argv.amount, 10)
  if (!amount) {
    return console.error('--amount missing')
  }
  if (amount < 1) {
    return console.error('--amount has to be > 1')
  }

  const db = firebase.initializeApp({
    credential: firebase.credential.cert(config.firebase.admin),
    databaseURL: config.firebase.url
  })
  const accepted = await bulkAcceptInvites(config, db, amount)
  console.log(`Accepted ${accepted} invites`)
  process.exit()
}
