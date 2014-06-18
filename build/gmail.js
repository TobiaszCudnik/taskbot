var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="asyncmachine-task.d.ts"/>
///<reference path="../node_modules/asyncmachine/lib/asyncmachine.d.ts"/>
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
            blocks: ["FetchingMessage", "FetchingResults", "FetchingQuery", "Fetching"]
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
        this.next_update = 0;
        this.headers = {
            bodies: "HEADER.FIELDS (FROM TO SUBJECT DATE)",
            struct: true
        };
        this.monitored = [];
        this.connection = null;
        this.name = "*";
        this.update_interval = 10 * 1000;
        this.fetch = null;
        this.msg = null;

        this.register("HasMonitored", "Fetching", "Idle", "FetchingQuery", "FetchingResults", "ResultsFetchingError", "FetchingMessage", "MessageFetched", "ResultsFetched");

        this.debug("[query:\"" + name + "\"]", 1);

        this.connection = connection;
        this.name = name;
        this.update_interval = update_interval;
    }
    Query.prototype.FetchingQuery_enter = function () {
        var _this = this;
        this.last_update = Date.now();
        this.next_update = this.last_update + this.update_interval;
        this.log("performing a search for " + this.name);
        this.connection.imap.search([["X-GM-RAW", this.name]], function (err, results) {
            return _this.add("FetchingResults", err, results);
        });
        return true;
    };

    Query.prototype.FetchingQuery_FetchingResults = function (states, err, results) {
        this.log("got search results");
        if (!results.length) {
            this.add("ResultsFetched");
            return true;
        }
        this.fetch = this.connection.imap.fetch(results, this.headers);
        this.fetch.on("message", this.addLater("FetchingMessage"));
        this.fetch.once("error", this.addLater("ResultsFetchingError"));
        return this.fetch.once("end", this.addLater("ResultsFetched"));
    };

    Query.prototype.FetchingResults_exit = function () {
        this.fetch.unbindAll();
        return this.fetch = null;
    };

    Query.prototype.FetchingMessage_enter = function (states, msg) {
        var _this = this;
        var attrs = null;
        var body_buffer = "";
        var body = null;
        this.msg.on("body", function (stream, data) {
            stream.on("data", function (chunk) {
                return body_buffer += chunk.toString("utf8");
            });
            return stream.once("end", function () {
                return body = Imap.parseHeader(body_buffer);
            });
        });
        this.msg.once("attributes", function (data) {
            return attrs = data;
        });
        return this.msg.once("end", function () {
            return _this.add("MessageFetched", msg, attrs, body);
        });
    };

    Query.prototype.FetchingMessage_exit = function () {
        this.msg.unbindAll();
        return this.msg = null;
    };

    Query.prototype.FetchingMessage_MessageFetched = function (states, msg, attrs, body) {
        var id = attrs["x-gm-msgid"];
        if (!~this.monitored.indexOf(id)) {
            var labels = attrs["x-gm-labels"] || [];
            this.log("New msg \"" + body.subject + "\" (" + (labels.join(",")) + ")");
            this.monitored.push(id);
            return this.add("HasMonitored");
        }
    };

    Query.prototype.ResultsFetchingError_enter = function (err) {
        this.log("fetching error", err);
        this.add("Idle");
        if (err) {
            throw new Error(err);
        }
    };
    return Query;
})(asyncmachine.AsyncMachine);
exports.Query = Query;
var Connection = (function (_super) {
    __extends(Connection, _super);
    function Connection(settings) {
        _super.call(this);
        this.queries = [];
        this.queries_running = [];
        this.queries_running_limit = 3;
        this.imap = null;
        this.box_opening_promise = null;
        this.query_timer = null;
        this.settings = null;
        this.last_promise = null;
        this.Disconnected = {
            blocks: ["Connected", "Connecting", "Disconnecting"]
        };
        this.Disconnecting = {
            blocks: ["Connected", "Connecting", "Disconnected"]
        };
        this.DisconnectingFetching = {
            requires: ["Disconnecting"]
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
        this.box = null;

        this.settings = settings;

        this.register("Disconnected", "Disconnecting", "Connected", "Connecting", "Idle", "Active", "Fetched", "Fetching", "Delayed", "BoxOpening", "BoxOpened", "BoxClosing", "BoxClosed", "HasMonitored");

        this.debug("[connection]", 1);
        this.set("Connecting");
    }
    Connection.prototype.addQuery = function (query, update_interval) {
        this.log("Adding query '" + query + "'");
        return this.queries.push(new Query(this, query, update_interval));
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
        var _this = this;
        if (this.is("BoxOpened")) {
            this.add("Fetching");
            return false;
        } else {
            this.once("Box.Opened.enter", this.addLater("Fetching"));
        }
        if (this.box_opening_promise) {
            this.box_opening_promise.reject();
        }
        var tick = this.clock("BoxOpening");
        this.imap.openBox("[Gmail]/All Mail", false, function () {
            if (_this.is("BoxOpening", tick)) {
                return _this.add("BoxOpened");
            }
        });
        this.box_opening_promise = this.last_promise;
        return true;
    };

    Connection.prototype.BoxClosing_enter = function () {
        return this.imap.closeBox(this.addLater("BoxClosed"));
    };

    Connection.prototype.BoxOpened_enter = function (err, box) {
        this.box = box;
        if (!(this.add("Fetching")) && !this.duringTransition()) {
            return this.log("Cant set Fetching (states: " + (this.is()) + ")");
        }
    };

    Connection.prototype.Delayed_exit = function () {
    };

    Connection.prototype.Fetching_enter = function () {
        var _this = this;
        while (this.queries_running.length < this.queries_running_limit) {
            var queries = this.queries.sortBy("next_update");
            queries = queries.filter(function (item) {
                return !_this.queries_running.some(function (s) {
                    return s.name === item.name;
                });
            });
            queries = queries.filter(function (item) {
                return !item.next_update || item.next_update < Date.now();
            });
            var query = queries.first();
            if (!query) {
                break;
            }

            this.log("activating " + query.name);
            this.log("concurrency++");
            this.queries_running.push(query);
            query.add("FetchingQuery");
            query.once("Results.Fetched.enter", function () {
                _this.queries_running = _this.queries_running.filter(function (row) {
                    return row !== query;
                });
                _this.log("concurrency--");
                return _this.add("HasMonitored");
            });
        }
        return this.query_timer = setTimeout(this.addLater("Fetching"), this.minInterval_());
    };

    Connection.prototype.Fetching_exit = function (states, force) {
        var _this = this;
        this.drop("Active");
        if (this.query_timer) {
            clearTimeout(this.query_timer);
        }
        if (this.queries_running.every(function (query) {
            return query.is("Idle");
        })) {
            return true;
        }
        var counter = this.queries_running.length;
        var exit = function () {
            if (--counter === 0) {
                return _this.add(states);
            }
        };
        this.queries_running.forEach(function (query) {
            query.drop("Fetching");
            return query.once("Idle", exit);
        });
        return false;
    };

    Connection.prototype.Disconnected_enter = function (states) {
        if (this.any("Connected", "Connecting")) {
            this.add("Disconnecting");
            return false;
        } else if (this.is("Disconnecting")) {
            return false;
        }
    };

    Connection.prototype.Disconnecting_exit = function () {
        return this.add("Disconnected");
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
    return Connection;
})(asyncmachine.AsyncMachine);
exports.Connection = Connection;
//# sourceMappingURL=gmail.js.map
