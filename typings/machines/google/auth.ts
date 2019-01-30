import {
  IState as IStateBase,
  IBind as IBindBase,
  IEmit as IEmitBase
} from 'asyncmachine/types'
import AsyncMachine from 'asyncmachine'

export { IBindBase, IEmitBase, AsyncMachine }

// ----- ----- ----- ----- -----
// STATE: CredentialsSet
// ----- ----- ----- ----- -----

/** machine.bind('CredentialsSet', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (event: 'CredentialsSet_enter', listener: (/* param1: any?, param2: any? */) => boolean | undefined, context?: Object): this;
  (event: 'CredentialsSet_state', listener: (/* param1: any?, param2: any? */) => any, context?: Object): this;
}

/** machine.emit('CredentialsSet', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'CredentialsSet_enter' /*, param1: any?, param2: any? */): boolean | void;
  (event: 'CredentialsSet_state' /*, param1: any?, param2: any? */): boolean | void;
}

/** Method declarations */
export interface ITransitions {
  CredentialsSet_enter?(/* param1: any?, param2: any? */): boolean | void;
  CredentialsSet_state?(/* param1: any?, param2: any? */): boolean | void | Promise<boolean | void>;
}

// ----- ----- ----- ----- -----
// STATE: Ready
// ----- ----- ----- ----- -----

/** machine.bind('Ready', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (event: 'Ready_enter', listener: (/* param1: any?, param2: any? */) => boolean | undefined, context?: Object): this;
  (event: 'Ready_state', listener: (/* param1: any?, param2: any? */) => any, context?: Object): this;
}

/** machine.emit('Ready', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'Ready_enter' /*, param1: any?, param2: any? */): boolean | void;
  (event: 'Ready_state' /*, param1: any?, param2: any? */): boolean | void;
}

/** Method declarations */
export interface ITransitions {
  Ready_enter?(/* param1: any?, param2: any? */): boolean | void;
  Ready_state?(/* param1: any?, param2: any? */): boolean | void | Promise<boolean | void>;
}

// ----- ----- ----- ----- -----
// STATE: Error
// ----- ----- ----- ----- -----

/** machine.bind('Error', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (event: 'Error_enter', listener: (/* param1: any?, param2: any? */) => boolean | undefined, context?: Object): this;
  (event: 'Error_state', listener: (/* param1: any?, param2: any? */) => any, context?: Object): this;
}

/** machine.emit('Error', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'Error_enter' /*, param1: any?, param2: any? */): boolean | void;
  (event: 'Error_state' /*, param1: any?, param2: any? */): boolean | void;
}

/** Method declarations */
export interface ITransitions {
  Error_enter?(/* param1: any?, param2: any? */): boolean | void;
  Error_state?(/* param1: any?, param2: any? */): boolean | void | Promise<boolean | void>;
}

// ----- ----- ----- ----- -----
// STATE: TokenRefreshed
// ----- ----- ----- ----- -----

/** machine.bind('TokenRefreshed', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (event: 'TokenRefreshed_enter', listener: (/* param1: any?, param2: any? */) => boolean | undefined, context?: Object): this;
  (event: 'TokenRefreshed_state', listener: (/* param1: any?, param2: any? */) => any, context?: Object): this;
}

/** machine.emit('TokenRefreshed', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'TokenRefreshed_enter' /*, param1: any?, param2: any? */): boolean | void;
  (event: 'TokenRefreshed_state' /*, param1: any?, param2: any? */): boolean | void;
}

/** Method declarations */
export interface ITransitions {
  TokenRefreshed_enter?(/* param1: any?, param2: any? */): boolean | void;
  TokenRefreshed_state?(/* param1: any?, param2: any? */): boolean | void | Promise<boolean | void>;
}

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
// STATE: RefreshingToken
// ----- ----- ----- ----- -----

/** machine.bind('RefreshingToken', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (event: 'RefreshingToken_enter', listener: (/* param1: any?, param2: any? */) => boolean | undefined, context?: Object): this;
  (event: 'RefreshingToken_state', listener: (/* param1: any?, param2: any? */) => any, context?: Object): this;
}

/** machine.emit('RefreshingToken', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'RefreshingToken_enter' /*, param1: any?, param2: any? */): boolean | void;
  (event: 'RefreshingToken_state' /*, param1: any?, param2: any? */): boolean | void;
}

/** Method declarations */
export interface ITransitions {
  RefreshingToken_enter?(/* param1: any?, param2: any? */): boolean | void;
  RefreshingToken_state?(/* param1: any?, param2: any? */): boolean | void | Promise<boolean | void>;
}

// ----- ----- -----
// GENERAL TYPES
// ----- ----- -----

