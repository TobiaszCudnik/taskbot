///<reference path="asyncmachine-task.d.ts"/>
///<reference path="../node_modules/asyncmachine/lib/asyncmachine.d.ts"/>
///<reference path="../d.ts/async.d.ts"/>
///<reference path="../d.ts/imap.d.ts"/>
///<reference path="../d.ts/global.d.ts"/>
import settings = require('../settings');
import Imap = require("imap");
require("sugar");
import asyncmachine = require('asyncmachine');
import am_task = require('./asyncmachine-task');
import rsvp = require('rsvp');
import async = require('async');

Object.merge(settings, {
    gmail_max_results: 300
});

export class Message {

}

export class Query extends asyncmachine.AsyncMachine {
    HasMonitored = {};

    ResultsFetched = {
        blocks: ["FetchingMessage", "FetchingResults", "FetchingQuery", "Fetching"]
    };

    Fetching = {
        blocks: ["Idle"]
    };

    Idle = {
        blocks: ["Fetching"]
    };

    FetchingQuery = {
        implies: ["Fetching"],
        blocks: ["FetchingResults", "ResultsFetched"]
    };

    FetchingResults = {
        implies: ["Fetching"],
        blocks: ["FetchingQuery"]
    };

    ResultsFetchingError = {
        implies: ["Idle"],
        blocks: ["FetchingResults"]
    };

    FetchingMessage = {
        blocks: ["MessageFetched"],
        requires: ["FetchingResults"]
    };

    MessageFetched = {
        blocks: ["FetchingMessage"],
        requires: ["FetchingResults"]
    };

    active = true;

    last_update = 0;

    next_update = 0;

    headers = {
        bodies: "HEADER.FIELDS (FROM TO SUBJECT DATE)",
        struct: true
    };

    monitored = [];

    connection = null;

    name = "*";

    update_interval = 10 * 1000;

    fetch = null;

    msg = null;

    constructor(connection, name, update_interval) {
        super();

        this.register("HasMonitored", "Fetching", "Idle", "FetchingQuery", "FetchingResults", "ResultsFetchingError", "FetchingMessage", "MessageFetched", "ResultsFetched");

        this.debug("[query:\"" + name + "\"]", 1);

        this.connection = connection;
        this.name = name;
        this.update_interval = update_interval;
    }

    FetchingQuery_enter() {
        this.last_update = Date.now();
        this.next_update = this.last_update + this.update_interval;
        this.log("performing a search for " + this.name);
        var tick = this.clock("Fetching");
        this.connection.imap.search([["X-GM-RAW", this.name]], (err, results) => {
            if (!this.is("FetchingQuery", tick)) {
                return;
            }
            return this.add("FetchingResults", err, results);
        });
        return true;
    }

    FetchingQuery_FetchingResults(states, err, results) {
        this.log("got search results");
        if (!results.length) {
            this.add("ResultsFetched");
            return true;
        }
        this.fetch = this.connection.imap.fetch(results, this.headers);
        this.fetch.on("message", this.addLater("FetchingMessage"));
        this.fetch.once("error", this.addLater("ResultsFetchingError"));
        return this.fetch.once("end", this.addLater("ResultsFetched"));
    }

    FetchingResults_exit() {
        this.fetch.unbindAll();
        return this.fetch = null;
    }

    FetchingMessage_enter(states, msg) {
        var attrs = null;
        var body_buffer = "";
        var body = null;
        this.msg.once("body", (stream, data) => {
            stream.on("data", (chunk) => body_buffer += chunk.toString("utf8"));
            return stream.once("end", () => body = Imap.parseHeader(body_buffer));
        });
        this.msg.once("attributes", (data) => attrs = data);
        return this.msg.once("end", () => this.add("MessageFetched", msg, attrs, body));
    }

    FetchingMessage_exit() {
        this.msg.unbindAll();
        return this.msg = null;
    }

    FetchingMessage_MessageFetched(states, msg, attrs, body) {
        var id = attrs["x-gm-msgid"];
        if (!~this.monitored.indexOf(id)) {
            var labels = attrs["x-gm-labels"] || [];
            this.log("New msg \"" + body.subject + "\" (" + (labels.join(",")) + ")");
            this.monitored.push(id);
            return this.add("HasMonitored");
        }
    }

    ResultsFetchingError_enter(err) {
        this.log("fetching error", err);
        this.add("Idle");
        if (err) {
            throw new Error(err);
        }
    }
}
export class Connection extends asyncmachine.AsyncMachine {
    queries: Query[] = [];

    queries_executing: Query[] = [];

    queries_executing_limit: number = 3;

    	imap: imap.Imap = null;

    query_timer = null;

    settings: IGtdBotSettings = null;

    box = null;

    fetch = null;

    Connecting = {
        blocks: ["Connected", "Disconnecting", "Disconnected"]
    };

    Connected = {
        blocks: ["Connecting", "Disconnecting", "Disconnected"],
        implies: ["BoxClosed"]
    };

    Ready = {
        requires: ["BoxOpened"]
    };

    Idle = {
        requires: ["Ready"],
        block: ["ExecutingQueries"]
    };

    Active = {
        requires: ["Ready"]
    };

    ExecutingQueries = {
        requires: ["Active"],
        blocks: ["Idle"]
    };

    QueryFetched = {
        requires: ["Ready"]
    };

    Disconnecting = {
        blocks: ["Connected", "Connecting", "Disconnected"]
    };

