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
		require: ['TokenRefreshed']
	};

	Error: IState = {
		drop: ['Ready']
	};

	TokenRefreshed: IState = {
		require: ['CredentialsSet'],
		drop: ['RefreshingToken']
	};

	RefreshingToken: IState = {
		auto: true,
		require: ['CredentialsSet'],
		drop: ['TokenRefreshed']
	};

	client: any;
	settings: IConfig;

	constructor(settings: IConfig) {
		super(null, false)
		// google.options({ params: { quotaUser: 'user123@example.com' } });
		this.settings = settings;
		this.register('Ready', 'CredentialsSet', 'RefreshingToken', 'TokenRefreshed')
		if (process.env['DEBUG']) {
			this.id('Auth')
				.logLevel(process.env['DEBUG']);
			global.am_network.addMachine(this)
		}
		this.client = new google.auth.OAuth2(settings.client_id, settings.client_secret,
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
