var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var flow = require("./flow")
var a_def = flow.define;
var ex = flow.exec;
var settings = require('../../settings')

var ImapConnection = imap.ImapConnection;




var prop = jsprops.property;

connection = new ImapConnection({
    username: settings.gmail_username,
    password: settings.gmail_password,
    host: settings.gmail_host || "imap.gmail.com",
    port: 993,
    secure: true
});
var BaseClass = (function () {
    function BaseClass() { }
    BaseClass.prototype.repl = function () {
        repl.start({
            prompt: "repl> ",
            input: process.stdin,
            output: process.stdout
        }).context = {
            foo: this
        };
    };
    BaseClass.prototype.log = function () {
        console.log.apply(arguments);
    };
    return BaseClass;
})();
Object.merge(settings, {
    gmail_max_results: 300
});
var Channel = (function () {
    function Channel(manager, name) {
        if (typeof name === "undefined") { name = "noname"; }
        this.manager = manager;
        this.name = name;
        this.active = true;
        this.last_update = 0;
        this.update_interval = 10 * 1000;
        this.cmd = prop('cmd');
    }
    Channel.prototype.connection = function () {
        this.queue().push(Promise.defer());
        this.queue()[-1];
    };
    return Channel;
})();
var GmailManager = (function () {
    function GmailManager() { }
    return GmailManager;
})();
var Gmail = (function (_super) {
    __extends(Gmail, _super);
    function Gmail() {
        _super.apply(this, arguments);

    }
    return Gmail;
})(BaseClass);

