clone = require 'clone'

if global.contracts
	{
		TPropertyClass
		TPropertyMethod
		TSignalClass
		TSignalMethod
		TProperty
		TSignal
		Tproperty
		Tsignal
	} = require './contracts/properties'

Property :: TPropertyClass
Property = class Property
	value: undefined,
	getter_args_length_: 0,
	property_: null,

	@create: (name, data, def_value) ->
		new Property name, data, def_value
	@property: (name, data, def_value) ->
		Property.create(name, data, def_value).property()

	constructor: (name, data, def_value) ->
		name = @setName name

		getter_args_length_ = @getter_args_length_

		set = @setObjectValue name
		get = @getObjectValue name

		data = @parseData data, def_value

		# prepare init
		init = if data['init']
			@preparePassedFunction data['init'], set
		else
			@getInit set, name
		# prepare getter
		getter = if data['get']
			@preparePassedFunction data['get'], get
		else
			@getGetter get
		# prepare setter
		setter = if data['set']
			@preparePassedFunction data['set'], set
		else
			@getSetter set

		initialize = @initialize
		# generate a property
		@property_ = (value) ->
			initialize?.call @, name, init

			# regular getter/setter code
			set_attr = arguments[ getter_args_length_ ] isnt undefined
			if arguments.length > getter_args_length_ and set_attr
				setter.apply @, arguments
			else getter.apply @, arguments

		@property_.init = init
		@property_.set = set
		@property_.name = name
		@property_.constructor = @constructor

	property: -> @property_

	parseData: (data, def_value = undefined) ->
		# prepare default value
		# type casting
		if data?.constructor is Function
			init = data
			data = { init }
		data ?= {}
		# default methods
		if not data?.init and def_value
			def_value_ref = def_value
			data = init: (set) -> set.call @, clone def_value_ref
		data

	initialize: (name, init) ->
		# init property when undefined
		if @[ name + '_' ] is undefined
			@[ name + '_' ] = init.apply @

	setObjectValue: (property) ->
		(v) -> @[ property + '_' ] = v
	getObjectValue: (property) ->
		-> @[ property + '_' ]

	###*
	Prepend an internal setter / getter to the public one.
	###
	preparePassedFunction: (fn, method) ->
		(args...) ->
			args.unshift method.bind @
			fn.apply @, args

	setName: (@name) -> @getName()

	getName: -> @name
	getGetter: (get) -> get
	getSetter: (set) -> set
	getInit: (set) ->
		-> set.call @, null

if global.contracts
	for prop, Tcontr of TProperty.oc
		continue if not Property::[prop] or
			prop is 'constructor'
		Property::[prop] :: Tcontr
		Property::[prop] = Property::[prop]

###*
When passing a data[init] and want to do manual init in costructor, call it
in like so:
this.signal().init()
###
Signal :: TSignalClass
Signal = class Signal extends Property
	getter_args_length_: 0,

	constructor: (name, data, context = null) ->
		super
		@property_.is_signal = yes

	# FIXME
	@create: (name, data, ctx) ->
		new Signal(name, data, ctx)
	@property: (name, data, ctx) ->
		Signal.create(name, data, ctx).property()

	# empty override
	initialize: null

	parseData: (data, ctx) ->
		return {} if not data
		# prepare default value
		# TODO typeof
		if data?.constructor is Function
			init = data
			data = { init }
		# TODO TESTME!
		else if data.on or data.after or data.before
			old_init = data.init
			signal = @getName()
			data.init = (set, next) ->
				if old_init
					next_org = next
					next = -> old_init set, next_org
				@[ signal ]().on(data.on) if data?.on
				@[ signal ]().once(data.once) if data?.once
				@[ signal ]().after(data.after) if data?.after
				@[ signal ]().before(data.before) if data?.before
				# Mark signal as inited
				@["#{signal}_"] = yes
				super_signal = ctx?.__super__?[ signal ]
				if super_signal
					super_signal.init.call @, next
				else
					next?()

		# DONT call super
		data

	# Get signal obj. you can bind on it.
	getGetter: (get) ->
		-> get.call @
	# Fake init value, empty function to meet the contract.
	getInit: -> ->
	# Trigger a signal, passing params and the callback.
	getSetter: (set) ->
		(arg1, arg2, next) ->
			set.apply @, arguments

	# Return function triggering the signal.
	setObjectValue: (property) ->
		(args...) ->
			args.unshift property
			@emit.apply @, args

	# Return a signal obj, with some event functions.
	getObjectValue: (property) -> ->
		# TODO expose more methods, cache bindings (?)
		on: (handler) => @on property, handler
		once: (handler) => @once property, handler
		before: (handler) => @on 'before-' + property, handler
		after: (handler) => @on 'after-' + property, handler
		# shorthand to calling `prop.init.call @`
		init: (next) =>
			prop = @[ property ]
			prop.init?.call @, prop.set.bind(@), next

if global.contracts
	for prop, Tcontr of TSignal.oc
		continue if not Signal::[prop] or
			prop is 'constructor'
		Signal::[prop] :: Tcontr
		Signal::[prop] = Signal::[prop]

# Inheritance helpers. Extending will also work for constructors (recursive).

class PropertiesMixin
	@property: Property.property

class SignalsMixin
	@signal: (args...) ->
		args.push @
		Signal.property.apply @, args

	getSignals: (klass = null) ->
		for prop of klass?.prototype or @
			continue if klass and not klass?.prototype.hasOwnProperty prop
			continue if @[prop]?.set is undefined or
				not @[prop].is_signal
			prop

	initSignals: (klass, include, skip, next) ->
		# TODO check by hasOwnProperty
		for prop in @getSignals klass
			continue if not @[prop]?.init or
				include and prop not in include or
				skip and prop not in skip or
				# Check if already inited.
				@["#{prop}_"]
			@[prop].init.call @, next

property = Property.property
signal = Signal.property

module.exports = {
	Property
	Signal
	PropertiesMixin
	SignalsMixin

	property
	signal
}