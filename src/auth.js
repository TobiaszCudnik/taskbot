"use strict";
const google = require("googleapis");
const asyncmachine_1 = require("asyncmachine");
let OAuth2Client = google.auth.OAuth2;
class Auth extends asyncmachine_1.default {
    constructor(settings) {
        super();
        this.CredentialsSet = {};
        // TODO (by supporting an error state?)
        this.Ready = {
            auto: true,
            requires: ['TokenRefreshed']
        };
        this.Error = { blocks: ['Ready'] };
        this.TokenRefreshed = {
            requires: ['CredentialsSet'],
            blocks: ['RefreshingToken']
        };
        this.RefreshingToken = {
            auto: true,
            requires: ['CredentialsSet'],
            blocks: ['TokenRefreshed']
        };
        this.client = null;
        this.settings = null;
        this.settings = settings;
        super({});
        if (process.env['DEBUG']) {
            this.debug('Auth / ', process.env['DEBUG']);
        }
        this.register('Ready', 'CredentialsSet', 'RefreshingToken', 'TokenRefreshed');
        this.client = new OAuth2Client(settings.client_id, settings.client_secret, settings.redirect_url);
        if (settings.access_token && settings.refresh_token) {
            this.add('CredentialsSet');
        }
        else {
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Auth;
