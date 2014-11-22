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
coroutine = (require 'bluebird').coroutine
type = require '../type'

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
	tasks_in_threads: null
	# TODO put them in the sync class
	tasks: null
	threads: null
	@defineType 'labels', [ILabel], '[ILabel]'

	sync: null

	constructor: (@name, @data, @sync) ->
		@states = new QueryStates
		if @sync.config.debug
			@states.debug 'Query / ', @sync.config.debug
		@states.setTarget @
		@gmail_api = @sync.gmail_api
		@tasks_api = @sync.tasks_api
		@labels = @sync.labels
		@tasks_in_threads = []
		@tasks = []
		@threads = []

	# ----- -----
	# Transitions
	# ----- -----

	# TODO a new flag state
	FetchingTasks_FetchingTasks: @FetchingTasks_enter

	SyncingCompletedTasks_enter: coroutine ->
		interrupt = @states.getInterruptEnter 'SyncingCompletedTasks'
		# mark unmatched tasks as completed
		yield Promise.all @tasks.items.map coroutine (task, k) =>
			return if (@tasks_in_threads.contains task.id) or
				task.status is 'completed'

			if /^email:/.test task.notes
				yield @req @tasks_api.tasks.patch,
					tasklist: @list.id
					task: task.id
					resource:status: 'completed'
				console.log "Task completed by email - '#{task.title}'"
		return if interrupt?()
		yield @req @tasks_api.tasks.clear, tasklist: @list.id
		return if interrupt?()
		# TODO assert the tick
		@states.add ['CompletedTasksSynced', 'Synced']

	SyncingThreadsToTasks_enter: coroutine ->
		interrupt = @states.getInterruptEnter 'SyncingThreadsToTasks'
		yield Promise.all @threads.threads.map @getTaskForThread, @
		return if interrupt?()
		# TODO refresh tasks better to not loose ThreadsToTasksSynced
#    @drop 'TasksFetched'
		@states.add ['ThreadsToTasksSynced', 'Synced']

	SyncingTasksToThreads_enter: coroutine ->
		interrupt = @states.getInterruptEnter 'SyncingTasksToThreads'
		# TODO loop thou not completed only?
		# Create new threads for new tasks.
		@tasks_in_threads = []
		yield Promise.all @tasks.items.map coroutine (task, k) =>
			return if not task.title or
				task.status is 'completed' or
				task.notes?.match /\bemail:\w+\b/

			# TODO extract
			labels = ['INBOX'].concat(
				@data['labels_new_task'] or []
				@sync.config.tasks.queries.labels_defaults?['new_task'] or []
			)

			subject = task.title
			console.log "Creating email '#{subject}' (#{labels.join ', '})"
			thread = yield @req @gmail_api.users.messages.insert,
				userId: 'me'
				resource:raw: @createEmail subject
			return if interrupt?()

			#			for t in threads
			#				if subject is thread.messages[0].payload.headers[0].value
			labels_ids = labels.map (name) =>
				label = @labels.find (label) -> label.name is name
				label.id

			yield @req @gmail_api.users.messages.modify,
				id: thread[0].id
				userId: 'me'
				resource:addLabelIds: labels_ids
			return if interrupt?()
			# TODO assert the tick
			# link the task and the thread
			task.notes ?= ""
			task.notes = "#{task.notes}\nemail:#{thread[0].id}"
			yield @req @tasks_api.tasks.patch,
				tasklist: list_id
				task: task.id
				userId: 'me'
				resource:notes: task.notes
			return if interrupt?()
			@tasks_in_threads.push task.id
		return if interrupt?()
		@states.add ['TasksToThreadsSynced', 'Synced']

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
		res = yield @req @gmail_api.users.threads.list,
			q: @data.query
			userId: "me"
		query = res[0]
		query.threads ?= []
		return if interrupt?()

		threads = yield Promise.all query.threads.map (item) =>
			@req @gmail_api.users.threads.get,
				id: item.id
				userId: 'me'
				metadataHeaders: 'SUBJECT'
				format: 'metadata'
				fields: 'id,messages(id,labelIds,payload(headers))'
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
		res = yield @req @tasks_api.tasks.list,
			# TODO support cacheing
