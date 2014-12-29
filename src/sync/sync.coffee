#thread = require './thread'
#Thread = thread.Thread
#label = require './label'
#Label = label.Label
auth = require '../auth'
TaskListSync = require './task-list-sync'
type = require '../type'

asyncmachine = require 'asyncmachine'
google = require 'googleapis'
async = require 'async'
Promise = require 'bluebird'
{ Gmail } = require './gmail'
{ ApiError } = require '../exceptions'
Promise.longStackTraces()
coroutine = Promise.coroutine
promisify = Promise.promisify
#diff = require 'tracery/diff'

{
	ITaskList
	ITaskLists
	IQueryToTasklist
	IThread
	IThreads
	ITask
	ITasks
	IMessage
	IMessagePart
} = require './api-types'

class States extends asyncmachine.AsyncMachine


	Enabled: auto: yes


	Authenticating:
		auto: yes
		requires: ['Enabled']
		blocks: ['Authenticated']
	Authenticated:blocks: ['Authenticating']


	Syncing:
		auto: yes
		requires: ['Enabled', 'Authenticated']
		blocks: ['Synced']
	Synced:blocks: ['Syncing']


	TaskListSyncEnabled:
		auto: yes
		requires:	['Syncing', 'QueryLabelsSynced', 'TaskListsFetched']


	GmailSyncEnabled:
		auto: yes
		requires:	['Syncing']


	FetchingTaskLists:
		auto: yes
		requires: ['Syncing']
		blocks: ['TaskListsFetched']
	TaskListsFetched:blocks: ['FetchingTaskLists']


	QueryLabelsSynced: {}
	TaskListsSynced: {}


	constructor: ->
		super
		@registerAll()



class Sync


	states: null
	config: null
	auth: null
	tasks_api: null
	gmail_api: null
	task_lists: null
	autoLabelQueries: null
	etags: null

	history_id: null
	Object.defineProperty @::, 'history_id', set: (history_id) ->
		@historyId = Math.max @history_id, history_id

#	Sync.defineType 'auth', auth.Auth, 'auth.Auth'


	constructor: (@config) ->
		@states = new States
		@states.setTarget @
		if process.env['DEBUG']
			@states.debug 'Sync / ', process.env['DEBUG']
		@task_lists = []
		@labels = []
		@auth = new auth.Auth config
		@task_lists = []
		@etags = {}

		@tasks_api = new google.tasks 'v1', auth: @auth.client
		@gmail_api = new google.gmail 'v1', auth: @auth.client

		@gmail = new Gmail this
		@states.pipeForward 'GmailSyncEnabled', @gmail.states, 'Enabled'
		@initQueries()

		@auth.pipeForward 'Ready', @states, 'Authenticated'

			
	# ----- -----
	# Transitions
	# ----- -----


	FetchingTaskLists_state: coroutine ->
		abort = @states.getAbort 'FetchingTaskLists'
		# TODO throttle updates
		res = yield @req @tasks_api.tasklists.list, etag: @etags.task_lists
		if abort?()
			console.log 'abort', abort
			return
		if res[1].statusCode isnt 304
			console.log '[FETCHED] tasks lists'
			@etags.task_lists = res[1].headers.etag
			@task_lists = type res[0].items, ITaskLists, 'ITaskLists'
		else
			console.log '[CACHED] tasks lists'
		@states.add 'TaskListsFetched'


	# ----- -----
	# Methods
	# ----- -----


	initQueries: ->
		for name, data of @config.tasks.queries
			continue if name is 'labels_defaults'
			task_list = new TaskListSync name, data, this
			@states.pipeForward 'TaskListSyncEnabled', task_list.states, 'Enabled'
			# TODO handle error of non existing task list in the inner classes
			#			task_list.states.on 'Restart.enter', => @states.drop 'TaskListsFetched'
			@task_lists.push task_list


	scheduleNextSync: ->
		# Add new search only if there's a free limit.
		return no if @concurrency.length >= @max_concurrency
		# TODO skip searches which interval hasn't passed yet
		queries = @autoLabelQueries.sortBy "last_update"
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
				return (row isnt query)
			@log 'concurrency--'
			#			@addsLater 'HasMonitored', 'Delayed'
			# TODO Delayed?
			# TODO transaction?
			@add ['Delayed', 'HasMonitored']
			# Loop the fetching process
			@add 'Fetching'


	minInterval_: ->
		Math.min.apply null, @autoLabelQueries.map (ch) => ch.update_interval


#	findLatestHistoryId: ->
#		Math.max.apply Math, [@gmail.history_id].concat @tasks.queries.map (item) ->
#			item.history_id


	setDirty: ->
		@gmail.states.add 'Dirty'


	req: coroutine (method, params) ->
		params ?= {}
		if process.env['DEBUG'] > 1
			console.log 'REQUEST', params
		params.auth = @auth.client
		# TODO catch  reason: 'insufficientPermissions's
		method = promisify method
		yield method params



module.exports = {
	Sync
	States
}