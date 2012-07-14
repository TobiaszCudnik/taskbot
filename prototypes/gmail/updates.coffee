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

# TODO add event emitter
class BaseClass
	repl: ->
		repl.start(
			  prompt: "repl> "
			  input: process.stdin
			  output: process.stdout
			  context: { foo: @ }
			).context = { foo: @ }

	log: -> console.log.apply arguments

###
TODO emit:
- new-msg msg
- changed-label {msg, new_labels, removed_labels}
###
class Gmail extends BaseClass
	imap: null
	connection: null
	queries: null
	monitored_ : []

	constructor: (connection, next) ->
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

#			if @connection then @connect @ else @
		@connect next

#		do @repl

	connect: flow.define(
		(@next) ->
			console.log 'connecting'
			data = @this.connection
			@this.imap = new ImapConnection
				username: data.gmail_username
				password: data.gmail_password
				host: data.gmail_host or "imap.gmail.com"
				port: 993
				secure: true
			@this.imap.connect @
		->
			@this.imap.openBox "[Gmail]/All Mail", false, @next
	)

	addSearch: (query, update = 5) ->
		console.log "adding a new search #{query}"
		@queries.push { query, freq: update }
		# TODO extract check
		check = => @fetchQuery query
		# TODO use refresh manager with search request throttling
		setInterval check, update*1000
		do check

	fetchQuery: flow.define(

		(query) ->
			@this.log 'performing a search'
			@this.imap.search [ [ 'X-GM-RAW', query ] ], @

		(err, results) ->
			# TODO labels
			@this.log 'got search results'
			content = headers: [ "id", "from", "to", "subject", "date" ]
			fetch = @this.imap.fetch results, content

			fetch.on "message", (msg) =>
#					msg.on "data", (chunk) =>
#						console.log "Got message chunk of size " + chunk.length
				msg.on "end", =>
#						console.log "Finished message: " + util.inspect msg, false, 5
					if !~ @this.monitored_.indexOf msg.id
						console.log 'new msg'
						@this.monitored_.push msg.id
#					else
#						# TODO compare labels
#						# TODO check new msgs in the thread
	)

	close: -> @imap.logout

box = null

flow.exec(
	-> box = new Gmail settings, @
	-> box.addSearch '*'
)
setTimeout box.close.bind box, 20
