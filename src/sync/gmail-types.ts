
import { IState as IStateBase } from 'asyncmachine/src/types'


/**
 * Signatures for EventEmitter to bind to transitions.
 */
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

/**
 * Signatures for EventEmitter to emit transitions.
 */
export interface IEmit {

    // Enabled
    (event: 'Enabled_enter' /*, param1, param2 */): boolean | void;
    (event: 'Enabled_state' /*, param1, param2 */): boolean | void;
    // SyncingEnabled
    (event: 'SyncingEnabled_enter' /*, param1, param2 */): boolean | void;
    (event: 'SyncingEnabled_state' /*, param1, param2 */): boolean | void;
    // Dirty
    (event: 'Dirty_enter' /*, param1, param2 */): boolean | void;
    (event: 'Dirty_state' /*, param1, param2 */): boolean | void;
    // SyncingQueryLabels
    (event: 'SyncingQueryLabels_enter' /*, param1, param2 */): boolean | void;
    (event: 'SyncingQueryLabels_state' /*, param1, param2 */): boolean | void;
    // QueryLabelsSynced
    (event: 'QueryLabelsSynced_enter' /*, param1, param2 */): boolean | void;
    (event: 'QueryLabelsSynced_state' /*, param1, param2 */): boolean | void;
    // FetchingLabels
    (event: 'FetchingLabels_enter' /*, param1, param2 */): boolean | void;
    (event: 'FetchingLabels_state' /*, param1, param2 */): boolean | void;
    // LabelsFetched
    (event: 'LabelsFetched_enter' /*, param1, param2 */): boolean | void;
    (event: 'LabelsFetched_state' /*, param1, param2 */): boolean | void;
    // FetchingHistoryId
    (event: 'FetchingHistoryId_enter' /*, param1, param2 */): boolean | void;
    (event: 'FetchingHistoryId_state' /*, param1, param2 */): boolean | void;
    // HistoryIdFetched
    (event: 'HistoryIdFetched_enter' /*, param1, param2 */): boolean | void;
    (event: 'HistoryIdFetched_state' /*, param1, param2 */): boolean | void;

}

/**
 * All the possible transition methods machine can define.
 */
export interface ITransitions {

    // Enabled
    Enabled_enter?(/*param1, param2 */): boolean | void;
    Enabled_state?(/*param1, param2 */): boolean | void | Promise;
    // SyncingEnabled
    SyncingEnabled_enter?(/*param1, param2 */): boolean | void;
    SyncingEnabled_state?(/*param1, param2 */): boolean | void | Promise;
    // Dirty
    Dirty_enter?(/*param1, param2 */): boolean | void;
    Dirty_state?(/*param1, param2 */): boolean | void | Promise;
    // SyncingQueryLabels
    SyncingQueryLabels_enter?(/*param1, param2 */): boolean | void;
    SyncingQueryLabels_state?(/*param1, param2 */): boolean | void | Promise;
    // QueryLabelsSynced
    QueryLabelsSynced_enter?(/*param1, param2 */): boolean | void;
    QueryLabelsSynced_state?(/*param1, param2 */): boolean | void | Promise;
    // FetchingLabels
    FetchingLabels_enter?(/*param1, param2 */): boolean | void;
    FetchingLabels_state?(/*param1, param2 */): boolean | void | Promise;
    // LabelsFetched
    LabelsFetched_enter?(/*param1, param2 */): boolean | void;
    LabelsFetched_state?(/*param1, param2 */): boolean | void | Promise;
    // FetchingHistoryId
    FetchingHistoryId_enter?(/*param1, param2 */): boolean | void;
    FetchingHistoryId_state?(/*param1, param2 */): boolean | void | Promise;
    // HistoryIdFetched
    HistoryIdFetched_enter?(/*param1, param2 */): boolean | void;
    HistoryIdFetched_state?(/*param1, param2 */): boolean | void | Promise;


    Enabled_exit?(): boolean | void;
    Enabled_end?(): boolean | void | Promise;
    SyncingEnabled_exit?(): boolean | void;
    SyncingEnabled_end?(): boolean | void | Promise;
    Dirty_exit?(): boolean | void;
    Dirty_end?(): boolean | void | Promise;
    SyncingQueryLabels_exit?(): boolean | void;
    SyncingQueryLabels_end?(): boolean | void | Promise;
    QueryLabelsSynced_exit?(): boolean | void;
    QueryLabelsSynced_end?(): boolean | void | Promise;
    FetchingLabels_exit?(): boolean | void;
    FetchingLabels_end?(): boolean | void | Promise;
    LabelsFetched_exit?(): boolean | void;
    LabelsFetched_end?(): boolean | void | Promise;
    FetchingHistoryId_exit?(): boolean | void;
    FetchingHistoryId_end?(): boolean | void | Promise;
    HistoryIdFetched_exit?(): boolean | void;
    HistoryIdFetched_end?(): boolean | void | Promise;

