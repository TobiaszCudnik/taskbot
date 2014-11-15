Imap = require "imap"
require 'sugar'
asyncmachine = require 'asyncmachine'
#am_task = require './asyncmachine-task'
rsvp = require 'rsvp'
async = require 'async'
query = require './query'

Query = query.Query

# TODO IDLE state
class Connection extends asyncmachine.AsyncMachine

	# ATTRIBUTES

	queries: null
	queries_executing: null
	queries_executing_limit: 3
	imap: null
	query_timer: null
	settings: null
		
	box: null
	fetch: null
				
	# MAIN STATES

	Connecting:
		requires: ['Active']
		blocks: ['Connected', 'Disconnecting', 'Disconnected']

	Connected:
		requires: ['Active']
		blocks: ['Connecting', 'Disconnecting', 'Disconnected']
		implies: ['BoxClosed']

	Ready:
		# TODO auto: yes
		requires: ['BoxOpened']
		
	Idle:
		requires: ['Ready']
		block: ['ExecutingQueries']

	Active: {}

	ExecutingQueries:
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

	OpeningBox:
		requires: ['Connected']
		blocks: ['BoxOpened', 'BoxClosing', 'BoxClosed']

	BoxOpened:
		requires: ['Connected']
		depends: ['Connected']
		blocks: ['OpeningBox', 'BoxClosed', 'BoxClosing']

	BoxClosing:
		blocks: ['BoxOpened', 'OpeningBox', 'Box']

	BoxClosed:
		blocks: ['BoxOpened', 'OpeningBox', 'BoxClosing']
		
	# ERROR STATES
		
	BoxOpeningError:
		drops: ['BoxOpened', 'OpeningBox']

	# API

	constructor: (settings) ->
		super()

		@queries = []
		@queries_executing = []
		@settings = settings
								
		@register 'Disconnected', 'Disconnecting', 'Connected', 'Connecting',
			'Idle', 'Active', 'ExecutingQueries', 'OpeningBox', 'Fetching',
			'BoxOpened', 'BoxClosing', 'BoxClosed', 'Ready', 'QueryFetched', 
			'BoxOpeningError'
		
		@debug '[connection]', 1
		

	addQuery: (query, update_interval) ->
		@log "Adding query '#{query}'"
		query = new Query @, query, update_interval
		@queries.push query
		# Bind to query events
		query.on 'new-msg', (msg) ->
			@log "New msg \"#{msg.subject}\" (#{msg.labels.join ','})"
		query.on 'removed-msg', (msg) ->
			@log "Removed msg \"#{msg.subject}\" (#{msg.labels.join ','})"
		query.on 'labels-changed', (msg) ->
			@log "New labels \"#{msg.subject}\" (#{msg.labels.join ','})"
			
		# TODO pipe query
		query

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
			return if not @is 'Connecting', tick + 1
			@add 'Connected'

	Connecting_exit: (states) ->
		if not ~states.indexOf 'Connected'
			@imap.removeAllListeners 'ready'
			@imap = null

	Connected_enter: -> @add 'OpeningBox'

	Connected_exit: ->
		tick = @clock 'Connected'
		@imap.end =>
			return if tick isnt @clock 'Connected'
			@imap = null
			@add 'Disconnected'

	OpeningBox_enter: ->
		# TODO try and set to Disconnected on catch
		# Error: Not connected or authenticated
		# TODO support err param to the callback
		tick = @clock 'OpeningBox'
		@imap.openBox "[Gmail]/All Mail", no, (err, box) =>
			return if not @is 'OpeningBox', tick + 1
			@add ['BoxOpened', 'Ready'], err, box
		yes

	BoxOpened_enter: (states, err, box) ->
		if err
			@add 'BoxOpeningError', err
			return no
		@box = box
		
	BoxOpeningError_enter: (err) ->
		throw new Error err

	BoxClosing_enter: ->
		tick = @clock 'BoxClosing'
		@imap.closeBox =>
			return if not @is 'BoxClosing', tick + 1
			@add 'BoxClosed'
			
	# CONNECTED

	Ready_enter: -> @add 'ExecutingQueries'

	Active_enter: -> @add 'Connecting'
	
	Connected_Active: -> @add 'Connecting'

	ExecutingQueries_enter: -> @fetchScheduledQueries()
		
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

	fetchScheduledQueries: ->
		# Add new search only if there's a free limit.
		while @queries_executing.length < @queries_executing_limit
			query = @queries
				# Skip active queries
				.filter( (item) =>
					not @queries_executing.some (s) => s.query == item.query)
				# Select the next query (based on last update + interval)
				.sortBy("next_update")
				# Skip queries not queued yet
				.filter( (item) =>
					 not item.next_update or item.next_update < Date.now())
				# Skip queries still working
				# .filter( (item) =>
				#   not item.is 'Fetching')
				.first()
			
			break if not query
			
			@log "activating #{query.query}"
			# Performe the search
			@log 'concurrency++'
			@queries_executing.push query
			query.add 'FetchingQuery'
			@add 'Fetching'
			# Subscribe to a finished query
			tick = query.clock 'FetchingQuery'
			query.once 'Results.Fetched.enter', (@queryFetched.bind @, query, tick)
				
		# Loop the fetching process
		func = => @fetchScheduledQueries()
		@query_timer = setTimeout func, @minInterval_()
		
	queryFetched: (query, tick) ->
		return if tick isnt query.clock 'FetchingQuery'
		# @concurrency = @concurrency.exclude search
		@queries_executing = @queries_executing.filter (row) =>
			return (row isnt query)
		# Try to drop the fetching state
		@drop 'Fetching'
		@add 'QueryFetched', query
		@log 'concurrency--'

	# PRIVATES

	minInterval_: ->
		# TODO return a min diff between next_update and Date.now()
		Math.min.apply null, @queries.map (ch) => ch.update_interval
