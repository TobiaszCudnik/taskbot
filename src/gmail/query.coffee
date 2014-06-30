Imap = require "imap"
require 'sugar'
asyncmachine = require 'asyncmachine'
#am_task = require './asyncmachine-task'
rsvp = require 'rsvp'
async = require 'async'
message = require './message'

Message = message.Message

class Query extends asyncmachine.AsyncMachine
#class Query extends am_task.Task

	# Aggregating state
	
	Fetching:
		blocks: ['Idle']

	Idle:
		blocks: ['Fetching']
		
	# Old results are available even during fetching of the new ones.
	ResultsAvailable: {}
		
	# Flow states

	FetchingQuery:
		implies: ['Fetching']
		blocks: ['QueryFetched']

	QueryFetched:
		implies: ['Fetching']
		blocks: ['FetchingQuery']

	FetchingResults:
		implies: ['Fetching']
		requires: ['QueryFetched']
		blocks: ['ResultsFetched']

	ResultsFetched:
		# TODO doesnt work ?!
		implies: ['ResultsAvailable']
		blocks: ['FetchingResults']

	# Message fetching states

	FetchingMessage: requires: ['FetchingResults']
	MessageFetched: requires: ['FetchingResults']
		
	# Error states

	ResultsFetchingError:
		implies: ['Idle']
		blocks: ['FetchingResults']

	QueryFetchingError:
		implies: ['Idle']
		blocks: ['FetchingQuery']

	# Attributes

	active: true
	last_update: 0
	next_update: 0
	headers:
		bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)'
		struct: yes
	connection: null
	query: "*"
	update_interval: 10*1000
	query_results: null
	messages: null
	
	# privates
	fetch: null
	tmp_msgs: null
	msg_events: ['body', 'attributes', 'end']

	constructor: (connection, query, update_interval) ->
		super()
								
		@register 'QueryFetched', 'Fetching', 'Idle', 'FetchingQuery',
			'FetchingResults', 'ResultsFetchingError', 'FetchingMessage',
			'MessageFetched', 'ResultsFetched', 'ResultsAvailable'
								
		@debug "[query:\"#{query}\"]", 1
		
		@messages = {}
		@query_results = []
		@tmp_msgs = []
		@connection = connection
		@query = query
		@update_interval = update_interval

	FetchingQuery_enter: ->
		@last_update = Date.now()
		@log "performing a search for #{@query}" 
		tick = @clock 'FetchingQuery'
		@connection.imap.search [['X-GM-RAW', @query]], (err, results) =>
			return if not @is 'FetchingQuery', tick + 1
			if err
				@add 'QueryFetchingError', err
			else
				@add ['FetchingResults', 'QueryFetched'], results
		yes
		
	QueryFetched_enter: (states, results) ->
		@query_results = results

	FetchingQuery_FetchingResults: (states, results) ->
		@log "Found #{results.length} search results"
		if not results.length
			@add 'ResultsFetched'
			return yes
		@fetch = @connection.imap.fetch results, @headers
		# Subscribe state changes to fetching events.
		@fetch.on "message", (msg, id) =>
			@add 'FetchingMessage', msg, id
		@fetch.once "error", @addLater 'ResultsFetchingError'
		@fetch.once "end", @addLater 'ResultsFetched'

	FetchingMessage_enter: (states, msg, id) ->
		attrs = null
		body_buffer = ''
		body = null
		@tmp_msgs[id] = msg
		# TODO how the error is handled?
		msg.once 'body', (stream, data) =>
			# stream's bindings don't have to be unbound, as we're not passing
			# the object further
			stream.on 'data', (chunk) ->
				body_buffer += chunk.toString 'utf8'
			stream.once 'end', ->
				body = Imap.parseHeader body_buffer
		msg.once 'attributes', (data) =>
			attrs = data 
		msg.once 'end', =>
			@add 'MessageFetched', msg, attrs, body
			
	# Support concurrent messages fetching
	FetchingMessage_FetchingMessage: (states, msg, id) ->
		@FetchingMessage_enter states, msg, id

	FetchingMessage_exit: (id) ->
		msg = @tmp_msgs[id]
		return if not msg
		msg.removeAllListeners event for event in @msg_events
		delete @tmp_msgs[id]

	MessageFetched_enter: (states, imap_msg, attrs, body) ->
		id = attrs['x-gm-msgid']
		@drop 'FetchingMessage', id
		labels = attrs['x-gm-labels'] || []
		msg = @messages[id]
		if not msg
			@messages[id] = new Message id, body.subject, labels
			msg = @messages[id]
			# Set the fetch ID
			msg.fetch_id = @clock 'FetchingResults'
			@trigger 'new-msg', msg
		else
			# Update the fetch ID
			@log "Updating a msg tick"
			msg.fetch_id = @clock 'FetchingResults'
			if not Object.equal msg.labels, labels
				msg.labels = labels
				@trigger 'labels-changed', msg
		# Drop this state once  a msg is processed
		@drop 'MessageFetched'
		
	FetchingResults_exit: ->
		tick = @clock 'FetchingResults'
		# Remove all old msgs, not present in the current results
		Object.each @messages, (id, msg) =>
			return if msg.fetch_id is tick
			console.log "tick #{msg.fetch_id} isnt #{tick} for '#{msg.subject}'"
			@trigger 'removed-msg', msg
			delete @messages[id]
		# GC
		id = ''
		for id of @tmp_msgs
			@tmp_msgs[id].removeAllListeners event for event in @msg_events
		@tmp_msgs = []
		
		if @fetch
			events = ['message', 'error', 'end']
			@fetch.removeAllListeners event for event in events 
			@fetch = null
			
	ResultsFetched_enter: ->
		@next_update = Date.now() + @update_interval
		@drop 'ResultsFetched'
		@add 'ResultsAvailable'

	ResultsFetchingError_enter: (err) ->
		# TODO handle the erro (log/retry, dont exit)
		@log 'fetching error', err
		@add 'Idle'
		if err
			throw new Error err