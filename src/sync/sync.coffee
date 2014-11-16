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
		@auth.pipeForward 'Ready', @states, 'Authenticated'

	Syncing_enter: coroutine ->
		@task_lists = yield @getTaskLists()
		# TODO port throttling from the imap client
		for name, query of @config.tasks.queries
			continue if name is 'labels_defaults'

			list = null
			# execute search queries
			value = yield Promise.all [
				@getThreads(query.query)
				do coroutine =>
					list = yield @getListForQuery name, query
					@getTasks list.id
			]

			threads = value[0].threads or []
			tasks = value[1].items or []

			tasks_in_threads = []
			for thread in threads
				task = yield @getTaskForThread thread, tasks, list.id
				tasks_in_threads.push task.id
#					yield @syncTaskName task, thread

			yield Promise.all [
				@createThreadFromTasks tasks, list.id, threads, query
				@markTasksAsCompleted tasks, list.id, tasks_in_threads
			]

			yield @req @tasks.tasks.clear, tasklist: list.id

		@states.add 'Synced'

	req: (method, params) ->
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

	getTaskLists: coroutine ->
		res = yield @req @tasks.tasklists.list
		type res[0].items,
			ITaskLists, 'ITaskLists'

	findTaskForThread: (tasks, thread) ->
		type tasks, [ITask], '[ITask]'
		type thread, IThread, 'IThread'

		task = tasks.find (item) ->
			# TODO indirect addressing via a dedicated task's note
			item.notes?.match "email:#{thread.id}"

		type task, (typedef.Optional ITask), '?ITask'

	createTaskFromThread: coroutine (thread, list_id) ->
		type list_id, String
		type thread, IThread, 'IThread'

		title = @getTaskTitleFromThread thread
		res = yield @req @tasks.tasks.insert,
			tasklist: list_id
			resource:
				title: title
				notes: "email:#{thread.id}"
		console.log "Task added '#{title}'"

		type res[0], ITask, 'ITask'

	createThreadFromTasks: (tasks, list_id, threads) ->
		# TODO loop thou not completed only?
		# Create new threads for new tasks.
		for task, k in tasks or []
			continue if task.status is 'completed'
			continue if task.notes.match /\bemail:\w+\b/

			# TODO extract
			labels = [].concat(
				@query['labels_new_task'] || []
				@config.queries.label_defaults?['new_task'] || []
			)

			subject = task.title
			console.log "Creating email '#{subject}'"
			mail = yield @req @gmail.users.messages.insert,
				user: 'me'
				resource: @createEmail subject

			threads = @gmail.getInboxThreads()

			for t in threads
				if subject is thread.getFirstMessageSubject()
					thread.addLabel label for label in labels
				# link the task and the thread
					task.notes ?= ""
					task.notes = "#{task.notes}\nemail:#{thread.id}"
					@tasks.Tasks.patch task, list_id, task.getId()
					break

	createEmail: (subject) ->
		type subject, String

		email = "From: #{@config.gmail_username}
			To: #{@config.gmail_username}
			Content-type: text/html;charset=utf-8
			MIME-Version: 1.0
			Subject: #{subject}"

		new Buffer(email).toString('base64')
			.replace(/\+/g, '-').replace(/\//g, '_')

	getTasks: coroutine (list_id) ->
		type list_id, String
		res = yield @req @tasks.tasks.list, tasklist: list_id
		type res[0], ITasks, 'ITasks'

	getTaskForThread: coroutine (thread, tasks, list_id)->
		type thread, IThread, 'IThread'
		type tasks, [ITask], '[ITask]'
		type list_id, String

		# TODO optimize by splicing the tasks array, skipping matched ones
		# TODO loop only on non-completed tasks
		task = @findTaskForThread tasks, thread

		if not task
			task = yield @createTaskFromThread thread, list_id
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

	getThreads: coroutine (query) ->
		type query, String
		res = yield @req @gmail.users.threads.list,
			q: query
			userId: "me"
		list = res[0]
		list.threads ?= []

		threads = yield Promise.all list.threads.map (item) =>
			console.log "Fetching thread ID #{item.id}"
			@req @gmail.users.threads.get,
				id: item.id
				userId: 'me'
				metadataHeaders: 'SUBJECT'
				format: 'metadata'
				fields: 'id,messages(id,labelIds,payload(headers))'

		list.threads = threads.map (item) -> item[0]

#		msg_part = list.threads[0].messages[0].payload
#		type msg_part, IMessagePart, 'IMessagePart'
#		type list.threads[0].messages[0], IMessage, 'IMessage'
#		type list.threads[0], IThread, 'IThread'
		type list, IThreads, 'IThreads'

#	taskEqualsThread: (task, thread) ->
#		thread.getId() == "email:#{task.getTitle()}"
#
#	tasksIncludeThread: (tasks, thread) ->
#		return ok for task in tasks if @taskEqualsThread task, thread

	markTasksAsCompleted: coroutine (tasks, list_id, exclude) ->
		type tasks, [ITask], '[ITask]'
		type list_id, String
		exclude ?= []
		# mark unmatched tasks as completed
		for task, k in tasks or []
			continue if (exclude.contains task.id) or task.status is 'completed'

			if /^email:/.test task.notes
				yield @req @tasks.tasks.patch,
					tasklist: list_id
					task: task.id
					resource:status: 'completed'
				console.log "Task completed by email - '#{task.title}'"

	getListForQuery: coroutine (name, data) ->
		type name, String
		type data, IQuery, 'IQuery'
		list = null

		# TODO? move?
		@def_title = data.labels_in_title || @config.labels_in_title

		console.log "Parsing tasks for query '#{name}'"

		# create or retrive task list
		for r in @task_lists
			if name == r.title
				list = r
				break

		if not list
			list = yield @createTaskList name
			console.log "Creating tasklist '#{name}'"

		list
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