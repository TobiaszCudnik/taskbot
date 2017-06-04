
import { IState as IStateBase } from 'asyncmachine/src/types'


/**
 * Signatures for EventEmitter to bind to transitions.
 */
export interface IBind {

    // Enabled
    (event: 'Enabled_enter', listener: (/* param1, param2 */) => boolean | undefined, context?: Object): this;
    (event: 'Enabled_state', listener: (/* param1, param2 */) => any, context?: Object): this;
    // Authenticating
    (event: 'Authenticating_enter', listener: (/* param1, param2 */) => boolean | undefined, context?: Object): this;
    (event: 'Authenticating_state', listener: (/* param1, param2 */) => any, context?: Object): this;
    // Authenticated
    (event: 'Authenticated_enter', listener: (/* param1, param2 */) => boolean | undefined, context?: Object): this;
    (event: 'Authenticated_state', listener: (/* param1, param2 */) => any, context?: Object): this;
    // Syncing
    (event: 'Syncing_enter', listener: (/* param1, param2 */) => boolean | undefined, context?: Object): this;
    (event: 'Syncing_state', listener: (/* param1, param2 */) => any, context?: Object): this;
    // Synced
    (event: 'Synced_enter', listener: (/* param1, param2 */) => boolean | undefined, context?: Object): this;
    (event: 'Synced_state', listener: (/* param1, param2 */) => any, context?: Object): this;
    // TaskListSyncEnabled
    (event: 'TaskListSyncEnabled_enter', listener: (/* param1, param2 */) => boolean | undefined, context?: Object): this;
    (event: 'TaskListSyncEnabled_state', listener: (/* param1, param2 */) => any, context?: Object): this;
    // GmailEnabled
    (event: 'GmailEnabled_enter', listener: (/* param1, param2 */) => boolean | undefined, context?: Object): this;
    (event: 'GmailEnabled_state', listener: (/* param1, param2 */) => any, context?: Object): this;
    // GmailSyncEnabled
    (event: 'GmailSyncEnabled_enter', listener: (/* param1, param2 */) => boolean | undefined, context?: Object): this;
    (event: 'GmailSyncEnabled_state', listener: (/* param1, param2 */) => any, context?: Object): this;
    // FetchingTaskLists
    (event: 'FetchingTaskLists_enter', listener: (/* param1, param2 */) => boolean | undefined, context?: Object): this;
    (event: 'FetchingTaskLists_state', listener: (/* param1, param2 */) => any, context?: Object): this;
    // TaskListsFetched
    (event: 'TaskListsFetched_enter', listener: (/* param1, param2 */) => boolean | undefined, context?: Object): this;
    (event: 'TaskListsFetched_state', listener: (/* param1, param2 */) => any, context?: Object): this;
    // QueryLabelsSynced
    (event: 'QueryLabelsSynced_enter', listener: (/* param1, param2 */) => boolean | undefined, context?: Object): this;
    (event: 'QueryLabelsSynced_state', listener: (/* param1, param2 */) => any, context?: Object): this;
    // SyncingTaskLists
    (event: 'SyncingTaskLists_enter', listener: (/* param1, param2 */) => boolean | undefined, context?: Object): this;
    (event: 'SyncingTaskLists_state', listener: (/* param1, param2 */) => any, context?: Object): this;
    // TaskListsSynced
    (event: 'TaskListsSynced_enter', listener: (/* param1, param2 */) => boolean | undefined, context?: Object): this;
    (event: 'TaskListsSynced_state', listener: (/* param1, param2 */) => any, context?: Object): this;
    // Dirty
    (event: 'Dirty_enter', listener: (/* param1, param2 */) => boolean | undefined, context?: Object): this;
    (event: 'Dirty_state', listener: (/* param1, param2 */) => any, context?: Object): this;

}

/**
 * Signatures for EventEmitter to emit transitions.
 */
export interface IEmit {

    // Enabled
    (event: 'Enabled_enter' /*, param1, param2 */): boolean | void;
    (event: 'Enabled_state' /*, param1, param2 */): boolean | void;
    // Authenticating
    (event: 'Authenticating_enter' /*, param1, param2 */): boolean | void;
    (event: 'Authenticating_state' /*, param1, param2 */): boolean | void;
    // Authenticated
    (event: 'Authenticated_enter' /*, param1, param2 */): boolean | void;
    (event: 'Authenticated_state' /*, param1, param2 */): boolean | void;
    // Syncing
    (event: 'Syncing_enter' /*, param1, param2 */): boolean | void;
    (event: 'Syncing_state' /*, param1, param2 */): boolean | void;
    // Synced
    (event: 'Synced_enter' /*, param1, param2 */): boolean | void;
    (event: 'Synced_state' /*, param1, param2 */): boolean | void;
    // TaskListSyncEnabled
    (event: 'TaskListSyncEnabled_enter' /*, param1, param2 */): boolean | void;
    (event: 'TaskListSyncEnabled_state' /*, param1, param2 */): boolean | void;
    // GmailEnabled
    (event: 'GmailEnabled_enter' /*, param1, param2 */): boolean | void;
    (event: 'GmailEnabled_state' /*, param1, param2 */): boolean | void;
    // GmailSyncEnabled
    (event: 'GmailSyncEnabled_enter' /*, param1, param2 */): boolean | void;
    (event: 'GmailSyncEnabled_state' /*, param1, param2 */): boolean | void;
    // FetchingTaskLists
    (event: 'FetchingTaskLists_enter' /*, param1, param2 */): boolean | void;
    (event: 'FetchingTaskLists_state' /*, param1, param2 */): boolean | void;
    // TaskListsFetched
    (event: 'TaskListsFetched_enter' /*, param1, param2 */): boolean | void;
    (event: 'TaskListsFetched_state' /*, param1, param2 */): boolean | void;
    // QueryLabelsSynced
    (event: 'QueryLabelsSynced_enter' /*, param1, param2 */): boolean | void;
    (event: 'QueryLabelsSynced_state' /*, param1, param2 */): boolean | void;
    // SyncingTaskLists
    (event: 'SyncingTaskLists_enter' /*, param1, param2 */): boolean | void;
    (event: 'SyncingTaskLists_state' /*, param1, param2 */): boolean | void;
    // TaskListsSynced
    (event: 'TaskListsSynced_enter' /*, param1, param2 */): boolean | void;
    (event: 'TaskListsSynced_state' /*, param1, param2 */): boolean | void;
    // Dirty
    (event: 'Dirty_enter' /*, param1, param2 */): boolean | void;
    (event: 'Dirty_state' /*, param1, param2 */): boolean | void;

}

