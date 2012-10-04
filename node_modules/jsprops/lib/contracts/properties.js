(function() {
  var TAny, TAsyncSignalMap, TCallback, TEventEmitterAsync, TFunc, TProperty, TPropertyClass, TPropertyData, TPropertyGetter, TPropertyMethod, TPropertyMethodFunc, TPropertyMethodObj, TSignal, TSignalCallback, TSignalCheck, TSignalClass, TSignalData, TSignalGetter, TSignalInstanceof, TSignalMethod, TSignalMethodFunc, TSignalRet, Tproperty, Tsignal, _ref;

  _ref = require('./properties_'), TCallback = _ref.TCallback, TEventEmitterAsync = _ref.TEventEmitterAsync, TPropertyData = _ref.TPropertyData, TPropertyMethodFunc = _ref.TPropertyMethodFunc, TPropertyMethodObj = _ref.TPropertyMethodObj, TPropertyMethod = _ref.TPropertyMethod, TSignalCallback = _ref.TSignalCallback, TSignalData = _ref.TSignalData, TSignalGetter = _ref.TSignalGetter, TSignalMethodFunc = _ref.TSignalMethodFunc, TSignalMethod = _ref.TSignalMethod, TSignalCheck = _ref.TSignalCheck, TSignalInstanceof = _ref.TSignalInstanceof, TAsyncSignalMap = _ref.TAsyncSignalMap, TSignalRet = _ref.TSignalRet, TSignalGetter = _ref.TSignalGetter;

  TFunc = fun([opt(Any)], opt(Any), {});

  TAny = Any || TFunc;

  TPropertyGetter = fun([], Any, {});

  TProperty = object({
    property: fun([], TPropertyMethod, {}),
    parseData: fun([opt(TPropertyData), opt(Any)], TPropertyData, {}),
    initialize: TFunc,
    setObjectValue: fun([Str], TFunc, {}),
    getObjectValue: fun([Str], TFunc, {}),
    preparePassedFunction: TFunc,
    setName: fun([Str], Any, {}),
    getName: fun([], Str, {}),
    getGetter: fun([TFunc], TPropertyGetter, {}),
    getSetter: fun([TFunc], TFunc, {}),
    getInit: fun([TFunc], TFunc, {})
  }, {});

  TPropertyClass = fun([Str, opt(TPropertyData), opt(Any)], TProperty, {
    newOnly: true
  });

  Tproperty = fun([], TPropertyMethod, {});

  TSignal = object({
    property: fun([], TSignalMethod, {}),
    initialize: Any,
    parseData: fun([opt(TPropertyData), opt(Any)], TPropertyData, {}),
    getGetter: fun([], TSignalGetter, {}),
    getInit: fun([TFunc], TFunc, {}),
    getSetter: fun([TFunc], TFunc, {}),
    getObjectValue: fun([Str], TSignalGetter, {}),
    setObjectValue: fun([Str], TFunc, {})
  }, {});

  TSignalClass = fun([Str, opt(TSignalData), opt(Any)], TSignal, {
    newOnly: true
  });

  Tsignal = fun([], TSignalMethod, {});

  module.exports = {
    TPropertyClass: TPropertyClass,
    TPropertyData: TPropertyData,
    TPropertyMethodFunc: TPropertyMethodFunc,
    TPropertyMethodObj: TPropertyMethodObj,
    TPropertyMethod: TPropertyMethod,
    TProperty: TProperty,
    Tproperty: Tproperty,
    TSignalCallback: TSignalCallback,
    TSignalData: TSignalData,
    TSignalGetter: TSignalGetter,
    TSignalMethodFunc: TSignalMethodFunc,
    TSignalMethod: TSignalMethod,
    TSignalCheck: TSignalCheck,
    TSignalInstanceof: TSignalInstanceof,
    TAsyncSignalMap: TAsyncSignalMap,
    TSignalRet: TSignalRet,
    TSignal: TSignal,
    TSignalClass: TSignalClass,
    Tsignal: Tsignal,
    TCallback: TCallback,
    TEventEmitterAsync: TEventEmitterAsync
  };

}).call(this);