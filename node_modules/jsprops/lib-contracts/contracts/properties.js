(function() {var __contracts, Undefined, Null, Num, Bool, Str, Odd, Even, Pos, Nat, Neg, Self, Any, None, __old_exports, __old_require;
if (typeof(window) !== 'undefined' && window !== null) {
  __contracts = window.Contracts;
} else {
  __contracts = require('contracts.js');
}
Undefined =  __contracts.Undefined;
Null      =  __contracts.Null;
Num       =  __contracts.Num;
Bool      =  __contracts.Bool;
Str       =  __contracts.Str;
Odd       =  __contracts.Odd;
Even      =  __contracts.Even;
Pos       =  __contracts.Pos;
Nat       =  __contracts.Nat;
Neg       =  __contracts.Neg;
Self      =  __contracts.Self;
Any       =  __contracts.Any;
None      =  __contracts.None;

if (typeof(exports) !== 'undefined' && exports !== null) {
  __old_exports = exports;
  exports = __contracts.exports("src/contracts/properties.coffee", __old_exports)
}
if (typeof(require) !== 'undefined' && require !== null) {
  __old_require = require;
  require = function(module) {
    module = __old_require.apply(this, arguments);
    return __contracts.use(module, "src/contracts/properties.coffee");
  };
}
(function() {
  var TAny, TAsyncSignalMap, TCallback, TEventEmitterAsync, TFunc, TProperty, TPropertyClass, TPropertyData, TPropertyGetter, TPropertyMethod, TPropertyMethodFunc, TPropertyMethodObj, TSignal, TSignalCallback, TSignalCheck, TSignalClass, TSignalData, TSignalGetter, TSignalInstanceof, TSignalMethod, TSignalMethodFunc, TSignalRet, Tproperty, Tsignal, _ref;

  _ref = require('./properties_'), TCallback = _ref.TCallback, TEventEmitterAsync = _ref.TEventEmitterAsync, TPropertyData = _ref.TPropertyData, TPropertyMethodFunc = _ref.TPropertyMethodFunc, TPropertyMethodObj = _ref.TPropertyMethodObj, TPropertyMethod = _ref.TPropertyMethod, TSignalCallback = _ref.TSignalCallback, TSignalData = _ref.TSignalData, TSignalGetter = _ref.TSignalGetter, TSignalMethodFunc = _ref.TSignalMethodFunc, TSignalMethod = _ref.TSignalMethod, TSignalCheck = _ref.TSignalCheck, TSignalInstanceof = _ref.TSignalInstanceof, TAsyncSignalMap = _ref.TAsyncSignalMap, TSignalRet = _ref.TSignalRet, TSignalGetter = _ref.TSignalGetter;

  TFunc = __contracts.fun([__contracts.opt(Any)], __contracts.opt(Any), {});

  TAny = Any || TFunc;

  TPropertyGetter = __contracts.fun([], Any, {});

  TProperty = __contracts.object({
    property: __contracts.fun([], TPropertyMethod, {}),
    parseData: __contracts.fun([__contracts.opt(TPropertyData), __contracts.opt(Any)], TPropertyData, {}),
    initialize: TFunc,
    setObjectValue: __contracts.fun([Str], TFunc, {}),
    getObjectValue: __contracts.fun([Str], TFunc, {}),
    preparePassedFunction: TFunc,
    setName: __contracts.fun([Str], Any, {}),
    getName: __contracts.fun([], Str, {}),
    getGetter: __contracts.fun([TFunc], TPropertyGetter, {}),
    getSetter: __contracts.fun([TFunc], TFunc, {}),
    getInit: __contracts.fun([TFunc], TFunc, {})
  }, {});

  TPropertyClass = __contracts.fun([Str, __contracts.opt(TPropertyData), __contracts.opt(Any)], TProperty, {
    newOnly: true
  });

  Tproperty = __contracts.fun([], TPropertyMethod, {});

  TSignal = __contracts.object({
    property: __contracts.fun([], TSignalMethod, {}),
    initialize: Any,
    parseData: __contracts.fun([__contracts.opt(TPropertyData), __contracts.opt(Any)], TPropertyData, {}),
    getGetter: __contracts.fun([], TSignalGetter, {}),
    getInit: __contracts.fun([TFunc], TFunc, {}),
    getSetter: __contracts.fun([TFunc], TFunc, {}),
    getObjectValue: __contracts.fun([Str], TSignalGetter, {}),
    setObjectValue: __contracts.fun([Str], TFunc, {})
  }, {});

  TSignalClass = __contracts.fun([Str, __contracts.opt(TSignalData), __contracts.opt(Any)], TSignal, {
    newOnly: true
  });

  Tsignal = __contracts.fun([], TSignalMethod, {});

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
}).call(this);
