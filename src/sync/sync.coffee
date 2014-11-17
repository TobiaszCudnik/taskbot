#thread = require './thread'
#Thread = thread.Thread
#label = require './label'
#Label = label.Label
auth = require '../auth'
async = require 'async'
asyncmachine = require 'asyncmachine'
google = require 'googleapis'

Promise = require 'bluebird'
Promise.longStackTraces()
coroutine = Promise.coroutine
promisify = Promise.promisify

typedef = require 'tracery'
opt = typedef.Optional
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

type = (value, type, name) ->
	type = typedef type if Object.isArray type
	if not type value
		console.log value
		throw new TypeError name or ''
	value

promise_exception = (e) ->
	console.log e.errors if e.errors
	console.log (e.stack.split "\n").join "\n"

class States extends asyncmachine.AsyncMachine

	constructor: ->
		super
		@register 'Ready', 'Authenticating', 'Authenticated',
			'Syncing', 'Synced'

	Ready:
		auto: yes
		requires: ['Authenticated']

	Authenticating:
		blocks: ['Authenticated']

	Authenticated:
		blocks: ['Authenticating']

	Syncing:
		auto: yes
		requires: ['Ready']
		blocks: ['Synced']

	Synced:
		blocks: ['Syncing']

Function.prototype.defineType = (name, type, type_name) ->
	Object.defineProperty @::, name,
		set: (v) ->
			type v, ITaskLists, 'ITaskLists'
			@__task_lists = v
		get: -> @__task_lists


class Sync
	states: null
	config: null
	auth: null
	tasks: null
	gmail: null
	task_lists: null

	Sync.defineType 'task_lists', ITaskLists, 'ITaskLists'

	constructor: (@config) ->
		@states = new States
		(@states.debug 'Sync ', 2) if config.debug
		@task_lists = []
		@labels = []
		@auth = new auth.Auth config

		@tasks = new google.tasks 'v1', auth: @auth.client
#		Promise.promisifyAll @tasks.tasklists

		@gmail = new google.gmail 'v1', auth: @auth.client
		@states.add 'Authenticating'

		@states.on 'Syncing.enter', =>
			# async without a callback - fwd the exception
			console.log 'Syncing.enter'
			promise = @Syncing_enter()
			promise.catch promise_exception
		@states.on 'Syncing.enter', @Synced_enter
		@auth.pipeForward 'Ready', @states, 'Authenticated'

