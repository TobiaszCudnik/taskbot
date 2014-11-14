require './bootstrap/bootstrap'
settings = require '../settings'
suspend = require 'suspend'
sync = require './sync/sync'
Sync = sync.Sync
go = suspend.resume
async = suspend.async

Object.extend settings, gmail_max_results: 300

new Sync settings
