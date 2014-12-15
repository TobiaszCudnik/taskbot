asyncmachine = require 'asyncmachine'
Promise = require 'bluebird'
coroutine = Promise.coroutine


class States extends asyncmachine.AsyncMachine


	Enabled: {}


	Dirty:blocks: 'QueryLabelsSynced'


	SyncingQueryLabels:
		auto: yes
		requires: ['Enabled', 'LabelsFetched']
		blocks: ['QueryLabelsSynced']
	QueryLabelsSynced:blocks: ['SyncingQueryLabels']


	FetchingLabels:
		auto: yes
		requires: ['Enabled']
		blocks: ['LabelsFetched']
	LabelsFetched:blocks: ['FetchingLabels']


	constructor: ->
		super
		@registerAll()



class Gmail


	states: null
	api: null
	config: null
	sync: null
	completions: null
	sync_timeout: 200
	last_sync_time: null
	queries: null


	constructor: (@sync) ->
		@states = new States
		@states.setTarget this
		if process.env['DEBUG']
			@states.debug 'Gmail / ', process.env['DEBUG']

		@completions = {}
		@api = @sync.gmail_api
		@config = @sync.config
		@initAutoLabelQueries()


	SyncingQueryLabels_enter: coroutine ->
		interrupt = @states.getInterruptEnter 'SyncingCompletedTasks'

		yield Promise.all @config.query_labels.map coroutine (query, labels) =>

			if yield @queries[query].isCached()
				return
			return if interrupt()

			yield @queries[query].once 'ThreadsFetched.enter'
			return if interrupt()

			for id in (@queries[query].threads.map (thread) -> thread.id)
				@modifyLabels id, labels[0], labels[1]
		return if interrupt?()

		@add 'QueryLabelsSynced'


	FetchingLabels_enter: coroutine ->
		interrupt = @states.getInterruptEnter 'FetchingLabels'
		res = yield @req @api.users.labels.list, userId: 'me'
		return if interrupt?()
		@labels = res[0].labels
		@states.add 'LabelsFetched'


	Dirty_enter: ->
		@history_id = null


	initAutoLabelQueries: ->
		@queries = {}
		for query, labels of @config.query_labels
			@queries[query] = new GmailQuery


	isHistoryIdValid: ->
		@history_id and Date.now() < @last_sync_time + @sync_time_timeout


	isCached: (history_id) ->
		if not @isHistoryIdValid()
			yield @refreshHistoryId()

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


	modifyLabels: coroutine (thread_id, add_labels, remove_labels, interrupt) ->
		type thread_id, String
		add_labels ?= []
		remove_labels ?= []
		add_label_ids = @getLabelsIds add_labels
		remove_label_ids = @getLabelsIds remove_labels

		console.log "Modifing labels for thread #{thread_id}"
		yield @req @api.users.messages.modify,
			id: thread_id
			userId: 'me'
			resource:
				addLabelIds: add_label_ids
				removeLabelIds: remove_label_ids
		@add 'Dirty', add_labels.concat remove_labels

		# TODO
#    # sync the DB
#    thread = @threads?.threads?.find (thread) ->
#      thread.id is thread_id
#    return if not thread
#
#    for msg in thread.messages
#      msg.labelIds = msg.labelIds.without.apply msg.labelIds, remove_label_ids
#      msg.labelIds.push add_label_ids


	refreshHistoryId: coroutine (interrupt) ->
		try
			response = yield @req @api.users.history.list,
				userId: 'me'
				fields: 'historyId'
				startHistoryId: @gmail_history_id
			return if interrupt?()
			@gmail_history_id = response[0]
			@last_sync_time = Date.now()
			@drop 'Dirty'
		catch e # TODO catch only API exceptions
			console.error e
			return

		response[0].historyId


	getHistoryId: coroutine (abort) ->
		if not @history_id
			yield @refreshHistoryId()
		@history_id


	createThread: coroutine (raw_email, labels, interrupt) ->
		console.log "Creating email '#{task.title}'
						(#{@uncompletedThreadLabels().join ', '})"
		res = yield @req @api.users.messages.insert,
			userId: 'me'
			resource:
				raw: raw_email
				labelIds: @sync.getLabelsIds labels
		return if interrupt?()
		@add 'Dirty', labels
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


	getThreadTitle: (thread) ->
		thread.messages[0].payload.headers[0].value


	req: coroutine (method, params) ->
		yield @sync.req.apply @sync, arguments



module.exports = {
  Gmail
  States
}