/** All the possible transition methods the machine can define */
export interface ITransitions {
  CredentialsSet_Any?(): boolean | void;
  CredentialsSet_Ready?(): boolean | void;
  CredentialsSet_Error?(): boolean | void;
  CredentialsSet_TokenRefreshed?(): boolean | void;
  CredentialsSet_Enabled?(): boolean | void;
  CredentialsSet_RefreshingToken?(): boolean | void;
  CredentialsSet_Exception?(): boolean | void;
  CredentialsSet_exit?(): boolean | void;
  CredentialsSet_end?(): boolean | void | Promise<boolean | void>;
  Ready_CredentialsSet?(): boolean | void;
  Ready_Any?(): boolean | void;
  Ready_Error?(): boolean | void;
  Ready_TokenRefreshed?(): boolean | void;
  Ready_Enabled?(): boolean | void;
  Ready_RefreshingToken?(): boolean | void;
  Ready_Exception?(): boolean | void;
  Ready_exit?(): boolean | void;
  Ready_end?(): boolean | void | Promise<boolean | void>;
  Error_CredentialsSet?(): boolean | void;
  Error_Ready?(): boolean | void;
  Error_Any?(): boolean | void;
  Error_TokenRefreshed?(): boolean | void;
  Error_Enabled?(): boolean | void;
  Error_RefreshingToken?(): boolean | void;
  Error_Exception?(): boolean | void;
  Error_exit?(): boolean | void;
  Error_end?(): boolean | void | Promise<boolean | void>;
  TokenRefreshed_CredentialsSet?(): boolean | void;
  TokenRefreshed_Ready?(): boolean | void;
  TokenRefreshed_Error?(): boolean | void;
  TokenRefreshed_Any?(): boolean | void;
  TokenRefreshed_Enabled?(): boolean | void;
  TokenRefreshed_RefreshingToken?(): boolean | void;
  TokenRefreshed_Exception?(): boolean | void;
  TokenRefreshed_exit?(): boolean | void;
  TokenRefreshed_end?(): boolean | void | Promise<boolean | void>;
  Enabled_CredentialsSet?(): boolean | void;
  Enabled_Ready?(): boolean | void;
  Enabled_Error?(): boolean | void;
  Enabled_TokenRefreshed?(): boolean | void;
  Enabled_Any?(): boolean | void;
  Enabled_RefreshingToken?(): boolean | void;
  Enabled_Exception?(): boolean | void;
  Enabled_exit?(): boolean | void;
  Enabled_end?(): boolean | void | Promise<boolean | void>;
  RefreshingToken_CredentialsSet?(): boolean | void;
  RefreshingToken_Ready?(): boolean | void;
  RefreshingToken_Error?(): boolean | void;
  RefreshingToken_TokenRefreshed?(): boolean | void;
  RefreshingToken_Enabled?(): boolean | void;
  RefreshingToken_Any?(): boolean | void;
  RefreshingToken_Exception?(): boolean | void;
  RefreshingToken_exit?(): boolean | void;
  RefreshingToken_end?(): boolean | void | Promise<boolean | void>;
  Exception_CredentialsSet?(): boolean | void;
  Exception_Ready?(): boolean | void;
  Exception_Error?(): boolean | void;
  Exception_TokenRefreshed?(): boolean | void;
  Exception_Enabled?(): boolean | void;
  Exception_RefreshingToken?(): boolean | void;
  Exception_exit?(): boolean | void;
  Exception_end?(): boolean | void | Promise<boolean | void>;
}

/** All the state names */
export type TStates = 'CredentialsSet'
  | 'Ready'
  | 'Error'
  | 'TokenRefreshed'
  | 'Enabled'
  | 'RefreshingToken';

/** All the transition names */
export type TTransitions = 'CredentialsSet_Any'
  | 'CredentialsSet_Ready'
  | 'CredentialsSet_Error'
  | 'CredentialsSet_TokenRefreshed'
  | 'CredentialsSet_Enabled'
  | 'CredentialsSet_RefreshingToken'
  | 'CredentialsSet_Exception'
  | 'CredentialsSet_exit'
  | 'CredentialsSet_end'
  | 'Ready_CredentialsSet'
  | 'Ready_Any'
  | 'Ready_Error'
  | 'Ready_TokenRefreshed'
  | 'Ready_Enabled'
  | 'Ready_RefreshingToken'
  | 'Ready_Exception'
  | 'Ready_exit'
  | 'Ready_end'
  | 'Error_CredentialsSet'
  | 'Error_Ready'
  | 'Error_Any'
  | 'Error_TokenRefreshed'
  | 'Error_Enabled'
  | 'Error_RefreshingToken'
  | 'Error_Exception'
  | 'Error_exit'
  | 'Error_end'
  | 'TokenRefreshed_CredentialsSet'
  | 'TokenRefreshed_Ready'
  | 'TokenRefreshed_Error'
  | 'TokenRefreshed_Any'
  | 'TokenRefreshed_Enabled'
  | 'TokenRefreshed_RefreshingToken'
  | 'TokenRefreshed_Exception'
  | 'TokenRefreshed_exit'
  | 'TokenRefreshed_end'
  | 'Enabled_CredentialsSet'
  | 'Enabled_Ready'
  | 'Enabled_Error'
  | 'Enabled_TokenRefreshed'
  | 'Enabled_Any'
  | 'Enabled_RefreshingToken'
  | 'Enabled_Exception'
  | 'Enabled_exit'
  | 'Enabled_end'
  | 'RefreshingToken_CredentialsSet'
  | 'RefreshingToken_Ready'
  | 'RefreshingToken_Error'
  | 'RefreshingToken_TokenRefreshed'
  | 'RefreshingToken_Enabled'
  | 'RefreshingToken_Any'
  | 'RefreshingToken_Exception'
  | 'RefreshingToken_exit'
  | 'RefreshingToken_end'
  | 'Exception_CredentialsSet'
  | 'Exception_Ready'
  | 'Exception_Error'
  | 'Exception_TokenRefreshed'
  | 'Exception_Enabled'
  | 'Exception_RefreshingToken'
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
  CredentialsSet: IState;
  Ready: IState;
  Error: IState;
  TokenRefreshed: IState;
  Enabled: IState;
  RefreshingToken: IState;
  Exception?: IState;
}
