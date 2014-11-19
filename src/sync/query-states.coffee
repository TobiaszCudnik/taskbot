module.exports =
class QueryStates extends asyncmachine.AsyncMachinex

  constructor: (@query) ->
    super
    # TODO type query
    @register 'Ready', 'Authenticating', 'Authenticated',
      'Syncing', 'Synced'

  Syncing:blocks: ['Synced']
  Synced:blocks: ['Syncing']

  # task lists
  FetchingTaskLists:
    auto: yes
    requires: ['Syncing']
    block: ['TaskListsFetched']
  TaskListsFetched:block: ['FetchingTaskLists']

  # labels
  FetchingLabels:block: ['LabelsFetched']
  LabelsFetched:block: ['FetchingLabels']

  # email threads
  FetchingThreads: auto: yes, requires: ['Syncing'], block: ['ThreadsFetched']
  ThreadsFetched:block: ['FetchingThreads']

  # list
  PreparingList: auto: yes, requires: ['Syncing'], block: ['ListReady']
  ListReady: block: ['PreparingList']

  # tasks
  FetchingTasks:
    auto: yes
    requires: ['Syncing', 'ListReady']
    block: ['TasksFetched']
  TasksFetched: requires: ['ListReady'], block: ['FetchingTasks']

  # tasks
  SyncingThreadsToTasks:
    auto: yes
    requires: ['Syncing', 'TasksFetched', 'ThreadsFetched', 'LabelsFetched']
    block: ['ThreadsToTasksSynced']
  ThreadsToTasksSynced: block: ['SyncingThreadsToTasks']

  # thread-to-tasks
  SyncingThreadsToTasks:
    auto: yes
    requires: ['Syncing', 'TasksFetched', 'ThreadsFetched', 'LabelsFetched']
    block: ['ThreadsToTasksSynced']
  ThreadsToTasksSynced: block: ['SyncingThreadsToTasks']

  # complete tasks
  SyncingCompletedTasks:
    auto: yes
    requires: ['Syncing', 'ThreadsToTasksSynced']
    block: ['CompletedTasksSynced']
  CompletedTasksSynced:block: ['SyncingCompletedTasks']

  # tasks-to-threads
  SyncingTasksToThreads:
    auto: yes
    requires: ['Syncing', 'TasksFetched', 'ThreadsFetched', 'LabelsFetched']
    block: ['SyncingTasksToThreads']
  TasksToThreadsSynced:block: ['SyncingTasksToThreads']

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