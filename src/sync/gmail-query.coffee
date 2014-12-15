type = require '../type'
asyncmachine = require 'asyncmachine'
Promise = require 'bluebird'
coroutine = Promise.coroutine



class States extends asyncmachine.AsyncMachine


  FetchingThreads:
    blocks: ['ThreadsFetched']
  ThreadsFetched:blocks: ['FetchingThreads']


  FetchingMsgs:
    requires: ['ThreadsFetched']
    blocks: ['MsgsFetched']
  MsgsFetched:blocks: ['FetchingMsgs']


  constructor: ->
    super
    @registerAll()



class GmailQuery


  synced_history_id: null
  states: null
  result: null
  sync: null
  threads: null
  completions: null
  result: null
  query: null
  Object.defineProperty @::, 'threads', get: -> @result.threads


  constructor: (@gmail, @query, @fetch_msgs) ->
    @api = @gmail.api
    @completions = {}
    @states = new States
    @states.setTarget this
    if process.env['DEBUG']
      @states.debug 'GmailQuery / ', process.env['DEBUG']

    # Bind to gmail states
    @gmail.states.pipeForward 'LabelsFetched', @states
    @gmail.states.pipeForward 'FetchingLabels', @states


  isCached: coroutine ->
    return no if not @synced_history_id or
      @synced_history_id isnt @gmail.history_id


  # TODO ensure all the threads are downloaded (stream per page if required)
  FetchingThreads_enter: coroutine (states, history_id, abort) ->
    abort = @getInterruptEnter 'FetchingThreads', abort

    @synced_history_id = history_id
    console.log "[FETCH] threads' list"
    res = yield @req @gmail_api.users.threads.list,
      q: @query
      userId: "me"
      fields: "threads(historyId,id)"
    return if abort?()
    @result = res[0]
    @result.threads ?= []
    @synced_history_id = yield @gmail.getHistoryId abort
    return if abort?()

    if @fetch_msgs
      @states.add 'FetchingMsgs', abort
      yield @states.when 'MsgsFetched'
      return if abort()

    @states.add 'ThreadsFetched'


  FetchingMessages_enter: coroutine (states, interrupt) ->
    interrupt = @getInterruptEnter 'FetchingMessages', interrupt

    threads = yield Promise.all query.threads.map coroutine (thread) =>
      completion = @completions[thread.id]
      # update the completion if thread is new or completion status has changed
      if completion?.completed or not completion
        @completions[thread.id] = completed: no, time: moment()

      yield @fetchThread thread.id, thread.historyId, interrupt
    return if interrupt()

    @result.threads = threads


  req: (fn, params) ->
    @gmail.call @gmail, fn, params


  isCached: ->
    @history_id and @gmail.isCached @history_id


  labelByName: (name) ->
    type @sync.labels, [ILabel], '[ILabel]'
    @sync.labels.find (label) -> label.name is name


  # complete threads not found in the query results
  processThreadsCompletions: (non_completed_ids) ->
    @completions.each (row, id) ->
      # TODO build non_completed
      return if id in non_completed_ids
      return if row.completed
      row.completed = yes
      row.time = moment()
      console.log "Marking thread as completed by query (#{id})"


  threadWasCompleted: (id) ->
    if @completions[id]?.completed is yes
      @completions[id].time
    else no


  threadWasNotCompleted: (id) ->
    if @completions[id]?.completed is no
      @completions[id].time
    else no


  threadSeen: (id) ->
    Boolean @completions[id]


  # TODO
  threadHasLabels: (thread, labels) ->
#    if not @gmail.is 'LabelsFetched'
#      throw new Error
#    for msg in thread.messages
#      for label_id in msg.labelIds


module.exports = {
  GmailQuery
  States
}