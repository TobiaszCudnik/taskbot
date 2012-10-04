(function() {
  var PropertiesMixin, Property, Signal, SignalsMixin, TProperty, TPropertyClass, TPropertyMethod, TSignal, TSignalClass, TSignalMethod, Tcontr, Tproperty, Tsignal, clone, prop, property, signal, _ref, _ref2, _ref3,
    __slice = Array.prototype.slice,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  clone = require('clone');

  if (global.contracts) {
    _ref = require('./contracts/properties'), TPropertyClass = _ref.TPropertyClass, TPropertyMethod = _ref.TPropertyMethod, TSignalClass = _ref.TSignalClass, TSignalMethod = _ref.TSignalMethod, TProperty = _ref.TProperty, TSignal = _ref.TSignal, Tproperty = _ref.Tproperty, Tsignal = _ref.Tsignal;
  }

  Property = Property = (function() {

    Property.prototype.value = void 0;

    Property.prototype.getter_args_length_ = 0;

    Property.prototype.property_ = null;

    Property.create = function(name, data, def_value) {
      return new Property(name, data, def_value);
    };

    Property.property = function(name, data, def_value) {
      return Property.create(name, data, def_value).property();
    };

    function Property(name, data, def_value) {
      var get, getter, getter_args_length_, init, initialize, set, setter;
      name = this.setName(name);
      getter_args_length_ = this.getter_args_length_;
      set = this.setObjectValue(name);
      get = this.getObjectValue(name);
      data = this.parseData(data, def_value);
      init = data['init'] ? this.preparePassedFunction(data['init'], set) : this.getInit(set, name);
      getter = data['get'] ? this.preparePassedFunction(data['get'], get) : this.getGetter(get);
      setter = data['set'] ? this.preparePassedFunction(data['set'], set) : this.getSetter(set);
      initialize = this.initialize;
      this.property_ = function(value) {
        var set_attr;
        if (initialize != null) initialize.call(this, name, init);
        set_attr = arguments[getter_args_length_] !== void 0;
        if (arguments.length > getter_args_length_ && set_attr) {
          return setter.apply(this, arguments);
        } else {
          return getter.apply(this, arguments);
        }
      };
      this.property_.init = init;
      this.property_.set = set;
      this.property_.name = name;
      this.property_.constructor = this.constructor;
    }

    Property.prototype.property = function() {
      return this.property_;
    };

    Property.prototype.parseData = function(data, def_value) {
      var def_value_ref, init;
      if (def_value == null) def_value = void 0;
      if ((data != null ? data.constructor : void 0) === Function) {
        init = data;
        data = {
          init: init
        };
      }
      if (data == null) data = {};
      if (!(data != null ? data.init : void 0) && def_value) {
        def_value_ref = def_value;
        data = {
          init: function(set) {
            return set.call(this, clone(def_value_ref));
          }
        };
      }
      return data;
    };

    Property.prototype.initialize = function(name, init) {
      if (this[name + '_'] === void 0) return this[name + '_'] = init.apply(this);
    };

    Property.prototype.setObjectValue = function(property) {
      return function(v) {
        return this[property + '_'] = v;
      };
    };

    Property.prototype.getObjectValue = function(property) {
      return function() {
        return this[property + '_'];
      };
    };

    /**
    	Prepend an internal setter / getter to the public one.
    */

    Property.prototype.preparePassedFunction = function(fn, method) {
      return function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        args.unshift(method.bind(this));
        return fn.apply(this, args);
      };
    };

    Property.prototype.setName = function(name) {
      this.name = name;
      return this.getName();
    };

    Property.prototype.getName = function() {
      return this.name;
    };

    Property.prototype.getGetter = function(get) {
      return get;
    };

    Property.prototype.getSetter = function(set) {
      return set;
    };

    Property.prototype.getInit = function(set) {
      return function() {
        return set.call(this, null);
      };
    };

    return Property;

  })();

  if (global.contracts) {
    _ref2 = TProperty.oc;
    for (prop in _ref2) {
      Tcontr = _ref2[prop];
      if (!Property.prototype[prop] || prop === 'constructor') continue;
      Property.prototype[prop] = Property.prototype[prop];
    }
  }

  /**
  When passing a data[init] and want to do manual init in costructor, call it
  in like so:
  this.signal().init()
  */

  Signal = Signal = (function(_super) {

    __extends(Signal, _super);

    Signal.prototype.getter_args_length_ = 0;

    function Signal(name, data, context) {
      if (context == null) context = null;
      Signal.__super__.constructor.apply(this, arguments);
      this.property_.is_signal = true;
    }

    Signal.create = function(name, data, ctx) {
      return new Signal(name, data, ctx);
    };

    Signal.property = function(name, data, ctx) {
      return Signal.create(name, data, ctx).property();
    };

    Signal.prototype.initialize = null;

    Signal.prototype.parseData = function(data, ctx) {
      var init, old_init, signal;
      if (!data) return {};
      if ((data != null ? data.constructor : void 0) === Function) {
        init = data;
        data = {
          init: init
        };
      } else if (data.on || data.after || data.before) {
        old_init = data.init;
        signal = this.getName();
        data.init = function(set, next) {
          var next_org, super_signal, _ref3;
          if (old_init) {
            next_org = next;
            next = function() {
              return old_init(set, next_org);
            };
          }
          if (data != null ? data.on : void 0) this[signal]().on(data.on);
          if (data != null ? data.once : void 0) this[signal]().once(data.once);
          if (data != null ? data.after : void 0) this[signal]().after(data.after);
          if (data != null ? data.before : void 0) {
            this[signal]().before(data.before);
          }
          this["" + signal + "_"] = true;
          super_signal = ctx != null ? (_ref3 = ctx.__super__) != null ? _ref3[signal] : void 0 : void 0;
          if (super_signal) {
            return super_signal.init.call(this, next);
          } else {
            return typeof next === "function" ? next() : void 0;
          }
        };
      }
      return data;
    };

    Signal.prototype.getGetter = function(get) {
      return function() {
        return get.call(this);
      };
    };

    Signal.prototype.getInit = function() {
      return function() {};
    };

    Signal.prototype.getSetter = function(set) {
      return function(arg1, arg2, next) {
        return set.apply(this, arguments);
      };
    };

    Signal.prototype.setObjectValue = function(property) {
      return function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        args.unshift(property);
        return this.emit.apply(this, args);
      };
    };

    Signal.prototype.getObjectValue = function(property) {
      return function() {
        var _this = this;
        return {
          on: function(handler) {
            return _this.on(property, handler);
          },
          once: function(handler) {
            return _this.once(property, handler);
          },
          before: function(handler) {
            return _this.on('before-' + property, handler);
          },
          after: function(handler) {
            return _this.on('after-' + property, handler);
          },
          init: function(next) {
            var _ref3;
            prop = _this[property];
            return (_ref3 = prop.init) != null ? _ref3.call(_this, prop.set.bind(_this), next) : void 0;
          }
        };
      };
    };

    return Signal;

  })(Property);

  if (global.contracts) {
    _ref3 = TSignal.oc;
    for (prop in _ref3) {
      Tcontr = _ref3[prop];
      if (!Signal.prototype[prop] || prop === 'constructor') continue;
      Signal.prototype[prop] = Signal.prototype[prop];
    }
  }

  PropertiesMixin = (function() {

    function PropertiesMixin() {}

    PropertiesMixin.property = Property.property;

    return PropertiesMixin;

  })();

  SignalsMixin = (function() {

    function SignalsMixin() {}

    SignalsMixin.signal = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      args.push(this);
      return Signal.property.apply(this, args);
    };

    SignalsMixin.prototype.getSignals = function(klass) {
      var prop, _ref4, _results;
      if (klass == null) klass = null;
      _results = [];
      for (prop in (klass != null ? klass.prototype : void 0) || this) {
        if (klass && !(klass != null ? klass.prototype.hasOwnProperty(prop) : void 0)) {
          continue;
        }
        if (((_ref4 = this[prop]) != null ? _ref4.set : void 0) === void 0 || !this[prop].is_signal) {
          continue;
        }
        _results.push(prop);
      }
      return _results;
    };

    SignalsMixin.prototype.initSignals = function(klass, include, skip, next) {
      var prop, _i, _len, _ref4, _ref5, _results;
      _ref4 = this.getSignals(klass);
      _results = [];
      for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
        prop = _ref4[_i];
        if (!((_ref5 = this[prop]) != null ? _ref5.init : void 0) || include && __indexOf.call(include, prop) < 0 || skip && __indexOf.call(skip, prop) < 0 || this["" + prop + "_"]) {
          continue;
        }
        _results.push(this[prop].init.call(this, next));
      }
      return _results;
    };

    return SignalsMixin;

  })();

  property = Property.property;

  signal = Signal.property;

  module.exports = {
    Property: Property,
    Signal: Signal,
    PropertiesMixin: PropertiesMixin,
    SignalsMixin: SignalsMixin,
    property: property,
    signal: signal
  };

}).call(this);