#			updatedMin: @list.updated
			tasklist: @list.id
			fields: "etag,items(id,title,notes,updated,etag,status)"
			maxResults: 1000
			showCompleted: no
		return if interrupt?()

		res[0].items ?= []
		@tasks = type res[0], ITasks, 'ITasks'
		@states.add 'TasksFetched'

	# ----- -----
	# Methods
	# ----- -----

	req: (method, params) ->
		@sync.req.apply @sync, arguments

	syncTaskName: coroutine (task, thread) ->
		# TODO

	createTaskList: coroutine (name, interrupt) ->
		interrupt = @states.getInterruptEnter 'SyncingCompletedTasks'
		res = yield @req @tasks_api.tasklists.insert,
			resource:title:name
		type res[1].body,
			ITaskList, 'ITaskList'

	createTaskFromThread: coroutine (thread, interrupt) ->
		type thread, IThread, 'IThread'

		title = @getTaskTitleFromThread thread
		res = yield @req @tasks_api.tasks.insert,
			tasklist: @list.id
			resource:
				title: title
				notes: "email:#{thread.id}"
		console.log "Task added '#{title}'"

		type res[0], ITask, 'ITask'

	createThreadFromTasks: coroutine (tasks, list_id, threads, query) ->

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

	getTaskForThread: coroutine (thread, interrupt) ->
		# TODO cache the task
		# TODO optimize by splicing the tasks array, skipping matched ones
		# TODO loop only on non-completed tasks
		type thread, IThread, 'IThread'

		task = @tasks.items.find (item) ->
			# TODO indirect addressing via a dedicated task's note
			item.notes?.match "email:#{thread.id}"

		if not task
			task = yield @createTaskFromThread thread
			return if interrupt?()
			# TODO store the task
			# TODO assert the tick
		#		else
		#			yield @markTasksAsCompleted [task], list_id

		@tasks_in_threads.push task.id
		type task, ITask, 'ITask'

	getTaskTitleFromThread: (thread) ->
		type thread, IThread, 'IThread'
		# TODO fuck
		title = thread.messages[0].payload.headers[0].value
		# TODO clenup
		#		return title if not @sync.config.def_title

		# TODO extract true missing labels
		extracted = @extractLabelsFromThreadName thread
#		missing =

		if @sync.config.tasks.labels_in_title in 1
			extracted[1].concat(extracted[0]).join ' '
		else
			[extracted[0].concat(extracted[1])].join ' '

	###
	@name string
	@return [ string, Array<Label> ]
	###
	extractLabelsFromThreadName: (thread) ->
		# TODO Aaaaa....
		name = thread.messages[0].payload.headers[0].value
		type name, String
		labels = []
		for r in @sync.config.auto_labels
			symbol = r.symbol
			label = r.label
			prefix = r.prefix
			name = name.replace "(\b|^)#{symbol}(\w+)", '', (label) ->
				labels.push label

		type name, String
		type labels, [String]
		[name, labels]

	###
	TODO not used ?!
	###
	markThreadAsCompleted: coroutine (thread, interrupt) ->
		# Mark the thread as completed.
		# TODO what???
		return if not @threadHasLabels thread, 'S/Completed'
		# TODO extract
		labels = [].concat(
			@data['labels_email_unmatched'] || []
			@sync.config.queries.label_defaults?['email_unmatched'] || []
		)

		yield thread.addLabels labels, interrupt
		console.log "Task completed, marked email - '#{thread.title}' with labels '#{labels.join ' '}"

	addLabels: coroutine (thread, labels, interrupt) ->
		type thread, IThread, 'IThread'
		type labels, [String]

		label_ids = labels.map (name) =>
			label = @labelByName name
			label.id
		type label_ids, [String]

		yield @req @gmail_api.users.messages.modify,
			id: thread[0].id
			userId: 'me'
			resource:addLabelIds: label_ids

	labelByName: (name) ->
		type @labels, [ILabels], '[ILabels]'
		@labels.find (label) -> label.name is name

	# Requires loaded threads
	threadHasLabels: (thread, label) ->
		label = @labelByName label
		type label, ILabel, 'ILabel'
		id = label.id
		for msg in thread.messages
			for label_id in msg.labelIds
				return yes if @labels.find (label) -> label.id is id
		no