import * as google from "googleapis";
import AsyncMachine from "asyncmachine";
let OAuth2Client = google.auth.OAuth2;

export default class Auth extends AsyncMachine {


	CredentialsSet = {};


	// TODO (by supporting an error state?)
	Ready = {
		auto: true,
		requires: ['TokenRefreshed']
	};


	Error =
		{blocks: ['Ready']};


	TokenRefreshed = {
		requires: ['CredentialsSet'],
		blocks: ['RefreshingToken']
	};


	RefreshingToken = {
		auto: true,
		requires: ['CredentialsSet'],
		blocks: ['TokenRefreshed']
	};


	client = null;
	settings = null;


	constructor(settings) {
		super()
		this.settings = settings;
		super({});
		if (process.env['DEBUG']) {
			this.debug('Auth / ', process.env['DEBUG']);
		}
		this.register('Ready', 'CredentialsSet', 'RefreshingToken', 'TokenRefreshed');
		this.client = new OAuth2Client(settings.client_id, settings.client_secret,
			settings.redirect_url);
		if (settings.access_token && settings.refresh_token) {
			this.add('CredentialsSet');
		} else {
			throw new Error('not-implemented');
		}
	}


	CredentialsSet_state() {
		return this.client.setCredentials({
			access_token: this.settings.access_token,
			refresh_token: this.settings.refresh_token
		});
	}


	RefreshingToken_state() {
		return this.client.refreshAccessToken(this.addByCallback('TokenRefreshed'));
	}
}
