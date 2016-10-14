import AsyncMachine, {
	IState
} from 'asyncmachine';


class States extends AsyncMachine {

	Enabled: IState = {};

	Syncing: IState = {
		auto: true,
		require: ['Enabled'],
		drop: ['Synced', 'Restart']
	};
	Synced: IState = {
		drop: ['Syncing'],
		require: ['CompletedTasksSynced', 'ThreadsToTasksSynced',
			'TasksToThreadsSynced', 'CompletedThreadsSynced']
	};

	Restart: IState = {
		drop: ['TasksFetched', 'CompletedTasksSynced', 'ThreadsToTasksSynced',
			'TasksToThreadsSynced', 'CompletedThreadsSynced', 'TasksCached']
	};

	// list
	PreparingList: IState = {
		auto: true,
		require: ['Syncing'],
		drop: ['ListReady']
	};
	ListReady: IState = {
		drop: ['PreparingList']
	};

	// tasks
	FetchingTasks: IState = {
		auto: true,
		require: ['Syncing', 'ListReady'],
		drop: ['TasksFetched']
	};
	TasksFetched: IState = {
		require: ['ListReady'], 
		drop: ['FetchingTasks']
	};
	TasksCached: IState = {};

	// thread-to-tasks
	SyncingThreadsToTasks: IState = {
		auto: true,
		require: ['Syncing', 'TasksFetched', 'MsgsFetched'],
		drop: ['ThreadsToTasksSynced']
	};
	ThreadsToTasksSynced: IState = {
		drop: ['SyncingThreadsToTasks']
	};

	// tasks-to-threads
	SyncingTasksToThreads: IState = {
		auto: true,
		require: ['Syncing', 'TasksFetched', 'ThreadsFetched'],
		drop: ['TasksToThreadsSynced']
	};
	TasksToThreadsSynced: IState = {
		drop: ['SyncingTasksToThreads']
	};

	// complete threads
	SyncingCompletedThreads: IState = {
		auto: true,
		require: ['Syncing', 'TasksFetched', 'ThreadsFetched'],
		drop: ['CompletedThreadsSynced']
	};
	CompletedThreadsSynced: IState = {
		drop: ['SyncingCompletedThreads']
	};

	// complete tasks
	SyncingCompletedTasks: IState = {
		auto: true,
		require: ['Syncing', 'TasksFetched', 'ThreadsFetched'],
		drop: ['CompletedTasksSynced']
	};
	CompletedTasksSynced: IState = {
		drop: ['SyncingCompletedTasks']
	};

//	SyncingTaskNames: {}

	// ----- External States

	ThreadsFetched: IState = {};

	MsgsFetched: IState = {};
}


export default States;