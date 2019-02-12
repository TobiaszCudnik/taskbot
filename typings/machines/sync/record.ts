import {
  IState as IStateBase,
  IBind as IBindBase,
  IEmit as IEmitBase
} from 'asyncmachine/types'
import AsyncMachine from 'asyncmachine'

export { IBindBase, IEmitBase, AsyncMachine }

// ----- ----- ----- ----- -----
// STATE: Merged
// ----- ----- ----- ----- -----

/** machine.bind('Merged', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (event: 'Merged_enter', listener: (/* param1: any?, param2: any? */) => boolean | undefined, context?: Object): this;
  (event: 'Merged_state', listener: (/* param1: any?, param2: any? */) => any, context?: Object): this;
}

/** machine.emit('Merged', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'Merged_enter' /*, param1: any?, param2: any? */): boolean | void;
  (event: 'Merged_state' /*, param1: any?, param2: any? */): boolean | void;
}

/** Method declarations */
export interface ITransitions {
  Merged_enter?(/* param1: any?, param2: any? */): boolean | void;
  Merged_state?(/* param1: any?, param2: any? */): boolean | void | Promise<boolean | void>;
}

// ----- ----- ----- ----- -----
// STATE: Merging
// ----- ----- ----- ----- -----

/** machine.bind('Merging', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (event: 'Merging_enter', listener: (/* param1: any?, param2: any? */) => boolean | undefined, context?: Object): this;
  (event: 'Merging_state', listener: (/* param1: any?, param2: any? */) => any, context?: Object): this;
}

/** machine.emit('Merging', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'Merging_enter' /*, param1: any?, param2: any? */): boolean | void;
  (event: 'Merging_state' /*, param1: any?, param2: any? */): boolean | void;
}

/** Method declarations */
export interface ITransitions {
  Merging_enter?(/* param1: any?, param2: any? */): boolean | void;
  Merging_state?(/* param1: any?, param2: any? */): boolean | void | Promise<boolean | void>;
}

// ----- ----- ----- ----- -----
// STATE: ToDelete
// ----- ----- ----- ----- -----

/** machine.bind('ToDelete', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (event: 'ToDelete_enter', listener: (/* param1: any?, param2: any? */) => boolean | undefined, context?: Object): this;
  (event: 'ToDelete_state', listener: (/* param1: any?, param2: any? */) => any, context?: Object): this;
}

/** machine.emit('ToDelete', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'ToDelete_enter' /*, param1: any?, param2: any? */): boolean | void;
  (event: 'ToDelete_state' /*, param1: any?, param2: any? */): boolean | void;
}

/** Method declarations */
export interface ITransitions {
  ToDelete_enter?(/* param1: any?, param2: any? */): boolean | void;
  ToDelete_state?(/* param1: any?, param2: any? */): boolean | void | Promise<boolean | void>;
}

// ----- ----- ----- ----- -----
// STATE: GtasksDeleted
// ----- ----- ----- ----- -----

/** machine.bind('GtasksDeleted', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (event: 'GtasksDeleted_enter', listener: (/* param1: any?, param2: any? */) => boolean | undefined, context?: Object): this;
  (event: 'GtasksDeleted_state', listener: (/* param1: any?, param2: any? */) => any, context?: Object): this;
}

/** machine.emit('GtasksDeleted', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'GtasksDeleted_enter' /*, param1: any?, param2: any? */): boolean | void;
  (event: 'GtasksDeleted_state' /*, param1: any?, param2: any? */): boolean | void;
}

/** Method declarations */
export interface ITransitions {
  GtasksDeleted_enter?(/* param1: any?, param2: any? */): boolean | void;
  GtasksDeleted_state?(/* param1: any?, param2: any? */): boolean | void | Promise<boolean | void>;
}

// ----- ----- ----- ----- -----
// STATE: GtasksUncompletedElsewhere
// ----- ----- ----- ----- -----

