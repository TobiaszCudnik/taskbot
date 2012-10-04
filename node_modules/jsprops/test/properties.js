(function() {
  var PropertiesMixin, Signal, SignalsMixin, expect, property, signal, sinon, _ref;

  sinon = require('sinon');

  expect = require('expect.js');

  expect = require('sinon-expect').enhance(expect, sinon, 'was');

  _ref = require('../lib/properties.js'), signal = _ref.signal, property = _ref.property, Signal = _ref.Signal, PropertiesMixin = _ref.PropertiesMixin, SignalsMixin = _ref.SignalsMixin;

  describe('Properties', function() {
    var Klass, obj;
    obj = Klass = null;
    describe('basics', function() {
      var def_value;
      def_value = {
        foo: true,
        bar: false
      };
      beforeEach(function() {
        Klass = (function() {

          Klass.prototype.foo = property('foo', null, 'bar');

          Klass.prototype.bar = property('bar', null, def_value);

          function Klass() {}

          return Klass;

        })();
        return obj = new Klass;
      });
      it('should work like getter', function() {
        return expect(obj.foo()).to.eql('bar');
      });
      it('should work like a setter', function() {
        obj.foo('baz');
        return expect(obj.foo()).to.eql('baz');
      });
      return it('should clone the def_value value', function() {
        var obj2;
        obj.bar().foo = false;
        obj.bar().bar = true;
        obj2 = new Klass;
        return expect(obj2.bar()).to.eql({
          foo: true,
          bar: false
        });
      });
    });
    return describe('custom funcs', function() {
      beforeEach(function() {
        Klass = (function() {

          Klass.prototype.foo = property('foo', {
            set: function(set, val) {
              return set(val.replace(/a/, 'b'));
            }
          });

          Klass.prototype.bar = property('bar', {
            init: function(set) {
              return set('bar');
            },
            get: function(get) {
              return get().replace(/a/, 'b');
            }
          });

          Klass.prototype.baz = property('baz', {
            init: function(set) {
              return set(null);
            },
            get: function(get) {
              return get().replace(/z/, 'b');
            },
            set: function(set, val) {
              return set(val.replace(/a/, 'b'));
            }
          });

          function Klass() {}

          return Klass;

        })();
        return obj = new Klass;
      });
      it('should support custom setter', function() {
        obj.foo('baz');
        return expect(obj.foo()).to.eql('bbz');
      });
      it('should support custom getter', function() {
        return expect(obj.bar()).to.eql('bbr');
      });
      return it('should support custom getter and setter', function() {
        obj.baz('baz');
        return expect(obj.baz()).to.eql('bbb');
      });
    });
  });

}).call(this);