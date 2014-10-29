settings = require '../settings'
suspend = require 'suspend'
go = suspend.resume
async = suspend.async

settings.extend gmail_max_results: 300

main = suspend ->
	new Sync settings

main()
