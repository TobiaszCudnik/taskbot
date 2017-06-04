import { IState as IStateBase } from 'asyncmachine/src/types'

/**
 * Signatures for EventEmitter to bind to transitions.
 */
export interface IBind {
  // Enabled
  (event: 'Enabled_enter', listener: () =>
    | boolean
    | undefined /* param1, param2 */, context?: Object): this
  (event: 'Enabled_state', listener: () => any /* param1, param2 */, context?: Object): this
  // Syncing
  (event: 'Syncing_enter', listener: () =>
    | boolean
    | undefined /* param1, param2 */, context?: Object): this
  (event: 'Syncing_state', listener: () => any /* param1, param2 */, context?: Object): this
  // Synced
  (event: 'Synced_enter', listener: () =>
    | boolean
    | undefined /* param1, param2 */, context?: Object): this
  (event: 'Synced_state', listener: () => any /* param1, param2 */, context?: Object): this
  // Restart
  (event: 'Restart_enter', listener: () =>
    | boolean
    | undefined /* param1, param2 */, context?: Object): this
  (event: 'Restart_state', listener: () => any /* param1, param2 */, context?: Object): this
  // PreparingList
  (event: 'PreparingList_enter', listener: () =>
    | boolean
    | undefined /* param1, param2 */, context?: Object): this
  (event: 'PreparingList_state', listener: () => any /* param1, param2 */, context?: Object): this
  // ListReady
  (event: 'ListReady_enter', listener: () =>
    | boolean
    | undefined /* param1, param2 */, context?: Object): this
  (event: 'ListReady_state', listener: () => any /* param1, param2 */, context?: Object): this
  // FetchingTasks
  (event: 'FetchingTasks_enter', listener: () =>
    | boolean
    | undefined /* param1, param2 */, context?: Object): this
  (event: 'FetchingTasks_state', listener: () => any /* param1, param2 */, context?: Object): this
  // TasksFetched
  (event: 'TasksFetched_enter', listener: () =>
    | boolean
    | undefined /* param1, param2 */, context?: Object): this
  (event: 'TasksFetched_state', listener: () => any /* param1, param2 */, context?: Object): this
  // TasksCached
  (event: 'TasksCached_enter', listener: () =>
    | boolean
    | undefined /* param1, param2 */, context?: Object): this
  (event: 'TasksCached_state', listener: () => any /* param1, param2 */, context?: Object): this
  // SyncingThreadsToTasks
  (event: 'SyncingThreadsToTasks_enter', listener: () =>
    | boolean
    | undefined /* param1, param2 */, context?: Object): this
  (event: 'SyncingThreadsToTasks_state', listener: () => any /* param1, param2 */, context?: Object): this
  // ThreadsToTasksSynced
  (event: 'ThreadsToTasksSynced_enter', listener: () =>
    | boolean
    | undefined /* param1, param2 */, context?: Object): this
  (event: 'ThreadsToTasksSynced_state', listener: () => any /* param1, param2 */, context?: Object): this
  // SyncingTasksToThreads
  (event: 'SyncingTasksToThreads_enter', listener: () =>
    | boolean
    | undefined /* param1, param2 */, context?: Object): this
  (event: 'SyncingTasksToThreads_state', listener: () => any /* param1, param2 */, context?: Object): this
  // TasksToThreadsSynced
  (event: 'TasksToThreadsSynced_enter', listener: () =>
    | boolean
    | undefined /* param1, param2 */, context?: Object): this
  (event: 'TasksToThreadsSynced_state', listener: () => any /* param1, param2 */, context?: Object): this
  // SyncingCompletedThreads
  (event: 'SyncingCompletedThreads_enter', listener: () =>
    | boolean
    | undefined /* param1, param2 */, context?: Object): this
  (event: 'SyncingCompletedThreads_state', listener: () => any /* param1, param2 */, context?: Object): this
  // CompletedThreadsSynced
  (event: 'CompletedThreadsSynced_enter', listener: () =>
    | boolean
    | undefined /* param1, param2 */, context?: Object): this
  (event: 'CompletedThreadsSynced_state', listener: () => any /* param1, param2 */, context?: Object): this
  // SyncingCompletedTasks
  (event: 'SyncingCompletedTasks_enter', listener: () =>
    | boolean
    | undefined /* param1, param2 */, context?: Object): this
  (event: 'SyncingCompletedTasks_state', listener: () => any /* param1, param2 */, context?: Object): this
  // CompletedTasksSynced
  (event: 'CompletedTasksSynced_enter', listener: () =>
    | boolean
    | undefined /* param1, param2 */, context?: Object): this
  (event: 'CompletedTasksSynced_state', listener: () => any /* param1, param2 */, context?: Object): this
  // ThreadsFetched
  (event: 'ThreadsFetched_enter', listener: () =>
    | boolean
    | undefined /* param1, param2 */, context?: Object): this
  (event: 'ThreadsFetched_state', listener: () => any /* param1, param2 */, context?: Object): this
  // MsgsFetched
  (event: 'MsgsFetched_enter', listener: () =>
    | boolean
    | undefined /* param1, param2 */, context?: Object): this
  (event: 'MsgsFetched_state', listener: () => any /* param1, param2 */, context?: Object): this
}

/**
 * Signatures for EventEmitter to emit transitions.
 */
export interface IEmit {
  // Enabled
  (event: 'Enabled_enter' /*, param1, param2 */): boolean | void
  (event: 'Enabled_state' /*, param1, param2 */): boolean | void
  // Syncing
  (event: 'Syncing_enter' /*, param1, param2 */): boolean | void
  (event: 'Syncing_state' /*, param1, param2 */): boolean | void
  // Synced
  (event: 'Synced_enter' /*, param1, param2 */): boolean | void
  (event: 'Synced_state' /*, param1, param2 */): boolean | void
  // Restart
  (event: 'Restart_enter' /*, param1, param2 */): boolean | void
  (event: 'Restart_state' /*, param1, param2 */): boolean | void
  // PreparingList
  (event: 'PreparingList_enter' /*, param1, param2 */): boolean | void
  (event: 'PreparingList_state' /*, param1, param2 */): boolean | void
  // ListReady
  (event: 'ListReady_enter' /*, param1, param2 */): boolean | void
  (event: 'ListReady_state' /*, param1, param2 */): boolean | void
  // FetchingTasks
  (event: 'FetchingTasks_enter' /*, param1, param2 */): boolean | void
  (event: 'FetchingTasks_state' /*, param1, param2 */): boolean | void
  // TasksFetched
  (event: 'TasksFetched_enter' /*, param1, param2 */): boolean | void
  (event: 'TasksFetched_state' /*, param1, param2 */): boolean | void
  // TasksCached
  (event: 'TasksCached_enter' /*, param1, param2 */): boolean | void
  (event: 'TasksCached_state' /*, param1, param2 */): boolean | void
  // SyncingThreadsToTasks
  (event: 'SyncingThreadsToTasks_enter' /*, param1, param2 */): boolean | void
  (event: 'SyncingThreadsToTasks_state' /*, param1, param2 */): boolean | void
  // ThreadsToTasksSynced
  (event: 'ThreadsToTasksSynced_enter' /*, param1, param2 */): boolean | void
  (event: 'ThreadsToTasksSynced_state' /*, param1, param2 */): boolean | void
  // SyncingTasksToThreads
  (event: 'SyncingTasksToThreads_enter' /*, param1, param2 */): boolean | void
  (event: 'SyncingTasksToThreads_state' /*, param1, param2 */): boolean | void
  // TasksToThreadsSynced
  (event: 'TasksToThreadsSynced_enter' /*, param1, param2 */): boolean | void
  (event: 'TasksToThreadsSynced_state' /*, param1, param2 */): boolean | void
  // SyncingCompletedThreads
  (event: 'SyncingCompletedThreads_enter' /*, param1, param2 */): boolean | void
  (event: 'SyncingCompletedThreads_state' /*, param1, param2 */): boolean | void
  // CompletedThreadsSynced
  (event: 'CompletedThreadsSynced_enter' /*, param1, param2 */): boolean | void
  (event: 'CompletedThreadsSynced_state' /*, param1, param2 */): boolean | void
  // SyncingCompletedTasks
  (event: 'SyncingCompletedTasks_enter' /*, param1, param2 */): boolean | void
  (event: 'SyncingCompletedTasks_state' /*, param1, param2 */): boolean | void
  // CompletedTasksSynced
  (event: 'CompletedTasksSynced_enter' /*, param1, param2 */): boolean | void
  (event: 'CompletedTasksSynced_state' /*, param1, param2 */): boolean | void
  // ThreadsFetched
  (event: 'ThreadsFetched_enter' /*, param1, param2 */): boolean | void
  (event: 'ThreadsFetched_state' /*, param1, param2 */): boolean | void
  // MsgsFetched
  (event: 'MsgsFetched_enter' /*, param1, param2 */): boolean | void
  (event: 'MsgsFetched_state' /*, param1, param2 */): boolean | void
}

