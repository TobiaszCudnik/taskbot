type = require '../type'
asyncmachine = require 'asyncmachine'
Promise = require 'bluebird'
coroutine = Promise.coroutine



class States extends asyncmachine.AsyncMachine


  Enabled: {}


  FetchingThreads:
    auto: yes
    requires: ['Enabled']
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
    if process.env['DEBUG'] > 1
      @states.debug 'GmailQuery / ', process.env['DEBUG']


  isCached: coroutine ->
    yield @gmail.isCached @synced_history_id


  # TODO ensure all the threads are downloaded (stream per page if required)
  FetchingThreads_enter: coroutine (states, history_id, abort) ->
    abort = @states.getInterruptEnter 'FetchingThreads', abort

    @synced_history_id = history_id
    console.log "[FETCH] threads' list"
    res = yield @req @api.users.threads.list,
      q: @query
      userId: "me"
      fields: "threads(historyId,id)"
    return if abort?()

    history_id = yield @gmail.getHistoryId abort
    return if abort?()

    @result = res[0]
    @result.threads ?= []
    @synced_history_id = history_id
    @states.add 'ThreadsFetched'

    if @fetch_msgs
      @states.add 'FetchingMsgs', abort
      yield @states.when 'MsgsFetched'


  FetchingMessages_enter: coroutine (states, interrupt) ->
    interrupt = @states.getInterruptEnter 'FetchingMessages', interrupt

    threads = yield Promise.all query.threads.map coroutine (thread) =>
      completion = @completions[thread.id]
      # update the completion if thread is new or completion status has changed
      if completion?.completed or not completion
        @completions[thread.id] = completed: no, time: moment()

      yield @fetchThread thread.id, thread.historyId, interrupt
    return if interrupt()

    @result.threads = threads


  req: (method, params) ->
    @gmail.req method, params


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