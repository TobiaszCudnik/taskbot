type = require '../type'
asyncmachine = require 'asyncmachine'
Promise = require 'bluebird'
coroutine = Promise.coroutine
moment = require 'moment'



class States extends asyncmachine.AsyncMachine


  Enabled: {}
  Dirty:blocks: ['MsgsFetched', 'ThreadsFetched']


  FetchingThreads:
    auto: yes
    requires: ['Enabled']
    blocks: ['ThreadsFetched']
  ThreadsFetched:
    requires: ['Enabled']
    blocks: ['FetchingThreads']


  FetchingMsgs:
    requires: ['Enabled', 'ThreadsFetched']
    blocks: ['MsgsFetched']
  MsgsFetched:
    blocks: ['FetchingMsgs']


  constructor: ->
    super
    @registerAll()



class GmailQuery


  synced_history_id: null
  states: null
  result: null
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
      @states.debug "GmailQuery(#{name}) / ", process.env['DEBUG']# - 1


  # TODO ensure all the threads are downloaded (stream per pasge if required)
  FetchingThreads_state: coroutine (states) ->
    abort = @states.getAbort 'FetchingThreads'
    # TODO this break half of the gmail queries
    if yield @isCached abort
      return if abort()
      console.log "[CACHED] threads for '#{@query}'"
      @states.add 'ThreadsFetched'
      @states.add 'MsgsFetched' if @fetch_msgs
      return
    return if abort?()

    console.log "[FETCH] threads' list for '#{@query}'"
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
    if not @fetch_msgs
      @synced_history_id = history_id

    @states.add 'ThreadsFetched'

    if @fetch_msgs
      abort = @states.getAbort 'ThreadsFetched'
      @states.add 'FetchingMsgs', history_id, abort


  FetchingMsgs_state: coroutine (states, history_id, abort) ->
    abort = @states.getAbort 'FetchingMsgs', abort

    threads = yield Promise.all @threads.map coroutine (thread) =>
      yield @gmail.fetchThread thread.id, thread.historyId, abort
    return if abort()

    @synced_history_id = history_id
    @result.threads = threads
    @states.add 'MsgsFetched'


  Dirty_state: ->
    @states.drop 'Dirty'


  isCached: coroutine (abort) ->
    yield @gmail.isCached @synced_history_id, abort


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