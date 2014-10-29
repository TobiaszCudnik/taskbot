///<reference path="../../d.ts/bluebird.d.ts"/>
///<reference path="../auth"/>
///<reference path="../../d.ts/global.d.ts" />
import thread = require('./thread');
export var Thread = thread.Thread;
import label = require('./label');
export var Label = label.Label;
import auth = require('./auth');
import asyncmachine = require('asyncmachine');
import google = require('googleapis');
export var tasks = google.tasks("v1");
export var gmail = google.gmail("v1");
import suspend = require('suspend');
import Promise = require('bluebird');
export var go = suspend.resume;
export var async = suspend.async;

export class States extends asyncmachine.AsyncMachine {
    constructor() {
        this.register("Ready", "ImapConnected", "ConnectingImap", "Authenticating", "Authenticated");
    }

    Ready = {
        auto: true,
        requires: ["ImapConnected", "Authenticated"]
    };

    ImapConnected = {
        drops: ["ConnectingImap"]
    };

    ConnectingImap = {
        drops: ["ImapConnected"]
    };

    Authenticating = {
        drops: ["Authenticated"]
    };

    Authenticated = {
        drops: ["Authenticating"]
    };

    Syncing = {
        drops: ["Synced"]
    };

    Synced = {
        drops: ["Syncing"]
    };
}

export class Sync {
    static states = null;

    static settings = null;

    static imap = null;

    static auth = null;

    static tasks = null;

    constructor(settings) {
        this.states = new States;
        this.settings = settings;
        this.imap = new gmail.Connection(settings);
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

    ConnectingImap_enter = async(function() {
        return this.imap.add("Active");
    });

    Sync_enter = promise(function() {
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
            tasks = value[1];

            var tasks_in_threads = [];
            threads.forEach((thread) => {
                var res = yield(this.getTaskForThread(thread, tasks_in_threads));
                var task = res[0];
                var was_created = res[1];
                if (!was_created) {
                    tasks_in_threads.push(ret);
                    return yield(this.syncTaskName(task, thread));
                }
            });

            yield(Promise.all(this.createThreadFromTasks(tasks, list_id, threads, this.markTasksAsCompleted(tasks, list_id, tasks_in_threads))));

            _results.push(yield(this.tasks.Tasks.clear(list_id)));
        }
        return _results;
    });

    syncTaskName(task, thread) {}

    createTaskList(name) {
        var list = this.tasks.newTaskList().setTitle(name);
        var list_id = this.tasks.Tasklists.insert(list).getId();

        return list;
    }

    createTaskFromThread(thread, list_id) {
        var title = this.getTaskTitleFromThread(thread);
        var task = this.tasks.newTask().setTitle(title).setEtag("email:" + (thread.gmail_thread.getId()));
        this.tasks.Tasks.insert(task, list_id);
        Logger.log("Task added - '" + title + "'");

        return task;
    }

    createThreadFromTasks(tasks, list_id, threads) {
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

            _results.push((function() {
                var _len1, _results1;
                _results1 = [];
                for (_j = 0, _len1 = threads.length; _j < _len1; _j++) {
                    t = threads[_j];
                    if (subject === thread.getFirstMessageSubject()) {
                        labels.forEach((label) => thread.addLabel(label));
                        r.setEtag("email:" + (thread.getId()));
                        this.tasks.Tasks.patch(r, list_id, r.getId());
                        break;
                    } else {
                        _results1.push(void 0);
                    }
                }
                return _results1;
            }).call(this));
        }
        return _results;
    }

    getTaskLists() {
        return this.tasks.Tasklists.list().getItems();
    }

    getTasks(list_id) {
        this.tasks.Tasks.list(list_id).getItems();
        return Logger.log("Found '" + (tasks != null ? tasks.length : void 0) + "' tasks");
    }

    getTaskForThread(thread, tasks) {
        var task = this.findTaskForThread(tasks, thread);

        if (!task) {
            task = this.createTaskFromThread(thread);
        } else {
            this.markAsCompleted(task);
        }

        return task;
    }

    getTaskTitleFromThread(thread) {
        var title = thread.getName();
        return title === this.def_title;

        var missing_labels = this.extractLabelsFromThreadName(thread, task);
        if (this.def_title === 1) {
            return title = missing_labels + " " + title;
        } else {
            return title = title + " " + missing_labels;
        }
    }

    /*
    	@name string
    	@return [ string, Array<Label> ]
    */

    extractLabelsFromThreadName(name) {
        var labels = [];
        config.autolabels.forEach((r) => {
            var symbol = r.symbol;
            var label = r.label;
            var prefix = r.prefix;
            return name = name.replace("(\b|^)" + symbol + "(\w+)", "", (label) => labels.push(label));
        });

        return ret([name, labels]);
    }

    getThreads(query) {
        var ret = this.gmail.search(query).reverse().map((thread) => new Thread(thread));
        Logger.log("Found '" + ret.length + "' threads");
        return ret;
    }

    taskEqualsThread(task, thread) {
        return thread.getId() === ("email:" + (task.getTitle()));
    }

    tasksIncludeThread(tasks, thread) {
        var _i, _len;
        if (this.taskEqualsThread(task, thread)) {
            for (_i = 0, _len = tasks.length; _i < _len; _i++) {
                task = tasks[_i];
                return ok;
            }
        }
    }

    markTasksAsCompleted(tasks, list_id, exclude) {
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
            } else {
                _results.push(void 0);
            }
        }
        return _results;
    }

    getListForQuery(query: string, data: Object): googleapis.tasks.ITaskList {
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
    }

    markThreadAsCompleted(thread) {
        if (thread.getStatus() === "completed") {
            var labels = [].concat(this.query["labels_email_unmatched"] || [], (this.config.queries.label_defaults != null ? this.config.queries.label_defaults["email_unmatched"] : void 0) || []);
            thread.addLabels(labels);
            return Logger.log("Task completed, marked email - '" + (task.getTitle()) + "' with labels '" + (labels.join(" ")));
        }
    }
}
