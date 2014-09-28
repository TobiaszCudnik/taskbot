google = require "googleapis"
OAuth2Client = google.auth.OAuth2

class Auth extends asyncmachine.AsyncMachine
	CredentialsSet:

	Ready:
		auto: yes
		requires: ['CredentialsSet']

	constructor: (config) ->
		@oauth2Client = new OAuth2Client config.client_id, config.client_secret,
			config.redirect_url
		if config.access_token and config.refresh_token
			@add 'CredentialsSet'
		else
			throw new Error 'not-implemented'

	CredentialsSet_enter: ->
		@oauth2Client.setCredentials
			access_token: config.access_token
			refresh_token: config.refresh_token
