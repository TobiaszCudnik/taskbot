"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
//thread = require './thread'
//Thread = thread.Thread
//label = require './label'
//Label = label.Label
const auth_1 = require('../auth');
const task_list_sync_1 = require('./task-list-sync');
const events_1 = require('events');
const asyncmachine_1 = require('asyncmachine');
const google = require('googleapis');
const gmail_1 = require('./gmail');
class States extends asyncmachine_1.default {
    constructor() {
        super(...arguments);
        this.Enabled = { auto: true };
        this.Authenticating = {
            auto: true,
            requires: ['Enabled'],
            blocks: ['Authenticated']
        };
        this.Authenticated = { blocks: ['Authenticating'] };
        this.Syncing = {
            auto: true,
            requires: ['Enabled', 'Authenticated'],
            blocks: ['Synced']
        };
        this.Synced = {
            requires: ['Enabled', 'Authenticated', 'TaskListsSynced',
                'QueryLabelsSynced'],
            blocks: ['Syncing']
        };
        this.TaskListSyncEnabled = {
            auto: true,
            requires: ['TaskListsFetched', 'QueryLabelsSynced']
        };
        this.GmailEnabled = { auto: true };
        this.GmailSyncEnabled = { auto: true };
        this.FetchingTaskLists = {
            auto: true,
            requires: ['Enabled'],
            blocks: ['TaskListsFetched']
        };
        this.TaskListsFetched = { blocks: ['FetchingTaskLists'] };
        this.QueryLabelsSynced = {};
        this.SyncingTaskLists = {};
        this.TaskListsSynced = {};
        this.Dirty = {};
    }
}
exports.States = States;
class Sync extends events_1.EventEmitter {
    //	Sync.defineType 'auth', auth.Auth, 'auth.Auth'
    constructor(config) {
        super();
        this.states = null;
        this.config = null;
        this.auth = null;
        this.tasks_api = null;
        this.gmail_api = null;
        this.task_lists = null;
        this.etags = null;
        this.active_requests = null;
        this.executed_requests = null;
        this.history_id = null;
        this.config = config;
        Object.defineProperty(this.prototype, 'history_id', { set(history_id) {
                return this.historyId = Math.max(this.history_id, history_id);
            }
        });
        this.states = new States;
        this.states.setTarget(this);
        if (process.env['DEBUG']) {
            this.states.debug('Sync / ', process.env['DEBUG']);
        }
        this.task_lists = [];
        this.labels = [];
        this.auth = new auth_1.default.Auth(config);
        this.task_lists_sync = [];
        this.etags = {};
        this.active_requests = 0;
        this.setMaxListeners(0);
        this.tasks_api = new google.tasks('v1', { auth: this.auth.client });
        this.gmail_api = new google.gmail('v1', { auth: this.auth.client });
        this.gmail = new gmail_1.Gmail(this);
        this.states.pipe('GmailEnabled', this.gmail.states, 'Enabled');
        this.states.pipe('GmailSyncEnabled', this.gmail.states, 'SyncingEnabled');
        this.initTaskListsSync();
        this.auth.pipe('Ready', this.states, 'Authenticated');
    }
    // ----- -----
    // Transitions
    // ----- -----
    // Try to set Synced state in all deps
    QueryLabelsSynced_state() { return this.states.add('Synced'); }
    TaskListsSynced_state() { return this.states.add('Synced'); }
    FetchingTaskLists_state() {
        return __awaiter(this, void 0, void 0, function* () {
            let abort = this.states.getAbort('FetchingTaskLists');
            // TODO throttle updates
            let res = yield this.req(this.tasks_api.tasklists.list, { etag: this.etags.task_lists });
            if (__guardFunc__(abort, f => f())) {
                console.log('abort', abort);
                return;
            }
            if (res[1].statusCode !== 304) {
                console.log('[FETCHED] tasks lists');
                this.etags.task_lists = res[1].headers.etag;
                this.task_lists = type(res[0].items, ITaskLists, 'ITaskLists');
            }
            else {
                console.log('[CACHED] tasks lists');
            }
            return this.states.add('TaskListsFetched');
        });
    }
    ;
    TaskListsSynced_enter() {
        return this.task_lists_sync.every(list => list.states.is('Synced'));
    }
    SyncingTaskLists_exit() {
        return !this.task_lists_sync.some(list => list.states.is('Syncing'));
    }
    // Schedule the next sync
    // TODO measure the time taken
    Synced_state() {
        console.log('!!! SYNCED !!!');
        console.log(`Requests: ${this.executed_requests}`);
        this.last_sync_end = new Date();
        this.last_sync_time = this.last_sync_end - this.last_sync_start;
        console.log(`Time: ${this.last_sync_time}ms`);
        if (this.next_sync_timeout) {
            clearTimeout(this.next_sync_timeout);
        }
        return this.next_sync_timeout = setTimeout((this.states.addByListener('Syncing')), this.config.sync_frequency);
    }
    Syncing_state() {
        console.log('--- SYNCING ---');
        this.executed_requests = 0;
        // TODO define in the prototype
        this.last_sync_start = new Date();
        this.last_sync_end = null;
        this.last_sync_time = null;
        if (this.states.is('Dirty')) {
            // Add after the transition
            this.states.add(this.gmail.states, 'Dirty');
            this.states.drop('Dirty');
        }
        else {
            // Reset synced states in children
            //			@states.drop @gmail.states, 'QueryLabelsSynced'
            this.gmail.states.drop('QueryLabelsSynced');
        }
        return this.task_lists_sync.map((list) => this.states.add(list.states, 'Restart'));
    }
    // ----- -----
    // Methods
    // ----- -----
    findTaskForThread(thread_id) {
        let task = null;
        let list = null;
        this.task_lists_sync.each(function (list_sync) {
            let found = list_sync.getTaskForThread(thread_id);
            if (found) {
                task = found;
                return list = list_sync;
            }
        });
        return [task, list];
    }
    initTaskListsSync() {
        let result = [];
        for (let name in this.config.tasks.queries) {
            let data = this.config.tasks.queries[name];
            if (name === 'labels_defaults') {
                continue;
            }
            let task_list = new task_list_sync_1.default(name, data, this);
            this.states.pipe('TaskListSyncEnabled', task_list.states, 'Enabled', false);
            task_list.states.pipe('Synced', this.states, 'TaskListsSynced');
            task_list.states.pipe('Syncing', this.states, 'SyncingTaskLists');
            // TODO handle error of non existing task list in the inner classes
            //			task_list.states.on 'Restart.enter', => @states.drop 'TaskListsFetched'
            result.push(this.task_lists_sync.push(task_list));
        }
        return result;
    }
    // TODO support the abort param
    req(method, params) {
        return __awaiter(this, void 0, void 0, function* () {
            // wait until new request will be possible
            while (this.active_requests >= this.constructor.max_active_requests) {
                yield new Promise(resolve => {
                    return this.once('request-finished', resolve);
                });
            }
            this.active_requests++;
            //		console.log "@active_requests++"
            if (typeof params === 'undefined' || params === null) {
                params = {};
            }
            this.log(['REQUEST', params], 3);
            console.log(params);
            params.auth = this.auth.client;
            // TODO catch errors
            method = promisify(method);
            let ret = yield method(params);
            //		console.log "@active_requests--"
            this.active_requests--;
            this.emit('request-finished');
            this.executed_requests++;
            //		delete params.auth
            //		console.log params
            //		console.log ret[0]
            return ret;
        });
    }
    ;
    log(msgs, level) {
        if (!process.env['DEBUG']) {
            return;
        }
        if (level && level > process.env['DEBUG']) {
            return;
        }
        if (!(msgs instanceof Array)) {
            msgs = [msgs];
        }
        return console.log.apply(console, msgs);
    }
}
Sync.max_active_requests = 5;
exports.Sync = Sync;
function __guardFunc__(func, transform) {
    return typeof func === 'function' ? transform(func) : undefined;
}