/**
 * All the possible transition methods machine can define.
 */
export interface ITransitions {

    // Enabled
    Enabled_enter?(/*param1, param2 */): boolean | void;
    Enabled_state?(/*param1, param2 */): boolean | void | Promise;
    // Authenticating
    Authenticating_enter?(/*param1, param2 */): boolean | void;
    Authenticating_state?(/*param1, param2 */): boolean | void | Promise;
    // Authenticated
    Authenticated_enter?(/*param1, param2 */): boolean | void;
    Authenticated_state?(/*param1, param2 */): boolean | void | Promise;
    // Syncing
    Syncing_enter?(/*param1, param2 */): boolean | void;
    Syncing_state?(/*param1, param2 */): boolean | void | Promise;
    // Synced
    Synced_enter?(/*param1, param2 */): boolean | void;
    Synced_state?(/*param1, param2 */): boolean | void | Promise;
    // TaskListSyncEnabled
    TaskListSyncEnabled_enter?(/*param1, param2 */): boolean | void;
    TaskListSyncEnabled_state?(/*param1, param2 */): boolean | void | Promise;
    // GmailEnabled
    GmailEnabled_enter?(/*param1, param2 */): boolean | void;
    GmailEnabled_state?(/*param1, param2 */): boolean | void | Promise;
    // GmailSyncEnabled
    GmailSyncEnabled_enter?(/*param1, param2 */): boolean | void;
    GmailSyncEnabled_state?(/*param1, param2 */): boolean | void | Promise;
    // FetchingTaskLists
    FetchingTaskLists_enter?(/*param1, param2 */): boolean | void;
    FetchingTaskLists_state?(/*param1, param2 */): boolean | void | Promise;
    // TaskListsFetched
    TaskListsFetched_enter?(/*param1, param2 */): boolean | void;
    TaskListsFetched_state?(/*param1, param2 */): boolean | void | Promise;
    // QueryLabelsSynced
    QueryLabelsSynced_enter?(/*param1, param2 */): boolean | void;
    QueryLabelsSynced_state?(/*param1, param2 */): boolean | void | Promise;
    // SyncingTaskLists
    SyncingTaskLists_enter?(/*param1, param2 */): boolean | void;
    SyncingTaskLists_state?(/*param1, param2 */): boolean | void | Promise;
    // TaskListsSynced
    TaskListsSynced_enter?(/*param1, param2 */): boolean | void;
    TaskListsSynced_state?(/*param1, param2 */): boolean | void | Promise;
    // Dirty
    Dirty_enter?(/*param1, param2 */): boolean | void;
    Dirty_state?(/*param1, param2 */): boolean | void | Promise;


    Enabled_exit?(): boolean | void;
    Enabled_end?(): boolean | void | Promise;
    Authenticating_exit?(): boolean | void;
    Authenticating_end?(): boolean | void | Promise;
    Authenticated_exit?(): boolean | void;
    Authenticated_end?(): boolean | void | Promise;
    Syncing_exit?(): boolean | void;
    Syncing_end?(): boolean | void | Promise;
    Synced_exit?(): boolean | void;
    Synced_end?(): boolean | void | Promise;
    TaskListSyncEnabled_exit?(): boolean | void;
    TaskListSyncEnabled_end?(): boolean | void | Promise;
    GmailEnabled_exit?(): boolean | void;
    GmailEnabled_end?(): boolean | void | Promise;
    GmailSyncEnabled_exit?(): boolean | void;
    GmailSyncEnabled_end?(): boolean | void | Promise;
    FetchingTaskLists_exit?(): boolean | void;
    FetchingTaskLists_end?(): boolean | void | Promise;
    TaskListsFetched_exit?(): boolean | void;
    TaskListsFetched_end?(): boolean | void | Promise;
    QueryLabelsSynced_exit?(): boolean | void;
    QueryLabelsSynced_end?(): boolean | void | Promise;
    SyncingTaskLists_exit?(): boolean | void;
    SyncingTaskLists_end?(): boolean | void | Promise;
    TaskListsSynced_exit?(): boolean | void;
    TaskListsSynced_end?(): boolean | void | Promise;
    Dirty_exit?(): boolean | void;
    Dirty_end?(): boolean | void | Promise;

