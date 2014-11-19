#thread = require './thread'
#Thread = thread.Thread
#label = require './label'
#Label = label.Label
auth = require '../auth'
async = require 'async'
asyncmachine = require 'asyncmachine'
google = require 'googleapis'

Promise = require 'bluebird'
Promise.longStackTraces()
coroutine = Promise.coroutine
promisify = Promise.promisify

typedef = require 'tracery'
opt = typedef.Optional
#diff = require 'tracery/diff'

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
} = require './api-types'

type = (value, type, name) ->
	type = typedef type if Object.isArray type
	if not type value
		console.log value
		throw new TypeError name or ''
	value

promise_exception = (e) ->
	console.log e.errors if e.errors
	console.log (e.stack.split "\n").join "\n"

class States extends asyncmachine.AsyncMachine

	constructor: ->
		super
		@register 'Ready', 'Authenticating', 'Authenticated',
			'Syncing', 'Synced'

	Ready:
		auto: yes
		requires: ['Authenticated']

	Authenticating:
		blocks: ['Authenticated']

	Authenticated:
		blocks: ['Authenticating']

	Syncing:
		auto: yes
		requires: ['Ready']
		blocks: ['Synced']

	Synced:
		blocks: ['Syncing']

Function.prototype.defineType = (name, type, type_name) ->
	Object.defineProperty @::, name,
		set: (v) ->
			type v, ITaskLists, 'ITaskLists'
			@__task_lists = v
		get: -> @__task_lists


class Sync
	states: null
	config: null
	auth: null
	tasks: null
	gmail: null
	task_lists: null

	Sync.defineType 'auth', auth.Auth, 'auth.Auth'

	constructor: (@config) ->
		@states = new States
		(@states.debug 'Sync ', 2) if config.debug
		@task_lists = []
		@labels = []
		@auth = new auth.Auth config

		@tasks = new google.tasks 'v1', auth: @auth.client
#		Promise.promisifyAll @tasks.tasklists

		@gmail = new google.gmail 'v1', auth: @auth.client
		@states.add 'Authenticating'

		@states.on 'Syncing.enter', =>
			# async without a callback - fwd the exception
			console.log 'Syncing.enter'
			promise = @Syncing_enter()
			promise.catch promise_exception
		@states.on 'Syncing.enter', @Synced_enter
		@auth.pipeForward 'Ready', @states, 'Authenticated'

	Syncing_enter: ->
		for name, data in @config.queries
			query = new Query name, data
			@states.pipeForward 'LabelsFetched', query.states
			query.states.add 'Syncing'

module.exports = {
	Sync
	States
}