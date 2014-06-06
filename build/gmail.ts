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
        implies: ["Idle"]
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

    headers = ["id", "from", "to", "subject", "date"];

    monitored = [];

    connection = null;

    name = "*";

    update_interval = 10 * 1000;

    constructor(connection, name, update_interval) {
        super();

        this.register("HasMonitored", "Fetching", "Idle", "FetchingQuery", "FetchingResults", "ResultsFetchingError", "FetchingMessage", "MessageFetched");

        this.debug("[query] ");
        this.set("Idle");

        if (connection) {
            this.connection = connection;
        }
        if (name) {
            this.name = name;
        }
        if (update_interval) {
            this.update_interval = update_interval;
        }
    }

    FetchingQuery_enter() {
        this.last_update = Date.now();
        this.log("performing a search for " + this.name);
        var imap = this.connection.imap;
        return imap.search([["X-GM-RAW", this.name]], (err, results) => this.add("FetchingResults", err, results));
    }

    FetchingQuery_FetchingResults(states, err, results) {
        this.log("got search results");
        var imap = this.connection.imap;
        var fetch = imap.fetch(results, this.headers);
        fetch.on("error", this.addLater("ResultsFetchingError"));
        fetch.on("end", () => {
            this.add("HasMonitored");
            return this.drop("FetchingResults");
        });
        return fetch.on("message", (msg) => this.add("FetchingMessage", msg));
    }

    FetchingMessage_enter(states, msg) {
        return msg.on("end", () => this.add("MessageFetched", msg));
    }

    FetchingMessage_MessageFetched(states, msg) {
        var id = msg["x-gm-msgid"];
        if (!~this.monitored.indexOf(id)) {
            var labels = msg["x-gm-labels"].join(", ");
            this.log("New msg \"" + msg.headers.subject + "\" (" + labels + ")");
            return this.monitored.push(id);
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

    log(...msgs) {
        return this.log.apply(console, msgs);
    }
}
export class Connection  extends asyncmachine.AsyncMachine {
    max_concurrency: number = 3;

    queries = [];

    connection: imap.Imap = null;

    box_opening_promise: rsvp.Defered = null;

    delayed_timer: number = null;

    concurrency: Query[] = [];

    threads = [];

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
        requires: ["Active"],
        blocks: ["BoxOpened", "BoxOpening", "BoxClosing"]
    };

    constructor(settings) {
        super();

        this.settings = settings;

        this.register("Disconnected", "Disconnecting", "Connected", "Connecting", "Idle", "Active", "Fetched", "Fetching", "Delayed", "BoxOpening", "BoxOpened", "BoxClosing", "BoxClosed");

        this.debug("[connection] ");
        this.set("Connecting");

        if (settings.repl) {
            this.repl();
        }
    }

    addQuery(query, update_interval) {
        this.queries.push(new Query(this, query, update_interval));
        if (this.is("BoxOpened")) {
            return this.add("Fetching");
        } else if (!this.add("BoxOpening")) {
            return this.log("BoxOpening not set", this.is());
        }
    }

    Connected_enter(states) {
        return this.set("BoxClosed");
    }

    Connected_Disconnected() {
        return process.exit();
    }

    Connecting_enter(states) {
        var data = this.settings;
        this.connection = new Imap({
            username: data.gmail_username,
            password: data.gmail_password,
            host: data.gmail_host || "imap.gmail.com",
            port: 993,
            secure: true
        });

        return this.connection.connect(this.addLater("Connected"));
    }

    Connecting_exit(target_states) {
        if (~target_states.indexOf("Disconnected")) {
            return true;
        }
    }

    Connected_exit() {
        return this.connection.logout(this.addLater("Disconnected"));
    }

    BoxOpening_enter() {
        if (this.is("BoxOpened")) {
            this.add("Fetching", 0);
            return false;
        } else {
            this.once("Box.Opened.enter", this.addLater("Fetching"));
        }
        if (this.box_opening_promise) {
            this.box_opening_promise.reject();
        }
        this.connection.openBox("[Gmail]/All Mail", false, this.addLater("BoxOpened"));
        this.box_opening_promise = this.last_promise;
        return true;
    }

    BoxOpening_BoxOpening() {
        return this.once("Box.Opened.enter", this.setLater("Fetching"));
    }

    BoxOpening_exit() {
        var promise = this.box_opening_promise;
        if (promise && !promise.isResolved) {
            return promise.reject();
        }
    }

    BoxClosing_enter() {
        return this.connection.closeBox(this.addLater("BoxClosed"));
    }

    BoxOpened_enter() {
        if (!this.add("Fetching")) {
            return this.log("Cant set Fetching", this.is());
        }
    }

    Delayed_enter() {
        return this.delayed_timer = setTimeout(this.addLater("Fetching"), this.minInterval_());
    }

    Delayed_exit() {
        return clearTimeout(this.delayed_timer);
    }

    Fetching_enter() {
        if (this.concurrency.length >= this.max_concurrency) {
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
        if (this.concurrency.some((s) => s.name === query.name)) {
            return false;
        }
        this.log("concurrency++");
        this.concurrency.push(query);
        query.add("FetchingQuery");
        return query.once("Fetching.Results.exit", () => {
            this.concurrency = this.concurrency.filter((row) => row !== query);
            this.log("concurrency--");
            this.add(["Delayed", "HasMonitored"]);
            return this.add("Fetching");
        });
    }

    Fetching_exit(states, args) {
        if (!~states.indexOf("Active")) {
            this.log("cancel fetching");
        }
        if (this.concurrency.length && !args["force"]) {
            return false;
        }
        var exits = this.concurrency.map((query) => query.drop("Fetching"));
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

    log(...msgs) {
        return this.log.apply(console, msgs);
    }
}
