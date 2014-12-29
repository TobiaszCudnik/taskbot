type = require '../type'
asyncmachine = require 'asyncmachine'
Promise = require 'bluebird'
coroutine = Promise.coroutine
moment = require 'moment'



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
  fetch_msgs: null
  Object.defineProperty @::, 'threads', get: -> @result.threads


  constructor: (@gmail, @query, @name = '', @fetch_msgs = no) ->
    @api = @gmail.api
    @completions = {}
    @states = new States
    @states.setTarget this
    if process.env['DEBUG']
      @states.debug "GmailQuery(#{name}) / "


  # TODO ensure all the threads are downloaded (stream per page if required)
  FetchingThreads_state: coroutine (states, history_id, abort) ->
    abort = @states.getAbort 'FetchingThreads', abort

    @synced_history_id = history_id
    console.log "[FETCH] threads' list for #{@query}"
    res = yield @req @api.users.threads.list,
      q: @query
      userId: "me"
      fields: "threads(historyId,id)"
    return if abort?()

    history_id = yield @gmail.getHistoryId abort
    return if abort?()

    @result = res[0]
    @result.threads ?= []
    @updateThreadsCompletions()

#    console.log "Found #{@result.threads.length} threads"
    @synced_history_id = history_id
    @states.add 'ThreadsFetched'

    if @fetch_msgs
      @states.add 'FetchingMsgs', abort


  FetchingMsgs_state: coroutine (states, abort) ->
    abort = @states.getAbort 'FetchingMsgs', abort

    threads = yield Promise.all @threads.map coroutine (thread) =>
      yield @gmail.fetchThread thread.id, thread.historyId, abort
    return if abort()

    @result.threads = threads
    @states.add 'MsgsFetched'


  isCached: coroutine ->
    yield @gmail.isCached @synced_history_id


  req: (method, params) ->
    @gmail.req method, params


  # update completion statuses
  updateThreadsCompletions: ->
    non_completed_ids = []
    # create / update existing threads completion data
    @threads.forEach (thread) =>
      completion = @completions[thread.id]
      # update the completion if thread is new or completion status has changed
      if completion?.completed or not completion
        @completions[thread.id] = completed: no, time: moment()

      non_completed_ids.push thread.id

    # complete threads not found in the query results
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


module.exports = {
  GmailQuery
  States
}