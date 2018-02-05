import { IState, IBind, IEmit, TStates } from './sync-list-states-types'
import { SyncState } from '../../sync/sync'

export default class State extends SyncState {

  Cached: IState = {}

  // Syncing: IState = {
  //   auto: true,
  //   require: ['Enabled'],
  //   drop: ['Synced', 'Restart']
  // }
  // Synced: IState = {
  //   drop: ['Syncing'],
  //   require: [
  //     'CompletedTasksSynced',
  //     'ThreadsToTasksSynced',
  //     'TasksToThreadsSynced',
  //     'CompletedThreadsSynced'
  //   ]
  // }

  // Restart: IState = {
  //   drop: [
  //     'TasksFetched',
  //     'CompletedTasksSynced',
  //     'ThreadsToTasksSynced',
  //     'TasksToThreadsSynced',
  //     'CompletedThreadsSynced',
  //     'TasksCached'
  //   ]
  // }

  // // thread-to-tasks
  // SyncingThreadsToTasks: IState = {
  //   auto: true,
  //   require: ['Syncing', 'TasksFetched', 'MsgsFetched'],
  //   drop: ['ThreadsToTasksSynced']
  // }
  // ThreadsToTasksSynced: IState = {
  //   drop: ['SyncingThreadsToTasks']
  // }
  //
  // // tasks-to-threads
  // SyncingTasksToThreads: IState = {
  //   auto: true,
  //   require: ['Syncing', 'TasksFetched', 'ThreadsFetched'],
  //   drop: ['TasksToThreadsSynced']
  // }
  // TasksToThreadsSynced: IState = {
  //   drop: ['SyncingTasksToThreads']
  // }
  //
  // // complete threads
  // SyncingCompletedThreads: IState = {
  //   auto: true,
  //   require: ['Syncing', 'TasksFetched', 'ThreadsFetched'],
  //   drop: ['CompletedThreadsSynced']
  // }
  // CompletedThreadsSynced: IState = {
  //   drop: ['SyncingCompletedThreads']
  // }
  //
  // // complete tasks
  // SyncingCompletedTasks: IState = {
  //   auto: true,
  //   require: ['Syncing', 'TasksFetched', 'ThreadsFetched'],
  //   drop: ['CompletedTasksSynced']
  // }
  // CompletedTasksSynced: IState = {
  //   drop: ['SyncingCompletedTasks']
  // }

  //	SyncingTaskNames: {}

  // ----- External States

  // ThreadsFetched: IState = {}
  //
  // MsgsFetched: IState = {}

  constructor(target) {
    super(target)
    this.registerAll()
  }
}
