///<reference path="../node_modules/asyncmachine/build/asyncmachine.d.ts"/>
import asyncmachine = require('asyncmachine');
export class Task extends asyncmachine.AsyncMachine {
    constructor() {
        super();

        this.register("TaskIdle", "TaskWaiting", "TaskRunning", "TaskCancelling", "TaskStopping");

        this.set("TaskIdle");
    }

    TaskIdle = {
        blocks: ["TaskRunning"]
    };

    TaskWaiting = {
        blocks: ["Running"]
    };

    TaskRunning = {
        blocks: ["TaskIdle", "TaskWaiting"]
    };

    TaskCancelling = {
        blocks: ["TaskWaiting"]
    };

    TaskStopping = {
        blocks: ["TaskRunning"]
    };

    TaskCancelling_enter() {
        this.add("TaskIdle");
        return this.drop("TaskCancelling");
    }

    TaskStopping_enter() {
        this.add("TaskIdle");
        return this.drop("TaskStopping");
    }

    TaskRunning_exit() {
        return this.add("TaskIdle");
    }

    taskCancel() {
        return this.add("TaskCancelling");
    }

    taskStop() {
        return this.add("TaskStopping");
    }
}
