// Generated by CoffeeScript 1.8.0
(function() {
  var type;

  (require('source-map-support')).install();

  require('./underscore');

  type = require('../type');

  Error.stackTraceLimit = 100;

  Function.prototype.defineType = function(name, type_value, type_name) {
    return Object.defineProperty(this.prototype, name, {
      set: function(v) {
        return this.__task_lists = type(v, type_value, type_name);
      },
      get: function() {
        return this.__task_lists;
      }
    });
  };

}).call(this);