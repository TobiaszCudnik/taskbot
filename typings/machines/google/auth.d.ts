import {
  IState as IStateBase,
  IBind as IBindBase,
  IEmit as IEmitBase
} from 'asyncmachine/build/types'
import AsyncMachine from 'asyncmachine'
export { IBindBase, IEmitBase, AsyncMachine }
/** machine.bind('CredentialsSet', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'CredentialsSet_enter',
    listener: () => boolean | undefined,
    context?: Object
  ): this
  (event: 'CredentialsSet_state', listener: () => any, context?: Object): this
}
/** machine.emit('CredentialsSet', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'CredentialsSet_enter'): boolean | void
  (event: 'CredentialsSet_state'): boolean | void
}
/** Method declarations */
export interface ITransitions {
  CredentialsSet_enter?(): boolean | void
  CredentialsSet_state?(): boolean | void | Promise<boolean | void>
}
/** machine.bind('Ready', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'Ready_enter',
    listener: () => boolean | undefined,
    context?: Object
  ): this
  (event: 'Ready_state', listener: () => any, context?: Object): this
}
/** machine.emit('Ready', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'Ready_enter'): boolean | void
  (event: 'Ready_state'): boolean | void
}
/** Method declarations */
export interface ITransitions {
  Ready_enter?(): boolean | void
  Ready_state?(): boolean | void | Promise<boolean | void>
}
/** machine.bind('Error', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'Error_enter',
    listener: () => boolean | undefined,
    context?: Object
  ): this
  (event: 'Error_state', listener: () => any, context?: Object): this
}
/** machine.emit('Error', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'Error_enter'): boolean | void
  (event: 'Error_state'): boolean | void
}
/** Method declarations */
export interface ITransitions {
  Error_enter?(): boolean | void
  Error_state?(): boolean | void | Promise<boolean | void>
}
/** machine.bind('TokenRefreshed', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'TokenRefreshed_enter',
    listener: () => boolean | undefined,
    context?: Object
  ): this
  (event: 'TokenRefreshed_state', listener: () => any, context?: Object): this
}
/** machine.emit('TokenRefreshed', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'TokenRefreshed_enter'): boolean | void
  (event: 'TokenRefreshed_state'): boolean | void
}
/** Method declarations */
export interface ITransitions {
  TokenRefreshed_enter?(): boolean | void
  TokenRefreshed_state?(): boolean | void | Promise<boolean | void>
}
/** machine.bind('RefreshingToken', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'RefreshingToken_enter',
    listener: () => boolean | undefined,
    context?: Object
  ): this
  (event: 'RefreshingToken_state', listener: () => any, context?: Object): this
}
/** machine.emit('RefreshingToken', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'RefreshingToken_enter'): boolean | void
  (event: 'RefreshingToken_state'): boolean | void
}
/** Method declarations */
export interface ITransitions {
  RefreshingToken_enter?(): boolean | void
  RefreshingToken_state?(): boolean | void | Promise<boolean | void>
}
/** All the possible transition methods the machine can define */
export interface ITransitions {
  CredentialsSet_Any?(): boolean | void
  CredentialsSet_Ready?(): boolean | void
  CredentialsSet_Error?(): boolean | void
  CredentialsSet_TokenRefreshed?(): boolean | void
  CredentialsSet_RefreshingToken?(): boolean | void
  CredentialsSet_Exception?(): boolean | void
  CredentialsSet_exit?(): boolean | void
  CredentialsSet_end?(): boolean | void
  Ready_CredentialsSet?(): boolean | void
  Ready_Any?(): boolean | void
  Ready_Error?(): boolean | void
  Ready_TokenRefreshed?(): boolean | void
  Ready_RefreshingToken?(): boolean | void
  Ready_Exception?(): boolean | void
  Ready_exit?(): boolean | void
  Ready_end?(): boolean | void
  Error_CredentialsSet?(): boolean | void
  Error_Ready?(): boolean | void
  Error_Any?(): boolean | void
  Error_TokenRefreshed?(): boolean | void
  Error_RefreshingToken?(): boolean | void
  Error_Exception?(): boolean | void
  Error_exit?(): boolean | void
  Error_end?(): boolean | void
  TokenRefreshed_CredentialsSet?(): boolean | void
  TokenRefreshed_Ready?(): boolean | void
  TokenRefreshed_Error?(): boolean | void
  TokenRefreshed_Any?(): boolean | void
  TokenRefreshed_RefreshingToken?(): boolean | void
  TokenRefreshed_Exception?(): boolean | void
  TokenRefreshed_exit?(): boolean | void
  TokenRefreshed_end?(): boolean | void
  RefreshingToken_CredentialsSet?(): boolean | void
  RefreshingToken_Ready?(): boolean | void
  RefreshingToken_Error?(): boolean | void
  RefreshingToken_TokenRefreshed?(): boolean | void
  RefreshingToken_Any?(): boolean | void
  RefreshingToken_Exception?(): boolean | void
  RefreshingToken_exit?(): boolean | void
  RefreshingToken_end?(): boolean | void
  Exception_CredentialsSet?(): boolean | void
  Exception_Ready?(): boolean | void
  Exception_Error?(): boolean | void
  Exception_TokenRefreshed?(): boolean | void
  Exception_RefreshingToken?(): boolean | void
  Exception_exit?(): boolean | void
  Exception_end?(): boolean | void
}
/** All the state names */
export declare type TStates =
  | 'CredentialsSet'
  | 'Ready'
  | 'Error'
  | 'TokenRefreshed'
  | 'RefreshingToken'
