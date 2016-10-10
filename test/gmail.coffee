settings = require '../settings'
gmail = require '../build/gmail'
suspend = require 'suspend'
sinon = require 'sinon'

async = suspend.async
go = suspend.resume

describe "Connection", ->
	beforeEach ->
		@gmail = gmail.Connection settings
		await gmail.once 'Connected', go()
		sinon.mock gmail.Query
		@gmail.set 'Active'
		
	afterEach ->
		@gmail.set 'Disconnected'
		await gmail.once 'Disconnected', go()
#		await gmail.onceSet 'Disconnected', go()
		
	it 'should connect to the server', ->
	it 'should open the mailbox'
	it 'should close the connection on exit'
	it 'should create new search queries'
	
describe 'Query', ->
	it 'should fetch the query result'
	it 'should monitor labels of found msgs'
	it 'should be concurrent'