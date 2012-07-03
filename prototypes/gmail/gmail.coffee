die = (err) ->
	console.log "Uh oh: " + err
	process.exit 1
{ ImapConnection } = require("imap")
util = require("util")
imap = new ImapConnection(
	username: ""
	password: ""
	host: "imap.gmail.com"
	port: 993
	secure: true
)
box = undefined
cmds = undefined
next = 0
cb = (err) ->
	if err
		die err
	else if next < cmds.length
		cmds[next++].apply this, Array::slice.call(arguments).slice(1)

cmds = [ ->
	imap.connect cb
, ->
	imap.openBox "INBOX", false, cb
, (result) ->
	box = result
	imap.search [ "SEEN", [ "SINCE", "May 20, 2012" ] ], cb
, (results) ->
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
 ]
cb()