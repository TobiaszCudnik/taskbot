import {
  IState as IStateBase,
  IBind as IBindBase,
  IEmit as IEmitBase
} from 'asyncmachine/types'
import AsyncMachine from 'asyncmachine'

export { IBindBase, IEmitBase, AsyncMachine }

// ----- ----- ----- ----- -----
// STATE: Enabled
// ----- ----- ----- ----- -----

/** machine.bind('Enabled', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (event: 'Enabled_enter', listener: (/* param1: any?, param2: any? */) => boolean | undefined, context?: Object): this;
  (event: 'Enabled_state', listener: (/* param1: any?, param2: any? */) => any, context?: Object): this;
}

/** machine.emit('Enabled', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'Enabled_enter' /*, param1: any?, param2: any? */): boolean | void;
  (event: 'Enabled_state' /*, param1: any?, param2: any? */): boolean | void;
}

/** Method declarations */
export interface ITransitions {
  Enabled_enter?(/* param1: any?, param2: any? */): boolean | void;
  Enabled_state?(/* param1: any?, param2: any? */): boolean | void | Promise<boolean | void>;
}

// ----- ----- ----- ----- -----
// STATE: Dirty
// ----- ----- ----- ----- -----

/** machine.bind('Dirty', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (event: 'Dirty_enter', listener: (/* param1: any?, param2: any? */) => boolean | undefined, context?: Object): this;
  (event: 'Dirty_state', listener: (/* param1: any?, param2: any? */) => any, context?: Object): this;
}

/** machine.emit('Dirty', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'Dirty_enter' /*, param1: any?, param2: any? */): boolean | void;
  (event: 'Dirty_state' /*, param1: any?, param2: any? */): boolean | void;
}

/** Method declarations */
export interface ITransitions {
  Dirty_enter?(/* param1: any?, param2: any? */): boolean | void;
  Dirty_state?(/* param1: any?, param2: any? */): boolean | void | Promise<boolean | void>;
}

// ----- ----- ----- ----- -----
// STATE: FetchingThreads
// ----- ----- ----- ----- -----

/** machine.bind('FetchingThreads', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (event: 'FetchingThreads_enter', listener: (/* param1: any?, param2: any? */) => boolean | undefined, context?: Object): this;
  (event: 'FetchingThreads_state', listener: (/* param1: any?, param2: any? */) => any, context?: Object): this;
}

/** machine.emit('FetchingThreads', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'FetchingThreads_enter' /*, param1: any?, param2: any? */): boolean | void;
  (event: 'FetchingThreads_state' /*, param1: any?, param2: any? */): boolean | void;
}

/** Method declarations */
export interface ITransitions {
  FetchingThreads_enter?(/* param1: any?, param2: any? */): boolean | void;
  FetchingThreads_state?(/* param1: any?, param2: any? */): boolean | void | Promise<boolean | void>;
}

// ----- ----- ----- ----- -----
// STATE: ThreadsFetched
// ----- ----- ----- ----- -----

/** machine.bind('ThreadsFetched', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (event: 'ThreadsFetched_enter', listener: (/* param1: any?, param2: any? */) => boolean | undefined, context?: Object): this;
  (event: 'ThreadsFetched_state', listener: (/* param1: any?, param2: any? */) => any, context?: Object): this;
}

/** machine.emit('ThreadsFetched', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'ThreadsFetched_enter' /*, param1: any?, param2: any? */): boolean | void;
  (event: 'ThreadsFetched_state' /*, param1: any?, param2: any? */): boolean | void;
}

/** Method declarations */
export interface ITransitions {
  ThreadsFetched_enter?(/* param1: any?, param2: any? */): boolean | void;
  ThreadsFetched_state?(/* param1: any?, param2: any? */): boolean | void | Promise<boolean | void>;
}

// ----- ----- ----- ----- -----
// STATE: FetchingMsgs
// ----- ----- ----- ----- -----

/** machine.bind('FetchingMsgs', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (event: 'FetchingMsgs_enter', listener: (/* param1: any?, param2: any? */) => boolean | undefined, context?: Object): this;
  (event: 'FetchingMsgs_state', listener: (/* param1: any?, param2: any? */) => any, context?: Object): this;
}

/** machine.emit('FetchingMsgs', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'FetchingMsgs_enter' /*, param1: any?, param2: any? */): boolean | void;
  (event: 'FetchingMsgs_state' /*, param1: any?, param2: any? */): boolean | void;
}

/** Method declarations */
export interface ITransitions {
  FetchingMsgs_enter?(/* param1: any?, param2: any? */): boolean | void;
  FetchingMsgs_state?(/* param1: any?, param2: any? */): boolean | void | Promise<boolean | void>;
}

// ----- ----- ----- ----- -----
// STATE: MsgsFetched
// ----- ----- ----- ----- -----

