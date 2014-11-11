thread = require './thread'
Thread = thread.Thread
label = require './label'
Label = label.Label
auth = require '../auth'
asyncmachine = require 'asyncmachine'
google = require 'googleapis'
suspend = require 'suspend'
Promise = require 'bluebird'
go = suspend.resume
async = suspend.async
promise = suspend.promise

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

class Sync
	states: null
	config: null
	auth: null
	tasks: null
	gmail: null

	constructor: (@config) ->
		@states = new States
		(@states.debug 'Sync ', 2) if config.debug
		@auth = new auth.Auth config
		@tasks = new google.tasks 'v1', auth: @auth.client
		@gmail = new google.gmail 'v1', auth: @auth.client
		# TODO move queries to the config
#		@addQuery 'label:S-Pending', 5000
#		@addQuery 'label:sent', 5000
#		@addQuery 'label:P-test', 5000
		@states.add 'Authenticating'

		@states.on 'Syncing.enter', @Syncing_enter.bind @
		@auth.pipeForward 'Ready', @states, 'Authenticated'

	Syncing_enter: promise ->
#		task_lists = @getTaskLists
		# TODO port throttling from the imap client
		for name, data of @config.tasks.queries
			continue if name is 'label_defaults'

			@query = data
			@query_name = name

			list = yield @getListForQuery name, data

			# execute search queries
			value = yield Promise.all(
				yield @getThreads data.query
				yield @getTasks list.id
			)
			threads = value[0]
			tasks = value[1]

			tasks_in_threads = []
			for thread in threads
				res = yield @getTaskForThread thread, tasks_in_threads
				task = res[0]
				was_created = res[1]
				# TODO optimize slicing tasks_matched
				if not was_created
					tasks_in_threads.push ret
					yield @syncTaskName task, thread

			yield Promise.all(
				@createThreadFromTasks tasks, list_id, threads,
				@markTasksAsCompleted tasks, list_id, tasks_in_threads
			)

			yield @tasks.Tasks.clear list_id

		@states.add 'Synced'

	syncTaskName: (task, thread) ->
		# TODO

	createTaskList: (name) ->
		list = @tasks.newTaskList().setTitle name
		list_id = @tasks.Tasklists.insert(list).getId()

		list

	createTaskFromThread: (thread, list_id) ->
		title = @getTaskTitleFromThread thread
		task = @tasks.newTask()
			.setTitle( title )
			.setEtag( "email:#{thread.gmail_thread.getId()}" )
		@tasks.Tasks.insert task, list_id
		console.log "Task added - '#{title}'"

		task

	createThreadFromTasks: (tasks, list_id, threads) ->
		# TODO loop thou not completed only?
		# Create new threads for new tasks.
		for r, k in tasks or []
			continue if r.getStatus() is 'completed'
			continue if r.getEtag().test /^email:/

			# TODO extract
			labels = [].concat(
				@query['labels_new_task'] || []
				@config.queries.label_defaults?['new_task'] || []
			)

			subject = r.getTitle()
			mail = @gmail.sendEmail Session.getUser().getEmail(), subject, ''
			threads = @gmail.getInboxThreads()

			for t in threads
				if subject is thread.getFirstMessageSubject()
					thread.addLabel label for label in labels
				# link the task and the thread
					r.setEtag "email:#{thread.getId()}"
					@tasks.Tasks.patch r, list_id, r.getId()
					break

	getTaskLists: -> @tasks.Tasklists.list().getItems()

	getTasks: (list_id) ->
		@tasks.Tasks.list(list_id).getItems()
		console.log "Found '#{tasks?.length}' tasks"

	getTaskForThread: (thread, tasks)->
		# TODO optimize by splicing the tasks array, skipping matched ones
		# TODO loop only on non-completed tasks
		task = @findTaskForThread tasks, thread

		if not task
			task = @createTaskFromThread thread
		else
			@markAsCompleted task

		task

	getTaskTitleFromThread: (thread) ->
		title = thread.getName()
		return title is @def_title

		missing_labels = @extractLabelsFromThreadName thread, task
		if @def_title is 1
			title = "#{missing_labels} #{title}"
		else
			title = "#{title} #{missing_labels}"

	###
	@name string
	@return [ string, Array<Label> ]
	###
	extractLabelsFromThreadName: (name) ->
		labels = []
		for r in config.autolabels
			symbol = r.symbol
			label = r.label
			prefix = r.prefix
			name = name.replace "(\b|^)#{symbol}(\w+)", '', (label) ->
				# TODO this is wrong..
				labels.push label

		ret [name, labels]

	getThreads: (query) ->
		ret = ( new Thread thread for thread in @gmail.search(query).reverse() )
		console.log "Found '#{ret.length}' threads"
		ret

	taskEqualsThread: (task, thread) ->
		thread.getId() == "email:#{task.getTitle()}"

	tasksIncludeThread: (tasks, thread) ->
		return ok for task in tasks if @taskEqualsThread task, thread

	markTasksAsCompleted: (tasks, list_id, exclude) ->
		# mark unmatched tasks as completed
		for task, k in tasks or []
			continue if (exclude.contains k) or task.getStatus() is 'completed'

			if not /^email:/.test task.getEtag()
				task.setStatus 'completed'
				@tasks.Tasks.patch task, list_id, task.getId()
				console.log "Task completed by email - '#{task.getTitle()}'"

	getListForQuery: (query, data) ->
		list = null
		list_id = null

		# TODO? move?
		@def_title = data.labels_in_title || @config.labels_in_title

		console.log "Parsing tasks for query '#{query}'"

		# create or retrive task list
		for r in task_lists
			if name == r.getTitle()
				list = r
				list_id = list.getId()
				break

		if not list_id
			list = @createTaskList name
			list_id = list.getId()
			console.log "Creating tasklist '#{name}'"

		list

	# TODO move to Thread class

	markThreadAsCompleted: (thread) ->
		# Mark the thread as completed.
		if thread.getStatus() is 'completed'
			# TODO extract
			labels = [].concat(
				@query['labels_email_unmatched'] || []
				@config.queries.label_defaults?['email_unmatched'] || []
			)
			thread.addLabels labels
			console.log "Task completed, marked email - '#{task.getTitle()}' with labels '#{labels.join ' '}"

module.exports = {
	Sync
	States
}