/**
 * All the possible transition methods machine can define.
 */
export interface ITransitions {
  // Enabled
  Enabled_enter /*param1, param2 */?(): boolean | void
  Enabled_state /*param1, param2 */?(): boolean | void | Promise
  // Syncing
  Syncing_enter /*param1, param2 */?(): boolean | void
  Syncing_state /*param1, param2 */?(): boolean | void | Promise
  // Synced
  Synced_enter /*param1, param2 */?(): boolean | void
  Synced_state /*param1, param2 */?(): boolean | void | Promise
  // Restart
  Restart_enter /*param1, param2 */?(): boolean | void
  Restart_state /*param1, param2 */?(): boolean | void | Promise
  // PreparingList
  PreparingList_enter /*param1, param2 */?(): boolean | void
  PreparingList_state /*param1, param2 */?(): boolean | void | Promise
  // ListReady
  ListReady_enter /*param1, param2 */?(): boolean | void
  ListReady_state /*param1, param2 */?(): boolean | void | Promise
  // FetchingTasks
  FetchingTasks_enter /*param1, param2 */?(): boolean | void
  FetchingTasks_state /*param1, param2 */?(): boolean | void | Promise
  // TasksFetched
  TasksFetched_enter /*param1, param2 */?(): boolean | void
  TasksFetched_state /*param1, param2 */?(): boolean | void | Promise
  // TasksCached
  TasksCached_enter /*param1, param2 */?(): boolean | void
  TasksCached_state /*param1, param2 */?(): boolean | void | Promise
  // SyncingThreadsToTasks
  SyncingThreadsToTasks_enter /*param1, param2 */?(): boolean | void
  SyncingThreadsToTasks_state /*param1, param2 */?(): boolean | void | Promise
  // ThreadsToTasksSynced
  ThreadsToTasksSynced_enter /*param1, param2 */?(): boolean | void
  ThreadsToTasksSynced_state /*param1, param2 */?(): boolean | void | Promise
  // SyncingTasksToThreads
  SyncingTasksToThreads_enter /*param1, param2 */?(): boolean | void
  SyncingTasksToThreads_state /*param1, param2 */?(): boolean | void | Promise
  // TasksToThreadsSynced
  TasksToThreadsSynced_enter /*param1, param2 */?(): boolean | void
  TasksToThreadsSynced_state /*param1, param2 */?(): boolean | void | Promise
  // SyncingCompletedThreads
  SyncingCompletedThreads_enter /*param1, param2 */?(): boolean | void
  SyncingCompletedThreads_state /*param1, param2 */?(): boolean | void | Promise
  // CompletedThreadsSynced
  CompletedThreadsSynced_enter /*param1, param2 */?(): boolean | void
  CompletedThreadsSynced_state /*param1, param2 */?(): boolean | void | Promise
  // SyncingCompletedTasks
  SyncingCompletedTasks_enter /*param1, param2 */?(): boolean | void
  SyncingCompletedTasks_state /*param1, param2 */?(): boolean | void | Promise
  // CompletedTasksSynced
  CompletedTasksSynced_enter /*param1, param2 */?(): boolean | void
  CompletedTasksSynced_state /*param1, param2 */?(): boolean | void | Promise
  // ThreadsFetched
  ThreadsFetched_enter /*param1, param2 */?(): boolean | void
  ThreadsFetched_state /*param1, param2 */?(): boolean | void | Promise
  // MsgsFetched
  MsgsFetched_enter /*param1, param2 */?(): boolean | void
  MsgsFetched_state /*param1, param2 */?(): boolean | void | Promise

  Enabled_exit?(): boolean | void
  Enabled_end?(): boolean | void | Promise
  Syncing_exit?(): boolean | void
  Syncing_end?(): boolean | void | Promise
  Synced_exit?(): boolean | void
  Synced_end?(): boolean | void | Promise
  Restart_exit?(): boolean | void
  Restart_end?(): boolean | void | Promise
  PreparingList_exit?(): boolean | void
  PreparingList_end?(): boolean | void | Promise
  ListReady_exit?(): boolean | void
  ListReady_end?(): boolean | void | Promise
  FetchingTasks_exit?(): boolean | void
  FetchingTasks_end?(): boolean | void | Promise
  TasksFetched_exit?(): boolean | void
  TasksFetched_end?(): boolean | void | Promise
  TasksCached_exit?(): boolean | void
  TasksCached_end?(): boolean | void | Promise
  SyncingThreadsToTasks_exit?(): boolean | void
  SyncingThreadsToTasks_end?(): boolean | void | Promise
  ThreadsToTasksSynced_exit?(): boolean | void
  ThreadsToTasksSynced_end?(): boolean | void | Promise
  SyncingTasksToThreads_exit?(): boolean | void
  SyncingTasksToThreads_end?(): boolean | void | Promise
  TasksToThreadsSynced_exit?(): boolean | void
  TasksToThreadsSynced_end?(): boolean | void | Promise
  SyncingCompletedThreads_exit?(): boolean | void
  SyncingCompletedThreads_end?(): boolean | void | Promise
  CompletedThreadsSynced_exit?(): boolean | void
  CompletedThreadsSynced_end?(): boolean | void | Promise
  SyncingCompletedTasks_exit?(): boolean | void
  SyncingCompletedTasks_end?(): boolean | void | Promise
  CompletedTasksSynced_exit?(): boolean | void
  CompletedTasksSynced_end?(): boolean | void | Promise
  ThreadsFetched_exit?(): boolean | void
  ThreadsFetched_end?(): boolean | void | Promise
  MsgsFetched_exit?(): boolean | void
  MsgsFetched_end?(): boolean | void | Promise

