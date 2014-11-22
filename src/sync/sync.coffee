#thread = require './thread'
#Thread = thread.Thread
#label = require './label'
#Label = label.Label
auth = require '../auth'
Query = require './query'
type = require '../type'

asyncmachine = require 'asyncmachine'
google = require 'googleapis'
async = require 'async'
Promise = require 'bluebird'
Promise.longStackTraces()
coroutine = Promise.coroutine
promisify = Promise.promisify
#diff = require 'tracery/diff'

{
	ITaskList
	ITaskLists
	IQuery
	IThread
	IThreads
	ITask
	ITasks
	IMessage
	IMessagePart
} = require './api-types'

promise_exception = (e) ->
	console.log e.errors if e.errors
	console.log (e.stack.split "\n").join "\n"

class States extends asyncmachine.AsyncMachine

	constructor: ->
		super
		@registerAll()

	Enabled: auto: yes, blocks: ['Disabled']
	Disabled:
		auto: yes
		blocks: ['Enabled']

	Authenticating:
		auto: yes
		requires: ['Enabled']
		blocks: ['Authenticated']
	Authenticated:blocks: ['Authenticating']

	Syncing:
		auto: yes
		requires: ['Enabled']
		blocks: ['Synced']
	Synced:blocks: ['Syncing']

	# labels
	FetchingLabels:
		auto: yes
		requires: ['Enabled', 'Authenticated']
		blocks: ['LabelsFetched']
	LabelsFetched:blocks: ['FetchingLabels']

	# task lists
	FetchingTaskLists:
		auto: yes
		requires: ['Enabled', 'Authenticated']
		blocks: ['TaskListsFetched']
	TaskListsFetched:blocks: ['FetchingTaskLists']

class Sync
	states: null
	config: null
	auth: null
	tasks_api: null
	gmail_api: null
	task_lists: null
	queries: null
	etags: null

#	Sync.defineType 'auth', auth.Auth, 'auth.Auth'

	constructor: (@config) ->
		@states = new States
		@states.setTarget @
		if @config.debug
			@states.debug 'Sync / ', @config.debug
		@task_lists = []
		@labels = []
		@auth = new auth.Auth config
		@queries = []
		@etags = {}

		@tasks_api = new google.tasks 'v1', auth: @auth.client
		@gmail_api = new google.gmail 'v1', auth: @auth.client

		@initQueries()

		@auth.pipeForward 'Ready', @states, 'Authenticated'

	initQueries: ->
		for name, data of @config.tasks.queries
			continue if name is 'labels_defaults'
			query = new Query name, data, @
			@states.pipeForward 'LabelsFetched', query.states
			@states.pipeForward 'TaskListsFetched', query.states
			@states.pipeForward 'Enabled', query.states, 'Syncing'
			query.states.on 'Restart.enter', => @states.drop 'TaskListsFetched'
			@queries.push query

	# ----- -----
	# Transitions
	# ----- -----

	Syncing_enter: ->
		(query.states.add 'Syncing') for query in @queries

	FetchingLabels_enter: coroutine ->
		interrupt = @states.getInterruptEnter 'FetchingLabels'
		res = yield @req @gmail_api.users.labels.list, userId: 'me'
		return if interrupt?()
		@labels = res[0].labels
		@states.add 'LabelsFetched'

	FetchingTaskLists_enter: coroutine ->
		interrupt = @states.getInterruptEnter 'FetchingTaskLists'
		# TODO throttle updates
		res = yield @req @tasks_api.tasklists.list, etag: @etags.task_lists
		if interrupt?()
			console.log 'interrupt', interrupt
			return
		if res[1].statusCode isnt 304
			@etags.task_lists = res[1].headers.etag
			@task_lists = type res[0].items,
				ITaskLists, 'ITaskLists'
		else
			console.log '[CACHED] tasks lists'
		@states.add 'TaskListsFetched'

	# ----- -----
	# Methods
	# ----- -----

	req: (method, params, previous) ->
		params ?= {}
		if @config.debug
			console.log 'REQUEST', params
		params.auth = @auth.client
		# TODO catch  reason: 'insufficientPermissions's
		(promisify method) params

module.exports = {
	Sync
	States
}