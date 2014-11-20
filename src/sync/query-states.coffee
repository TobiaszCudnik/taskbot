asyncmachine = require 'asyncmachine'

module.exports =
class QueryStates extends asyncmachine.AsyncMachine

	constructor: ->
		super
		@registerAll()

	Syncing:blockss: ['Synced']
	Synced:blockss: ['Syncing']

	# email threads
	FetchingThreads: auto: yes, requires: ['Syncing'], blocks: ['ThreadsFetched']
	ThreadsFetched:blocks: ['FetchingThreads']

	# list
	PreparingList:
		auto: yes
		requires: ['Syncing', 'TaskListsFetched']
		blocks: ['ListReady']
	ListReady: blocks: ['PreparingList']

	# tasks
	FetchingTasks:
		auto: yes
		requires: ['Syncing', 'ListReady']
		blocks: ['TasksFetched']
	TasksFetched: requires: ['ListReady'], blocks: ['FetchingTasks']

	# tasks
	SyncingThreadsToTasks:
		auto: yes
		requires: ['Syncing', 'TasksFetched', 'ThreadsFetched', 'LabelsFetched']
		blocks: ['ThreadsToTasksSynced']
	ThreadsToTasksSynced: blocks: ['SyncingThreadsToTasks']

	# thread-to-tasks
	SyncingThreadsToTasks:
		auto: yes
		requires: ['Syncing', 'TasksFetched', 'ThreadsFetched', 'LabelsFetched']
		blocks: ['ThreadsToTasksSynced']
	ThreadsToTasksSynced: blocks: ['SyncingThreadsToTasks']

	# complete tasks
	SyncingCompletedTasks:
		auto: yes
		requires: ['Syncing', 'ThreadsToTasksSynced']
		blocks: ['CompletedTasksSynced']
	CompletedTasksSynced:blocks: ['SyncingCompletedTasks']

	# tasks-to-threads
	SyncingTasksToThreads:
		auto: yes
		requires: ['Syncing', 'TasksFetched', 'ThreadsFetched', 'LabelsFetched']
		blocks: ['SyncingTasksToThreads']
	TasksToThreadsSynced:blocks: ['SyncingTasksToThreads']

	# labels
	FetchingLabels:
		auto: yes
		requires: ['Syncing']
		blockss: ['LabelsFetched']
	LabelsFetched:blocks: ['FetchingLabels']

	# task lists
	FetchingTaskLists:
		auto: yes
		requires: ['Syncing']
		blocks: ['TaskListsFetched']
	TaskListsFetched:blocks: ['FetchingTaskLists']

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