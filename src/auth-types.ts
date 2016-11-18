
import { IState as IStateBase } from 'asyncmachine/src/types'


export interface IBind {

    // CredentialsSet
    (event: 'CredentialsSet_enter', listener: (/* param1, param2 */) => boolean | undefined, context?: Object): this;
    (event: 'CredentialsSet_state', listener: (/* param1, param2 */) => any, context?: Object): this;
    // Ready
    (event: 'Ready_enter', listener: (/* param1, param2 */) => boolean | undefined, context?: Object): this;
    (event: 'Ready_state', listener: (/* param1, param2 */) => any, context?: Object): this;
    // Error
    (event: 'Error_enter', listener: (/* param1, param2 */) => boolean | undefined, context?: Object): this;
    (event: 'Error_state', listener: (/* param1, param2 */) => any, context?: Object): this;
    // TokenRefreshed
    (event: 'TokenRefreshed_enter', listener: (/* param1, param2 */) => boolean | undefined, context?: Object): this;
    (event: 'TokenRefreshed_state', listener: (/* param1, param2 */) => any, context?: Object): this;
    // RefreshingToken
    (event: 'RefreshingToken_enter', listener: (/* param1, param2 */) => boolean | undefined, context?: Object): this;
    (event: 'RefreshingToken_state', listener: (/* param1, param2 */) => any, context?: Object): this;

}

export interface IEmit {

    // CredentialsSet
    (event: 'CredentialsSet_enter' /*, param1, param2 */): this;
    (event: 'CredentialsSet_state' /*, param1, param2 */): this;
    // Ready
    (event: 'Ready_enter' /*, param1, param2 */): this;
    (event: 'Ready_state' /*, param1, param2 */): this;
    // Error
    (event: 'Error_enter' /*, param1, param2 */): this;
    (event: 'Error_state' /*, param1, param2 */): this;
    // TokenRefreshed
    (event: 'TokenRefreshed_enter' /*, param1, param2 */): this;
    (event: 'TokenRefreshed_state' /*, param1, param2 */): this;
    // RefreshingToken
    (event: 'RefreshingToken_enter' /*, param1, param2 */): this;
    (event: 'RefreshingToken_state' /*, param1, param2 */): this;

}

export type TStates = 'CredentialsSet'
  | 'Ready'
  | 'Error'
  | 'TokenRefreshed'
  | 'RefreshingToken';

export type TTransitions = 'CredentialsSet_Any'
  | 'CredentialsSet_Ready'
  | 'CredentialsSet_Error'
  | 'CredentialsSet_TokenRefreshed'
  | 'CredentialsSet_RefreshingToken'
  | 'CredentialsSet_Exception'
  | 'Ready_CredentialsSet'
  | 'Ready_Any'
  | 'Ready_Error'
  | 'Ready_TokenRefreshed'
  | 'Ready_RefreshingToken'
  | 'Ready_Exception'
  | 'Error_CredentialsSet'
  | 'Error_Ready'
  | 'Error_Any'
  | 'Error_TokenRefreshed'
  | 'Error_RefreshingToken'
  | 'Error_Exception'
  | 'TokenRefreshed_CredentialsSet'
  | 'TokenRefreshed_Ready'
  | 'TokenRefreshed_Error'
  | 'TokenRefreshed_Any'
  | 'TokenRefreshed_RefreshingToken'
  | 'TokenRefreshed_Exception'
  | 'RefreshingToken_CredentialsSet'
  | 'RefreshingToken_Ready'
  | 'RefreshingToken_Error'
  | 'RefreshingToken_TokenRefreshed'
  | 'RefreshingToken_Any'
  | 'RefreshingToken_Exception'
  | 'Exception_CredentialsSet'
  | 'Exception_Ready'
  | 'Exception_Error'
  | 'Exception_TokenRefreshed'
  | 'Exception_RefreshingToken';

// For this implementation
export interface IState extends IStateBase<TStates> {}

// For sub classes
export interface IStateExt<T extends string> extends IStateBase<T | TStates> {}

export interface IBind {

    // Non-params events
    (event: 'CredentialsSet_exit', listener: () => boolean | undefined, context?: Object): this;
    (event: 'CredentialsSet_end', listener: () => any, context?: Object): this;
    (event: 'Ready_exit', listener: () => boolean | undefined, context?: Object): this;
    (event: 'Ready_end', listener: () => any, context?: Object): this;
    (event: 'Error_exit', listener: () => boolean | undefined, context?: Object): this;
    (event: 'Error_end', listener: () => any, context?: Object): this;
    (event: 'TokenRefreshed_exit', listener: () => boolean | undefined, context?: Object): this;
    (event: 'TokenRefreshed_end', listener: () => any, context?: Object): this;
    (event: 'RefreshingToken_exit', listener: () => boolean | undefined, context?: Object): this;
    (event: 'RefreshingToken_end', listener: () => any, context?: Object): this;

    // Transitions
    (event: TTransitions): this;
}

export interface IEmit {
    // Non-params events
    (event: 'CredentialsSet_exit'): this;
    (event: 'CredentialsSet_end'): this;
    (event: 'Ready_exit'): this;
    (event: 'Ready_end'): this;
    (event: 'Error_exit'): this;
    (event: 'Error_end'): this;
    (event: 'TokenRefreshed_exit'): this;
    (event: 'TokenRefreshed_end'): this;
    (event: 'RefreshingToken_exit'): this;
    (event: 'RefreshingToken_end'): this;

    // Transitions
    (event: TTransitions): boolean;
}