    Exception_Enabled?(): boolean | void;
    Exception_SyncingEnabled?(): boolean | void;
    Exception_Dirty?(): boolean | void;
    Exception_SyncingQueryLabels?(): boolean | void;
    Exception_QueryLabelsSynced?(): boolean | void;
    Exception_FetchingLabels?(): boolean | void;
    Exception_LabelsFetched?(): boolean | void;
    Exception_FetchingHistoryId?(): boolean | void;
    Exception_HistoryIdFetched?(): boolean | void;
    Enabled_Exception?(): boolean | void;
    Enabled_Any?(): boolean | void;
    Enabled_SyncingEnabled?(): boolean | void;
    Enabled_Dirty?(): boolean | void;
    Enabled_SyncingQueryLabels?(): boolean | void;
    Enabled_QueryLabelsSynced?(): boolean | void;
    Enabled_FetchingLabels?(): boolean | void;
    Enabled_LabelsFetched?(): boolean | void;
    Enabled_FetchingHistoryId?(): boolean | void;
    Enabled_HistoryIdFetched?(): boolean | void;
    Enabled_Exception?(): boolean | void;
    SyncingEnabled_Exception?(): boolean | void;
    SyncingEnabled_Enabled?(): boolean | void;
    SyncingEnabled_Any?(): boolean | void;
    SyncingEnabled_Dirty?(): boolean | void;
    SyncingEnabled_SyncingQueryLabels?(): boolean | void;
    SyncingEnabled_QueryLabelsSynced?(): boolean | void;
    SyncingEnabled_FetchingLabels?(): boolean | void;
    SyncingEnabled_LabelsFetched?(): boolean | void;
    SyncingEnabled_FetchingHistoryId?(): boolean | void;
    SyncingEnabled_HistoryIdFetched?(): boolean | void;
    SyncingEnabled_Exception?(): boolean | void;
    Dirty_Exception?(): boolean | void;
    Dirty_Enabled?(): boolean | void;
    Dirty_SyncingEnabled?(): boolean | void;
    Dirty_Any?(): boolean | void;
    Dirty_SyncingQueryLabels?(): boolean | void;
    Dirty_QueryLabelsSynced?(): boolean | void;
    Dirty_FetchingLabels?(): boolean | void;
    Dirty_LabelsFetched?(): boolean | void;
    Dirty_FetchingHistoryId?(): boolean | void;
    Dirty_HistoryIdFetched?(): boolean | void;
    Dirty_Exception?(): boolean | void;
    SyncingQueryLabels_Exception?(): boolean | void;
    SyncingQueryLabels_Enabled?(): boolean | void;
    SyncingQueryLabels_SyncingEnabled?(): boolean | void;
    SyncingQueryLabels_Dirty?(): boolean | void;
    SyncingQueryLabels_Any?(): boolean | void;
    SyncingQueryLabels_QueryLabelsSynced?(): boolean | void;
    SyncingQueryLabels_FetchingLabels?(): boolean | void;
    SyncingQueryLabels_LabelsFetched?(): boolean | void;
    SyncingQueryLabels_FetchingHistoryId?(): boolean | void;
    SyncingQueryLabels_HistoryIdFetched?(): boolean | void;
    SyncingQueryLabels_Exception?(): boolean | void;
    QueryLabelsSynced_Exception?(): boolean | void;
    QueryLabelsSynced_Enabled?(): boolean | void;
    QueryLabelsSynced_SyncingEnabled?(): boolean | void;
    QueryLabelsSynced_Dirty?(): boolean | void;
    QueryLabelsSynced_SyncingQueryLabels?(): boolean | void;
    QueryLabelsSynced_Any?(): boolean | void;
    QueryLabelsSynced_FetchingLabels?(): boolean | void;
    QueryLabelsSynced_LabelsFetched?(): boolean | void;
    QueryLabelsSynced_FetchingHistoryId?(): boolean | void;
    QueryLabelsSynced_HistoryIdFetched?(): boolean | void;
    QueryLabelsSynced_Exception?(): boolean | void;
    FetchingLabels_Exception?(): boolean | void;
    FetchingLabels_Enabled?(): boolean | void;
    FetchingLabels_SyncingEnabled?(): boolean | void;
    FetchingLabels_Dirty?(): boolean | void;
    FetchingLabels_SyncingQueryLabels?(): boolean | void;
    FetchingLabels_QueryLabelsSynced?(): boolean | void;
    FetchingLabels_Any?(): boolean | void;
    FetchingLabels_LabelsFetched?(): boolean | void;
    FetchingLabels_FetchingHistoryId?(): boolean | void;
    FetchingLabels_HistoryIdFetched?(): boolean | void;
    FetchingLabels_Exception?(): boolean | void;
    LabelsFetched_Exception?(): boolean | void;
    LabelsFetched_Enabled?(): boolean | void;
    LabelsFetched_SyncingEnabled?(): boolean | void;
    LabelsFetched_Dirty?(): boolean | void;
    LabelsFetched_SyncingQueryLabels?(): boolean | void;
    LabelsFetched_QueryLabelsSynced?(): boolean | void;
    LabelsFetched_FetchingLabels?(): boolean | void;
    LabelsFetched_Any?(): boolean | void;
    LabelsFetched_FetchingHistoryId?(): boolean | void;
    LabelsFetched_HistoryIdFetched?(): boolean | void;
    LabelsFetched_Exception?(): boolean | void;
    FetchingHistoryId_Exception?(): boolean | void;
    FetchingHistoryId_Enabled?(): boolean | void;
    FetchingHistoryId_SyncingEnabled?(): boolean | void;
    FetchingHistoryId_Dirty?(): boolean | void;
    FetchingHistoryId_SyncingQueryLabels?(): boolean | void;
    FetchingHistoryId_QueryLabelsSynced?(): boolean | void;
    FetchingHistoryId_FetchingLabels?(): boolean | void;
    FetchingHistoryId_LabelsFetched?(): boolean | void;
    FetchingHistoryId_Any?(): boolean | void;
    FetchingHistoryId_HistoryIdFetched?(): boolean | void;
    FetchingHistoryId_Exception?(): boolean | void;
    HistoryIdFetched_Exception?(): boolean | void;
    HistoryIdFetched_Enabled?(): boolean | void;
    HistoryIdFetched_SyncingEnabled?(): boolean | void;
    HistoryIdFetched_Dirty?(): boolean | void;
    HistoryIdFetched_SyncingQueryLabels?(): boolean | void;
    HistoryIdFetched_QueryLabelsSynced?(): boolean | void;
    HistoryIdFetched_FetchingLabels?(): boolean | void;
    HistoryIdFetched_LabelsFetched?(): boolean | void;
    HistoryIdFetched_FetchingHistoryId?(): boolean | void;
    HistoryIdFetched_Any?(): boolean | void;
    HistoryIdFetched_Exception?(): boolean | void;
    Exception_Enabled?(): boolean | void;
    Exception_SyncingEnabled?(): boolean | void;
    Exception_Dirty?(): boolean | void;
    Exception_SyncingQueryLabels?(): boolean | void;
    Exception_QueryLabelsSynced?(): boolean | void;
    Exception_FetchingLabels?(): boolean | void;
    Exception_LabelsFetched?(): boolean | void;
    Exception_FetchingHistoryId?(): boolean | void;
    Exception_HistoryIdFetched?(): boolean | void;

}

