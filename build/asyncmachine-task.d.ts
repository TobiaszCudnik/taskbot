/// <reference path="../node_modules/asyncmachine/build/asyncmachine.d.ts" />
import asyncmachine = require('asyncmachine');
export declare class Task extends asyncmachine.AsyncMachine {
    constructor();
    public TaskIdle: {
        blocks: string[];
    };
    public TaskWaiting: {
        blocks: string[];
    };
    public TaskRunning: {
        blocks: string[];
    };
    public TaskCancelling: {
        blocks: string[];
    };
    public TaskStopping: {
        blocks: string[];
    };
    public TaskCancelling_enter(): boolean;
    public TaskStopping_enter(): boolean;
    public TaskRunning_exit(): boolean;
    public taskCancel(): boolean;
    public taskStop(): boolean;
}
