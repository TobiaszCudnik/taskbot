suspend = require 'suspend'
gmail = require './gmail'
settings = require '../settings'
go = suspend.resume
async = suspend.async

class App extends gmail.Connection
	Connected_enter: (states) ->
		super states
		# if ( super.Connected_enter( states ) === false )
		#   return false
		@log 'adding searches'
		@addQuery '*', 1000
		@addQuery 'label:sent', 5000
		@addQuery 'label:T-foo', 5000
		if not @add 'Active'
			@log 'cant activate', @is()
		yes

do suspend ->
	client = new App settings
	
	# disconnect after 10 seconds
	yield setTimeout go(), 10*1000
	client.add 'Disconnected'