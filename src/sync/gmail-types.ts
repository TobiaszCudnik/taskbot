
import { IState as IStateBase } from 'asyncmachine/src/types'


export interface IBind {

    // Enabled
    (event: 'Enabled_enter', listener: (/* param1, param2 */) => boolean | undefined, context?: Object): this;
    (event: 'Enabled_state', listener: (/* param1, param2 */) => any, context?: Object): this;
    // SyncingEnabled
    (event: 'SyncingEnabled_enter', listener: (/* param1, param2 */) => boolean | undefined, context?: Object): this;
    (event: 'SyncingEnabled_state', listener: (/* param1, param2 */) => any, context?: Object): this;
    // Dirty
    (event: 'Dirty_enter', listener: (/* param1, param2 */) => boolean | undefined, context?: Object): this;
    (event: 'Dirty_state', listener: (/* param1, param2 */) => any, context?: Object): this;
    // SyncingQueryLabels
    (event: 'SyncingQueryLabels_enter', listener: (/* param1, param2 */) => boolean | undefined, context?: Object): this;
    (event: 'SyncingQueryLabels_state', listener: (/* param1, param2 */) => any, context?: Object): this;
    // QueryLabelsSynced
    (event: 'QueryLabelsSynced_enter', listener: (/* param1, param2 */) => boolean | undefined, context?: Object): this;
    (event: 'QueryLabelsSynced_state', listener: (/* param1, param2 */) => any, context?: Object): this;
    // FetchingLabels
    (event: 'FetchingLabels_enter', listener: (/* param1, param2 */) => boolean | undefined, context?: Object): this;
    (event: 'FetchingLabels_state', listener: (/* param1, param2 */) => any, context?: Object): this;
    // LabelsFetched
    (event: 'LabelsFetched_enter', listener: (/* param1, param2 */) => boolean | undefined, context?: Object): this;
    (event: 'LabelsFetched_state', listener: (/* param1, param2 */) => any, context?: Object): this;
    // FetchingHistoryId
    (event: 'FetchingHistoryId_enter', listener: (/* param1, param2 */) => boolean | undefined, context?: Object): this;
    (event: 'FetchingHistoryId_state', listener: (/* param1, param2 */) => any, context?: Object): this;
    // HistoryIdFetched
    (event: 'HistoryIdFetched_enter', listener: (/* param1, param2 */) => boolean | undefined, context?: Object): this;
    (event: 'HistoryIdFetched_state', listener: (/* param1, param2 */) => any, context?: Object): this;

}

export interface IEmit {

    // Enabled
    (event: 'Enabled_enter' /*, param1, param2 */): this;
    (event: 'Enabled_state' /*, param1, param2 */): this;
    // SyncingEnabled
    (event: 'SyncingEnabled_enter' /*, param1, param2 */): this;
    (event: 'SyncingEnabled_state' /*, param1, param2 */): this;
    // Dirty
    (event: 'Dirty_enter' /*, param1, param2 */): this;
    (event: 'Dirty_state' /*, param1, param2 */): this;
    // SyncingQueryLabels
    (event: 'SyncingQueryLabels_enter' /*, param1, param2 */): this;
    (event: 'SyncingQueryLabels_state' /*, param1, param2 */): this;
    // QueryLabelsSynced
    (event: 'QueryLabelsSynced_enter' /*, param1, param2 */): this;
    (event: 'QueryLabelsSynced_state' /*, param1, param2 */): this;
    // FetchingLabels
    (event: 'FetchingLabels_enter' /*, param1, param2 */): this;
    (event: 'FetchingLabels_state' /*, param1, param2 */): this;
    // LabelsFetched
    (event: 'LabelsFetched_enter' /*, param1, param2 */): this;
    (event: 'LabelsFetched_state' /*, param1, param2 */): this;
    // FetchingHistoryId
    (event: 'FetchingHistoryId_enter' /*, param1, param2 */): this;
    (event: 'FetchingHistoryId_state' /*, param1, param2 */): this;
    // HistoryIdFetched
    (event: 'HistoryIdFetched_enter' /*, param1, param2 */): this;
    (event: 'HistoryIdFetched_state' /*, param1, param2 */): this;

}

export type TStates = 'Enabled'
  | 'SyncingEnabled'
  | 'Dirty'
  | 'SyncingQueryLabels'
  | 'QueryLabelsSynced'
  | 'FetchingLabels'
  | 'LabelsFetched'
  | 'FetchingHistoryId'
  | 'HistoryIdFetched';

