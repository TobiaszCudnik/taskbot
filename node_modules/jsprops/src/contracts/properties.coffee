#### Properties Contract.
# @link https://github.com/TobiaszCudnik/jsprops

#### IMPORTS

# Internal properties contracts.
{
	TCallback
	TEventEmitterAsync
	TPropertyData
	TPropertyMethodFunc
	TPropertyMethodObj
	TPropertyMethod
	TSignalCallback
	TSignalData
	TSignalGetter
	TSignalMethodFunc
	TSignalMethod
	TSignalCheck
	TSignalInstanceof
	TAsyncSignalMap
	TSignalRet
	TSignalGetter
} = require './properties_'

#### PROPERTIES

TFunc = ? (Any?) -> Any?
TAny = ? Any or TFunc

TPropertyGetter = ? -> Any
# Property Factory class object.
TProperty = ? {
	property: -> TPropertyMethod
	parseData: (TPropertyData?, Any?) -> TPropertyData
	initialize: TFunc
	setObjectValue: (Str) -> TFunc
	getObjectValue: (Str) -> TFunc
	preparePassedFunction: TFunc
	setName: (Str) -> Any
	getName: -> Str
	getGetter: (TFunc) -> TPropertyGetter
	getSetter: (TFunc) -> TFunc
	getInit: (TFunc) -> TFunc
}

# **Property Factory** class constructor.
# Use it only to extend when building new classes.
TPropertyClass = ? (Str, TPropertyData?, Any?) ==> TProperty
Tproperty = ? -> TPropertyMethod

#### SIGNALS

# TSignal class instance object.
# @augments TProperty
TSignal = ? {
	property: -> TSignalMethod
	initialize: Any
	parseData: (TPropertyData?, Any?) -> TPropertyData
	getGetter: -> TSignalGetter
	getInit: (TFunc) -> TFunc
	getSetter: (TFunc) -> TFunc
	getObjectValue: (Str) -> TSignalGetter
	setObjectValue: (Str) -> TFunc
}

# **Signal Factory** class constructor.
# Use it only to extend when building new classes.
#
# @augments TPropertyClass
TSignalClass = ? (Str, TSignalData?, Any?) ==> TSignal
Tsignal = ? -> TSignalMethod

#### EXPORTS

module.exports = {

	# Properties exports.
	TPropertyClass
	TPropertyData
	TPropertyMethodFunc
	TPropertyMethodObj
	TPropertyMethod
	TProperty
	Tproperty

	# Signals exports.
	TSignalCallback
	TSignalData
	TSignalGetter
	TSignalMethodFunc
	TSignalMethod
	TSignalCheck
	TSignalInstanceof
	TAsyncSignalMap
	TSignalRet
	TSignal
	TSignalClass
	Tsignal

	# Misc exports.
	TCallback
	TEventEmitterAsync
}