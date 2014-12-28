google = require "googleapis"
asyncmachine = require "asyncmachine"
OAuth2Client = google.auth.OAuth2

class Auth extends asyncmachine.AsyncMachine


	CredentialsSet: {}


	# TODO (by supporting an error state?)
	Ready:
		auto: yes
		requires: ['TokenRefreshed']


	Error:
		blocks: ['Ready']


	TokenRefreshed:
		requires: ['CredentialsSet']
		blocks: ['RefreshingToken']


	RefreshingToken:
		auto: yes
		requires: ['CredentialsSet']
		blocks: ['TokenRefreshed']


	client: null
	settings: null


	constructor: (@settings) ->
		super {}
		if process.env['DEBUG']
			@debug 'Auth / ', process.env['DEBUG']
		@register 'Ready', 'CredentialsSet', 'RefreshingToken', 'TokenRefreshed'
		@client = new OAuth2Client settings.client_id, settings.client_secret,
			settings.redirect_url
		if settings.access_token and settings.refresh_token
			@add 'CredentialsSet'
		else
			throw new Error 'not-implemented'


	CredentialsSet_state: ->
		@client.setCredentials
			access_token: @settings.access_token
			refresh_token: @settings.refresh_token


	RefreshingToken_state: ->
		@client.refreshAccessToken @addLater 'TokenRefreshed'



module.exports = {
	Auth
}