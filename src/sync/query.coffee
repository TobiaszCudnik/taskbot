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

class Query

  data: null
#  @defineType 'data',
  list: null
  @defineType 'list', ITaskList, 'ITaskList'
  tasks: null
  @defineType 'tasks', [ITask], '[ITask]'
  states: null
  @defineType 'states', QueryStates, 'QueryStates'
  labels: null
  @defineType 'labels', [ILabel], '[ILabel]'
  sync: null

  constructor: (@data, @sync) ->
    @states = new QueryStates

  # ----- -----
  # Transitions
  # ----- -----

  FetchingLabels_enter: coroutine ->
    res = yield @req @gmail.users.labels.list,
      userId: 'me'
    # TODO assert the tick
    @labels = res[0].labels
    @add 'LabelsFetched'

  FetchingTaskLists_enter: coroutine ->
    res = yield @req @tasks.tasklists.list
    @task_lists = type res[0].items,
      ITaskLists, 'ITaskLists'
    # TODO assert the tick
    @add 'TaskListsFetched'

  # TODO a new flag state
  FetchingTasks_FetchingTasks: @FetchingTasks_enter

  SyncingCompletedTasks_enter: coroutine ->
    # mark unmatched tasks as completed
    yield @tasks.map coroutine (task, k) ->
      continue if (@tasks_in_threads.contains task.id) or
        task.status is 'completed'

      if /^email:/.test task.notes
        yield @req @tasks.tasks.patch,
          tasklist: @list.id
          task: task.id
          resource:status: 'completed'
        console.log "Task completed by email - '#{task.title}'"
    # TODO assert the tick
    yield @req @tasks.tasks.clear, tasklist: list.id
    # TODO assert the tick
    @add 'CompletedTasksSynced'

  SyncingThreadsToTasks_enter: coroutine ->
    yield Promise.all @threads.map @getTaskForThread
    # TODO assert the tick
    # TODO refresh tasks better to not loose ThreadsToTasksSynced
