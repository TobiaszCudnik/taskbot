asyncmachine = require 'asyncmachine'



class States extends asyncmachine.AsyncMachine


	Enabled: {}


	Syncing:
		auto: yes
		requires: ['Enabled']
		blocks: ['Synced', 'Restart']
	Synced:
		blocks: ['Syncing']
		requires: ['CompletedTasksSynced', 'ThreadsToTasksSynced',
			'TasksToThreadsSynced', 'CompletedThreadsSynced']


	Restart:blocks: ['TasksFetched', 'CompletedTasksSynced', 'ThreadsToTasksSynced',
		'TasksToThreadsSynced', 'CompletedThreadsSynced']


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
		requires: ['Syncing', 'TasksFetched', 'LabelsFetched', 'MsgsFetched']
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


#	SyncingTaskNames: {}


	# ----- External States

	# labels
	FetchingLabels: {}
	LabelsFetched: {}


	# task lists
	FetchingTaskLists: {}
	TaskListsFetched: {}


	SyncingQueryLabels: {}
	QueryLabelsSynced: {}


	FetchingThreads: {}
	ThreadsFetched: {}


	FetchingMsgs: {}
	MsgsFetched: {}


	constructor: ->
		super
		@registerAll()



module.exports = States