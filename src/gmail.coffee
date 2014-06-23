settings = require '../settings'
Imap = require "imap"
require 'sugar'
asyncmachine = require 'asyncmachine'
am_task = require './asyncmachine-task'
rsvp = require 'rsvp'
async = require 'async'

Object.merge settings, gmail_max_results: 300

class Message

class Query extends asyncmachine.AsyncMachine
#class Query extends am_task.Task
	#	private msg: imap.ImapMessage;

	# Tells that the instance has some monitored messages.
	HasMonitored: {}

	# TODO block in blocked states
	ResultsFetched: 
		blocks: ['FetchingMessage', 'FetchingResults', 'FetchingQuery', 'Fetching']

	# Aggregating state
	Fetching:
		blocks: ['Idle']

	Idle:
		blocks: ['Fetching']

	FetchingQuery:
		implies: ['Fetching'],
		blocks: ['FetchingResults', 'ResultsFetched']

	FetchingResults:
		implies: ['Fetching'],
		blocks: ['FetchingQuery']

	ResultsFetchingError:
		implies: ['Idle']
		blocks: ['FetchingResults']

	FetchingMessage:
		blocks: ['MessageFetched'],
		requires: ['FetchingResults']

	MessageFetched:
		blocks: ['FetchingMessage'],
		requires: ['FetchingResults']

	# Attributes

	active: true
	last_update: 0
	next_update: 0
	headers:
		bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)'
		struct: yes
	monitored: []		
	connection: null
	name: "*"
	update_interval: 10*1000
	
	# TODO type me!
	fetch: null
	# TODO type me!
	msg: null

	constructor: (connection, name, update_interval) ->
		super()
								
		@register 'HasMonitored', 'Fetching', 'Idle', 'FetchingQuery',
			'FetchingResults', 'ResultsFetchingError', 'FetchingMessage',
			'MessageFetched', 'ResultsFetched'
								
		@debug "[query:\"#{name}\"]", 1

		@connection = connection
		@name = name
		@update_interval = update_interval

	FetchingQuery_enter: ->
		# TODO set once results are ready???
		@last_update = Date.now()
		@next_update = @last_update + @update_interval
		@log "performing a search for " + @name 
		tick = @clock 'Fetching'
		@connection.imap.search [['X-GM-RAW', @name]], (err, results) =>
			return if not @is 'FetchingQuery', tick
			@add 'FetchingResults', err, results
		yes

	FetchingQuery_FetchingResults: (states, err, results) ->
		@log 'got search results'
		if not results.length
			@add 'ResultsFetched'
			return yes
		@fetch = @connection.imap.fetch results, @headers
		# Subscribe state changes to fetching events.
		@fetch.on "message", @addLater 'FetchingMessage'
		@fetch.once "error", @addLater 'ResultsFetchingError'
		@fetch.once "end", @addLater 'ResultsFetched'
		
	FetchingResults_exit: ->
		@fetch.unbindAll()
		@fetch = null

	FetchingMessage_enter: (states, msg) ->
		attrs = null
		body_buffer = ''
		body = null
		@msg.once 'body', (stream, data) =>
			# stream's bindings don't have to be unbound, as we're not passing
			# the object further
			stream.on 'data', (chunk) ->
				body_buffer += chunk.toString 'utf8'
			stream.once 'end', ->
				body = Imap.parseHeader body_buffer
		@msg.once 'attributes', (data) =>
			attrs = data 
		@msg.once 'end', =>
			@add 'MessageFetched', msg, attrs, body

	FetchingMessage_exit: ->
		@msg.unbindAll()
		@msg = null

	FetchingMessage_MessageFetched: (states, msg, attrs, body) ->
		id = attrs['x-gm-msgid']
		if not ~@monitored.indexOf id
			# TODO event
			labels = attrs['x-gm-labels'] || []
			@log "New msg \"#{body.subject}\" (#{labels.join ','})"
			@monitored.push id
			@add 'HasMonitored'

	ResultsFetchingError_enter: (err) ->
		@log 'fetching error', err
		@add 'Idle'
		if err
			throw new Error err

