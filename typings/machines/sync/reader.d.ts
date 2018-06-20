import { IState as IStateBase, IBind as IBindBase, IEmit as IEmitBase } from 'asyncmachine/types';
import AsyncMachine from 'asyncmachine';
export { IBindBase, IEmitBase, AsyncMachine };
/** machine.bind('Enabled', (param1, param2) => {}) */
export interface IBind extends IBindBase {
    (event: 'Enabled_enter', listener: () => /* param1: any?, param2: any? */ boolean | undefined, context?: Object): this;
    (event: 'Enabled_state', listener: () => any, context?: Object): this;
}
/** machine.emit('Enabled', param1, param2) */
export interface IEmit extends IEmitBase {
    (event: 'Enabled_enter'): boolean | void;
    (event: 'Enabled_state'): boolean | void;
}
/** Method declarations */
export interface ITransitions {
    Enabled_enter?(): boolean | void;
    Enabled_state?(): boolean | void | Promise<boolean | void>;
}
/** machine.bind('Initializing', (param1, param2) => {}) */
export interface IBind extends IBindBase {
    (event: 'Initializing_enter', listener: () => /* param1: any?, param2: any? */ boolean | undefined, context?: Object): this;
    (event: 'Initializing_state', listener: () => any, context?: Object): this;
}
/** machine.emit('Initializing', param1, param2) */
export interface IEmit extends IEmitBase {
    (event: 'Initializing_enter'): boolean | void;
    (event: 'Initializing_state'): boolean | void;
}
/** Method declarations */
export interface ITransitions {
    Initializing_enter?(): boolean | void;
    Initializing_state?(): boolean | void | Promise<boolean | void>;
}
/** machine.bind('Ready', (param1, param2) => {}) */
export interface IBind extends IBindBase {
    (event: 'Ready_enter', listener: () => /* param1: any?, param2: any? */ boolean | undefined, context?: Object): this;
    (event: 'Ready_state', listener: () => any, context?: Object): this;
}
/** machine.emit('Ready', param1, param2) */
export interface IEmit extends IEmitBase {
    (event: 'Ready_enter'): boolean | void;
    (event: 'Ready_state'): boolean | void;
}
/** Method declarations */
export interface ITransitions {
    Ready_enter?(): boolean | void;
    Ready_state?(): boolean | void | Promise<boolean | void>;
}
/** machine.bind('ConfigSet', (param1, param2) => {}) */
export interface IBind extends IBindBase {
    (event: 'ConfigSet_enter', listener: () => /* param1: any?, param2: any? */ boolean | undefined, context?: Object): this;
    (event: 'ConfigSet_state', listener: () => any, context?: Object): this;
}
/** machine.emit('ConfigSet', param1, param2) */
export interface IEmit extends IEmitBase {
    (event: 'ConfigSet_enter'): boolean | void;
    (event: 'ConfigSet_state'): boolean | void;
}
/** Method declarations */
export interface ITransitions {
    ConfigSet_enter?(): boolean | void;
    ConfigSet_state?(): boolean | void | Promise<boolean | void>;
}
/** machine.bind('SubsReady', (param1, param2) => {}) */
export interface IBind extends IBindBase {
    (event: 'SubsReady_enter', listener: () => /* param1: any?, param2: any? */ boolean | undefined, context?: Object): this;
    (event: 'SubsReady_state', listener: () => any, context?: Object): this;
}
/** machine.emit('SubsReady', param1, param2) */
export interface IEmit extends IEmitBase {
    (event: 'SubsReady_enter'): boolean | void;
    (event: 'SubsReady_state'): boolean | void;
}
/** Method declarations */
export interface ITransitions {
    SubsReady_enter?(): boolean | void;
    SubsReady_state?(): boolean | void | Promise<boolean | void>;
}
/** machine.bind('SubsInited', (param1, param2) => {}) */
export interface IBind extends IBindBase {
    (event: 'SubsInited_enter', listener: () => /* param1: any?, param2: any? */ boolean | undefined, context?: Object): this;
    (event: 'SubsInited_state', listener: () => any, context?: Object): this;
}
/** machine.emit('SubsInited', param1, param2) */
export interface IEmit extends IEmitBase {
    (event: 'SubsInited_enter'): boolean | void;
    (event: 'SubsInited_state'): boolean | void;
}
/** Method declarations */
export interface ITransitions {
    SubsInited_enter?(): boolean | void;
    SubsInited_state?(): boolean | void | Promise<boolean | void>;
}
/** machine.bind('Reading', (param1, param2) => {}) */
export interface IBind extends IBindBase {
    (event: 'Reading_enter', listener: () => /* param1: any?, param2: any? */ boolean | undefined, context?: Object): this;
    (event: 'Reading_state', listener: () => any, context?: Object): this;
}
/** machine.emit('Reading', param1, param2) */
export interface IEmit extends IEmitBase {
    (event: 'Reading_enter'): boolean | void;
    (event: 'Reading_state'): boolean | void;
}
/** Method declarations */
export interface ITransitions {
    Reading_enter?(): boolean | void;
    Reading_state?(): boolean | void | Promise<boolean | void>;
}
/** machine.bind('ReadingDone', (param1, param2) => {}) */
export interface IBind extends IBindBase {
    (event: 'ReadingDone_enter', listener: () => /* param1: any?, param2: any? */ boolean | undefined, context?: Object): this;
    (event: 'ReadingDone_state', listener: () => any, context?: Object): this;
}
/** machine.emit('ReadingDone', param1, param2) */
export interface IEmit extends IEmitBase {
    (event: 'ReadingDone_enter'): boolean | void;
    (event: 'ReadingDone_state'): boolean | void;
}
/** Method declarations */
export interface ITransitions {
    ReadingDone_enter?(): boolean | void;
    ReadingDone_state?(): boolean | void | Promise<boolean | void>;
}
/** machine.bind('QuotaExceeded', (param1, param2) => {}) */
export interface IBind extends IBindBase {
    (event: 'QuotaExceeded_enter', listener: () => /* param1: any?, param2: any? */ boolean | undefined, context?: Object): this;
    (event: 'QuotaExceeded_state', listener: () => any, context?: Object): this;
}
/** machine.emit('QuotaExceeded', param1, param2) */
export interface IEmit extends IEmitBase {
    (event: 'QuotaExceeded_enter'): boolean | void;
    (event: 'QuotaExceeded_state'): boolean | void;
}
/** Method declarations */
export interface ITransitions {
    QuotaExceeded_enter?(): boolean | void;
    QuotaExceeded_state?(): boolean | void | Promise<boolean | void>;
}
/** machine.bind('RestartingNetwork', (param1, param2) => {}) */
export interface IBind extends IBindBase {
    (event: 'RestartingNetwork_enter', listener: () => /* param1: any?, param2: any? */ boolean | undefined, context?: Object): this;
    (event: 'RestartingNetwork_state', listener: () => any, context?: Object): this;
}
/** machine.emit('RestartingNetwork', param1, param2) */
export interface IEmit extends IEmitBase {
    (event: 'RestartingNetwork_enter'): boolean | void;
    (event: 'RestartingNetwork_state'): boolean | void;
}
/** Method declarations */
export interface ITransitions {
    RestartingNetwork_enter?(): boolean | void;
    RestartingNetwork_state?(): boolean | void | Promise<boolean | void>;
}
/** machine.bind('NetworkRestarted', (param1, param2) => {}) */
export interface IBind extends IBindBase {
    (event: 'NetworkRestarted_enter', listener: () => /* param1: any?, param2: any? */ boolean | undefined, context?: Object): this;
    (event: 'NetworkRestarted_state', listener: () => any, context?: Object): this;
}
/** machine.emit('NetworkRestarted', param1, param2) */
export interface IEmit extends IEmitBase {
    (event: 'NetworkRestarted_enter'): boolean | void;
    (event: 'NetworkRestarted_state'): boolean | void;
}
/** Method declarations */
export interface ITransitions {
    NetworkRestarted_enter?(): boolean | void;
    NetworkRestarted_state?(): boolean | void | Promise<boolean | void>;
}
/** All the possible transition methods the machine can define */
export interface ITransitions {
    Enabled_Any?(): boolean | void;
    Enabled_Initializing?(): boolean | void;
    Enabled_Ready?(): boolean | void;
    Enabled_ConfigSet?(): boolean | void;
    Enabled_SubsReady?(): boolean | void;
    Enabled_SubsInited?(): boolean | void;
    Enabled_Reading?(): boolean | void;
    Enabled_ReadingDone?(): boolean | void;
    Enabled_QuotaExceeded?(): boolean | void;
    Enabled_RestartingNetwork?(): boolean | void;
    Enabled_NetworkRestarted?(): boolean | void;
    Enabled_Exception?(): boolean | void;
    Enabled_exit?(): boolean | void;
    Enabled_end?(): boolean | void | Promise<boolean | void>;
    Initializing_Enabled?(): boolean | void;
    Initializing_Any?(): boolean | void;
    Initializing_Ready?(): boolean | void;
    Initializing_ConfigSet?(): boolean | void;
    Initializing_SubsReady?(): boolean | void;
    Initializing_SubsInited?(): boolean | void;
    Initializing_Reading?(): boolean | void;
    Initializing_ReadingDone?(): boolean | void;
    Initializing_QuotaExceeded?(): boolean | void;
    Initializing_RestartingNetwork?(): boolean | void;
    Initializing_NetworkRestarted?(): boolean | void;
    Initializing_Exception?(): boolean | void;
    Initializing_exit?(): boolean | void;
    Initializing_end?(): boolean | void | Promise<boolean | void>;
    Ready_Enabled?(): boolean | void;
    Ready_Initializing?(): boolean | void;
    Ready_Any?(): boolean | void;
    Ready_ConfigSet?(): boolean | void;
    Ready_SubsReady?(): boolean | void;
    Ready_SubsInited?(): boolean | void;
    Ready_Reading?(): boolean | void;
    Ready_ReadingDone?(): boolean | void;
    Ready_QuotaExceeded?(): boolean | void;
    Ready_RestartingNetwork?(): boolean | void;
    Ready_NetworkRestarted?(): boolean | void;
    Ready_Exception?(): boolean | void;
    Ready_exit?(): boolean | void;
    Ready_end?(): boolean | void | Promise<boolean | void>;
    ConfigSet_Enabled?(): boolean | void;
    ConfigSet_Initializing?(): boolean | void;
    ConfigSet_Ready?(): boolean | void;
    ConfigSet_Any?(): boolean | void;
    ConfigSet_SubsReady?(): boolean | void;
    ConfigSet_SubsInited?(): boolean | void;
    ConfigSet_Reading?(): boolean | void;
    ConfigSet_ReadingDone?(): boolean | void;
    ConfigSet_QuotaExceeded?(): boolean | void;
    ConfigSet_RestartingNetwork?(): boolean | void;
    ConfigSet_NetworkRestarted?(): boolean | void;
    ConfigSet_Exception?(): boolean | void;
    ConfigSet_exit?(): boolean | void;
    ConfigSet_end?(): boolean | void | Promise<boolean | void>;
    SubsReady_Enabled?(): boolean | void;
    SubsReady_Initializing?(): boolean | void;
    SubsReady_Ready?(): boolean | void;
    SubsReady_ConfigSet?(): boolean | void;
    SubsReady_Any?(): boolean | void;
    SubsReady_SubsInited?(): boolean | void;
    SubsReady_Reading?(): boolean | void;
    SubsReady_ReadingDone?(): boolean | void;
    SubsReady_QuotaExceeded?(): boolean | void;
    SubsReady_RestartingNetwork?(): boolean | void;
    SubsReady_NetworkRestarted?(): boolean | void;
    SubsReady_Exception?(): boolean | void;
    SubsReady_exit?(): boolean | void;
    SubsReady_end?(): boolean | void | Promise<boolean | void>;
    SubsInited_Enabled?(): boolean | void;
    SubsInited_Initializing?(): boolean | void;
    SubsInited_Ready?(): boolean | void;
    SubsInited_ConfigSet?(): boolean | void;
    SubsInited_SubsReady?(): boolean | void;
    SubsInited_Any?(): boolean | void;
    SubsInited_Reading?(): boolean | void;
    SubsInited_ReadingDone?(): boolean | void;
    SubsInited_QuotaExceeded?(): boolean | void;
    SubsInited_RestartingNetwork?(): boolean | void;
    SubsInited_NetworkRestarted?(): boolean | void;
    SubsInited_Exception?(): boolean | void;
    SubsInited_exit?(): boolean | void;
    SubsInited_end?(): boolean | void | Promise<boolean | void>;
    Reading_Enabled?(): boolean | void;
    Reading_Initializing?(): boolean | void;
    Reading_Ready?(): boolean | void;
    Reading_ConfigSet?(): boolean | void;
    Reading_SubsReady?(): boolean | void;
    Reading_SubsInited?(): boolean | void;
    Reading_Any?(): boolean | void;
    Reading_ReadingDone?(): boolean | void;
    Reading_QuotaExceeded?(): boolean | void;
    Reading_RestartingNetwork?(): boolean | void;
    Reading_NetworkRestarted?(): boolean | void;
    Reading_Exception?(): boolean | void;
    Reading_exit?(): boolean | void;
    Reading_end?(): boolean | void | Promise<boolean | void>;
    ReadingDone_Enabled?(): boolean | void;
    ReadingDone_Initializing?(): boolean | void;
    ReadingDone_Ready?(): boolean | void;
    ReadingDone_ConfigSet?(): boolean | void;
    ReadingDone_SubsReady?(): boolean | void;
    ReadingDone_SubsInited?(): boolean | void;
    ReadingDone_Reading?(): boolean | void;
    ReadingDone_Any?(): boolean | void;
    ReadingDone_QuotaExceeded?(): boolean | void;
    ReadingDone_RestartingNetwork?(): boolean | void;
    ReadingDone_NetworkRestarted?(): boolean | void;
    ReadingDone_Exception?(): boolean | void;
    ReadingDone_exit?(): boolean | void;
    ReadingDone_end?(): boolean | void | Promise<boolean | void>;
    QuotaExceeded_Enabled?(): boolean | void;
    QuotaExceeded_Initializing?(): boolean | void;
    QuotaExceeded_Ready?(): boolean | void;
    QuotaExceeded_ConfigSet?(): boolean | void;
    QuotaExceeded_SubsReady?(): boolean | void;
    QuotaExceeded_SubsInited?(): boolean | void;
    QuotaExceeded_Reading?(): boolean | void;
    QuotaExceeded_ReadingDone?(): boolean | void;
    QuotaExceeded_Any?(): boolean | void;
    QuotaExceeded_RestartingNetwork?(): boolean | void;
    QuotaExceeded_NetworkRestarted?(): boolean | void;
    QuotaExceeded_Exception?(): boolean | void;
    QuotaExceeded_exit?(): boolean | void;
    QuotaExceeded_end?(): boolean | void | Promise<boolean | void>;
    RestartingNetwork_Enabled?(): boolean | void;
    RestartingNetwork_Initializing?(): boolean | void;
    RestartingNetwork_Ready?(): boolean | void;
    RestartingNetwork_ConfigSet?(): boolean | void;
    RestartingNetwork_SubsReady?(): boolean | void;
    RestartingNetwork_SubsInited?(): boolean | void;
    RestartingNetwork_Reading?(): boolean | void;
    RestartingNetwork_ReadingDone?(): boolean | void;
    RestartingNetwork_QuotaExceeded?(): boolean | void;
    RestartingNetwork_Any?(): boolean | void;
    RestartingNetwork_NetworkRestarted?(): boolean | void;
    RestartingNetwork_Exception?(): boolean | void;
    RestartingNetwork_exit?(): boolean | void;
    RestartingNetwork_end?(): boolean | void | Promise<boolean | void>;
    NetworkRestarted_Enabled?(): boolean | void;
    NetworkRestarted_Initializing?(): boolean | void;
    NetworkRestarted_Ready?(): boolean | void;
    NetworkRestarted_ConfigSet?(): boolean | void;
    NetworkRestarted_SubsReady?(): boolean | void;
    NetworkRestarted_SubsInited?(): boolean | void;
    NetworkRestarted_Reading?(): boolean | void;
    NetworkRestarted_ReadingDone?(): boolean | void;
    NetworkRestarted_QuotaExceeded?(): boolean | void;
    NetworkRestarted_RestartingNetwork?(): boolean | void;
    NetworkRestarted_Any?(): boolean | void;
    NetworkRestarted_Exception?(): boolean | void;
    NetworkRestarted_exit?(): boolean | void;
    NetworkRestarted_end?(): boolean | void | Promise<boolean | void>;
    Exception_Enabled?(): boolean | void;
    Exception_Initializing?(): boolean | void;
    Exception_Ready?(): boolean | void;
    Exception_ConfigSet?(): boolean | void;
    Exception_SubsReady?(): boolean | void;
    Exception_SubsInited?(): boolean | void;
    Exception_Reading?(): boolean | void;
    Exception_ReadingDone?(): boolean | void;
    Exception_QuotaExceeded?(): boolean | void;
    Exception_RestartingNetwork?(): boolean | void;
    Exception_NetworkRestarted?(): boolean | void;
    Exception_exit?(): boolean | void;
    Exception_end?(): boolean | void | Promise<boolean | void>;
}
/** All the state names */
export declare type TStates = 'Enabled' | 'Initializing' | 'Ready' | 'ConfigSet' | 'SubsReady' | 'SubsInited' | 'Reading' | 'ReadingDone' | 'QuotaExceeded' | 'RestartingNetwork' | 'NetworkRestarted';
/** All the transition names */
export declare type TTransitions = 'Enabled_Any' | 'Enabled_Initializing' | 'Enabled_Ready' | 'Enabled_ConfigSet' | 'Enabled_SubsReady' | 'Enabled_SubsInited' | 'Enabled_Reading' | 'Enabled_ReadingDone' | 'Enabled_QuotaExceeded' | 'Enabled_RestartingNetwork' | 'Enabled_NetworkRestarted' | 'Enabled_Exception' | 'Enabled_exit' | 'Enabled_end' | 'Initializing_Enabled' | 'Initializing_Any' | 'Initializing_Ready' | 'Initializing_ConfigSet' | 'Initializing_SubsReady' | 'Initializing_SubsInited' | 'Initializing_Reading' | 'Initializing_ReadingDone' | 'Initializing_QuotaExceeded' | 'Initializing_RestartingNetwork' | 'Initializing_NetworkRestarted' | 'Initializing_Exception' | 'Initializing_exit' | 'Initializing_end' | 'Ready_Enabled' | 'Ready_Initializing' | 'Ready_Any' | 'Ready_ConfigSet' | 'Ready_SubsReady' | 'Ready_SubsInited' | 'Ready_Reading' | 'Ready_ReadingDone' | 'Ready_QuotaExceeded' | 'Ready_RestartingNetwork' | 'Ready_NetworkRestarted' | 'Ready_Exception' | 'Ready_exit' | 'Ready_end' | 'ConfigSet_Enabled' | 'ConfigSet_Initializing' | 'ConfigSet_Ready' | 'ConfigSet_Any' | 'ConfigSet_SubsReady' | 'ConfigSet_SubsInited' | 'ConfigSet_Reading' | 'ConfigSet_ReadingDone' | 'ConfigSet_QuotaExceeded' | 'ConfigSet_RestartingNetwork' | 'ConfigSet_NetworkRestarted' | 'ConfigSet_Exception' | 'ConfigSet_exit' | 'ConfigSet_end' | 'SubsReady_Enabled' | 'SubsReady_Initializing' | 'SubsReady_Ready' | 'SubsReady_ConfigSet' | 'SubsReady_Any' | 'SubsReady_SubsInited' | 'SubsReady_Reading' | 'SubsReady_ReadingDone' | 'SubsReady_QuotaExceeded' | 'SubsReady_RestartingNetwork' | 'SubsReady_NetworkRestarted' | 'SubsReady_Exception' | 'SubsReady_exit' | 'SubsReady_end' | 'SubsInited_Enabled' | 'SubsInited_Initializing' | 'SubsInited_Ready' | 'SubsInited_ConfigSet' | 'SubsInited_SubsReady' | 'SubsInited_Any' | 'SubsInited_Reading' | 'SubsInited_ReadingDone' | 'SubsInited_QuotaExceeded' | 'SubsInited_RestartingNetwork' | 'SubsInited_NetworkRestarted' | 'SubsInited_Exception' | 'SubsInited_exit' | 'SubsInited_end' | 'Reading_Enabled' | 'Reading_Initializing' | 'Reading_Ready' | 'Reading_ConfigSet' | 'Reading_SubsReady' | 'Reading_SubsInited' | 'Reading_Any' | 'Reading_ReadingDone' | 'Reading_QuotaExceeded' | 'Reading_RestartingNetwork' | 'Reading_NetworkRestarted' | 'Reading_Exception' | 'Reading_exit' | 'Reading_end' | 'ReadingDone_Enabled' | 'ReadingDone_Initializing' | 'ReadingDone_Ready' | 'ReadingDone_ConfigSet' | 'ReadingDone_SubsReady' | 'ReadingDone_SubsInited' | 'ReadingDone_Reading' | 'ReadingDone_Any' | 'ReadingDone_QuotaExceeded' | 'ReadingDone_RestartingNetwork' | 'ReadingDone_NetworkRestarted' | 'ReadingDone_Exception' | 'ReadingDone_exit' | 'ReadingDone_end' | 'QuotaExceeded_Enabled' | 'QuotaExceeded_Initializing' | 'QuotaExceeded_Ready' | 'QuotaExceeded_ConfigSet' | 'QuotaExceeded_SubsReady' | 'QuotaExceeded_SubsInited' | 'QuotaExceeded_Reading' | 'QuotaExceeded_ReadingDone' | 'QuotaExceeded_Any' | 'QuotaExceeded_RestartingNetwork' | 'QuotaExceeded_NetworkRestarted' | 'QuotaExceeded_Exception' | 'QuotaExceeded_exit' | 'QuotaExceeded_end' | 'RestartingNetwork_Enabled' | 'RestartingNetwork_Initializing' | 'RestartingNetwork_Ready' | 'RestartingNetwork_ConfigSet' | 'RestartingNetwork_SubsReady' | 'RestartingNetwork_SubsInited' | 'RestartingNetwork_Reading' | 'RestartingNetwork_ReadingDone' | 'RestartingNetwork_QuotaExceeded' | 'RestartingNetwork_Any' | 'RestartingNetwork_NetworkRestarted' | 'RestartingNetwork_Exception' | 'RestartingNetwork_exit' | 'RestartingNetwork_end' | 'NetworkRestarted_Enabled' | 'NetworkRestarted_Initializing' | 'NetworkRestarted_Ready' | 'NetworkRestarted_ConfigSet' | 'NetworkRestarted_SubsReady' | 'NetworkRestarted_SubsInited' | 'NetworkRestarted_Reading' | 'NetworkRestarted_ReadingDone' | 'NetworkRestarted_QuotaExceeded' | 'NetworkRestarted_RestartingNetwork' | 'NetworkRestarted_Any' | 'NetworkRestarted_Exception' | 'NetworkRestarted_exit' | 'NetworkRestarted_end' | 'Exception_Enabled' | 'Exception_Initializing' | 'Exception_Ready' | 'Exception_ConfigSet' | 'Exception_SubsReady' | 'Exception_SubsInited' | 'Exception_Reading' | 'Exception_ReadingDone' | 'Exception_QuotaExceeded' | 'Exception_RestartingNetwork' | 'Exception_NetworkRestarted' | 'Exception_exit' | 'Exception_end';
/** Typesafe state interface */
export interface IState extends IStateBase<TStates> {
}
/** Subclassable typesafe state interface */
export interface IStateExt<T extends string> extends IStateBase<T | TStates> {
}
export interface IBind extends IBindBase {
    (event: TTransitions, listener: () => boolean | void, context?: Object): this;
}
export interface IEmit extends IEmitBase {
    (event: TTransitions): boolean | void;
}
export interface IJSONStates {
    Enabled: IState;
    Initializing: IState;
    Ready: IState;
    ConfigSet: IState;
    SubsReady: IState;
    SubsInited: IState;
    Reading: IState;
    ReadingDone: IState;
    QuotaExceeded: IState;
    RestartingNetwork: IState;
    NetworkRestarted: IState;
    Exception?: IState;
}
