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
	Synced:
		requires: ['Enabled', 'Authenticated', 'TaskListsSynced'
			'QueryLabelsSynced']
		blocks: ['Syncing']


	TaskListSyncEnabled:
		auto: yes
		requires:	['TaskListsFetched', 'QueryLabelsSynced']


	GmailEnabled:auto: yes
	GmailSyncEnabled:auto: yes


	FetchingTaskLists:
		auto: yes
		requires: ['Enabled']
		blocks: ['TaskListsFetched']
	TaskListsFetched:blocks: ['FetchingTaskLists']


	QueryLabelsSynced: {}


	SyncingTaskLists: {}
	TaskListsSynced: {}


	Dirty: {}


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
		@task_lists_sync = []
		@etags = {}

		@tasks_api = new google.tasks 'v1', auth: @auth.client
		@gmail_api = new google.gmail 'v1', auth: @auth.client

		@gmail = new Gmail this
		@states.pipeForward 'GmailEnabled', @gmail.states, 'Enabled'
		@states.pipeForward 'GmailSyncEnabled', @gmail.states, 'SyncingEnabled'
		@initQueries()

		@auth.pipeForward 'Ready', @states, 'Authenticated'

			
	# ----- -----
	# Transitions
	# ----- -----


	# Try to set Synced state in all deps
	QueryLabelsSynced_state: -> @states.add 'Synced'
	TaskListsSynced_state: -> @states.add 'Synced'

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


	TaskListsSynced_enter: ->
		@task_lists_sync.every (list) ->
			list.states.is 'Synced'


	SyncingTaskLists_exit: ->
		not @task_lists_sync.some (list) ->
			list.states.is 'Syncing'


	# Re-sync query labels if task list sync made some changes
	Synced_enter: ->
		if @states.is 'Dirty'
			@gmail.states.add 'Dirty'

			no


	# Schedule the next sync
	# TODO measure the time taken
	Synced_state: ->
		clearTimeout @next_sync_timeout if @next_sync_timeout
		@next_sync_timeout = setT`imeout (@states.addByListener 'Syncing'),
			@config.sync_frequency


	Syncing_state: ->
		# Reset synced states in children
		@gmail.states.drop 'QueryLabelsSynced'
		for list in @task_lists_sync
			list.states.add 'Restart'


	# ----- -----
	# Methods
	# ----- -----


	initQueries: ->
		for name, data of @config.tasks.queries
			continue if name is 'labels_defaults'
			task_list = new TaskListSync name, data, this
			@states.pipeForward 'TaskListSyncEnabled', task_list.states, 'Enabled'
			task_list.states.pipeForward 'Synced', this.states, 'TaskListsSynced'
			task_list.states.pipeForward 'Syncing', this.states, 'SyncingTaskLists'
			# TODO handle error of non existing task list in the inner classes
			#			task_list.states.on 'Restart.enter', => @states.drop 'TaskListsFetched'
			@task_lists_sync.push task_list


	req: coroutine (method, params) ->
		params ?= {}
		@log ['REQUEST', params], 3
		params.auth = @auth.client
		# TODO catch  reason: 'insufficientPermissions's
		method = promisify method
		yield method params


	log: (msgs, level) ->
		return if not process.env['DEBUG']
		return if level and level > process.env['DEBUG']
		if msgs not instanceof Array
			msgs = [msgs]
		console.log.apply console, msgs

module.exports = {
	Sync
	States
}