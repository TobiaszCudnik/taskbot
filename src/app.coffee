settings = require '../settings'
suspend = require 'suspend'
go = suspend.resume
async = suspend.async
require 'sugar'

Object.merge settings, gmail_max_results: 300

main = suspend ->
	new Sync settings

main()
