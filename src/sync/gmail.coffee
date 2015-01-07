asyncmachine = require 'asyncmachine'
Promise = require 'bluebird'
coroutine = Promise.coroutine
{ GmailQuery } = require './gmail-query'
type = require '../type'


class States extends asyncmachine.AsyncMachine


	Enabled: {}
	SyncingEnabled: {}


	Dirty:blocks: ['QueryLabelsSynced', 'SyncingQueryLabels']


	SyncingQueryLabels:
		auto: yes
		requires: ['SyncingEnabled', 'LabelsFetched']
		blocks: ['QueryLabelsSynced']
	QueryLabelsSynced:blocks: ['SyncingQueryLabels']


	FetchingLabels:
		auto: yes
		requires: ['Enabled']
		blocks: ['LabelsFetched']
	LabelsFetched:blocks: ['FetchingLabels']


	FetchingHistoryId:
		auto: yes
		requires: ['Enabled']
		blocks: ['HistoryIdFetched']
	HistoryIdFetched:blocks: ['FetchingHistoryId']


	constructor: ->
		super
		@registerAll()



class Gmail


	states: null
	api: null
	config: null
	sync: null
	completions: null
	history_id_timeout: 3000
	history_id: null
	last_sync_time: null
	query_labels: null
	queries: null
	query_labels_timer: null


	constructor: (@sync) ->
		@states = new States
		@states.setTarget this
		if process.env['DEBUG']
			@states.debug 'Gmail / ', process.env['DEBUG']

		@completions = {}
		@queries = []
		@api = @sync.gmail_api
		@config = @sync.config
		@initQueryLabels()
		@states.pipeForward 'QueryLabelsSynced', @sync.states


	# ----- -----
	# Transitions
	# ----- -----


	# TODO extract to a separate class
	SyncingQueryLabels_state: coroutine ->
		@query_labels_timer = new Date()
		abort = @states.getAbort 'SyncingQueryLabels'

		dirty = no
		yield Promise.all @query_labels.map coroutine (query, name) =>

			query.states.add 'Enabled'
			yield query.states.whenOnce 'ThreadsFetched'
			return if abort()
			query.states.drop 'Enabled'

			labels = @config.query_labels[name]
			yield Promise.all query.threads.map coroutine (thread) =>
				yield @modifyLabels thread.id, labels[0], labels[1], abort
				dirty = yes
		@states.add 'Dirty' if dirty
		return if abort?()

		if not dirty
			@states.add 'QueryLabelsSynced'


	# TODO extract to a separate class
	QueryLabelsSynced_state: ->
		@ql_last_sync_time = new Date() - @query_labels_timer
		@query_labels_timer = null
		console.log "QueryLabels synced in: #{@ql_last_sync_time}ms"


	FetchingLabels_state: coroutine ->
		abort = @states.getAbort 'FetchingLabels'
		res = yield @req @api.users.labels.list, userId: 'me'
		return if abort?()
		@labels = res[0].labels
		@states.add 'LabelsFetched'


	Dirty_state: ->
		@history_id = null
		for query in @queries
			@states.add query.states, 'Dirty'

		@states.drop 'Dirty'


	FetchingHistoryId_state: coroutine (abort) ->
		console.log '[FETCH] history ID'
		response = yield @req @api.users.getProfile,
			userId: 'me'
			fields: 'historyId'
		return if abort?()
		@history_id = response[0].historyId
		@last_sync_time = Date.now()
		@states.add 'HistoryIdFetched'


	# ----- -----
	# Methods
	# ----- -----


	fetchThread: coroutine (id, historyId, abort) ->
		response = yield @req @api.users.threads.get,
			id: id
			userId: 'me'
			metadataHeaders: 'SUBJECT'
			format: 'metadata'
			fields: 'id,historyId,messages(id,labelIds,payload(headers))'
		return if abort?()

		response[0]


	createQuery: (query, name = '', fetch_msgs = no) ->
		query = new GmailQuery this, query, name, fetch_msgs
		@queries.push query

		query


	# Searches all present gmail queries for the thread with the given ID.
	getThread: (id, with_content = no) ->
		for query in @queries
			for thread in query.threads
				continue if thread.id isnt id
				continue if with_content and not thread.messages?.length
				return thread


	initQueryLabels: ->
		@query_labels = {}
		count = 0
		for query, labels of @config.query_labels
			# narrow the query to results requiring the labels modification
			exclusive_query = query
			# labels to add
			if labels[0].length
				exclusive_query += ' (-label:' +
					labels[0].map(@normalizeLabelName).join(' OR -label:') + ')'
			# labels to remove
			if labels[1]?.length # labels to add
				exclusive_query += ' (label:' +
					labels[1].map(@normalizeLabelName).join(' OR label:') + ')'
			@query_labels[query] = @createQuery exclusive_query, "QueryLabels #{++count}"

		@sync.log "Initialized #{@query_labels.keys().length} queries", 2


	normalizeLabelName: (label) ->
		label
			.replace '/', '-'
			.replace ' ', '-'
			.toLowerCase()


	isHistoryIdValid: ->
		@history_id and Date.now() < @last_sync_time + @history_id_timeout


	isCached: coroutine (history_id, abort) ->
		if not @isHistoryIdValid()
			if not @states.is 'FetchingHistoryId'
				@states.add 'FetchingHistoryId', abort
				# We need to wait for FetchingHistoryId being really added, not only queued
				yield @states.whenOnce 'FetchingHistoryId', abort
				return if abort?()
			yield @states.whenOnce 'HistoryIdFetched', abort
			return if abort?()

		@history_id <= history_id


	initAutoLabels: ->
