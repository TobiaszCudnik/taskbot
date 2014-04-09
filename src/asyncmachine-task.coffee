asyncmachine = require 'asyncmachine'

# Promise-like setTimeout wrapper imitating a task.
class Task extends AsyncMachine

	constructor: ->
		super()
		@set 'TaskIdle'

	# Doing nothing right now (but may be waiting).
	TaskIdle = 
		blocks: ['TaskRunning']

	# Waiting for a scheduled run.
	# Sets timeout on @schedule_timer.
	TaskWaiting = 
		blocks: ['Running']

	# Executing async actions
	TaskRunning: 
		blocks: ['TaskIdle', 'TaskWaiting']

	# Cancelling a scheduled execution
	TaskCancelling = 
		blocks: ['TaskWaiting']

	# Stopping the execution of async actions
	TaskStopping = 
		blocks: ['TaskRunning']

	TaskCancelling_enter: -> 
		@addS 'TaskIdle'
		@drop 'TaskCancelling'

	TaskStopping_enter: ->
		@addS 'TaskIdle'
		@drop 'TaskStopping'

	TaskRunning_exit: ->
		@add 'TaskIdle'

	# Cancel a scheduled execution
	cancel: -> @add 'Cancelling'

	# Stop an async execution.
	stop: -> @add 'Stopping'
