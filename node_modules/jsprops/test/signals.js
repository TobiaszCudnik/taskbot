(function() {
  var PropertiesMixin, Signal, SignalsMixin, expect, property, signal, sinon, _ref,
    __slice = Array.prototype.slice,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  sinon = require('sinon');

  expect = require('expect.js');

  expect = require('sinon-expect').enhance(expect, sinon, 'was');

  _ref = require('../lib/properties.js'), signal = _ref.signal, property = _ref.property, Signal = _ref.Signal, PropertiesMixin = _ref.PropertiesMixin, SignalsMixin = _ref.SignalsMixin;

  describe('Signals', function() {
    var Klass, obj, scope, spy;
    scope = obj = Klass = spy = null;
    describe('basics', function() {
      beforeEach(function() {
        var met, _i, _len, _ref2;
        scope = {
          bar1_on: sinon.spy(),
          bar2_on: sinon.spy(),
          bar2_init: sinon.spy(),
          baz_init_: false
        };
        scope.baz_init = function() {
          return scope.baz_init_ = true;
        };
        Klass = (function() {

          function Klass() {}

          Klass.prototype.foo = signal('foo');

          Klass.prototype.bar1 = signal('bar1', {
            on: scope.bar1_on
          });

          Klass.prototype.bar2 = signal('bar2', {
            init: scope.bar2_init,
            on: scope.bar2_on
          });

          Klass.prototype.baz = signal('baz', scope.baz_init);

          Klass.prototype.on_callstack = null;

          Klass.prototype.on = function() {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            if (this.on_callstack == null) this.on_callstack = [];
            return this.on_callstack.push(args);
          };

          Klass.prototype.emit = function() {};

          return Klass;

        })();
        obj = new Klass;
        _ref2 = ['on', 'emit'];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          met = _ref2[_i];
          sinon.stub(obj, met);
        }
        spy = sinon.spy();
        obj.foo().init();
        obj.baz().init();
        obj.bar1().init();
        return obj.bar2().init();
      });
      it('should init signals', function() {
        return expect(scope.baz_init_).to.be.ok();
      });
      it('should emit events', function() {
        obj.foo(function() {});
        return expect(obj.emit).was.calledWith('foo');
      });
      it('should emit events with params', function() {
        obj.foo('param1', function() {});
        return expect(obj.emit).was.calledWith('foo', 'param1');
      });
      it('should bind to events', function() {
        obj.foo().on(function() {});
        return expect(obj.on).was.calledWith('foo');
      });
      it('should support initial listener', function() {
        return expect(obj.on).was.calledWith('bar1');
      });
      it('should init signals with initial listener', function() {
        expect(obj.on).was.calledWith('bar2');
        return expect(scope.bar2_init).was.called();
      });
      return describe('aop', function() {
        it('should allow to bind to a before event', function() {
          obj.foo().before(function() {});
          return expect(obj.on).was.calledWith('before-foo');
        });
        return it('should allow to bind to an after event', function() {
          obj.foo().after(function() {});
          return expect(obj.on).was.calledWith('after-foo');
        });
      });
    });
    return describe('oo', function() {
      scope = {};
      beforeEach(function() {
        var Klass2, Klass3;
        scope = {
          listeners: 0
        };
        Klass = (function(_super) {

          __extends(Klass, _super);

          function Klass() {
            Klass.__super__.constructor.apply(this, arguments);
          }

          Klass.prototype.foo = signal('foo', {
            on: function() {}
          });

          Klass.prototype.on = function() {
            return scope.listeners++;
          };

          Klass.prototype.emit = function() {};

          Klass.prototype.klass = 'klass1';

          return Klass;

        })(SignalsMixin);
        Klass2 = (function(_super) {

          __extends(Klass2, _super);

          function Klass2() {
            Klass2.__super__.constructor.apply(this, arguments);
          }

          Klass2.prototype.foo = Klass2.signal('foo', {
            on: function() {}
          });

          Klass2.prototype.klass = 'klass2';

          return Klass2;

        })(Klass);
        Klass3 = (function(_super) {

          __extends(Klass3, _super);

          function Klass3() {
            Klass3.__super__.constructor.apply(this, arguments);
          }

          Klass3.prototype.foo = Klass3.signal('foo', {
            on: function() {}
          });

          Klass3.prototype.klass = 'klass2';

          return Klass3;

        })(Klass2);
        obj = new Klass3;
        spy = sinon.spy();
        return obj.foo().init();
      });
      return it('should merge signals defined in subclasses', function() {
        return expect(scope.listeners).to.eql(3);
      });
    });
  });

}).call(this);