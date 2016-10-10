"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const task_list_sync_states_1 = require('./task-list-sync-states');
// TODO loose
const internet_timestamp_1 = require('internet-timestamp');
// TODO loose
const ago_1 = require('ago');
const moment = require('moment');
const events_1 = require('events');
class TaskListSync extends events_1.EventEmitter {
    constructor(name, data, sync) {
        super();
        this.data = null;
        this.name = null;
        //  @defineType 'data',
        this.list = null;
        this.tasks_api = null;
        //  @defineType 'tasks_api', [ITask], '[ITask]'
        this.states = null;
        //  @defineType 'states', QueryStates, 'QueryStates'
        this.tasks = null;
        this.tasks_completed = null;
        this.tasks_completed_from = null;
        this.threads = null;
        //	@defineType 'completions_threads', [typedef {
        //		type: String, time: Object
        //	}], '[{completed: Boolean, time: Object}]'
        //	@defineType 'completions_tasks', [typedef {
        //		type: String, time: Object
        //	}], '[{completed: Boolean, time: Object}]'
        this.sync = null;
        this.query = null;
        this.etags = null;
        this.completions_tasks = null;
        this.quota_exceeded = false;
        // ----- -----
        // Methods
        // ----- -----
        // TODO remove from tasks collections
        this.deleteTask = coroutine(function* (task_id, abort) {
            return await;
            this.req(this.tasks_api.tasks.delete, {
                tasklist: this.list.id,
                task: task_id
            });
        });
        this.name = name;
        this.data = data;
        this.sync = sync;
        this.defineType('list', ITaskList, 'ITaskList');
        this.defineType('labels', [ILabel], '[ILabel]');
        this.states = new task_list_sync_states_1.default;
        this.states.setTarget(this);
        if (process.env['DEBUG']) {
            this.states.debug('TaskList / ', process.env['DEBUG']);
        }
        this.gmail_api = this.sync.gmail_api;
        this.gmail = this.sync.gmail;
        this.tasks_api = this.sync.tasks_api;
        this.tasks_in_threads = [];
        this.tasks = [];
        this.etags = {};
        this.completions_tasks = {};
        this.last_sync_time = null;
        this.query = this.sync.gmail.createQuery(this.data.query, 'TaskList', true);
        // bind to query states
        this.query.states.pipe('ThreadsFetched', this.states);
        this.query.states.pipe('MsgsFetched', this.states);
        this.states.pipe('Enabled', this.query.states);
    }
    // ----- -----
    // Transitions
    // ----- -----
    Restart_state() { return this.states.add('Syncing'); }
    Syncing_state() {
        this.push_dirty = false;
        // TODO define in the prototype
        this.last_sync_start = new Date();
        this.last_sync_end = null;
        return this.last_sync_time = null;
    }
    Synced_state() {
        if (this.push_dirty) {
            this.states.add(this.sync.states, 'Dirty');
        }
        this.last_sync_end = new Date();
        this.last_sync_time = this.last_sync_end - this.last_sync_start;
        return console.log(`TaskList ${this.name} synced in: ${this.last_sync_time}ms`);
    }
    SyncingThreadsToTasks_state() {
        let abort = this.states.getAbort('SyncingThreadsToTasks');
        yield Promise.all(this.query.threads.map(function (thread) {
            return __awaiter(this, void 0, void 0, function* () {
                let task = this.getTaskForThread(thread.id);
                if (task) {
                    let task_completed = this.taskWasCompleted(task.id);
                    let thread_not_completed = this.query.threadWasNotCompleted(thread.id);
                    if (task_completed &&
                        task_completed.unix() < thread_not_completed.unix()) {
                        //await @uncompleteTask task.id, abort
                        // TODO await
                        this.uncompleteTask(task.id, abort);
                    }
                    return;
                }
                // checks if there was a task for this thread in this list
                // somewhere in the past
                let task_id = this.getTaskForThreadFromCompletions(thread.id);
                if (task_id) {
                    this.completeThread(thread.id);
                    return delete this.completions_tasks[task_id];
                }
                else {
                    let list_sync;
                    [task, list_sync] = this.sync.findTaskForThread(thread.id);
                    // try to "move" the task from another list
                    // TODO extract to a method
                    if (task) {
                        console.log(`Moving task \"${task.title}\"`);
                        // mark current instance as deleted
                        task.deleted = true;
                        let promises = [
                            list_sync.deleteTask(task.id),
                            this.createTask({
                                title: task.title,
                                notes: task.notes
                            })
                        ];
                        // TODO await Promise.all promises
                        return Promise.all(promises);
                    }
                    else {
                        // TODO await @createTaskFromThread thread, abort
                        return this.createTaskFromThread(thread, abort);
                    }
                }
            });
        }));
        if (__guardFunc__(abort, f => f())) {
            return;
        }
        this.states.add('ThreadsToTasksSynced');
        return this.states.add('Synced');
    }
    ;
    SyncingTasksToThreads_state() {
        let abort = this.states.getAbort('SyncingTasksToThreads');
        // loop over non completed tasks
        yield Promise.all(this.tasks.items.map(function (task) {
            return __awaiter(this, void 0, void 0, function* () {
                // TODO support children tasks
                if (!task.title || task.parent) {
                    return;
                }
                let thread_id = this.taskLinkedToThread(task);
                // TODO support tasks moved from other lists
                if (thread_id) {
                    let thread_completed = this.query.threadWasCompleted(thread_id);
                    let task_not_completed = this.taskWasNotCompleted(task.id);
                    if (!(this.query.threadSeen(thread_id)) || (thread_completed &&
                        thread_completed.unix() < task_not_completed.unix())) {
                        // TODO await @uncompleteThread thread_id, abort
                        return this.uncompleteThread(thread_id, abort);
                    }
                }
                else {
                    // TODO await @createThreadForTask task, abort
                    return this.createThreadForTask(task, abort);
                }
            });
        }));
        if (abort()) {
            return;
        }
        this.states.add('TasksToThreadsSynced');
        return this.states.add('Synced');
    }
    ;
    SyncingCompletedThreads_state() {
        let abort = this.states.getAbort('SyncingCompletedThreads');
        yield Promise.all(this.query.completions
            .map(function (row, thread_id) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!row.completed) {
                    return;
                }
                let task = this.getTaskForThread(thread_id);
                if (!task) {
                    return;
                }
                let task_not_completed = this.taskWasNotCompleted(task.id);
                if (task_not_completed &&
                    row.time.unix() > task_not_completed.unix() &&
                    // TODO possible race condition
                    !task.deleted) {
                    // TODO await @completeTask task.id, abort
                    return this.completeTask(task.id, abort);
                }
            });
        }));
        if (abort()) {
            return;
        }
        this.states.add('CompletedThreadsSynced');
        return this.states.add('Synced');
    }
    ;
    SyncingCompletedTasks_state() {
        let abort = this.states.getAbort('SyncingCompletedTasks');
        yield Promise.all(this.completions_tasks.map(function (row, task_id) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!row.completed) {
                    return;
                }
                let task = this.getTask(task_id);
                if (!task) {
                    return;
                }
                let thread_id = this.taskLinkedToThread(task);
                let thread_not_completed = this.query.threadWasNotCompleted(thread_id);
                if (thread_not_completed && row.time.unix() > thread_not_completed.unix()) {
                    // TODO await @completeThread thread_id, abort
                    return this.completeThread(thread_id, abort);
                }
            });
        }));
        if (abort()) {
            return;
        }
        this.states.add('CompletedTasksSynced');
        return this.states.add('Synced');
    }
    ;
    PreparingList_state() {
        return __awaiter(this, void 0, void 0, function* () {
            let abort = this.states.getAbort('PreparingList');
            let list = null;
            // TODO? move?
            this.def_title = this.data.labels_in_title || this.sync.config.labels_in_title;
            // create or retrive task list
            for (let i = 0; i < this.sync.task_lists.length; i++) {
                let r = this.sync.task_lists[i];
                if (this.name === r.title) {
                    list = r;
                    break;
                }
            }
            if (!list) {
                list = yield this.createTaskList(this.name, abort);
                // TODO assert the tick
                console.log(`Creating tasklist '${this.name}'`);
            }
            this.list = list;
            return this.states.add('ListReady');
        });
    }
    ;
    // TODO extract tasks fetching logic, reuse
    FetchingTasks_state() {
        return __awaiter(this, void 0, void 0, function* () {
            let abort = this.states.getAbort('FetchingTasks');
            let previous_ids = this.getAllTasks().map(task => task.id);
            // fetch all non-completed and max 2-weeks old completed ones
            // TODO use moment module to date operations
            if (!this.tasks_completed_from || this.tasks_completed_from < ago_1.default(3, "weeks")) {
                this.tasks_completed_from = ago_1.default(2, "weeks");
            }
            yield this.fetchNonCompletedTasks(abort);
            if (__guardFunc__(abort, f => f())) {
                return;
            }
            if (!this.etags.tasks_completed || !this.states.is('TasksCached')) {
                yield this.fetchCompletedTasks(abort);
                if (__guardFunc__(abort, f1 => f1())) {
                    return;
                }
            }
            this.processTasksDeletion(previous_ids);
            return this.states.add('TasksFetched');
        });
    }
    ;
    processTasksDeletion(previous_ids) {
        let current_ids = this.getAllTasks().map(task => task.id);
        return (previous_ids.difference(current_ids)).forEach(id => {
            // time of completion is actually fake, but doesn't require a request
            return this.completions_tasks[id] = {
                completed: true,
                // TODO deleted flag
                time: moment(),
                thread_id: __guard__(this.completions_tasks[id], x => x.thread_id)
            };
        });
    }
    fetchNonCompletedTasks(abort) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield this.req(this.tasks_api.tasks.list, {
                tasklist: this.list.id,
                fields: "etag,items(id,title,notes,updated,etag,status)",
                maxResults: 1000,
                showCompleted: false,
                etag: this.etags.tasks
            });
            if (response[1].statusCode === 304) {
                this.states.add('TasksCached');
                return console.log(`[CACHED] tasks for '${this.name}'`);
            }
            else {
                console.log(`[FETCH] tasks for '${this.name}'`);
                this.etags.tasks = response[1].headers.etag;
                if (response[0].items == null) {
                    response[0].items = [];
                }
                response[0].items.forEach(task => {
                    return this.completions_tasks[task.id] = {
                        completed: false,
                        time: moment(task.completed),
                        thread_id: this.taskLinkedToThread(task)
                    };
                });
                return this.tasks = type(response[0], ITasks, 'ITasks');
            }
        });
    }
    ;
    fetchCompletedTasks(update_min, abort) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield this.req(this.tasks_api.tasks.list, {
                updatedMin: internet_timestamp_1.default(new Date(this.tasks_completed_from)),
                tasklist: this.list.id,
                fields: "etag,items(id,title,notes,updated,etag,status,completed)",
                maxResults: 1000,
                showCompleted: true,
                etag: this.etags.tasks_completed
            });
            if (response[1].statusCode === 304) {
                return console.log(`[CACHED] completed tasks for '${this.name}'`);
            }
            else {
                console.log(`[FETCHED] completed tasks for '${this.name}'`);
                this.etags.tasks_completed = response[1].headers.etag;
                if (response[0].items == null) {
                    response[0].items = [];
                }
                response[0].items = response[0].items.filter(item => item.status === 'completed');
                response[0].items.forEach(task => {
                    return this.completions_tasks[task.id] = {
                        completed: true,
                        time: moment(task.completed),
                        thread_id: this.taskLinkedToThread(task)
                    };
                });
                return this.tasks_completed = type(response[0], ITasks, 'ITasks');
            }
        });
    }
    ;
    completeThread(id, abort) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Completing thread '${id}'`);
            yield this.gmail.modifyLabels(id, [], this.uncompletedThreadLabels(), abort);
            this.push_dirty = true;
            if (__guardFunc__(abort, f => f())) {
                return;
            }
            return this.query.completions[id] = { completed: true, time: moment() };
        });
    }
    ;
    uncompleteThread(id, abort) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Un-completing thread '${id}'`);
            yield this.gmail.modifyLabels(id, this.uncompletedThreadLabels(), [], abort);
            this.push_dirty = true;
            if (__guardFunc__(abort, f => f())) {
                return;
            }
            return this.query.completions[id] = { completed: false, time: moment() };
        });
    }
    ;
    createThreadForTask(task, abort) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.gmail.createThread(this.gmail.createEmail(task.title), this.uncompletedThreadLabels(), abort);
            return this.push_dirty = true;
        });
    }
    ;
    // returns thread ID
    taskLinkedToThread(task) {
        if (__guard__(task.notes, x => x.match(/\bemail:\w+\b/))) {
            return (__guard__(task.notes, x1 => x1.match(/\bemail:(\w+)\b/)))[1];
        }
    }
    linkTaskToThread(task, thread_id, abort) {
        return __awaiter(this, void 0, void 0, function* () {
            if (task.notes == null) {
                task.notes = "";
            }
            task.notes = `${task.notes}\nemail:${thread_id}`;
            yield this.req(this.tasks_api.tasks.patch, {
                tasklist: this.list.id,
                task: task.id,
                resource: { notes: task.notes
                } });
            this.completions_tasks[task.id].thread_id = thread_id;
            return this.push_dirty = true;
        });
    }
    ;
    // TODO update the DB
    //return if abort?()
    uncompletedThreadLabels() {
        return [].concat(this.data['labels_new_task'] || [], __guard__(__guard__(this.sync.config.tasks.queries, x1 => x1.labels_defaults), x => x['labels_new_task']) || []);
    }
    uncompleteTask(task_id, abort) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Un-completing task ${task_id}`);
            let res = yield this.req(this.tasks_api.tasks.patch, {
                tasklist: this.list.id,
                task: task_id,
                resource: {
                    status: 'needsAction',
                    completed: null
                }
            });
            this.push_dirty = true;
            if (__guardFunc__(abort, f => f())) {
                return;
            }
            // TODO update the task in the db
            return this.completions_tasks[task_id] = {
                completed: false,
                time: moment(),
                thread_id: __guard__(this.completions_tasks[task_id], x => x.thread_id)
            };
        });
    }
    ;
    completeTask(task_id, abort) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Completing task ${task_id}`);
            yield this.req(this.tasks_api.tasks.patch, {
                tasklist: this.list.id,
                task: task_id,
                resource: {
                    status: 'completed'
                }
            });
            this.push_dirty = true;
            if (__guardFunc__(abort, f => f())) {
                return;
            }
            // TODO update the task in the db
            return this.completions_tasks[task_id] = {
                completed: true,
                time: moment(),
                thread_id: __guard__(this.completions_tasks[task_id], x => x.thread_id)
            };
        });
    }
    ;
    getAllTasks() {
        if (!__guard__(this.tasks, x => x.items)) {
            return [];
        }
        return this.tasks.items.concat(__guard__(this.tasks_completed, x1 => x1.items) || []);
    }
    fetchThreadForTask(task, abort) {
        return __awaiter(this, void 0, void 0, function* () {
            let thread_id = (__guard__(task.notes, x => x.match(/\bemail:(\w+)\b/)))[1];
            return yield this.fetchThread(thread_id, null, abort);
        });
    }
    ;
    req(method, params) {
        return __awaiter(this, arguments, void 0, function* () {
            try {
                return yield this.sync.req.apply(this.sync, arguments);
            }
            catch (err) {
                // catch quote exceeded exceptions only
                if ((err.code != null) !== 403) {
                    throw err;
                }
                this.quota_exceeded = true;
                // wait 0.5sec
                setTimeout((this.emit.bind(this, 'retry-requests')), 500);
                while (this.quota_exceeded) {
                    yield new Promise(resolve => {
                        return this.once('retry-requests', resolve);
                    });
                }
                return yield this.req(method, params);
            }
        });
    }
    // TODO abort
    syncTaskName(task, thread) {
        return __awaiter(this, void 0, void 0, function* () {
            let title = this.getTaskTitleFromThread(thread);
            if (task.title !== title) {
                console.log(`Updating task title to \"${title}\"`);
                // TODO use etag
                let res = yield this.req(this.tasks_api.tasks.patch, {
                    tasklist: this.list.id,
                    task: task.id,
                    resource: {
                        title
                    }
                });
                task.title = title;
                return this.push_dirty = true;
            }
        });
    }
    createTaskList(name, abort) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield this.req(this.tasks_api.tasklists.insert, { resource: { title: name } });
            return res[1].body;
        });
    }
    createTaskFromThread(thread, abort) {
        return __awaiter(this, void 0, void 0, function* () {
            let title = this.getTaskTitleFromThread(thread);
            console.log(`Adding task '${title}'`);
            let res = yield this.req(this.tasks_api.tasks.insert, {
                tasklist: this.list.id,
                resource: {
                    title,
                    notes: `email:${thread.id}`
                }
            });
            this.push_dirty = true;
            if (__guardFunc__(abort, f => f())) {
                return;
            }
            // TODO update the db
            return res[0];
        });
    }
    createTask(task, abort) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Adding task '${task.title}'`);
            let res = yield this.req(this.tasks_api.tasks.insert, {
                tasklist: this.list.id,
                resource: task
            });
            this.push_dirty = true;
            if (__guardFunc__(abort, f => f())) {
                return;
            }
            // TODO update the db
            return type(res[0], ITask, 'ITask');
        });
    }
    getTask(task_id) {
        return this.getAllTasks().find(task => task.id === task_id);
    }
    getTaskForThread(thread_id) {
        return this.getAllTasks().find(task => __guard__(task.notes, x => x.match(`email:${thread_id}`)));
    }
    //		type task, ITask, 'ITask'
    getTaskTitleFromThread(thread) {
        let labels;
        type(thread, IThread, 'IThread');
        // TODO use the snippet when no title available
        let title = this.gmail.getTitleFromThread(thread) || '[notitle]';
        // TODO clenup
        //		return title if not @sync.config.def_title
        //		console.dir thread.messages
        //		console.dir thread.messages[0].payload.headers
        [title, labels] = this.getLabelsFromTitle(title);
        // TODO add labels from the thread
        // remove labels defining this query list
        for (let i = 0; i < this.data.labels_new_task.length; i++) {
            let label = this.data.labels_new_task[i];
            labels = labels.without(label);
        }
        // encode auto labels again, for readability
        if (this.sync.config.tasks.labels_in_title === 1) {
            return labels.concat(title).join(' ');
        }
        else {
            return [title].concat(labels).join(' ');
        }
    }
    /*
  TODO move to the gmail class
    @name string
    @return [ string, Array<Label> ]
    */
    getLabelsFromTitle(title) {
        let labels = [];
        for (let i = 0; i < this.sync.config.auto_labels.length; i++) {
            let r = this.sync.config.auto_labels[i];
            let { symbol } = r;
            let { label } = r;
            let { prefix } = r;
            var name = r.shortcut ? r.shortcut : "\\w+";
            title = title.replace(`\b${symbol}(${name})\b`, '', name => labels.push(prefix + (label || name)));
        }
        title = title.trim();
        return [title, labels];
    }
    // this is a marvelous method's name...
    getTaskForThreadFromCompletions(thread_id) {
        for (let task_id in this.completions_tasks) {
            let completion = this.completions_tasks[task_id];
            if (completion.thread_id === thread_id) {
                return task_id;
            }
        }
    }
    taskWasCompleted(id) {
        if (__guard__(this.completions_tasks[id], x => x.completed) === true) {
            return this.completions_tasks[id].time;
        }
        else {
            return false;
        }
    }
    taskWasNotCompleted(id) {
        if (__guard__(this.completions_tasks[id], x => x.completed) === false) {
            return this.completions_tasks[id].time;
        }
        else {
            return false;
        }
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TaskListSync;
function __guardFunc__(func, transform) {
    return typeof func === 'function' ? transform(func) : undefined;
}
function __guard__(value, transform) {
    return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