  Exception_Enabled?(): boolean | void
  Exception_Syncing?(): boolean | void
  Exception_Synced?(): boolean | void
  Exception_Restart?(): boolean | void
  Exception_PreparingList?(): boolean | void
  Exception_ListReady?(): boolean | void
  Exception_FetchingTasks?(): boolean | void
  Exception_TasksFetched?(): boolean | void
  Exception_TasksCached?(): boolean | void
  Exception_SyncingThreadsToTasks?(): boolean | void
  Exception_ThreadsToTasksSynced?(): boolean | void
  Exception_SyncingTasksToThreads?(): boolean | void
  Exception_TasksToThreadsSynced?(): boolean | void
  Exception_SyncingCompletedThreads?(): boolean | void
  Exception_CompletedThreadsSynced?(): boolean | void
  Exception_SyncingCompletedTasks?(): boolean | void
  Exception_CompletedTasksSynced?(): boolean | void
  Exception_ThreadsFetched?(): boolean | void
  Exception_MsgsFetched?(): boolean | void
  Enabled_Exception?(): boolean | void
  Enabled_Any?(): boolean | void
  Enabled_Syncing?(): boolean | void
  Enabled_Synced?(): boolean | void
  Enabled_Restart?(): boolean | void
  Enabled_PreparingList?(): boolean | void
  Enabled_ListReady?(): boolean | void
  Enabled_FetchingTasks?(): boolean | void
  Enabled_TasksFetched?(): boolean | void
  Enabled_TasksCached?(): boolean | void
  Enabled_SyncingThreadsToTasks?(): boolean | void
  Enabled_ThreadsToTasksSynced?(): boolean | void
  Enabled_SyncingTasksToThreads?(): boolean | void
  Enabled_TasksToThreadsSynced?(): boolean | void
  Enabled_SyncingCompletedThreads?(): boolean | void
  Enabled_CompletedThreadsSynced?(): boolean | void
  Enabled_SyncingCompletedTasks?(): boolean | void
  Enabled_CompletedTasksSynced?(): boolean | void
  Enabled_ThreadsFetched?(): boolean | void
  Enabled_MsgsFetched?(): boolean | void
  Enabled_Exception?(): boolean | void
  Syncing_Exception?(): boolean | void
  Syncing_Enabled?(): boolean | void
  Syncing_Any?(): boolean | void
  Syncing_Synced?(): boolean | void
  Syncing_Restart?(): boolean | void
  Syncing_PreparingList?(): boolean | void
  Syncing_ListReady?(): boolean | void
  Syncing_FetchingTasks?(): boolean | void
  Syncing_TasksFetched?(): boolean | void
  Syncing_TasksCached?(): boolean | void
  Syncing_SyncingThreadsToTasks?(): boolean | void
  Syncing_ThreadsToTasksSynced?(): boolean | void
  Syncing_SyncingTasksToThreads?(): boolean | void
  Syncing_TasksToThreadsSynced?(): boolean | void
  Syncing_SyncingCompletedThreads?(): boolean | void
  Syncing_CompletedThreadsSynced?(): boolean | void
  Syncing_SyncingCompletedTasks?(): boolean | void
  Syncing_CompletedTasksSynced?(): boolean | void
  Syncing_ThreadsFetched?(): boolean | void
  Syncing_MsgsFetched?(): boolean | void
  Syncing_Exception?(): boolean | void
  Synced_Exception?(): boolean | void
  Synced_Enabled?(): boolean | void
  Synced_Syncing?(): boolean | void
  Synced_Any?(): boolean | void
  Synced_Restart?(): boolean | void
  Synced_PreparingList?(): boolean | void
  Synced_ListReady?(): boolean | void
  Synced_FetchingTasks?(): boolean | void
  Synced_TasksFetched?(): boolean | void
  Synced_TasksCached?(): boolean | void
  Synced_SyncingThreadsToTasks?(): boolean | void
  Synced_ThreadsToTasksSynced?(): boolean | void
  Synced_SyncingTasksToThreads?(): boolean | void
  Synced_TasksToThreadsSynced?(): boolean | void
  Synced_SyncingCompletedThreads?(): boolean | void
  Synced_CompletedThreadsSynced?(): boolean | void
  Synced_SyncingCompletedTasks?(): boolean | void
  Synced_CompletedTasksSynced?(): boolean | void
  Synced_ThreadsFetched?(): boolean | void
  Synced_MsgsFetched?(): boolean | void
  Synced_Exception?(): boolean | void
  Restart_Exception?(): boolean | void
  Restart_Enabled?(): boolean | void
  Restart_Syncing?(): boolean | void
  Restart_Synced?(): boolean | void
  Restart_Any?(): boolean | void
  Restart_PreparingList?(): boolean | void
  Restart_ListReady?(): boolean | void
  Restart_FetchingTasks?(): boolean | void
  Restart_TasksFetched?(): boolean | void
  Restart_TasksCached?(): boolean | void
  Restart_SyncingThreadsToTasks?(): boolean | void
  Restart_ThreadsToTasksSynced?(): boolean | void
  Restart_SyncingTasksToThreads?(): boolean | void
  Restart_TasksToThreadsSynced?(): boolean | void
  Restart_SyncingCompletedThreads?(): boolean | void
  Restart_CompletedThreadsSynced?(): boolean | void
  Restart_SyncingCompletedTasks?(): boolean | void
  Restart_CompletedTasksSynced?(): boolean | void
  Restart_ThreadsFetched?(): boolean | void
  Restart_MsgsFetched?(): boolean | void
  Restart_Exception?(): boolean | void
  PreparingList_Exception?(): boolean | void
  PreparingList_Enabled?(): boolean | void
  PreparingList_Syncing?(): boolean | void
  PreparingList_Synced?(): boolean | void
  PreparingList_Restart?(): boolean | void
  PreparingList_Any?(): boolean | void
  PreparingList_ListReady?(): boolean | void
  PreparingList_FetchingTasks?(): boolean | void
  PreparingList_TasksFetched?(): boolean | void
  PreparingList_TasksCached?(): boolean | void
  PreparingList_SyncingThreadsToTasks?(): boolean | void
  PreparingList_ThreadsToTasksSynced?(): boolean | void
  PreparingList_SyncingTasksToThreads?(): boolean | void
  PreparingList_TasksToThreadsSynced?(): boolean | void
  PreparingList_SyncingCompletedThreads?(): boolean | void
  PreparingList_CompletedThreadsSynced?(): boolean | void
  PreparingList_SyncingCompletedTasks?(): boolean | void
  PreparingList_CompletedTasksSynced?(): boolean | void
  PreparingList_ThreadsFetched?(): boolean | void
  PreparingList_MsgsFetched?(): boolean | void
  PreparingList_Exception?(): boolean | void
  ListReady_Exception?(): boolean | void
  ListReady_Enabled?(): boolean | void
  ListReady_Syncing?(): boolean | void
  ListReady_Synced?(): boolean | void
  ListReady_Restart?(): boolean | void
  ListReady_PreparingList?(): boolean | void
  ListReady_Any?(): boolean | void
  ListReady_FetchingTasks?(): boolean | void
  ListReady_TasksFetched?(): boolean | void
  ListReady_TasksCached?(): boolean | void
  ListReady_SyncingThreadsToTasks?(): boolean | void
  ListReady_ThreadsToTasksSynced?(): boolean | void
  ListReady_SyncingTasksToThreads?(): boolean | void
  ListReady_TasksToThreadsSynced?(): boolean | void
  ListReady_SyncingCompletedThreads?(): boolean | void
  ListReady_CompletedThreadsSynced?(): boolean | void
  ListReady_SyncingCompletedTasks?(): boolean | void
  ListReady_CompletedTasksSynced?(): boolean | void
  ListReady_ThreadsFetched?(): boolean | void
  ListReady_MsgsFetched?(): boolean | void
  ListReady_Exception?(): boolean | void
  FetchingTasks_Exception?(): boolean | void
  FetchingTasks_Enabled?(): boolean | void
  FetchingTasks_Syncing?(): boolean | void
  FetchingTasks_Synced?(): boolean | void
  FetchingTasks_Restart?(): boolean | void
  FetchingTasks_PreparingList?(): boolean | void
  FetchingTasks_ListReady?(): boolean | void
  FetchingTasks_Any?(): boolean | void
  FetchingTasks_TasksFetched?(): boolean | void
  FetchingTasks_TasksCached?(): boolean | void
  FetchingTasks_SyncingThreadsToTasks?(): boolean | void
  FetchingTasks_ThreadsToTasksSynced?(): boolean | void
  FetchingTasks_SyncingTasksToThreads?(): boolean | void
  FetchingTasks_TasksToThreadsSynced?(): boolean | void
  FetchingTasks_SyncingCompletedThreads?(): boolean | void
  FetchingTasks_CompletedThreadsSynced?(): boolean | void
  FetchingTasks_SyncingCompletedTasks?(): boolean | void
  FetchingTasks_CompletedTasksSynced?(): boolean | void
  FetchingTasks_ThreadsFetched?(): boolean | void
  FetchingTasks_MsgsFetched?(): boolean | void
  FetchingTasks_Exception?(): boolean | void
  TasksFetched_Exception?(): boolean | void
  TasksFetched_Enabled?(): boolean | void
  TasksFetched_Syncing?(): boolean | void
  TasksFetched_Synced?(): boolean | void
  TasksFetched_Restart?(): boolean | void
  TasksFetched_PreparingList?(): boolean | void
  TasksFetched_ListReady?(): boolean | void
  TasksFetched_FetchingTasks?(): boolean | void
  TasksFetched_Any?(): boolean | void
  TasksFetched_TasksCached?(): boolean | void
  TasksFetched_SyncingThreadsToTasks?(): boolean | void
  TasksFetched_ThreadsToTasksSynced?(): boolean | void
  TasksFetched_SyncingTasksToThreads?(): boolean | void
  TasksFetched_TasksToThreadsSynced?(): boolean | void
  TasksFetched_SyncingCompletedThreads?(): boolean | void
  TasksFetched_CompletedThreadsSynced?(): boolean | void
  TasksFetched_SyncingCompletedTasks?(): boolean | void
  TasksFetched_CompletedTasksSynced?(): boolean | void
  TasksFetched_ThreadsFetched?(): boolean | void
  TasksFetched_MsgsFetched?(): boolean | void
  TasksFetched_Exception?(): boolean | void
  TasksCached_Exception?(): boolean | void
  TasksCached_Enabled?(): boolean | void
  TasksCached_Syncing?(): boolean | void
  TasksCached_Synced?(): boolean | void
  TasksCached_Restart?(): boolean | void
  TasksCached_PreparingList?(): boolean | void
  TasksCached_ListReady?(): boolean | void
  TasksCached_FetchingTasks?(): boolean | void
  TasksCached_TasksFetched?(): boolean | void
  TasksCached_Any?(): boolean | void
  TasksCached_SyncingThreadsToTasks?(): boolean | void
  TasksCached_ThreadsToTasksSynced?(): boolean | void
  TasksCached_SyncingTasksToThreads?(): boolean | void
  TasksCached_TasksToThreadsSynced?(): boolean | void
  TasksCached_SyncingCompletedThreads?(): boolean | void
  TasksCached_CompletedThreadsSynced?(): boolean | void
  TasksCached_SyncingCompletedTasks?(): boolean | void
  TasksCached_CompletedTasksSynced?(): boolean | void
  TasksCached_ThreadsFetched?(): boolean | void
  TasksCached_MsgsFetched?(): boolean | void
  TasksCached_Exception?(): boolean | void
  SyncingThreadsToTasks_Exception?(): boolean | void
  SyncingThreadsToTasks_Enabled?(): boolean | void
  SyncingThreadsToTasks_Syncing?(): boolean | void
  SyncingThreadsToTasks_Synced?(): boolean | void
  SyncingThreadsToTasks_Restart?(): boolean | void
  SyncingThreadsToTasks_PreparingList?(): boolean | void
  SyncingThreadsToTasks_ListReady?(): boolean | void
  SyncingThreadsToTasks_FetchingTasks?(): boolean | void
  SyncingThreadsToTasks_TasksFetched?(): boolean | void
  SyncingThreadsToTasks_TasksCached?(): boolean | void
  SyncingThreadsToTasks_Any?(): boolean | void
  SyncingThreadsToTasks_ThreadsToTasksSynced?(): boolean | void
  SyncingThreadsToTasks_SyncingTasksToThreads?(): boolean | void
  SyncingThreadsToTasks_TasksToThreadsSynced?(): boolean | void
  SyncingThreadsToTasks_SyncingCompletedThreads?(): boolean | void
  SyncingThreadsToTasks_CompletedThreadsSynced?(): boolean | void
  SyncingThreadsToTasks_SyncingCompletedTasks?(): boolean | void
  SyncingThreadsToTasks_CompletedTasksSynced?(): boolean | void
  SyncingThreadsToTasks_ThreadsFetched?(): boolean | void
  SyncingThreadsToTasks_MsgsFetched?(): boolean | void
  SyncingThreadsToTasks_Exception?(): boolean | void
  ThreadsToTasksSynced_Exception?(): boolean | void
  ThreadsToTasksSynced_Enabled?(): boolean | void
  ThreadsToTasksSynced_Syncing?(): boolean | void
  ThreadsToTasksSynced_Synced?(): boolean | void
  ThreadsToTasksSynced_Restart?(): boolean | void
  ThreadsToTasksSynced_PreparingList?(): boolean | void
  ThreadsToTasksSynced_ListReady?(): boolean | void
  ThreadsToTasksSynced_FetchingTasks?(): boolean | void
  ThreadsToTasksSynced_TasksFetched?(): boolean | void
  ThreadsToTasksSynced_TasksCached?(): boolean | void
  ThreadsToTasksSynced_SyncingThreadsToTasks?(): boolean | void
  ThreadsToTasksSynced_Any?(): boolean | void
  ThreadsToTasksSynced_SyncingTasksToThreads?(): boolean | void
  ThreadsToTasksSynced_TasksToThreadsSynced?(): boolean | void
  ThreadsToTasksSynced_SyncingCompletedThreads?(): boolean | void
  ThreadsToTasksSynced_CompletedThreadsSynced?(): boolean | void
  ThreadsToTasksSynced_SyncingCompletedTasks?(): boolean | void
  ThreadsToTasksSynced_CompletedTasksSynced?(): boolean | void
  ThreadsToTasksSynced_ThreadsFetched?(): boolean | void
  ThreadsToTasksSynced_MsgsFetched?(): boolean | void
  ThreadsToTasksSynced_Exception?(): boolean | void
  SyncingTasksToThreads_Exception?(): boolean | void
  SyncingTasksToThreads_Enabled?(): boolean | void
  SyncingTasksToThreads_Syncing?(): boolean | void
  SyncingTasksToThreads_Synced?(): boolean | void
  SyncingTasksToThreads_Restart?(): boolean | void
  SyncingTasksToThreads_PreparingList?(): boolean | void
  SyncingTasksToThreads_ListReady?(): boolean | void
  SyncingTasksToThreads_FetchingTasks?(): boolean | void
  SyncingTasksToThreads_TasksFetched?(): boolean | void
  SyncingTasksToThreads_TasksCached?(): boolean | void
  SyncingTasksToThreads_SyncingThreadsToTasks?(): boolean | void
  SyncingTasksToThreads_ThreadsToTasksSynced?(): boolean | void
  SyncingTasksToThreads_Any?(): boolean | void
  SyncingTasksToThreads_TasksToThreadsSynced?(): boolean | void
  SyncingTasksToThreads_SyncingCompletedThreads?(): boolean | void
  SyncingTasksToThreads_CompletedThreadsSynced?(): boolean | void
  SyncingTasksToThreads_SyncingCompletedTasks?(): boolean | void
  SyncingTasksToThreads_CompletedTasksSynced?(): boolean | void
  SyncingTasksToThreads_ThreadsFetched?(): boolean | void
  SyncingTasksToThreads_MsgsFetched?(): boolean | void
  SyncingTasksToThreads_Exception?(): boolean | void
  TasksToThreadsSynced_Exception?(): boolean | void
  TasksToThreadsSynced_Enabled?(): boolean | void
  TasksToThreadsSynced_Syncing?(): boolean | void
  TasksToThreadsSynced_Synced?(): boolean | void
  TasksToThreadsSynced_Restart?(): boolean | void
  TasksToThreadsSynced_PreparingList?(): boolean | void
  TasksToThreadsSynced_ListReady?(): boolean | void
  TasksToThreadsSynced_FetchingTasks?(): boolean | void
  TasksToThreadsSynced_TasksFetched?(): boolean | void
  TasksToThreadsSynced_TasksCached?(): boolean | void
  TasksToThreadsSynced_SyncingThreadsToTasks?(): boolean | void
  TasksToThreadsSynced_ThreadsToTasksSynced?(): boolean | void
  TasksToThreadsSynced_SyncingTasksToThreads?(): boolean | void
  TasksToThreadsSynced_Any?(): boolean | void
  TasksToThreadsSynced_SyncingCompletedThreads?(): boolean | void
  TasksToThreadsSynced_CompletedThreadsSynced?(): boolean | void
  TasksToThreadsSynced_SyncingCompletedTasks?(): boolean | void
  TasksToThreadsSynced_CompletedTasksSynced?(): boolean | void
  TasksToThreadsSynced_ThreadsFetched?(): boolean | void
  TasksToThreadsSynced_MsgsFetched?(): boolean | void
  TasksToThreadsSynced_Exception?(): boolean | void
  SyncingCompletedThreads_Exception?(): boolean | void
  SyncingCompletedThreads_Enabled?(): boolean | void
  SyncingCompletedThreads_Syncing?(): boolean | void
  SyncingCompletedThreads_Synced?(): boolean | void
  SyncingCompletedThreads_Restart?(): boolean | void
  SyncingCompletedThreads_PreparingList?(): boolean | void
  SyncingCompletedThreads_ListReady?(): boolean | void
  SyncingCompletedThreads_FetchingTasks?(): boolean | void
  SyncingCompletedThreads_TasksFetched?(): boolean | void
  SyncingCompletedThreads_TasksCached?(): boolean | void
  SyncingCompletedThreads_SyncingThreadsToTasks?(): boolean | void
  SyncingCompletedThreads_ThreadsToTasksSynced?(): boolean | void
  SyncingCompletedThreads_SyncingTasksToThreads?(): boolean | void
  SyncingCompletedThreads_TasksToThreadsSynced?(): boolean | void
  SyncingCompletedThreads_Any?(): boolean | void
  SyncingCompletedThreads_CompletedThreadsSynced?(): boolean | void
  SyncingCompletedThreads_SyncingCompletedTasks?(): boolean | void
  SyncingCompletedThreads_CompletedTasksSynced?(): boolean | void
  SyncingCompletedThreads_ThreadsFetched?(): boolean | void
  SyncingCompletedThreads_MsgsFetched?(): boolean | void
  SyncingCompletedThreads_Exception?(): boolean | void
  CompletedThreadsSynced_Exception?(): boolean | void
  CompletedThreadsSynced_Enabled?(): boolean | void
  CompletedThreadsSynced_Syncing?(): boolean | void
  CompletedThreadsSynced_Synced?(): boolean | void
  CompletedThreadsSynced_Restart?(): boolean | void
  CompletedThreadsSynced_PreparingList?(): boolean | void
  CompletedThreadsSynced_ListReady?(): boolean | void
  CompletedThreadsSynced_FetchingTasks?(): boolean | void
  CompletedThreadsSynced_TasksFetched?(): boolean | void
  CompletedThreadsSynced_TasksCached?(): boolean | void
  CompletedThreadsSynced_SyncingThreadsToTasks?(): boolean | void
  CompletedThreadsSynced_ThreadsToTasksSynced?(): boolean | void
  CompletedThreadsSynced_SyncingTasksToThreads?(): boolean | void
  CompletedThreadsSynced_TasksToThreadsSynced?(): boolean | void
  CompletedThreadsSynced_SyncingCompletedThreads?(): boolean | void
  CompletedThreadsSynced_Any?(): boolean | void
  CompletedThreadsSynced_SyncingCompletedTasks?(): boolean | void
  CompletedThreadsSynced_CompletedTasksSynced?(): boolean | void
  CompletedThreadsSynced_ThreadsFetched?(): boolean | void
  CompletedThreadsSynced_MsgsFetched?(): boolean | void
  CompletedThreadsSynced_Exception?(): boolean | void
  SyncingCompletedTasks_Exception?(): boolean | void
  SyncingCompletedTasks_Enabled?(): boolean | void
  SyncingCompletedTasks_Syncing?(): boolean | void
  SyncingCompletedTasks_Synced?(): boolean | void
  SyncingCompletedTasks_Restart?(): boolean | void
  SyncingCompletedTasks_PreparingList?(): boolean | void
  SyncingCompletedTasks_ListReady?(): boolean | void
  SyncingCompletedTasks_FetchingTasks?(): boolean | void
  SyncingCompletedTasks_TasksFetched?(): boolean | void
  SyncingCompletedTasks_TasksCached?(): boolean | void
  SyncingCompletedTasks_SyncingThreadsToTasks?(): boolean | void
  SyncingCompletedTasks_ThreadsToTasksSynced?(): boolean | void
  SyncingCompletedTasks_SyncingTasksToThreads?(): boolean | void
  SyncingCompletedTasks_TasksToThreadsSynced?(): boolean | void
  SyncingCompletedTasks_SyncingCompletedThreads?(): boolean | void
  SyncingCompletedTasks_CompletedThreadsSynced?(): boolean | void
  SyncingCompletedTasks_Any?(): boolean | void
  SyncingCompletedTasks_CompletedTasksSynced?(): boolean | void
  SyncingCompletedTasks_ThreadsFetched?(): boolean | void
  SyncingCompletedTasks_MsgsFetched?(): boolean | void
  SyncingCompletedTasks_Exception?(): boolean | void
  CompletedTasksSynced_Exception?(): boolean | void
  CompletedTasksSynced_Enabled?(): boolean | void
  CompletedTasksSynced_Syncing?(): boolean | void
  CompletedTasksSynced_Synced?(): boolean | void
  CompletedTasksSynced_Restart?(): boolean | void
  CompletedTasksSynced_PreparingList?(): boolean | void
  CompletedTasksSynced_ListReady?(): boolean | void
  CompletedTasksSynced_FetchingTasks?(): boolean | void
  CompletedTasksSynced_TasksFetched?(): boolean | void
  CompletedTasksSynced_TasksCached?(): boolean | void
  CompletedTasksSynced_SyncingThreadsToTasks?(): boolean | void
  CompletedTasksSynced_ThreadsToTasksSynced?(): boolean | void
  CompletedTasksSynced_SyncingTasksToThreads?(): boolean | void
  CompletedTasksSynced_TasksToThreadsSynced?(): boolean | void
  CompletedTasksSynced_SyncingCompletedThreads?(): boolean | void
  CompletedTasksSynced_CompletedThreadsSynced?(): boolean | void
  CompletedTasksSynced_SyncingCompletedTasks?(): boolean | void
  CompletedTasksSynced_Any?(): boolean | void
  CompletedTasksSynced_ThreadsFetched?(): boolean | void
  CompletedTasksSynced_MsgsFetched?(): boolean | void
  CompletedTasksSynced_Exception?(): boolean | void
  ThreadsFetched_Exception?(): boolean | void
  ThreadsFetched_Enabled?(): boolean | void
  ThreadsFetched_Syncing?(): boolean | void
  ThreadsFetched_Synced?(): boolean | void
  ThreadsFetched_Restart?(): boolean | void
  ThreadsFetched_PreparingList?(): boolean | void
  ThreadsFetched_ListReady?(): boolean | void
  ThreadsFetched_FetchingTasks?(): boolean | void
  ThreadsFetched_TasksFetched?(): boolean | void
  ThreadsFetched_TasksCached?(): boolean | void
  ThreadsFetched_SyncingThreadsToTasks?(): boolean | void
  ThreadsFetched_ThreadsToTasksSynced?(): boolean | void
  ThreadsFetched_SyncingTasksToThreads?(): boolean | void
  ThreadsFetched_TasksToThreadsSynced?(): boolean | void
  ThreadsFetched_SyncingCompletedThreads?(): boolean | void
  ThreadsFetched_CompletedThreadsSynced?(): boolean | void
  ThreadsFetched_SyncingCompletedTasks?(): boolean | void
  ThreadsFetched_CompletedTasksSynced?(): boolean | void
  ThreadsFetched_Any?(): boolean | void
  ThreadsFetched_MsgsFetched?(): boolean | void
  ThreadsFetched_Exception?(): boolean | void
  MsgsFetched_Exception?(): boolean | void
  MsgsFetched_Enabled?(): boolean | void
  MsgsFetched_Syncing?(): boolean | void
  MsgsFetched_Synced?(): boolean | void
  MsgsFetched_Restart?(): boolean | void
  MsgsFetched_PreparingList?(): boolean | void
  MsgsFetched_ListReady?(): boolean | void
  MsgsFetched_FetchingTasks?(): boolean | void
  MsgsFetched_TasksFetched?(): boolean | void
  MsgsFetched_TasksCached?(): boolean | void
  MsgsFetched_SyncingThreadsToTasks?(): boolean | void
  MsgsFetched_ThreadsToTasksSynced?(): boolean | void
  MsgsFetched_SyncingTasksToThreads?(): boolean | void
  MsgsFetched_TasksToThreadsSynced?(): boolean | void
  MsgsFetched_SyncingCompletedThreads?(): boolean | void
  MsgsFetched_CompletedThreadsSynced?(): boolean | void
  MsgsFetched_SyncingCompletedTasks?(): boolean | void
  MsgsFetched_CompletedTasksSynced?(): boolean | void
  MsgsFetched_ThreadsFetched?(): boolean | void
  MsgsFetched_Any?(): boolean | void
  MsgsFetched_Exception?(): boolean | void
  Exception_Enabled?(): boolean | void
  Exception_Syncing?(): boolean | void
  Exception_Synced?(): boolean | void
  Exception_Restart?(): boolean | void
  Exception_PreparingList?(): boolean | void
  Exception_ListReady?(): boolean | void
  Exception_FetchingTasks?(): boolean | void
  Exception_TasksFetched?(): boolean | void
  Exception_TasksCached?(): boolean | void
  Exception_SyncingThreadsToTasks?(): boolean | void
  Exception_ThreadsToTasksSynced?(): boolean | void
  Exception_SyncingTasksToThreads?(): boolean | void
  Exception_TasksToThreadsSynced?(): boolean | void
  Exception_SyncingCompletedThreads?(): boolean | void
  Exception_CompletedThreadsSynced?(): boolean | void
  Exception_SyncingCompletedTasks?(): boolean | void
  Exception_CompletedTasksSynced?(): boolean | void
  Exception_ThreadsFetched?(): boolean | void
  Exception_MsgsFetched?(): boolean | void
}

