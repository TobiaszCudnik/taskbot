"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_private_1 = require("../config-private");
const config_1 = require("../config");
const readline = require("readline");
const google_auth_library_1 = require("google-auth-library");
const oauth2Client = new google_auth_library_1.OAuth2Client(config_private_1.default.google.client_id, config_private_1.default.google.client_secret, config_private_1.default.google.redirect_url);
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
// generate consent page url
const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: config_1.default.google.scopes
});
console.log('Visit the url: ', url + '&approval_prompt=force');
rl.question('Enter the code here:', function (code) {
    // request access token
    oauth2Client.getToken(code, function (err, tokens) {
        // set tokens to the client
        // TODO: tokens should be set by OAuth2 client.
        if (err) {
            console.error(err);
        }
        console.log(tokens);
        process.exit();
    });
});
//# sourceMappingURL=generate-oauth-tokens.js.map