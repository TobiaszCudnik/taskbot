do require 'better-require'
readline = require("readline")
google = require("googleapis")
OAuth2Client = google.auth.OAuth2
tasks = google.tasks("v1")
env = require './env'
oauth2Client = new OAuth2Client(env.CLIENT_ID, env.CLIENT_SECRET, env.REDIRECT_URL)
rl = readline.createInterface(
	input: process.stdin
	output: process.stdout
)

# generate consent page url
#url = oauth2Client.generateAuthUrl(
#	access_type: "offline" # will return a refresh token
#	approval_prompt: "force"
#	scope: [
#		"https://www.googleapis.com/auth/plus.me",
#		"https://www.googleapis.com/auth/tasks"
#	]
#)
#console.log "Visit the url: ", url
#rl.question "Enter the code here:", (code) ->

	# request access token
#	oauth2Client.getToken code, (err, tokens) ->

# set tokens to the client
# TODO: tokens should be set by OAuth2 client.
oauth2Client.setCredentials
	access_token: env.ACCESS_TOKEN
	refresh_token: env.REFRESH_TOKEN

# retrieve user profile
tasks.tasklists.list auth: oauth2Client, (err, ret) ->
	console.log ret
