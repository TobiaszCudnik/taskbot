Promise = require 'when'
settings = require '../../settings'
{ ImapConnection } = require("imap")
util = require("util")
imap = new ImapConnection
	username: settings.gmail_username
	password: settings.gmail_password
	host: settings.gmail_host or "imap.gmail.com"
	port: 993
	secure: true

deferred = Promise.defer()
promise = deferred.promise

imap.connect -> deferred.resolve()

promise.then ->
	imap.openBox "[Gmail]/All Mail", false, ->
		deferred.resolve()

promise.then ->
	search_query = '( label:drafts OR label:s-pending ) -label:s-expired -label:s-finished'
	imap.search [ [ 'X-GM-RAW', search_query ] ], ->
		deferred.resolve results

promise.then (results) ->
	fetch = imap.fetch(results,
		request:
			headers: [ "from", "to", "subject", "date" ]
	)
	fetch.on "message", (msg) ->
		console.log "Got message: " + util.inspect(msg, false, 5)
		msg.on "data", (chunk) ->
			console.log "Got message chunk of size " + chunk.length

		msg.on "end", ->
			console.log "Finished message: " + util.inspect(msg, false, 5)

	fetch.on "end", ->
		console.log "Done fetching all messages!"
		imap.logout cb

#cmds = [ ->
#	imap.connect cb
#, ->
#	imap.openBox "[Gmail]/All Mail", false, cb
#, (result) ->
#	box = result
#	imap.search [ [ 'X-GM-RAW', '( label:drafts OR label:s-pending ) -label:s-expired -label:s-finished' ] ], cb
#, (results) ->
#	fetch = imap.fetch(results,
#		request:
#			headers: [ "from", "to", "subject", "date" ]
#	)
#	fetch.on "message", (msg) ->
#		console.log "Got message: " + util.inspect(msg, false, 5)
#		msg.on "data", (chunk) ->
#			console.log "Got message chunk of size " + chunk.length
#
#		msg.on "end", ->
#			console.log "Finished message: " + util.inspect(msg, false, 5)
#
#	fetch.on "end", ->
#		console.log "Done fetching all messages!"
#		imap.logout cb
# ]
#cb()