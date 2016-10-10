"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const asyncmachine_1 = require('asyncmachine');
const moment_1 = require('moment');
class States extends asyncmachine_1.default {
    constructor() {
        super(...arguments);
        this.Enabled = {};
        this.Dirty = { blocks: ['MsgsFetched', 'ThreadsFetched'] };
        this.FetchingThreads = {
            auto: true,
            requires: ['Enabled'],
            blocks: ['ThreadsFetched']
        };
        this.ThreadsFetched = {
            requires: ['Enabled'],
            blocks: ['FetchingThreads']
        };
        this.FetchingMsgs = {
            requires: ['Enabled', 'ThreadsFetched'],
            blocks: ['MsgsFetched']
        };
        this.MsgsFetched = { blocks: ['FetchingMsgs'] };
    }
}
exports.States = States;
class GmailQuery {
    constructor(gmail, query, name = '', fetch_msgs = false) {
        this.synced_history_id = null;
        this.states = null;
        this.result = null;
        this.completions = null;
        this.previous_results = null;
        this.query = null;
        this.fetch_msgs = null;
        this.gmail = gmail;
        this.query = query;
        this.name = name;
        this.fetch_msgs = fetch_msgs;
        this.api = this.gmail.api;
        this.completions = {};
        this.states = new States;
        this.states.setTarget(this);
        if (process.env['DEBUG']) {
            this.states.debug(`GmailQuery(${name}) / `, process.env['DEBUG']); // - 1
        }
    }
    get threads() { return this.result.threads; }
    // TODO should download messages in parallel with next threads list pages
    FetchingThreads_state(states) {
        return __awaiter(this, void 0, void 0, function* () {
            let abort = this.states.getAbort('FetchingThreads');
            if (yield this.isCached(abort)) {
                if (abort()) {
                    return;
                }
                console.log(`[CACHED] threads for '${this.query}'`);
                this.states.add('ThreadsFetched');
                if (this.fetch_msgs) {
                    this.states.add('MsgsFetched');
                }
                return;
            }
            if (__guardFunc__(abort, f => f())) {
                return;
            }
            console.log(`[FETCH] threads' list for '${this.query}'`);
            while (true) {
                let params = {
                    q: this.query,
                    userId: "me",
                    fields: "nextPageToken,threads(historyId,id)"
                };
                if (__guard__(res, x => x[0].nextPageToken)) {
                    console.log(`[FETCH] next page for threads' list for '${this.query}'`);
                    params.pageToken = res[0].nextPageToken;
                }
                var res = yield this.req(this.api.users.threads.list, params);
                if (__guardFunc__(abort, f1 => f1())) {
                    return;
                }
                if (!results) {
                    var results = res[0];
                }
                else {
                    results.threads.union(res[0].threads);
                }
                if (!res[0].nextPageToken) {
                    break;
                }
            }
            // TODO could be done in parallel with downloading of the results
            let history_id = yield this.gmail.getHistoryId(abort);
            if (__guardFunc__(abort, f2 => f2())) {
                return;
            }
            this.previous_results = this.result;
            this.result = results;
            if (this.result.threads == null) {
                this.result.threads = [];
            }
            this.updateThreadsCompletions();
            //    console.log "Found #{@result.threads.length} threads"
            if (!this.fetch_msgs) {
                this.synced_history_id = history_id;
            }
            this.states.add('ThreadsFetched');
            if (this.fetch_msgs) {
                abort = this.states.getAbort('ThreadsFetched');
                return this.states.add('FetchingMsgs', history_id, abort);
            }
            else {
                return this.previous_results = null;
            }
        });
    }
    ;
    FetchingMsgs_state(states, history_id, abort) {
        return __awaiter(this, void 0, void 0, function* () {
            abort = this.states.getAbort('FetchingMsgs', abort);
            let threads = yield Promise.all(this.threads.map(coroutine(thread => {
                // check if the thread has been previously downloaded and if
                // the history ID has changed
                let previous = __guard__(this.previous_results, x => x.threads.find(item => item.id === thread.id && item.historyId === thread.historyId));
                if (previous) {
                    var a = previous;
                }
                else {
                    var a = this.gmail.fetchThread(thread.id, thread.historyId, abort);
                    null;
                }
                return a;
            })));
            if (abort()) {
                return;
            }
            this.synced_history_id = history_id;
            this.result.threads = threads;
            this.previous_results = null;
            return this.states.add('MsgsFetched');
        });
    }
    ;
    Dirty_state() {
        return this.states.drop('Dirty');
    }
    isCached(abort) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.gmail.isCached(this.synced_history_id, abort);
        });
    }
    ;
    req(method, params) {
        return this.gmail.req(method, params);
    }
    // update completion statuses
    updateThreadsCompletions() {
        let non_completed_ids = [];
        // create / update existing threads completion data
        this.threads.forEach(thread => {
            let completion = this.completions[thread.id];
            // update the completion if thread is new or completion status has changed
            if (__guard__(completion, x => x.completed) || !completion) {
                this.completions[thread.id] = { completed: false, time: moment_1.default() };
            }
            return non_completed_ids.push(thread.id);
        });
        // complete threads not found in the query results
        return this.completions.each(function (row, id) {
            // TODO build non_completed
            if (__in__(id, non_completed_ids)) {
                return;
            }
            if (row.completed) {
                return;
            }
            row.completed = true;
            row.time = moment_1.default();
            return console.log(`Marking thread as completed by query (${id})`);
        });
    }
    threadWasCompleted(id) {
        if (__guard__(this.completions[id], x => x.completed) === true) {
            return this.completions[id].time;
        }
        else {
            return false;
        }
    }
    threadWasNotCompleted(id) {
        if (__guard__(this.completions[id], x => x.completed) === false) {
            return this.completions[id].time;
        }
        else {
            return false;
        }
    }
    threadSeen(id) {
        return Boolean(this.completions[id]);
    }
}
exports.GmailQuery = GmailQuery;
function __guardFunc__(func, transform) {
    return typeof func === 'function' ? transform(func) : undefined;
}
function __guard__(value, transform) {
    return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
function __in__(needle, haystack) {
    return haystack.indexOf(needle) >= 0;
}
