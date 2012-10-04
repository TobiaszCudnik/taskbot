# jsprops
Properties for JavaScript Prototypes.

Library provides class based properties that can be bound directly to a prototype, which reduces redundancy of coping the same property among instances.

Additionally, we can easily inherit from Properties class, extending it by our own getters/setter logic.

Default property's value is inited in a lazy way, first time it's accessed.

**Example**

```coffeescript
{ property } = require 'jsprops'

class Klass
	foo: property 'foo'
	bar: property('bar', null, 'def_value')
	baz: property('baz',
		set: (set, val) ->
			set val.replace /a/, 'b'
	)
	woof: property('woof',
		init: (set) -> set null
		get: (get) -> get().replace /z/, 'b'
		set: (set, val) ->
			set val.replace /a/, 'b'
		'def_value'
	)

instance = new Klass
instance.foo() # returns 'foo'
instance.foo 'bar'
instance.foo() # returns 'bar'
```

Repeated name in a declaration is required by the design.

## Signals
Signals are extended properties, adding nice bindings to an event emitter. An interesting feature is the support for inheritance. You can define an overriding signal in a child class, while still preserving listener defined in the super class. The only condition is the requirement of using `@signal` instead of `signal` (needed for a prototype chain resolution).

For signals, **set** is an emit and **get** returns temp object with binding functions (on, once) and an init function. All of them can be defined inside a declaration. They are also compatible with [EventEmitter2Async](https://github.com/TobiaszCudnik/EventEmitter2Async) (with callback and after/before events). Additionally, each signal needs to be initialized (manually or using SignalsMixin#initSignals).

**Example**

```coffeescript
{
	signal
	SignalsMixin
} = require 'jsprops'

# This example actually lacks event emitter, but mixins are out of it's scope.
class Klass extends SignalsMixin
	foo: signal('foo',
		on: -> console.log 'klass1'
	)

	on: -> # forward to a composed event emitter
	emit: -> # forward to a composed event emitter

class Klass2 extends Klass
	constructor: ->
		@initSignals()

	foo: @signal('foo',
		on: -> console.log 'klass2'
	)

instance = new Klass
instance.foo().on ->
	console.log 'listener'
instance.foo() # prints 'klass1', 'klass2', 'listener'
```

## JavaScript examples

```javascript
property = require('jsprops').property

function Klass() {}

Klass.prototype.foo = property('foo')
Klass.prototype.bar = property('bar', null, 'def_value')
Klass.prototype.baz = property('baz', {
	set: function(set, val) {
		set(val.replace(/a/, 'b'))
	}
})
Klass.prototype.baz = property('woof', {
		init: function(set) {
			set(null)
		},
		get: function(get) {
			return get().replace(/z/, 'b')
		},
		set: (set, val) ->
			set(val.replace(/a/, 'b'))
	}, 'def_value'
)
```

## Install

    npm install jsprops

## Contracts
This library provides contracts (read - runtime type checking) based on [contracts.coffee](http://disnetdev.com/contracts.coffee/) library. There's a special build for that, so don't worry when using the default one. To make it work, a flag `global.contracts` is needed.