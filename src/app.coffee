suspend = require 'suspend'
gmail = require './gmail'
settings = require '../settings'
go = suspend.resume
async = suspend.async

class App extends gmail.Connection
	constructor: (settings) ->
		super settings
		# TODO move queries to the config
		@addQuery '*', 1000
		@addQuery 'label:S-Pending', 5000
		@addQuery 'label:sent', 5000
		@addQuery 'label:P-test', 5000
		# TODO this returns untrue value
		if not @add 'Active'
			@log "cant activate Active (states: #{@is()})"

client = new App settings
#do suspend.fn ->
#	client = new App settings
	
	# disconnect after 10 seconds
#	yield setTimeout go(), 10*1000
#	client.add 'Disconnected', yes