/** machine.bind('GtasksUncompletedElsewhere', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (event: 'GtasksUncompletedElsewhere_enter', listener: (/* param1: any?, param2: any? */) => boolean | undefined, context?: Object): this;
  (event: 'GtasksUncompletedElsewhere_state', listener: (/* param1: any?, param2: any? */) => any, context?: Object): this;
}

/** machine.emit('GtasksUncompletedElsewhere', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'GtasksUncompletedElsewhere_enter' /*, param1: any?, param2: any? */): boolean | void;
  (event: 'GtasksUncompletedElsewhere_state' /*, param1: any?, param2: any? */): boolean | void;
}

/** Method declarations */
export interface ITransitions {
  GtasksUncompletedElsewhere_enter?(/* param1: any?, param2: any? */): boolean | void;
  GtasksUncompletedElsewhere_state?(/* param1: any?, param2: any? */): boolean | void | Promise<boolean | void>;
}

// ----- ----- ----- ----- -----
// STATE: GtasksHiddenCompleted
// ----- ----- ----- ----- -----

/** machine.bind('GtasksHiddenCompleted', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (event: 'GtasksHiddenCompleted_enter', listener: (/* param1: any?, param2: any? */) => boolean | undefined, context?: Object): this;
  (event: 'GtasksHiddenCompleted_state', listener: (/* param1: any?, param2: any? */) => any, context?: Object): this;
}

/** machine.emit('GtasksHiddenCompleted', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'GtasksHiddenCompleted_enter' /*, param1: any?, param2: any? */): boolean | void;
  (event: 'GtasksHiddenCompleted_state' /*, param1: any?, param2: any? */): boolean | void;
}

/** Method declarations */
export interface ITransitions {
  GtasksHiddenCompleted_enter?(/* param1: any?, param2: any? */): boolean | void;
  GtasksHiddenCompleted_state?(/* param1: any?, param2: any? */): boolean | void | Promise<boolean | void>;
}

// ----- ----- ----- ----- -----
// STATE: GtasksMoving
// ----- ----- ----- ----- -----

/** machine.bind('GtasksMoving', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (event: 'GtasksMoving_enter', listener: (/* param1: any?, param2: any? */) => boolean | undefined, context?: Object): this;
  (event: 'GtasksMoving_state', listener: (/* param1: any?, param2: any? */) => any, context?: Object): this;
}

/** machine.emit('GtasksMoving', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'GtasksMoving_enter' /*, param1: any?, param2: any? */): boolean | void;
  (event: 'GtasksMoving_state' /*, param1: any?, param2: any? */): boolean | void;
}

/** Method declarations */
export interface ITransitions {
  GtasksMoving_enter?(/* param1: any?, param2: any? */): boolean | void;
  GtasksMoving_state?(/* param1: any?, param2: any? */): boolean | void | Promise<boolean | void>;
}

// ----- ----- ----- ----- -----
// STATE: GmailThreadMissing
// ----- ----- ----- ----- -----

/** machine.bind('GmailThreadMissing', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (event: 'GmailThreadMissing_enter', listener: (/* param1: any?, param2: any? */) => boolean | undefined, context?: Object): this;
  (event: 'GmailThreadMissing_state', listener: (/* param1: any?, param2: any? */) => any, context?: Object): this;
}

/** machine.emit('GmailThreadMissing', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'GmailThreadMissing_enter' /*, param1: any?, param2: any? */): boolean | void;
  (event: 'GmailThreadMissing_state' /*, param1: any?, param2: any? */): boolean | void;
}

/** Method declarations */
export interface ITransitions {
  GmailThreadMissing_enter?(/* param1: any?, param2: any? */): boolean | void;
  GmailThreadMissing_state?(/* param1: any?, param2: any? */): boolean | void | Promise<boolean | void>;
}

// ----- ----- -----
// GENERAL TYPES
// ----- ----- -----

