
import { IState as IStateBase } from 'asyncmachine/src/types'


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

export interface IEmit {

    // Enabled
    (event: 'Enabled_enter' /*, param1, param2 */): this;
    (event: 'Enabled_state' /*, param1, param2 */): this;
    // Authenticating
    (event: 'Authenticating_enter' /*, param1, param2 */): this;
    (event: 'Authenticating_state' /*, param1, param2 */): this;
    // Authenticated
    (event: 'Authenticated_enter' /*, param1, param2 */): this;
    (event: 'Authenticated_state' /*, param1, param2 */): this;
    // Syncing
    (event: 'Syncing_enter' /*, param1, param2 */): this;
    (event: 'Syncing_state' /*, param1, param2 */): this;
    // Synced
    (event: 'Synced_enter' /*, param1, param2 */): this;
    (event: 'Synced_state' /*, param1, param2 */): this;
    // TaskListSyncEnabled
    (event: 'TaskListSyncEnabled_enter' /*, param1, param2 */): this;
    (event: 'TaskListSyncEnabled_state' /*, param1, param2 */): this;
    // GmailEnabled
    (event: 'GmailEnabled_enter' /*, param1, param2 */): this;
    (event: 'GmailEnabled_state' /*, param1, param2 */): this;
    // GmailSyncEnabled
    (event: 'GmailSyncEnabled_enter' /*, param1, param2 */): this;
    (event: 'GmailSyncEnabled_state' /*, param1, param2 */): this;
    // FetchingTaskLists
    (event: 'FetchingTaskLists_enter' /*, param1, param2 */): this;
    (event: 'FetchingTaskLists_state' /*, param1, param2 */): this;
    // TaskListsFetched
    (event: 'TaskListsFetched_enter' /*, param1, param2 */): this;
    (event: 'TaskListsFetched_state' /*, param1, param2 */): this;
    // QueryLabelsSynced
    (event: 'QueryLabelsSynced_enter' /*, param1, param2 */): this;
    (event: 'QueryLabelsSynced_state' /*, param1, param2 */): this;
    // SyncingTaskLists
    (event: 'SyncingTaskLists_enter' /*, param1, param2 */): this;
    (event: 'SyncingTaskLists_state' /*, param1, param2 */): this;
    // TaskListsSynced
    (event: 'TaskListsSynced_enter' /*, param1, param2 */): this;
    (event: 'TaskListsSynced_state' /*, param1, param2 */): this;
    // Dirty
    (event: 'Dirty_enter' /*, param1, param2 */): this;
    (event: 'Dirty_state' /*, param1, param2 */): this;

}

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

// For this implementation
export interface IState extends IStateBase<TStates> {}

// For sub classes
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
    (event: 'Enabled_exit'): this;
    (event: 'Enabled_end'): this;
    (event: 'Authenticating_exit'): this;
    (event: 'Authenticating_end'): this;
    (event: 'Authenticated_exit'): this;
    (event: 'Authenticated_end'): this;
    (event: 'Syncing_exit'): this;
    (event: 'Syncing_end'): this;
    (event: 'Synced_exit'): this;
    (event: 'Synced_end'): this;
    (event: 'TaskListSyncEnabled_exit'): this;
    (event: 'TaskListSyncEnabled_end'): this;
    (event: 'GmailEnabled_exit'): this;
    (event: 'GmailEnabled_end'): this;
    (event: 'GmailSyncEnabled_exit'): this;
    (event: 'GmailSyncEnabled_end'): this;
    (event: 'FetchingTaskLists_exit'): this;
    (event: 'FetchingTaskLists_end'): this;
    (event: 'TaskListsFetched_exit'): this;
    (event: 'TaskListsFetched_end'): this;
    (event: 'QueryLabelsSynced_exit'): this;
    (event: 'QueryLabelsSynced_end'): this;
    (event: 'SyncingTaskLists_exit'): this;
    (event: 'SyncingTaskLists_end'): this;
    (event: 'TaskListsSynced_exit'): this;
    (event: 'TaskListsSynced_end'): this;
    (event: 'Dirty_exit'): this;
    (event: 'Dirty_end'): this;

    // Transitions
    (event: TTransitions): boolean;
}