class Query extends asyncmachine.AsyncMachine

	query: null
	list: null
	tasks: null

	constructor: (@query) ->
		super
		# TODO type query
		@register 'Ready', 'Authenticating', 'Authenticated',
			'Syncing', 'Synced'

	Syncing:blocks: ['Synced']
	Synced:blocks: ['Syncing']

	# task lists
	FetchingTaskLists: requires: ['Syncing'], block: ['TaskListsFetched']
	TaskListsFetched:block: ['FetchingTaskLists']

	# labels
	FetchingLabels: requires: ['Syncing'], block: ['LabelsFetched']
	LabelsFetched:block: ['FetchingLabels']

	# email threads
	FetchingThreads: auto: yes, requires: ['Syncing'], block: ['ThreadsFetched']
	ThreadsFetched:block: ['FetchingThreads']

	# list
	PreparingList: auto: yes, requires: ['Syncing'], block: ['ListReady']
	ListReady: block: ['PreparingList']

	 # tasks
	FetchingTasks:
		auto: yes
		requires: ['Syncing', 'ListReady']
		block: ['TasksFetched']
	TasksFetched: requires: ['ListReady'], block: ['FetchingTasks']

	 # tasks
	SyncingThreadsToTasks:
		auto: yes
		requires: ['Syncing', 'TasksFetched', 'ThreadsFetched', 'LabelsFetched']
		block: ['ThreadsToTasksSynced']
	ThreadsToTasksSynced: block: ['SyncingThreadsToTasks']

	 # thread-to-tasks
	SyncingThreadsToTasks:
		auto: yes
		requires: ['Syncing', 'TasksFetched', 'ThreadsFetched', 'LabelsFetched']
		block: ['ThreadsToTasksSynced']
	ThreadsToTasksSynced: block: ['SyncingThreadsToTasks']

	 # complete tasks
	SyncingCompletedTasks:
		auto: yes
		requires: ['Syncing', 'ThreadsToTasksSynced']
		block: ['CompletedTasksSynced']
	CompletedTasksSynced:block: ['SyncingCompletedTasks']

	 # tasks-to-threads
	SyncingTasksToThreads:
		auto: yes
		requires: ['Syncing', 'TasksFetched', 'ThreadsFetched', 'LabelsFetched']
		block: ['SyncingTasksToThreads']
	TasksToThreadsSynced:block: ['SyncingTasksToThreads']

	# ----- transitions

	FetchingLabels_enter: coroutine ->
		res = yield @req @gmail.users.labels.list,
			userId: 'me'
		# TODO assert the tick
		@labels = res[0].labels
		@add 'LabelsFetched'

	FetchingTaskLists_enter: coroutine ->
		res = yield @req @tasks.tasklists.list
		@task_lists = type res[0].items,
			ITaskLists, 'ITaskLists'
		# TODO assert the tick
		@add 'TaskListsFetched'

	# TODO a new flag state
	FetchingTasks_FetchingTasks: @FetchingTasks_enter

	SyncingCompletedTasks_enter: coroutine ->
		# mark unmatched tasks as completed
		for task, k in @tasks or []
			continue if (@tasks_in_threads.contains task.id) or
				task.status is 'completed'

			if /^email:/.test task.notes
				yield @req @tasks.tasks.patch,
					tasklist: @list.id
					task: task.id
					resource:status: 'completed'
				console.log "Task completed by email - '#{task.title}'"
		# TODO assert the tick
		yield @req @tasks.tasks.clear, tasklist: list.id
		# TODO assert the tick
		@add 'CompletedTasksSynced'

	SyncingThreadsToTasks_enter: coroutine ->
		yield Promise.all @threads.map @getTaskForThread
		# TODO assert the tick
		@add 'ThreadsToTasksSynced'

	SyncingTasksToThreads_enter: coroutine ->
		# TODO loop thou not completed only?
		# Create new threads for new tasks.
		@tasks_in_threads = []
		for task, k in @tasks or []
			continue if not task.title or
				task.status is 'completed' or
				task.notes?.match /\bemail:\w+\b/

			# TODO extract
			labels = ['INBOX'].concat(
				@query['labels_new_task'] || []
				@config.tasks.queries.labels_defaults?['new_task'] || []
			)

			subject = task.title
			console.log "Creating email '#{subject}' (#{labels.join ', '})"
			thread = yield @req @gmail.users.messages.insert,
				userId: 'me'
				resource:raw: @createEmail subject

			#			for t in threads
			#				if subject is thread.messages[0].payload.headers[0].value
			labels_ids = labels.map (name) =>
				label = @labels.find (label) -> label.name is name
				label.id

			yield @req @gmail.users.messages.modify,
				id: thread[0].id
				userId: 'me'
				resource:addLabelIds: labels_ids
			# link the task and the thread
			task.notes ?= ""
			task.notes = "#{task.notes}\nemail:#{thread[0].id}"
			yield @req @tasks.tasks.patch,
				tasklist: list_id
				task: task.id
				userId: 'me'
				resource:notes: task.notes
		@tasks_in_threads.push task.id
		# TODO assert the tick
		@add 'ThreadsToTasksSynced'

	PreparingList_enter: ->
		@name
		list = null

		# TODO? move?
		@def_title = @query.labels_in_title or @config.labels_in_title

		# create or retrive task list
		for r in @task_lists
			if @name == r.title
				list = r
				break

		if not list
			list = yield @createTaskList @name
			console.log "Creating tasklist '#{@name}'"

		@list = type list, ITasks, 'ITasks'
		@add 'ListReady'

	FetchingThreads_enter: ->
		res = yield @req @gmail.users.threads.list,
			q: @query.query
			userId: "me"
		query = res[0]
		query.threads ?= []

		threads = yield Promise.all query.threads.map (item) =>
			@req @gmail.users.threads.get,
				id: item.id
				userId: 'me'
				metadataHeaders: 'SUBJECT'
				format: 'metadata'
				fields: 'id,messages(id,labelIds,payload(headers))'

		query.threads = threads.map (item) -> item[0]

		#		msg_part = list.threads[0].messages[0].payload
		#		type msg_part, IMessagePart, 'IMessagePart'
		#		type list.threads[0].messages[0], IMessage, 'IMessage'
		#		type list.threads[0], IThread, 'IThread'
		@threads = type query, IThreads, 'IThreads'

	FetchingTasks_enter: coroutine ->
		res = yield @req @tasks.tasks.list,
			updatedMin: @
			tasklist: @list.id
			fields: "etag,items(id,title,notes)"
			maxResults: 1000
			showCompleted: no
		# TODO assert the tick
		@tasks = type res[0], ITasks, 'ITasks'
		@add 'TasksFetched'

