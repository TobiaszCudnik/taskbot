google = require "googleapis"
asyncmachine = require "asyncmachine"
OAuth2Client = google.auth.OAuth2

class Auth extends asyncmachine.AsyncMachine
	CredentialsSet: {}

	# TODO (by supporting an error state?)
	Ready:
		auto: yes
		requires: ['CredentialsSet']

	Error:
		drops: ['Ready']

	client: null
	settings: null

	constructor: (@settings) ->
		super {}
		(@debug 'Auth ', 2) if settings.debug
		@register 'Ready', 'CredentialsSet'
		@client = new OAuth2Client settings.client_id, settings.client_secret,
			settings.redirect_url
		if settings.access_token and settings.refresh_token
			@add 'CredentialsSet'
		else
			throw new Error 'not-implemented'

	CredentialsSet_enter: ->
		@client.setCredentials
			access_token: @settings.access_token
			refresh_token: @settings.refresh_token
		@add 'Ready'

module.exports = {
	Auth
}