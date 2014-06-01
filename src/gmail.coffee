settings = require '../settings'
imap = require "imap"
ImapConnection = imap.ImapConnection
repl = require 'repl'
#import sugar = module('sugar')
require 'sugar'
asyncmachine = require 'asyncmachine'
am_task = require './asyncmachine-task'
rsvp = require 'rsvp'

# TODO config
Object.merge settings, gmail_max_results: 300

class Query extends am_task.Task
	#	private msg: imap.ImapMessage;

	# Tells that the instance has some monitored messages.
	HasMonitored: {}

	# Aggregating state
	Fetching:
		blocks: [ 'Idle' ]

	Idle:
		blocks: [ 'Fetching' ]

	FetchingQuery:
		implies: [ 'Fetching' ],
		blocks: [ 'FetchingResults' ]

	FetchingResults:
		implies: [ 'Fetching' ],
		blocks: [ 'FetchingQuery' ]

	ResultsFetchingError:
		implies: [ 'Idle' ]

	FetchingMessage:
		blocks: [ 'MessageFetched' ],
		requires: [ 'FetchingResults' ]

	MessageFetched:
		blocks: [ 'FetchingMessage' ],
		requires: [ 'FetchingResults' ]

	# Attributes

	active: true
	last_update: 0
	headers: [ "id", "from", "to", "subject", "date" ]
	monitored: []		
	connection: null
	name: "*"
	update_interval: 10*1000

	constructor: (connection, name, update_interval) ->
		super()
				
		@register 'HasMonitored', 'Fetching', 'Idle', 'FetchingQuery',
			'FetchingResults', 'ResultsFetchingError', 'FetchingMessage',
			'MessageFetched'
				
		@debug '[query] '
		@set 'Idle'

		@connection = connection if connection
		@name = name if name
		@update_interval = update_interval if update_interval

#	Idle_FetchingQuery: ->
	FetchingQuery_enter: ->
		@last_update = Date.now()
		@log  "performing a search for " + @name 
		imap = @connection.imap
		imap.search [ [ 'X-GM-RAW', @name ] ], (err, results) =>
			@add 'FetchingResults', err, results

	FetchingQuery_FetchingResults: (states, err, results) ->
		# TODO handle err
		@log 'got search results'
		imap = @connection.imap
		fetch = imap.fetch results, @headers
		# Subscribe state changes to fetching events.
		fetch.on "error", @addLater 'ResultsFetchingError'
		fetch.on "end", =>
			@add 'HasMonitored'
			@drop 'FetchingResults'
		# TODO fix when params will work
		fetch.on "message", (msg) =>
			 @add 'FetchingMessage', msg

#	FetchingMessage_enter( states, params, msg ) {
	FetchingMessage_enter: (states, msg) ->
		msg.on 'end', =>
			@add 'MessageFetched', msg

#	FetchingMessage_MessageFetched( states, params ) {
	FetchingMessage_MessageFetched: (states, msg) ->
		id = msg['x-gm-msgid']
		if not ~@monitored.indexOf id
			# # TODO event
			labels = msg['x-gm-labels'].join ', '
			@log 'New msg "' + msg.headers.subject + '" (' + labels + ')'
			@monitored.push id

	ResultsFetchingError_enter: (err) ->
		@log 'fetching error', err
		setTimeout @addLater('Idle'), 0
		if err
			throw new Error err

	# TODO FIXME
	repl: ->
		repl = repl.start(
			prompt: "repl> "
			input: process.stdin
			output: process.stdout
		)
		repl.context.this = @

	log: (msgs...) ->
		@log.apply console, msgs

# TODO IDLE state
class Connection extends asyncmachine.AsyncMachine

	# ATTRIBUTES

	max_concurrency: 3
	queries: []
	connection: imap.ImapConnection
	box_opening_promise: null
	delayed_timer: null
	concurrency: []
	threads: []
	settings: {}
		
	# STATES
		
	Disconnected:
		blocks: ['Connected', 'Connecting', 'Disconnecting']

	Disconnecting:
		blocks: ['Connected', 'Connecting', 'Disconnected']

	Connected:
		blocks: [ 'Connecting', 'Disconnecting', 'Disconnected' ]
		implies: [ 'BoxClosed' ]

	Connecting:
		blocks: ['Connected', 'Disconnecting', 'Disconnected']

	Idle:
		requires: [ 'Connected' ]

	Active:
		requires: [ 'Connected' ]

	Fetched: {}

	Fetching:
		requires: [ 'BoxOpened' ]
		blocks: [ 'Idle', 'Delayed' ]

	Delayed:
		requires: [ 'Active' ] 
		blocks: [ 'Fetching', 'Idle' ]

	BoxOpening:
		requires: [ 'Active' ]
		blocks: [ 'BoxOpened', 'BoxClosing', 'BoxClosed' ]
#		group: 'OpenBox'

	BoxOpened:
		depends: [ 'Connected' ]
		requires: [ 'Active' ]
		blocks: [ 'BoxOpening', 'BoxClosed', 'BoxClosing' ]
