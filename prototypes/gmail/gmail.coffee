flow = require 'flow'
settings = require '../../settings'
{ ImapConnection } = require("imap")
util = require("util")
imap = new ImapConnection
	username: settings.gmail_username
	password: settings.gmail_password
	host: settings.gmail_host or "imap.gmail.com"
	port: 993
	secure: true

#query = '( label:drafts OR label:s-pending ) -label:s-expired -label:s-finished'
query = 'label:T-foo -label:T-test'

flow.exec(
	-> imap.connect @
	-> imap.openBox "[Gmail]/All Mail", false, @
	(box) -> imap.search [ [ 'X-GM-RAW', query ] ], @
	(results) ->
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
			imap.logout
)