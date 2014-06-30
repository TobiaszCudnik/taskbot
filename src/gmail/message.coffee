#require 'sugar'
#asyncmachine = require 'asyncmachine'

class Message
	
	subject: null
	body: null
	labels: null
	id: null
	query: null
	# Determines in which query tick the msg was fetched
	fetch_id: 0
	
	constructor: (id, subject, labels, body) ->
		@id = id
		@subject = subject
		@labels = labels
		@body = body
