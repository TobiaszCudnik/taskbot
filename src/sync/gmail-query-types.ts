
import { IState as IStateBase } from 'asyncmachine/src/types'


/**
 * Signatures for EventEmitter to bind to transitions.
 */
export interface IBind {

    // Enabled
    (event: 'Enabled_enter', listener: (/* param1, param2 */) => boolean | undefined, context?: Object): this;
    (event: 'Enabled_state', listener: (/* param1, param2 */) => any, context?: Object): this;
    // Dirty
    (event: 'Dirty_enter', listener: (/* param1, param2 */) => boolean | undefined, context?: Object): this;
    (event: 'Dirty_state', listener: (/* param1, param2 */) => any, context?: Object): this;
    // FetchingThreads
    (event: 'FetchingThreads_enter', listener: (/* param1, param2 */) => boolean | undefined, context?: Object): this;
    (event: 'FetchingThreads_state', listener: (/* param1, param2 */) => any, context?: Object): this;
    // ThreadsFetched
    (event: 'ThreadsFetched_enter', listener: (/* param1, param2 */) => boolean | undefined, context?: Object): this;
    (event: 'ThreadsFetched_state', listener: (/* param1, param2 */) => any, context?: Object): this;
    // FetchingMsgs
    (event: 'FetchingMsgs_enter', listener: (/* param1, param2 */) => boolean | undefined, context?: Object): this;
    (event: 'FetchingMsgs_state', listener: (/* param1, param2 */) => any, context?: Object): this;
    // MsgsFetched
    (event: 'MsgsFetched_enter', listener: (/* param1, param2 */) => boolean | undefined, context?: Object): this;
    (event: 'MsgsFetched_state', listener: (/* param1, param2 */) => any, context?: Object): this;

}

/**
 * Signatures for EventEmitter to emit transitions.
 */
export interface IEmit {

    // Enabled
    (event: 'Enabled_enter' /*, param1, param2 */): boolean | void;
    (event: 'Enabled_state' /*, param1, param2 */): boolean | void;
    // Dirty
    (event: 'Dirty_enter' /*, param1, param2 */): boolean | void;
    (event: 'Dirty_state' /*, param1, param2 */): boolean | void;
    // FetchingThreads
    (event: 'FetchingThreads_enter' /*, param1, param2 */): boolean | void;
    (event: 'FetchingThreads_state' /*, param1, param2 */): boolean | void;
    // ThreadsFetched
    (event: 'ThreadsFetched_enter' /*, param1, param2 */): boolean | void;
    (event: 'ThreadsFetched_state' /*, param1, param2 */): boolean | void;
    // FetchingMsgs
    (event: 'FetchingMsgs_enter' /*, param1, param2 */): boolean | void;
    (event: 'FetchingMsgs_state' /*, param1, param2 */): boolean | void;
    // MsgsFetched
    (event: 'MsgsFetched_enter' /*, param1, param2 */): boolean | void;
    (event: 'MsgsFetched_state' /*, param1, param2 */): boolean | void;

}

/**
 * All the possible transition methods machine can define.
 */
export interface ITransitions {

    // Enabled
    Enabled_enter?(/*param1, param2 */): boolean | void;
    Enabled_state?(/*param1, param2 */): boolean | void | Promise;
    // Dirty
    Dirty_enter?(/*param1, param2 */): boolean | void;
    Dirty_state?(/*param1, param2 */): boolean | void | Promise;
    // FetchingThreads
    FetchingThreads_enter?(/*param1, param2 */): boolean | void;
    FetchingThreads_state?(/*param1, param2 */): boolean | void | Promise;
    // ThreadsFetched
    ThreadsFetched_enter?(/*param1, param2 */): boolean | void;
    ThreadsFetched_state?(/*param1, param2 */): boolean | void | Promise;
    // FetchingMsgs
    FetchingMsgs_enter?(/*param1, param2 */): boolean | void;
    FetchingMsgs_state?(/*param1, param2 */): boolean | void | Promise;
    // MsgsFetched
    MsgsFetched_enter?(/*param1, param2 */): boolean | void;
    MsgsFetched_state?(/*param1, param2 */): boolean | void | Promise;


