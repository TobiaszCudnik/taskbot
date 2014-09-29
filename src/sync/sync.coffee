gmail = require './gmail-imap/connection'
auth = require './auth'
asyncmachine = require 'asyncmachine'
google = require 'googleapis'
tasks = google.tasks 'v1'
suspend = require 'suspend'
Promise = require 'bluebird'
go = suspend.resume
async = suspend.async

class States extends asyncmachine.AsyncMachine

	constructor: ->
		@register 'Ready', 'ImapConnected', 'ConnectingImap', 'Authenticating',
			'Authenticated'

	Ready:
		auto: yes
		requires: ['ImapConnected', 'Authenticated']

	ImapConnected:
		drops: ['ConnectingImap']

	ConnectingImap:
		drops: ['ImapConnected']

	Authenticating:
		drops: ['Authenticated']

	Authenticated:
		drops: ['Authenticating']

	Syncing:
		drops: ['Synced']

	Synced:
		drops: ['Syncing']

class Sync
	@states: null
	@settings: null
	@imap: null
	@auth: null
	@tasks: null

	constructor: (settings) ->
		@states = new States
		@settings = settings
		@imap = new gmail.Connection settings
		@auth = new auth.Auth settings
		@tasks = new tasks.Lists
		# TODO move queries to the config
		@imap.addQuery '*', 1000
#		@addQuery 'label:S-Pending', 5000
#		@addQuery 'label:sent', 5000
#		@addQuery 'label:P-test', 5000
		# TODO this returns untrue value
		@states.add 'Authenticating'
		@states.add 'ConnectingImap'

		@states.on 'ConnectingImap.enter', @ConnectingImap_enter
		@states.on 'Authenticating.enter', @Authenticating_enter
		@states.on 'Sync.enter', @Sync_enter
		@auth.pipeForward 'Ready', @states, 'Authenticated'
		@imap.pipeForward 'Ready', @states, 'ImapConnected'

	ConnectingImap_enter: async -> @imap.add 'Active'

	Sync_enter: promise ->
#		task_lists = @getTaskLists

		for name, data of @settings.queries
			continue if name is 'label_defaults'

			@query = data
			@query_name = name

			list = yield @getListForQuery name, data

			# execute search queries
			value = yield Promise.all(
				yield @getThreads data.query,
				yield @getTasks list.id
			)
			[ threads, tasks ] = [ value[0], value[1] ]

			tasks_in_threads = []
			for thread in threads
				res = yield @getTaskForThread thread, tasks_in_threads
				[ task, was_created ] = [ res[0], res[1] ]
				# TODO optimize slicing tasks_matched
				if not was_created
					tasks_in_threads.push ret
					yield @syncTaskName task, thread

			yield Promise.all(
				@createThreadFromTasks tasks, list_id, threads,
				@markTasksAsCompleted tasks, list_id, tasks_in_threads
			)

			yield Tasks.Tasks.clear list_id

	syncTaskName: (task, thread) ->
		# TODO

	createTaskList: (name) ->
		list = Tasks.newTaskList().setTitle name
		list_id = Tasks.Tasklists.insert(list).getId()

		list

	createTaskFromThread: (thread, list_id) ->
		title = @getTaskTitleFromThread thread
		task = Tasks.newTask()
			.setTitle( title )
			.setEtag( "email:#{thread.gmail_thread.getId()}" )
		Tasks.Tasks.insert task, list_id
		Logger.log "Task added - '#{title}'"

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
			mail = GmailApp.sendEmail Session.getUser().getEmail(), subject, ''
			threads = GmailApp.getInboxThreads()

			for t in threads
				if subject is thread.getFirstMessageSubject()
					thread.addLabel label for label in labels
				# link the task and the thread
					r.setEtag "email:#{thread.getId()}"
					Tasks.Tasks.patch r, list_id, r.getId()
					break

	getTaskLists: -> Tasks.Tasklists.list().getItems()

	getTasks: (list_id) ->
		Tasks.Tasks.list(list_id).getItems()
		Logger.log "Found '#{tasks?.length}' tasks"

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
		ret = ( new Thread thread for thread in GmailApp.search(query).reverse() )
		Logger.log "Found '#{ret.length}' threads"
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
				Tasks.Tasks.patch task, list_id, task.getId()
				Logger.log "Task completed by email - '#{task.getTitle()}'"

	getListForQuery: (query, data) ->
		list = list_id = null

		# TODO? move?
		@def_title = data.labels_in_title || @config.labels_in_title

		Logger.log "Parsing tasks for query '#{query}'"

		# create or retrive task list
		for r in task_lists
			if name == r.getTitle()
				list = r
				list_id = list.getId()
				break

		if not list_id
			list = @createTaskList name
			list_id = list.getId()
			Logger.log "Creating tasklist '#{name}'"

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
			Logger.log "Task completed, marked email - '#{task.getTitle()}' with labels '#{labels.join ' '}"