/**
 * All the state names.
 */
export type TStates =
  | 'Enabled'
  | 'Syncing'
  | 'Synced'
  | 'Restart'
  | 'PreparingList'
  | 'ListReady'
  | 'FetchingTasks'
  | 'TasksFetched'
  | 'TasksCached'
  | 'SyncingThreadsToTasks'
  | 'ThreadsToTasksSynced'
  | 'SyncingTasksToThreads'
  | 'TasksToThreadsSynced'
  | 'SyncingCompletedThreads'
  | 'CompletedThreadsSynced'
  | 'SyncingCompletedTasks'
  | 'CompletedTasksSynced'
  | 'ThreadsFetched'
  | 'MsgsFetched'

/**
 * All the transition names.
 */
export type TTransitions =
  | 'Exception_Enabled'
  | 'Exception_Syncing'
  | 'Exception_Synced'
  | 'Exception_Restart'
  | 'Exception_PreparingList'
  | 'Exception_ListReady'
  | 'Exception_FetchingTasks'
  | 'Exception_TasksFetched'
  | 'Exception_TasksCached'
  | 'Exception_SyncingThreadsToTasks'
  | 'Exception_ThreadsToTasksSynced'
  | 'Exception_SyncingTasksToThreads'
  | 'Exception_TasksToThreadsSynced'
  | 'Exception_SyncingCompletedThreads'
  | 'Exception_CompletedThreadsSynced'
  | 'Exception_SyncingCompletedTasks'
  | 'Exception_CompletedTasksSynced'
  | 'Exception_ThreadsFetched'
  | 'Exception_MsgsFetched'
  | 'Enabled_Exception'
  | 'Enabled_Any'
  | 'Enabled_Syncing'
  | 'Enabled_Synced'
  | 'Enabled_Restart'
  | 'Enabled_PreparingList'
  | 'Enabled_ListReady'
  | 'Enabled_FetchingTasks'
  | 'Enabled_TasksFetched'
  | 'Enabled_TasksCached'
  | 'Enabled_SyncingThreadsToTasks'
  | 'Enabled_ThreadsToTasksSynced'
  | 'Enabled_SyncingTasksToThreads'
  | 'Enabled_TasksToThreadsSynced'
  | 'Enabled_SyncingCompletedThreads'
  | 'Enabled_CompletedThreadsSynced'
  | 'Enabled_SyncingCompletedTasks'
  | 'Enabled_CompletedTasksSynced'
  | 'Enabled_ThreadsFetched'
  | 'Enabled_MsgsFetched'
  | 'Enabled_Exception'
  | 'Syncing_Exception'
  | 'Syncing_Enabled'
  | 'Syncing_Any'
  | 'Syncing_Synced'
  | 'Syncing_Restart'
  | 'Syncing_PreparingList'
  | 'Syncing_ListReady'
  | 'Syncing_FetchingTasks'
  | 'Syncing_TasksFetched'
  | 'Syncing_TasksCached'
  | 'Syncing_SyncingThreadsToTasks'
  | 'Syncing_ThreadsToTasksSynced'
  | 'Syncing_SyncingTasksToThreads'
  | 'Syncing_TasksToThreadsSynced'
  | 'Syncing_SyncingCompletedThreads'
  | 'Syncing_CompletedThreadsSynced'
  | 'Syncing_SyncingCompletedTasks'
  | 'Syncing_CompletedTasksSynced'
  | 'Syncing_ThreadsFetched'
  | 'Syncing_MsgsFetched'
  | 'Syncing_Exception'
  | 'Synced_Exception'
  | 'Synced_Enabled'
  | 'Synced_Syncing'
  | 'Synced_Any'
  | 'Synced_Restart'
  | 'Synced_PreparingList'
  | 'Synced_ListReady'
  | 'Synced_FetchingTasks'
  | 'Synced_TasksFetched'
  | 'Synced_TasksCached'
  | 'Synced_SyncingThreadsToTasks'
  | 'Synced_ThreadsToTasksSynced'
  | 'Synced_SyncingTasksToThreads'
  | 'Synced_TasksToThreadsSynced'
  | 'Synced_SyncingCompletedThreads'
  | 'Synced_CompletedThreadsSynced'
  | 'Synced_SyncingCompletedTasks'
  | 'Synced_CompletedTasksSynced'
  | 'Synced_ThreadsFetched'
  | 'Synced_MsgsFetched'
  | 'Synced_Exception'
  | 'Restart_Exception'
  | 'Restart_Enabled'
  | 'Restart_Syncing'
  | 'Restart_Synced'
  | 'Restart_Any'
  | 'Restart_PreparingList'
  | 'Restart_ListReady'
  | 'Restart_FetchingTasks'
  | 'Restart_TasksFetched'
  | 'Restart_TasksCached'
  | 'Restart_SyncingThreadsToTasks'
  | 'Restart_ThreadsToTasksSynced'
  | 'Restart_SyncingTasksToThreads'
  | 'Restart_TasksToThreadsSynced'
  | 'Restart_SyncingCompletedThreads'
  | 'Restart_CompletedThreadsSynced'
  | 'Restart_SyncingCompletedTasks'
  | 'Restart_CompletedTasksSynced'
  | 'Restart_ThreadsFetched'
  | 'Restart_MsgsFetched'
  | 'Restart_Exception'
  | 'PreparingList_Exception'
  | 'PreparingList_Enabled'
  | 'PreparingList_Syncing'
  | 'PreparingList_Synced'
  | 'PreparingList_Restart'
  | 'PreparingList_Any'
  | 'PreparingList_ListReady'
  | 'PreparingList_FetchingTasks'
  | 'PreparingList_TasksFetched'
  | 'PreparingList_TasksCached'
  | 'PreparingList_SyncingThreadsToTasks'
  | 'PreparingList_ThreadsToTasksSynced'
  | 'PreparingList_SyncingTasksToThreads'
  | 'PreparingList_TasksToThreadsSynced'
  | 'PreparingList_SyncingCompletedThreads'
  | 'PreparingList_CompletedThreadsSynced'
  | 'PreparingList_SyncingCompletedTasks'
  | 'PreparingList_CompletedTasksSynced'
  | 'PreparingList_ThreadsFetched'
  | 'PreparingList_MsgsFetched'
  | 'PreparingList_Exception'
  | 'ListReady_Exception'
  | 'ListReady_Enabled'
  | 'ListReady_Syncing'
  | 'ListReady_Synced'
  | 'ListReady_Restart'
  | 'ListReady_PreparingList'
  | 'ListReady_Any'
  | 'ListReady_FetchingTasks'
  | 'ListReady_TasksFetched'
  | 'ListReady_TasksCached'
  | 'ListReady_SyncingThreadsToTasks'
  | 'ListReady_ThreadsToTasksSynced'
  | 'ListReady_SyncingTasksToThreads'
  | 'ListReady_TasksToThreadsSynced'
  | 'ListReady_SyncingCompletedThreads'
  | 'ListReady_CompletedThreadsSynced'
  | 'ListReady_SyncingCompletedTasks'
  | 'ListReady_CompletedTasksSynced'
  | 'ListReady_ThreadsFetched'
  | 'ListReady_MsgsFetched'
  | 'ListReady_Exception'
  | 'FetchingTasks_Exception'
  | 'FetchingTasks_Enabled'
  | 'FetchingTasks_Syncing'
  | 'FetchingTasks_Synced'
  | 'FetchingTasks_Restart'
  | 'FetchingTasks_PreparingList'
  | 'FetchingTasks_ListReady'
  | 'FetchingTasks_Any'
  | 'FetchingTasks_TasksFetched'
  | 'FetchingTasks_TasksCached'
  | 'FetchingTasks_SyncingThreadsToTasks'
  | 'FetchingTasks_ThreadsToTasksSynced'
  | 'FetchingTasks_SyncingTasksToThreads'
  | 'FetchingTasks_TasksToThreadsSynced'
  | 'FetchingTasks_SyncingCompletedThreads'
  | 'FetchingTasks_CompletedThreadsSynced'
  | 'FetchingTasks_SyncingCompletedTasks'
  | 'FetchingTasks_CompletedTasksSynced'
  | 'FetchingTasks_ThreadsFetched'
  | 'FetchingTasks_MsgsFetched'
  | 'FetchingTasks_Exception'
  | 'TasksFetched_Exception'
  | 'TasksFetched_Enabled'
  | 'TasksFetched_Syncing'
  | 'TasksFetched_Synced'
  | 'TasksFetched_Restart'
  | 'TasksFetched_PreparingList'
  | 'TasksFetched_ListReady'
  | 'TasksFetched_FetchingTasks'
  | 'TasksFetched_Any'
  | 'TasksFetched_TasksCached'
  | 'TasksFetched_SyncingThreadsToTasks'
  | 'TasksFetched_ThreadsToTasksSynced'
  | 'TasksFetched_SyncingTasksToThreads'
  | 'TasksFetched_TasksToThreadsSynced'
  | 'TasksFetched_SyncingCompletedThreads'
  | 'TasksFetched_CompletedThreadsSynced'
  | 'TasksFetched_SyncingCompletedTasks'
  | 'TasksFetched_CompletedTasksSynced'
  | 'TasksFetched_ThreadsFetched'
  | 'TasksFetched_MsgsFetched'
  | 'TasksFetched_Exception'
  | 'TasksCached_Exception'
  | 'TasksCached_Enabled'
  | 'TasksCached_Syncing'
  | 'TasksCached_Synced'
  | 'TasksCached_Restart'
  | 'TasksCached_PreparingList'
  | 'TasksCached_ListReady'
  | 'TasksCached_FetchingTasks'
  | 'TasksCached_TasksFetched'
  | 'TasksCached_Any'
  | 'TasksCached_SyncingThreadsToTasks'
  | 'TasksCached_ThreadsToTasksSynced'
  | 'TasksCached_SyncingTasksToThreads'
  | 'TasksCached_TasksToThreadsSynced'
  | 'TasksCached_SyncingCompletedThreads'
  | 'TasksCached_CompletedThreadsSynced'
  | 'TasksCached_SyncingCompletedTasks'
  | 'TasksCached_CompletedTasksSynced'
  | 'TasksCached_ThreadsFetched'
  | 'TasksCached_MsgsFetched'
  | 'TasksCached_Exception'
  | 'SyncingThreadsToTasks_Exception'
  | 'SyncingThreadsToTasks_Enabled'
  | 'SyncingThreadsToTasks_Syncing'
  | 'SyncingThreadsToTasks_Synced'
  | 'SyncingThreadsToTasks_Restart'
  | 'SyncingThreadsToTasks_PreparingList'
  | 'SyncingThreadsToTasks_ListReady'
  | 'SyncingThreadsToTasks_FetchingTasks'
  | 'SyncingThreadsToTasks_TasksFetched'
  | 'SyncingThreadsToTasks_TasksCached'
  | 'SyncingThreadsToTasks_Any'
  | 'SyncingThreadsToTasks_ThreadsToTasksSynced'
  | 'SyncingThreadsToTasks_SyncingTasksToThreads'
  | 'SyncingThreadsToTasks_TasksToThreadsSynced'
  | 'SyncingThreadsToTasks_SyncingCompletedThreads'
  | 'SyncingThreadsToTasks_CompletedThreadsSynced'
  | 'SyncingThreadsToTasks_SyncingCompletedTasks'
  | 'SyncingThreadsToTasks_CompletedTasksSynced'
  | 'SyncingThreadsToTasks_ThreadsFetched'
  | 'SyncingThreadsToTasks_MsgsFetched'
  | 'SyncingThreadsToTasks_Exception'
  | 'ThreadsToTasksSynced_Exception'
  | 'ThreadsToTasksSynced_Enabled'
  | 'ThreadsToTasksSynced_Syncing'
  | 'ThreadsToTasksSynced_Synced'
  | 'ThreadsToTasksSynced_Restart'
  | 'ThreadsToTasksSynced_PreparingList'
  | 'ThreadsToTasksSynced_ListReady'
  | 'ThreadsToTasksSynced_FetchingTasks'
  | 'ThreadsToTasksSynced_TasksFetched'
  | 'ThreadsToTasksSynced_TasksCached'
  | 'ThreadsToTasksSynced_SyncingThreadsToTasks'
  | 'ThreadsToTasksSynced_Any'
  | 'ThreadsToTasksSynced_SyncingTasksToThreads'
  | 'ThreadsToTasksSynced_TasksToThreadsSynced'
  | 'ThreadsToTasksSynced_SyncingCompletedThreads'
  | 'ThreadsToTasksSynced_CompletedThreadsSynced'
  | 'ThreadsToTasksSynced_SyncingCompletedTasks'
  | 'ThreadsToTasksSynced_CompletedTasksSynced'
  | 'ThreadsToTasksSynced_ThreadsFetched'
  | 'ThreadsToTasksSynced_MsgsFetched'
  | 'ThreadsToTasksSynced_Exception'
  | 'SyncingTasksToThreads_Exception'
  | 'SyncingTasksToThreads_Enabled'
  | 'SyncingTasksToThreads_Syncing'
  | 'SyncingTasksToThreads_Synced'
  | 'SyncingTasksToThreads_Restart'
  | 'SyncingTasksToThreads_PreparingList'
  | 'SyncingTasksToThreads_ListReady'
  | 'SyncingTasksToThreads_FetchingTasks'
  | 'SyncingTasksToThreads_TasksFetched'
  | 'SyncingTasksToThreads_TasksCached'
  | 'SyncingTasksToThreads_SyncingThreadsToTasks'
  | 'SyncingTasksToThreads_ThreadsToTasksSynced'
  | 'SyncingTasksToThreads_Any'
  | 'SyncingTasksToThreads_TasksToThreadsSynced'
  | 'SyncingTasksToThreads_SyncingCompletedThreads'
  | 'SyncingTasksToThreads_CompletedThreadsSynced'
  | 'SyncingTasksToThreads_SyncingCompletedTasks'
  | 'SyncingTasksToThreads_CompletedTasksSynced'
  | 'SyncingTasksToThreads_ThreadsFetched'
  | 'SyncingTasksToThreads_MsgsFetched'
  | 'SyncingTasksToThreads_Exception'
  | 'TasksToThreadsSynced_Exception'
  | 'TasksToThreadsSynced_Enabled'
  | 'TasksToThreadsSynced_Syncing'
  | 'TasksToThreadsSynced_Synced'
  | 'TasksToThreadsSynced_Restart'
  | 'TasksToThreadsSynced_PreparingList'
  | 'TasksToThreadsSynced_ListReady'
  | 'TasksToThreadsSynced_FetchingTasks'
  | 'TasksToThreadsSynced_TasksFetched'
  | 'TasksToThreadsSynced_TasksCached'
  | 'TasksToThreadsSynced_SyncingThreadsToTasks'
  | 'TasksToThreadsSynced_ThreadsToTasksSynced'
  | 'TasksToThreadsSynced_SyncingTasksToThreads'
  | 'TasksToThreadsSynced_Any'
  | 'TasksToThreadsSynced_SyncingCompletedThreads'
  | 'TasksToThreadsSynced_CompletedThreadsSynced'
  | 'TasksToThreadsSynced_SyncingCompletedTasks'
  | 'TasksToThreadsSynced_CompletedTasksSynced'
  | 'TasksToThreadsSynced_ThreadsFetched'
  | 'TasksToThreadsSynced_MsgsFetched'
  | 'TasksToThreadsSynced_Exception'
  | 'SyncingCompletedThreads_Exception'
  | 'SyncingCompletedThreads_Enabled'
  | 'SyncingCompletedThreads_Syncing'
  | 'SyncingCompletedThreads_Synced'
  | 'SyncingCompletedThreads_Restart'
  | 'SyncingCompletedThreads_PreparingList'
  | 'SyncingCompletedThreads_ListReady'
  | 'SyncingCompletedThreads_FetchingTasks'
  | 'SyncingCompletedThreads_TasksFetched'
  | 'SyncingCompletedThreads_TasksCached'
  | 'SyncingCompletedThreads_SyncingThreadsToTasks'
  | 'SyncingCompletedThreads_ThreadsToTasksSynced'
  | 'SyncingCompletedThreads_SyncingTasksToThreads'
  | 'SyncingCompletedThreads_TasksToThreadsSynced'
  | 'SyncingCompletedThreads_Any'
  | 'SyncingCompletedThreads_CompletedThreadsSynced'
  | 'SyncingCompletedThreads_SyncingCompletedTasks'
  | 'SyncingCompletedThreads_CompletedTasksSynced'
  | 'SyncingCompletedThreads_ThreadsFetched'
  | 'SyncingCompletedThreads_MsgsFetched'
  | 'SyncingCompletedThreads_Exception'
  | 'CompletedThreadsSynced_Exception'
  | 'CompletedThreadsSynced_Enabled'
  | 'CompletedThreadsSynced_Syncing'
  | 'CompletedThreadsSynced_Synced'
  | 'CompletedThreadsSynced_Restart'
  | 'CompletedThreadsSynced_PreparingList'
  | 'CompletedThreadsSynced_ListReady'
  | 'CompletedThreadsSynced_FetchingTasks'
  | 'CompletedThreadsSynced_TasksFetched'
  | 'CompletedThreadsSynced_TasksCached'
  | 'CompletedThreadsSynced_SyncingThreadsToTasks'
  | 'CompletedThreadsSynced_ThreadsToTasksSynced'
  | 'CompletedThreadsSynced_SyncingTasksToThreads'
  | 'CompletedThreadsSynced_TasksToThreadsSynced'
  | 'CompletedThreadsSynced_SyncingCompletedThreads'
  | 'CompletedThreadsSynced_Any'
  | 'CompletedThreadsSynced_SyncingCompletedTasks'
  | 'CompletedThreadsSynced_CompletedTasksSynced'
  | 'CompletedThreadsSynced_ThreadsFetched'
  | 'CompletedThreadsSynced_MsgsFetched'
  | 'CompletedThreadsSynced_Exception'
  | 'SyncingCompletedTasks_Exception'
  | 'SyncingCompletedTasks_Enabled'
  | 'SyncingCompletedTasks_Syncing'
  | 'SyncingCompletedTasks_Synced'
  | 'SyncingCompletedTasks_Restart'
  | 'SyncingCompletedTasks_PreparingList'
  | 'SyncingCompletedTasks_ListReady'
  | 'SyncingCompletedTasks_FetchingTasks'
  | 'SyncingCompletedTasks_TasksFetched'
  | 'SyncingCompletedTasks_TasksCached'
  | 'SyncingCompletedTasks_SyncingThreadsToTasks'
  | 'SyncingCompletedTasks_ThreadsToTasksSynced'
  | 'SyncingCompletedTasks_SyncingTasksToThreads'
  | 'SyncingCompletedTasks_TasksToThreadsSynced'
  | 'SyncingCompletedTasks_SyncingCompletedThreads'
  | 'SyncingCompletedTasks_CompletedThreadsSynced'
  | 'SyncingCompletedTasks_Any'
  | 'SyncingCompletedTasks_CompletedTasksSynced'
  | 'SyncingCompletedTasks_ThreadsFetched'
  | 'SyncingCompletedTasks_MsgsFetched'
  | 'SyncingCompletedTasks_Exception'
  | 'CompletedTasksSynced_Exception'
  | 'CompletedTasksSynced_Enabled'
  | 'CompletedTasksSynced_Syncing'
  | 'CompletedTasksSynced_Synced'
  | 'CompletedTasksSynced_Restart'
  | 'CompletedTasksSynced_PreparingList'
  | 'CompletedTasksSynced_ListReady'
  | 'CompletedTasksSynced_FetchingTasks'
  | 'CompletedTasksSynced_TasksFetched'
  | 'CompletedTasksSynced_TasksCached'
  | 'CompletedTasksSynced_SyncingThreadsToTasks'
  | 'CompletedTasksSynced_ThreadsToTasksSynced'
  | 'CompletedTasksSynced_SyncingTasksToThreads'
  | 'CompletedTasksSynced_TasksToThreadsSynced'
  | 'CompletedTasksSynced_SyncingCompletedThreads'
  | 'CompletedTasksSynced_CompletedThreadsSynced'
  | 'CompletedTasksSynced_SyncingCompletedTasks'
  | 'CompletedTasksSynced_Any'
  | 'CompletedTasksSynced_ThreadsFetched'
  | 'CompletedTasksSynced_MsgsFetched'
  | 'CompletedTasksSynced_Exception'
  | 'ThreadsFetched_Exception'
  | 'ThreadsFetched_Enabled'
  | 'ThreadsFetched_Syncing'
  | 'ThreadsFetched_Synced'
  | 'ThreadsFetched_Restart'
  | 'ThreadsFetched_PreparingList'
  | 'ThreadsFetched_ListReady'
  | 'ThreadsFetched_FetchingTasks'
  | 'ThreadsFetched_TasksFetched'
  | 'ThreadsFetched_TasksCached'
  | 'ThreadsFetched_SyncingThreadsToTasks'
  | 'ThreadsFetched_ThreadsToTasksSynced'
  | 'ThreadsFetched_SyncingTasksToThreads'
  | 'ThreadsFetched_TasksToThreadsSynced'
  | 'ThreadsFetched_SyncingCompletedThreads'
  | 'ThreadsFetched_CompletedThreadsSynced'
  | 'ThreadsFetched_SyncingCompletedTasks'
  | 'ThreadsFetched_CompletedTasksSynced'
  | 'ThreadsFetched_Any'
  | 'ThreadsFetched_MsgsFetched'
  | 'ThreadsFetched_Exception'
  | 'MsgsFetched_Exception'
  | 'MsgsFetched_Enabled'
  | 'MsgsFetched_Syncing'
  | 'MsgsFetched_Synced'
  | 'MsgsFetched_Restart'
  | 'MsgsFetched_PreparingList'
  | 'MsgsFetched_ListReady'
  | 'MsgsFetched_FetchingTasks'
  | 'MsgsFetched_TasksFetched'
  | 'MsgsFetched_TasksCached'
  | 'MsgsFetched_SyncingThreadsToTasks'
  | 'MsgsFetched_ThreadsToTasksSynced'
  | 'MsgsFetched_SyncingTasksToThreads'
  | 'MsgsFetched_TasksToThreadsSynced'
  | 'MsgsFetched_SyncingCompletedThreads'
  | 'MsgsFetched_CompletedThreadsSynced'
  | 'MsgsFetched_SyncingCompletedTasks'
  | 'MsgsFetched_CompletedTasksSynced'
  | 'MsgsFetched_ThreadsFetched'
  | 'MsgsFetched_Any'
  | 'MsgsFetched_Exception'
  | 'Exception_Enabled'
  | 'Exception_Syncing'
  | 'Exception_Synced'
  | 'Exception_Restart'
  | 'Exception_PreparingList'
  | 'Exception_ListReady'
  | 'Exception_FetchingTasks'
  | 'Exception_TasksFetched'
  | 'Exception_TasksCached'
  | 'Exception_SyncingThreadsToTasks'
  | 'Exception_ThreadsToTasksSynced'
  | 'Exception_SyncingTasksToThreads'
  | 'Exception_TasksToThreadsSynced'
  | 'Exception_SyncingCompletedThreads'
  | 'Exception_CompletedThreadsSynced'
  | 'Exception_SyncingCompletedTasks'
  | 'Exception_CompletedTasksSynced'
  | 'Exception_ThreadsFetched'
  | 'Exception_MsgsFetched'