export type TTransitions = 'Exception_Enabled'
  | 'Exception_SyncingEnabled'
  | 'Exception_Dirty'
  | 'Exception_SyncingQueryLabels'
  | 'Exception_QueryLabelsSynced'
  | 'Exception_FetchingLabels'
  | 'Exception_LabelsFetched'
  | 'Exception_FetchingHistoryId'
  | 'Exception_HistoryIdFetched'
  | 'Enabled_Exception'
  | 'Enabled_Any'
  | 'Enabled_SyncingEnabled'
  | 'Enabled_Dirty'
  | 'Enabled_SyncingQueryLabels'
  | 'Enabled_QueryLabelsSynced'
  | 'Enabled_FetchingLabels'
  | 'Enabled_LabelsFetched'
  | 'Enabled_FetchingHistoryId'
  | 'Enabled_HistoryIdFetched'
  | 'Enabled_Exception'
  | 'SyncingEnabled_Exception'
  | 'SyncingEnabled_Enabled'
  | 'SyncingEnabled_Any'
  | 'SyncingEnabled_Dirty'
  | 'SyncingEnabled_SyncingQueryLabels'
  | 'SyncingEnabled_QueryLabelsSynced'
  | 'SyncingEnabled_FetchingLabels'
  | 'SyncingEnabled_LabelsFetched'
  | 'SyncingEnabled_FetchingHistoryId'
  | 'SyncingEnabled_HistoryIdFetched'
  | 'SyncingEnabled_Exception'
  | 'Dirty_Exception'
  | 'Dirty_Enabled'
  | 'Dirty_SyncingEnabled'
  | 'Dirty_Any'
  | 'Dirty_SyncingQueryLabels'
  | 'Dirty_QueryLabelsSynced'
  | 'Dirty_FetchingLabels'
  | 'Dirty_LabelsFetched'
  | 'Dirty_FetchingHistoryId'
  | 'Dirty_HistoryIdFetched'
  | 'Dirty_Exception'
  | 'SyncingQueryLabels_Exception'
  | 'SyncingQueryLabels_Enabled'
  | 'SyncingQueryLabels_SyncingEnabled'
  | 'SyncingQueryLabels_Dirty'
  | 'SyncingQueryLabels_Any'
  | 'SyncingQueryLabels_QueryLabelsSynced'
  | 'SyncingQueryLabels_FetchingLabels'
  | 'SyncingQueryLabels_LabelsFetched'
  | 'SyncingQueryLabels_FetchingHistoryId'
  | 'SyncingQueryLabels_HistoryIdFetched'
  | 'SyncingQueryLabels_Exception'
  | 'QueryLabelsSynced_Exception'
  | 'QueryLabelsSynced_Enabled'
  | 'QueryLabelsSynced_SyncingEnabled'
  | 'QueryLabelsSynced_Dirty'
  | 'QueryLabelsSynced_SyncingQueryLabels'
  | 'QueryLabelsSynced_Any'
  | 'QueryLabelsSynced_FetchingLabels'
  | 'QueryLabelsSynced_LabelsFetched'
  | 'QueryLabelsSynced_FetchingHistoryId'
  | 'QueryLabelsSynced_HistoryIdFetched'
  | 'QueryLabelsSynced_Exception'
  | 'FetchingLabels_Exception'
  | 'FetchingLabels_Enabled'
  | 'FetchingLabels_SyncingEnabled'
  | 'FetchingLabels_Dirty'
  | 'FetchingLabels_SyncingQueryLabels'
  | 'FetchingLabels_QueryLabelsSynced'
  | 'FetchingLabels_Any'
  | 'FetchingLabels_LabelsFetched'
  | 'FetchingLabels_FetchingHistoryId'
  | 'FetchingLabels_HistoryIdFetched'
  | 'FetchingLabels_Exception'
  | 'LabelsFetched_Exception'
  | 'LabelsFetched_Enabled'
  | 'LabelsFetched_SyncingEnabled'
  | 'LabelsFetched_Dirty'
  | 'LabelsFetched_SyncingQueryLabels'
  | 'LabelsFetched_QueryLabelsSynced'
  | 'LabelsFetched_FetchingLabels'
  | 'LabelsFetched_Any'
  | 'LabelsFetched_FetchingHistoryId'
  | 'LabelsFetched_HistoryIdFetched'
  | 'LabelsFetched_Exception'
  | 'FetchingHistoryId_Exception'
  | 'FetchingHistoryId_Enabled'
  | 'FetchingHistoryId_SyncingEnabled'
  | 'FetchingHistoryId_Dirty'
  | 'FetchingHistoryId_SyncingQueryLabels'
  | 'FetchingHistoryId_QueryLabelsSynced'
  | 'FetchingHistoryId_FetchingLabels'
  | 'FetchingHistoryId_LabelsFetched'
  | 'FetchingHistoryId_Any'
  | 'FetchingHistoryId_HistoryIdFetched'
  | 'FetchingHistoryId_Exception'
  | 'HistoryIdFetched_Exception'
  | 'HistoryIdFetched_Enabled'
  | 'HistoryIdFetched_SyncingEnabled'
  | 'HistoryIdFetched_Dirty'
  | 'HistoryIdFetched_SyncingQueryLabels'
  | 'HistoryIdFetched_QueryLabelsSynced'
  | 'HistoryIdFetched_FetchingLabels'
  | 'HistoryIdFetched_LabelsFetched'
  | 'HistoryIdFetched_FetchingHistoryId'
  | 'HistoryIdFetched_Any'
  | 'HistoryIdFetched_Exception'
  | 'Exception_Enabled'
  | 'Exception_SyncingEnabled'
  | 'Exception_Dirty'
  | 'Exception_SyncingQueryLabels'
  | 'Exception_QueryLabelsSynced'
  | 'Exception_FetchingLabels'
  | 'Exception_LabelsFetched'
  | 'Exception_FetchingHistoryId'
  | 'Exception_HistoryIdFetched';

