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
	gmail_history_id: null

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


	Syncing_enter: ->
		@timer = new Date()


	Synced_enter: ->
		console.log "Synced in: #{new Date() - @timer}ms"
		setTimeout (@states.addLater 'Restart'), 1000


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

		# loop over non completed tasks
		yield Promise.all @tasks.items.map coroutine (task) =>
			# TODO support children tasks
			return if not task.title or task.parent

			thread_id = @taskLinkedToThread task
			if thread_id
				thread_completed = @threadWasCompleted thread_id
				task_not_completed = @taskWasNotCompleted task.id
				if not (@threadSeen thread_id) or (thread_completed and
						thread_completed.unix() < task_not_completed.unix())
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

		# TODO share history id across all queries
		if yield @isQueryCached interrupt
			@states.add 'ThreadsFetched'
			return

		query = yield @fetchQuery interrupt
		return if interrupt?()
		@threads = type query, IThreads, 'IThreads'

		yield @obtainLatestHistoryId interrupt
		return if interrupt?()

		non_completed_ids = query.threads.map (thread) -> thread.id
		@processThreadsCompletions non_completed_ids
		@states.add 'ThreadsFetched'


	# TODO extract tasks fetching logic, reuse
	FetchingTasks_enter: coroutine ->
		interrupt = @states.getInterruptEnter 'FetchingTasks'
		# fetch all non-completed and max 2-weeks old completed ones
		if not @tasks_completed_from or @tasks_completed_from < ago 3, "weeks"
			@tasks_completed_from = ago 2, "weeks"
		promises = [@fetchNonCompletedTasks @tasks_completed_from, interrupt]
		if not @etags.tasks_completed
			check_completion_ids = @tasks.map (task) -> task.id
			promises.push @fetchCompletedTasks interrupt
		yield Promise.all promises
		return if interrupt?()

		if check_completion_ids
			@processTasksCompletions check_completion_ids

		@states.add 'TasksFetched'

	# ----- -----
	# Methods
	# ----- -----

	processTasksCompletions: (ids) ->
		non_completed_ids = @tasks.map (task) -> task.id
		(ids.difference non_completed_ids).forEach (id) ->
			# time of completion is actually fake, but doesnt require a request
			@completions_tasks[id] = completed: yes, time: moment()

	# TODO ensure all the threads are downloaded (stream per page if required)
	fetchQuery: coroutine (interrupt) ->
		console.log "[FETCH] threads' list"
		res = yield @req @gmail_api.users.threads.list,
			q: @data.query
			userId: "me"
			fields: "threads(historyId,id)"
		return if interrupt?()
		query = res[0]
		query.threads ?= []

		# TODO clear entires older than 1 week
		# TODO figure out completion dates from the history analysis
		query.threads = yield Promise.all query.threads.map coroutine (thread) =>
			completion = @completions_threads[thread.id]
			# update the completion if thread is new or completion status has changed
			if completion?.completed or not completion
				@completions_threads[thread.id] = completed: no, time: moment()

			yield @fetchThread thread.id, thread.historyId, interrupt

		query


	isQueryCached: coroutine (interrupt) ->
		return if not @gmail_history_id
		history_id = yield @fetchLatestHistoryId()
		return if interrupt?()
		if history_id is @gmail_history_id
			console.log "[CACHED] threads' list"
			return yes

	obtainLatestHistoryId: coroutine (interrupt) ->
		# for the first time, figure out the latest history ID from msgs
		@gmail_history_id ?= @threads.threads.reduce (history_id, thread) ->
			Math.max history_id or 0, thread.historyId
		# then update it to the newest one
		@gmail_history_id = yield @fetchLatestHistoryId interrupt


	# complete threads not found in the query results
	processThreadsCompletions: (non_completed_ids) ->
		@completions_threads.each (row, id) ->
			# TODO build non_completed
			return if id in non_completed_ids
			return if row.completed
			row.completed = yes
			row.time = moment()
			console.log "Marking thread as completed by query #{id}"

	fetchLatestHistoryId: coroutine (interrupt) ->
		try
			response = yield @req @gmail_api.users.history.list,
				userId: 'me'
				fields: 'historyId'
				startHistoryId: @gmail_history_id
			return if interrupt?()
		catch e # TODO catch only API exceptions
			console.log e
			return

		response[0].historyId


	fetchNonCompletedTasks: coroutine (interrupt) ->
		response = yield @req @tasks_api.tasks.list,
			tasklist: @list.id
			fields: "etag,items(id,title,notes,updated,etag,status)"
			maxResults: 1000
			showCompleted: no
			etag: @etags.tasks
			
		if response[1].statusCode is 304
			console.log '[CACHED] tasks'
		else
			console.log '[FETCHED] tasks'
			@etags.tasks = response[1].headers.etag
			response[0].items ?= []
			response[0].items.forEach (task) =>
				@completions_tasks[task.id] =
					completed: no
					time: moment task.completed

			@tasks = type response[0], ITasks, 'ITasks'


	fetchCompletedTasks: coroutine (update_min, interrupt) ->
		response = yield @req @tasks_api.tasks.list,
			updatedMin: timestamp new Date @tasks_completed_from
			tasklist: @list.id
			fields: "etag,items(id,title,notes,updated,etag,status,completed)"
			maxResults: 1000
			showCompleted: yes
			etag: @etags.tasks_completed
			
		if response[1].statusCode is 304
			console.log '[CACHED] completed tasks'
		else
			console.log '[FETCHED] completed tasks'
			@etags.tasks_completed = response[1].headers.etag
			response[0].items ?= []
			response[0].items = response[0].items.filter (item) ->
				item.status is 'completed'
			response[0].items.forEach (task) =>
				@completions_tasks[task.id] =
					completed: yes
					time: moment task.completed

			@tasks_completed = type response[0], ITasks, 'ITasks'


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
		@completions_tasks[task_id] = completed: yes, time: moment()


	getAllTasks: -> @tasks.items.concat @tasks_completed.items or []


	fetchThreadForTask: coroutine (task, interrupt) ->
		thread_id = (task.notes?.match /\bemail:(\w+)\b/)[1]
		yield @fetchThread thread_id


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

#		type task, ITask, 'ITask'


	fetchThread: coroutine (thread_id, history_id, interrupt) ->
		type thread_id, String
		type history_id, String

		thread = @threads?.threads?.find (thread) ->
			thread.id is thread_id and thread.historyId is history_id

		if not thread or thread.historyId isnt history_id
			console.log "[FETCH] thread #{thread_id}"
			thread = yield @req @gmail_api.users.threads.get,
				id: thread_id
				userId: 'me'
				metadataHeaders: 'SUBJECT'
				format: 'metadata'
				fields: 'id,historyId,messages(id,historyId,labelIds,payload(headers))'
			thread[0].messages ?= []
			thread = thread[0]

		type thread, IThread, 'IThread'


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
		# TODO handle non existing threads
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


	threadSeen: (id) ->
		Boolean @completions_threads[id]
