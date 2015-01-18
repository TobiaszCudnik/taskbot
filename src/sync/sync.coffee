#thread = require './thread'
#Thread = thread.Thread
#label = require './label'
#Label = label.Label
auth = require '../auth'
TaskListSync = require './task-list-sync'
type = require '../type'
events = require 'events'

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



class Sync extends events.EventEmitter


	states: null
	config: null
	auth: null
	tasks_api: null
	gmail_api: null
	task_lists: null
	etags: null
	active_requests: null
	executed_requests: null
	@max_active_requests: 5

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
		@active_requests = 0
		@setMaxListeners 0

		@tasks_api = new google.tasks 'v1', auth: @auth.client
		@gmail_api = new google.gmail 'v1', auth: @auth.client

		@gmail = new Gmail this
		@states.pipe 'GmailEnabled', @gmail.states, 'Enabled'
		@states.pipe 'GmailSyncEnabled', @gmail.states, 'SyncingEnabled'
		@initTaskListsSync()

		@auth.pipe 'Ready', @states, 'Authenticated'

			
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


	# Schedule the next sync
	# TODO measure the time taken
	Synced_state: ->
		console.log '!!! SYNCED !!!'
		console.log "Requests: #{@executed_requests}"
		@last_sync_end = new Date()
		@last_sync_time = @last_sync_end - @last_sync_start
		console.log "Time: #{@last_sync_time}ms"
		clearTimeout @next_sync_timeout if @next_sync_timeout
		@next_sync_timeout = setTimeout (@states.addByListener 'Syncing'),
			@config.sync_frequency


	Syncing_state: ->
		console.log '--- SYNCING ---'
		@executed_requests = 0
		# TODO define in the prototype
		@last_sync_start = new Date()
		@last_sync_end = null
		@last_sync_time = null
		if @states.is 'Dirty'
			# Add after the transition
			@states.add @gmail.states, 'Dirty'
			@states.drop 'Dirty'
		else
			# Reset synced states in children
#			@states.drop @gmail.states, 'QueryLabelsSynced'
			@gmail.states.drop 'QueryLabelsSynced'
		for list in @task_lists_sync
			@states.add list.states, 'Restart'


	# ----- -----
	# Methods
	# ----- -----


	findTaskForThread: (thread_id) ->
		task = null
		list = null
		@task_lists_sync.each (list_sync) ->
			found = list_sync.getTaskForThread thread_id
			if found
				task = found
				list = list_sync

		[task, list]


	initTaskListsSync: ->
		for name, data of @config.tasks.queries
			continue if name is 'labels_defaults'
			task_list = new TaskListSync name, data, this
			@states.pipe 'TaskListSyncEnabled', task_list.states, 'Enabled', no
			task_list.states.pipe 'Synced', this.states, 'TaskListsSynced'
			task_list.states.pipe 'Syncing', this.states, 'SyncingTaskLists'
			# TODO handle error of non existing task list in the inner classes
			#			task_list.states.on 'Restart.enter', => @states.drop 'TaskListsFetched'
			@task_lists_sync.push task_list


	# TODO support the abort param
	req: coroutine (method, params) ->
		# wait until new request will be possible
		while @active_requests >= @constructor.max_active_requests
			yield new Promise (resolve) =>
				@once 'request-finished', resolve
		@active_requests++
#		console.log "@active_requests++"

		params ?= {}
		@log ['REQUEST', params], 3
		console.log params
		params.auth = @auth.client
		# TODO catch errors
		method = promisify method
		ret = yield method params
#		console.log "@active_requests--"
		@active_requests--
		@emit 'request-finished'
		@executed_requests++

#		delete params.auth
#		console.log params
#		console.log ret[0]
		ret


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