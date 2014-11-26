QueryStates = require './query-states'
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
	ILabel
} = require './api-types'
Promise = require 'bluebird'
coroutine = Promise.coroutine
type = require '../type'
typedef = require 'tracery'
# TODO loose
timestamp = require 'internet-timestamp'
# TODO loose
ago = require 'ago'
moment = require 'moment'

module.exports =
class Query

	data: null
	name: null
#  @defineType 'data',
	list: null
	@defineType 'list', ITaskList, 'ITaskList'

	tasks_api: null
#  @defineType 'tasks_api', [ITask], '[ITask]'

	states: null
#  @defineType 'states', QueryStates, 'QueryStates'

	labels: null
	tasks: null
	tasks_in_threads: null
	tasks_completed: null
	threads: null

	@defineType 'labels', [ILabel], '[ILabel]'
#	@defineType 'completions_threads', [typedef {
#		type: String, time: Object
#	}], '[{completed: Boolean, time: Object}]'
#	@defineType 'completions_tasks', [typedef {
#		type: String, time: Object
#	}], '[{completed: Boolean, time: Object}]'

	sync: null
	etags: null
	seen_threads: null
	completions_threads: null
	completions_tasks: null

	constructor: (@name, @data, @sync) ->
		@states = new QueryStates
		if @sync.config.debug
			@states.debug 'Query / ', @sync.config.debug
		@states.setTarget @
		@gmail_api = @sync.gmail_api
		@tasks_api = @sync.tasks_api
		@tasks_in_threads = []
		@tasks = []
		@threads = []
		@etags = {}
		@completions_threads = {}
		@completions_tasks = {}

	# ----- -----
	# Transitions
	# ----- -----

	Restart_enter: -> @states.add 'Syncing'

	Synced_enter: ->
		setTimeout (@states.addLater 'Restart'), 5000

	# TODO a new flag state
	FetchingTasks_FetchingTasks: @FetchingTasks_enter

	SyncingThreadsToTasks_enter: coroutine ->
		interrupt = @states.getInterruptEnter 'SyncingThreadsToTasks'
		yield Promise.all @threads.threads.map coroutine (thread) =>

			task = @getTaskForThread thread.id
			if task
				task_completed = @taskWasCompleted task.id
				thread_not_completed = @threadWasNotCompleted thread.id
				if task_completed and
						task_completed.unix() < thread_not_completed.unix()
					yield @uncompleteTask task.id, interrupt
			else
				yield @createTaskFromThread thread, interrupt
			return if interrupt?()
		@states.add ['ThreadsToTasksSynced', 'Synced']

	SyncingTasksToThreads_enter: coroutine ->
		interrupt = @states.getInterruptEnter 'SyncingTasksToThreads'

		yield Promise.all @tasks.items.map coroutine (task) =>
			# TODO support children tasks
			return if not task.title or task.parent

			thread_id = @taskLinkedToThread task
			if thread_id
				thread_completed = @threadWasCompleted thread_id
				task_not_completed = @taskWasNotCompleted task.id
				if thread_completed and thread_completed.unix() < task_not_completed.unix()
					yield @uncompleteThread thread_id, interrupt
			else
				thread = yield @createThreadForTask task, interrupt

		return if interrupt()
		@states.add ['TasksToThreadsSynced', 'Synced']

	SyncingCompletedThreads_enter: coroutine ->
		interrupt = @states.getInterruptEnter 'SyncingCompletedThreads'

		yield Promise.all(@completions_threads
			.map coroutine (row, thread_id) =>
				return if not row.completed
				task = @getTaskForThread thread_id
				return if not task
				task_not_completed = @taskWasNotCompleted task.id
				if task_not_completed and
						row.time.unix() > task_not_completed.unix()
					yield @completeTask task.id, interrupt
		)

		return if interrupt()
		@states.add ['CompletedThreadsSynced', 'Synced']

	SyncingCompletedTasks_enter: coroutine ->
		interrupt = @states.getInterruptEnter 'SyncingCompletedTasks'

		yield Promise.all @completions_tasks.map coroutine (row, task_id) =>
			return if not row.completed
			task = @getTask task_id
			return if not task
			thread_id = @taskLinkedToThread task
			thread_not_completed = @threadWasNotCompleted thread_id
			if thread_not_completed and row.time.unix() > thread_not_completed.unix()
				yield @completeThread thread_id, interrupt

		return if interrupt()
		@states.add ['CompletedTasksSynced', 'Synced']

	PreparingList_enter: coroutine ->
		interrupt = @states.getInterruptEnter 'PreparingList'
		list = null

		# TODO? move?
		@def_title = @data.labels_in_title or @sync.config.labels_in_title

		# create or retrive task list
		for r in @sync.task_lists
			if @name == r.title
				list = r
				break

		if not list
			list = yield @createTaskList @name, interrupt
			# TODO assert the tick
			console.log "Creating tasklist '#{@name}'"

		@list = type list, ITaskList, 'ITaskList'
		@states.add 'ListReady'

	FetchingThreads_enter: coroutine ->
		interrupt = @states.getInterruptEnter 'FetchingThreads'
		# TODO ensure all the threads are downloaded (stream per page if required)
		res = yield @req @gmail_api.users.threads.list,
			q: @data.query
			userId: "me"
			etag: @etags.threads
		return if interrupt?()
		if res[1].statusCode is 304
			console.log '[CACHED] threads'
			@states.add 'ThreadsFetched'
			# TODO updated completions times
			return
		@etags.threads = res[1].headers.etag
		query = res[0]
		query.threads ?= []

		# TODO clear entires older than 1 week
		# TODO figure out completion dates from the history analysis
		non_completed = []
		threads = yield Promise.all query.threads.map (thread) =>
			non_completed.push thread.id
			completion = @completions_threads[thread.id]
			if completion?.completed or not completion
				@completions_threads[thread.id] = completed: no, time: moment()
			# TODO cache msgs
			@req @gmail_api.users.threads.get,
				id: thread.id
				userId: 'me'
				metadataHeaders: 'SUBJECT'
				format: 'metadata'
				fields: 'id,messages(id,labelIds,payload(headers))'
		@completions_threads.each (row, id) ->
			return if id in non_completed
			return if not row.completed
			row.completed = yes
			row.time = moment()
		return if interrupt?()

		query.threads = threads.map (item) -> item[0]

		#		msg_part = list.threads[0].messages[0].payload
		#		type msg_part, IMessagePart, 'IMessagePart'
		#		type list.threads[0].messages[0], IMessage, 'IMessage'
		#		type list.threads[0], IThread, 'IThread'
		@threads = type query, IThreads, 'IThreads'
		@states.add 'ThreadsFetched'

	FetchingTasks_enter: coroutine ->
		interrupt = @states.getInterruptEnter 'FetchingTasks'
		# fetch all non-completed and max 2-weeks old completed ones
		if not @tasks_completed_from or @tasks_completed_from < ago 3, "weeks"
			@tasks_completed_from = ago 2, "weeks"
		requests = []
		requests.push @req @tasks_api.tasks.list,
			tasklist: @list.id
			fields: "etag,items(id,title,notes,updated,etag,status)"
			maxResults: 1000
			showCompleted: no
			etag: @etags.tasks
		requests.push @req @tasks_api.tasks.list,
			updatedMin: timestamp new Date @tasks_completed_from
			tasklist: @list.id
			fields: "etag,items(id,title,notes,updated,etag,status,completed)"
			maxResults: 1000
			showCompleted: yes
			etag: @etags.tasks_completed
		[action_res, completed_res] = yield Promise.all requests
		return if interrupt?()
		# Action tasks
		if action_res[1].statusCode is 304
			console.log '[CACHED] tasks'
		else
			console.log '[FETCHED] tasks'
			@etags.tasks = action_res[1].headers.etag
			action_res[0].items ?= []
			action_res[0].items.forEach (task) =>
				@completions_tasks[task.id] =
					completed: no
					time: moment task.completed
			@tasks = type action_res[0], ITasks, 'ITasks'
		# Last completed tasks
		if completed_res[1].statusCode is 304
			console.log '[CACHED] completed tasks'
		else
			console.log '[FETCHED] completed tasks'
			@etags.tasks_completed = completed_res[1].headers.etag
			completed_res[0].items ?= []
			completed_res[0].items = completed_res[0].items.filter (item) ->
				item.status is 'completed'
			completed_res[0].items.forEach (task) =>
				@completions_tasks[task.id] =
					completed: yes
					time: moment task.completed
			@tasks_completed = type completed_res[0], ITasks, 'ITasks'
		@states.add 'TasksFetched'

	# ----- -----
	# Methods
	# ----- -----

	completeThread: coroutine (id, interrupt) ->
		console.log "Completing thread '#{id}'"
		yield @modifyLabels id, [], @uncompletedThreadLabels(), interrupt
		return if interrupt?()
		@completions_threads[id] = completed: yes, time: moment()

	uncompleteThread: coroutine (id, interrupt) ->
		console.log "Un-completing thread '#{id}'"
		yield @modifyLabels id, @uncompletedThreadLabels(), [], interrupt
		return if interrupt?()
		@completions_threads[id] = completed: no, time: moment()

	createThreadForTask: coroutine (task, interrupt) ->
		console.log "Creating email '#{task.title}'
					(#{@uncompletedThreadLabels().join ', '})"
		res = yield @req @gmail_api.users.messages.insert,
			userId: 'me'
			resource:
				raw: @createEmail task.title
				labelIds: @getLabelsIds @uncompletedThreadLabels()
		return if interrupt?()
		thread = res[0]
		@threads.threads.push thread
		return if interrupt?()
		yield @linkTaskToThread task, thread.id, interrupt
		return if interrupt?()

		thread

	# returns thread ID
	taskLinkedToThread: (task) ->
		if task.notes?.match /\bemail:\w+\b/
			(task.notes?.match /\bemail:(\w+)\b/)[1]

	linkTaskToThread: coroutine (task, thread_id, interrupt) ->
		task.notes ?= ""
		task.notes = "#{task.notes}\nemail:#{thread_id}"
		yield @req @tasks_api.tasks.patch,
			tasklist: @list.id
			task: task.id
			userId: 'me'
			resource:notes: task.notes
		# TODO update the DB
		return if interrupt?()

	uncompletedThreadLabels: ->
		[].concat(
			@data['labels_new_task'] or []
			@sync.config.tasks.queries.labels_defaults?['labels_new_task'] or []
		)

	uncompleteTask: coroutine (task_id, interrupt) ->
		console.log "Un-completing task #{task_id}"
		res = yield @req @tasks_api.tasks.patch,
			tasklist: @list.id
			task: task_id
			resource:
				status: 'needsAction'
				completed: null
		return if interrupt?()
		# TODO update the task in the db
		@completions_tasks[task_id] = completed: no, time: moment()

	completeTask: coroutine (task_id, interrupt) ->
		console.log "Completing task #{task_id}"
		yield @req @tasks_api.tasks.patch,
			tasklist: @list.id
			task: task_id
			resource:
				status: 'completed'
		return if interrupt?()
		# TODO update the task in the db
		@completions_tasks[task_id] = completed: no, time: moment()

	getAllTasks: -> @tasks.items.concat @tasks_completed.items or []

	fetchThreadForTask: coroutine (task) ->
		thread_id = (task.notes?.match /\bemail:(\w+)\b/)[1]
		res = yield @req @gmail_api.users.threads.get,
			id: thread_id
			userId: 'me'
		# TODO read the msgs
		# TODO cache it
		# TODO check if thread should be uncompleted
		return res[0]

	req: coroutine (method, params) ->
		yield @sync.req.apply @sync, arguments

	syncTaskName: coroutine (task, thread) ->
		title = thread.messages[0].payload.headers[0].value
		title = @getTaskTitleFromThread thread
		if task.title isnt title
			console.log "Updating task title to \"#{title}\""
			# TODO use etag
			res = yield @req @tasks_api.tasks.patch,
				tasklist: @list.id
				task: task.id
				resource:
					title: title
			task.title = title

	createTaskList: coroutine (name, interrupt) ->
		res = yield @req @tasks_api.tasklists.insert,
			resource:title:name
		type res[1].body,
			ITaskList, 'ITaskList'

	createTaskFromThread: coroutine (thread, interrupt) ->
		type thread, IThread, 'IThread'

		title = @getTaskTitleFromThread thread
		console.log "Adding task '#{title}'"
		res = yield @req @tasks_api.tasks.insert,
			tasklist: @list.id
			resource:
				title: title
				notes: "email:#{thread.id}"
		return if interrupt?()
		# TODO update the db

		type res[0], ITask, 'ITask'

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

	getTask: (task_id) ->
		@getAllTasks().find (task) ->
			task.id is task_id

	getTaskForThread: (thread_id) ->
		type thread_id, String

		task = @getAllTasks().find (task) ->
			task.notes?.match "email:#{thread_id}"

		type task, ITask, 'ITask'

	getTaskTitleFromThread: (thread) ->
		type thread, IThread, 'IThread'
		# TODO fuck
		title = thread.messages[0].payload.headers[0].value
		# TODO clenup
		#		return title if not @sync.config.def_title

		[title, labels] = @getlabelsFromTitle title
		# TODO add labels from the thread
		# remove labels defining this query list
		for label in @data.labels_new_task
			labels = labels.without label

		# encode auto labels again, for readability

		if @sync.config.tasks.labels_in_title is 1
			labels.concat(title).join ' '
		else
			[title].concat(labels).join ' '

	getLabelsIds: (labels) ->
		if not Object.isArray labels
			labels = [labels]
		labels.map (name) =>
			label = @sync.labels.find (label) ->
				label.name.toLowerCase() is name.toLowerCase()
			label.id

	###
	@name string
	@return [ string, Array<Label> ]
	###
	getlabelsFromTitle: (title) ->
		type title, String
		labels = []
		for r in @sync.config.auto_labels
			symbol = r.symbol
			label = r.label
			prefix = r.prefix
			name = if r.shortcut then r.shortcut else "\\w+"
			title = title.replace "\b#{symbol}(#{name})\b", '', (name) ->
				labels.push prefix + (label or name)
		title = title.trim()

		type name, String
		type labels, [String]
		[title, labels]

	modifyLabels: coroutine (thread_id, add_labels, remove_labels, interrupt) ->
		type thread_id, String
		add_labels ?= []
		remove_labels ?= []

		console.log "Modifing labels for thread #{thread_id}"
		yield @req @gmail_api.users.messages.modify,
			id: thread_id
			userId: 'me'
			resource:
				addLabelIds: @getLabelsIds add_labels
				removeLabelIds: @getLabelsIds remove_labels
		# TODO sync the DB
		return if interrupt?()

	labelByName: (name) ->
		type @sync.labels, [ILabel], '[ILabel]'
		@sync.labels.find (label) -> label.name is name

	# Requires loaded threads
	threadHasLabels: (thread, label) ->
		label = @labelByName label
		type label, ILabel, 'ILabel'
		id = label.id
		for msg in thread.messages
			for label_id in msg.labelIds
				return yes if @sync.labels.find (label) -> label.id is id
		no

	taskWasCompleted: (id) ->
		if @completions_tasks[id]?.completed is yes
			@completions_tasks[id].time
		else no

	taskWasNotCompleted: (id) ->
		if @completions_tasks[id]?.completed is no
			@completions_tasks[id].time
		else no

	threadWasCompleted: (id) ->
		if @completions_threads[id]?.completed is yes
			@completions_threads[id].time
		else no

	threadWasNotCompleted: (id) ->
		if @completions_threads[id]?.completed is no
			@completions_threads[id].time
		else no