/**
 * Typesafe state interface.
 */
export interface IState extends IStateBase<TStates> {}

/**
 * Subclassable typesafe state interface.
 */
export interface IStateExt<T extends string> extends IStateBase<T | TStates> {}

export interface IBind {
  // Non-params events
  (event: 'Enabled_exit', listener: () =>
    | boolean
    | undefined, context?: Object): this
  (event: 'Enabled_end', listener: () => any, context?: Object): this
  (event: 'Syncing_exit', listener: () =>
    | boolean
    | undefined, context?: Object): this
  (event: 'Syncing_end', listener: () => any, context?: Object): this
  (event: 'Synced_exit', listener: () =>
    | boolean
    | undefined, context?: Object): this
  (event: 'Synced_end', listener: () => any, context?: Object): this
  (event: 'Restart_exit', listener: () =>
    | boolean
    | undefined, context?: Object): this
  (event: 'Restart_end', listener: () => any, context?: Object): this
  (event: 'PreparingList_exit', listener: () =>
    | boolean
    | undefined, context?: Object): this
  (event: 'PreparingList_end', listener: () => any, context?: Object): this
  (event: 'ListReady_exit', listener: () =>
    | boolean
    | undefined, context?: Object): this
  (event: 'ListReady_end', listener: () => any, context?: Object): this
  (event: 'FetchingTasks_exit', listener: () =>
    | boolean
    | undefined, context?: Object): this
  (event: 'FetchingTasks_end', listener: () => any, context?: Object): this
  (event: 'TasksFetched_exit', listener: () =>
    | boolean
    | undefined, context?: Object): this
  (event: 'TasksFetched_end', listener: () => any, context?: Object): this
  (event: 'TasksCached_exit', listener: () =>
    | boolean
    | undefined, context?: Object): this
  (event: 'TasksCached_end', listener: () => any, context?: Object): this
  (event: 'SyncingThreadsToTasks_exit', listener: () =>
    | boolean
    | undefined, context?: Object): this
  (event: 'SyncingThreadsToTasks_end', listener: () => any, context?: Object): this
  (event: 'ThreadsToTasksSynced_exit', listener: () =>
    | boolean
    | undefined, context?: Object): this
  (event: 'ThreadsToTasksSynced_end', listener: () => any, context?: Object): this
  (event: 'SyncingTasksToThreads_exit', listener: () =>
    | boolean
    | undefined, context?: Object): this
  (event: 'SyncingTasksToThreads_end', listener: () => any, context?: Object): this
  (event: 'TasksToThreadsSynced_exit', listener: () =>
    | boolean
    | undefined, context?: Object): this
  (event: 'TasksToThreadsSynced_end', listener: () => any, context?: Object): this
  (event: 'SyncingCompletedThreads_exit', listener: () =>
    | boolean
    | undefined, context?: Object): this
  (event: 'SyncingCompletedThreads_end', listener: () => any, context?: Object): this
  (event: 'CompletedThreadsSynced_exit', listener: () =>
    | boolean
    | undefined, context?: Object): this
  (event: 'CompletedThreadsSynced_end', listener: () => any, context?: Object): this
  (event: 'SyncingCompletedTasks_exit', listener: () =>
    | boolean
    | undefined, context?: Object): this
  (event: 'SyncingCompletedTasks_end', listener: () => any, context?: Object): this
  (event: 'CompletedTasksSynced_exit', listener: () =>
    | boolean
    | undefined, context?: Object): this
  (event: 'CompletedTasksSynced_end', listener: () => any, context?: Object): this
  (event: 'ThreadsFetched_exit', listener: () =>
    | boolean
    | undefined, context?: Object): this
  (event: 'ThreadsFetched_end', listener: () => any, context?: Object): this
  (event: 'MsgsFetched_exit', listener: () =>
    | boolean
    | undefined, context?: Object): this
  (event: 'MsgsFetched_end', listener: () => any, context?: Object): this