/** All the possible transition methods the machine can define */
export interface ITransitions {
  Merged_Any?(): boolean | void;
  Merged_Merging?(): boolean | void;
  Merged_ToDelete?(): boolean | void;
  Merged_GtasksDeleted?(): boolean | void;
  Merged_GtasksUncompletedElsewhere?(): boolean | void;
  Merged_GtasksHiddenCompleted?(): boolean | void;
  Merged_GtasksMoving?(): boolean | void;
  Merged_GmailThreadMissing?(): boolean | void;
  Merged_Exception?(): boolean | void;
  Merged_exit?(): boolean | void;
  Merged_end?(): boolean | void | Promise<boolean | void>;
  Merging_Merged?(): boolean | void;
  Merging_Any?(): boolean | void;
  Merging_ToDelete?(): boolean | void;
  Merging_GtasksDeleted?(): boolean | void;
  Merging_GtasksUncompletedElsewhere?(): boolean | void;
  Merging_GtasksHiddenCompleted?(): boolean | void;
  Merging_GtasksMoving?(): boolean | void;
  Merging_GmailThreadMissing?(): boolean | void;
  Merging_Exception?(): boolean | void;
  Merging_exit?(): boolean | void;
  Merging_end?(): boolean | void | Promise<boolean | void>;
  ToDelete_Merged?(): boolean | void;
  ToDelete_Merging?(): boolean | void;
  ToDelete_Any?(): boolean | void;
  ToDelete_GtasksDeleted?(): boolean | void;
  ToDelete_GtasksUncompletedElsewhere?(): boolean | void;
  ToDelete_GtasksHiddenCompleted?(): boolean | void;
  ToDelete_GtasksMoving?(): boolean | void;
  ToDelete_GmailThreadMissing?(): boolean | void;
  ToDelete_Exception?(): boolean | void;
  ToDelete_exit?(): boolean | void;
  ToDelete_end?(): boolean | void | Promise<boolean | void>;
  GtasksDeleted_Merged?(): boolean | void;
  GtasksDeleted_Merging?(): boolean | void;
  GtasksDeleted_ToDelete?(): boolean | void;
  GtasksDeleted_Any?(): boolean | void;
  GtasksDeleted_GtasksUncompletedElsewhere?(): boolean | void;
  GtasksDeleted_GtasksHiddenCompleted?(): boolean | void;
  GtasksDeleted_GtasksMoving?(): boolean | void;
  GtasksDeleted_GmailThreadMissing?(): boolean | void;
  GtasksDeleted_Exception?(): boolean | void;
  GtasksDeleted_exit?(): boolean | void;
  GtasksDeleted_end?(): boolean | void | Promise<boolean | void>;
  GtasksUncompletedElsewhere_Merged?(): boolean | void;
  GtasksUncompletedElsewhere_Merging?(): boolean | void;
  GtasksUncompletedElsewhere_ToDelete?(): boolean | void;
  GtasksUncompletedElsewhere_GtasksDeleted?(): boolean | void;
  GtasksUncompletedElsewhere_Any?(): boolean | void;
  GtasksUncompletedElsewhere_GtasksHiddenCompleted?(): boolean | void;
  GtasksUncompletedElsewhere_GtasksMoving?(): boolean | void;
  GtasksUncompletedElsewhere_GmailThreadMissing?(): boolean | void;
  GtasksUncompletedElsewhere_Exception?(): boolean | void;
  GtasksUncompletedElsewhere_exit?(): boolean | void;
  GtasksUncompletedElsewhere_end?(): boolean | void | Promise<boolean | void>;
  GtasksHiddenCompleted_Merged?(): boolean | void;
  GtasksHiddenCompleted_Merging?(): boolean | void;
  GtasksHiddenCompleted_ToDelete?(): boolean | void;
  GtasksHiddenCompleted_GtasksDeleted?(): boolean | void;
  GtasksHiddenCompleted_GtasksUncompletedElsewhere?(): boolean | void;
  GtasksHiddenCompleted_Any?(): boolean | void;
  GtasksHiddenCompleted_GtasksMoving?(): boolean | void;
  GtasksHiddenCompleted_GmailThreadMissing?(): boolean | void;
  GtasksHiddenCompleted_Exception?(): boolean | void;
  GtasksHiddenCompleted_exit?(): boolean | void;
  GtasksHiddenCompleted_end?(): boolean | void | Promise<boolean | void>;
  GtasksMoving_Merged?(): boolean | void;
  GtasksMoving_Merging?(): boolean | void;
  GtasksMoving_ToDelete?(): boolean | void;
  GtasksMoving_GtasksDeleted?(): boolean | void;
  GtasksMoving_GtasksUncompletedElsewhere?(): boolean | void;
  GtasksMoving_GtasksHiddenCompleted?(): boolean | void;
  GtasksMoving_Any?(): boolean | void;
  GtasksMoving_GmailThreadMissing?(): boolean | void;
  GtasksMoving_Exception?(): boolean | void;
  GtasksMoving_exit?(): boolean | void;
  GtasksMoving_end?(): boolean | void | Promise<boolean | void>;
  GmailThreadMissing_Merged?(): boolean | void;
  GmailThreadMissing_Merging?(): boolean | void;
  GmailThreadMissing_ToDelete?(): boolean | void;
  GmailThreadMissing_GtasksDeleted?(): boolean | void;
  GmailThreadMissing_GtasksUncompletedElsewhere?(): boolean | void;
  GmailThreadMissing_GtasksHiddenCompleted?(): boolean | void;
  GmailThreadMissing_GtasksMoving?(): boolean | void;
  GmailThreadMissing_Any?(): boolean | void;
  GmailThreadMissing_Exception?(): boolean | void;
  GmailThreadMissing_exit?(): boolean | void;
  GmailThreadMissing_end?(): boolean | void | Promise<boolean | void>;
  Exception_Merged?(): boolean | void;
  Exception_Merging?(): boolean | void;
  Exception_ToDelete?(): boolean | void;
  Exception_GtasksDeleted?(): boolean | void;
  Exception_GtasksUncompletedElsewhere?(): boolean | void;
  Exception_GtasksHiddenCompleted?(): boolean | void;
  Exception_GtasksMoving?(): boolean | void;
  Exception_GmailThreadMissing?(): boolean | void;
  Exception_exit?(): boolean | void;
  Exception_end?(): boolean | void | Promise<boolean | void>;
}