    Exception_Enabled?(): boolean | void;
    Exception_Authenticating?(): boolean | void;
    Exception_Authenticated?(): boolean | void;
    Exception_Syncing?(): boolean | void;
    Exception_Synced?(): boolean | void;
    Exception_TaskListSyncEnabled?(): boolean | void;
    Exception_GmailEnabled?(): boolean | void;
    Exception_GmailSyncEnabled?(): boolean | void;
    Exception_FetchingTaskLists?(): boolean | void;
    Exception_TaskListsFetched?(): boolean | void;
    Exception_QueryLabelsSynced?(): boolean | void;
    Exception_SyncingTaskLists?(): boolean | void;
    Exception_TaskListsSynced?(): boolean | void;
    Exception_Dirty?(): boolean | void;
    Enabled_Exception?(): boolean | void;
    Enabled_Any?(): boolean | void;
    Enabled_Authenticating?(): boolean | void;
    Enabled_Authenticated?(): boolean | void;
    Enabled_Syncing?(): boolean | void;
    Enabled_Synced?(): boolean | void;
    Enabled_TaskListSyncEnabled?(): boolean | void;
    Enabled_GmailEnabled?(): boolean | void;
    Enabled_GmailSyncEnabled?(): boolean | void;
    Enabled_FetchingTaskLists?(): boolean | void;
    Enabled_TaskListsFetched?(): boolean | void;
    Enabled_QueryLabelsSynced?(): boolean | void;
    Enabled_SyncingTaskLists?(): boolean | void;
    Enabled_TaskListsSynced?(): boolean | void;
    Enabled_Dirty?(): boolean | void;
    Enabled_Exception?(): boolean | void;
    Authenticating_Exception?(): boolean | void;
    Authenticating_Enabled?(): boolean | void;
    Authenticating_Any?(): boolean | void;
    Authenticating_Authenticated?(): boolean | void;
    Authenticating_Syncing?(): boolean | void;
    Authenticating_Synced?(): boolean | void;
    Authenticating_TaskListSyncEnabled?(): boolean | void;
    Authenticating_GmailEnabled?(): boolean | void;
    Authenticating_GmailSyncEnabled?(): boolean | void;
    Authenticating_FetchingTaskLists?(): boolean | void;
    Authenticating_TaskListsFetched?(): boolean | void;
    Authenticating_QueryLabelsSynced?(): boolean | void;
    Authenticating_SyncingTaskLists?(): boolean | void;
    Authenticating_TaskListsSynced?(): boolean | void;
    Authenticating_Dirty?(): boolean | void;
    Authenticating_Exception?(): boolean | void;
    Authenticated_Exception?(): boolean | void;
    Authenticated_Enabled?(): boolean | void;
    Authenticated_Authenticating?(): boolean | void;
    Authenticated_Any?(): boolean | void;
    Authenticated_Syncing?(): boolean | void;
    Authenticated_Synced?(): boolean | void;
    Authenticated_TaskListSyncEnabled?(): boolean | void;
    Authenticated_GmailEnabled?(): boolean | void;
    Authenticated_GmailSyncEnabled?(): boolean | void;
    Authenticated_FetchingTaskLists?(): boolean | void;
    Authenticated_TaskListsFetched?(): boolean | void;
    Authenticated_QueryLabelsSynced?(): boolean | void;
    Authenticated_SyncingTaskLists?(): boolean | void;
    Authenticated_TaskListsSynced?(): boolean | void;
    Authenticated_Dirty?(): boolean | void;
    Authenticated_Exception?(): boolean | void;
    Syncing_Exception?(): boolean | void;
    Syncing_Enabled?(): boolean | void;
    Syncing_Authenticating?(): boolean | void;
    Syncing_Authenticated?(): boolean | void;
    Syncing_Any?(): boolean | void;
    Syncing_Synced?(): boolean | void;
    Syncing_TaskListSyncEnabled?(): boolean | void;
    Syncing_GmailEnabled?(): boolean | void;
    Syncing_GmailSyncEnabled?(): boolean | void;
    Syncing_FetchingTaskLists?(): boolean | void;
    Syncing_TaskListsFetched?(): boolean | void;
    Syncing_QueryLabelsSynced?(): boolean | void;
    Syncing_SyncingTaskLists?(): boolean | void;
    Syncing_TaskListsSynced?(): boolean | void;
    Syncing_Dirty?(): boolean | void;
    Syncing_Exception?(): boolean | void;
    Synced_Exception?(): boolean | void;
    Synced_Enabled?(): boolean | void;
    Synced_Authenticating?(): boolean | void;
    Synced_Authenticated?(): boolean | void;
    Synced_Syncing?(): boolean | void;
    Synced_Any?(): boolean | void;
    Synced_TaskListSyncEnabled?(): boolean | void;
    Synced_GmailEnabled?(): boolean | void;
    Synced_GmailSyncEnabled?(): boolean | void;
    Synced_FetchingTaskLists?(): boolean | void;
    Synced_TaskListsFetched?(): boolean | void;
    Synced_QueryLabelsSynced?(): boolean | void;
    Synced_SyncingTaskLists?(): boolean | void;
    Synced_TaskListsSynced?(): boolean | void;
    Synced_Dirty?(): boolean | void;
    Synced_Exception?(): boolean | void;
    TaskListSyncEnabled_Exception?(): boolean | void;
    TaskListSyncEnabled_Enabled?(): boolean | void;
    TaskListSyncEnabled_Authenticating?(): boolean | void;
    TaskListSyncEnabled_Authenticated?(): boolean | void;
    TaskListSyncEnabled_Syncing?(): boolean | void;
    TaskListSyncEnabled_Synced?(): boolean | void;
    TaskListSyncEnabled_Any?(): boolean | void;
    TaskListSyncEnabled_GmailEnabled?(): boolean | void;
    TaskListSyncEnabled_GmailSyncEnabled?(): boolean | void;
    TaskListSyncEnabled_FetchingTaskLists?(): boolean | void;
    TaskListSyncEnabled_TaskListsFetched?(): boolean | void;
    TaskListSyncEnabled_QueryLabelsSynced?(): boolean | void;
    TaskListSyncEnabled_SyncingTaskLists?(): boolean | void;
    TaskListSyncEnabled_TaskListsSynced?(): boolean | void;
    TaskListSyncEnabled_Dirty?(): boolean | void;
    TaskListSyncEnabled_Exception?(): boolean | void;
    GmailEnabled_Exception?(): boolean | void;
    GmailEnabled_Enabled?(): boolean | void;
    GmailEnabled_Authenticating?(): boolean | void;
    GmailEnabled_Authenticated?(): boolean | void;
    GmailEnabled_Syncing?(): boolean | void;
    GmailEnabled_Synced?(): boolean | void;
    GmailEnabled_TaskListSyncEnabled?(): boolean | void;
    GmailEnabled_Any?(): boolean | void;
    GmailEnabled_GmailSyncEnabled?(): boolean | void;
    GmailEnabled_FetchingTaskLists?(): boolean | void;
    GmailEnabled_TaskListsFetched?(): boolean | void;
    GmailEnabled_QueryLabelsSynced?(): boolean | void;
    GmailEnabled_SyncingTaskLists?(): boolean | void;
    GmailEnabled_TaskListsSynced?(): boolean | void;
    GmailEnabled_Dirty?(): boolean | void;
    GmailEnabled_Exception?(): boolean | void;
    GmailSyncEnabled_Exception?(): boolean | void;
    GmailSyncEnabled_Enabled?(): boolean | void;
    GmailSyncEnabled_Authenticating?(): boolean | void;
    GmailSyncEnabled_Authenticated?(): boolean | void;
    GmailSyncEnabled_Syncing?(): boolean | void;
    GmailSyncEnabled_Synced?(): boolean | void;
    GmailSyncEnabled_TaskListSyncEnabled?(): boolean | void;
    GmailSyncEnabled_GmailEnabled?(): boolean | void;
    GmailSyncEnabled_Any?(): boolean | void;
    GmailSyncEnabled_FetchingTaskLists?(): boolean | void;
    GmailSyncEnabled_TaskListsFetched?(): boolean | void;
    GmailSyncEnabled_QueryLabelsSynced?(): boolean | void;
    GmailSyncEnabled_SyncingTaskLists?(): boolean | void;
    GmailSyncEnabled_TaskListsSynced?(): boolean | void;
    GmailSyncEnabled_Dirty?(): boolean | void;
    GmailSyncEnabled_Exception?(): boolean | void;
    FetchingTaskLists_Exception?(): boolean | void;
    FetchingTaskLists_Enabled?(): boolean | void;
    FetchingTaskLists_Authenticating?(): boolean | void;
    FetchingTaskLists_Authenticated?(): boolean | void;
    FetchingTaskLists_Syncing?(): boolean | void;
    FetchingTaskLists_Synced?(): boolean | void;
    FetchingTaskLists_TaskListSyncEnabled?(): boolean | void;
    FetchingTaskLists_GmailEnabled?(): boolean | void;
    FetchingTaskLists_GmailSyncEnabled?(): boolean | void;
    FetchingTaskLists_Any?(): boolean | void;
    FetchingTaskLists_TaskListsFetched?(): boolean | void;
    FetchingTaskLists_QueryLabelsSynced?(): boolean | void;
    FetchingTaskLists_SyncingTaskLists?(): boolean | void;
    FetchingTaskLists_TaskListsSynced?(): boolean | void;
    FetchingTaskLists_Dirty?(): boolean | void;
    FetchingTaskLists_Exception?(): boolean | void;
    TaskListsFetched_Exception?(): boolean | void;
    TaskListsFetched_Enabled?(): boolean | void;
    TaskListsFetched_Authenticating?(): boolean | void;
    TaskListsFetched_Authenticated?(): boolean | void;
    TaskListsFetched_Syncing?(): boolean | void;
    TaskListsFetched_Synced?(): boolean | void;
    TaskListsFetched_TaskListSyncEnabled?(): boolean | void;
    TaskListsFetched_GmailEnabled?(): boolean | void;
    TaskListsFetched_GmailSyncEnabled?(): boolean | void;
    TaskListsFetched_FetchingTaskLists?(): boolean | void;
    TaskListsFetched_Any?(): boolean | void;
    TaskListsFetched_QueryLabelsSynced?(): boolean | void;
    TaskListsFetched_SyncingTaskLists?(): boolean | void;
    TaskListsFetched_TaskListsSynced?(): boolean | void;
    TaskListsFetched_Dirty?(): boolean | void;
    TaskListsFetched_Exception?(): boolean | void;
    QueryLabelsSynced_Exception?(): boolean | void;
    QueryLabelsSynced_Enabled?(): boolean | void;
    QueryLabelsSynced_Authenticating?(): boolean | void;
    QueryLabelsSynced_Authenticated?(): boolean | void;
    QueryLabelsSynced_Syncing?(): boolean | void;
    QueryLabelsSynced_Synced?(): boolean | void;
    QueryLabelsSynced_TaskListSyncEnabled?(): boolean | void;
    QueryLabelsSynced_GmailEnabled?(): boolean | void;
    QueryLabelsSynced_GmailSyncEnabled?(): boolean | void;
    QueryLabelsSynced_FetchingTaskLists?(): boolean | void;
    QueryLabelsSynced_TaskListsFetched?(): boolean | void;
    QueryLabelsSynced_Any?(): boolean | void;
    QueryLabelsSynced_SyncingTaskLists?(): boolean | void;
    QueryLabelsSynced_TaskListsSynced?(): boolean | void;
    QueryLabelsSynced_Dirty?(): boolean | void;
    QueryLabelsSynced_Exception?(): boolean | void;
    SyncingTaskLists_Exception?(): boolean | void;
    SyncingTaskLists_Enabled?(): boolean | void;
    SyncingTaskLists_Authenticating?(): boolean | void;
    SyncingTaskLists_Authenticated?(): boolean | void;
    SyncingTaskLists_Syncing?(): boolean | void;
    SyncingTaskLists_Synced?(): boolean | void;
    SyncingTaskLists_TaskListSyncEnabled?(): boolean | void;
    SyncingTaskLists_GmailEnabled?(): boolean | void;
    SyncingTaskLists_GmailSyncEnabled?(): boolean | void;
    SyncingTaskLists_FetchingTaskLists?(): boolean | void;
    SyncingTaskLists_TaskListsFetched?(): boolean | void;
    SyncingTaskLists_QueryLabelsSynced?(): boolean | void;
    SyncingTaskLists_Any?(): boolean | void;
    SyncingTaskLists_TaskListsSynced?(): boolean | void;
    SyncingTaskLists_Dirty?(): boolean | void;
    SyncingTaskLists_Exception?(): boolean | void;
    TaskListsSynced_Exception?(): boolean | void;
    TaskListsSynced_Enabled?(): boolean | void;
    TaskListsSynced_Authenticating?(): boolean | void;
    TaskListsSynced_Authenticated?(): boolean | void;
    TaskListsSynced_Syncing?(): boolean | void;
    TaskListsSynced_Synced?(): boolean | void;
    TaskListsSynced_TaskListSyncEnabled?(): boolean | void;
    TaskListsSynced_GmailEnabled?(): boolean | void;
    TaskListsSynced_GmailSyncEnabled?(): boolean | void;
    TaskListsSynced_FetchingTaskLists?(): boolean | void;
    TaskListsSynced_TaskListsFetched?(): boolean | void;
    TaskListsSynced_QueryLabelsSynced?(): boolean | void;
    TaskListsSynced_SyncingTaskLists?(): boolean | void;
    TaskListsSynced_Any?(): boolean | void;
    TaskListsSynced_Dirty?(): boolean | void;
    TaskListsSynced_Exception?(): boolean | void;
    Dirty_Exception?(): boolean | void;
    Dirty_Enabled?(): boolean | void;
    Dirty_Authenticating?(): boolean | void;
    Dirty_Authenticated?(): boolean | void;
    Dirty_Syncing?(): boolean | void;
    Dirty_Synced?(): boolean | void;
    Dirty_TaskListSyncEnabled?(): boolean | void;
    Dirty_GmailEnabled?(): boolean | void;
    Dirty_GmailSyncEnabled?(): boolean | void;
    Dirty_FetchingTaskLists?(): boolean | void;
    Dirty_TaskListsFetched?(): boolean | void;
    Dirty_QueryLabelsSynced?(): boolean | void;
    Dirty_SyncingTaskLists?(): boolean | void;
    Dirty_TaskListsSynced?(): boolean | void;
    Dirty_Any?(): boolean | void;
    Dirty_Exception?(): boolean | void;
    Exception_Enabled?(): boolean | void;
    Exception_Authenticating?(): boolean | void;
    Exception_Authenticated?(): boolean | void;
    Exception_Syncing?(): boolean | void;
    Exception_Synced?(): boolean | void;
    Exception_TaskListSyncEnabled?(): boolean | void;
    Exception_GmailEnabled?(): boolean | void;
    Exception_GmailSyncEnabled?(): boolean | void;
    Exception_FetchingTaskLists?(): boolean | void;
    Exception_TaskListsFetched?(): boolean | void;
    Exception_QueryLabelsSynced?(): boolean | void;
    Exception_SyncingTaskLists?(): boolean | void;
    Exception_TaskListsSynced?(): boolean | void;
    Exception_Dirty?(): boolean | void;

}

