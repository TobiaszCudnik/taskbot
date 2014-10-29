var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="../../node_modules/asyncmachine/lib/asyncmachine.d.ts"/>
///<reference path="../../d.ts/global.d.ts" />
var asyncmachine = require('asyncmachine');
var Task = (function (_super) {
    __extends(Task, _super);
    function Task() {
        _super.call(this);
        this.TaskIdle = {
            blocks: ["TaskRunning"]
        };
        this.TaskWaiting = {
            blocks: ["Running"]
        };
        this.TaskRunning = {
            blocks: ["TaskIdle", "TaskWaiting"]
        };
        this.TaskCancelling = {
            blocks: ["TaskWaiting"]
        };
        this.TaskStopping = {
            blocks: ["TaskRunning"]
        };

        this.register("TaskIdle", "TaskWaiting", "TaskRunning", "TaskCancelling", "TaskStopping");

        this.set("TaskIdle");
    }
    Task.prototype.TaskCancelling_enter = function () {
        this.add("TaskIdle");
        return this.drop("TaskCancelling");
    };

    Task.prototype.TaskStopping_enter = function () {
        this.add("TaskIdle");
        return this.drop("TaskStopping");
    };

    Task.prototype.TaskRunning_exit = function () {
        return this.add("TaskIdle");
    };

    Task.prototype.taskCancel = function () {
        return this.add("TaskCancelling");
    };

    Task.prototype.taskStop = function () {
        return this.add("TaskStopping");
    };
    return Task;
})(asyncmachine.AsyncMachine);
exports.Task = Task;
//# sourceMappingURL=asyncmachine-task.js.map
