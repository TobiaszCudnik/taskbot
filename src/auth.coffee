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
	config: null

	constructor: (@config) ->
		super {}
		(@debug 'Auth ', 2) if config.debug
		@register 'Ready', 'CredentialsSet'
		@client = new OAuth2Client config.client_id, config.client_secret,
			config.redirect_url
		if config.access_token and config.refresh_token
			@add 'CredentialsSet'
		else
			throw new Error 'not-implemented'

	CredentialsSet_enter: ->
		@client.setCredentials
			access_token: @config.access_token
			refresh_token: @config.refresh_token
		@add 'Ready'

module.exports = {
	Auth
}