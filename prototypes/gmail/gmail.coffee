flow = require 'flow'
settings = require '../../settings'
{ ImapConnection } = require("imap")
util = require("util")
repl = require 'repl'

imap = new ImapConnection
	username: settings.gmail_username
	password: settings.gmail_password
	host: settings.gmail_host or "imap.gmail.com"
	port: 993
	secure: true

#query = '( label:drafts OR label:s-pending ) -label:s-expired -label:s-finished'
query = '*'

flow.exec(
	-> imap.connect @
	->

		# Event listeners
		imap.on 'mail', (msg_num) ->
			console.log "got #{msg_num} new msgs"

		imap.on 'msgupdate', (msg) ->
			console.log "got updated msg #{msg}"
#			imap.openBox 'INBOX', false,
#				(err, box) ->
#					box.

		imap.openBox "[Gmail]/All Mail", false, @
	(err, box) ->

		# make a search
		console.log "searching for a query '#{query}"
		imap.search [ [ 'X-GM-RAW', query ] ], @

	(err, results) ->
		fetch = imap.fetch results,
			request: headers: [ "from", "to", "subject", "date" ]

		fetch.on "message", (msg) ->
			console.log "Got message: " + util.inspect msg, false, 5

			msg.on "data", (chunk) ->
				console.log "Got message chunk of size " + chunk.length

			msg.on "end", ->
				console.log "Finished message: " + util.inspect msg, false, 5

		fetch.on "end", ->
			console.log "Done fetching all messages!"
#			imap.logout
)

repl.start(
	  prompt: "repl> "
	  input: process.stdin
	  output: process.stdout
	).context = { imap }

###
Live events
-----------
- msgupdate
	Msg props changed from external connection
- deleted
- mail
	New email
###