#    @drop 'TasksFetched'
    @add 'ThreadsToTasksSynced'

  SyncingTasksToThreads_enter: coroutine ->
    # TODO loop thou not completed only?
    # Create new threads for new tasks.
    @tasks_in_threads = []
    yield @tasks.map coroutine (task, k) =>
      continue if not task.title or
        task.status is 'completed' or
        task.notes?.match /\bemail:\w+\b/

      # TODO extract
      labels = ['INBOX'].concat(
        @data['labels_new_task'] or []
        @config.tasks.queries.labels_defaults?['new_task'] or []
      )

      subject = task.title
      console.log "Creating email '#{subject}' (#{labels.join ', '})"
      thread = yield @req @gmail.users.messages.insert,
        userId: 'me'
        resource:raw: @createEmail subject

      #			for t in threads
      #				if subject is thread.messages[0].payload.headers[0].value
      labels_ids = labels.map (name) =>
        label = @labels.find (label) -> label.name is name
        label.id

      yield @req @gmail.users.messages.modify,
        id: thread[0].id
        userId: 'me'
        resource:addLabelIds: labels_ids
      # TODO assert the tick
      # link the task and the thread
      task.notes ?= ""
      task.notes = "#{task.notes}\nemail:#{thread[0].id}"
      yield @req @tasks.tasks.patch,
        tasklist: list_id
        task: task.id
        userId: 'me'
        resource:notes: task.notes
      # TODO assert the tick
    # TODO assert the tick
    @tasks_in_threads.push task.id
    @add 'ThreadsToTasksSynced'

  PreparingList_enter: ->
    list = null

    # TODO? move?
    @def_title = @data.labels_in_title or @config.labels_in_title

    # create or retrive task list
    for r in @task_lists
      if @name == r.title
        list = r
        break

    if not list
      list = yield @createTaskList @name
      # TODO assert the tick
      console.log "Creating tasklist '#{@name}'"

    @list = type list, ITasks, 'ITasks'
    @add 'ListReady'

  FetchingThreads_enter: ->
    res = yield @req @gmail.users.threads.list,
      q: @data.query
      userId: "me"
    query = res[0]
    query.threads ?= []

    threads = yield Promise.all query.threads.map (item) =>
      @req @gmail.users.threads.get,
        id: item.id
        userId: 'me'
        metadataHeaders: 'SUBJECT'
        format: 'metadata'
        fields: 'id,messages(id,labelIds,payload(headers))'

    query.threads = threads.map (item) -> item[0]

    #		msg_part = list.threads[0].messages[0].payload
    #		type msg_part, IMessagePart, 'IMessagePart'
    #		type list.threads[0].messages[0], IMessage, 'IMessage'
    #		type list.threads[0], IThread, 'IThread'
    @threads = type query, IThreads, 'IThreads'

  FetchingTasks_enter: coroutine ->
    res = yield @req @tasks.tasks.list,
      updatedMin: @
      tasklist: @list.id
      fields: "etag,items(id,title,notes)"
      maxResults: 1000
      showCompleted: no
    # TODO assert the tick
    @tasks = type res[0], ITasks, 'ITasks'
    @add 'TasksFetched'

  # ----- -----
  # Methods
  # ----- -----

  req: (method, params) -> @sync.req.apply @sync, arguments

  syncTaskName: coroutine (task, thread) ->
    # TODO

  createTaskList: coroutine (name) ->
    res = yield @req @tasks.tasklists.insert,
      resource:title:name
    type res[1].body,
      ITaskList, 'ITaskList'

  createTaskFromThread: coroutine (thread) ->
    type thread, IThread, 'IThread'

    title = @getTaskTitleFromThread thread
    res = yield @req @tasks.tasks.insert,
      tasklist: @list.id
      resource:
        title: title
        notes: "email:#{thread.id}"
    console.log "Task added '#{title}'"

    type res[0], ITask, 'ITask'

  createThreadFromTasks: coroutine (tasks, list_id, threads, query) ->

  createEmail: (subject) ->
    type subject, String

    email = ["From: #{@config.gmail_username} <#{@config.gmail_username}>s"
             "To: #{@config.gmail_username}"
             "Content-type: text/html;charset=utf-8"
             "MIME-Version: 1.0"
             "Subject: #{subject}"].join "\r\n"

    new Buffer email
      .toString 'base64'
      .replace /\+/g, '-'
      .replace /\//g, '_'

  getTaskForThread: coroutine (thread)->
    # TODO optimize by splicing the tasks array, skipping matched ones
    # TODO loop only on non-completed tasks
    type @tasks, [ITask], '[ITask]'

    task = @tasks.find (item) ->
      # TODO indirect addressing via a dedicated task's note
      item.notes?.match "email:#{thread.id}"

    if not task
      task = yield @createTaskFromThread thread
      # TODO assert the tick
    #		else
    #			yield @markTasksAsCompleted [task], list_id

    type task, ITask, 'ITask'

  getTaskTitleFromThread: (thread) ->
    type thread, IThread, 'IThread'
    # TODO fuck
    title = thread.messages[0].payload.headers[0].value
    # TODO clenup
    #		return title if not @config.def_title

    # TODO extract true missing labels
    extracted = @extractLabelsFromThreadName thread

    if @config.def_title is 1
      "#{extracted[1].join ' '} #{extracted[0]}"
    else
      "#{extracted[0]} #{extracted[1].join ' '}"

  ###
  @name string
  @return [ string, Array<Label> ]
  ###
  extractLabelsFromThreadName: (thread) ->
    # TODO Aaaaa....
    name = thread.messages[0].payload.headers[0].value
    type name, String
    labels = []
    for r in @config.auto_labels
      symbol = r.symbol
      label = r.label
      prefix = r.prefix
      name = name.replace "(\b|^)#{symbol}(\w+)", '', (label) ->
        labels.push label

    type name, String
    type labels, [String]
    [name, labels]

	markThreadAsCompleted: coroutine (thread) ->
		# Mark the thread as completed.
    # TODO what???
		if @threadHasLabels thread 'S/Completed'
			# TODO extract
			labels = [].concat(
				@data['labels_email_unmatched'] || []
				@sync.config.queries.label_defaults?['email_unmatched'] || []
			)

			yield thread.addLabels labels
			console.log "Task completed, marked email - '#{thread.title}' with labels '#{labels.join ' '}"

  addLabels: coroutine (thread, labels) ->
    type thread, IThread, 'IThread'
    type labels, [String]

    label_ids = labels.map (name) =>
      label = @labelByName name
      label.id
    type label_ids, [String]

    yield @req @gmail.users.messages.modify,
      id: thread[0].id
      userId: 'me'
      resource:addLabelIds: label_ids

  labelByName: (name) ->
    type @labels, [ILabels], '[ILabels]'
    @labels.find (label) -> label.name is name

  # Requires loaded threads
  threadHasLabels: (thread, label) ->
    label = @labelByName label
    type label, ILabel, 'ILabel'
    id = label.id
    for msg in thread.messages
      for label_id in msg.labelIds
        return yes if @labels.find (label) -> label.id is id
    no