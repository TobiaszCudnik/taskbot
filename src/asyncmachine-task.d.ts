///<reference path="../d.ts/global.d.ts" />
///<reference path="../node_modules/asyncmachine/lib/asyncmachine.d.ts"/>

export class Task extends asyncmachine.AsyncMachine {

//	TaskIdle:
//	TaskWaiting:
//	TaskRunning: 
//	TaskCancelling:
//	TaskStopping:
//
	TaskCancelling_enter();

	TaskStopping_enter();

	TaskRunning_exit();

	taskCancel();

	taskStop();
}
