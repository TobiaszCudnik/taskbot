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

describe 'Signals', ->
	scope = obj = Klass = spy = null

	describe 'basics', ->
		beforeEach ->
			scope =
				bar1_on: sinon.spy()
				bar2_on: sinon.spy()
				bar2_init: sinon.spy()
				baz_init_: no

			scope.baz_init = -> scope.baz_init_ = yes
			class Klass
				foo: signal('foo')
				bar1: signal('bar1', on: scope.bar1_on)
				bar2: signal('bar2',
					init: scope.bar2_init
					on: scope.bar2_on
				)
				baz: signal('baz', scope.baz_init)

				on_callstack: null
				on: (args...) ->
					@on_callstack ?= []
					@on_callstack.push args
				emit: ->

			obj = new Klass

			# mock
			for met in ['on', 'emit']
				sinon.stub obj, met

			# general spy
			spy = sinon.spy()
			# init signals (needs to be done after mocking)
			obj.foo().init()
			obj.baz().init()
			obj.bar1().init()
			obj.bar2().init()

#		it 'should define signal', ->
#			This fails with contracts.
#			expect(obj.foo.constructor).to.equal Signal

		it 'should init signals', ->
#			expect(scope.baz_init).was.called()
			expect(scope.baz_init_).to.be.ok()

		it 'should emit events', ->
			obj.foo ->
			expect(obj.emit).was.calledWith 'foo'

		it 'should emit events with params', ->
			obj.foo 'param1', ->
			expect(obj.emit).was.calledWith 'foo', 'param1'

		it 'should bind to events', ->
			obj.foo().on ->
			expect(obj.on).was.calledWith 'foo'

		it 'should support initial listener', ->
			expect(obj.on).was.calledWith 'bar1'

		it 'should init signals with initial listener', ->
			expect(obj.on).was.calledWith 'bar2'
			expect(scope.bar2_init).was.called()

		describe 'aop', ->
			it 'should allow to bind to a before event', ->
				obj.foo().before ->
				expect(obj.on).was.calledWith 'before-foo'

			it 'should allow to bind to an after event', ->
				obj.foo().after ->
				expect(obj.on).was.calledWith 'after-foo'

	describe 'oo', ->
		scope = {}

		beforeEach ->

			scope =
				listeners: 0

			class Klass extends SignalsMixin
				foo: signal('foo', on: -> )

				on: -> scope.listeners++
				emit: ->
				klass: 'klass1'

			class Klass2 extends Klass
				foo: @signal('foo', on: ->)
				klass: 'klass2'

			class Klass3 extends Klass2
				foo: @signal('foo', on: ->)
				klass: 'klass2'

			obj = new Klass3

			# mock
	#		for met in ['on', 'emit']
	#			sinon.stub obj, met

			# general spy
			spy = sinon.spy()

			# init signals (needs to be done after mocking)
			obj.foo().init()

		it 'should merge signals defined in subclasses', ->
			expect( scope.listeners ).to.eql 3

# END OF COPY - PASTE FROM basics

# TODO needs asynceventemitter
#    descript 'acceptance', ->
#        beforeEach ->
#            class klass extends AsyncEventEmitter
#
#                @signal 'foo'
#
#                @signal 'bar', on: (next, ret) -> next ++ret
#
#                constructor: ->
#
#            obj = new klass
#            # mock
#            sinon.stub obj
#            obj.foo.restore()
#            obj.bar.restore()
#            obj.baz.restore()
#
#        it 'should emit params', ->
#            spy = sinon.spy()
#            obj.foo().on spy
#            params = ['foo', 'bar']
#            obj.foo params[0], params[1], ->
#            # skip callback and ret value in the assertion
#            expect( spy.getCall(0).args[3..4] )
#                .to.eql params