/** machine.bind('MsgsFetched', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (event: 'MsgsFetched_enter', listener: (/* param1: any?, param2: any? */) => boolean | undefined, context?: Object): this;
  (event: 'MsgsFetched_state', listener: (/* param1: any?, param2: any? */) => any, context?: Object): this;
}

/** machine.emit('MsgsFetched', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'MsgsFetched_enter' /*, param1: any?, param2: any? */): boolean | void;
  (event: 'MsgsFetched_state' /*, param1: any?, param2: any? */): boolean | void;
}

/** Method declarations */
export interface ITransitions {
  MsgsFetched_enter?(/* param1: any?, param2: any? */): boolean | void;
  MsgsFetched_state?(/* param1: any?, param2: any? */): boolean | void | Promise<boolean | void>;
}

// ----- ----- -----
// GENERAL TYPES
// ----- ----- -----

/** All the possible transition methods the machine can define */
export interface ITransitions {
  Enabled_Any?(): boolean | void;
  Enabled_Dirty?(): boolean | void;
  Enabled_FetchingThreads?(): boolean | void;
  Enabled_ThreadsFetched?(): boolean | void;
  Enabled_FetchingMsgs?(): boolean | void;
  Enabled_MsgsFetched?(): boolean | void;
  Enabled_Exception?(): boolean | void;
  Enabled_Exception?(): boolean | void;
  Enabled_exit?(): boolean | void;
  Enabled_end?(): boolean | void | Promise<boolean | void>;
  Dirty_Enabled?(): boolean | void;
  Dirty_Any?(): boolean | void;
  Dirty_FetchingThreads?(): boolean | void;
  Dirty_ThreadsFetched?(): boolean | void;
  Dirty_FetchingMsgs?(): boolean | void;
  Dirty_MsgsFetched?(): boolean | void;
  Dirty_Exception?(): boolean | void;
  Dirty_Exception?(): boolean | void;
  Dirty_exit?(): boolean | void;
  Dirty_end?(): boolean | void | Promise<boolean | void>;
  FetchingThreads_Enabled?(): boolean | void;
  FetchingThreads_Dirty?(): boolean | void;
  FetchingThreads_Any?(): boolean | void;
  FetchingThreads_ThreadsFetched?(): boolean | void;
  FetchingThreads_FetchingMsgs?(): boolean | void;
  FetchingThreads_MsgsFetched?(): boolean | void;
  FetchingThreads_Exception?(): boolean | void;
  FetchingThreads_Exception?(): boolean | void;
  FetchingThreads_exit?(): boolean | void;
  FetchingThreads_end?(): boolean | void | Promise<boolean | void>;
  ThreadsFetched_Enabled?(): boolean | void;
  ThreadsFetched_Dirty?(): boolean | void;
  ThreadsFetched_FetchingThreads?(): boolean | void;
  ThreadsFetched_Any?(): boolean | void;
  ThreadsFetched_FetchingMsgs?(): boolean | void;
  ThreadsFetched_MsgsFetched?(): boolean | void;
  ThreadsFetched_Exception?(): boolean | void;
  ThreadsFetched_Exception?(): boolean | void;
  ThreadsFetched_exit?(): boolean | void;
  ThreadsFetched_end?(): boolean | void | Promise<boolean | void>;
  FetchingMsgs_Enabled?(): boolean | void;
  FetchingMsgs_Dirty?(): boolean | void;
  FetchingMsgs_FetchingThreads?(): boolean | void;
  FetchingMsgs_ThreadsFetched?(): boolean | void;
  FetchingMsgs_Any?(): boolean | void;
  FetchingMsgs_MsgsFetched?(): boolean | void;
  FetchingMsgs_Exception?(): boolean | void;
  FetchingMsgs_Exception?(): boolean | void;
  FetchingMsgs_exit?(): boolean | void;
  FetchingMsgs_end?(): boolean | void | Promise<boolean | void>;
  MsgsFetched_Enabled?(): boolean | void;
  MsgsFetched_Dirty?(): boolean | void;
  MsgsFetched_FetchingThreads?(): boolean | void;
  MsgsFetched_ThreadsFetched?(): boolean | void;
  MsgsFetched_FetchingMsgs?(): boolean | void;
  MsgsFetched_Any?(): boolean | void;
  MsgsFetched_Exception?(): boolean | void;
  MsgsFetched_Exception?(): boolean | void;
  MsgsFetched_exit?(): boolean | void;
  MsgsFetched_end?(): boolean | void | Promise<boolean | void>;
  Exception_Enabled?(): boolean | void;
  Exception_Dirty?(): boolean | void;
  Exception_FetchingThreads?(): boolean | void;
  Exception_ThreadsFetched?(): boolean | void;
  Exception_FetchingMsgs?(): boolean | void;
  Exception_MsgsFetched?(): boolean | void;
  Exception_exit?(): boolean | void;
  Exception_end?(): boolean | void | Promise<boolean | void>;
  Exception_Enabled?(): boolean | void;
  Exception_Dirty?(): boolean | void;
  Exception_FetchingThreads?(): boolean | void;
  Exception_ThreadsFetched?(): boolean | void;
  Exception_FetchingMsgs?(): boolean | void;
  Exception_MsgsFetched?(): boolean | void;
  Exception_exit?(): boolean | void;
  Exception_end?(): boolean | void | Promise<boolean | void>;
}

