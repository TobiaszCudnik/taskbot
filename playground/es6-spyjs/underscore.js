var _, _str;

_ = require('underscore');

//_str = require("underscore.string");

_.mixin({
    encode: _.escape,
    decode: _.unescape,
    isNaNumber: _.isNaN
});

//_.mixin(_(_str.exports()).extend({
//    includeString: _str.include,
//    containsString: _str.contains,
//    reverseString: _str.reverse
//}));


_ = require("underscore.transparent");
_.transparent({
    extendAll: true,
    scope: global
});