#	Syncing_enter: coroutine ->
#		# If-None-Match
#
#		for name, query of @config.tasks.queries
#			continue if name is 'labels_defaults'
#
#			console.log "Parsing query '#{name}'"
#
#			list = null
#			# execute search queries
#			value = yield Promise.all [
#				@getThreads(query.query)
#				do coroutine =>
#					list = yield @getListForQuery name, query
#					@getTasks list.id
#				prefetch_labels
#			]
#
#			threads = value[0].threads or []
#			tasks = value[1].items or []
#
#			console.log "Found #{threads.length} threads"
#			console.log "Found #{tasks.length} tasks"
#
#			tasks_in_threads = []
#			yield Promise.all threads.map coroutine (thread) =>
#				task = yield @getTaskForThread thread, tasks, list.id
#				tasks_in_threads.push task.id
##					yield @syncTaskName task, thread
#
#			yield Promise.all [
#				@createThreadFromTasks tasks, list.id, threads, query
#				@markTasksAsCompleted tasks, list.id, tasks_in_threads
#			]
#
#
#		@states.add 'Synced'

	req: (method, params) ->
		console.log 'REQUEST'
		console.dir params
		params ?= {}
		params.auth = @auth.client
		# TODO catch  reason: 'insufficientPermissions's
		(promisify method) params

	syncTaskName: coroutine (task, thread) ->
		yield true

	createTaskList: coroutine (name) ->
		res = yield @req @tasks.tasklists.insert,
			resource:title:name
		type res[1].body,
			ITaskList, 'ITaskList'

	createTaskFromThread: coroutine (thread) ->
		type thread, IThread, 'IThread'

		title = @getTaskTitleFromThread thread
		res = yield @req @tasks.tasks.insert,
			tasklist: @list.id
			resource:
				title: title
				notes: "email:#{thread.id}"
		console.log "Task added '#{title}'"

		type res[0], ITask, 'ITask'

	createThreadFromTasks: coroutine (tasks, list_id, threads, query) ->

	createEmail: (subject) ->
		type subject, String

		email = ["From: #{@config.gmail_username} <#{@config.gmail_username}>s"
			"To: #{@config.gmail_username}"
			"Content-type: text/html;charset=utf-8"
			"MIME-Version: 1.0"
			"Subject: #{subject}"].join "\r\n"

		new Buffer(email).toString('base64')
			.replace(/\+/g, '-').replace(/\//g, '_')

	getTaskForThread: coroutine (thread)->
		# TODO optimize by splicing the tasks array, skipping matched ones
		# TODO loop only on non-completed tasks

		task = @tasks.find (item) ->
			# TODO indirect addressing via a dedicated task's note
			item.notes?.match "email:#{thread.id}"

		if not task
			task = yield @createTaskFromThread thread
#		else
#			yield @markTasksAsCompleted [task], list_id

		type task, ITask, 'ITask'

	getTaskTitleFromThread: (thread) ->
		title = thread.messages[0].payload.headers[0].value
		# TODO clenup
#		return title if not @config.def_title

		# TODO extract true missing labels
		extracted = @extractLabelsFromThreadName thread
		if @config.def_title is 1
			"#{extracted[1].join ' '} #{extracted[0]}"
		else
			"#{extracted[0]} #{extracted[1].join ' '}"

	###
	@name string
	@return [ string, Array<Label> ]
	###
	extractLabelsFromThreadName: (thread) ->
		# TODO Aaaaa....
		name = thread.messages[0].payload.headers[0].value
		labels = []
		for r in @config.auto_labels
			symbol = r.symbol
			label = r.label
			prefix = r.prefix
			name = name.replace "(\b|^)#{symbol}(\w+)", '', (label) ->
				labels.push label

		type [name, labels], typedef.Vector [
			String, [String]
		]

#	taskEqualsThread: (task, thread) ->
#		thread.getId() == "email:#{task.getTitle()}"
#
#	tasksIncludeThread: (tasks, thread) ->
#		return ok for task in tasks if @taskEqualsThread task, thread
#
#	# TODO move to Thread class
#
#	markThreadAsCompleted: (thread) ->
#		# Mark the thread as completed.
#		if thread.getStatus() is 'completed'
#			# TODO extract
#			labels = [].concat(
#				@query['labels_email_unmatched'] || []
#				@config.queries.label_defaults?['email_unmatched'] || []
#			)
#			thread.addLabels labels
#			console.log "Task completed, marked email - '#{task.getTitle()}' with labels '#{labels.join ' '}"

module.exports = {
	Sync
	States
}