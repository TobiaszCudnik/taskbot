import asyncmachine from 'asyncmachine';



class States extends asyncmachine.AsyncMachine {


	Enabled = {};


	Syncing = {
		auto: true,
		requires: ['Enabled'],
		blocks: ['Synced', 'Restart']
	};
	Synced = {
		blocks: ['Syncing'],
		requires: ['CompletedTasksSynced', 'ThreadsToTasksSynced',
			'TasksToThreadsSynced', 'CompletedThreadsSynced']
	};


	Restart = {blocks: ['TasksFetched', 'CompletedTasksSynced', 'ThreadsToTasksSynced',
		'TasksToThreadsSynced', 'CompletedThreadsSynced', 'TasksCached']
};


	// list
	PreparingList = {
		auto: true,
		requires: ['Syncing'],
		blocks: ['ListReady']
	};
	ListReady = {blocks: ['PreparingList']};


	// tasks
	FetchingTasks = {
		auto: true,
		requires: ['Syncing', 'ListReady'],
		blocks: ['TasksFetched']
	};
	TasksFetched = {requires: ['ListReady'], blocks: ['FetchingTasks']};
	TasksCached = {};


	// thread-to-tasks
	SyncingThreadsToTasks = {
		auto: true,
		requires: ['Syncing', 'TasksFetched', 'MsgsFetched'],
		blocks: ['ThreadsToTasksSynced']
	};
	ThreadsToTasksSynced = {blocks: ['SyncingThreadsToTasks']};


	// tasks-to-threads
	SyncingTasksToThreads = {
		auto: true,
		requires: ['Syncing', 'TasksFetched', 'ThreadsFetched'],
		blocks: ['TasksToThreadsSynced']
	};
	TasksToThreadsSynced ={blocks: ['SyncingTasksToThreads']};


	// complete threads
	SyncingCompletedThreads = {
		auto: true,
		requires: ['Syncing', 'TasksFetched', 'ThreadsFetched'],
		blocks: ['CompletedThreadsSynced']
	};
	CompletedThreadsSynced ={blocks: ['SyncingCompletedThreads']};


	// complete tasks
	SyncingCompletedTasks = {
		auto: true,
		requires: ['Syncing', 'TasksFetched', 'ThreadsFetched'],
		blocks: ['CompletedTasksSynced']
	};
	CompletedTasksSynced ={blocks: ['SyncingCompletedTasks']};


//	SyncingTaskNames: {}


	// ----- External States


	ThreadsFetched = {};


	MsgsFetched = {};
}



export default States;