    Enabled_exit?(): boolean | void;
    Enabled_end?(): boolean | void | Promise;
    Dirty_exit?(): boolean | void;
    Dirty_end?(): boolean | void | Promise;
    FetchingThreads_exit?(): boolean | void;
    FetchingThreads_end?(): boolean | void | Promise;
    ThreadsFetched_exit?(): boolean | void;
    ThreadsFetched_end?(): boolean | void | Promise;
    FetchingMsgs_exit?(): boolean | void;
    FetchingMsgs_end?(): boolean | void | Promise;
    MsgsFetched_exit?(): boolean | void;
    MsgsFetched_end?(): boolean | void | Promise;

    Exception_Enabled?(): boolean | void;
    Exception_Dirty?(): boolean | void;
    Exception_FetchingThreads?(): boolean | void;
    Exception_ThreadsFetched?(): boolean | void;
    Exception_FetchingMsgs?(): boolean | void;
    Exception_MsgsFetched?(): boolean | void;
    Enabled_Exception?(): boolean | void;
    Enabled_Any?(): boolean | void;
    Enabled_Dirty?(): boolean | void;
    Enabled_FetchingThreads?(): boolean | void;
    Enabled_ThreadsFetched?(): boolean | void;
    Enabled_FetchingMsgs?(): boolean | void;
    Enabled_MsgsFetched?(): boolean | void;
    Enabled_Exception?(): boolean | void;
    Dirty_Exception?(): boolean | void;
    Dirty_Enabled?(): boolean | void;
    Dirty_Any?(): boolean | void;
    Dirty_FetchingThreads?(): boolean | void;
    Dirty_ThreadsFetched?(): boolean | void;
    Dirty_FetchingMsgs?(): boolean | void;
    Dirty_MsgsFetched?(): boolean | void;
    Dirty_Exception?(): boolean | void;
    FetchingThreads_Exception?(): boolean | void;
    FetchingThreads_Enabled?(): boolean | void;
    FetchingThreads_Dirty?(): boolean | void;
    FetchingThreads_Any?(): boolean | void;
    FetchingThreads_ThreadsFetched?(): boolean | void;
    FetchingThreads_FetchingMsgs?(): boolean | void;
    FetchingThreads_MsgsFetched?(): boolean | void;
    FetchingThreads_Exception?(): boolean | void;
    ThreadsFetched_Exception?(): boolean | void;
    ThreadsFetched_Enabled?(): boolean | void;
    ThreadsFetched_Dirty?(): boolean | void;
    ThreadsFetched_FetchingThreads?(): boolean | void;
    ThreadsFetched_Any?(): boolean | void;
    ThreadsFetched_FetchingMsgs?(): boolean | void;
    ThreadsFetched_MsgsFetched?(): boolean | void;
    ThreadsFetched_Exception?(): boolean | void;
    FetchingMsgs_Exception?(): boolean | void;
    FetchingMsgs_Enabled?(): boolean | void;
    FetchingMsgs_Dirty?(): boolean | void;
    FetchingMsgs_FetchingThreads?(): boolean | void;
    FetchingMsgs_ThreadsFetched?(): boolean | void;
    FetchingMsgs_Any?(): boolean | void;
    FetchingMsgs_MsgsFetched?(): boolean | void;
    FetchingMsgs_Exception?(): boolean | void;
    MsgsFetched_Exception?(): boolean | void;
    MsgsFetched_Enabled?(): boolean | void;
    MsgsFetched_Dirty?(): boolean | void;
    MsgsFetched_FetchingThreads?(): boolean | void;
    MsgsFetched_ThreadsFetched?(): boolean | void;
    MsgsFetched_FetchingMsgs?(): boolean | void;
    MsgsFetched_Any?(): boolean | void;
    MsgsFetched_Exception?(): boolean | void;
    Exception_Enabled?(): boolean | void;
    Exception_Dirty?(): boolean | void;
    Exception_FetchingThreads?(): boolean | void;
    Exception_ThreadsFetched?(): boolean | void;
    Exception_FetchingMsgs?(): boolean | void;
    Exception_MsgsFetched?(): boolean | void;

}

/**
 * All the state names.
 */
export type TStates = 'Enabled'
  | 'Dirty'
  | 'FetchingThreads'
  | 'ThreadsFetched'
  | 'FetchingMsgs'
  | 'MsgsFetched';

/**
 * All the transition names.
 */
