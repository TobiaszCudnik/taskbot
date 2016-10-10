"use strict";
const asyncmachine_1 = require('asyncmachine');
class States extends asyncmachine_1.default.AsyncMachine {
    constructor() {
        super(...arguments);
        this.Enabled = {};
        this.Syncing = {
            auto: true,
            requires: ['Enabled'],
            blocks: ['Synced', 'Restart']
        };
        this.Synced = {
            blocks: ['Syncing'],
            requires: ['CompletedTasksSynced', 'ThreadsToTasksSynced',
                'TasksToThreadsSynced', 'CompletedThreadsSynced']
        };
        this.Restart = { blocks: ['TasksFetched', 'CompletedTasksSynced', 'ThreadsToTasksSynced',
                'TasksToThreadsSynced', 'CompletedThreadsSynced', 'TasksCached']
        };
        // list
        this.PreparingList = {
            auto: true,
            requires: ['Syncing'],
            blocks: ['ListReady']
        };
        this.ListReady = { blocks: ['PreparingList'] };
        // tasks
        this.FetchingTasks = {
            auto: true,
            requires: ['Syncing', 'ListReady'],
            blocks: ['TasksFetched']
        };
        this.TasksFetched = { requires: ['ListReady'], blocks: ['FetchingTasks'] };
        this.TasksCached = {};
        // thread-to-tasks
        this.SyncingThreadsToTasks = {
            auto: true,
            requires: ['Syncing', 'TasksFetched', 'MsgsFetched'],
            blocks: ['ThreadsToTasksSynced']
        };
        this.ThreadsToTasksSynced = { blocks: ['SyncingThreadsToTasks'] };
        // tasks-to-threads
        this.SyncingTasksToThreads = {
            auto: true,
            requires: ['Syncing', 'TasksFetched', 'ThreadsFetched'],
            blocks: ['TasksToThreadsSynced']
        };
        this.TasksToThreadsSynced = { blocks: ['SyncingTasksToThreads'] };
        // complete threads
        this.SyncingCompletedThreads = {
            auto: true,
            requires: ['Syncing', 'TasksFetched', 'ThreadsFetched'],
            blocks: ['CompletedThreadsSynced']
        };
        this.CompletedThreadsSynced = { blocks: ['SyncingCompletedThreads'] };
        // complete tasks
        this.SyncingCompletedTasks = {
            auto: true,
            requires: ['Syncing', 'TasksFetched', 'ThreadsFetched'],
            blocks: ['CompletedTasksSynced']
        };
        this.CompletedTasksSynced = { blocks: ['SyncingCompletedTasks'] };
        //	SyncingTaskNames: {}
        // ----- External States
        this.ThreadsFetched = {};
        this.MsgsFetched = {};
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = States;