  // Transitions
  (event: TTransitions): this
}

export interface IEmit {
  // Non-params events
  (event: 'Enabled_exit'): boolean | void
  (event: 'Enabled_end'): boolean | void
  (event: 'Syncing_exit'): boolean | void
  (event: 'Syncing_end'): boolean | void
  (event: 'Synced_exit'): boolean | void
  (event: 'Synced_end'): boolean | void
  (event: 'Restart_exit'): boolean | void
  (event: 'Restart_end'): boolean | void
  (event: 'PreparingList_exit'): boolean | void
  (event: 'PreparingList_end'): boolean | void
  (event: 'ListReady_exit'): boolean | void
  (event: 'ListReady_end'): boolean | void
  (event: 'FetchingTasks_exit'): boolean | void
  (event: 'FetchingTasks_end'): boolean | void
  (event: 'TasksFetched_exit'): boolean | void
  (event: 'TasksFetched_end'): boolean | void
  (event: 'TasksCached_exit'): boolean | void
  (event: 'TasksCached_end'): boolean | void
  (event: 'SyncingThreadsToTasks_exit'): boolean | void
  (event: 'SyncingThreadsToTasks_end'): boolean | void
  (event: 'ThreadsToTasksSynced_exit'): boolean | void
  (event: 'ThreadsToTasksSynced_end'): boolean | void
  (event: 'SyncingTasksToThreads_exit'): boolean | void
  (event: 'SyncingTasksToThreads_end'): boolean | void
  (event: 'TasksToThreadsSynced_exit'): boolean | void
  (event: 'TasksToThreadsSynced_end'): boolean | void
  (event: 'SyncingCompletedThreads_exit'): boolean | void
  (event: 'SyncingCompletedThreads_end'): boolean | void
  (event: 'CompletedThreadsSynced_exit'): boolean | void
  (event: 'CompletedThreadsSynced_end'): boolean | void
  (event: 'SyncingCompletedTasks_exit'): boolean | void
  (event: 'SyncingCompletedTasks_end'): boolean | void
  (event: 'CompletedTasksSynced_exit'): boolean | void
  (event: 'CompletedTasksSynced_end'): boolean | void
  (event: 'ThreadsFetched_exit'): boolean | void
  (event: 'ThreadsFetched_end'): boolean | void
  (event: 'MsgsFetched_exit'): boolean | void
  (event: 'MsgsFetched_end'): boolean | void

  // Transitions
  (event: TTransitions): boolean | void
}
