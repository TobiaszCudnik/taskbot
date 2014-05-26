asyncmachine = require 'asyncmachine'

# Promise-like setTimeout wrapper imitating a task.
class Task extends AsyncMachine

	constructor: ->
		super()
		@set 'TaskIdle'

	# Doing nothing right now (but may be waiting).
	TaskIdle = 
		blocks: ['TaskRunning']

	# Waiting for some event to procced.
	TaskWaiting = 
		blocks: ['Running']

	# Executing async actions
	TaskRunning: 
		blocks: ['TaskIdle', 'TaskWaiting']

	# Cancelling a scheduled execution
	TaskCancelling = 
		blocks: ['TaskWaiting']

	# Stopping the execution of an async actions
	TaskStopping = 
		blocks: ['TaskRunning']

	TaskCancelling_enter: -> 
		@add 'TaskIdle'
		@drop 'TaskCancelling'

	TaskStopping_enter: ->
		@add 'TaskIdle'
		@drop 'TaskStopping'

	TaskRunning_exit: ->
		@add 'TaskIdle'

	# Cancel a scheduled execution, which means drop the TaskWaiting
	taskCancel: -> @add 'TaskCancelling'

	# Stop an async execution, which means drop the TaskRunning
	taskStop: -> @add 'TaskStopping'
