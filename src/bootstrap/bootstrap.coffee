(require 'source-map-support').install()
require './underscore'
type = require '../type'
Promise = require 'bluebird'
Error.stackTraceLimit = 100

Function.prototype.defineType = (name, type_value, type_name) ->
	Object.defineProperty @::, name,
		set: (v) ->
			@__task_lists = type v, type_value, type_name
		get: -> @__task_lists

Promise.onPossiblyUnhandledRejection (error) ->
	throw error
