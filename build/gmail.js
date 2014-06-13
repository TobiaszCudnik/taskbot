var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="asyncmachine-task.d.ts"/>
///<reference path="../node_modules/asyncmachine/build/asyncmachine.d.ts"/>
///<reference path="../d.ts/imap.d.ts"/>
///<reference path="../d.ts/global.d.ts"/>
var settings = require('../settings');
var Imap = require("imap");

require("sugar");
var asyncmachine = require('asyncmachine');
var am_task = require('./asyncmachine-task');

Object.merge(settings, {
    gmail_max_results: 300
});

var Message = (function (_super) {
    __extends(Message, _super);
    function Message() {
        _super.apply(this, arguments);
    }
    return Message;
})(am_task.Task);
exports.Message = Message;

var Query = (function (_super) {
    __extends(Query, _super);
    function Query(connection, name, update_interval) {
        _super.call(this);
        this.HasMonitored = {};
        this.ResultsFetched = {
            blocks: ["FetchingMessage", "FetchingResults", "FetchingQuery"]
        };
        this.Fetching = {
            blocks: ["Idle"]
        };
        this.Idle = {
            blocks: ["Fetching"]
        };
        this.FetchingQuery = {
            implies: ["Fetching"],
            blocks: ["FetchingResults", "ResultsFetched"]
        };
        this.FetchingResults = {
            implies: ["Fetching"],
            blocks: ["FetchingQuery"]
        };
        this.ResultsFetchingError = {
            implies: ["Idle"],
            blocks: ["FetchingResults"]
        };
        this.FetchingMessage = {
            blocks: ["MessageFetched"],
            requires: ["FetchingResults"]
        };
        this.MessageFetched = {
            blocks: ["FetchingMessage"],
            requires: ["FetchingResults"]
        };
        this.active = true;
        this.last_update = 0;
        this.headers = {
            bodies: "HEADER.FIELDS (FROM TO SUBJECT DATE)",
            struct: true
        };
        this.monitored = [];
        this.connection = null;
        this.name = "*";
        this.update_interval = 10 * 1000;
        this.fetching_counter = 0;

        this.register("HasMonitored", "Fetching", "Idle", "FetchingQuery", "FetchingResults", "ResultsFetchingError", "FetchingMessage", "MessageFetched", "ResultsFetched");

        this.debug("[query:\"" + name + "\"]", 3);

        this.connection = connection;
        this.name = name;
        this.update_interval = update_interval;
    }
    Query.prototype.FetchingQuery_enter = function () {
        var _this = this;
        this.last_update = Date.now();
        this.log("performing a search for " + this.name);
        this.connection.imap.search([["X-GM-RAW", this.name]], function (err, results) {
            return _this.add("FetchingResults", err, results);
        });
        return true;
    };

    Query.prototype.FetchingQuery_FetchingResults = function (states, err, results) {
        var _this = this;
        this.log("got search results");
        var fetch = this.connection.imap.fetch(results, this.headers);
        fetch.on("error", this.addLater("ResultsFetchingError"));
        return fetch.on("message", function (msg) {
            _this.fetching_counter++;
            return _this.add("FetchingMessage", msg);
        });
    };

    Query.prototype.FetchingMessage_enter = function (states, msg) {
        var _this = this;
        var attrs = null;
        var body_buffer = "";
        var body = null;
        msg.on("body", function (stream, data) {
            stream.on("data", function (chunk) {
                return body_buffer += chunk.toString("utf8");
            });
            return stream.once("end", function () {
                return body = Imap.parseHeader(body_buffer);
            });
        });
        msg.once("attributes", function (data) {
            return attrs = data;
        });
        return msg.once("end", function () {
            return _this.add("MessageFetched", msg, attrs, body);
        });
    };

    Query.prototype.FetchingMessage_MessageFetched = function (states, msg, attrs, body) {
        var id = attrs["x-gm-msgid"];
        if (!~this.monitored.indexOf(id)) {
            var labels = attrs["x-gm-labels"] || [];
            this.log("New msg \"" + body.subject + "\" (" + (labels.join(",")) + ")");
            this.monitored.push(id);
            this.add("HasMonitored");
        }
        --this.fetching_counter;
        if (!this.fetching_counter) {
            return this.add("ResultsFetched");
        }
    };

    Query.prototype.ResultsFetchingError_enter = function (err) {
        this.log("fetching error", err);
        setTimeout(this.addLater("Idle"), 0);
        if (err) {
            throw new Error(err);
        }
    };

    Query.prototype.repl = function () {
        var repl = repl.start({
            prompt: "repl> ",
            input: process.stdin,
            output: process.stdout
        });
        return repl.context["this"] = this;
    };
    return Query;
})(am_task.Task);
exports.Query = Query;
var Connection = (function (_super) {
    __extends(Connection, _super);
    function Connection(settings) {
        _super.call(this);
        this.queries_running_limit = 3;
        this.queries = [];
        this.imap = null;
        this.box_opening_promise = null;
        this.delayed_timer = null;
        this.queries_running = [];
        this.settings = null;
        this.last_promise = null;
        this.Disconnected = {
            blocks: ["Connected", "Connecting", "Disconnecting"]
        };
        this.Disconnecting = {
            blocks: ["Connected", "Connecting", "Disconnected"]
        };
        this.Connected = {
            blocks: ["Connecting", "Disconnecting", "Disconnected"],
            implies: ["BoxClosed"]
        };
        this.Connecting = {
            blocks: ["Connected", "Disconnecting", "Disconnected"]
        };
        this.Idle = {
            requires: ["Connected"]
        };
        this.Active = {
            requires: ["Connected"]
        };
        this.Fetched = {};
        this.Fetching = {
            requires: ["BoxOpened"],
            blocks: ["Idle", "Delayed"]
        };
        this.Delayed = {
            requires: ["Active"],
            blocks: ["Fetching", "Idle"]
        };
        this.BoxOpening = {
            requires: ["Active"],
            blocks: ["BoxOpened", "BoxClosing", "BoxClosed"]
        };
        this.BoxOpened = {
            depends: ["Connected"],
            requires: ["Active"],
            blocks: ["BoxOpening", "BoxClosed", "BoxClosing"]
        };
        this.BoxClosing = {
            blocks: ["BoxOpened", "BoxOpening", "Box"]
        };
        this.BoxClosed = {
            blocks: ["BoxOpened", "BoxOpening", "BoxClosing"]
        };
        this.HasMonitored = {
            requires: ["Connected", "BoxOpened"]
        };

        this.settings = settings;

        this.register("Disconnected", "Disconnecting", "Connected", "Connecting", "Idle", "Active", "Fetched", "Fetching", "Delayed", "BoxOpening", "BoxOpened", "BoxClosing", "BoxClosed", "HasMonitored");

        this.debug("[connection]", 2);
        this.set("Connecting");

        if (settings.repl) {
            this.repl();
        }
    }
    Connection.prototype.addQuery = function (query, update_interval) {
        this.log("Adding query '" + query + "'");
        return this.queries.push(new Query(this, query, update_interval));
    };

    Connection.prototype.Connected_Disconnected = function () {
        return process.exit();
    };

    Connection.prototype.Connecting_enter = function (states) {
        var data = this.settings;
        this.imap = new Imap({
            user: data.gmail_username,
            password: data.gmail_password,
            host: data.gmail_host || "imap.gmail.com",
            port: 993,
            tls: true,
            debug: this.settings.debug ? console.log : void 0
        });

        this.imap.connect();
        return this.imap.once("ready", this.addLater("Connected"));
    };

    Connection.prototype.Connecting_exit = function (target_states) {
        if (~target_states.indexOf("Disconnected")) {
            return true;
        }
    };

    Connection.prototype.Connected_exit = function () {
        return this.imap.end(this.addLater("Disconnected"));
    };

    Connection.prototype.BoxOpening_enter = function () {
        if (this.is("BoxOpened")) {
            this.add("Fetching");
            return false;
        } else {
            this.once("Box.Opened.enter", this.addLater("Fetching"));
        }
        if (this.box_opening_promise) {
            this.box_opening_promise.reject();
        }
        this.imap.openBox("[Gmail]/All Mail", false, this.addLater("BoxOpened"));
        this.box_opening_promise = this.last_promise;
        return true;
    };

    Connection.prototype.BoxOpening_BoxOpening = function () {
        return this.once("Box.Opened.enter", this.setLater("Fetching"));
    };

    Connection.prototype.BoxClosing_enter = function () {
        return this.imap.closeBox(this.addLater("BoxClosed"));
    };

    Connection.prototype.BoxOpened_enter = function () {
        if (!this.add("Fetching")) {
            return this.log("Cant set Fetching " + (this.is()));
        }
    };

    Connection.prototype.Delayed_enter = function () {
        return this.delayed_timer = setTimeout(this.addLater("Fetching"), this.minInterval_());
    };

    Connection.prototype.Delayed_exit = function () {
        return clearTimeout(this.delayed_timer);
    };

    Connection.prototype.Fetching_enter = function () {
        var _this = this;
        if (this.queries_running.length >= this.queries_running_limit) {
            return false;
        }
        var queries = this.queries.sortBy("last_update");
        var query = queries.first();
        var i = 0;
        while (query.last_update + query.update_interval > Date.now()) {
            query = queries[i++];
            if (!query) {
                return false;
            }
        }
        this.log("activating " + query.name);
        if (this.queries_running.some(function (s) {
            return s.name === query.name;
        })) {
            return false;
        }
        this.log("concurrency++");
        this.queries_running.push(query);
        query.add("FetchingQuery");
        query.once("ResultsFetched", function () {
            _this.queries_running = _this.queries_running.filter(function (row) {
                return row !== query;
            });
            _this.log("concurrency--");
            return _this.add(["Delayed", "HasMonitored"]);
        });
        return true;
    };

    Connection.prototype.Disconnected_exit = function (states, force) {
        return this.drop("Fetching", force);
    };

    Connection.prototype.Fetching_exit = function (states, force) {
        if (this.queries_running.length && !force) {
            console.log("Running queries present and Disconnect isn't forced");
            return false;
        }
        this.queries_running.forEach(function (query) {
            return query.drop("Fetching");
        });
        return this.queries_running.every(function (query) {
            return !query.is("Fetching");
        });
    };

    Connection.prototype.Fetching_Fetching = function () {
        var args = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            args[_i] = arguments[_i + 0];
        }
        return this.Fetching_enter.apply(this, args);
    };

    Connection.prototype.Active_enter = function () {
        return this.add("BoxOpening");
    };

    Connection.prototype.minInterval_ = function () {
        return Math.min.apply(null, this.queries.map(function (ch) {
            return ch.update_interval;
        }));
    };

    Connection.prototype.repl = function () {
        var repl = repl.start({
            prompt: "repl> ",
            input: process.stdin,
            output: process.stdout
        });
        return repl.context["this"] = this;
    };
    return Connection;
})(asyncmachine.AsyncMachine);
exports.Connection = Connection;
//# sourceMappingURL=gmail.js.map
