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

# TODO config
Object.merge settings, gmail_max_results: 300

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

###
TODO emit:
- new-msg msg
- changed-label {msg, new_labels, removed_labels}
###

class GmailSearch extends BaseClass 
	name: ""
	active: yes
	last_update: 0
	update_interval: 10*1000
	manager: null
	
	constructor: (@manager, @name, update_interval) ->
		@update_interval = update_interval if update_interval
		
	fetch: (next) ->
		@log "performing a search for #{@name}"
		deferred = Promise.defer()
		if next
			deferred.promise.then next
		@query_()
		deferred.promise

	query_: (deferred) ->
		imap = @manager.connection
		imap.search [ [ 'X-GM-RAW', @name ] ], (err, results) =>
			@results_ deferred, err, results 

	results_: (deferred, err, results) ->
		imap = @manager.connection
		# TODO labels
		@log 'got search results'
		content = headers: [ "id", "from", "to", "subject", "date" ]
		fetch = imap.fetch results, content
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

###*
Missing:
- global lock
###
class GmailManager extends BaseClass 
	locked: no
	searches: prop('searches', null, [])
	connection: null
	settings: null
		
	constructor: (@settings, next) ->
		# TODO no auto connect 
		@connect next

		do @repl if settings.repl

	addSearch: (name, update_interval) ->
		@searches().push new GmailSearch @, name, update_interval
					
	# basic schedule implementation
	activate: -> 
		search = @searches().sortBy("last_update").first()
		@log search
		if @cursor_ >= @searches().length
			@cursor_ = 0
		# get promise resolvals for the interval and the request
		resolve = (Promise.defer().promise.resolve for i in [0, 1])
		# TODO change to timeout
		setTimeout resolve[0], @minInterval_
		# run channels command
		search.fetch resolve[1]
		# run activate once more after above promises are fulfilled
		Promise.any(resolve).then @activate.bind @
					
	minInterval_: ->
		Math.min ch.update_interval for ch in @searches

	connect: def(
		(@next) ->
			@this.log 'connecting'
			data = @this.settings
			@this.connection = new ImapConnection
				username: data.gmail_username
				password: data.gmail_password 
				host: data.gmail_host or "imap.gmail.com"
				port: 993
				secure: true
			@this.connection.connect @
		->
			@this.connection.openBox "[Gmail]/All Mail", false, @next
	)
	
	disconnect: -> @connection.logout

#if contracts
#	Gmail.Manager :: GmailManagerCtr
#	Gmail.Manager = Gmail.Manager
#	
#	for prop, ctr of GmailCtr.oc
#			continue if not Gmail::[prop] or
#					prop is 'constructor'
#			Gmail::[prop] :: ctr
#			Gmail::[prop] = Gmail::[prop]

gmail = null
ex(
	-> gmail = new GmailManager settings, @
	->
		gmail.addSearch '*'
		gmail.activate()
)
setTimeout gmail.disconnect.bind gmail, 10*1000
