import {
  IState as IStateBase,
  IBind as IBindBase,
  IEmit as IEmitBase
} from 'asyncmachine/build/types'
import AsyncMachine from 'asyncmachine'
export { IBindBase, IEmitBase, AsyncMachine }
/** machine.bind('Enabled', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'Enabled_enter',
    listener: () => boolean | undefined,
    context?: Object
  ): this
  (event: 'Enabled_state', listener: () => any, context?: Object): this
}
/** machine.emit('Enabled', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'Enabled_enter'): boolean | void
  (event: 'Enabled_state'): boolean | void
}
/** Method declarations */
export interface ITransitions {
  Enabled_enter?(): boolean | void
  Enabled_state?(): boolean | void | Promise<boolean | void>
}
/** machine.bind('Initializing', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'Initializing_enter',
    listener: () => boolean | undefined,
    context?: Object
  ): this
  (event: 'Initializing_state', listener: () => any, context?: Object): this
}
/** machine.emit('Initializing', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'Initializing_enter'): boolean | void
  (event: 'Initializing_state'): boolean | void
}
/** Method declarations */
export interface ITransitions {
  Initializing_enter?(): boolean | void
  Initializing_state?(): boolean | void | Promise<boolean | void>
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
/** machine.bind('ConfigSet', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'ConfigSet_enter',
    listener: () => boolean | undefined,
    context?: Object
  ): this
  (event: 'ConfigSet_state', listener: () => any, context?: Object): this
}
/** machine.emit('ConfigSet', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'ConfigSet_enter'): boolean | void
  (event: 'ConfigSet_state'): boolean | void
}
/** Method declarations */
export interface ITransitions {
  ConfigSet_enter?(): boolean | void
  ConfigSet_state?(): boolean | void | Promise<boolean | void>
}
/** machine.bind('SubsReady', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'SubsReady_enter',
    listener: () => boolean | undefined,
    context?: Object
  ): this
  (event: 'SubsReady_state', listener: () => any, context?: Object): this
}
/** machine.emit('SubsReady', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'SubsReady_enter'): boolean | void
  (event: 'SubsReady_state'): boolean | void
}
/** Method declarations */
export interface ITransitions {
  SubsReady_enter?(): boolean | void
  SubsReady_state?(): boolean | void | Promise<boolean | void>
}
/** machine.bind('SubsInited', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'SubsInited_enter',
    listener: () => boolean | undefined,
    context?: Object
  ): this
  (event: 'SubsInited_state', listener: () => any, context?: Object): this
}
/** machine.emit('SubsInited', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'SubsInited_enter'): boolean | void
  (event: 'SubsInited_state'): boolean | void
}
/** Method declarations */
export interface ITransitions {
  SubsInited_enter?(): boolean | void
  SubsInited_state?(): boolean | void | Promise<boolean | void>
}
/** machine.bind('Reading', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'Reading_enter',
    listener: () => boolean | undefined,
    context?: Object
  ): this
  (event: 'Reading_state', listener: () => any, context?: Object): this
}
/** machine.emit('Reading', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'Reading_enter'): boolean | void
  (event: 'Reading_state'): boolean | void
}
/** Method declarations */
export interface ITransitions {
  Reading_enter?(): boolean | void
  Reading_state?(): boolean | void | Promise<boolean | void>
}
/** machine.bind('ReadingDone', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'ReadingDone_enter',
    listener: () => boolean | undefined,
    context?: Object
  ): this
  (event: 'ReadingDone_state', listener: () => any, context?: Object): this
}
/** machine.emit('ReadingDone', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'ReadingDone_enter'): boolean | void
  (event: 'ReadingDone_state'): boolean | void
}
/** Method declarations */
export interface ITransitions {
  ReadingDone_enter?(): boolean | void
  ReadingDone_state?(): boolean | void | Promise<boolean | void>
}
/** machine.bind('Writing', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'Writing_enter',
    listener: () => boolean | undefined,
    context?: Object
  ): this
  (event: 'Writing_state', listener: () => any, context?: Object): this
}
/** machine.emit('Writing', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'Writing_enter'): boolean | void
  (event: 'Writing_state'): boolean | void
}
/** Method declarations */
export interface ITransitions {
  Writing_enter?(): boolean | void
  Writing_state?(): boolean | void | Promise<boolean | void>
}
/** machine.bind('WritingDone', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'WritingDone_enter',
    listener: () => boolean | undefined,
    context?: Object
  ): this
  (event: 'WritingDone_state', listener: () => any, context?: Object): this
}
/** machine.emit('WritingDone', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'WritingDone_enter'): boolean | void
  (event: 'WritingDone_state'): boolean | void
}
/** Method declarations */
export interface ITransitions {
  WritingDone_enter?(): boolean | void
  WritingDone_state?(): boolean | void | Promise<boolean | void>
}
/** machine.bind('FetchingLabels', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'FetchingLabels_enter',
    listener: () => boolean | undefined,
    context?: Object
  ): this
  (event: 'FetchingLabels_state', listener: () => any, context?: Object): this
}
/** machine.emit('FetchingLabels', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'FetchingLabels_enter'): boolean | void
  (event: 'FetchingLabels_state'): boolean | void
}
/** Method declarations */
export interface ITransitions {
  FetchingLabels_enter?(): boolean | void
  FetchingLabels_state?(): boolean | void | Promise<boolean | void>
}
/** machine.bind('LabelsFetched', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'LabelsFetched_enter',
    listener: () => boolean | undefined,
    context?: Object
  ): this
  (event: 'LabelsFetched_state', listener: () => any, context?: Object): this
}
/** machine.emit('LabelsFetched', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'LabelsFetched_enter'): boolean | void
  (event: 'LabelsFetched_state'): boolean | void
}
/** Method declarations */
export interface ITransitions {
  LabelsFetched_enter?(): boolean | void
  LabelsFetched_state?(): boolean | void | Promise<boolean | void>
}
/** machine.bind('FetchingHistoryId', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'FetchingHistoryId_enter',
    listener: () => boolean | undefined,
    context?: Object
  ): this
  (
    event: 'FetchingHistoryId_state',
    listener: () => any,
    context?: Object
  ): this
}
/** machine.emit('FetchingHistoryId', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'FetchingHistoryId_enter'): boolean | void
  (event: 'FetchingHistoryId_state'): boolean | void
}
/** Method declarations */
export interface ITransitions {
  FetchingHistoryId_enter?(): boolean | void
  FetchingHistoryId_state?(): boolean | void | Promise<boolean | void>
}
/** machine.bind('HistoryIdFetched', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'HistoryIdFetched_enter',
    listener: () => boolean | undefined,
    context?: Object
  ): this
  (event: 'HistoryIdFetched_state', listener: () => any, context?: Object): this
}
/** machine.emit('HistoryIdFetched', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'HistoryIdFetched_enter'): boolean | void
  (event: 'HistoryIdFetched_state'): boolean | void
}
/** Method declarations */
export interface ITransitions {
  HistoryIdFetched_enter?(): boolean | void
  HistoryIdFetched_state?(): boolean | void | Promise<boolean | void>
}
/** machine.bind('InitialHistoryIdFetched', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'InitialHistoryIdFetched_enter',
    listener: () => boolean | undefined,
    context?: Object
  ): this
  (
    event: 'InitialHistoryIdFetched_state',
    listener: () => any,
    context?: Object
  ): this
}
/** machine.emit('InitialHistoryIdFetched', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'InitialHistoryIdFetched_enter'): boolean | void
  (event: 'InitialHistoryIdFetched_state'): boolean | void
}
/** Method declarations */
export interface ITransitions {
  InitialHistoryIdFetched_enter?(): boolean | void
  InitialHistoryIdFetched_state?(): boolean | void | Promise<boolean | void>
}
/** All the possible transition methods the machine can define */
export interface ITransitions {
  Enabled_Any?(): boolean | void
  Enabled_Initializing?(): boolean | void
  Enabled_Ready?(): boolean | void
  Enabled_ConfigSet?(): boolean | void
  Enabled_SubsReady?(): boolean | void
  Enabled_SubsInited?(): boolean | void
  Enabled_Reading?(): boolean | void
  Enabled_ReadingDone?(): boolean | void
  Enabled_Writing?(): boolean | void
  Enabled_WritingDone?(): boolean | void
  Enabled_FetchingLabels?(): boolean | void
  Enabled_LabelsFetched?(): boolean | void
  Enabled_FetchingHistoryId?(): boolean | void
  Enabled_HistoryIdFetched?(): boolean | void
  Enabled_InitialHistoryIdFetched?(): boolean | void
  Enabled_Exception?(): boolean | void
  Enabled_exit?(): boolean | void
  Enabled_end?(): boolean | void
  Initializing_Enabled?(): boolean | void
  Initializing_Any?(): boolean | void
  Initializing_Ready?(): boolean | void
  Initializing_ConfigSet?(): boolean | void
  Initializing_SubsReady?(): boolean | void
  Initializing_SubsInited?(): boolean | void
  Initializing_Reading?(): boolean | void
  Initializing_ReadingDone?(): boolean | void
  Initializing_Writing?(): boolean | void
  Initializing_WritingDone?(): boolean | void
  Initializing_FetchingLabels?(): boolean | void
  Initializing_LabelsFetched?(): boolean | void
  Initializing_FetchingHistoryId?(): boolean | void
  Initializing_HistoryIdFetched?(): boolean | void
  Initializing_InitialHistoryIdFetched?(): boolean | void
  Initializing_Exception?(): boolean | void
  Initializing_exit?(): boolean | void
  Initializing_end?(): boolean | void
  Ready_Enabled?(): boolean | void
  Ready_Initializing?(): boolean | void
  Ready_Any?(): boolean | void
  Ready_ConfigSet?(): boolean | void
  Ready_SubsReady?(): boolean | void
  Ready_SubsInited?(): boolean | void
  Ready_Reading?(): boolean | void
  Ready_ReadingDone?(): boolean | void
  Ready_Writing?(): boolean | void
  Ready_WritingDone?(): boolean | void
  Ready_FetchingLabels?(): boolean | void
  Ready_LabelsFetched?(): boolean | void
  Ready_FetchingHistoryId?(): boolean | void
  Ready_HistoryIdFetched?(): boolean | void
  Ready_InitialHistoryIdFetched?(): boolean | void
  Ready_Exception?(): boolean | void
  Ready_exit?(): boolean | void
  Ready_end?(): boolean | void
  ConfigSet_Enabled?(): boolean | void
  ConfigSet_Initializing?(): boolean | void
  ConfigSet_Ready?(): boolean | void
  ConfigSet_Any?(): boolean | void
  ConfigSet_SubsReady?(): boolean | void
  ConfigSet_SubsInited?(): boolean | void
  ConfigSet_Reading?(): boolean | void
  ConfigSet_ReadingDone?(): boolean | void
  ConfigSet_Writing?(): boolean | void
  ConfigSet_WritingDone?(): boolean | void
  ConfigSet_FetchingLabels?(): boolean | void
  ConfigSet_LabelsFetched?(): boolean | void
  ConfigSet_FetchingHistoryId?(): boolean | void
  ConfigSet_HistoryIdFetched?(): boolean | void
  ConfigSet_InitialHistoryIdFetched?(): boolean | void
  ConfigSet_Exception?(): boolean | void
  ConfigSet_exit?(): boolean | void
  ConfigSet_end?(): boolean | void
  SubsReady_Enabled?(): boolean | void
  SubsReady_Initializing?(): boolean | void
  SubsReady_Ready?(): boolean | void
  SubsReady_ConfigSet?(): boolean | void
  SubsReady_Any?(): boolean | void
  SubsReady_SubsInited?(): boolean | void
  SubsReady_Reading?(): boolean | void
  SubsReady_ReadingDone?(): boolean | void
  SubsReady_Writing?(): boolean | void
  SubsReady_WritingDone?(): boolean | void
  SubsReady_FetchingLabels?(): boolean | void
  SubsReady_LabelsFetched?(): boolean | void
  SubsReady_FetchingHistoryId?(): boolean | void
  SubsReady_HistoryIdFetched?(): boolean | void
  SubsReady_InitialHistoryIdFetched?(): boolean | void
  SubsReady_Exception?(): boolean | void
  SubsReady_exit?(): boolean | void
  SubsReady_end?(): boolean | void
  SubsInited_Enabled?(): boolean | void
  SubsInited_Initializing?(): boolean | void
  SubsInited_Ready?(): boolean | void
  SubsInited_ConfigSet?(): boolean | void
  SubsInited_SubsReady?(): boolean | void
  SubsInited_Any?(): boolean | void
  SubsInited_Reading?(): boolean | void
  SubsInited_ReadingDone?(): boolean | void
  SubsInited_Writing?(): boolean | void
  SubsInited_WritingDone?(): boolean | void
  SubsInited_FetchingLabels?(): boolean | void
  SubsInited_LabelsFetched?(): boolean | void
  SubsInited_FetchingHistoryId?(): boolean | void
  SubsInited_HistoryIdFetched?(): boolean | void
  SubsInited_InitialHistoryIdFetched?(): boolean | void
  SubsInited_Exception?(): boolean | void
  SubsInited_exit?(): boolean | void
  SubsInited_end?(): boolean | void
  Reading_Enabled?(): boolean | void
  Reading_Initializing?(): boolean | void
  Reading_Ready?(): boolean | void
  Reading_ConfigSet?(): boolean | void
  Reading_SubsReady?(): boolean | void
  Reading_SubsInited?(): boolean | void
  Reading_Any?(): boolean | void
  Reading_ReadingDone?(): boolean | void
  Reading_Writing?(): boolean | void
  Reading_WritingDone?(): boolean | void
  Reading_FetchingLabels?(): boolean | void
  Reading_LabelsFetched?(): boolean | void
  Reading_FetchingHistoryId?(): boolean | void
  Reading_HistoryIdFetched?(): boolean | void
  Reading_InitialHistoryIdFetched?(): boolean | void
  Reading_Exception?(): boolean | void
  Reading_exit?(): boolean | void
  Reading_end?(): boolean | void
  ReadingDone_Enabled?(): boolean | void
  ReadingDone_Initializing?(): boolean | void
  ReadingDone_Ready?(): boolean | void
  ReadingDone_ConfigSet?(): boolean | void
  ReadingDone_SubsReady?(): boolean | void
  ReadingDone_SubsInited?(): boolean | void
  ReadingDone_Reading?(): boolean | void
  ReadingDone_Any?(): boolean | void
  ReadingDone_Writing?(): boolean | void
  ReadingDone_WritingDone?(): boolean | void
  ReadingDone_FetchingLabels?(): boolean | void
  ReadingDone_LabelsFetched?(): boolean | void
  ReadingDone_FetchingHistoryId?(): boolean | void
  ReadingDone_HistoryIdFetched?(): boolean | void
  ReadingDone_InitialHistoryIdFetched?(): boolean | void
  ReadingDone_Exception?(): boolean | void
  ReadingDone_exit?(): boolean | void
  ReadingDone_end?(): boolean | void
  Writing_Enabled?(): boolean | void
  Writing_Initializing?(): boolean | void
  Writing_Ready?(): boolean | void
  Writing_ConfigSet?(): boolean | void
  Writing_SubsReady?(): boolean | void
  Writing_SubsInited?(): boolean | void
  Writing_Reading?(): boolean | void
  Writing_ReadingDone?(): boolean | void
  Writing_Any?(): boolean | void
  Writing_WritingDone?(): boolean | void
  Writing_FetchingLabels?(): boolean | void
  Writing_LabelsFetched?(): boolean | void
  Writing_FetchingHistoryId?(): boolean | void
  Writing_HistoryIdFetched?(): boolean | void
  Writing_InitialHistoryIdFetched?(): boolean | void
  Writing_Exception?(): boolean | void
  Writing_exit?(): boolean | void
  Writing_end?(): boolean | void
  WritingDone_Enabled?(): boolean | void
  WritingDone_Initializing?(): boolean | void
  WritingDone_Ready?(): boolean | void
  WritingDone_ConfigSet?(): boolean | void
  WritingDone_SubsReady?(): boolean | void
  WritingDone_SubsInited?(): boolean | void
  WritingDone_Reading?(): boolean | void
  WritingDone_ReadingDone?(): boolean | void
  WritingDone_Writing?(): boolean | void
  WritingDone_Any?(): boolean | void
  WritingDone_FetchingLabels?(): boolean | void
  WritingDone_LabelsFetched?(): boolean | void
  WritingDone_FetchingHistoryId?(): boolean | void
  WritingDone_HistoryIdFetched?(): boolean | void
  WritingDone_InitialHistoryIdFetched?(): boolean | void
  WritingDone_Exception?(): boolean | void
  WritingDone_exit?(): boolean | void
  WritingDone_end?(): boolean | void
  FetchingLabels_Enabled?(): boolean | void
  FetchingLabels_Initializing?(): boolean | void
  FetchingLabels_Ready?(): boolean | void
  FetchingLabels_ConfigSet?(): boolean | void
  FetchingLabels_SubsReady?(): boolean | void
  FetchingLabels_SubsInited?(): boolean | void
  FetchingLabels_Reading?(): boolean | void
  FetchingLabels_ReadingDone?(): boolean | void
  FetchingLabels_Writing?(): boolean | void
  FetchingLabels_WritingDone?(): boolean | void
  FetchingLabels_Any?(): boolean | void
  FetchingLabels_LabelsFetched?(): boolean | void
  FetchingLabels_FetchingHistoryId?(): boolean | void
  FetchingLabels_HistoryIdFetched?(): boolean | void
  FetchingLabels_InitialHistoryIdFetched?(): boolean | void
  FetchingLabels_Exception?(): boolean | void
  FetchingLabels_exit?(): boolean | void
  FetchingLabels_end?(): boolean | void
  LabelsFetched_Enabled?(): boolean | void
  LabelsFetched_Initializing?(): boolean | void
  LabelsFetched_Ready?(): boolean | void
  LabelsFetched_ConfigSet?(): boolean | void
  LabelsFetched_SubsReady?(): boolean | void
  LabelsFetched_SubsInited?(): boolean | void
  LabelsFetched_Reading?(): boolean | void
  LabelsFetched_ReadingDone?(): boolean | void
  LabelsFetched_Writing?(): boolean | void
  LabelsFetched_WritingDone?(): boolean | void
  LabelsFetched_FetchingLabels?(): boolean | void
  LabelsFetched_Any?(): boolean | void
  LabelsFetched_FetchingHistoryId?(): boolean | void
  LabelsFetched_HistoryIdFetched?(): boolean | void
  LabelsFetched_InitialHistoryIdFetched?(): boolean | void
  LabelsFetched_Exception?(): boolean | void
  LabelsFetched_exit?(): boolean | void
  LabelsFetched_end?(): boolean | void
  FetchingHistoryId_Enabled?(): boolean | void
  FetchingHistoryId_Initializing?(): boolean | void
  FetchingHistoryId_Ready?(): boolean | void
  FetchingHistoryId_ConfigSet?(): boolean | void
  FetchingHistoryId_SubsReady?(): boolean | void
  FetchingHistoryId_SubsInited?(): boolean | void
  FetchingHistoryId_Reading?(): boolean | void
  FetchingHistoryId_ReadingDone?(): boolean | void
  FetchingHistoryId_Writing?(): boolean | void
  FetchingHistoryId_WritingDone?(): boolean | void
  FetchingHistoryId_FetchingLabels?(): boolean | void
  FetchingHistoryId_LabelsFetched?(): boolean | void
  FetchingHistoryId_Any?(): boolean | void
  FetchingHistoryId_HistoryIdFetched?(): boolean | void
  FetchingHistoryId_InitialHistoryIdFetched?(): boolean | void
  FetchingHistoryId_Exception?(): boolean | void
  FetchingHistoryId_exit?(): boolean | void
  FetchingHistoryId_end?(): boolean | void
  HistoryIdFetched_Enabled?(): boolean | void
  HistoryIdFetched_Initializing?(): boolean | void
  HistoryIdFetched_Ready?(): boolean | void
  HistoryIdFetched_ConfigSet?(): boolean | void
  HistoryIdFetched_SubsReady?(): boolean | void
  HistoryIdFetched_SubsInited?(): boolean | void
  HistoryIdFetched_Reading?(): boolean | void
  HistoryIdFetched_ReadingDone?(): boolean | void
  HistoryIdFetched_Writing?(): boolean | void
  HistoryIdFetched_WritingDone?(): boolean | void
  HistoryIdFetched_FetchingLabels?(): boolean | void
  HistoryIdFetched_LabelsFetched?(): boolean | void
  HistoryIdFetched_FetchingHistoryId?(): boolean | void
  HistoryIdFetched_Any?(): boolean | void
  HistoryIdFetched_InitialHistoryIdFetched?(): boolean | void
  HistoryIdFetched_Exception?(): boolean | void
  HistoryIdFetched_exit?(): boolean | void
  HistoryIdFetched_end?(): boolean | void
  InitialHistoryIdFetched_Enabled?(): boolean | void
  InitialHistoryIdFetched_Initializing?(): boolean | void
  InitialHistoryIdFetched_Ready?(): boolean | void
  InitialHistoryIdFetched_ConfigSet?(): boolean | void
  InitialHistoryIdFetched_SubsReady?(): boolean | void
  InitialHistoryIdFetched_SubsInited?(): boolean | void
  InitialHistoryIdFetched_Reading?(): boolean | void
  InitialHistoryIdFetched_ReadingDone?(): boolean | void
  InitialHistoryIdFetched_Writing?(): boolean | void
  InitialHistoryIdFetched_WritingDone?(): boolean | void
  InitialHistoryIdFetched_FetchingLabels?(): boolean | void
  InitialHistoryIdFetched_LabelsFetched?(): boolean | void
  InitialHistoryIdFetched_FetchingHistoryId?(): boolean | void
  InitialHistoryIdFetched_HistoryIdFetched?(): boolean | void
  InitialHistoryIdFetched_Any?(): boolean | void
  InitialHistoryIdFetched_Exception?(): boolean | void
  InitialHistoryIdFetched_exit?(): boolean | void
  InitialHistoryIdFetched_end?(): boolean | void
  Exception_Enabled?(): boolean | void
  Exception_Initializing?(): boolean | void
  Exception_Ready?(): boolean | void
  Exception_ConfigSet?(): boolean | void
  Exception_SubsReady?(): boolean | void
  Exception_SubsInited?(): boolean | void
  Exception_Reading?(): boolean | void
  Exception_ReadingDone?(): boolean | void
  Exception_Writing?(): boolean | void
  Exception_WritingDone?(): boolean | void
  Exception_FetchingLabels?(): boolean | void
  Exception_LabelsFetched?(): boolean | void
  Exception_FetchingHistoryId?(): boolean | void
  Exception_HistoryIdFetched?(): boolean | void
  Exception_InitialHistoryIdFetched?(): boolean | void
  Exception_exit?(): boolean | void
  Exception_end?(): boolean | void
}
/** All the state names */
export declare type TStates =
  | 'Enabled'
  | 'Initializing'
  | 'Ready'
  | 'ConfigSet'
  | 'SubsReady'
  | 'SubsInited'
  | 'Reading'
  | 'ReadingDone'
  | 'Writing'
  | 'WritingDone'
  | 'FetchingLabels'
  | 'LabelsFetched'
  | 'FetchingHistoryId'
  | 'HistoryIdFetched'
  | 'InitialHistoryIdFetched'
/** All the transition names */
export declare type TTransitions =
  | 'Enabled_Any'
  | 'Enabled_Initializing'
  | 'Enabled_Ready'
  | 'Enabled_ConfigSet'
  | 'Enabled_SubsReady'
  | 'Enabled_SubsInited'
  | 'Enabled_Reading'
  | 'Enabled_ReadingDone'
  | 'Enabled_Writing'
  | 'Enabled_WritingDone'
  | 'Enabled_FetchingLabels'
  | 'Enabled_LabelsFetched'
  | 'Enabled_FetchingHistoryId'
  | 'Enabled_HistoryIdFetched'
  | 'Enabled_InitialHistoryIdFetched'
  | 'Enabled_Exception'
  | 'Enabled_exit'
  | 'Enabled_end'
  | 'Initializing_Enabled'
  | 'Initializing_Any'
  | 'Initializing_Ready'
  | 'Initializing_ConfigSet'
  | 'Initializing_SubsReady'
  | 'Initializing_SubsInited'
  | 'Initializing_Reading'
  | 'Initializing_ReadingDone'
  | 'Initializing_Writing'
  | 'Initializing_WritingDone'
  | 'Initializing_FetchingLabels'
  | 'Initializing_LabelsFetched'
  | 'Initializing_FetchingHistoryId'
  | 'Initializing_HistoryIdFetched'
  | 'Initializing_InitialHistoryIdFetched'
  | 'Initializing_Exception'
  | 'Initializing_exit'
  | 'Initializing_end'
  | 'Ready_Enabled'
  | 'Ready_Initializing'
  | 'Ready_Any'
  | 'Ready_ConfigSet'
  | 'Ready_SubsReady'
  | 'Ready_SubsInited'
  | 'Ready_Reading'
  | 'Ready_ReadingDone'
  | 'Ready_Writing'
  | 'Ready_WritingDone'
  | 'Ready_FetchingLabels'
  | 'Ready_LabelsFetched'
  | 'Ready_FetchingHistoryId'
  | 'Ready_HistoryIdFetched'
  | 'Ready_InitialHistoryIdFetched'
  | 'Ready_Exception'
  | 'Ready_exit'
  | 'Ready_end'
  | 'ConfigSet_Enabled'
  | 'ConfigSet_Initializing'
  | 'ConfigSet_Ready'
  | 'ConfigSet_Any'
  | 'ConfigSet_SubsReady'
  | 'ConfigSet_SubsInited'
  | 'ConfigSet_Reading'
  | 'ConfigSet_ReadingDone'
  | 'ConfigSet_Writing'
  | 'ConfigSet_WritingDone'
  | 'ConfigSet_FetchingLabels'
  | 'ConfigSet_LabelsFetched'
  | 'ConfigSet_FetchingHistoryId'
  | 'ConfigSet_HistoryIdFetched'
  | 'ConfigSet_InitialHistoryIdFetched'
  | 'ConfigSet_Exception'
  | 'ConfigSet_exit'
  | 'ConfigSet_end'
  | 'SubsReady_Enabled'
  | 'SubsReady_Initializing'
  | 'SubsReady_Ready'
  | 'SubsReady_ConfigSet'
  | 'SubsReady_Any'
  | 'SubsReady_SubsInited'
  | 'SubsReady_Reading'
  | 'SubsReady_ReadingDone'
  | 'SubsReady_Writing'
  | 'SubsReady_WritingDone'
  | 'SubsReady_FetchingLabels'
  | 'SubsReady_LabelsFetched'
  | 'SubsReady_FetchingHistoryId'
  | 'SubsReady_HistoryIdFetched'
  | 'SubsReady_InitialHistoryIdFetched'
  | 'SubsReady_Exception'
  | 'SubsReady_exit'
  | 'SubsReady_end'
  | 'SubsInited_Enabled'
  | 'SubsInited_Initializing'
  | 'SubsInited_Ready'
  | 'SubsInited_ConfigSet'
  | 'SubsInited_SubsReady'
  | 'SubsInited_Any'
  | 'SubsInited_Reading'
  | 'SubsInited_ReadingDone'
  | 'SubsInited_Writing'
  | 'SubsInited_WritingDone'
  | 'SubsInited_FetchingLabels'
  | 'SubsInited_LabelsFetched'
  | 'SubsInited_FetchingHistoryId'
  | 'SubsInited_HistoryIdFetched'
  | 'SubsInited_InitialHistoryIdFetched'
  | 'SubsInited_Exception'
  | 'SubsInited_exit'
  | 'SubsInited_end'
  | 'Reading_Enabled'
  | 'Reading_Initializing'
  | 'Reading_Ready'
  | 'Reading_ConfigSet'
  | 'Reading_SubsReady'
  | 'Reading_SubsInited'
  | 'Reading_Any'
  | 'Reading_ReadingDone'
  | 'Reading_Writing'
  | 'Reading_WritingDone'
  | 'Reading_FetchingLabels'
  | 'Reading_LabelsFetched'
  | 'Reading_FetchingHistoryId'
  | 'Reading_HistoryIdFetched'
  | 'Reading_InitialHistoryIdFetched'
  | 'Reading_Exception'
  | 'Reading_exit'
  | 'Reading_end'
  | 'ReadingDone_Enabled'
  | 'ReadingDone_Initializing'
  | 'ReadingDone_Ready'
  | 'ReadingDone_ConfigSet'
  | 'ReadingDone_SubsReady'
  | 'ReadingDone_SubsInited'
  | 'ReadingDone_Reading'
  | 'ReadingDone_Any'
  | 'ReadingDone_Writing'
  | 'ReadingDone_WritingDone'
  | 'ReadingDone_FetchingLabels'
  | 'ReadingDone_LabelsFetched'
  | 'ReadingDone_FetchingHistoryId'
  | 'ReadingDone_HistoryIdFetched'
  | 'ReadingDone_InitialHistoryIdFetched'
  | 'ReadingDone_Exception'
  | 'ReadingDone_exit'
  | 'ReadingDone_end'
  | 'Writing_Enabled'
  | 'Writing_Initializing'
  | 'Writing_Ready'
  | 'Writing_ConfigSet'
  | 'Writing_SubsReady'
  | 'Writing_SubsInited'
  | 'Writing_Reading'
  | 'Writing_ReadingDone'
  | 'Writing_Any'
  | 'Writing_WritingDone'
  | 'Writing_FetchingLabels'
  | 'Writing_LabelsFetched'
  | 'Writing_FetchingHistoryId'
  | 'Writing_HistoryIdFetched'
  | 'Writing_InitialHistoryIdFetched'
  | 'Writing_Exception'
  | 'Writing_exit'
  | 'Writing_end'
  | 'WritingDone_Enabled'
  | 'WritingDone_Initializing'
  | 'WritingDone_Ready'
  | 'WritingDone_ConfigSet'
  | 'WritingDone_SubsReady'
  | 'WritingDone_SubsInited'
  | 'WritingDone_Reading'
  | 'WritingDone_ReadingDone'
  | 'WritingDone_Writing'
  | 'WritingDone_Any'
  | 'WritingDone_FetchingLabels'
  | 'WritingDone_LabelsFetched'
  | 'WritingDone_FetchingHistoryId'
  | 'WritingDone_HistoryIdFetched'
  | 'WritingDone_InitialHistoryIdFetched'
  | 'WritingDone_Exception'
  | 'WritingDone_exit'
  | 'WritingDone_end'
  | 'FetchingLabels_Enabled'
  | 'FetchingLabels_Initializing'
  | 'FetchingLabels_Ready'
  | 'FetchingLabels_ConfigSet'
  | 'FetchingLabels_SubsReady'
  | 'FetchingLabels_SubsInited'
  | 'FetchingLabels_Reading'
  | 'FetchingLabels_ReadingDone'
  | 'FetchingLabels_Writing'
  | 'FetchingLabels_WritingDone'
  | 'FetchingLabels_Any'
  | 'FetchingLabels_LabelsFetched'
  | 'FetchingLabels_FetchingHistoryId'
  | 'FetchingLabels_HistoryIdFetched'
  | 'FetchingLabels_InitialHistoryIdFetched'
  | 'FetchingLabels_Exception'
  | 'FetchingLabels_exit'
  | 'FetchingLabels_end'
  | 'LabelsFetched_Enabled'
  | 'LabelsFetched_Initializing'
  | 'LabelsFetched_Ready'
  | 'LabelsFetched_ConfigSet'
  | 'LabelsFetched_SubsReady'
  | 'LabelsFetched_SubsInited'
  | 'LabelsFetched_Reading'
  | 'LabelsFetched_ReadingDone'
  | 'LabelsFetched_Writing'
  | 'LabelsFetched_WritingDone'
  | 'LabelsFetched_FetchingLabels'
  | 'LabelsFetched_Any'
  | 'LabelsFetched_FetchingHistoryId'
  | 'LabelsFetched_HistoryIdFetched'
  | 'LabelsFetched_InitialHistoryIdFetched'
  | 'LabelsFetched_Exception'
  | 'LabelsFetched_exit'
  | 'LabelsFetched_end'
  | 'FetchingHistoryId_Enabled'
  | 'FetchingHistoryId_Initializing'
  | 'FetchingHistoryId_Ready'
  | 'FetchingHistoryId_ConfigSet'
  | 'FetchingHistoryId_SubsReady'
  | 'FetchingHistoryId_SubsInited'
  | 'FetchingHistoryId_Reading'
  | 'FetchingHistoryId_ReadingDone'
  | 'FetchingHistoryId_Writing'
  | 'FetchingHistoryId_WritingDone'
  | 'FetchingHistoryId_FetchingLabels'
  | 'FetchingHistoryId_LabelsFetched'
  | 'FetchingHistoryId_Any'
  | 'FetchingHistoryId_HistoryIdFetched'
  | 'FetchingHistoryId_InitialHistoryIdFetched'
  | 'FetchingHistoryId_Exception'
  | 'FetchingHistoryId_exit'
  | 'FetchingHistoryId_end'
  | 'HistoryIdFetched_Enabled'
  | 'HistoryIdFetched_Initializing'
  | 'HistoryIdFetched_Ready'
  | 'HistoryIdFetched_ConfigSet'
  | 'HistoryIdFetched_SubsReady'
  | 'HistoryIdFetched_SubsInited'
  | 'HistoryIdFetched_Reading'
  | 'HistoryIdFetched_ReadingDone'
  | 'HistoryIdFetched_Writing'
  | 'HistoryIdFetched_WritingDone'
  | 'HistoryIdFetched_FetchingLabels'
  | 'HistoryIdFetched_LabelsFetched'
  | 'HistoryIdFetched_FetchingHistoryId'
  | 'HistoryIdFetched_Any'
  | 'HistoryIdFetched_InitialHistoryIdFetched'
  | 'HistoryIdFetched_Exception'
  | 'HistoryIdFetched_exit'
  | 'HistoryIdFetched_end'
  | 'InitialHistoryIdFetched_Enabled'
  | 'InitialHistoryIdFetched_Initializing'
  | 'InitialHistoryIdFetched_Ready'
  | 'InitialHistoryIdFetched_ConfigSet'
  | 'InitialHistoryIdFetched_SubsReady'
  | 'InitialHistoryIdFetched_SubsInited'
  | 'InitialHistoryIdFetched_Reading'
  | 'InitialHistoryIdFetched_ReadingDone'
  | 'InitialHistoryIdFetched_Writing'
  | 'InitialHistoryIdFetched_WritingDone'
  | 'InitialHistoryIdFetched_FetchingLabels'
  | 'InitialHistoryIdFetched_LabelsFetched'
  | 'InitialHistoryIdFetched_FetchingHistoryId'
  | 'InitialHistoryIdFetched_HistoryIdFetched'
  | 'InitialHistoryIdFetched_Any'
  | 'InitialHistoryIdFetched_Exception'
  | 'InitialHistoryIdFetched_exit'
  | 'InitialHistoryIdFetched_end'
  | 'Exception_Enabled'
  | 'Exception_Initializing'
  | 'Exception_Ready'
  | 'Exception_ConfigSet'
  | 'Exception_SubsReady'
  | 'Exception_SubsInited'
  | 'Exception_Reading'
  | 'Exception_ReadingDone'
  | 'Exception_Writing'
  | 'Exception_WritingDone'
  | 'Exception_FetchingLabels'
  | 'Exception_LabelsFetched'
  | 'Exception_FetchingHistoryId'
  | 'Exception_HistoryIdFetched'
  | 'Exception_InitialHistoryIdFetched'
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
  Enabled: IState
  Initializing: IState
  Ready: IState
  ConfigSet: IState
  SubsReady: IState
  SubsInited: IState
  Reading: IState
  ReadingDone: IState
  Writing: IState
  WritingDone: IState
  FetchingLabels: IState
  LabelsFetched: IState
  FetchingHistoryId: IState
  HistoryIdFetched: IState
  InitialHistoryIdFetched: IState
  Exception?: IState
}
