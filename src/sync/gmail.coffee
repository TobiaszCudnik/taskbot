asyncmachine = require 'asyncmachine'
Promise = require 'bluebird'
coroutine = Promise.coroutine
{ GmailQuery } = require './gmail-query'
type = require '../type'


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
	history_id_timeout: 200
	history_id: null
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
		@states.pipeForward 'QueryLabelsSynced', @sync.states


	SyncingQueryLabels_enter: coroutine ->
		interrupt = @states.getInterruptEnter 'SyncingQueryLabels'

		yield Promise.all @queries.map coroutine (query, name) =>
			return if (yield query.isCached()) or interrupt()

			labels = @config.query_labels[name]

			yield query.states.whenOnce 'ThreadsFetched'
			return if interrupt()

			yield Promise.all query.threads.map coroutine (thread) =>
				yield @modifyLabels thread.id, labels[0], labels[1]

		return if interrupt?()

		@states.add 'QueryLabelsSynced'


	FetchingLabels_enter: coroutine ->
		interrupt = @states.getInterruptEnter 'FetchingLabels'
		res = yield @req @api.users.labels.list, userId: 'me'
		return if interrupt?()
		@labels = res[0].labels
		@states.add 'LabelsFetched'


	Dirty_enter: ->
		@history_id = null
		@states.drop 'Dirty'


	FetchingHistoryId_enter: coroutine (interrupt) ->
		response = yield @req @api.users.getProfile,
			userId: 'me'
			fields: 'historyId'
		return if interrupt?()
		@history_id = response[0].historyId
		@last_sync_time = Date.now()
		@states.drop 'Dirty'
		@states.add 'HistoryIdFetched'


	initAutoLabelQueries: ->
		@queries = {}
		for query, labels of @config.query_labels
			@queries[query] = new GmailQuery this, query
			@states.pipeForward 'Enabled', @queries[query].states


	isHistoryIdValid: ->
		@history_id and Date.now() < @last_sync_time + @history_id_timeout


	isCached: coroutine (history_id, abort) ->
		if not @isHistoryIdValid()
			if not @states.is 'FetchingHistoryId'
				@states.add 'FetchingHistoryId', abort
			yield @states.whenOnce 'HistoryIdFetched', abort

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
		@states.add 'Dirty', add_labels.concat remove_labels

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


	createThread: coroutine (raw_email, labels, interrupt) ->
		console.log "Creating email '#{task.title}'
						(#{@uncompletedThreadLabels().join ', '})"
		res = yield @req @api.users.messages.insert,
			userId: 'me'
			resource:
				raw: raw_email
				labelIds: @getLabelsIds labels
		return if interrupt?()
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


	getThreadTitle: (thread) ->
		thread.messages[0].payload.headers[0].value


	req: (method, params) ->
		@sync.req method, params



module.exports = {
  Gmail
  States
}