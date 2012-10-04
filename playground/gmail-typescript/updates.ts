///<reference path="externs.d.ts"/>
// require 'longjohn'
import flow = module('flow')
var a_def = flow.define
var ex = flow.exec
import settings = module('../../settings')
import imap = module("imap")
var ImapConnection = imap.ImapConnection
import util = module( "util")
import repl = module( 'repl')
import Promise = module( 'when')
import jsprops = module('jsprops')
var prop = jsprops.property
import sugar = module('sugar')

connection = new ImapConnection({
	username: settings.gmail_username,
	password: settings.gmail_password,
	host: settings.gmail_host || "imap.gmail.com",
	port: 993,
	secure: true
})

// TODO add event emitter
class BaseClass {
	repl() {
		repl.start({
			  prompt: "repl> ",
			  input: process.stdin,
			  output: process.stdout
			}).context = { foo: this }
	}
	log() {
		console.log.apply( arguments )
	}
}

// TODO config
Object.merge( settings, {gmail_max_results: 300})

/*
TODO emit:
- new-msg msg
- changed-label {msg, new_labels, removed_labels}
*/

class Channel {
	active: bool = true;
	last_update: number = 0;
	update_interval: number = 10*1000;
	cmd: (string?) => string = prop('cmd');

	constructor(
		public manager: GmailManager,
		public name: string = "noname"
	) {}

	connection() {
		this.queue().push( Promise.defer())
		this.queue()[-1]
	}
}

class GmailManager {

}

class Gmail extends BaseClass {

}


//	# Singleton manager
//	manager: null
//	@Manager: class GmailManager
//		@locked: no
//		@cursor: 0
//		@channels: prop('channels', null, [])
//
//		@createChannel: (name, update_interval) ->
//			@channels[name] = new Channel this, update_interval
//			@channels[name]
//
//		# basic schedule implementation
//		@activate: ->
//			return if @locked
//			@locked = yes
//			channel = @channels().sortBy("last_update")[ @cursor_++ ]
//			if @cursor is @channels().length
//				@cursor = 0
//			# get promise resolvals for the interval and the request
//			resolve = (Promise.defer().promise.resolve for i in [0, 1])
//			setTimeout resolve[0], @minInterval
//			# run channels command
//			channel.cmd resolve[1]
//			# run activate once more after above promises are fulfilled
//			Promise.all(resolve).then activate.bind @
//
//		@minInterval_: ->
//			Math.min ch.update_interval for ch in @channels
//
//	imap: null
//	connection: null
//	queries: null
//	monitored_ : []
//
//	constructor: (@connection, next) ->
//		@manager :: GmailManagerCtr
//		@manager = @constructor.Manager
//
//		@connection ::
//			gmail_username: Str
//			gmail_password: Str
//			gmail_host: Str?
//		@connection = @connection
//
//		query_ctr = ? {
//			freq: Num
//			query: Str
//		}
//
//		@queries :: [...query_ctr]
//		@queries = []
//
//#			if @connection then @connect @ else @
//		@connect next
//
//		do @repl
//
//	connect: a_def(
//		(@next) ->
//			@this.log 'connecting'
//			data = @this.connection
//			@this.imap = new ImapConnection
//				username: data.gmail_username
//				password: data.gmail_password
//				host: data.gmail_host or "imap.gmail.com"
//				port: 993
//				secure: true
//			@this.imap.connect @
//		->
//			@this.imap.openBox "[Gmail]/All Mail", false, @next
//	)
//
//	addSearch: (query, update = 5) ->
//		@log "adding a new search #{query}"
//		@queries.push { query, freq: update }
//		# TODO extract check
//		channel = @manager.createChannel query, update*1000
//		channel.cmd = (next) =>
//			@fetchQuery query, channel.getConnection, =>
//				promise = @fetchQuery2_ arguments
//				promise.then =>
//					next()
//					# TODO later
//					# @emit "query-fetched"
//		@manager.activate()
//
//	fetchQuery: (query, connection, next) ->
//		@this.log "performing a search for #{query}"
//		connection.then =>
//			@this.imap.search [ [ 'X-GM-RAW', query ] ], next
//
//	fetchQuery2_: (err, results) ->
//		# TODO labels
//		@this.log 'got search results'
//		content = headers: [ "id", "from", "to", "subject", "date" ]
//		fetch = @this.imap.fetch results, content
//
//		deferred = Promise.defer()
//		fetch.on "message", (msg) =>
//#					msg.on "data", (chunk) =>
//#						@this.log "Got message chunk of size " + chunk.length
//			msg.on "end", =>
//				@this.log "Finished message: " + util.inspect msg, false, 5
//				if !~ @this.monitored_.indexOf msg.id
//					# TODO event
//					@this.log 'new msg'
//					@this.monitored_.push msg.id
//					# TODO later
//					# @emit "new-msg"
//#					else
//#						# TODO compare labels
//#						# TODO check new msgs in the thread
//				deferred.resolve msg
//		fetch.on "error", (err) =>
//			# new Error ???
//			deferred.reject err
//
//		# ret
//		deferred.promise
//
//	close: -> @imap.logout
//		# TODO remove channel from the manager
//
//Gmail.Manager :: GmailManagerCtr
//Gmail.Manager = Gmail.Manager
//
//for prop, ctr of GmailCtr.oc
//    continue if not Gmail::[prop] or
//        prop is 'constructor'
//    Gmail::[prop] :: ctr
//    Gmail::[prop] = Gmail::[prop]
//
//box = null
//ex(
//	class Gmail
//		constructor: (@a) ->
//	-> box = new Gmail settings, @
//	-> box.addSearch '*'
//)
//setTimeout box.close.bind box, 20
