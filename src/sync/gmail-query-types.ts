
import { IState as IStateBase } from 'asyncmachine/src/types'


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

export interface IEmit {

    // Enabled
    (event: 'Enabled_enter' /*, param1, param2 */): this;
    (event: 'Enabled_state' /*, param1, param2 */): this;
    // Dirty
    (event: 'Dirty_enter' /*, param1, param2 */): this;
    (event: 'Dirty_state' /*, param1, param2 */): this;
    // FetchingThreads
    (event: 'FetchingThreads_enter' /*, param1, param2 */): this;
    (event: 'FetchingThreads_state' /*, param1, param2 */): this;
    // ThreadsFetched
    (event: 'ThreadsFetched_enter' /*, param1, param2 */): this;
    (event: 'ThreadsFetched_state' /*, param1, param2 */): this;
    // FetchingMsgs
    (event: 'FetchingMsgs_enter' /*, param1, param2 */): this;
    (event: 'FetchingMsgs_state' /*, param1, param2 */): this;
    // MsgsFetched
    (event: 'MsgsFetched_enter' /*, param1, param2 */): this;
    (event: 'MsgsFetched_state' /*, param1, param2 */): this;

}

export type TStates = 'Enabled'
  | 'Dirty'
  | 'FetchingThreads'
  | 'ThreadsFetched'
  | 'FetchingMsgs'
  | 'MsgsFetched';

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

// For this implementation
export interface IState extends IStateBase<TStates> {}

// For sub classes
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
    (event: 'Enabled_exit'): this;
    (event: 'Enabled_end'): this;
    (event: 'Dirty_exit'): this;
    (event: 'Dirty_end'): this;
    (event: 'FetchingThreads_exit'): this;
    (event: 'FetchingThreads_end'): this;
    (event: 'ThreadsFetched_exit'): this;
    (event: 'ThreadsFetched_end'): this;
    (event: 'FetchingMsgs_exit'): this;
    (event: 'FetchingMsgs_end'): this;
    (event: 'MsgsFetched_exit'): this;
    (event: 'MsgsFetched_end'): this;

    // Transitions
    (event: TTransitions): boolean;
}
