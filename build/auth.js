var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var google = require("googleapis");
exports.OAuth2Client = google.auth.OAuth2;
var Auth = (function (_super) {
    __extends(Auth, _super);
    function Auth(config) {
        this.CredentialsSet = {};
        this.Ready = {
            auto: true,
            requires: ["CredentialsSet"]
        };
        this.oauth2Client = new exports.OAuth2Client(config.client_id, config.client_secret, config.redirect_url);
        if (config.access_token && config.refresh_token) {
            this.add("CredentialsSet");
        }
        else {
            throw new Error("not-implemented");
        }
    }
    Auth.prototype.CredentialsSet_enter = function () {
        return this.oauth2Client.setCredentials({
            access_token: config.access_token,
            refresh_token: config.refresh_token
        });
    };
    return Auth;
})(asyncmachine.AsyncMachine);
exports.Auth = Auth;
//# sourceMappingURL=auth.js.map