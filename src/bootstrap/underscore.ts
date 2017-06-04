import * as _ from 'underscore'
// Import Underscore.string to separate object, because there are conflict functions (include, reverse, contains)
_.str = require('underscore.string')

//Alias Underscore conflict functions
_.mixin({
  encode: _.escape,
  decode: _.unescape,
  isNaNumber: _.isNaN
})

// Mix in non-conflict functions and aliasing conflict functions to Underscore namespace, more info at https://github.com/epeli/underscore.string#readme
_.mixin(
  _(_.str.exports()).extend({
    includeString: _.str.include,
    containsString: _.str.contains,
    reverseString: _.str.reverse
  })
)

//In Node.js we can safely extends all Underscore and Underscore.string functions to built-in JavaScript objects
_ = require('underscore.transparent')
_.transparent({
  extendAll: true,
  scope: global
})