    DisconnectingQueries = {
        requires: ["Disconnecting"]
    };

    Disconnected = {
        blocks: ["Connected", "Connecting", "Disconnecting"]
    };

    Fetching = {
        blocks: ["Idle"],
        requires: ["ExecutingQueries"]
    };

    BoxOpening = {
        requires: ["Active"],
        blocks: ["BoxOpened", "BoxClosing", "BoxClosed"]
    };

    BoxOpened = {
        depends: ["Connected"],
        blocks: ["BoxOpening", "BoxClosed", "BoxClosing"]
    };

    BoxClosing = {
        blocks: ["BoxOpened", "BoxOpening", "Box"]
    };

    BoxClosed = {
        blocks: ["BoxOpened", "BoxOpening", "BoxClosing"]
    };

    BoxOpeningError = {
        drops: ["BoxOpeningError"]
    };

    constructor(settings) {
        super();

        this.settings = settings;

        this.register("Disconnected", "Disconnecting", "Connected", "Connecting", "Idle", "Active", "ExecutingQueries", "BoxOpening", "Fetching", "BoxOpened", "BoxClosing", "BoxClosed", "Ready", "QueryFetched");

        this.debug("[connection]", 1);
        this.set("Connecting");
    }

    addQuery(query, update_interval) {
        this.log("Adding query '" + query + "'");
        return this.queries.push(new Query(this, query, update_interval));
    }

    Connecting_enter(states) {
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
        return this.imap.once("ready", () => {
            if (!this.is("Connecting", tick)) {
                return;
            }
            return this.add("Connected");
        });
    }

    Connecting_exit(target_states) {
        if (~target_states.indexOf("Disconnected")) {
            true;
        }
        this.imap.removeAllListeners("ready");
        return this.imap = null;
    }

    Connected_exit() {
        var tick = this.clock("Connected");
        return this.imap.end(() => {
            if (tick !== this.clock("Connected")) {
                return;
            }
            return this.add("Disconnected");
        });
    }

    BoxOpening_enter() {
        if (this.is("BoxOpened")) {
            this.add("ExecutingQueries");
            return false;
        } else {
            this.once("Box.Opened.enter", this.addLater("ExecutingQueries"));
        }
        var tick = this.clock("BoxOpening");
        this.imap.openBox("[Gmail]/All Mail", false, (err, box) => {
            if (!this.is("BoxOpening", tick)) {
                return;
            }
            return this.add(["BoxOpened", "Ready"], err, box);
        });
        return true;
    }

    BoxOpened_enter(err, box) {
        if (err) {
            this.add("BoxOpeningError", err);
            return false;
        }
        return this.box = box;
    }

    BoxOpeningError_enter(err) {
        throw new Error(err);
    }

    BoxClosing_enter() {
        var tick = this.clock("BoxClosing");
        return this.imap.closeBox(() => {
            if (!this.is("BoxClosing", tick)) {
                return;
            }
            return this.add("BoxClosed");
        });
    }

    Active_enter() {
        return this.add("ExecutingQueries");
    }

    ExecutingQueries_enter() {
        while (this.queries_executing.length < this.queries_executing_limit) {
            var query = this.queries.sortBy("next_update").filter((item) => !this.queries_executing.some((s) => s.name === item.name)).filter((item) => !item.next_update || item.next_update < Date.now()).first();

            if (!query) {
                break;
            }

            this.log("activating " + query.name);
            this.log("concurrency++");
            this.queries_executing.push(query);
            query.add("FetchingQuery");
            this.add("Fetching");
            var tick = query.clock("FetchingQuery");
            query.once("Results.Fetched.enter", () => {
                if (tick !== query.clock("FetchingQuery")) {
                    return;
                }
                this.queries_executing = this.queries_executing.filter((row) => row !== query);
                this.drop("Fetching");
                this.add("QueryFetched", query);
                return this.log("concurrency--");
            });
        }
        return this.query_timer = setTimeout(this.addLater("ExecutingQueries"), this.minInterval_());
    }

    ExecutingQueries_ExecutingQueries(...args) {
        return this.ExecutingQueries_ExecutingQueries.apply(this, args);
    }

    ExecutingQueries_Disconnecting(states, force) {
        this.drop("Active");
        if (this.query_timer) {
            clearTimeout(this.query_timer);
        }
        if (this.queries_executing.every((query) => query.is("Idle"))) {
            return;
        }
        this.add("DisconnectingQueries");
        var tick = this.clock("BoxClosing");
        return async.forEach(this.queries_executing, (query, done) => {
            query.drop("Fetching");
            return query.once("Idle", done);
        }, () => {
            if (!this.is("ExecutingQueries", tick)) {
                return;
            }
            return this.add("BoxClosing");
        });
    }

    Fetching_exit() {
        return !this.queries_executing.some((query) => query.is("Fetching"));
    }

    Disconnected_enter(states, force) {
        if (this.any("Connected", "Connecting")) {
            this.add("Disconnecting", force);
            return false;
        } else if (this.is("Disconnecting")) {
            return false;
        }
    }

    Disconnecting_exit() {
        return this.add("Disconnected");
    }

    hasMonitoredMsgs() {
        return this.queries.some((query) => query.is("HasMonitored"));
    }

    minInterval_() {
        return Math.min.apply(null, this.queries.map((ch) => ch.update_interval));
    }
}
