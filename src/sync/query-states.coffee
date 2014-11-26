asyncmachine = require 'asyncmachine'

module.exports =
class QueryStates extends asyncmachine.AsyncMachine

	constructor: ->
		super
		@registerAll()

	Syncing:blocks: ['Synced', 'Restart']
	Synced:
		auto: yes
		blocks: ['Syncing']
		requires: ['CompletedTasksSynced', 'ThreadsToTasksSynced',
			'TasksToThreadsSynced', 'CompletedTasksSynced']

	Restart:blocks: ['ThreadsFetched', 'TasksFetched', 'CompletedTasksSynced',
		'ThreadsToTasksSynced', 'TasksToThreadsSynced', 'CompletedTasksSynced']

	# email threads
	FetchingThreads:
		auto: yes
		requires: ['Syncing']
		blocks: ['ThreadsFetched']
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

	# thread-to-tasks
	SyncingThreadsToTasks:
		auto: yes
		requires: ['Syncing', 'TasksFetched', 'ThreadsFetched', 'LabelsFetched']
		blocks: ['ThreadsToTasksSynced']
	ThreadsToTasksSynced: blocks: ['SyncingThreadsToTasks']

	# tasks-to-threads
	SyncingTasksToThreads:
		auto: yes
		requires: ['Syncing', 'TasksFetched', 'ThreadsFetched', 'LabelsFetched']
		blocks: ['TasksToThreadsSynced']
	TasksToThreadsSynced:blocks: ['SyncingTasksToThreads']

	# complete threads
	SyncingCompletedThreads:
		auto: yes
		requires: ['Syncing', 'TasksFetched', 'ThreadsFetched', 'LabelsFetched']
		blocks: ['CompletedThreadsSynced']
	CompletedThreadsSynced:blocks: ['SyncingCompletedThreads']

	# complete tasks
	SyncingCompletedTasks:
		auto: yes
		requires: ['Syncing', 'TasksFetched', 'ThreadsFetched', 'LabelsFetched']
		blocks: ['CompletedTasksSynced']
	CompletedTasksSynced:blocks: ['SyncingCompletedTasks']

	# TODO
#	ClearingCompletedTasks

	# TODO
#	SyncingTaskNames: {}

	# ----- External States

	# labels
	FetchingLabels:
		auto: yes
		requires: ['Syncing']
		blocks: ['LabelsFetched']
	LabelsFetched:blocks: ['FetchingLabels']

	# task lists
	FetchingTaskLists:
		auto: yes
		requires: ['Syncing']
		blocks: ['TaskListsFetched']
	TaskListsFetched:blocks: ['FetchingTaskLists']
