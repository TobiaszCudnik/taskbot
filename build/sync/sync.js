var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="../../d.ts/bluebird.d.ts"/>
///<reference path="../auth"/>
///<reference path="../../d.ts/global.d.ts" />
var thread = require('./thread');
exports.Thread = thread.Thread;
var label = require('./label');
exports.Label = label.Label;
var auth = require('./auth');
var asyncmachine = require('asyncmachine');
var google = require('googleapis');
exports.tasks = google.tasks("v1");
exports.gmail = google.gmail("v1");
var suspend = require('suspend');
var Promise = require('bluebird');
exports.go = suspend.resume;
exports.async = suspend.async;
var States = (function (_super) {
    __extends(States, _super);
    function States() {
        this.Ready = {
            auto: true,
            requires: ["ImapConnected", "Authenticated"]
        };
        this.ImapConnected = {
            drops: ["ConnectingImap"]
        };
        this.ConnectingImap = {
            drops: ["ImapConnected"]
        };
        this.Authenticating = {
            drops: ["Authenticated"]
        };
        this.Authenticated = {
            drops: ["Authenticating"]
        };
        this.Syncing = {
            drops: ["Synced"]
        };
        this.Synced = {
            drops: ["Syncing"]
        };
        this.register("Ready", "ImapConnected", "ConnectingImap", "Authenticating", "Authenticated");
    }
    return States;
})(asyncmachine.AsyncMachine);
exports.States = States;
var Sync = (function () {
    function Sync(settings) {
        this.ConnectingImap_enter = exports.async(function () {
            return this.imap.add("Active");
        });
        this.Sync_enter = promise(function* () {
            var _this = this;
            var _ref, _results;
            _ref = this.settings.queries;
            _results = [];
            for (name in _ref) {
                data = _ref[name];
                if (name === "label_defaults") {
                    continue;
                }
                this.query = data;
                this.query_name = name;
                var list = yield this.getListForQuery(name, data);
                var value = yield Promise.all(yield(this.getThreads(data.query, yield(this.getTasks(list.id)))));
                var threads = value[0];
                exports.tasks = value[1];
                var tasks_in_threads = [];
                threads.forEach(function* (thread) {
                    var res = function* (thread) {
                    var res = yield _this.getTaskForThread(thread, tasks_in_threads);
                    var task = res[0];
                    var was_created = res[1];
                    if (!was_created) {
                        tasks_in_threads.push(ret);
                        return yield _this.syncTaskName(task, thread);
                    }
                });
                yield Promise.all(this.createThreadFromTasks(exports.tasks, list_id, threads, this.markTasksAsCompleted(exports.tasks, list_id, tasks_in_threads)));
                _results.push(yield var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="../../d.ts/bluebird.d.ts"/>
///<reference path="../auth"/>
///<reference path="../../d.ts/global.d.ts" />
var thread = require('./thread');
exports.Thread = thread.Thread;
var label = require('./label');
exports.Label = label.Label;
var auth = require('./auth');
var asyncmachine = require('asyncmachine');
var google = require('googleapis');
exports.tasks = google.tasks("v1");
exports.gmail = google.gmail("v1");
var suspend = require('suspend');
var Promise = require('bluebird');
exports.go = suspend.resume;
exports.async = suspend.async;
var States = (function (_super) {
    __extends(States, _super);
    function States() {
        this.Ready = {
            auto: true,
            requires: ["ImapConnected", "Authenticated"]
        };
        this.ImapConnected = {
            drops: ["ConnectingImap"]
        };
        this.ConnectingImap = {
            drops: ["ImapConnected"]
        };
        this.Authenticating = {
            drops: ["Authenticated"]
        };
        this.Authenticated = {
            drops: ["Authenticating"]
        };
        this.Syncing = {
            drops: ["Synced"]
        };
        this.Synced = {
            drops: ["Syncing"]
        };
        this.register("Ready", "ImapConnected", "ConnectingImap", "Authenticating", "Authenticated");
    }
    return States;
})(asyncmachine.AsyncMachine);
exports.States = States;
var Sync = (function () {
    function Sync(settings) {
        this.ConnectingImap_enter = exports.async(function () {
            return this.imap.add("Active");
        });
        this.Sync_enter = promise(function () {
            var _this = this;
            var _ref, _results;
            _ref = this.settings.queries;
            _results = [];
            for (name in _ref) {
                data = _ref[name];
                if (name === "label_defaults") {
                    continue;
                }
                this.query = data;
                this.query_name = name;
                var list = yield(this.getListForQuery(name, data));
                var value = yield(Promise.all(yield(this.getThreads(data.query, yield(this.getTasks(list.id))))));
                var threads = value[0];
                exports.tasks = value[1];
                var tasks_in_threads = [];
                threads.forEach(function (thread) {
                    var res = yield(_this.getTaskForThread(thread, tasks_in_threads));
                    var task = res[0];
                    var was_created = res[1];
                    if (!was_created) {
                        tasks_in_threads.push(ret);
                        return yield(_this.syncTaskName(task, thread));
                    }
                });
                yield(Promise.all(this.createThreadFromTasks(exports.tasks, list_id, threads, this.markTasksAsCompleted(exports.tasks, list_id, tasks_in_threads))));
                _results.push(yield(this.tasks.Tasks.clear(list_id));
            }
            return _results;
        });
        this.states = new States;
        this.settings = settings;
        this.imap = new exports.gmail.Connection(settings);
        this.auth = new auth.Auth(settings);
        this.tasks = new this.tasks.Lists;
        this.imap.addQuery("*", 1000);
        this.states.add("Authenticating");
        this.states.add("ConnectingImap");
        this.states.on("ConnectingImap.enter", this.ConnectingImap_enter);
        this.states.on("Authenticating.enter", this.Authenticating_enter);
        this.states.on("Sync.enter", this.Sync_enter);
        this.auth.pipeForward("Ready", this.states, "Authenticated");
        this.imap.pipeForward("Ready", this.states, "ImapConnected");
    }
    Sync.prototype.syncTaskName = function (task, thread) {
    };
    Sync.prototype.createTaskList = function (name) {
        var list = this.tasks.newTaskList().setTitle(name);
        var list_id = this.tasks.Tasklists.insert(list).getId();
        return list;
    };
    Sync.prototype.createTaskFromThread = function (thread, list_id) {
        var title = this.getTaskTitleFromThread(thread);
        var task = this.tasks.newTask().setTitle(title).setEtag("email:" + (thread.gmail_thread.getId()));
        this.tasks.Tasks.insert(task, list_id);
        Logger.log("Task added - '" + title + "'");
        return task;
    };
    Sync.prototype.createThreadFromTasks = function (tasks, list_id, threads) {
        var _i, _len, _ref, _results;
        _ref = tasks || [];
        _results = [];
        for (k = _i = 0, _len = _ref.length; _i < _len; k = ++_i) {
            r = _ref[k];
            if (r.getStatus() === "completed") {
                continue;
            }
            if (r.getEtag().test(/^email:/)) {
                continue;
            }
            var labels = [].concat(this.query["labels_new_task"] || [], (this.config.queries.label_defaults != null ? this.config.queries.label_defaults["new_task"] : void 0) || []);
            var subject = r.getTitle();
            var mail = this.gmail.sendEmail(Session.getUser().getEmail(), subject, "");
            threads = this.gmail.getInboxThreads();
            _results.push((function () {
                var _len1, _results1;
                _results1 = [];
                for (_j = 0, _len1 = threads.length; _j < _len1; _j++) {
                    t = threads[_j];
                    if (subject === thread.getFirstMessageSubject()) {
                        labels.forEach(function (label) { return thread.addLabel(label); });
                        r.setEtag("email:" + (thread.getId()));
                        this.tasks.Tasks.patch(r, list_id, r.getId());
                        break;
                    }
                    else {
                        _results1.push(void 0);
                    }
                }
                return _results1;
            }).call(this));
        }
        return _results;
    };
    Sync.prototype.getTaskLists = function () {
        return this.tasks.Tasklists.list().getItems();
    };
    Sync.prototype.getTasks = function (list_id) {
        this.tasks.Tasks.list(list_id).getItems();
        return Logger.log("Found '" + (exports.tasks != null ? exports.tasks.length : void 0) + "' tasks");
    };
    Sync.prototype.getTaskForThread = function (thread, tasks) {
        var task = this.findTaskForThread(tasks, thread);
        if (!task) {
            task = this.createTaskFromThread(thread);
        }
        else {
            this.markAsCompleted(task);
        }
        return task;
    };
    Sync.prototype.getTaskTitleFromThread = function (thread) {
        var title = thread.getName();
        return title === this.def_title;
        var missing_labels = this.extractLabelsFromThreadName(thread, task);
        if (this.def_title === 1) {
            return title = missing_labels + " " + title;
        }
        else {
            return title = title + " " + missing_labels;
        }
    };
    /*
        @name string
        @return [ string, Array<Label> ]
    */
    Sync.prototype.extractLabelsFromThreadName = function (name) {
        var labels = [];
        config.autolabels.forEach(function (r) {
            var symbol = r.symbol;
            var label = r.label;
            var prefix = r.prefix;
            return name = name.replace("(\b|^)" + symbol + "(\w+)", "", function (label) { return labels.push(label); });
        });
        return ret([name, labels]);
    };
    Sync.prototype.getThreads = function (query) {
        var ret = this.gmail.search(query).reverse().map(function (thread) { return new exports.Thread(thread); });
        Logger.log("Found '" + ret.length + "' threads");
        return ret;
    };
    Sync.prototype.taskEqualsThread = function (task, thread) {
        return thread.getId() === ("email:" + (task.getTitle()));
    };
    Sync.prototype.tasksIncludeThread = function (tasks, thread) {
        var _i, _len;
        if (this.taskEqualsThread(task, thread)) {
            for (_i = 0, _len = tasks.length; _i < _len; _i++) {
                task = tasks[_i];
                return ok;
            }
        }
    };
    Sync.prototype.markTasksAsCompleted = function (tasks, list_id, exclude) {
        var _i, _len, _ref, _results;
        _ref = tasks || [];
        _results = [];
        for (k = _i = 0, _len = _ref.length; _i < _len; k = ++_i) {
            task = _ref[k];
            if ((exclude.contains(k)) || task.getStatus() === "completed") {
                continue;
            }
            if (!/^email:/.test(task.getEtag())) {
                task.setStatus("completed");
                this.tasks.Tasks.patch(task, list_id, task.getId());
                _results.push(Logger.log("Task completed by email - '" + (task.getTitle()) + "'"));
            }
            else {
                _results.push(void 0);
            }
        }
        return _results;
    };
    Sync.prototype.getListForQuery = function (query, data) {
        var _i, _len;
        var list = null;
        var list_id = null;
        this.def_title = data.labels_in_title || this.config.labels_in_title;
        Logger.log("Parsing tasks for query '" + query + "'");
        for (_i = 0, _len = task_lists.length; _i < _len; _i++) {
            r = task_lists[_i];
            if (name === r.getTitle()) {
                list = r;
                list_id = list.getId();
                break;
            }
        }
        if (!list_id) {
            list = this.createTaskList(name);
            list_id = list.getId();
            Logger.log("Creating tasklist '" + name + "'");
        }
        return list;
    };
    Sync.prototype.markThreadAsCompleted = function (thread) {
        if (thread.getStatus() === "completed") {
            var labels = [].concat(this.query["labels_email_unmatched"] || [], (this.config.queries.label_defaults != null ? this.config.queries.label_defaults["email_unmatched"] : void 0) || []);
            thread.addLabels(labels);
            return Logger.log("Task completed, marked email - '" + (task.getTitle()) + "' with labels '" + (labels.join(" ")));
        }
    };
    Sync.states = null;
    Sync.settings = null;
    Sync.imap = null;
    Sync.auth = null;
    Sync.tasks = null;
    return Sync;
})();
exports.Sync = Sync;
//# sourceMappingURL=sync.js.map