suspend = require 'suspend'
gmail = require './gmail-imap/connection'
settings = require '../settings'
auth = require './auth'
asyncmachine = require 'asyncmachine'
go = suspend.resume
async = suspend.async
require 'sugar'

Object.merge settings, gmail_max_results: 300

class Sync extends asyncmachine.AsyncMachine
	Ready:
		auto: yes
		requires: ['ImapConnected', 'Authenticated']

	ImapConnected:
		drops: ['ConnectingImap']

	ConnectingImap:
		drops: ['ImapConnected']

	Authenticating:
		drops: ['Authenticated']

	Authenticated:
		drops: ['Authenticating']

	constructor: (settings) ->
		@register 'Ready', 'ImapConnected', 'ConnectingImap', 'Authenticating',
			'Authenticated'
		@imap = new gmail.Connection settings
		@auth = new auth.Auth settings
		# TODO move queries to the config
		@imap.addQuery '*', 1000
#		@addQuery 'label:S-Pending', 5000
#		@addQuery 'label:sent', 5000
#		@addQuery 'label:P-test', 5000
		# TODO this returns untrue value
		@add 'Authenticating'

	ConnectingImap_enter: ->
		@imap.add 'Active'
		@imap.on 'Ready', @addLater 'ImapConnected'

	Authenticating_enter: ->
		# TODO implement
		@auth.on 'Ready', @addLater 'Authenticated'


client = new App settings
#do suspend.fn ->
#	client = new App settings
	
	# disconnect after 10 seconds
#	yield setTimeout go(), 10*1000
#	client.add 'Disconnected', yes