/**
 * All the state names.
 */
export type TStates = 'Enabled'
  | 'Authenticating'
  | 'Authenticated'
  | 'Syncing'
  | 'Synced'
  | 'TaskListSyncEnabled'
  | 'GmailEnabled'
  | 'GmailSyncEnabled'
  | 'FetchingTaskLists'
  | 'TaskListsFetched'
  | 'QueryLabelsSynced'
  | 'SyncingTaskLists'
  | 'TaskListsSynced'
  | 'Dirty';

/**
 * All the transition names.
 */
export type TTransitions = 'Exception_Enabled'
  | 'Exception_Authenticating'
  | 'Exception_Authenticated'
  | 'Exception_Syncing'
  | 'Exception_Synced'
  | 'Exception_TaskListSyncEnabled'
  | 'Exception_GmailEnabled'
  | 'Exception_GmailSyncEnabled'
  | 'Exception_FetchingTaskLists'
  | 'Exception_TaskListsFetched'
  | 'Exception_QueryLabelsSynced'
  | 'Exception_SyncingTaskLists'
  | 'Exception_TaskListsSynced'
  | 'Exception_Dirty'
  | 'Enabled_Exception'
  | 'Enabled_Any'
  | 'Enabled_Authenticating'
  | 'Enabled_Authenticated'
  | 'Enabled_Syncing'
  | 'Enabled_Synced'
  | 'Enabled_TaskListSyncEnabled'
  | 'Enabled_GmailEnabled'
  | 'Enabled_GmailSyncEnabled'
  | 'Enabled_FetchingTaskLists'
  | 'Enabled_TaskListsFetched'
  | 'Enabled_QueryLabelsSynced'
  | 'Enabled_SyncingTaskLists'
  | 'Enabled_TaskListsSynced'
  | 'Enabled_Dirty'
  | 'Enabled_Exception'
  | 'Authenticating_Exception'
  | 'Authenticating_Enabled'
  | 'Authenticating_Any'
  | 'Authenticating_Authenticated'
  | 'Authenticating_Syncing'
  | 'Authenticating_Synced'
  | 'Authenticating_TaskListSyncEnabled'
  | 'Authenticating_GmailEnabled'
  | 'Authenticating_GmailSyncEnabled'
  | 'Authenticating_FetchingTaskLists'
  | 'Authenticating_TaskListsFetched'
  | 'Authenticating_QueryLabelsSynced'
  | 'Authenticating_SyncingTaskLists'
  | 'Authenticating_TaskListsSynced'
  | 'Authenticating_Dirty'
  | 'Authenticating_Exception'
  | 'Authenticated_Exception'
  | 'Authenticated_Enabled'
  | 'Authenticated_Authenticating'
  | 'Authenticated_Any'
  | 'Authenticated_Syncing'
  | 'Authenticated_Synced'
  | 'Authenticated_TaskListSyncEnabled'
  | 'Authenticated_GmailEnabled'
  | 'Authenticated_GmailSyncEnabled'
  | 'Authenticated_FetchingTaskLists'
  | 'Authenticated_TaskListsFetched'
  | 'Authenticated_QueryLabelsSynced'
  | 'Authenticated_SyncingTaskLists'
  | 'Authenticated_TaskListsSynced'
  | 'Authenticated_Dirty'
  | 'Authenticated_Exception'
  | 'Syncing_Exception'
  | 'Syncing_Enabled'
  | 'Syncing_Authenticating'
  | 'Syncing_Authenticated'
  | 'Syncing_Any'
  | 'Syncing_Synced'
  | 'Syncing_TaskListSyncEnabled'
  | 'Syncing_GmailEnabled'
  | 'Syncing_GmailSyncEnabled'
  | 'Syncing_FetchingTaskLists'
  | 'Syncing_TaskListsFetched'
  | 'Syncing_QueryLabelsSynced'
  | 'Syncing_SyncingTaskLists'
  | 'Syncing_TaskListsSynced'
  | 'Syncing_Dirty'
  | 'Syncing_Exception'
  | 'Synced_Exception'
  | 'Synced_Enabled'
  | 'Synced_Authenticating'
  | 'Synced_Authenticated'
  | 'Synced_Syncing'
  | 'Synced_Any'
  | 'Synced_TaskListSyncEnabled'
  | 'Synced_GmailEnabled'
  | 'Synced_GmailSyncEnabled'
  | 'Synced_FetchingTaskLists'
  | 'Synced_TaskListsFetched'
  | 'Synced_QueryLabelsSynced'
  | 'Synced_SyncingTaskLists'
  | 'Synced_TaskListsSynced'
  | 'Synced_Dirty'
  | 'Synced_Exception'
  | 'TaskListSyncEnabled_Exception'
  | 'TaskListSyncEnabled_Enabled'
  | 'TaskListSyncEnabled_Authenticating'
  | 'TaskListSyncEnabled_Authenticated'
  | 'TaskListSyncEnabled_Syncing'
  | 'TaskListSyncEnabled_Synced'
  | 'TaskListSyncEnabled_Any'
  | 'TaskListSyncEnabled_GmailEnabled'
  | 'TaskListSyncEnabled_GmailSyncEnabled'
  | 'TaskListSyncEnabled_FetchingTaskLists'
  | 'TaskListSyncEnabled_TaskListsFetched'
  | 'TaskListSyncEnabled_QueryLabelsSynced'
  | 'TaskListSyncEnabled_SyncingTaskLists'
  | 'TaskListSyncEnabled_TaskListsSynced'
  | 'TaskListSyncEnabled_Dirty'
  | 'TaskListSyncEnabled_Exception'
  | 'GmailEnabled_Exception'
  | 'GmailEnabled_Enabled'
  | 'GmailEnabled_Authenticating'
  | 'GmailEnabled_Authenticated'
  | 'GmailEnabled_Syncing'
  | 'GmailEnabled_Synced'
  | 'GmailEnabled_TaskListSyncEnabled'
  | 'GmailEnabled_Any'
  | 'GmailEnabled_GmailSyncEnabled'
  | 'GmailEnabled_FetchingTaskLists'
  | 'GmailEnabled_TaskListsFetched'
  | 'GmailEnabled_QueryLabelsSynced'
  | 'GmailEnabled_SyncingTaskLists'
  | 'GmailEnabled_TaskListsSynced'
  | 'GmailEnabled_Dirty'
  | 'GmailEnabled_Exception'
  | 'GmailSyncEnabled_Exception'
  | 'GmailSyncEnabled_Enabled'
  | 'GmailSyncEnabled_Authenticating'
  | 'GmailSyncEnabled_Authenticated'
  | 'GmailSyncEnabled_Syncing'
  | 'GmailSyncEnabled_Synced'
  | 'GmailSyncEnabled_TaskListSyncEnabled'
  | 'GmailSyncEnabled_GmailEnabled'
  | 'GmailSyncEnabled_Any'
  | 'GmailSyncEnabled_FetchingTaskLists'
  | 'GmailSyncEnabled_TaskListsFetched'
  | 'GmailSyncEnabled_QueryLabelsSynced'
  | 'GmailSyncEnabled_SyncingTaskLists'
  | 'GmailSyncEnabled_TaskListsSynced'
  | 'GmailSyncEnabled_Dirty'
  | 'GmailSyncEnabled_Exception'
  | 'FetchingTaskLists_Exception'
  | 'FetchingTaskLists_Enabled'
  | 'FetchingTaskLists_Authenticating'
  | 'FetchingTaskLists_Authenticated'
  | 'FetchingTaskLists_Syncing'
  | 'FetchingTaskLists_Synced'
  | 'FetchingTaskLists_TaskListSyncEnabled'
  | 'FetchingTaskLists_GmailEnabled'
  | 'FetchingTaskLists_GmailSyncEnabled'
  | 'FetchingTaskLists_Any'
  | 'FetchingTaskLists_TaskListsFetched'
  | 'FetchingTaskLists_QueryLabelsSynced'
  | 'FetchingTaskLists_SyncingTaskLists'
  | 'FetchingTaskLists_TaskListsSynced'
  | 'FetchingTaskLists_Dirty'
  | 'FetchingTaskLists_Exception'
  | 'TaskListsFetched_Exception'
  | 'TaskListsFetched_Enabled'
  | 'TaskListsFetched_Authenticating'
  | 'TaskListsFetched_Authenticated'
  | 'TaskListsFetched_Syncing'
  | 'TaskListsFetched_Synced'
  | 'TaskListsFetched_TaskListSyncEnabled'
  | 'TaskListsFetched_GmailEnabled'
  | 'TaskListsFetched_GmailSyncEnabled'
  | 'TaskListsFetched_FetchingTaskLists'
  | 'TaskListsFetched_Any'
  | 'TaskListsFetched_QueryLabelsSynced'
  | 'TaskListsFetched_SyncingTaskLists'
  | 'TaskListsFetched_TaskListsSynced'
  | 'TaskListsFetched_Dirty'
  | 'TaskListsFetched_Exception'
  | 'QueryLabelsSynced_Exception'
  | 'QueryLabelsSynced_Enabled'
  | 'QueryLabelsSynced_Authenticating'
  | 'QueryLabelsSynced_Authenticated'
  | 'QueryLabelsSynced_Syncing'
  | 'QueryLabelsSynced_Synced'
  | 'QueryLabelsSynced_TaskListSyncEnabled'
  | 'QueryLabelsSynced_GmailEnabled'
  | 'QueryLabelsSynced_GmailSyncEnabled'
  | 'QueryLabelsSynced_FetchingTaskLists'
  | 'QueryLabelsSynced_TaskListsFetched'
  | 'QueryLabelsSynced_Any'
  | 'QueryLabelsSynced_SyncingTaskLists'
  | 'QueryLabelsSynced_TaskListsSynced'
  | 'QueryLabelsSynced_Dirty'
  | 'QueryLabelsSynced_Exception'
  | 'SyncingTaskLists_Exception'
  | 'SyncingTaskLists_Enabled'
  | 'SyncingTaskLists_Authenticating'
  | 'SyncingTaskLists_Authenticated'
  | 'SyncingTaskLists_Syncing'
  | 'SyncingTaskLists_Synced'
  | 'SyncingTaskLists_TaskListSyncEnabled'
  | 'SyncingTaskLists_GmailEnabled'
  | 'SyncingTaskLists_GmailSyncEnabled'
  | 'SyncingTaskLists_FetchingTaskLists'
  | 'SyncingTaskLists_TaskListsFetched'
  | 'SyncingTaskLists_QueryLabelsSynced'
  | 'SyncingTaskLists_Any'
  | 'SyncingTaskLists_TaskListsSynced'
  | 'SyncingTaskLists_Dirty'
  | 'SyncingTaskLists_Exception'
  | 'TaskListsSynced_Exception'
  | 'TaskListsSynced_Enabled'
  | 'TaskListsSynced_Authenticating'
  | 'TaskListsSynced_Authenticated'
  | 'TaskListsSynced_Syncing'
  | 'TaskListsSynced_Synced'
  | 'TaskListsSynced_TaskListSyncEnabled'
  | 'TaskListsSynced_GmailEnabled'
  | 'TaskListsSynced_GmailSyncEnabled'
  | 'TaskListsSynced_FetchingTaskLists'
  | 'TaskListsSynced_TaskListsFetched'
  | 'TaskListsSynced_QueryLabelsSynced'
  | 'TaskListsSynced_SyncingTaskLists'
  | 'TaskListsSynced_Any'
  | 'TaskListsSynced_Dirty'
  | 'TaskListsSynced_Exception'
  | 'Dirty_Exception'
  | 'Dirty_Enabled'
  | 'Dirty_Authenticating'
  | 'Dirty_Authenticated'
  | 'Dirty_Syncing'
  | 'Dirty_Synced'
  | 'Dirty_TaskListSyncEnabled'
  | 'Dirty_GmailEnabled'
  | 'Dirty_GmailSyncEnabled'
  | 'Dirty_FetchingTaskLists'
  | 'Dirty_TaskListsFetched'
  | 'Dirty_QueryLabelsSynced'
  | 'Dirty_SyncingTaskLists'
  | 'Dirty_TaskListsSynced'
  | 'Dirty_Any'
  | 'Dirty_Exception'
  | 'Exception_Enabled'
  | 'Exception_Authenticating'
  | 'Exception_Authenticated'
  | 'Exception_Syncing'
  | 'Exception_Synced'
  | 'Exception_TaskListSyncEnabled'
  | 'Exception_GmailEnabled'
  | 'Exception_GmailSyncEnabled'
  | 'Exception_FetchingTaskLists'
  | 'Exception_TaskListsFetched'
  | 'Exception_QueryLabelsSynced'
  | 'Exception_SyncingTaskLists'
  | 'Exception_TaskListsSynced'
  | 'Exception_Dirty';

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
    (event: 'Enabled_exit', listener: () => boolean | undefined, context?: Object): this;
    (event: 'Enabled_end', listener: () => any, context?: Object): this;
    (event: 'Authenticating_exit', listener: () => boolean | undefined, context?: Object): this;
    (event: 'Authenticating_end', listener: () => any, context?: Object): this;
    (event: 'Authenticated_exit', listener: () => boolean | undefined, context?: Object): this;
    (event: 'Authenticated_end', listener: () => any, context?: Object): this;
    (event: 'Syncing_exit', listener: () => boolean | undefined, context?: Object): this;
    (event: 'Syncing_end', listener: () => any, context?: Object): this;
    (event: 'Synced_exit', listener: () => boolean | undefined, context?: Object): this;
    (event: 'Synced_end', listener: () => any, context?: Object): this;
    (event: 'TaskListSyncEnabled_exit', listener: () => boolean | undefined, context?: Object): this;
    (event: 'TaskListSyncEnabled_end', listener: () => any, context?: Object): this;
    (event: 'GmailEnabled_exit', listener: () => boolean | undefined, context?: Object): this;
    (event: 'GmailEnabled_end', listener: () => any, context?: Object): this;
    (event: 'GmailSyncEnabled_exit', listener: () => boolean | undefined, context?: Object): this;
    (event: 'GmailSyncEnabled_end', listener: () => any, context?: Object): this;
    (event: 'FetchingTaskLists_exit', listener: () => boolean | undefined, context?: Object): this;
    (event: 'FetchingTaskLists_end', listener: () => any, context?: Object): this;
    (event: 'TaskListsFetched_exit', listener: () => boolean | undefined, context?: Object): this;
    (event: 'TaskListsFetched_end', listener: () => any, context?: Object): this;
    (event: 'QueryLabelsSynced_exit', listener: () => boolean | undefined, context?: Object): this;
    (event: 'QueryLabelsSynced_end', listener: () => any, context?: Object): this;
    (event: 'SyncingTaskLists_exit', listener: () => boolean | undefined, context?: Object): this;
    (event: 'SyncingTaskLists_end', listener: () => any, context?: Object): this;
    (event: 'TaskListsSynced_exit', listener: () => boolean | undefined, context?: Object): this;
    (event: 'TaskListsSynced_end', listener: () => any, context?: Object): this;
    (event: 'Dirty_exit', listener: () => boolean | undefined, context?: Object): this;
    (event: 'Dirty_end', listener: () => any, context?: Object): this;

    // Transitions
    (event: TTransitions): this;
}

