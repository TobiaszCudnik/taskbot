asyncmachine = require 'asyncmachine'

# Promise-like setTimeout wrapper imitating a task.
class Task extends AsyncMachine

	constructor: ->
		super()
		@set 'Idle'

	# Doing nothing right now (but may be waiting).
	Idle = 
		blocks: ['Running']

	# Waiting for a scheduled run.
	# Sets timeout on this.schedule_timer.
	Waiting = 
		blocks: ['Running']

	# Executing async actions
	Running: 
		blocks: ['Idle', 'Waiting', 'Scheduled']

	# Cancelling a scheduled execution
	Cancelling = 
		blocks: ['Waiting']

	# Stopping the execution of async actions
	Stopping = 
		blocks: ['Running']

	Cancelling_enter: -> 
		this.addS 'Idle'
		this.drop 'Cancelling'

	Stopping_enter: ->
		this.addState 'Idle'
		this.dropState 'Stopping'

	Running_exit: ->
		this.cancelAsyncTimers_()
		this.addState 'Idle'

	# Cancel a scheduled execution
	cancel: -> @add 'Cancelling'

	# Stop an async execution.
	stop: -> @add 'Stopping'
