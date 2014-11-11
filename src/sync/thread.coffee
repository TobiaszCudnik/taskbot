label = require './label'
Label = label.Label

class Thread
	labels: null

	constructor: (gmail_thread) ->
		@gmail_thread = gmail_thread
		@labels = null
		@name = @getFirstMessageSubject()

	getName: -> @name

	# TODO support reloading labels
	# TODO include hasStarredMessages
	getLabels: ->
		if not @labels?
			@labels = []
			for label in @gmail_thread.getLabels()
				tmp = new Label label
				@labels.push tmp.getName()
			if @gmail_thread.isInInbox()
				@labels.push 'inbox'


			if @gmail_thread.isInChats()
				@labels.push 'chat'

			Logger.log "Found #{@labels.length} labels for thread '#{@}'."

		@labels

	hasLabel: (label) ->
		# TODO support label of type Label
		@getLabels().contains Label.normalizeName label

	addLabel: ( label ) ->
		label = Label.get label
		label.addToThread @

	removeLabel: ( label ) ->
		label = Label.get label
		label.removeFromThread @

	disposeLabelCache_: ->
		Logger.log "Disposing labels cache for thread '#{@}'"
		@labels = null

	addLabels: (labels) ->
		@addLabel label for label in labels

	toString: -> @getName()

	@get: (thread) ->
		if thread instanceof Thread
			thread
		else
			new Thread thread