_ = require 'underscore'
# Import Underscore.string to separate object, because there are conflict functions (include, reverse, contains)
_str = require("underscore.string")
require "underscore.transparent"

#Alias Underscore conflict functions
_.mixin
  encode: _.escape
  decode: _.unescape
  isNaNumber: _.isNaN


# Mix in non-conflict functions and aliasing conflict functions to Underscore namespace, more info at https://github.com/epeli/underscore.string#readme
_.mixin _(_str.exports()).extend(
  includeString: _str.include
  containsString: _str.contains
  reverseString: _str.reverse
)

#In Node.js we can safely extends all Underscore and Underscore.string functions to built-in JavaScript objects
_.transparent
  extendAll: true
  scope: global
