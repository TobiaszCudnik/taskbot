import credentials from '../config-private'
import config from '../config'
import * as readline from 'readline'
import { OAuth2Client } from 'google-auth-library'

const oauth2Client = new OAuth2Client(
  credentials.google.client_id,
  credentials.google.client_secret,
  credentials.google.redirect_url
)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// generate consent page url
const url = oauth2Client.generateAuthUrl({
  access_type: 'offline', // will return a refresh token
  scope: config.google.scopes
})

console.log('Visit the url: ', url + '&approval_prompt=force')
rl.question('Enter the code here:', function(code) {
  // request access token
  oauth2Client.getToken(code, function(err, tokens) {
    // set tokens to the client
    // TODO: tokens should be set by OAuth2 client.
    if (err) {
      console.error(err)
    }
    console.log(tokens)
    process.exit()
  })
})
