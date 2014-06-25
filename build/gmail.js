var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="asyncmachine-task.d.ts"/>
///<reference path="../node_modules/asyncmachine/lib/asyncmachine.d.ts"/>
///<reference path="../d.ts/async.d.ts"/>
///<reference path="../d.ts/imap.d.ts"/>
///<reference path="../d.ts/global.d.ts"/>
var settings = require('../settings');
var Imap = require("imap");
require("sugar");
var asyncmachine = require('asyncmachine');

var async = require('async');

Object.merge(settings, {
    gmail_max_results: 300
});

var Message = (function () {
    function Message(id, subject, labels, body) {
        this.subject = null;
        this.body = null;
        this.labels = null;
        this.id = null;
        this.query = null;
        this.fetch_id = 0;
        this.id = id;
        this.subject = subject;
        this.labels = labels;
        this.body = body;
    }
    return Message;
})();
exports.Message = Message;

var Query = (function (_super) {
    __extends(Query, _super);
    function Query(connection, query, update_interval) {
        _super.call(this);
        this.Fetching = {
            blocks: ["Idle"]
        };
        this.Idle = {
            blocks: ["Fetching"]
        };
        this.ResultsAvailable = {};
        this.FetchingQuery = {
            implies: ["Fetching"],
            blocks: ["QueryFetched"]
        };
        this.QueryFetched = {
            implies: ["Fetching"],
            blocks: ["FetchingQuery"]
        };
        this.FetchingResults = {
            implies: ["Fetching"],
            requires: ["QueryFetched"],
            blocks: ["ResultsFetched"]
        };
        this.ResultsFetched = {
            implies: ["ResultsAvailable"],
            blocks: ["FetchingResults"]
        };
        this.FetchingMessage = {
            implies: ["Fetching"],
            blocks: ["MessageFetched"],
            requires: ["FetchingResults"]
        };
        this.MessageFetched = {
            implies: ["Fetching"],
            blocks: ["FetchingMessage"],
            requires: ["FetchingResults"]
        };
        this.ResultsFetchingError = {
            implies: ["Idle"],
            blocks: ["FetchingResults"]
        };
        this.QueryFetchingError = {
            implies: ["Idle"],
            blocks: ["FetchingQuery"]
        };
        this.active = true;
        this.last_update = 0;
        this.next_update = 0;
        this.headers = {
            bodies: "HEADER.FIELDS (FROM TO SUBJECT DATE)",
            struct: true
        };
        this.connection = null;
        this.query = "*";
        this.update_interval = 10 * 1000;
        this.fetch = null;
        this.msg = null;
        this.query_results = null;
        this.messages = null;

        this.register("QueryFetched", "Fetching", "Idle", "FetchingQuery", "FetchingResults", "ResultsFetchingError", "FetchingMessage", "MessageFetched", "ResultsFetched", "ResultsAvailable");

        this.debug("[query:\"" + query + "\"]", 1);

        this.messages = {};
        this.query_results = [];
        this.connection = connection;
        this.query = query;
        this.update_interval = update_interval;
    }
    Query.prototype.FetchingQuery_enter = function () {
        var _this = this;
        this.last_update = Date.now();
        this.next_update = this.last_update + this.update_interval;
        this.log("performing a search for " + this.query);
        var tick = this.clock("FetchingQuery");
        this.connection.imap.search([["X-GM-RAW", this.query]], function (err, results) {
            if (!_this.is("FetchingQuery", tick + 1)) {
                return;
            }
            if (err) {
                return _this.add("QueryFetchingError", err);
            } else {
                return _this.add(["FetchingResults", "QueryFetched"], results);
            }
        });
        return true;
    };

    Query.prototype.QueryFetched_enter = function (states, results) {
        return this.query_results = results;
    };

    Query.prototype.FetchingQuery_FetchingResults = function (states, results) {
        var _this = this;
        this.log("Found " + results.length + " search results");
        if (!results.length) {
            this.add("ResultsFetched");
            return true;
        }
        this.fetch = this.connection.imap.fetch(results, this.headers);
        this.fetch.on("message", function (msg, id) {
            return _this.add("FetchingMessage", msg, id);
        });
        this.fetch.once("error", this.addLater("ResultsFetchingError"));
        return this.fetch.once("end", this.addLater("ResultsFetched"));
    };

    Query.prototype.FetchingMessage_enter = function (states, msg, id) {
        var _this = this;
        var attrs = null;
        var body_buffer = "";
        var body = null;
        this.msg = msg;
        this.msg.once("body", function (stream, data) {
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
        var _this = this;
        var events = ["body", "attributes", "end"];
        events.forEach(function (event) {
            return _this.msg.removeAllListeners(event);
        });
        return this.msg = null;
    };

    Query.prototype.FetchingMessage_MessageFetched = function (states, imap_msg, attrs, body) {
        var id = attrs["x-gm-msgid"];
        var labels = attrs["x-gm-labels"] || [];
        var msg = this.messages[id];
        if (!msg) {
            this.messages[id] = new Message(id, body.subject, labels);
            msg = this.messages[id];
            msg.fetch_id = this.clock("FetchingResults");
            return this.trigger("new-msg", msg);
        } else {
            msg.fetch_id = this.clock("FetchingResults");
            if (!Object.equal(msg.labels, labels)) {
                msg.labels = labels;
                return this.trigger("labels-changed", msg);
            }
        }
    };

    Query.prototype.FetchingResults_exit = function () {
        var _this = this;
        var tick = this.clock("FetchingResults");
        Object.each(this.messages, function (id, msg) {
            if (msg.fetch_id === tick) {
                return;
            }
            this.trigger("removed-msg", msg);
            return delete this.messages[id];
        });
        if (this.fetch) {
            var events = ["message", "error", "end"];
            events.forEach(function (event) {
                return _this.fetch.removeAllListeners(event);
            });
            return this.fetch = null;
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
        this.queries = null;
        this.queries_executing = null;
        this.queries_executing_limit = 3;
        this.imap = null;
        this.query_timer = null;
        this.settings = null;
        this.box = null;
        this.fetch = null;
        this.Connecting = {
            requires: ["Active"],
            blocks: ["Connected", "Disconnecting", "Disconnected"]
        };
        this.Connected = {
            requires: ["Active"],
            blocks: ["Connecting", "Disconnecting", "Disconnected"],
            implies: ["BoxClosed"]
        };
        this.Ready = {
            requires: ["BoxOpened"]
        };
        this.Idle = {
            requires: ["Ready"],
            block: ["ExecutingQueries"]
        };
        this.Active = {};
        this.ExecutingQueries = {
            blocks: ["Idle"]
        };
        this.QueryFetched = {
            requires: ["Ready"]
        };
        this.Disconnecting = {
            blocks: ["Connected", "Connecting", "Disconnected"]
        };
        this.DisconnectingQueries = {
            requires: ["Disconnecting"]
        };
        this.Disconnected = {
            blocks: ["Connected", "Connecting", "Disconnecting"]
        };
        this.Fetching = {
            blocks: ["Idle"],
            requires: ["ExecutingQueries"]
        };
        this.OpeningBox = {
            requires: ["Connected"],
            blocks: ["BoxOpened", "BoxClosing", "BoxClosed"]
        };
        this.BoxOpened = {
            requires: ["Connected"],
            depends: ["Connected"],
            blocks: ["OpeningBox", "BoxClosed", "BoxClosing"]
        };
        this.BoxClosing = {
            blocks: ["BoxOpened", "OpeningBox", "Box"]
        };
        this.BoxClosed = {
            blocks: ["BoxOpened", "OpeningBox", "BoxClosing"]
        };
        this.BoxOpeningError = {
            drops: ["BoxOpened", "OpeningBox"]
        };

        this.queries = [];
        this.queries_executing = [];
        this.settings = settings;

        this.register("Disconnected", "Disconnecting", "Connected", "Connecting", "Idle", "Active", "ExecutingQueries", "OpeningBox", "Fetching", "BoxOpened", "BoxClosing", "BoxClosed", "Ready", "QueryFetched", "BoxOpeningError");

        this.debug("[connection]", 1);
    }
    Connection.prototype.addQuery = function (query, update_interval) {
        this.log("Adding query '" + query + "'");
        query = new Query(this, query, update_interval);
        this.queries.push(query);
        query.on("new-msg", function (msg) {
            return this.log("New msg \"" + msg.subject + "\" (" + (msg.labels.join(",")) + ")");
        });
        query.on("labels-changed", function (msg) {
            return this.log("New labels \"" + msg.subject + "\" (" + (msg.labels.join(",")) + ")");
        });
        return query;
    };

    Connection.prototype.Connecting_enter = function (states) {
        var _this = this;
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
        var tick = this.clock("Connecting");
        return this.imap.once("ready", function () {
            if (!_this.is("Connecting", tick + 1)) {
                return;
            }
            return _this.add("Connected");
        });
    };

    Connection.prototype.Connecting_exit = function (states) {
        if (!~states.indexOf("Connected")) {
            this.imap.removeAllListeners("ready");
            return this.imap = null;
        }
    };

    Connection.prototype.Connected_enter = function () {
        return this.add("OpeningBox");
    };

    Connection.prototype.Connected_exit = function () {
        var _this = this;
        var tick = this.clock("Connected");
        return this.imap.end(function () {
            if (tick !== _this.clock("Connected")) {
                return;
            }
            _this.imap = null;
            return _this.add("Disconnected");
        });
    };

    Connection.prototype.OpeningBox_enter = function () {
        var _this = this;
        var tick = this.clock("OpeningBox");
        this.imap.openBox("[Gmail]/All Mail", false, function (err, box) {
            if (!_this.is("OpeningBox", tick + 1)) {
                return;
            }
            return _this.add(["BoxOpened", "Ready"], err, box);
        });
        return true;
    };

    Connection.prototype.BoxOpened_enter = function (states, err, box) {
        if (err) {
            this.add("BoxOpeningError", err);
            return false;
        }
        return this.box = box;
    };

    Connection.prototype.BoxOpeningError_enter = function (err) {
        throw new Error(err);
    };

    Connection.prototype.BoxClosing_enter = function () {
        var _this = this;
        var tick = this.clock("BoxClosing");
        return this.imap.closeBox(function () {
            if (!_this.is("BoxClosing", tick + 1)) {
                return;
            }
            return _this.add("BoxClosed");
        });
    };

    Connection.prototype.Ready_enter = function () {
        return this.add("ExecutingQueries");
    };

    Connection.prototype.Active_enter = function () {
        return this.add("Connecting");
    };

    Connection.prototype.Connected_Active = function () {
        return this.add("Connecting");
    };

    Connection.prototype.ExecutingQueries_enter = function () {
        return this.fetchScheduledQueries();
    };

    Connection.prototype.ExecutingQueries_Disconnecting = function (states, force) {
        var _this = this;
        this.drop("Active");
        if (this.query_timer) {
            clearTimeout(this.query_timer);
        }
        if (this.queries_executing.every(function (query) {
            return query.is("Idle");
        })) {
            return;
        }
        this.add("DisconnectingQueries");
        var tick = this.clock("BoxClosing");
        return async.forEach(this.queries_executing, function (query, done) {
            query.drop("Fetching");
            return query.once("Idle", done);
        }, function () {
            if (!_this.is("ExecutingQueries", tick)) {
                return;
            }
            return _this.add("BoxClosing");
        });
    };

    Connection.prototype.Fetching_exit = function () {
        return !this.queries_executing.some(function (query) {
            return query.is("Fetching");
        });
    };

    Connection.prototype.Disconnected_enter = function (states, force) {
        if (this.any("Connected", "Connecting")) {
            this.add("Disconnecting", force);
            return false;
        } else if (this.is("Disconnecting")) {
            return false;
        }
    };

    Connection.prototype.Disconnecting_exit = function () {
        return this.add("Disconnected");
    };

    Connection.prototype.fetchScheduledQueries = function () {
        var _this = this;
        while (this.queries_executing.length < this.queries_executing_limit) {
            var query = this.queries.sortBy("next_update").filter(function (item) {
                return !_this.queries_executing.some(function (s) {
                    return s.query === item.query;
                });
            }).filter(function (item) {
                return !item.next_update || item.next_update < Date.now();
            }).first();

            if (!query) {
                break;
            }

            this.log("activating " + query.query);
            this.log("concurrency++");
            this.queries_executing.push(query);
            query.add("FetchingQuery");
            this.add("Fetching");
            var tick = query.clock("FetchingQuery");
            query.once("Results.Fetched.enter", this.queryFetched.bind(this, query, tick));
        }
        var func = function () {
            return _this.fetchScheduledQueries();
        };
        return this.query_timer = setTimeout(func, this.minInterval_());
    };

    Connection.prototype.queryFetched = function (query, tick) {
        if (tick !== query.clock("FetchingQuery")) {
            return;
        }
        this.queries_executing = this.queries_executing.filter(function (row) {
            return row !== query;
        });
        this.drop("Fetching");
        this.add("QueryFetched", query);
        return this.log("concurrency--");
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
