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
} = require './api-types'

type = (value, type, name) ->
	type = typedef type if Object.isArray type
	if not type value
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
		for name, data of @config.tasks.queries
			continue if name is 'labels_defaults'

			@query = data
			@query_name = name

			list = yield @getListForQuery name, data

			# execute search queries
			value = yield Promise.all [
				@getThreads data.query
				@getTasks list.id
			]

			threads = value[0].threads
			tasks = value[1].items or []

			tasks_in_threads = []
			for thread in threads
				res = yield @getTaskForThread thread, tasks_in_threads, list.id
				task = res[0]
				was_created = res[1]
				# TODO optimize slicing tasks_matched
				if not was_created
					tasks_in_threads.push ret
					yield @syncTaskName task, thread

			yield Promise.all [
				@createThreadFromTasks tasks, list.id, threads,
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

	createTaskFromThread: coroutine (thread, list_id) ->
		type list_id, String
		type thread, IThread, 'IThread'

		title = @getTaskTitleFromThread thread
		task = yield @req @tasks.tasks.insert,
			tasklist: list_id
			resource:
				title: title
				etag: "email:#{thread.id}"
		console.log "Task added - '#{title}'"

		type task, ITask, 'ITask'
#
#	createThreadFromTasks: (tasks, list_id, threads) ->
#		# TODO loop thou not completed only?
#		# Create new threads for new tasks.
#		for r, k in tasks or []
#			continue if r.getStatus() is 'completed'
#			continue if r.getEtag().test /^email:/
#
#			# TODO extract
#			labels = [].concat(
#				@query['labels_new_task'] || []
#				@config.queries.label_defaults?['new_task'] || []
#			)
#
#			subject = r.getTitle()
#			mail = @gmail.sendEmail Session.getUser().getEmail(), subject, ''
#			threads = @gmail.getInboxThreads()
#
#			for t in threads
#				if subject is thread.getFirstMessageSubject()
#					thread.addLabel label for label in labels
#				# link the task and the thread
#					r.setEtag "email:#{thread.getId()}"
#					@tasks.Tasks.patch r, list_id, r.getId()
#					break
#
#
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
		else
			yield @markAsCompleted task

		type task, ITask, 'ITask'

	findTaskForThread: (tasks, thread) ->
		# TODO

	getTaskTitleFromThread: (thread) ->
		title = thread.title
		# TODO what?
#		return title if not @def_title

		missing_labels = @extractLabelsFromThreadName thread
		if @def_title is 1
			title = "#{missing_labels} #{title}"
		else
			title = "#{title} #{missing_labels}"

#	###
#	@name string
#	@return [ string, Array<Label> ]
#	###
	extractLabelsFromThreadName: (name) ->
		labels = []
		for r in @config.auto_labels
			symbol = r.symbol
			label = r.label
			prefix = r.prefix
			name = name.replace "(\b|^)#{symbol}(\w+)", '', (label) ->
				# TODO this is wrong..
				labels.push label

		ret [name, labels]

	getThreads: coroutine (query) ->
		type query, String
		res = yield @req @gmail.users.threads.list,
			q: query
			userId: "me"
		list = res[0]
		threads = yield Promise.all list.threads.map (item) =>
			console.log "Fetching thread ID #{item.id}"
			@req @gmail.users.threads.get,
				id: item.id
				userId: 'me'
				metadataHeaders: 'SUBJECT'
				fields: 'messages(id,labelIds,payload(headers))'
		console.log threads
		list.threads = threads

		console.log list
		type list, IThreads, 'IThreads'

#	taskEqualsThread: (task, thread) ->
#		thread.getId() == "email:#{task.getTitle()}"
#
#	tasksIncludeThread: (tasks, thread) ->
#		return ok for task in tasks if @taskEqualsThread task, thread
#
#	markTasksAsCompleted: (tasks, list_id, exclude) ->
#		# mark unmatched tasks as completed
#		for task, k in tasks or []
#			continue if (exclude.contains k) or task.getStatus() is 'completed'
#
#			if not /^email:/.test task.getEtag()
#				task.setStatus 'completed'
#				@tasks.Tasks.patch task, list_id, task.getId()
#				console.log "Task completed by email - '#{task.getTitle()}'"

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