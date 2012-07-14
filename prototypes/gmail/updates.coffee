flow = require '/usr/lib/node_modules/flow'
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

#flow.exec(
#	-> imap.connect @
#	->
#
#		# Event listeners
#		imap.on 'mail', (msg_num) ->
#			console.log "got #{msg_num} new msgs"
#
#		imap.on 'msgupdate', (msg) ->
#			console.log "got updated msg #{msg}"
##			imap.openBox 'INBOX', false,
##				(err, box) ->
##					box.
#
#		imap.openBox "[Gmail]/All Mail", false, @
#	(err, box) ->
#
#		# make a search
#		console.log "searching for a query '#{query}"
#		imap.search [ [ 'X-GM-RAW', query ] ], @
#
#	(err, results) ->
#		fetch = imap.fetch results,
#			request: headers: [ "from", "to", "subject", "date" ]
#
#		fetch.on "message", (msg) ->
#			console.log "Got message: " + util.inspect msg, false, 5
#
#			msg.on "data", (chunk) ->
#				console.log "Got message chunk of size " + chunk.length
#
#			msg.on "end", ->
#				console.log "Finished message: " + util.inspect msg, false, 5
#
#		fetch.on "end", ->
#			console.log "Done fetching all messages!"
##			imap.logout
#)

repl.start(
	  prompt: "repl> "
	  input: process.stdin
	  output: process.stdout
	).context = { imap }

class Gmail
	imap: null
	connection: null
	queries: null

	constructor: (connection) ->
		connection_ctr = ? {
			gmail_username: Str
			gmail_password: Str
			gmail_host: Str?
		}

		@connection :: connection_ctr
		@connection = connection

		query_ctr = ? {
			freq: Num
			query: Str
		}

		@queries :: [...query_ctr]
		@queries = []

		do @connection if @connect()

	connect: flow.define(
		->
			data = @this.connection
			@imap = new ImapConnection
				username: data.gmail_username
				password: data.gmail_password
				host: data.gmail_host or "imap.gmail.com"
				port: 993
				secure: true
			@imap.connect @
		->
			console.log 'c ok'
	)

	addSearch: (query, update = 5) ->
		@queries.push { query, freq: update }
		# TODO settimeout

box = new Gmail settings