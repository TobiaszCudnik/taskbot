///<reference path="asyncmachine-task.d.ts"/>
///<reference path="../node_modules/asyncmachine/lib/asyncmachine.d.ts"/>
///<reference path="../d.ts/imap.d.ts"/>
///<reference path="../d.ts/global.d.ts"/>
import settings = require('../settings');
import Imap = require("imap");
require("sugar");
import asyncmachine = require('asyncmachine');
import am_task = require('./asyncmachine-task');
import rsvp = require('rsvp');

Object.merge(settings, {
    gmail_max_results: 300
});

export class Message extends am_task.Task {

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
        this.connection.imap.search([["X-GM-RAW", this.name]], (err, results) => this.add("FetchingResults", err, results));
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
        this.msg.on("body", (stream, data) => {
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

    queries_running: Query[] = [];

    queries_running_limit: number = 3;

    	imap: imap.Imap = null;

    box_opening_promise: rsvp.Defered = null;

    query_timer = null;

    settings: IGtdBotSettings = null;

    	last_promise: rsvp.Defered = null;

    Disconnected = {
        blocks: ["Connected", "Connecting", "Disconnecting"]
    };

    Disconnecting = {
        blocks: ["Connected", "Connecting", "Disconnected"]
    };

    DisconnectingFetching = {
        requires: ["Disconnecting"]
    };

    Connected = {
        blocks: ["Connecting", "Disconnecting", "Disconnected"],
        implies: ["BoxClosed"]
    };

    Connecting = {
        blocks: ["Connected", "Disconnecting", "Disconnected"]
    };

    Idle = {
        requires: ["Connected"]
    };

    Active = {
        requires: ["Connected"]
    };

    Fetched = {};

    Fetching = {
        requires: ["BoxOpened"],
        blocks: ["Idle", "Delayed"]
    };

    Delayed = {
        requires: ["Active"],
        blocks: ["Fetching", "Idle"]
    };

    BoxOpening = {
        requires: ["Active"],
        blocks: ["BoxOpened", "BoxClosing", "BoxClosed"]
    };

    BoxOpened = {
        depends: ["Connected"],
        requires: ["Active"],
        blocks: ["BoxOpening", "BoxClosed", "BoxClosing"]
    };

    BoxClosing = {
        blocks: ["BoxOpened", "BoxOpening", "Box"]
    };

    BoxClosed = {
        blocks: ["BoxOpened", "BoxOpening", "BoxClosing"]
    };

    HasMonitored = {
        requires: ["Connected", "BoxOpened"]
    };

    box = null;

    constructor(settings) {
        super();

        this.settings = settings;

        this.register("Disconnected", "Disconnecting", "Connected", "Connecting", "Idle", "Active", "Fetched", "Fetching", "Delayed", "BoxOpening", "BoxOpened", "BoxClosing", "BoxClosed", "HasMonitored");

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
        return this.imap.once("ready", this.addLater("Connected"));
    }

    Connecting_exit(target_states) {
        if (~target_states.indexOf("Disconnected")) {
            return true;
        }
    }

    Connected_exit() {
        return this.imap.end(this.addLater("Disconnected"));
    }

    BoxOpening_enter() {
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
        this.imap.openBox("[Gmail]/All Mail", false, () => {
            if (this.is("BoxOpening", tick)) {
                return this.add("BoxOpened");
            }
        });
        this.box_opening_promise = this.last_promise;
        return true;
    }

    BoxClosing_enter() {
        return this.imap.closeBox(this.addLater("BoxClosed"));
    }

    BoxOpened_enter(err, box) {
        this.box = box;
        if (!(this.add("Fetching")) && !this.duringTransition()) {
            return this.log("Cant set Fetching (states: " + (this.is()) + ")");
        }
    }

    Delayed_exit() {}

    Fetching_enter() {
        while (this.queries_running.length < this.queries_running_limit) {
            var queries = this.queries.sortBy("next_update");
            queries = queries.filter((item) => !this.queries_running.some((s) => s.name === item.name));
            queries = queries.filter((item) => !item.next_update || item.next_update < Date.now());
            var query = queries.first();
            if (!query) {
                break;
            }

            this.log("activating " + query.name);
            this.log("concurrency++");
            this.queries_running.push(query);
            query.add("FetchingQuery");
            query.once("Results.Fetched.enter", () => {
                this.queries_running = this.queries_running.filter((row) => row !== query);
                this.log("concurrency--");
                return this.add("HasMonitored");
            });
        }
        return this.query_timer = setTimeout(this.addLater("Fetching"), this.minInterval_());
    }

    Fetching_exit(states, force) {
        this.drop("Active");
        if (this.query_timer) {
            clearTimeout(this.query_timer);
        }
        if (this.queries_running.every((query) => query.is("Idle"))) {
            return true;
        }
        var counter = this.queries_running.length;
        var exit = () => {
            if (--counter === 0) {
                return this.add(states);
            }
        };
        this.queries_running.forEach((query) => {
            query.drop("Fetching");
            return query.once("Idle", exit);
        });
        return false;
    }

    Disconnected_enter(states) {
        if (this.any("Connected", "Connecting")) {
            this.add("Disconnecting");
            return false;
        } else if (this.is("Disconnecting")) {
            return false;
        }
    }

    Disconnecting_exit() {
        return this.add("Disconnected");
    }

    Fetching_Fetching(...args) {
        return this.Fetching_enter.apply(this, args);
    }

    Active_enter() {
        return this.add("BoxOpening");
    }

    minInterval_() {
        return Math.min.apply(null, this.queries.map((ch) => ch.update_interval));
    }
}