/** All the state names */
export type TStates = 'Enabled'
  | 'Dirty'
  | 'FetchingThreads'
  | 'ThreadsFetched'
  | 'FetchingMsgs'
  | 'MsgsFetched';

/** All the transition names */
export type TTransitions = 'Enabled_Any'
  | 'Enabled_Dirty'
  | 'Enabled_FetchingThreads'
  | 'Enabled_ThreadsFetched'
  | 'Enabled_FetchingMsgs'
  | 'Enabled_MsgsFetched'
  | 'Enabled_Exception'
  | 'Enabled_Exception'
  | 'Enabled_exit'
  | 'Enabled_end'
  | 'Dirty_Enabled'
  | 'Dirty_Any'
  | 'Dirty_FetchingThreads'
  | 'Dirty_ThreadsFetched'
  | 'Dirty_FetchingMsgs'
  | 'Dirty_MsgsFetched'
  | 'Dirty_Exception'
  | 'Dirty_Exception'
  | 'Dirty_exit'
  | 'Dirty_end'
  | 'FetchingThreads_Enabled'
  | 'FetchingThreads_Dirty'
  | 'FetchingThreads_Any'
  | 'FetchingThreads_ThreadsFetched'
  | 'FetchingThreads_FetchingMsgs'
  | 'FetchingThreads_MsgsFetched'
  | 'FetchingThreads_Exception'
  | 'FetchingThreads_Exception'
  | 'FetchingThreads_exit'
  | 'FetchingThreads_end'
  | 'ThreadsFetched_Enabled'
  | 'ThreadsFetched_Dirty'
  | 'ThreadsFetched_FetchingThreads'
  | 'ThreadsFetched_Any'
  | 'ThreadsFetched_FetchingMsgs'
  | 'ThreadsFetched_MsgsFetched'
  | 'ThreadsFetched_Exception'
  | 'ThreadsFetched_Exception'
  | 'ThreadsFetched_exit'
  | 'ThreadsFetched_end'
  | 'FetchingMsgs_Enabled'
  | 'FetchingMsgs_Dirty'
  | 'FetchingMsgs_FetchingThreads'
  | 'FetchingMsgs_ThreadsFetched'
  | 'FetchingMsgs_Any'
  | 'FetchingMsgs_MsgsFetched'
  | 'FetchingMsgs_Exception'
  | 'FetchingMsgs_Exception'
  | 'FetchingMsgs_exit'
  | 'FetchingMsgs_end'
  | 'MsgsFetched_Enabled'
  | 'MsgsFetched_Dirty'
  | 'MsgsFetched_FetchingThreads'
  | 'MsgsFetched_ThreadsFetched'
  | 'MsgsFetched_FetchingMsgs'
  | 'MsgsFetched_Any'
  | 'MsgsFetched_Exception'
  | 'MsgsFetched_Exception'
  | 'MsgsFetched_exit'
  | 'MsgsFetched_end'
  | 'Exception_Enabled'
  | 'Exception_Dirty'
  | 'Exception_FetchingThreads'
  | 'Exception_ThreadsFetched'
  | 'Exception_FetchingMsgs'
  | 'Exception_MsgsFetched'
  | 'Exception_exit'
  | 'Exception_end'
  | 'Exception_Enabled'
  | 'Exception_Dirty'
  | 'Exception_FetchingThreads'
  | 'Exception_ThreadsFetched'
  | 'Exception_FetchingMsgs'
  | 'Exception_MsgsFetched'
  | 'Exception_exit'
  | 'Exception_end';

/** Typesafe state interface */
export interface IState extends IStateBase<TStates> {}

/** Subclassable typesafe state interface */
export interface IStateExt<T extends string> extends IStateBase<T | TStates> {}

export interface IBind extends IBindBase {
  // Non-params events and transitions
  (event: TTransitions, listener: () => boolean | void, context?: Object): this;
}

export interface IEmit extends IEmitBase {
  // Non-params events and transitions
  (event: TTransitions): boolean | void;
}

export interface IJSONStates {
  Enabled: IState;
  Dirty: IState;
  FetchingThreads: IState;
  ThreadsFetched: IState;
  FetchingMsgs: IState;
  MsgsFetched: IState;
  Exception?: IState;
}
