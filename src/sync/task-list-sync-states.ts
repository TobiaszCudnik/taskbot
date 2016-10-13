import AsyncMachine, {
	IState
} from 'asyncmachine';


class States extends AsyncMachine {

	Enabled: IState = {};

	Syncing: IState = {
		auto: true,
		requires: ['Enabled'],
		blocks: ['Synced', 'Restart']
	};
	Synced: IState = {
		blocks: ['Syncing'],
		requires: ['CompletedTasksSynced', 'ThreadsToTasksSynced',
			'TasksToThreadsSynced', 'CompletedThreadsSynced']
	};

	Restart: IState = {
		blocks: ['TasksFetched', 'CompletedTasksSynced', 'ThreadsToTasksSynced',
			'TasksToThreadsSynced', 'CompletedThreadsSynced', 'TasksCached']
	};

	// list
	PreparingList: IState = {
		auto: true,
		requires: ['Syncing'],
		blocks: ['ListReady']
	};
	ListReady: IState = {
		blocks: ['PreparingList']
	};

	// tasks
	FetchingTasks: IState = {
		auto: true,
		requires: ['Syncing', 'ListReady'],
		blocks: ['TasksFetched']
	};
	TasksFetched: IState = {
		requires: ['ListReady'], 
		blocks: ['FetchingTasks']
	};
	TasksCached: IState = {};

	// thread-to-tasks
	SyncingThreadsToTasks: IState = {
		auto: true,
		requires: ['Syncing', 'TasksFetched', 'MsgsFetched'],
		blocks: ['ThreadsToTasksSynced']
	};
	ThreadsToTasksSynced: IState = {
		blocks: ['SyncingThreadsToTasks']
	};

	// tasks-to-threads
	SyncingTasksToThreads: IState = {
		auto: true,
		requires: ['Syncing', 'TasksFetched', 'ThreadsFetched'],
		blocks: ['TasksToThreadsSynced']
	};
	TasksToThreadsSynced: IState = {
		blocks: ['SyncingTasksToThreads']
	};

	// complete threads
	SyncingCompletedThreads: IState = {
		auto: true,
		requires: ['Syncing', 'TasksFetched', 'ThreadsFetched'],
		blocks: ['CompletedThreadsSynced']
	};
	CompletedThreadsSynced: IState = {
		blocks: ['SyncingCompletedThreads']
	};

	// complete tasks
	SyncingCompletedTasks: IState = {
		auto: true,
		requires: ['Syncing', 'TasksFetched', 'ThreadsFetched'],
		blocks: ['CompletedTasksSynced']
	};
	CompletedTasksSynced: IState = {
		blocks: ['SyncingCompletedTasks']
	};

//	SyncingTaskNames: {}

	// ----- External States

	ThreadsFetched: IState = {};

	MsgsFetched: IState = {};
}


export default States;