export interface IEmit {
    // Non-params events
    (event: 'Enabled_exit'): boolean | void;
    (event: 'Enabled_end'): boolean | void;
    (event: 'Authenticating_exit'): boolean | void;
    (event: 'Authenticating_end'): boolean | void;
    (event: 'Authenticated_exit'): boolean | void;
    (event: 'Authenticated_end'): boolean | void;
    (event: 'Syncing_exit'): boolean | void;
    (event: 'Syncing_end'): boolean | void;
    (event: 'Synced_exit'): boolean | void;
    (event: 'Synced_end'): boolean | void;
    (event: 'TaskListSyncEnabled_exit'): boolean | void;
    (event: 'TaskListSyncEnabled_end'): boolean | void;
    (event: 'GmailEnabled_exit'): boolean | void;
    (event: 'GmailEnabled_end'): boolean | void;
    (event: 'GmailSyncEnabled_exit'): boolean | void;
    (event: 'GmailSyncEnabled_end'): boolean | void;
    (event: 'FetchingTaskLists_exit'): boolean | void;
    (event: 'FetchingTaskLists_end'): boolean | void;
    (event: 'TaskListsFetched_exit'): boolean | void;
    (event: 'TaskListsFetched_end'): boolean | void;
    (event: 'QueryLabelsSynced_exit'): boolean | void;
    (event: 'QueryLabelsSynced_end'): boolean | void;
    (event: 'SyncingTaskLists_exit'): boolean | void;
    (event: 'SyncingTaskLists_end'): boolean | void;
    (event: 'TaskListsSynced_exit'): boolean | void;
    (event: 'TaskListsSynced_end'): boolean | void;
    (event: 'Dirty_exit'): boolean | void;
    (event: 'Dirty_end'): boolean | void;

    // Transitions
    (event: TTransitions): boolean | void;
}
