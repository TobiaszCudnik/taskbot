import * as google from "googleapis";
import AsyncMachine, {
	IState
} from "asyncmachine";
import { IConfig } from './types'

export default class Auth extends AsyncMachine {

	CredentialsSet: IState = {};

	// TODO (by supporting an error state?)
	Ready: IState = {
		auto: true,
		requires: ['TokenRefreshed']
	};

	Error: IState = {
		blocks: ['Ready']
	};

	TokenRefreshed: IState = {
		requires: ['CredentialsSet'],
		blocks: ['RefreshingToken']
	};

	RefreshingToken: IState = {
		auto: true,
		requires: ['CredentialsSet'],
		blocks: ['TokenRefreshed']
	};

	client: google.oauth2.v2.Oauth2;
	settings: IConfig;

	constructor(settings: IConfig) {
		super(null, false)
		this.settings = settings;
		if (process.env['DEBUG']) {
			this.id('Auth')
				.logLevel(process.env['DEBUG']);
		}
		this.register('Ready', 'CredentialsSet', 'RefreshingToken', 'TokenRefreshed')
		this.client = new google.oauth2.v2.Oauth2(settings.client_id, settings.client_secret,
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