# TODO IDLE state
class Connection extends asyncmachine.AsyncMachine

	# ATTRIBUTES

	queries: []
	queries_executing: []
	queries_executing_limit: 3
	imap: null
	query_timer: null
	settings: null
		
	# TODO Type me!
	box: null
	fetch: null
				
	# MAIN STATES

	Connecting:
		blocks: ['Connected', 'Disconnecting', 'Disconnected']

	Connected:
		blocks: ['Connecting', 'Disconnecting', 'Disconnected']
		implies: ['BoxClosed']

	Ready:
		# TODO auto: yes
		requires: ['BoxOpened']
		
	Idle:
		requires: ['Ready']
		block: ['ExecutingQueries']

	Active:
		requires: ['Ready']

	ExecutingQueries:
		requires: ['Active']
		blocks: ['Idle']
		
	QueryFetched:
		requires: ['Ready']

	Disconnecting:
		blocks: ['Connected', 'Connecting', 'Disconnected']

	DisconnectingQueries:
		requires: ['Disconnecting']
				
	Disconnected:
		blocks: ['Connected', 'Connecting', 'Disconnecting']
		
	# FORWARDED STATES

	Fetching:
		blocks: ['Idle']
		requires: ['ExecutingQueries']
		
	# BOX RELATED STATES

	BoxOpening:
		requires: ['Active']
		blocks: ['BoxOpened', 'BoxClosing', 'BoxClosed']

	BoxOpened:
		depends: ['Connected']
		blocks: ['BoxOpening', 'BoxClosed', 'BoxClosing']

	BoxClosing:
		blocks: ['BoxOpened', 'BoxOpening', 'Box']

	BoxClosed:
		blocks: ['BoxOpened', 'BoxOpening', 'BoxClosing']
		
	# ERROR STATES
		
	BoxOpeningError:
		drops: ['BoxOpeningError']

	# API

	constructor: (settings) ->
		super()

		@settings = settings
								
		@register 'Disconnected', 'Disconnecting', 'Connected', 'Connecting',
			'Idle', 'Active', 'ExecutingQueries', 'BoxOpening', 'Fetching',
			'BoxOpened', 'BoxClosing', 'BoxClosed', 'Ready', 'QueryFetched'
								
		@debug '[connection]', 1
		# TODO no auto connect 
		@set 'Connecting'

	addQuery: (query, update_interval) ->
		@log "Adding query '#{query}'"
		@queries.push new Query @, query, update_interval

	# STATE TRANSITIONS

	Connecting_enter: (states) ->
		data = @settings
		@imap = new Imap
			user: data.gmail_username
			password: data.gmail_password
			host: data.gmail_host || "imap.gmail.com"
			port: 993
			tls: yes
			debug: console.log if @settings.debug
									
		@imap.connect()
		tick = @clock 'Connecting'
		@imap.once 'ready', =>
			return if not @is 'Connecting', tick
			@add 'Connected'

	Connecting_exit: (target_states) ->
		if ~target_states.indexOf 'Disconnected'
			yes
		@imap.removeAllListeners 'ready'
		@imap = null

	Connected_exit: ->
		tick = @clock 'Connected'
		@imap.end =>
			return if tick isnt @clock 'Connected'
			@add 'Disconnected'

	BoxOpening_enter: ->
		if @is 'BoxOpened'
			@add 'ExecutingQueries'
			return no
		else
			@once 'Box.Opened.enter', @addLater 'ExecutingQueries'
		# TODO try and set to Disconnected on catch
		# Error: Not connected or authenticated
		# TODO support err param to the callback
		tick = @clock 'BoxOpening'
		@imap.openBox "[Gmail]/All Mail", no, (err, box) =>
			return if not @is 'BoxOpening', tick
			@add ['BoxOpened', 'Ready'], err, box
		yes

	BoxOpened_enter: (err, box) ->
		# TODO
		if err
			@add 'BoxOpeningError', err
			return no
		@box = box
		
	BoxOpeningError_enter: (err) ->
		throw new Error err

	BoxClosing_enter: ->
		tick = @clock 'BoxClosing'
		@imap.closeBox =>
			return if not @is 'BoxClosing', tick
			@add 'BoxClosed'
			
	# CONNECTED

	Active_enter: -> @add 'ExecutingQueries'

	# TODO refactor this logic to the Active state ???
	ExecutingQueries_enter: ->
		# Add new search only if there's a free limit.
		while @queries_executing.length < @queries_executing_limit
			query = @queries
				# Select the next query (based on last update + interval)
				.sortBy("next_update")
				# Skip active queries
				.filter( (item) =>
					not @queries_executing.some (s) => s.name == item.name)
				# Skip queries not queued yet
				.filter( (item) =>
					 not item.next_update or item.next_update < Date.now())
				# Skip queries still working
				# .filter( (item) =>
				#   not item.is 'Fetching')
				.first()
			
			break if not query
			
			@log "activating #{query.name}"
			# Performe the search
			@log 'concurrency++'
			@queries_executing.push query
			query.add 'FetchingQuery'
			@add 'Fetching'
			# Subscribe to a finished query
			tick = query.clock 'FetchingQuery'
			query.once 'Results.Fetched.enter', =>
				return if tick isnt query.clock 'FetchingQuery'
				# @concurrency = @concurrency.exclude search
				@queries_executing = @queries_executing.filter (row) =>
					return (row isnt query)
				# Try to drop the fetching state
				@drop 'Fetching'
				@add 'QueryFetched', query
				@log 'concurrency--'
				
		# Loop the fetching process
		@query_timer = setTimeout (@addLater 'ExecutingQueries'), @minInterval_()

	ExecutingQueries_ExecutingQueries: ->
		@ExecutingQueries_ExecutingQueries.apply @, arguments
		
	ExecutingQueries_Disconnecting: (states, force) ->
		# Disconnected mean not Active
		@drop 'Active'
		# Clear the scheduler's timer, if any
		clearTimeout @query_timer if @query_timer
		# If no query is Fetching, accept the transition
		return if @queries_executing.every (query) ->
			query.is 'Idle'
		# If not, we're waiting (by a state) while asserting on a current tick
		@add 'DisconnectingQueries'
		tick = @clock 'BoxClosing'
		async.forEach(@queries_executing,
			(query, done) =>
				query.drop 'Fetching'
				query.once 'Idle', done
			=>
				return if not @is 'ExecutingQueries', tick
				# Continue with closing the box
				@add 'BoxClosing'
		)
	
	Fetching_exit: ->
		not @queries_executing.some (query) ->
			query.is 'Fetching'
		
	Disconnected_enter: (states, force) ->
		if @any 'Connected', 'Connecting'
			@add 'Disconnecting', force
			no
		else if @is 'Disconnecting'
			no

	Disconnecting_exit: -> @add 'Disconnected'

	hasMonitoredMsgs: ->
		@queries.some (query) -> query.is 'HasMonitored'

	# PRIVATES

	minInterval_: ->
		Math.min.apply null, @queries.map (ch) => ch.update_interval
