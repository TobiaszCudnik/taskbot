thread = require './Thread'
Thread = thread.Thread

class Label
	constructor: (gmail_label) ->
		@gmail_label = gmail_label
		# TODO Loose cross-binding
		@name = @gmail_label.getName()

	isStatusLabel: ->
		/^s-/.test @getName

	getName: ->
		Label.normalizeName @name

	belongsToThread: (thread) ->
		if not thread.gmail_thread?
			thread = new Thread thread

		!!( thread.hasLabel @getName() )

	toString: ->
		return @getName()

	addToThread: (thread) ->
		thread = Thread.get thread
		@gmail_label.addToThread thread.gmail_thread
		# TODO just update the cache by getting label
		thread.disposeLabelCache_()

	removeFromThread: (thread) ->
		thread = Thread.get thread
		@gmail_label.removeFromThread thread.gmail_thread
		# TODO just update the cache by getting label
		thread.disposeLabelCache_()

	@exists: (name) ->
		# TODO cache while checking
		!!( @labels[ name ] or GmailApp.getUserLabelByName name )

	###
	Ultimately get label:
	- Normalize name.
	- Return cached if exists.
	- Create if not exists.
	###
	@get: (name) ->
		# TODO support other param types
#		if label.construtor is String
#			label = Label.get label
#		else if label not instanceof Label
#			label = new Label label

		label_name = @normalizeName @getLabelName_ name

		if not @labels[ label_name ]
				@labels[ label_name ] = @getOrCreate name

		new Label @labels[ label_name ]

	@getOrCreate: (name) ->
		GmailApp.getUserLabelByName( name ) or GmailApp.createLabel( name )

	@getLabelName_: (name) ->
		if name?.getName?
			name.getName()
		else
			name

	@normalizeName: ( name ) ->
		name.toString()
			.replace(/(^\s+|\s+$)/g, '')
			.replace(/[^\w]/g, '-')
			.toLowerCase()

	@preloadAllLabels: ->
		###
		TODO use getUserLabels to prevent api hits.
		###

	@disposeCache: -> @labels = {}

	@labels: {}