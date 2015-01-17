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
		'TasksToThreadsSynced', 'CompletedThreadsSynced', 'TasksCached']


	# list
	PreparingList:
		auto: yes
		requires: ['Syncing']
		blocks: ['ListReady']
	ListReady: blocks: ['PreparingList']


	# tasks
	FetchingTasks:
		auto: yes
		requires: ['Syncing', 'ListReady']
		blocks: ['TasksFetched']
	TasksFetched: requires: ['ListReady'], blocks: ['FetchingTasks']
	TasksCached: {}


	# thread-to-tasks
	SyncingThreadsToTasks:
		auto: yes
		requires: ['Syncing', 'TasksFetched', 'MsgsFetched']
		blocks: ['ThreadsToTasksSynced']
	ThreadsToTasksSynced: blocks: ['SyncingThreadsToTasks']


	# tasks-to-threads
	SyncingTasksToThreads:
		auto: yes
		requires: ['Syncing', 'TasksFetched', 'ThreadsFetched']
		blocks: ['TasksToThreadsSynced']
	TasksToThreadsSynced:blocks: ['SyncingTasksToThreads']


	# complete threads
	SyncingCompletedThreads:
		auto: yes
		requires: ['Syncing', 'TasksFetched', 'ThreadsFetched']
		blocks: ['CompletedThreadsSynced']
	CompletedThreadsSynced:blocks: ['SyncingCompletedThreads']


	# complete tasks
	SyncingCompletedTasks:
		auto: yes
		requires: ['Syncing', 'TasksFetched', 'ThreadsFetched']
		blocks: ['CompletedTasksSynced']
	CompletedTasksSynced:blocks: ['SyncingCompletedTasks']


#	SyncingTaskNames: {}


	# ----- External States


	ThreadsFetched: {}


	MsgsFetched: {}


	constructor: ->
		super
		@registerAll()



module.exports = States