/**
 * All the state names.
 */
export type TStates = 'Enabled'
  | 'SyncingEnabled'
  | 'Dirty'
  | 'SyncingQueryLabels'
  | 'QueryLabelsSynced'
  | 'FetchingLabels'
  | 'LabelsFetched'
  | 'FetchingHistoryId'
  | 'HistoryIdFetched';

/**
 * All the transition names.
 */
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
    (event: 'Enabled_exit'): boolean | void;
    (event: 'Enabled_end'): boolean | void;
    (event: 'SyncingEnabled_exit'): boolean | void;
    (event: 'SyncingEnabled_end'): boolean | void;
    (event: 'Dirty_exit'): boolean | void;
    (event: 'Dirty_end'): boolean | void;
    (event: 'SyncingQueryLabels_exit'): boolean | void;
    (event: 'SyncingQueryLabels_end'): boolean | void;
    (event: 'QueryLabelsSynced_exit'): boolean | void;
    (event: 'QueryLabelsSynced_end'): boolean | void;
    (event: 'FetchingLabels_exit'): boolean | void;
    (event: 'FetchingLabels_end'): boolean | void;
    (event: 'LabelsFetched_exit'): boolean | void;
    (event: 'LabelsFetched_end'): boolean | void;
    (event: 'FetchingHistoryId_exit'): boolean | void;
    (event: 'FetchingHistoryId_end'): boolean | void;
    (event: 'HistoryIdFetched_exit'): boolean | void;
    (event: 'HistoryIdFetched_end'): boolean | void;

    // Transitions
    (event: TTransitions): boolean | void;
}
