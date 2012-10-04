///<reference path="externs.d.ts"/>
///<reference path="node.d.ts"/>
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

var connection = new ImapConnection({
    username: settings.gmail_username,
	password: settings.gmail_password,
	host: settings.gmail_host || "imap.gmail.com",
	port: 993,
	secure: true
})

// TODO add event emitter
class BaseClass {
	repl() {
		var repl = repl.start({
		  prompt: "repl> ",
		  input: process.stdin,
		  output: process.stdout
		})
		repl.context.this = this
	}
	log() {
		console.log.apply( console, arguments )
	}
}

// TODO config
Object.merge( settings, {gmail_max_results: 300})

/*
TODO emit:
- new-msg msg
- changed-label {msg, new_labels, removed_labels}
*/

interface Message {

}

class GmailSearch {
	active: bool = true;
	last_update: number = 0;
	cmd: (string?) => string = prop('cmd');
	private monitored: (set?: Message[]) => Message[] = prop('monitored', null, []);

	constructor(
		public manager: GmailManager,
		public name: string = "noname",
		public update_interval: number = 10*1000
	) {}

	fetch(next: () => any) {
		// TODO
	}

	query_(deferred: Promise.Deferred) {
		imap = this.manager.connection
		var next = (err, results) =>
			this.results_( deferred, err, results )
		imap.search( [ [ 'X-GM-RAW', this.name ] ], next )
	}

	results_(deferred: Promise.Deferred, err, results) {
// 		imap = @manager.connection
// 		# TODO labels
// 		@log 'got search results'
// 		content = headers: [ "id", "from", "to", "subject", "date" ]
// 		fetch = imap.fetch results, content
// 		fetch.on "message", (msg) =>
// #					msg.on "data", (chunk) =>
// #						@log "Got message chunk of size " + chunk.length
// 			msg.on "end", =>
// #				@log "Finished message: " + util.inspect msg, false, 5
// 				if !~ @monitored_().indexOf msg.id
// 					# TODO event
// 					@log 'new msg'
// 					@monitored_().push msg.id
// 					# TODO later
// 					# @emit "new-msg"
// #					else
// #						# TODO compare labels
// #						# TODO check new msgs in the thread
// 		fetch.on "end", (err) =>
// 			@log 'fetch ended'
// 			deferred.resolve()
// 		fetch.on "error", (err) =>
// 			# new Error ???
// 			deferred.reject err
	}
}

class GmailManager extends BaseClass {
	// locked: no
	// searches: prop('searches', null, [])
	// connection: null
	// settings: null
		
	// constructor: (@settings, next) ->
	// 	# TODO no auto connect 
	// 	@connect next

	// 	do @repl if settings.repl

	// addSearch: (name, update_interval) ->
	// 	@searches().push new GmailSearch @, name, update_interval
					
	// # basic schedule implementation
	// activate: -> 
	// 	search = @searches().sortBy("last_update").first()
	// 	@log "activating #{search.name}"
	// 	if @cursor_ >= @searches().length
	// 		@cursor_ = 0
	// 	# get promise resolvals for the interval and the request
	// 	resolve = (Promise.defer() for i in [0, 1])
	// 	setTimeout resolve[0].resolve, @minInterval_()
	// 	# run the search query
	// 	search.fetch resolve[1].resolve
	// 	# run activate once more after both promises are fulfilled
	// 	Promise.all(resolve).then @activate.bind @
					
	// minInterval_: ->
	// 	(Math.min ch.update_interval for ch in @searches())[0]

	// connect: def(
	// 	(@next) ->
	// 		@this.log 'connecting'
	// 		data = @this.settings
	// 		@this.connection = new ImapConnection
	// 			username: data.gmail_username
	// 			password: data.gmail_password 
	// 			host: data.gmail_host or "imap.gmail.com"
	// 			port: 993
	// 			secure: true
	// 		@this.connection.connect @
	// 	->
	// 		@this.connection.openBox "[Gmail]/All Mail", false, @next
	// )
	
	// disconnect: -> @connection.logout
}

// gmail = null
// ex(
// 	-> gmail = new GmailManager settings, @
// 	->
// 		gmail.addSearch '*', 5000
// 		gmail.activate()
// )
// setTimeout gmail.disconnect.bind gmail, 10*1000