var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var flow = require('flow')
var def = flow.define;
var ex = flow.exec;
var settings = require('../../settings')
var imap = require("imap")
var ImapConnection = imap.ImapConnection;


var Promise = require('when')
var jsprops = require('jsprops')
var prop = jsprops.property;

var BaseClass = (function () {
    function BaseClass() { }
    BaseClass.prototype.repl = function () {
        var repl = repl.start({
            prompt: "repl> ",
            input: process.stdin,
            output: process.stdout
        });
        repl.context.this = this;
    };
    BaseClass.prototype.log = function () {
        var msgs = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            msgs[_i] = arguments[_i + 0];
        }
        console.log.apply(console, arguments);
    };
    return BaseClass;
})();
Object.merge(settings, {
    gmail_max_results: 300
});
var GmailSearch = (function (_super) {
    __extends(GmailSearch, _super);
    function GmailSearch(manager, name, update_interval) {
        if (typeof name === "undefined") { name = "noname"; }
        if (typeof update_interval === "undefined") { update_interval = 10 * 1000; }
        _super.call(this);
        this.manager = manager;
        this.name = name;
        this.update_interval = update_interval;
        this.active = true;
        this.last_update = 0;
        this.cmd = prop('cmd');
        this.monitored = prop('monitored', null, []);
    }
    GmailSearch.prototype.fetch = function (next) {
        this.log("performing a search for #{@name}");
        var deferred = Promise.defer();
        if(next) {
            deferred.promise.then(next);
        }
        this.query_(deferred);
        return deferred.promise;
    };
    GmailSearch.prototype.query_ = function (deferred) {
        var _this = this;
        var imap = this.manager.connection;
        var next = function (err, results) {
            return _this.results_(deferred, err, results);
        };
        imap.search([
            [
                'X-GM-RAW', 
                this.name
            ]
        ], next);
    };
    GmailSearch.prototype.results_ = function (deferred, err, results) {
        var _this = this;
        var imap = this.manager.connection;
        this.log('got search results');
        var content = {
            headers: [
                "id", 
                "from", 
                "to", 
                "subject", 
                "date"
            ]
        };
        var fetch = imap.fetch(results, content);
        fetch.on("message", function (msg) {
            msg.on("end", function () {
                if(!~_this.monitored().indexOf(msg.id)) {
                    _this.log('new msg');
                    _this.monitored().push(msg.id);
                }
            });
        });
        fetch.on("end", function (err) {
            _this.log('fetch ended');
            deferred.resolve();
        });
        fetch.on("error", function (err) {
            deferred.reject(err);
        });
    };
    return GmailSearch;
})(BaseClass);
var GmailManager = (function (_super) {
    __extends(GmailManager, _super);
    function GmailManager(settings, next) {
        _super.call(this);
        this.settings = settings;
        this.cursor = 0;
        this.locked = false;
        this.searches = prop('searches', null, []);
        this.connect(next);
        if(settings.repl) {
            this.repl();
        }
    }
    GmailManager.prototype.addSearch = function (name, update_interval) {
        this.searches().push(new GmailSearch(this, name, update_interval));
    };
    GmailManager.prototype.activate = function () {
        var search = this.searches().sortBy("last_update").first();
        this.log("activating #{search.name}");
        if(this.cursor >= this.searches().length) {
            this.cursor = 0;
        }
        var resolve = [
            Promise.defer(), 
            Promise.defer()
        ];
        setTimeout(resolve[0].resolve, this.minInterval_());
        search.fetch(resolve[1].resolve);
        return Promise.all(resolve).then(this.activate.bind(this));
    };
    GmailManager.prototype.minInterval_ = function () {
        var intervals = this.searches().map(function (ch) {
            return ch.update_interval;
        });
        return Math.min.apply(this, intervals);
    };
    GmailManager.prototype.connect = function (next) {
        var _this = this;
        this.log('connecting');
        var data = this.settings;
        this.connection = new ImapConnection({
            username: data.gmail_username,
            password: data.gmail_password,
            host: data.gmail_host || "imap.gmail.com",
            port: 993,
            secure: true
        });
        this.connection.connect(this, function () {
            _this.connection.openBox("[Gmail]/All Mail", false, next);
        });
    };
    GmailManager.prototype.disconnect = function () {
        this.connection.logout();
    };
    return GmailManager;
})(BaseClass);
var gmail;
ex(function () {
    gmail = new GmailManager(settings, this);
}, function () {
    gmail.addSearch('*', 5000);
    gmail.activate();
});
setTimeout(gmail.disconnect.bind(gmail), 10 * 1000);

