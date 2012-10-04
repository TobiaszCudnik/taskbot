#### Properties internal contracts.
# @link https://github.com/TobiaszCudnik/jsprops

#### IMPORTS

#### PROPERTIES

TCallback = ? (Any?) -> Any?
TFunc = ? (Any?) -> Any?
TAny = ? Any or TFunc

TEventEmitterAsync = ? {
	on: (Any?) -> Any
	emit: (Any?) -> Any
}

# Instance of like signal contract.
TPropertyInstanceof = ?! (x) ->
  x instanceof jsprops.Property or x.constructor is jsprops.Property

TPropertyDataFn = ? (TAny) -> TAny?
TPropertyData = ? {
	set: TPropertyDataFn?
	init: TPropertyDataFn?
	get: TPropertyDataFn?
}

#TPropertyMethod = ? TPropertyMethodFunc
TPropertyMethodFunc = ? (Any?) -> Any
# ```
#TPropertyMethodObj = ? {
#	init: Any
#	set: Any
#	get: Any
#	constructor: Any
#}
# ```

TPropertyMethodObj = ? {
	init: Any
	set: Any
}

#TPropertyMethod = ? TPropertyMethodFunc and TPropertyMethodObj
TPropertyMethod = ? TPropertyMethodFunc

#### SIGNALS

TSignalCallback = ? (TCallback, Any?) -> Any

# Signal input data.
# All is optional.
TSignalData = ? {
	on: TSignalCallback?
	after: TSignalCallback?
	before: TSignalCallback?
	once: TSignalCallback?
	init: TSignalCallback?
}

TSignalBind = ? (TSignalCallback?) -> Any

# Signal getter value, allows to bind to the signal.
TSignalRet = ? {
	on: TSignalBind
	once: TSignalBind
	before: TSignalBind
	after: TSignalBind
	init: -> Any
}

# Signal getter is used internally in getters defined by the developer.
TSignalGetter = ? -> TSignalRet

# Functional aspect of TSignalMethod.
TSignalMethodFunc = ? (TSignalCallback?) -> !(x) ->
	# Getter when no params.
	if $1 is undefined
		x :: TSignalRet
		x = x
	yes

TCheckRet = ?!(x) ->
	# Getter when no params.
	if $1 is undefined
		x :: TSignalRet
		x = x
	yes

TSignalMethodFunc = ? (TSignalCallback?) -> TCheckRet

# This isn't needed for for now.
# ```
# TSignalMethodObj = ? {
#
# }
# ```

# Signal method supposed to be attached to the prototype.
#TSignalMethod = ? TSignalMethodFunc and TSignalMethodOb
#TSignalMethod = ? TSignalMethodFunc and TPropertyMethodObj
TSignalMethod = ? TSignalMethodFunc

# Conatract used in signal return to validate the call pattern.
TSignalCheck = ?! (data) ->
	ret = data[0]
	args = data[1..]
	# no params
	args_undefined = args.filter (x) -> x is undefined
	if args_undefined.length is args.length
		ret :: TSignalRet
		ret = ret
	# all params present
	else if not args_undefined.length
		yes
	else no

# Check shortcuts for signal oneliners.
#TSignalCheck1 = ?! (data) -> TSignalCheck ret, $1
#TSignalCheck2 = ?! (data) -> TSignalCheck ret, $1, $2
#TSignalCheck3 = ?! (data) -> TSignalCheck ret, $1, $2, $3
#TSignalCheck4 = ?! (data) -> TSignalCheck ret, $1, $2, $3, $4
#TSignalCheck5 = ?! (data) -> TSignalCheck ret, $1, $2, $3, $4, $5

#### Custom signals
# Custom signals can be done using following snippet.
# Type signals, set custom type and number of params
# ```
# (TFoo?, TSignalCallback?) -> !(ret) -> TSignalCheck(ret, $1, $2)
# ```

# Instance of like signal contract.
TSignalInstanceof = ?! (x) ->
	x instanceof jsprops.Signal or x.constructor is jsprops.Signal
#	x.init and x.set

# Collection of async signals with names.
# Used eg in DNode remote scope.
TAsyncSignalMap = ?! (map) ->
	methods = ['on', 'once', 'before', 'after']
	for name, fn of map
		for m in methods
			method :: (TSignalCallback) -> Any
			method = fn[ m ]
	yes

#### EXPORTS.

module.exports = {
  # TODO move to common
	TCallback
  # TODO move to common
	TEventEmitterAsync

  # Properties
  TPropertyInstanceof
	TPropertyData
	TPropertyMethodFunc
	TPropertyMethodObj
	TPropertyMethod

  # Signals
	TSignalCallback
	TSignalData
	TSignalGetter
	TSignalMethodFunc
	TSignalMethod
	TSignalCheck
	TSignalInstanceof
	TAsyncSignalMap
	TSignalRet
}