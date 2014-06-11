///<reference path="asyncmachine-task.d.ts"/>
///<reference path="../node_modules/asyncmachine/build/asyncmachine.d.ts"/>
///<reference path="../d.ts/imap.d.ts"/>
///<reference path="../d.ts/global.d.ts"/>
import settings = require('../settings');
import Imap = require("imap");
import repl = require('repl');
require("sugar");
import asyncmachine = require('asyncmachine');
import am_task = require('./asyncmachine-task');
import rsvp = require('rsvp');

Object.merge(settings, {
    gmail_max_results: 300
});

export class Query extends am_task.Task {
    HasMonitored = {};

    Fetching = {
        blocks: ["Idle"]
    };

    Idle = {
        blocks: ["Fetching"]
    };

    FetchingQuery = {
        implies: ["Fetching"],
        blocks: ["FetchingResults"]
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

    headers = {
        bodies: "HEADER.FIELDS (FROM TO SUBJECT DATE)",
        struct: true
    };

    monitored = [];

    connection = null;

    name = "*";

    update_interval = 10 * 1000;

    fetching_counter = 0;

    constructor(connection, name, update_interval) {
        super();

        this.register("HasMonitored", "Fetching", "Idle", "FetchingQuery", "FetchingResults", "ResultsFetchingError", "FetchingMessage", "MessageFetched");

        this.debug("[query]");

        this.connection = connection;
        this.name = name;
        this.update_interval = update_interval;
    }

    FetchingQuery_enter() {
        this.last_update = Date.now();
        this.log("performing a search for " + this.name);
        this.connection.imap.search([["X-GM-RAW", this.name]], (err, results) => this.add("FetchingResults", err, results));
        return true;
    }

    FetchingQuery_FetchingResults(states, err, results) {
        this.log("got search results");
        var fetch = this.connection.imap.fetch(results, this.headers);
        fetch.on("error", this.addLater("ResultsFetchingError"));
        return fetch.on("message", (msg) => {
            this.fetching_counter++;
            return this.add("FetchingMessage", msg);
        });
    }

    FetchingMessage_enter(states, msg) {
        var attrs = null;
        var body_buffer = "";
        var body = null;
        msg.on("body", (stream, data) => {
            stream.on("data", (chunk) => body_buffer += chunk.toString("utf8"));
            return stream.once("end", () => body = Imap.parseHeader(body_buffer));
        });
        msg.once("attributes", (data) => attrs = data);
        return msg.once("end", () => this.add("MessageFetched", msg, attrs, body));
    }

    FetchingMessage_MessageFetched(states, msg, attrs, body) {
        var id = attrs["x-gm-msgid"];
        if (!~this.monitored.indexOf(id)) {
            var labels = attrs["x-gm-labels"] || [];
            this.log("New msg \"" + body.subject + "\" (" + (labels.join(",")) + ")");
            this.monitored.push(id);
            this.add("HasMonitored");
        }
        --this.fetching_counter;
        if (!this.fetching_counter) {
            return this.drop("FetchingResults");
        }
    }

    ResultsFetchingError_enter(err) {
        this.log("fetching error", err);
        setTimeout(this.addLater("Idle"), 0);
        if (err) {
            throw new Error(err);
        }
    }

    repl() {
        var repl = repl.start({
            prompt: "repl> ",
            input: process.stdin,
            output: process.stdout
        });
        return repl.context["this"] = this;
    }
}
export class Connection extends asyncmachine.AsyncMachine {
    queries_running_limit: number = 3;

    queries: Query[] = [];

    	imap: imap.Imap = null;

    box_opening_promise: rsvp.Defered = null;

    delayed_timer: number = null;

    queries_running: Query[] = [];

    settings: IGtdBotSettings = null;

    	last_promise: rsvp.Defered = null;

    Disconnected = {
        blocks: ["Connected", "Connecting", "Disconnecting"]
    };

    Disconnecting = {
        blocks: ["Connected", "Connecting", "Disconnected"]
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

    constructor(settings) {
        super();

        this.settings = settings;

        this.register("Disconnected", "Disconnecting", "Connected", "Connecting", "Idle", "Active", "Fetched", "Fetching", "Delayed", "BoxOpening", "BoxOpened", "BoxClosing", "BoxClosed");

        this.debug("[connection]");
        this.set("Connecting");

        if (settings.repl) {
            this.repl();
        }
    }

    addQuery(query, update_interval) {
        this.log("Adding query '" + query + "'");
        return this.queries.push(new Query(this, query, update_interval));
    }

    Connected_Disconnected() {
        return process.exit();
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
        this.imap.openBox("[Gmail]/All Mail", false, this.addLater("BoxOpened"));
        this.box_opening_promise = this.last_promise;
        return true;
    }

    BoxOpening_BoxOpening() {
        return this.once("Box.Opened.enter", this.setLater("Fetching"));
    }

    BoxClosing_enter() {
        return this.imap.closeBox(this.addLater("BoxClosed"));
    }

    BoxOpened_enter() {
        if (!this.add("Fetching")) {
            return this.log("Cant set Fetching " + (this.is()));
        }
    }

    Delayed_enter() {
        return this.delayed_timer = setTimeout(this.addLater("Fetching"), this.minInterval_());
    }

    Delayed_exit() {
        return clearTimeout(this.delayed_timer);
    }

    Fetching_enter() {
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
        if (this.queries_running.some((s) => s.name === query.name)) {
            return false;
        }
        this.log("concurrency++");
        this.queries_running.push(query);
        query.add("FetchingQuery");
        query.once("Fetching.Results.exit", () => {
            this.queries_running = this.queries_running.filter((row) => row !== query);
            this.log("concurrency--");
            this.add(["Delayed", "HasMonitored"]);
            return this.add("Fetching");
        });
        return true;
    }

    Fetching_exit(states, args) {
        if (!~states.indexOf("Active")) {
            this.log("cancel fetching");
        }
        if (this.queries_running.length && !(args != null ? args[0].force : void 0)) {
            return false;
        }
        var exits = this.queries_running.map((query) => query.drop("Fetching"));
        return !~exits.indexOf(false);
    }

    Fetching_Fetching = this.Fetching_enter;

    Active_enter() {
        return this.add("BoxOpening");
    }

    minInterval_() {
        return Math.min.apply(null, this.queries.map((ch) => ch.update_interval));
    }

    repl() {
        var repl = repl.start({
            prompt: "repl> ",
            input: process.stdin,
            output: process.stdout
        });
        return repl.context["this"] = this;
    }
}
