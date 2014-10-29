///<reference path="../d.ts/googleapis-nodejs-common.d.ts"/>
///<reference path="../node_modules/asyncmachine/lib/asyncmachine.d.ts"/>
import google = require("googleapis");
export var OAuth2Client = google.auth.OAuth2;

export class Auth extends asyncmachine.AsyncMachine {
    CredentialsSet = {};

    Ready = {
        auto: true,
        requires: ["CredentialsSet"]
    };

    constructor(config) {
        this.oauth2Client = new OAuth2Client(config.client_id, config.client_secret, config.redirect_url);
        if (config.access_token && config.refresh_token) {
            this.add("CredentialsSet");
        } else {
            throw new Error("not-implemented");
        }
    }

    CredentialsSet_enter() {
        return this.oauth2Client.setCredentials({
            access_token: config.access_token,
            refresh_token: config.refresh_token
        });
    }
}
