/**
 * Copyright 2012 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const credentials = require('../../../config-credentials').default
const config = require('../../../config').default

var readline = require('readline')

var google = require('googleapis')
var OAuth2Client = google.auth.OAuth2

var oauth2Client = new OAuth2Client(
  credentials.google.client_id,
  credentials.google.client_secret,
  credentials.google.redirect_url
)

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// generate consent page url
var url = oauth2Client.generateAuthUrl({
  access_type: 'offline', // will return a refresh token
  scope: config.google.scopes
})

console.log('Visit the url: ', url + '&approval_prompt=force')
rl.question('Enter the code here:', function(code) {
  // request access token
  oauth2Client.getToken(code, function(err, tokens) {
    // set tokens to the client
    // TODO: tokens should be set by OAuth2 client.
    if (err) console.error(err)
    console.log(tokens)
    oauth2Client.credentials = tokens
  })
})
