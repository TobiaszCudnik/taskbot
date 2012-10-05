///<reference path="externs.d.ts"/>
///<reference path="node.d.ts"/>

// require 'longjohn'
import flow = module('flow')
var def = flow.define
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
	log(...msgs: string[]) {
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

class GmailSearch extends BaseClass {
	active: bool = true;
	last_update: number = 0;
	cmd: (string?) => string = prop('cmd');
	private monitored: 
		(set?: Message[]) => Message[] = prop('monitored', null, []);

	constructor(
		public manager: GmailManager,
		public name: string = "noname",
		public update_interval: number = 10*1000
	) {
		super()
	}

	fetch(next: () => any): Promise.Promise {
		this.log( "performing a search for #{@name}" )
		var deferred = Promise.defer()
		if (next) {
			deferred.promise.then( next )
		}
		this.query_( deferred )
		return deferred.promise
	}

	query_(deferred: Promise.Deferred) {
		var imap = this.manager.connection
		var next = (err, results) =>
			this.results_( deferred, err, results )
		imap.search( [ [ 'X-GM-RAW', this.name ] ], next )
	}

	results_(deferred: Promise.Deferred, err, results) {
 		var imap = this.manager.connection
// 		# TODO labels
 		this.log ('got search results')
 		var content = { headers: [ "id", "from", "to", "subject", "date" ] }
 		var fetch = imap.fetch( results, content )
 		fetch.on( "message", (msg) => {
			msg.on( "end", () => {
				if (!~ this.monitored().indexOf( msg.id )) {
					// # TODO event
					this.log( 'new msg' )
					this.monitored().push( msg.id )
					// # TODO later
					// # this.emit "new-msg"
				}
			})
		})
		fetch.on( "end", (err) => {
			this.log( 'fetch ended' )
			deferred.resolve()
		})
		fetch.on( "error", (err) => {
			// # new Error ???
			deferred.reject( err )
		})
	}
}

class GmailManager extends BaseClass {

	private cursor = 0;
	locked: bool = false;
	searches = prop('searches', null, []);
	connection: imap.ImapConnectionObject;
		
	constructor(public settings, next: Function) {
		super()
		// # TODO no auto connect 
		this.connect( next )

		if (settings.repl)
			this.repl()
	}

	addSearch(name: string, update_interval: number) {
		this.searches().push( new GmailSearch( this, name, update_interval ) )
	}
					
	// # basic schedule implementation
	activate() {
		var search = this.searches().sortBy("last_update").first()
		this.log( "activating #{search.name}")
		if (this.cursor >= this.searches().length)
			this.cursor = 0
		// # get promise resolvals for the interval and the request
		var resolve = [
			Promise.defer(),
			Promise.defer()
		]
		setTimeout( resolve[0].resolve, this.minInterval_() )
		// # run the search query
		search.fetch( resolve[1].resolve )
		// # run activate once more after both promises are fulfilled
		return Promise.all(resolve).then(
			this.activate.bind( this )
		)
	}
					
	minInterval_() {
		var intervals: number[] = this.searches().map( (ch) => {
			return ch.update_interval
		})
		return Math.min.apply( this, intervals )
	}

	connect(next: Function) {
		this.log('connecting')
		var data = this.settings
		this.connection = new ImapConnection({
			username: data.gmail_username,
			password: data.gmail_password,
			host: data.gmail_host || "imap.gmail.com",
			port: 993,
			secure: true
		})
		this.connection.connect( this, () => {
			this.connection.openBox( "[Gmail]/All Mail", false, next )
		})
	}
	
	disconnect() {
		this.connection.logout()
	}
}

var gmail: GmailManager
ex(
	function() {
		gmail = new GmailManager( settings, this )
	},
	function() {
		gmail.addSearch( '*', 5000 )
		gmail.activate()
	}
)
setTimeout( gmail.disconnect.bind( gmail ), 10*1000 )