export type TTransitions = 'Exception_Enabled'
  | 'Exception_Dirty'
  | 'Exception_FetchingThreads'
  | 'Exception_ThreadsFetched'
  | 'Exception_FetchingMsgs'
  | 'Exception_MsgsFetched'
  | 'Enabled_Exception'
  | 'Enabled_Any'
  | 'Enabled_Dirty'
  | 'Enabled_FetchingThreads'
  | 'Enabled_ThreadsFetched'
  | 'Enabled_FetchingMsgs'
  | 'Enabled_MsgsFetched'
  | 'Enabled_Exception'
  | 'Dirty_Exception'
  | 'Dirty_Enabled'
  | 'Dirty_Any'
  | 'Dirty_FetchingThreads'
  | 'Dirty_ThreadsFetched'
  | 'Dirty_FetchingMsgs'
  | 'Dirty_MsgsFetched'
  | 'Dirty_Exception'
  | 'FetchingThreads_Exception'
  | 'FetchingThreads_Enabled'
  | 'FetchingThreads_Dirty'
  | 'FetchingThreads_Any'
  | 'FetchingThreads_ThreadsFetched'
  | 'FetchingThreads_FetchingMsgs'
  | 'FetchingThreads_MsgsFetched'
  | 'FetchingThreads_Exception'
  | 'ThreadsFetched_Exception'
  | 'ThreadsFetched_Enabled'
  | 'ThreadsFetched_Dirty'
  | 'ThreadsFetched_FetchingThreads'
  | 'ThreadsFetched_Any'
  | 'ThreadsFetched_FetchingMsgs'
  | 'ThreadsFetched_MsgsFetched'
  | 'ThreadsFetched_Exception'
  | 'FetchingMsgs_Exception'
  | 'FetchingMsgs_Enabled'
  | 'FetchingMsgs_Dirty'
  | 'FetchingMsgs_FetchingThreads'
  | 'FetchingMsgs_ThreadsFetched'
  | 'FetchingMsgs_Any'
  | 'FetchingMsgs_MsgsFetched'
  | 'FetchingMsgs_Exception'
  | 'MsgsFetched_Exception'
  | 'MsgsFetched_Enabled'
  | 'MsgsFetched_Dirty'
  | 'MsgsFetched_FetchingThreads'
  | 'MsgsFetched_ThreadsFetched'
  | 'MsgsFetched_FetchingMsgs'
  | 'MsgsFetched_Any'
  | 'MsgsFetched_Exception'
  | 'Exception_Enabled'
  | 'Exception_Dirty'
  | 'Exception_FetchingThreads'
  | 'Exception_ThreadsFetched'
  | 'Exception_FetchingMsgs'
  | 'Exception_MsgsFetched';

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
    (event: 'Dirty_exit', listener: () => boolean | undefined, context?: Object): this;
    (event: 'Dirty_end', listener: () => any, context?: Object): this;
    (event: 'FetchingThreads_exit', listener: () => boolean | undefined, context?: Object): this;
    (event: 'FetchingThreads_end', listener: () => any, context?: Object): this;
    (event: 'ThreadsFetched_exit', listener: () => boolean | undefined, context?: Object): this;
    (event: 'ThreadsFetched_end', listener: () => any, context?: Object): this;
    (event: 'FetchingMsgs_exit', listener: () => boolean | undefined, context?: Object): this;
    (event: 'FetchingMsgs_end', listener: () => any, context?: Object): this;
    (event: 'MsgsFetched_exit', listener: () => boolean | undefined, context?: Object): this;
    (event: 'MsgsFetched_end', listener: () => any, context?: Object): this;

    // Transitions
    (event: TTransitions): this;
}

export interface IEmit {
    // Non-params events
    (event: 'Enabled_exit'): boolean | void;
    (event: 'Enabled_end'): boolean | void;
    (event: 'Dirty_exit'): boolean | void;
    (event: 'Dirty_end'): boolean | void;
    (event: 'FetchingThreads_exit'): boolean | void;
    (event: 'FetchingThreads_end'): boolean | void;
    (event: 'ThreadsFetched_exit'): boolean | void;
    (event: 'ThreadsFetched_end'): boolean | void;
    (event: 'FetchingMsgs_exit'): boolean | void;
    (event: 'FetchingMsgs_end'): boolean | void;
    (event: 'MsgsFetched_exit'): boolean | void;
    (event: 'MsgsFetched_end'): boolean | void;

    // Transitions
    (event: TTransitions): boolean | void;
}