#		for query, labels of @config.query_labels
#			query = new GmailQuery this, query, no


	getLabelsIds: (labels) ->
		if not Object.isArray labels
			labels = [labels]
		labels.map (name) =>
			label = @labels.find (label) ->
				label.name.toLowerCase() is name.toLowerCase()
			label.id


	modifyLabels: coroutine (thread_id, add_labels, remove_labels, abort) ->
		type thread_id, String
		add_labels ?= []
		remove_labels ?= []
		add_label_ids = @getLabelsIds add_labels
		remove_label_ids = @getLabelsIds remove_labels

		label = try
			thread = @getThread thread_id, yes
			'"' + (@getTitleFromThread thread) + '"'
		catch e
			"ID: #{thread_id}"

		log_msg = "Modifing labels for thread #{label} "
		if add_labels.length
			log_msg += "+(#{add_labels.join ' '}) "
		if remove_labels.length
			log_msg += "-(#{remove_labels.join ' '})"
		console.log log_msg

		yield @req @api.users.messages.modify,
			id: thread_id
			userId: 'me'
			resource:
				addLabelIds: add_label_ids
				removeLabelIds: remove_label_ids

		# TODO
#    # sync the DB
#    thread = @threads?.threads?.find (thread) ->
#      thread.id is thread_id
#    return if not thread
#
#    for msg in thread.messages
#      msg.labelIds = msg.labelIds.without.apply msg.labelIds, remove_label_ids
#      msg.labelIds.push add_label_ids


	getHistoryId: coroutine (abort) ->
		if not @history_id
			@states.add 'FetchingHistoryId'
			yield @states.whenOnce 'HistoryIdFetched'

		@history_id


	createThread: coroutine (raw_email, labels, abort) ->
		console.log "Creating thread (#{labels.join ' '})"
		res = yield @req @api.users.messages.insert,
			userId: 'me'
			resource:
				raw: raw_email
				labelIds: @getLabelsIds labels
		return if abort?()
		@states.add 'Dirty', labels
		res[0]


	createEmail: (subject) ->
			type subject, String

			email = ["From: #{@sync.config.gmail_username} <#{@sync.config.gmail_username}>s"
							 "To: #{@sync.config.gmail_username}"
							 "Content-type: text/html;charset=utf-8"
							 "MIME-Version: 1.0"
							 "Subject: #{subject}"].join "\r\n"

			new Buffer email
				.toString 'base64'
				.replace /\+/g, '-'
				.replace /\//g, '_'


	# TODO static or move to the thread class
	getTitleFromThread: (thread) ->
		try thread.messages[0].payload.headers[0].value
		catch e
			throw new Error 'Thread content not fetched'


	# TODO static or move to the thread class
	threadHasLabels: (thread, labels) ->
#    if not @gmail.is 'LabelsFetched'
#      throw new Error
#    for msg in thread.messages
#      for label_id in msg.labelIds


	req: (method, params) ->
		@sync.req method, params



module.exports = {
  Gmail
  States
}