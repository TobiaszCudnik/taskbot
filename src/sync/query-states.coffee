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
		requires: ['TasksToThreadsSynced', 'CompletedTasksSynced',
			'ThreadsToTasksSynced']

	Restart:blocks: ['ThreadsFetched', 'TasksFetched', 'CompletedTasksSynced',
		'ThreadsToTasksSynced', 'TasksToThreadsSynced']

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
		blocks: ['TasksToThreadsSynced']
	TasksToThreadsSynced:blocks: ['SyncingTasksToThreads']

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