/** All the transition names */
export declare type TTransitions =
  | 'CredentialsSet_Any'
  | 'CredentialsSet_Ready'
  | 'CredentialsSet_Error'
  | 'CredentialsSet_TokenRefreshed'
  | 'CredentialsSet_RefreshingToken'
  | 'CredentialsSet_Exception'
  | 'CredentialsSet_exit'
  | 'CredentialsSet_end'
  | 'Ready_CredentialsSet'
  | 'Ready_Any'
  | 'Ready_Error'
  | 'Ready_TokenRefreshed'
  | 'Ready_RefreshingToken'
  | 'Ready_Exception'
  | 'Ready_exit'
  | 'Ready_end'
  | 'Error_CredentialsSet'
  | 'Error_Ready'
  | 'Error_Any'
  | 'Error_TokenRefreshed'
  | 'Error_RefreshingToken'
  | 'Error_Exception'
  | 'Error_exit'
  | 'Error_end'
  | 'TokenRefreshed_CredentialsSet'
  | 'TokenRefreshed_Ready'
  | 'TokenRefreshed_Error'
  | 'TokenRefreshed_Any'
  | 'TokenRefreshed_RefreshingToken'
  | 'TokenRefreshed_Exception'
  | 'TokenRefreshed_exit'
  | 'TokenRefreshed_end'
  | 'RefreshingToken_CredentialsSet'
  | 'RefreshingToken_Ready'
  | 'RefreshingToken_Error'
  | 'RefreshingToken_TokenRefreshed'
  | 'RefreshingToken_Any'
  | 'RefreshingToken_Exception'
  | 'RefreshingToken_exit'
  | 'RefreshingToken_end'
  | 'Exception_CredentialsSet'
  | 'Exception_Ready'
  | 'Exception_Error'
  | 'Exception_TokenRefreshed'
  | 'Exception_RefreshingToken'
  | 'Exception_exit'
  | 'Exception_end'
/** Typesafe state interface */
export interface IState extends IStateBase<TStates> {}
/** Subclassable typesafe state interface */
export interface IStateExt<T extends string> extends IStateBase<T | TStates> {}
export interface IBind extends IBindBase {
  (event: TTransitions, listener: () => boolean | void, context?: Object): this
}
export interface IEmit extends IEmitBase {
  (event: TTransitions): boolean | void
}
export interface IJSONStates {
  CredentialsSet: IState
  Ready: IState
  Error: IState
  TokenRefreshed: IState
  RefreshingToken: IState
  Exception?: IState
}