// For this implementation
export interface IState extends IStateBase<TStates> {}

// For sub classes
export interface IStateExt<T extends string> extends IStateBase<T | TStates> {}

export interface IBind {

    // Non-params events
    (event: 'Enabled_exit', listener: () => boolean | undefined, context?: Object): this;
    (event: 'Enabled_end', listener: () => any, context?: Object): this;
    (event: 'SyncingEnabled_exit', listener: () => boolean | undefined, context?: Object): this;
    (event: 'SyncingEnabled_end', listener: () => any, context?: Object): this;
    (event: 'Dirty_exit', listener: () => boolean | undefined, context?: Object): this;
    (event: 'Dirty_end', listener: () => any, context?: Object): this;
    (event: 'SyncingQueryLabels_exit', listener: () => boolean | undefined, context?: Object): this;
    (event: 'SyncingQueryLabels_end', listener: () => any, context?: Object): this;
    (event: 'QueryLabelsSynced_exit', listener: () => boolean | undefined, context?: Object): this;
    (event: 'QueryLabelsSynced_end', listener: () => any, context?: Object): this;
    (event: 'FetchingLabels_exit', listener: () => boolean | undefined, context?: Object): this;
    (event: 'FetchingLabels_end', listener: () => any, context?: Object): this;
    (event: 'LabelsFetched_exit', listener: () => boolean | undefined, context?: Object): this;
    (event: 'LabelsFetched_end', listener: () => any, context?: Object): this;
    (event: 'FetchingHistoryId_exit', listener: () => boolean | undefined, context?: Object): this;
    (event: 'FetchingHistoryId_end', listener: () => any, context?: Object): this;
    (event: 'HistoryIdFetched_exit', listener: () => boolean | undefined, context?: Object): this;
    (event: 'HistoryIdFetched_end', listener: () => any, context?: Object): this;

    // Transitions
    (event: TTransitions): this;
}

export interface IEmit {
    // Non-params events
    (event: 'Enabled_exit'): this;
    (event: 'Enabled_end'): this;
    (event: 'SyncingEnabled_exit'): this;
    (event: 'SyncingEnabled_end'): this;
    (event: 'Dirty_exit'): this;
    (event: 'Dirty_end'): this;
    (event: 'SyncingQueryLabels_exit'): this;
    (event: 'SyncingQueryLabels_end'): this;
    (event: 'QueryLabelsSynced_exit'): this;
    (event: 'QueryLabelsSynced_end'): this;
    (event: 'FetchingLabels_exit'): this;
    (event: 'FetchingLabels_end'): this;
    (event: 'LabelsFetched_exit'): this;
    (event: 'LabelsFetched_end'): this;
    (event: 'FetchingHistoryId_exit'): this;
    (event: 'FetchingHistoryId_end'): this;
    (event: 'HistoryIdFetched_exit'): this;
    (event: 'HistoryIdFetched_end'): this;

    // Transitions
    (event: TTransitions): boolean;
}
