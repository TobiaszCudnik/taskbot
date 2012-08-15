#require 'longjohn'
flow = require 'flow'
def = flow.define
ex = flow.exec
root_path = if __dirname.indexOf 'build' then '../../../' else '../../'
contracts = ~__dirname.indexOf '-ctrs'
settings = require "#{root_path}settings"
{ ImapConnection } = require "imap"
util = require "util"
repl = require 'repl'
Promise = require 'when'
if contracts 
	{
		GmailCtr
		GmailManagerCtr
	} = require './updates_contracts'
prop = require('jsprops').property
require 'sugar'

imap = new ImapConnection
	username: settings.gmail_username
	password: settings.gmail_password
	host: settings.gmail_host or "imap.gmail.com"
	port: 993
	secure: true

# TODO add event emitter
class BaseClass
	repl: ->
		repl = repl.start(
				prompt: "repl> "
				input: process.stdin
				output: process.stdout
			)
		repl.context.this = @

	log: -> console.log.apply console, arguments

# TODO config
Object.merge settings, gmail_max_results: 300

###
TODO emit:
- new-msg msg
- changed-label {msg, new_labels, removed_labels}
###
class Gmail extends BaseClass

	class Channel
		name: ""
		active: yes
		last_update: 0
		update_interval: 10*1000
		manager: null
		
		constructor: (@manager, @name = "noname", update_interval = null) ->
		cmd: null,
						
		connection: ->
			@queue().push Promise.defer()
			@queue()[-1..-1]

	# Singleton manager
	manager: null
	@Manager: class GmailManager
		# TODO mixin BaseClass (staticaly include)
		@log: -> console.log.apply console, arguments
		@locked: no
		@channels: prop('channels', null, [])

		@createChannel: (name, update_interval) ->
			@log "creating channel '#{name}' (#{update_interval})"
			@channels().push new Channel this, name, update_interval
			# return the last channel
			@channels()[ @channels().length-1 ].foo = 'bar'
			@channels()[-1..-1][0]
						
		# basic schedule implementation
		@activate: -> 
			return if @locked
			@locked = yes
			channel = @channels().sortBy("last_update").first()
			@log channel
			if @cursor_ >= @channels().length
				@cursor_ = 0
			# get promise resolvals for the interval and the request
			resolve = (Promise.defer().promise.resolve for i in [0, 1])
			setTimeout resolve[0], @minInterval
			# run channels command
			channel.cmd resolve[1]
			# run activate once more after above promises are fulfilled
			Promise.all(resolve).then @activate.bind @
						
		@minInterval_: ->
			Math.min ch.update_interval for ch in @channels

	imap: null
	connection: null
	queries: null
	monitored_ : []

	constructor: (@connection, next) ->
		@manager :: GmailManagerCtr
		@manager = @constructor.Manager
				
		@connection ::
			gmail_username: Str
			gmail_password: Str
			gmail_host: Str?
		@connection = @connection

		query_ctr = ? {
			freq: Num
			query: Str
		}

		@queries :: [...query_ctr]
		@queries = []

#			if @connection then @connect @ else @
		@connect next

		do @repl if settings.repl

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
		channel = @manager.createChannel query, update*1000
		channel.cmd = (next) =>
			@log "Running command for the channel #{query}"
			@fetchQuery query, channel.connection, =>
				promise = @fetchQuery2_ arguments
				promise.then =>
					next()
					# TODO later
					# @emit "query-fetched"
		@manager.activate()

	fetchQuery: (query, connection, next) ->
		@log "performing a search for #{query}"
		connection.then =>
			@imap.search [ [ 'X-GM-RAW', query ] ], next

	fetchQuery2_: (err, results) ->
		# TODO labels
		@log 'got search results'
		content = headers: [ "id", "from", "to", "subject", "date" ]
		fetch = @imap.fetch results, content

		deferred = Promise.defer()
		fetch.on "message", (msg) =>
#					msg.on "data", (chunk) =>
#						@log "Got message chunk of size " + chunk.length
			msg.on "end", =>
				@log "Finished message: " + util.inspect msg, false, 5
				if !~ @monitored_.indexOf msg.id
					# TODO event
					@log 'new msg'
					@monitored_.push msg.id
					# TODO later
					# @emit "new-msg"
#					else
#						# TODO compare labels
#						# TODO check new msgs in the thread
				deferred.resolve msg
		fetch.on "error", (err) =>
			# new Error ???
			deferred.reject err

		# ret
		deferred.promise

	close: -> @imap.logout
		# TODO remove channel from the manager

if contracts
	Gmail.Manager :: GmailManagerCtr
	Gmail.Manager = Gmail.Manager
	
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
