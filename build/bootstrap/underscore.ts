import _ = require('underscore');
import _str = require("underscore.string");
require("underscore.transparent");
_.mixin({
    encode: _.escape,
    decode: _.unescape,
    isNaNumber: _.isNaN
});
_.mixin(_(_str.exports()).extend({
    includeString: _str.include,
    containsString: _str.contains,
    reverseString: _str.reverse
}));
_.transparent({
    extendAll: true,
    scope: global
});
