googleapis = require('googleapis');
env = require './env'

oauth2 = new googleapis.OAuth2Client(
	env.CLIENT_ID, env.CLIENT_SECRET, "postmessage")
jwt = new googleapis.auth.JWT(
	env.SERVICE_ACCOUNT_EMAIL, env.SERVICE_ACCOUNT_KEY_FILE, null,
	["https://www.googleapis.com/auth/tasks"])

googleapis.discover("tasks", "v1").execute (err, data) ->
  client = data
  jwt.authorize (err, result) ->
    oauth2.setCredentials access_token: result.access_token
    client.tasks.tasklists.list().withAuthClient(oauth2).execute (err, body) ->
	      console.log body.items
