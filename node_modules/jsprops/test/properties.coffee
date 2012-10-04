sinon = require 'sinon'
expect = require 'expect.js'
expect = require('sinon-expect').enhance expect, sinon, 'was'

{
	signal
	property
	Signal
	PropertiesMixin
	SignalsMixin
} = require '../lib/properties.js'

describe 'Properties', ->
	obj = Klass = null

	describe 'basics', ->
		def_value = foo: true, bar: false
		beforeEach ->
			class Klass
				foo: property('foo', null, 'bar')
				bar: property('bar', null, def_value)

				constructor: ->
			obj = new Klass

		it 'should work like getter', ->
			expect(obj.foo()).to.eql 'bar'

		it 'should work like a setter', ->
			obj.foo 'baz'
			expect(obj.foo()).to.eql 'baz'

		it 'should clone the def_value value', ->
			obj.bar().foo = false
			obj.bar().bar = true
			obj2 = new Klass
			expect(obj2.bar()).to.eql foo: true, bar: false

#	describe 'mixin basics', ->
#		def_value = foo: true, bar: false
#		beforeEach ->
#			class Klass extends PropertiesMixin
#				@property 'foo', 'bar'
#				@property 'bar', def_value
#
#				constructor: ->
#
#			obj = new Klass
#
#		it 'should work like getter', ->
#			expect(obj.foo()).to.eql 'bar'
#
#		it 'should work like a setter', ->
#			obj.foo 'baz'
#			expect(obj.foo()).to.eql 'baz'
#
#		it 'should clone the def_value value', ->
#			obj.bar().foo = false
#			obj.bar().bar = true
#			obj2 = new Klass
#			expect(obj2.bar()).to.eql foo: true, bar: false

	describe 'custom funcs', ->
		beforeEach ->
			class Klass
				foo: property('foo',
					set: (set, val) ->
						set val.replace /a/, 'b'
				)

				bar: property( 'bar',
					init: (set) -> set 'bar'
					get: (get) -> return get().replace /a/, 'b'
				)

				baz: property('baz',
					init: (set) -> set null
					get: (get) -> return get().replace /z/, 'b'
					set: (set, val) ->
						set val.replace /a/, 'b'
				)

				constructor: ->
			obj = new Klass

		it 'should support custom setter', ->
			obj.foo 'baz'
			expect(obj.foo()).to.eql 'bbz'

		it 'should support custom getter', ->
			expect(obj.bar()).to.eql 'bbr'

		it 'should support custom getter and setter', ->
			obj.baz 'baz'
			expect(obj.baz()).to.eql 'bbb'


#describe 'AsyncProperties', ->
#	obj = klass = null
#
#	describe 'basics', ->
#		beforeEach ->
#			class klass
#				property 'foo', @,
#					init: -> 'bar'
#					set: (set, val, next) ->
#						setTimeout ->
#							set val
#							do next
#
#				constructor: ->
#			obj = new klass
#
#		it 'should work like a getter', ->
#	#        expect( obj.foo() ).to.eql 'bar'
#			debugger
#			obj.foo().should.eql 'bar'
#
#		it 'should work like setter', ->
#			obj.foo 'baz'
#			obj.foo().should.eql 'baz'