#		group: 'OpenBox'

	BoxClosing:
		blocks: [ 'BoxOpened', 'BoxOpening', 'Box' ]
#		group: 'OpenBox'

	BoxClosed:
		requires: [ 'Active' ]
		blocks: [ 'BoxOpened', 'BoxOpening', 'BoxClosing' ]
#		group: 'OpenBox'

	# API

	constructor: (settings) ->
		super()
				
		@register 'Disconnected', 'Disconnecting', 'Connected', 'Connecting',
			'Idle', 'Active', 'Fetched', 'Fetching', 'Delayed', 'BoxOpening',
			'BoxOpened', 'BoxClosing', 'BoxClosed'
				
		@debug '[connection] '
		# TODO no auto connect 
		@set 'Connecting'

		if settings.repl
			@repl()

	addQuery: (query, update_interval) ->
		# TODO tokenize query?
		@threads.push new Query @, query, update_interval
		if @is 'BoxOpened'
			@add 'Fetching'
		else if not @add 'BoxOpening'
			@log 'BoxOpening not set', @is()

	# STATE TRANSITIONS

	Connected_enter: (states) ->
		setTimeout (@setLater 'BoxClosed'), 0

	Connected_Disconnected: -> 
		process.exit()

	Connecting_enter: (states) ->
		data = @settings
		@connection = new ImapConnection(
			username: data.gmail_username,
			password: data.gmail_password,
			host: data.gmail_host || "imap.gmail.com",
			port: 993,
			secure: true
		)
												
		@connection.connect @addLater 'Connected'

	Connecting_exit: (target_states) ->
		if ~target_states.indexOf 'Disconnected'
			yes
			# TODO cleanup

	Connected_exit: ->
		# TODO callback?
		@connection.logout @addLater 'Disconnected'

	BoxOpening_enter: ->
		fetch = @addLater 'Fetching'
		if @state 'BoxOpened'
			setTimeout fetch, 0
			return no
		else
			@once 'Box.Opened.enter', fetch
		if @box_opening_promise
			@box_opening_promise.reject()
		# TODO try and set to Disconnected on catch
		# Error: Not connected or authenticated
		# TODO support err param to the callback
		@connection.openBox "[Gmail]/All Mail", no, (@addLater 'BoxOpened')
		@box_opening_promise = @last_promise
		yes

	BoxOpening_BoxOpening: ->
		# TODO move to boxopened_enter??/
		@once 'Box.Opened.enter', @setLater 'Fetching'
#		yes

	BoxOpening_exit: ->
		# TODO stop openbox
		promise = @box_opening_promise
		if promise and not promise.isResolved
			promise.reject()

	BoxClosing_enter: ->
		@connection.closeBox @addLater 'BoxClosed'

	BoxOpened_enter: ->
		if not @add 'Fetching'
			@log 'Cant set Fetching', @is()

	# TODO this doesnt look OK...
	Delayed_enter: ->
		# schedule a task
		@delayed_timer = setTimeout (@addLater 'Fetching'), @minInterval_()

	Delayed_exit: ->
		clearTimeout @delayed_timer

	Fetching_enter: ->
		# Add new search only if there's a free limit.
		if @concurrency.length >= @max_concurrency
			return no
		# TODO skip searches which interval hasn't passed yet
		queries = @queries.sortBy "last_update"
		query = queries.first()
		i = 0
		# Optimise for more justice selection.
		# TODO encapsulate to needsUpdate()
		while query.last_update + query.update_interval > Date.now()
			query = queries[ i++ ]
			if not query
				return no
		@log "activating " + query.name
		return no if @concurrency.some (s) => s.name == query.name
		# Performe the search
		@log 'concurrency++'
		@concurrency.push query
		query.add 'FetchingQuery'
		# Subscribe to a finished query
		query.once 'Fetching.Results.exit', =>
#			@concurrency = @concurrency.exclude( search )
			@concurrency = @concurrency.filter (row) =>
				return row isnt query
			@log 'concurrency--'
#			@addsLater 'HasMonitored', 'Delayed'
			@addLater 'Delayed'
			@addLater 'HasMonitored'
			# TODO continue the query somehow differently?
			@addQuery @minInterval_()

	Fetching_exit: (states, args) ->
		if not ~states.indexOf 'Active'
			# TODO wil appear anytime?
			@log 'cancel fetching'
		if @concurrency.length and not args['force']
			return no
		# Exit from all queries.
		exits = @concurrency.map (query) => query.drop 'Fetching'
		not ~exits.indexOf no

	Fetching_Fetching: @Fetching_enter

	Active_enter: ->
		@add 'BoxOpening'

	# PRIVATES

	minInterval_: ->
		Math.min.apply null, @queries.map (ch) => ch.update_interval

#	repl: BaseClass.prototype.repl;
#	log: BaseClass.prototype.log;

	# TODO FIXME
	repl: ->
		repl = repl.start(
			prompt: "repl> "
			input: process.stdin
			output: process.stdout
		)
		repl.context.this = @

	log: (msgs...) ->
		@log.apply console, msgs
