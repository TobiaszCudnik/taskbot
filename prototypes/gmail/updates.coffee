flow = require '/usr/lib/node_modules/flow'
def = flow.define
ex = flow.exec
settings = require '../../settings'
{ ImapConnection } = require "imap"
util = require "util"
repl = require 'repl'
Promise = require 'when'
{
	GmailCtr
	GmailManagerCtr
} = require './updates_contracts'

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
			).context = { foo: @ }

	log: -> console.log.apply arguments

###
TODO emit:
- new-msg msg
- changed-label {msg, new_labels, removed_labels}
###
class Gmail extends BaseClass

	# TODO some contracts
	@Manager: class GmailManager
		addInstance: (instance) ->
		removeInstance: (instance) ->
		throttle: (connection) ->
			# TODO register to the promise

	imap: null
	connection: null
	queries: null
	monitored_ : []

	constructor: (connection, next) ->
		@connection ::
			gmail_username: Str
			gmail_password: Str
			gmail_host: Str?

		@connection = connection

		query_ctr = ? {
			freq: Num
			query: Str
		}

		@queries :: [...query_ctr]
		@queries = []

#			if @connection then @connect @ else @
		@connect next

		do @repl

	connect: def(
		(@next) ->
			@this.log 'connecting'
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
		@log "adding a new search #{query}"
		@queries.push { query, freq: update }
		# TODO extract check
		channel = @.constructor.Manager.createChannel query
		channel.cmd = =>
			@fetchQuery query, channel.getConnection, @fetchQuery2_
		channel.run()

	fetchQuery: (query, connection, next) ->
		@this.log "performing a search for #{query}"
		connection.then =>
			@this.imap.search [ [ 'X-GM-RAW', query ] ], next

	fetchQuery2_: (err, results) ->
		# TODO labels
		@this.log 'got search results'
		content = headers: [ "id", "from", "to", "subject", "date" ]
		fetch = @this.imap.fetch results, content

		deferred = Promise.defer()
		fetch.on "message", (msg) =>
#					msg.on "data", (chunk) =>
#						@this.log "Got message chunk of size " + chunk.length
			msg.on "end", =>
				@this.log "Finished message: " + util.inspect msg, false, 5
				if !~ @this.monitored_.indexOf msg.id
					# TODO event
					@this.log 'new msg'
					@this.monitored_.push msg.id
#					else
#						# TODO compare labels
#						# TODO check new msgs in the thread
				deferred.resolve msg
		fetch.on "error", (err) =>
			# new Error ???
			deferred.reject err

		deferred.promise

	close: -> @imap.logout

Gmail.Manager :: GmailManagerCtr
Gmail.Manager = Gmail.Manager

# TServer is a contract
# Server is a class
for prop, ctr of GmailCtr.oc
    continue if not Gmail::[prop] or
        prop is 'constructor'
    Gmail::[prop] :: ctr
    Gmail::[prop] = Gmail::[prop]

box = null
ex(
	-> box = new Gmail settings, @
	-> box.addSearch '*'
)
setTimeout box.close.bind box, 20
