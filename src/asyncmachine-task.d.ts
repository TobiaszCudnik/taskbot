///<reference path="../node_modules/asyncmachine/build/asyncmachine.d.ts"/>

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
