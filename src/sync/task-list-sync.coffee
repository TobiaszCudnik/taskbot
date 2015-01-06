States = require './task-list-sync-states'
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



class TaskListSync

	data: null
	name: null
#  @defineType 'data',
	list: null
	@defineType 'list', ITaskList, 'ITaskList'

	tasks_api: null
#  @defineType 'tasks_api', [ITask], '[ITask]'

	states: null
#  @defineType 'states', QueryStates, 'QueryStates'

	tasks: null
	tasks_completed_from: null
	threads: null

	@defineType 'labels', [ILabel], '[ILabel]'
#	@defineType 'completions_threads', [typedef {
#		type: String, time: Object
#	}], '[{completed: Boolean, time: Object}]'
#	@defineType 'completions_tasks', [typedef {
#		type: String, time: Object
#	}], '[{completed: Boolean, time: Object}]'

	sync: null
	query: null
	etags: null
	completions_tasks: null


	constructor: (@name, @data, @sync) ->
		@states = new States
		@states.setTarget @
		if process.env['DEBUG']
			@states.debug 'TaskList / ', process.env['DEBUG']
		@gmail_api = @sync.gmail_api
		@gmail = @sync.gmail
		@tasks_api = @sync.tasks_api
		@tasks_in_threads = []
		@tasks = []
		@etags = {}
		@completions_threads = {}
		@completions_tasks = {}
		@last_sync_time = null
		@query = @sync.gmail.createQuery @data.query, 'TaskList', yes
		# bind to query states
		@query.states.pipeForward 'ThreadsFetched', this.states
		@query.states.pipeForward 'MsgsFetched', this.states
		@states.pipeForward 'Enabled', @query.states


	# ----- -----
	# Transitions
	# ----- -----


	Restart_state: -> @states.add 'Syncing'


	Syncing_state: ->
		@push_dirty = no
		@last_sync_start = new Date()
		@last_sync_end = null
		@last_sync_time = null


	Synced_state: ->
		@sync.states.add 'Dirty' if @push_dirty
		@last_sync_end = new Date()
		@last_sync_time = @last_sync_end - @last_sync_start
		console.log "TaskList synced in: #{@last_sync_time}ms"


	# TODO a new flag state
	FetchingTasks_FetchingTasks: -> @FetchingTasks_state.apply this, arguments


	SyncingThreadsToTasks_state: coroutine ->
		abort = @states.getAbort 'SyncingThreadsToTasks'
		yield Promise.all @query.threads.map coroutine (thread) =>

			task = @getTaskForThread thread.id
			if task
				task_completed = @taskWasCompleted task.id
				thread_not_completed = @query.threadWasNotCompleted thread.id
				if task_completed and
						task_completed.unix() < thread_not_completed.unix()
					yield @uncompleteTask task.id, abort
			else
				yield @createTaskFromThread thread, abort

		return if abort?()
		@states.add ['ThreadsToTasksSynced', 'Synced']


	SyncingTasksToThreads_state: coroutine ->
		abort = @states.getAbort 'SyncingTasksToThreads'

		# loop over non completed tasks
		yield Promise.all @tasks.items.map coroutine (task) =>
			# TODO support children tasks
			return if not task.title or task.parent

			thread_id = @taskLinkedToThread task
			if thread_id
				thread_completed = @query.threadWasCompleted thread_id
				task_not_completed = @taskWasNotCompleted task.id
				if not (@query.threadSeen thread_id) or (thread_completed and
						thread_completed.unix() < task_not_completed.unix())
					yield @uncompleteThread thread_id, abort
			else
				thread = yield @createThreadForTask task, abort

		return if abort()
		@states.add ['TasksToThreadsSynced', 'Synced']


	SyncingCompletedThreads_state: coroutine ->
		abort = @states.getAbort 'SyncingCompletedThreads'

		yield Promise.all(@completions_threads
			.map coroutine (row, thread_id) =>
				return if not row.completed
				task = @getTaskForThread thread_id
				return if not task
				task_not_completed = @taskWasNotCompleted task.id
				if task_not_completed and
						row.time.unix() > task_not_completed.unix()
					yield @completeTask task.id, abort
		)

		return if abort()
		@states.add ['CompletedThreadsSynced', 'Synced']


	SyncingCompletedTasks_state: coroutine ->
		abort = @states.getAbort 'SyncingCompletedTasks'

		yield Promise.all @completions_tasks.map coroutine (row, task_id) =>
			return if not row.completed
			task = @getTask task_id
			return if not task
			thread_id = @taskLinkedToThread task
			thread_not_completed = @gmail.threadWasNotCompleted thread_id
			if thread_not_completed and row.time.unix() > thread_not_completed.unix()
				yield @completeThread thread_id, abort

		return if abort()
		@states.add ['CompletedTasksSynced', 'Synced']


	PreparingList_state: coroutine ->
		abort = @states.getAbort 'PreparingList'
		list = null

		# TODO? move?
		@def_title = @data.labels_in_title or @sync.config.labels_in_title

		# create or retrive task list
		for r in @sync.task_lists
			if @name == r.title
				list = r
				break

		if not list
			list = yield @createTaskList @name, abort
			# TODO assert the tick
			console.log "Creating tasklist '#{@name}'"

		@list = type list, ITaskList, 'ITaskList'
		@states.add 'ListReady'


	# TODO extract tasks fetching logic, reuse
	FetchingTasks_state: coroutine ->
		abort = @states.getAbort 'FetchingTasks'
		# fetch all non-completed and max 2-weeks old completed ones
		if not @tasks_completed_from or @tasks_completed_from < ago 3, "weeks"
			@tasks_completed_from = ago 2, "weeks"
		promises = [@fetchNonCompletedTasks @tasks_completed_from, abort]
		if not @etags.tasks_completed
			check_completion_ids = @tasks.map (task) -> task.id
			promises.push @fetchCompletedTasks abort
		yield Promise.all promises
		return if abort?()

		if check_completion_ids
			@processTasksCompletions check_completion_ids

		@states.add 'TasksFetched'


	PreparingList_state: coroutine ->
		abort = @states.getAbort 'PreparingList'
		list = null

		# TODO? move?
		@def_title = @data.labels_in_title or @sync.config.labels_in_title

		# create or retrive task list
		for r in @sync.task_lists
			if @name == r.title
				list = r
				break

		if not list
			list = yield @createTaskList @name, abort
			# TODO assert the tick
			console.log "Creating tasklist '#{@name}'"

		@list = type list, ITaskList, 'ITaskList'
		@states.add 'ListReady'


	# ----- -----
	# Methods
	# ----- -----

	processTasksCompletions: (ids) ->
		non_completed_ids = @tasks.map (task) -> task.id
		(ids.difference non_completed_ids).forEach (id) ->
			# time of completion is actually fake, but doesnt require a request
			@completions_tasks[id] = completed: yes, time: moment()


	isQueryCached: coroutine (abort) ->
		return if not @gmail_history_id
		history_id = yield @gmail.refreshHistoryId()
		return if abort?()
		if history_id is @gmail_history_id
			console.log "[CACHED] threads' list"
			return yes


	fetchNonCompletedTasks: coroutine (abort) ->
		response = yield @req @tasks_api.tasks.list,
			tasklist: @list.id
			fields: "etag,items(id,title,notes,updated,etag,status)"
			maxResults: 1000
			showCompleted: no
			etag: @etags.tasks
			
		if response[1].statusCode is 304
			console.log '[CACHED] tasks'
		else
			console.log '[FETCH] tasks'
			@etags.tasks = response[1].headers.etag
			response[0].items ?= []
			response[0].items.forEach (task) =>
				@completions_tasks[task.id] =
					completed: no
					time: moment task.completed

			@tasks = type response[0], ITasks, 'ITasks'


	fetchCompletedTasks: coroutine (update_min, abort) ->
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


	completeThread: coroutine (id, abort) ->
		console.log "Completing thread '#{id}'"
		yield @gmail.modifyLabels id, [], @uncompletedThreadLabels(), abort
		@push_dirty = yes
		return if abort?()
		@completions_threads[id] = completed: yes, time: moment()


	uncompleteThread: coroutine (id, abort) ->
		console.log "Un-completing thread '#{id}'"
		yield @gmail.modifyLabels id, @uncompletedThreadLabels(), [], abort
		@push_dirty = yes
		return if abort?()
		@completions_threads[id] = completed: no, time: moment()


	createThreadForTask: coroutine (task, abort) ->
		yield @gmail.createThread(
			@createEmail(task.title), @uncompletedThreadLabels(), abort
		)
		@push_dirty = yes


	# returns thread ID
	taskLinkedToThread: (task) ->
		if task.notes?.match /\bemail:\w+\b/
			(task.notes?.match /\bemail:(\w+)\b/)[1]


	linkTaskToThread: coroutine (task, thread_id, abort) ->
		task.notes ?= ""
		task.notes = "#{task.notes}\nemail:#{thread_id}"
		yield @req @tasks_api.tasks.patch,
			tasklist: @list.id
			task: task.id
			userId: 'me'
			resource:notes: task.notes
		@push_dirty = yes
		# TODO update the DB
		return if abort?()


	uncompletedThreadLabels: ->
		[].concat(
			@data['labels_new_task'] or []
			@sync.config.tasks.autoLabelQueries.labels_defaults?['labels_new_task'] or []
		)


	uncompleteTask: coroutine (task_id, abort) ->
		console.log "Un-completing task #{task_id}"
		res = yield @req @tasks_api.tasks.patch,
			tasklist: @list.id
			task: task_id
			resource:
				status: 'needsAction'
				completed: null
		@push_dirty = yes
		return if abort?()
		# TODO update the task in the db
		@completions_tasks[task_id] = completed: no, time: moment()


	completeTask: coroutine (task_id, abort) ->
		console.log "Completing task #{task_id}"
		yield @req @tasks_api.tasks.patch,
			tasklist: @list.id
			task: task_id
			resource:
				status: 'completed'
		@push_dirty = yes
		return if abort?()
		# TODO update the task in the db
		@completions_tasks[task_id] = completed: yes, time: moment()


	getAllTasks: -> @tasks.items.concat @tasks_completed.items or []


	fetchThreadForTask: coroutine (task, abort) ->
		thread_id = (task.notes?.match /\bemail:(\w+)\b/)[1]
		yield @fetchThread thread_id, null, abort


	req: coroutine (method, params) ->
		yield @sync.req.apply @sync, arguments


	# TODO abort
	syncTaskName: coroutine (task, thread) ->
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
			@push_dirty = yes


	createTaskList: coroutine (name, abort) ->
		res = yield @req @tasks_api.tasklists.insert,
			resource:title:name
		type res[1].body,
			ITaskList, 'ITaskList'


	createTaskFromThread: coroutine (thread, abort) ->
		type thread, IThread, 'IThread'

		title = @getTaskTitleFromThread thread
		console.log "Adding task '#{title}'"
		res = yield @req @tasks_api.tasks.insert,
			tasklist: @list.id
			resource:
				title: title
				notes: "email:#{thread.id}"
		@push_dirty = yes
		return if abort?()
		# TODO update the db

		type res[0], ITask, 'ITask'


	getTask: (task_id) ->
		@getAllTasks().find (task) ->
			task.id is task_id


	getTaskForThread: (thread_id) ->
		type thread_id, String

		task = @getAllTasks().find (task) ->
			task.notes?.match "email:#{thread_id}"

#		type task, ITask, 'ITask'


	getTaskTitleFromThread: (thread) ->
		type thread, IThread, 'IThread'
		title = @gmail.getTitleFromThread thread
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


	###
  TODO move to the gmail class
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


	taskWasCompleted: (id) ->
		if @completions_tasks[id]?.completed is yes
			@completions_tasks[id].time
		else no


	taskWasNotCompleted: (id) ->
		if @completions_tasks[id]?.completed is no
			@completions_tasks[id].time
		else no


module.exports = TaskListSync