/** All the state names */
export type TStates = 'Merged'
  | 'Merging'
  | 'ToDelete'
  | 'GtasksDeleted'
  | 'GtasksUncompletedElsewhere'
  | 'GtasksHiddenCompleted'
  | 'GtasksMoving'
  | 'GmailThreadMissing';

/** All the transition names */
export type TTransitions = 'Merged_Any'
  | 'Merged_Merging'
  | 'Merged_ToDelete'
  | 'Merged_GtasksDeleted'
  | 'Merged_GtasksUncompletedElsewhere'
  | 'Merged_GtasksHiddenCompleted'
  | 'Merged_GtasksMoving'
  | 'Merged_GmailThreadMissing'
  | 'Merged_Exception'
  | 'Merged_exit'
  | 'Merged_end'
  | 'Merging_Merged'
  | 'Merging_Any'
  | 'Merging_ToDelete'
  | 'Merging_GtasksDeleted'
  | 'Merging_GtasksUncompletedElsewhere'
  | 'Merging_GtasksHiddenCompleted'
  | 'Merging_GtasksMoving'
  | 'Merging_GmailThreadMissing'
  | 'Merging_Exception'
  | 'Merging_exit'
  | 'Merging_end'
  | 'ToDelete_Merged'
  | 'ToDelete_Merging'
  | 'ToDelete_Any'
  | 'ToDelete_GtasksDeleted'
  | 'ToDelete_GtasksUncompletedElsewhere'
  | 'ToDelete_GtasksHiddenCompleted'
  | 'ToDelete_GtasksMoving'
  | 'ToDelete_GmailThreadMissing'
  | 'ToDelete_Exception'
  | 'ToDelete_exit'
  | 'ToDelete_end'
  | 'GtasksDeleted_Merged'
  | 'GtasksDeleted_Merging'
  | 'GtasksDeleted_ToDelete'
  | 'GtasksDeleted_Any'
  | 'GtasksDeleted_GtasksUncompletedElsewhere'
  | 'GtasksDeleted_GtasksHiddenCompleted'
  | 'GtasksDeleted_GtasksMoving'
  | 'GtasksDeleted_GmailThreadMissing'
  | 'GtasksDeleted_Exception'
  | 'GtasksDeleted_exit'
  | 'GtasksDeleted_end'
  | 'GtasksUncompletedElsewhere_Merged'
  | 'GtasksUncompletedElsewhere_Merging'
  | 'GtasksUncompletedElsewhere_ToDelete'
  | 'GtasksUncompletedElsewhere_GtasksDeleted'
  | 'GtasksUncompletedElsewhere_Any'
  | 'GtasksUncompletedElsewhere_GtasksHiddenCompleted'
  | 'GtasksUncompletedElsewhere_GtasksMoving'
  | 'GtasksUncompletedElsewhere_GmailThreadMissing'
  | 'GtasksUncompletedElsewhere_Exception'
  | 'GtasksUncompletedElsewhere_exit'
  | 'GtasksUncompletedElsewhere_end'
  | 'GtasksHiddenCompleted_Merged'
  | 'GtasksHiddenCompleted_Merging'
  | 'GtasksHiddenCompleted_ToDelete'
  | 'GtasksHiddenCompleted_GtasksDeleted'
  | 'GtasksHiddenCompleted_GtasksUncompletedElsewhere'
  | 'GtasksHiddenCompleted_Any'
  | 'GtasksHiddenCompleted_GtasksMoving'
  | 'GtasksHiddenCompleted_GmailThreadMissing'
  | 'GtasksHiddenCompleted_Exception'
  | 'GtasksHiddenCompleted_exit'
  | 'GtasksHiddenCompleted_end'
  | 'GtasksMoving_Merged'
  | 'GtasksMoving_Merging'
  | 'GtasksMoving_ToDelete'
  | 'GtasksMoving_GtasksDeleted'
  | 'GtasksMoving_GtasksUncompletedElsewhere'
  | 'GtasksMoving_GtasksHiddenCompleted'
  | 'GtasksMoving_Any'
  | 'GtasksMoving_GmailThreadMissing'
  | 'GtasksMoving_Exception'
  | 'GtasksMoving_exit'
  | 'GtasksMoving_end'
  | 'GmailThreadMissing_Merged'
  | 'GmailThreadMissing_Merging'
  | 'GmailThreadMissing_ToDelete'
  | 'GmailThreadMissing_GtasksDeleted'
  | 'GmailThreadMissing_GtasksUncompletedElsewhere'
  | 'GmailThreadMissing_GtasksHiddenCompleted'
  | 'GmailThreadMissing_GtasksMoving'
  | 'GmailThreadMissing_Any'
  | 'GmailThreadMissing_Exception'
  | 'GmailThreadMissing_exit'
  | 'GmailThreadMissing_end'
  | 'Exception_Merged'
  | 'Exception_Merging'
  | 'Exception_ToDelete'
  | 'Exception_GtasksDeleted'
  | 'Exception_GtasksUncompletedElsewhere'
  | 'Exception_GtasksHiddenCompleted'
  | 'Exception_GtasksMoving'
  | 'Exception_GmailThreadMissing'
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
  Merged: IState;
  Merging: IState;
  ToDelete: IState;
  GtasksDeleted: IState;
  GtasksUncompletedElsewhere: IState;
  GtasksHiddenCompleted: IState;
  GtasksMoving: IState;
  GmailThreadMissing: IState;
  Exception?: IState;
}
