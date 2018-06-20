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
  (
    event: 'Enabled_enter',
    listener: () => /* param1: any?, param2: any? */ boolean | undefined,
    context?: Object
  ): this
  (
    event: 'Enabled_state',
    listener: () => /* param1: any?, param2: any? */ any,
    context?: Object
  ): this
}

/** machine.emit('Enabled', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'Enabled_enter' /*, param1: any?, param2: any? */): boolean | void
  (event: 'Enabled_state' /*, param1: any?, param2: any? */): boolean | void
}

/** Method declarations */
export interface ITransitions {
  Enabled_enter /* param1: any?, param2: any? */?(): boolean | void
  Enabled_state /* param1: any?, param2: any? */?():
    | boolean
    | void
    | Promise<boolean | void>
}

// ----- ----- ----- ----- -----
// STATE: Initializing
// ----- ----- ----- ----- -----

/** machine.bind('Initializing', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'Initializing_enter',
    listener: () => /* param1: any?, param2: any? */ boolean | undefined,
    context?: Object
  ): this
  (
    event: 'Initializing_state',
    listener: () => /* param1: any?, param2: any? */ any,
    context?: Object
  ): this
}

/** machine.emit('Initializing', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'Initializing_enter' /*, param1: any?, param2: any? */):
    | boolean
    | void
  (event: 'Initializing_state' /*, param1: any?, param2: any? */):
    | boolean
    | void
}

/** Method declarations */
export interface ITransitions {
  Initializing_enter /* param1: any?, param2: any? */?(): boolean | void
  Initializing_state /* param1: any?, param2: any? */?():
    | boolean
    | void
    | Promise<boolean | void>
}

// ----- ----- ----- ----- -----
// STATE: Ready
// ----- ----- ----- ----- -----

/** machine.bind('Ready', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'Ready_enter',
    listener: () => /* param1: any?, param2: any? */ boolean | undefined,
    context?: Object
  ): this
  (
    event: 'Ready_state',
    listener: () => /* param1: any?, param2: any? */ any,
    context?: Object
  ): this
}

/** machine.emit('Ready', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'Ready_enter' /*, param1: any?, param2: any? */): boolean | void
  (event: 'Ready_state' /*, param1: any?, param2: any? */): boolean | void
}

/** Method declarations */
export interface ITransitions {
  Ready_enter /* param1: any?, param2: any? */?(): boolean | void
  Ready_state /* param1: any?, param2: any? */?():
    | boolean
    | void
    | Promise<boolean | void>
}

// ----- ----- ----- ----- -----
// STATE: ConfigSet
// ----- ----- ----- ----- -----

/** machine.bind('ConfigSet', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'ConfigSet_enter',
    listener: () => /* param1: any?, param2: any? */ boolean | undefined,
    context?: Object
  ): this
  (
    event: 'ConfigSet_state',
    listener: () => /* param1: any?, param2: any? */ any,
    context?: Object
  ): this
}

/** machine.emit('ConfigSet', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'ConfigSet_enter' /*, param1: any?, param2: any? */): boolean | void
  (event: 'ConfigSet_state' /*, param1: any?, param2: any? */): boolean | void
}

/** Method declarations */
export interface ITransitions {
  ConfigSet_enter /* param1: any?, param2: any? */?(): boolean | void
  ConfigSet_state /* param1: any?, param2: any? */?():
    | boolean
    | void
    | Promise<boolean | void>
}

// ----- ----- ----- ----- -----
// STATE: SubsReady
// ----- ----- ----- ----- -----

/** machine.bind('SubsReady', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'SubsReady_enter',
    listener: () => /* param1: any?, param2: any? */ boolean | undefined,
    context?: Object
  ): this
  (
    event: 'SubsReady_state',
    listener: () => /* param1: any?, param2: any? */ any,
    context?: Object
  ): this
}

/** machine.emit('SubsReady', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'SubsReady_enter' /*, param1: any?, param2: any? */): boolean | void
  (event: 'SubsReady_state' /*, param1: any?, param2: any? */): boolean | void
}

/** Method declarations */
export interface ITransitions {
  SubsReady_enter /* param1: any?, param2: any? */?(): boolean | void
  SubsReady_state /* param1: any?, param2: any? */?():
    | boolean
    | void
    | Promise<boolean | void>
}

// ----- ----- ----- ----- -----
// STATE: SubsInited
// ----- ----- ----- ----- -----

/** machine.bind('SubsInited', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'SubsInited_enter',
    listener: () => /* param1: any?, param2: any? */ boolean | undefined,
    context?: Object
  ): this
  (
    event: 'SubsInited_state',
    listener: () => /* param1: any?, param2: any? */ any,
    context?: Object
  ): this
}

/** machine.emit('SubsInited', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'SubsInited_enter' /*, param1: any?, param2: any? */): boolean | void
  (event: 'SubsInited_state' /*, param1: any?, param2: any? */): boolean | void
}

/** Method declarations */
export interface ITransitions {
  SubsInited_enter /* param1: any?, param2: any? */?(): boolean | void
  SubsInited_state /* param1: any?, param2: any? */?():
    | boolean
    | void
    | Promise<boolean | void>
}

// ----- ----- ----- ----- -----
// STATE: Reading
// ----- ----- ----- ----- -----

/** machine.bind('Reading', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'Reading_enter',
    listener: () => /* param1: any?, param2: any? */ boolean | undefined,
    context?: Object
  ): this
  (
    event: 'Reading_state',
    listener: () => /* param1: any?, param2: any? */ any,
    context?: Object
  ): this
}

/** machine.emit('Reading', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'Reading_enter' /*, param1: any?, param2: any? */): boolean | void
  (event: 'Reading_state' /*, param1: any?, param2: any? */): boolean | void
}

/** Method declarations */
export interface ITransitions {
  Reading_enter /* param1: any?, param2: any? */?(): boolean | void
  Reading_state /* param1: any?, param2: any? */?():
    | boolean
    | void
    | Promise<boolean | void>
}

// ----- ----- ----- ----- -----
// STATE: ReadingDone
// ----- ----- ----- ----- -----

/** machine.bind('ReadingDone', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'ReadingDone_enter',
    listener: () => /* param1: any?, param2: any? */ boolean | undefined,
    context?: Object
  ): this
  (
    event: 'ReadingDone_state',
    listener: () => /* param1: any?, param2: any? */ any,
    context?: Object
  ): this
}

/** machine.emit('ReadingDone', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'ReadingDone_enter' /*, param1: any?, param2: any? */): boolean | void
  (event: 'ReadingDone_state' /*, param1: any?, param2: any? */): boolean | void
}

/** Method declarations */
export interface ITransitions {
  ReadingDone_enter /* param1: any?, param2: any? */?(): boolean | void
  ReadingDone_state /* param1: any?, param2: any? */?():
    | boolean
    | void
    | Promise<boolean | void>
}

// ----- ----- ----- ----- -----
// STATE: QuotaExceeded
// ----- ----- ----- ----- -----

/** machine.bind('QuotaExceeded', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'QuotaExceeded_enter',
    listener: () => /* param1: any?, param2: any? */ boolean | undefined,
    context?: Object
  ): this
  (
    event: 'QuotaExceeded_state',
    listener: () => /* param1: any?, param2: any? */ any,
    context?: Object
  ): this
}

/** machine.emit('QuotaExceeded', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'QuotaExceeded_enter' /*, param1: any?, param2: any? */):
    | boolean
    | void
  (event: 'QuotaExceeded_state' /*, param1: any?, param2: any? */):
    | boolean
    | void
}

/** Method declarations */
export interface ITransitions {
  QuotaExceeded_enter /* param1: any?, param2: any? */?(): boolean | void
  QuotaExceeded_state /* param1: any?, param2: any? */?():
    | boolean
    | void
    | Promise<boolean | void>
}

// ----- ----- ----- ----- -----
// STATE: RestartingNetwork
// ----- ----- ----- ----- -----

/** machine.bind('RestartingNetwork', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'RestartingNetwork_enter',
    listener: () => /* param1: any?, param2: any? */ boolean | undefined,
    context?: Object
  ): this
  (
    event: 'RestartingNetwork_state',
    listener: () => /* param1: any?, param2: any? */ any,
    context?: Object
  ): this
}

/** machine.emit('RestartingNetwork', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'RestartingNetwork_enter' /*, param1: any?, param2: any? */):
    | boolean
    | void
  (event: 'RestartingNetwork_state' /*, param1: any?, param2: any? */):
    | boolean
    | void
}

/** Method declarations */
export interface ITransitions {
  RestartingNetwork_enter /* param1: any?, param2: any? */?(): boolean | void
  RestartingNetwork_state /* param1: any?, param2: any? */?():
    | boolean
    | void
    | Promise<boolean | void>
}

// ----- ----- ----- ----- -----
// STATE: NetworkRestarted
// ----- ----- ----- ----- -----

/** machine.bind('NetworkRestarted', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'NetworkRestarted_enter',
    listener: () => /* param1: any?, param2: any? */ boolean | undefined,
    context?: Object
  ): this
  (
    event: 'NetworkRestarted_state',
    listener: () => /* param1: any?, param2: any? */ any,
    context?: Object
  ): this
}

/** machine.emit('NetworkRestarted', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'NetworkRestarted_enter' /*, param1: any?, param2: any? */):
    | boolean
    | void
  (event: 'NetworkRestarted_state' /*, param1: any?, param2: any? */):
    | boolean
    | void
}

/** Method declarations */
export interface ITransitions {
  NetworkRestarted_enter /* param1: any?, param2: any? */?(): boolean | void
  NetworkRestarted_state /* param1: any?, param2: any? */?():
    | boolean
    | void
    | Promise<boolean | void>
}

// ----- ----- ----- ----- -----
// STATE: Writing
// ----- ----- ----- ----- -----

/** machine.bind('Writing', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'Writing_enter',
    listener: () => /* param1: any?, param2: any? */ boolean | undefined,
    context?: Object
  ): this
  (
    event: 'Writing_state',
    listener: () => /* param1: any?, param2: any? */ any,
    context?: Object
  ): this
}

/** machine.emit('Writing', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'Writing_enter' /*, param1: any?, param2: any? */): boolean | void
  (event: 'Writing_state' /*, param1: any?, param2: any? */): boolean | void
}

/** Method declarations */
export interface ITransitions {
  Writing_enter /* param1: any?, param2: any? */?(): boolean | void
  Writing_state /* param1: any?, param2: any? */?():
    | boolean
    | void
    | Promise<boolean | void>
}

// ----- ----- ----- ----- -----
// STATE: WritingDone
// ----- ----- ----- ----- -----

/** machine.bind('WritingDone', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'WritingDone_enter',
    listener: () => /* param1: any?, param2: any? */ boolean | undefined,
    context?: Object
  ): this
  (
    event: 'WritingDone_state',
    listener: () => /* param1: any?, param2: any? */ any,
    context?: Object
  ): this
}

/** machine.emit('WritingDone', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'WritingDone_enter' /*, param1: any?, param2: any? */): boolean | void
  (event: 'WritingDone_state' /*, param1: any?, param2: any? */): boolean | void
}

/** Method declarations */
export interface ITransitions {
  WritingDone_enter /* param1: any?, param2: any? */?(): boolean | void
  WritingDone_state /* param1: any?, param2: any? */?():
    | boolean
    | void
    | Promise<boolean | void>
}

// ----- ----- ----- ----- -----
// STATE: FetchingLabels
// ----- ----- ----- ----- -----

/** machine.bind('FetchingLabels', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'FetchingLabels_enter',
    listener: () => /* param1: any?, param2: any? */ boolean | undefined,
    context?: Object
  ): this
  (
    event: 'FetchingLabels_state',
    listener: () => /* param1: any?, param2: any? */ any,
    context?: Object
  ): this
}

/** machine.emit('FetchingLabels', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'FetchingLabels_enter' /*, param1: any?, param2: any? */):
    | boolean
    | void
  (event: 'FetchingLabels_state' /*, param1: any?, param2: any? */):
    | boolean
    | void
}

/** Method declarations */
export interface ITransitions {
  FetchingLabels_enter /* param1: any?, param2: any? */?(): boolean | void
  FetchingLabels_state /* param1: any?, param2: any? */?():
    | boolean
    | void
    | Promise<boolean | void>
}

// ----- ----- ----- ----- -----
// STATE: LabelsFetched
// ----- ----- ----- ----- -----

/** machine.bind('LabelsFetched', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'LabelsFetched_enter',
    listener: () => /* param1: any?, param2: any? */ boolean | undefined,
    context?: Object
  ): this
  (
    event: 'LabelsFetched_state',
    listener: () => /* param1: any?, param2: any? */ any,
    context?: Object
  ): this
}

/** machine.emit('LabelsFetched', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'LabelsFetched_enter' /*, param1: any?, param2: any? */):
    | boolean
    | void
  (event: 'LabelsFetched_state' /*, param1: any?, param2: any? */):
    | boolean
    | void
}

/** Method declarations */
export interface ITransitions {
  LabelsFetched_enter /* param1: any?, param2: any? */?(): boolean | void
  LabelsFetched_state /* param1: any?, param2: any? */?():
    | boolean
    | void
    | Promise<boolean | void>
}

// ----- ----- ----- ----- -----
// STATE: FetchingHistoryId
// ----- ----- ----- ----- -----

/** machine.bind('FetchingHistoryId', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'FetchingHistoryId_enter',
    listener: () => /* param1: any?, param2: any? */ boolean | undefined,
    context?: Object
  ): this
  (
    event: 'FetchingHistoryId_state',
    listener: () => /* param1: any?, param2: any? */ any,
    context?: Object
  ): this
}

/** machine.emit('FetchingHistoryId', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'FetchingHistoryId_enter' /*, param1: any?, param2: any? */):
    | boolean
    | void
  (event: 'FetchingHistoryId_state' /*, param1: any?, param2: any? */):
    | boolean
    | void
}

/** Method declarations */
export interface ITransitions {
  FetchingHistoryId_enter /* param1: any?, param2: any? */?(): boolean | void
  FetchingHistoryId_state /* param1: any?, param2: any? */?():
    | boolean
    | void
    | Promise<boolean | void>
}

// ----- ----- ----- ----- -----
// STATE: HistoryIdFetched
// ----- ----- ----- ----- -----

/** machine.bind('HistoryIdFetched', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'HistoryIdFetched_enter',
    listener: () => /* param1: any?, param2: any? */ boolean | undefined,
    context?: Object
  ): this
  (
    event: 'HistoryIdFetched_state',
    listener: () => /* param1: any?, param2: any? */ any,
    context?: Object
  ): this
}

/** machine.emit('HistoryIdFetched', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'HistoryIdFetched_enter' /*, param1: any?, param2: any? */):
    | boolean
    | void
  (event: 'HistoryIdFetched_state' /*, param1: any?, param2: any? */):
    | boolean
    | void
}

/** Method declarations */
export interface ITransitions {
  HistoryIdFetched_enter /* param1: any?, param2: any? */?(): boolean | void
  HistoryIdFetched_state /* param1: any?, param2: any? */?():
    | boolean
    | void
    | Promise<boolean | void>
}

// ----- ----- ----- ----- -----
// STATE: InitialHistoryIdFetched
// ----- ----- ----- ----- -----

/** machine.bind('InitialHistoryIdFetched', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'InitialHistoryIdFetched_enter',
    listener: () => /* param1: any?, param2: any? */ boolean | undefined,
    context?: Object
  ): this
  (
    event: 'InitialHistoryIdFetched_state',
    listener: () => /* param1: any?, param2: any? */ any,
    context?: Object
  ): this
}

/** machine.emit('InitialHistoryIdFetched', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'InitialHistoryIdFetched_enter' /*, param1: any?, param2: any? */):
    | boolean
    | void
  (event: 'InitialHistoryIdFetched_state' /*, param1: any?, param2: any? */):
    | boolean
    | void
}

/** Method declarations */
export interface ITransitions {
  InitialHistoryIdFetched_enter /* param1: any?, param2: any? */?():
    | boolean
    | void
  InitialHistoryIdFetched_state /* param1: any?, param2: any? */?():
    | boolean
    | void
    | Promise<boolean | void>
}

// ----- ----- ----- ----- -----
// STATE: FetchingOrphans
// ----- ----- ----- ----- -----

/** machine.bind('FetchingOrphans', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'FetchingOrphans_enter',
    listener: () => /* param1: any?, param2: any? */ boolean | undefined,
    context?: Object
  ): this
  (
    event: 'FetchingOrphans_state',
    listener: () => /* param1: any?, param2: any? */ any,
    context?: Object
  ): this
}

/** machine.emit('FetchingOrphans', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'FetchingOrphans_enter' /*, param1: any?, param2: any? */):
    | boolean
    | void
  (event: 'FetchingOrphans_state' /*, param1: any?, param2: any? */):
    | boolean
    | void
}

/** Method declarations */
export interface ITransitions {
  FetchingOrphans_enter /* param1: any?, param2: any? */?(): boolean | void
  FetchingOrphans_state /* param1: any?, param2: any? */?():
    | boolean
    | void
    | Promise<boolean | void>
}

// ----- ----- ----- ----- -----
// STATE: OrphansFetched
// ----- ----- ----- ----- -----

/** machine.bind('OrphansFetched', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'OrphansFetched_enter',
    listener: () => /* param1: any?, param2: any? */ boolean | undefined,
    context?: Object
  ): this
  (
    event: 'OrphansFetched_state',
    listener: () => /* param1: any?, param2: any? */ any,
    context?: Object
  ): this
}

/** machine.emit('OrphansFetched', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'OrphansFetched_enter' /*, param1: any?, param2: any? */):
    | boolean
    | void
  (event: 'OrphansFetched_state' /*, param1: any?, param2: any? */):
    | boolean
    | void
}

/** Method declarations */
export interface ITransitions {
  OrphansFetched_enter /* param1: any?, param2: any? */?(): boolean | void
  OrphansFetched_state /* param1: any?, param2: any? */?():
    | boolean
    | void
    | Promise<boolean | void>
}

// ----- ----- -----
// GENERAL TYPES
// ----- ----- -----

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
  Enabled_QuotaExceeded?(): boolean | void
  Enabled_RestartingNetwork?(): boolean | void
  Enabled_NetworkRestarted?(): boolean | void
  Enabled_Writing?(): boolean | void
  Enabled_WritingDone?(): boolean | void
  Enabled_FetchingLabels?(): boolean | void
  Enabled_LabelsFetched?(): boolean | void
  Enabled_FetchingHistoryId?(): boolean | void
  Enabled_HistoryIdFetched?(): boolean | void
  Enabled_InitialHistoryIdFetched?(): boolean | void
  Enabled_FetchingOrphans?(): boolean | void
  Enabled_OrphansFetched?(): boolean | void
  Enabled_Exception?(): boolean | void
  Enabled_exit?(): boolean | void
  Enabled_end?(): boolean | void | Promise<boolean | void>
  Initializing_Enabled?(): boolean | void
  Initializing_Any?(): boolean | void
  Initializing_Ready?(): boolean | void
  Initializing_ConfigSet?(): boolean | void
  Initializing_SubsReady?(): boolean | void
  Initializing_SubsInited?(): boolean | void
  Initializing_Reading?(): boolean | void
  Initializing_ReadingDone?(): boolean | void
  Initializing_QuotaExceeded?(): boolean | void
  Initializing_RestartingNetwork?(): boolean | void
  Initializing_NetworkRestarted?(): boolean | void
  Initializing_Writing?(): boolean | void
  Initializing_WritingDone?(): boolean | void
  Initializing_FetchingLabels?(): boolean | void
  Initializing_LabelsFetched?(): boolean | void
  Initializing_FetchingHistoryId?(): boolean | void
  Initializing_HistoryIdFetched?(): boolean | void
  Initializing_InitialHistoryIdFetched?(): boolean | void
  Initializing_FetchingOrphans?(): boolean | void
  Initializing_OrphansFetched?(): boolean | void
  Initializing_Exception?(): boolean | void
  Initializing_exit?(): boolean | void
  Initializing_end?(): boolean | void | Promise<boolean | void>
  Ready_Enabled?(): boolean | void
  Ready_Initializing?(): boolean | void
  Ready_Any?(): boolean | void
  Ready_ConfigSet?(): boolean | void
  Ready_SubsReady?(): boolean | void
  Ready_SubsInited?(): boolean | void
  Ready_Reading?(): boolean | void
  Ready_ReadingDone?(): boolean | void
  Ready_QuotaExceeded?(): boolean | void
  Ready_RestartingNetwork?(): boolean | void
  Ready_NetworkRestarted?(): boolean | void
  Ready_Writing?(): boolean | void
  Ready_WritingDone?(): boolean | void
  Ready_FetchingLabels?(): boolean | void
  Ready_LabelsFetched?(): boolean | void
  Ready_FetchingHistoryId?(): boolean | void
  Ready_HistoryIdFetched?(): boolean | void
  Ready_InitialHistoryIdFetched?(): boolean | void
  Ready_FetchingOrphans?(): boolean | void
  Ready_OrphansFetched?(): boolean | void
  Ready_Exception?(): boolean | void
  Ready_exit?(): boolean | void
  Ready_end?(): boolean | void | Promise<boolean | void>
  ConfigSet_Enabled?(): boolean | void
  ConfigSet_Initializing?(): boolean | void
  ConfigSet_Ready?(): boolean | void
  ConfigSet_Any?(): boolean | void
  ConfigSet_SubsReady?(): boolean | void
  ConfigSet_SubsInited?(): boolean | void
  ConfigSet_Reading?(): boolean | void
  ConfigSet_ReadingDone?(): boolean | void
  ConfigSet_QuotaExceeded?(): boolean | void
  ConfigSet_RestartingNetwork?(): boolean | void
  ConfigSet_NetworkRestarted?(): boolean | void
  ConfigSet_Writing?(): boolean | void
  ConfigSet_WritingDone?(): boolean | void
  ConfigSet_FetchingLabels?(): boolean | void
  ConfigSet_LabelsFetched?(): boolean | void
  ConfigSet_FetchingHistoryId?(): boolean | void
  ConfigSet_HistoryIdFetched?(): boolean | void
  ConfigSet_InitialHistoryIdFetched?(): boolean | void
  ConfigSet_FetchingOrphans?(): boolean | void
  ConfigSet_OrphansFetched?(): boolean | void
  ConfigSet_Exception?(): boolean | void
  ConfigSet_exit?(): boolean | void
  ConfigSet_end?(): boolean | void | Promise<boolean | void>
  SubsReady_Enabled?(): boolean | void
  SubsReady_Initializing?(): boolean | void
  SubsReady_Ready?(): boolean | void
  SubsReady_ConfigSet?(): boolean | void
  SubsReady_Any?(): boolean | void
  SubsReady_SubsInited?(): boolean | void
  SubsReady_Reading?(): boolean | void
  SubsReady_ReadingDone?(): boolean | void
  SubsReady_QuotaExceeded?(): boolean | void
  SubsReady_RestartingNetwork?(): boolean | void
  SubsReady_NetworkRestarted?(): boolean | void
  SubsReady_Writing?(): boolean | void
  SubsReady_WritingDone?(): boolean | void
  SubsReady_FetchingLabels?(): boolean | void
  SubsReady_LabelsFetched?(): boolean | void
  SubsReady_FetchingHistoryId?(): boolean | void
  SubsReady_HistoryIdFetched?(): boolean | void
  SubsReady_InitialHistoryIdFetched?(): boolean | void
  SubsReady_FetchingOrphans?(): boolean | void
  SubsReady_OrphansFetched?(): boolean | void
  SubsReady_Exception?(): boolean | void
  SubsReady_exit?(): boolean | void
  SubsReady_end?(): boolean | void | Promise<boolean | void>
  SubsInited_Enabled?(): boolean | void
  SubsInited_Initializing?(): boolean | void
  SubsInited_Ready?(): boolean | void
  SubsInited_ConfigSet?(): boolean | void
  SubsInited_SubsReady?(): boolean | void
  SubsInited_Any?(): boolean | void
  SubsInited_Reading?(): boolean | void
  SubsInited_ReadingDone?(): boolean | void
  SubsInited_QuotaExceeded?(): boolean | void
  SubsInited_RestartingNetwork?(): boolean | void
  SubsInited_NetworkRestarted?(): boolean | void
  SubsInited_Writing?(): boolean | void
  SubsInited_WritingDone?(): boolean | void
  SubsInited_FetchingLabels?(): boolean | void
  SubsInited_LabelsFetched?(): boolean | void
  SubsInited_FetchingHistoryId?(): boolean | void
  SubsInited_HistoryIdFetched?(): boolean | void
  SubsInited_InitialHistoryIdFetched?(): boolean | void
  SubsInited_FetchingOrphans?(): boolean | void
  SubsInited_OrphansFetched?(): boolean | void
  SubsInited_Exception?(): boolean | void
  SubsInited_exit?(): boolean | void
  SubsInited_end?(): boolean | void | Promise<boolean | void>
  Reading_Enabled?(): boolean | void
  Reading_Initializing?(): boolean | void
  Reading_Ready?(): boolean | void
  Reading_ConfigSet?(): boolean | void
  Reading_SubsReady?(): boolean | void
  Reading_SubsInited?(): boolean | void
  Reading_Any?(): boolean | void
  Reading_ReadingDone?(): boolean | void
  Reading_QuotaExceeded?(): boolean | void
  Reading_RestartingNetwork?(): boolean | void
  Reading_NetworkRestarted?(): boolean | void
  Reading_Writing?(): boolean | void
  Reading_WritingDone?(): boolean | void
  Reading_FetchingLabels?(): boolean | void
  Reading_LabelsFetched?(): boolean | void
  Reading_FetchingHistoryId?(): boolean | void
  Reading_HistoryIdFetched?(): boolean | void
  Reading_InitialHistoryIdFetched?(): boolean | void
  Reading_FetchingOrphans?(): boolean | void
  Reading_OrphansFetched?(): boolean | void
  Reading_Exception?(): boolean | void
  Reading_exit?(): boolean | void
  Reading_end?(): boolean | void | Promise<boolean | void>
  ReadingDone_Enabled?(): boolean | void
  ReadingDone_Initializing?(): boolean | void
  ReadingDone_Ready?(): boolean | void
  ReadingDone_ConfigSet?(): boolean | void
  ReadingDone_SubsReady?(): boolean | void
  ReadingDone_SubsInited?(): boolean | void
  ReadingDone_Reading?(): boolean | void
  ReadingDone_Any?(): boolean | void
  ReadingDone_QuotaExceeded?(): boolean | void
  ReadingDone_RestartingNetwork?(): boolean | void
  ReadingDone_NetworkRestarted?(): boolean | void
  ReadingDone_Writing?(): boolean | void
  ReadingDone_WritingDone?(): boolean | void
  ReadingDone_FetchingLabels?(): boolean | void
  ReadingDone_LabelsFetched?(): boolean | void
  ReadingDone_FetchingHistoryId?(): boolean | void
  ReadingDone_HistoryIdFetched?(): boolean | void
  ReadingDone_InitialHistoryIdFetched?(): boolean | void
  ReadingDone_FetchingOrphans?(): boolean | void
  ReadingDone_OrphansFetched?(): boolean | void
  ReadingDone_Exception?(): boolean | void
  ReadingDone_exit?(): boolean | void
  ReadingDone_end?(): boolean | void | Promise<boolean | void>
  QuotaExceeded_Enabled?(): boolean | void
  QuotaExceeded_Initializing?(): boolean | void
  QuotaExceeded_Ready?(): boolean | void
  QuotaExceeded_ConfigSet?(): boolean | void
  QuotaExceeded_SubsReady?(): boolean | void
  QuotaExceeded_SubsInited?(): boolean | void
  QuotaExceeded_Reading?(): boolean | void
  QuotaExceeded_ReadingDone?(): boolean | void
  QuotaExceeded_Any?(): boolean | void
  QuotaExceeded_RestartingNetwork?(): boolean | void
  QuotaExceeded_NetworkRestarted?(): boolean | void
  QuotaExceeded_Writing?(): boolean | void
  QuotaExceeded_WritingDone?(): boolean | void
  QuotaExceeded_FetchingLabels?(): boolean | void
  QuotaExceeded_LabelsFetched?(): boolean | void
  QuotaExceeded_FetchingHistoryId?(): boolean | void
  QuotaExceeded_HistoryIdFetched?(): boolean | void
  QuotaExceeded_InitialHistoryIdFetched?(): boolean | void
  QuotaExceeded_FetchingOrphans?(): boolean | void
  QuotaExceeded_OrphansFetched?(): boolean | void
  QuotaExceeded_Exception?(): boolean | void
  QuotaExceeded_exit?(): boolean | void
  QuotaExceeded_end?(): boolean | void | Promise<boolean | void>
  RestartingNetwork_Enabled?(): boolean | void
  RestartingNetwork_Initializing?(): boolean | void
  RestartingNetwork_Ready?(): boolean | void
  RestartingNetwork_ConfigSet?(): boolean | void
  RestartingNetwork_SubsReady?(): boolean | void
  RestartingNetwork_SubsInited?(): boolean | void
  RestartingNetwork_Reading?(): boolean | void
  RestartingNetwork_ReadingDone?(): boolean | void
  RestartingNetwork_QuotaExceeded?(): boolean | void
  RestartingNetwork_Any?(): boolean | void
  RestartingNetwork_NetworkRestarted?(): boolean | void
  RestartingNetwork_Writing?(): boolean | void
  RestartingNetwork_WritingDone?(): boolean | void
  RestartingNetwork_FetchingLabels?(): boolean | void
  RestartingNetwork_LabelsFetched?(): boolean | void
  RestartingNetwork_FetchingHistoryId?(): boolean | void
  RestartingNetwork_HistoryIdFetched?(): boolean | void
  RestartingNetwork_InitialHistoryIdFetched?(): boolean | void
  RestartingNetwork_FetchingOrphans?(): boolean | void
  RestartingNetwork_OrphansFetched?(): boolean | void
  RestartingNetwork_Exception?(): boolean | void
  RestartingNetwork_exit?(): boolean | void
  RestartingNetwork_end?(): boolean | void | Promise<boolean | void>
  NetworkRestarted_Enabled?(): boolean | void
  NetworkRestarted_Initializing?(): boolean | void
  NetworkRestarted_Ready?(): boolean | void
  NetworkRestarted_ConfigSet?(): boolean | void
  NetworkRestarted_SubsReady?(): boolean | void
  NetworkRestarted_SubsInited?(): boolean | void
  NetworkRestarted_Reading?(): boolean | void
  NetworkRestarted_ReadingDone?(): boolean | void
  NetworkRestarted_QuotaExceeded?(): boolean | void
  NetworkRestarted_RestartingNetwork?(): boolean | void
  NetworkRestarted_Any?(): boolean | void
  NetworkRestarted_Writing?(): boolean | void
  NetworkRestarted_WritingDone?(): boolean | void
  NetworkRestarted_FetchingLabels?(): boolean | void
  NetworkRestarted_LabelsFetched?(): boolean | void
  NetworkRestarted_FetchingHistoryId?(): boolean | void
  NetworkRestarted_HistoryIdFetched?(): boolean | void
  NetworkRestarted_InitialHistoryIdFetched?(): boolean | void
  NetworkRestarted_FetchingOrphans?(): boolean | void
  NetworkRestarted_OrphansFetched?(): boolean | void
  NetworkRestarted_Exception?(): boolean | void
  NetworkRestarted_exit?(): boolean | void
  NetworkRestarted_end?(): boolean | void | Promise<boolean | void>
  Writing_Enabled?(): boolean | void
  Writing_Initializing?(): boolean | void
  Writing_Ready?(): boolean | void
  Writing_ConfigSet?(): boolean | void
  Writing_SubsReady?(): boolean | void
  Writing_SubsInited?(): boolean | void
  Writing_Reading?(): boolean | void
  Writing_ReadingDone?(): boolean | void
  Writing_QuotaExceeded?(): boolean | void
  Writing_RestartingNetwork?(): boolean | void
  Writing_NetworkRestarted?(): boolean | void
  Writing_Any?(): boolean | void
  Writing_WritingDone?(): boolean | void
  Writing_FetchingLabels?(): boolean | void
  Writing_LabelsFetched?(): boolean | void
  Writing_FetchingHistoryId?(): boolean | void
  Writing_HistoryIdFetched?(): boolean | void
  Writing_InitialHistoryIdFetched?(): boolean | void
  Writing_FetchingOrphans?(): boolean | void
  Writing_OrphansFetched?(): boolean | void
  Writing_Exception?(): boolean | void
  Writing_exit?(): boolean | void
  Writing_end?(): boolean | void | Promise<boolean | void>
  WritingDone_Enabled?(): boolean | void
  WritingDone_Initializing?(): boolean | void
  WritingDone_Ready?(): boolean | void
  WritingDone_ConfigSet?(): boolean | void
  WritingDone_SubsReady?(): boolean | void
  WritingDone_SubsInited?(): boolean | void
  WritingDone_Reading?(): boolean | void
  WritingDone_ReadingDone?(): boolean | void
  WritingDone_QuotaExceeded?(): boolean | void
  WritingDone_RestartingNetwork?(): boolean | void
  WritingDone_NetworkRestarted?(): boolean | void
  WritingDone_Writing?(): boolean | void
  WritingDone_Any?(): boolean | void
  WritingDone_FetchingLabels?(): boolean | void
  WritingDone_LabelsFetched?(): boolean | void
  WritingDone_FetchingHistoryId?(): boolean | void
  WritingDone_HistoryIdFetched?(): boolean | void
  WritingDone_InitialHistoryIdFetched?(): boolean | void
  WritingDone_FetchingOrphans?(): boolean | void
  WritingDone_OrphansFetched?(): boolean | void
  WritingDone_Exception?(): boolean | void
  WritingDone_exit?(): boolean | void
  WritingDone_end?(): boolean | void | Promise<boolean | void>
  FetchingLabels_Enabled?(): boolean | void
  FetchingLabels_Initializing?(): boolean | void
  FetchingLabels_Ready?(): boolean | void
  FetchingLabels_ConfigSet?(): boolean | void
  FetchingLabels_SubsReady?(): boolean | void
  FetchingLabels_SubsInited?(): boolean | void
  FetchingLabels_Reading?(): boolean | void
  FetchingLabels_ReadingDone?(): boolean | void
  FetchingLabels_QuotaExceeded?(): boolean | void
  FetchingLabels_RestartingNetwork?(): boolean | void
  FetchingLabels_NetworkRestarted?(): boolean | void
  FetchingLabels_Writing?(): boolean | void
  FetchingLabels_WritingDone?(): boolean | void
  FetchingLabels_Any?(): boolean | void
  FetchingLabels_LabelsFetched?(): boolean | void
  FetchingLabels_FetchingHistoryId?(): boolean | void
  FetchingLabels_HistoryIdFetched?(): boolean | void
  FetchingLabels_InitialHistoryIdFetched?(): boolean | void
  FetchingLabels_FetchingOrphans?(): boolean | void
  FetchingLabels_OrphansFetched?(): boolean | void
  FetchingLabels_Exception?(): boolean | void
  FetchingLabels_exit?(): boolean | void
  FetchingLabels_end?(): boolean | void | Promise<boolean | void>
  LabelsFetched_Enabled?(): boolean | void
  LabelsFetched_Initializing?(): boolean | void
  LabelsFetched_Ready?(): boolean | void
  LabelsFetched_ConfigSet?(): boolean | void
  LabelsFetched_SubsReady?(): boolean | void
  LabelsFetched_SubsInited?(): boolean | void
  LabelsFetched_Reading?(): boolean | void
  LabelsFetched_ReadingDone?(): boolean | void
  LabelsFetched_QuotaExceeded?(): boolean | void
  LabelsFetched_RestartingNetwork?(): boolean | void
  LabelsFetched_NetworkRestarted?(): boolean | void
  LabelsFetched_Writing?(): boolean | void
  LabelsFetched_WritingDone?(): boolean | void
  LabelsFetched_FetchingLabels?(): boolean | void
  LabelsFetched_Any?(): boolean | void
  LabelsFetched_FetchingHistoryId?(): boolean | void
  LabelsFetched_HistoryIdFetched?(): boolean | void
  LabelsFetched_InitialHistoryIdFetched?(): boolean | void
  LabelsFetched_FetchingOrphans?(): boolean | void
  LabelsFetched_OrphansFetched?(): boolean | void
  LabelsFetched_Exception?(): boolean | void
  LabelsFetched_exit?(): boolean | void
  LabelsFetched_end?(): boolean | void | Promise<boolean | void>
  FetchingHistoryId_Enabled?(): boolean | void
  FetchingHistoryId_Initializing?(): boolean | void
  FetchingHistoryId_Ready?(): boolean | void
  FetchingHistoryId_ConfigSet?(): boolean | void
  FetchingHistoryId_SubsReady?(): boolean | void
  FetchingHistoryId_SubsInited?(): boolean | void
  FetchingHistoryId_Reading?(): boolean | void
  FetchingHistoryId_ReadingDone?(): boolean | void
  FetchingHistoryId_QuotaExceeded?(): boolean | void
  FetchingHistoryId_RestartingNetwork?(): boolean | void
  FetchingHistoryId_NetworkRestarted?(): boolean | void
  FetchingHistoryId_Writing?(): boolean | void
  FetchingHistoryId_WritingDone?(): boolean | void
  FetchingHistoryId_FetchingLabels?(): boolean | void
  FetchingHistoryId_LabelsFetched?(): boolean | void
  FetchingHistoryId_Any?(): boolean | void
  FetchingHistoryId_HistoryIdFetched?(): boolean | void
  FetchingHistoryId_InitialHistoryIdFetched?(): boolean | void
  FetchingHistoryId_FetchingOrphans?(): boolean | void
  FetchingHistoryId_OrphansFetched?(): boolean | void
  FetchingHistoryId_Exception?(): boolean | void
  FetchingHistoryId_exit?(): boolean | void
  FetchingHistoryId_end?(): boolean | void | Promise<boolean | void>
  HistoryIdFetched_Enabled?(): boolean | void
  HistoryIdFetched_Initializing?(): boolean | void
  HistoryIdFetched_Ready?(): boolean | void
  HistoryIdFetched_ConfigSet?(): boolean | void
  HistoryIdFetched_SubsReady?(): boolean | void
  HistoryIdFetched_SubsInited?(): boolean | void
  HistoryIdFetched_Reading?(): boolean | void
  HistoryIdFetched_ReadingDone?(): boolean | void
  HistoryIdFetched_QuotaExceeded?(): boolean | void
  HistoryIdFetched_RestartingNetwork?(): boolean | void
  HistoryIdFetched_NetworkRestarted?(): boolean | void
  HistoryIdFetched_Writing?(): boolean | void
  HistoryIdFetched_WritingDone?(): boolean | void
  HistoryIdFetched_FetchingLabels?(): boolean | void
  HistoryIdFetched_LabelsFetched?(): boolean | void
  HistoryIdFetched_FetchingHistoryId?(): boolean | void
  HistoryIdFetched_Any?(): boolean | void
  HistoryIdFetched_InitialHistoryIdFetched?(): boolean | void
  HistoryIdFetched_FetchingOrphans?(): boolean | void
  HistoryIdFetched_OrphansFetched?(): boolean | void
  HistoryIdFetched_Exception?(): boolean | void
  HistoryIdFetched_exit?(): boolean | void
  HistoryIdFetched_end?(): boolean | void | Promise<boolean | void>
  InitialHistoryIdFetched_Enabled?(): boolean | void
  InitialHistoryIdFetched_Initializing?(): boolean | void
  InitialHistoryIdFetched_Ready?(): boolean | void
  InitialHistoryIdFetched_ConfigSet?(): boolean | void
  InitialHistoryIdFetched_SubsReady?(): boolean | void
  InitialHistoryIdFetched_SubsInited?(): boolean | void
  InitialHistoryIdFetched_Reading?(): boolean | void
  InitialHistoryIdFetched_ReadingDone?(): boolean | void
  InitialHistoryIdFetched_QuotaExceeded?(): boolean | void
  InitialHistoryIdFetched_RestartingNetwork?(): boolean | void
  InitialHistoryIdFetched_NetworkRestarted?(): boolean | void
  InitialHistoryIdFetched_Writing?(): boolean | void
  InitialHistoryIdFetched_WritingDone?(): boolean | void
  InitialHistoryIdFetched_FetchingLabels?(): boolean | void
  InitialHistoryIdFetched_LabelsFetched?(): boolean | void
  InitialHistoryIdFetched_FetchingHistoryId?(): boolean | void
  InitialHistoryIdFetched_HistoryIdFetched?(): boolean | void
  InitialHistoryIdFetched_Any?(): boolean | void
  InitialHistoryIdFetched_FetchingOrphans?(): boolean | void
  InitialHistoryIdFetched_OrphansFetched?(): boolean | void
  InitialHistoryIdFetched_Exception?(): boolean | void
  InitialHistoryIdFetched_exit?(): boolean | void
  InitialHistoryIdFetched_end?(): boolean | void | Promise<boolean | void>
  FetchingOrphans_Enabled?(): boolean | void
  FetchingOrphans_Initializing?(): boolean | void
  FetchingOrphans_Ready?(): boolean | void
  FetchingOrphans_ConfigSet?(): boolean | void
  FetchingOrphans_SubsReady?(): boolean | void
  FetchingOrphans_SubsInited?(): boolean | void
  FetchingOrphans_Reading?(): boolean | void
  FetchingOrphans_ReadingDone?(): boolean | void
  FetchingOrphans_QuotaExceeded?(): boolean | void
  FetchingOrphans_RestartingNetwork?(): boolean | void
  FetchingOrphans_NetworkRestarted?(): boolean | void
  FetchingOrphans_Writing?(): boolean | void
  FetchingOrphans_WritingDone?(): boolean | void
  FetchingOrphans_FetchingLabels?(): boolean | void
  FetchingOrphans_LabelsFetched?(): boolean | void
  FetchingOrphans_FetchingHistoryId?(): boolean | void
  FetchingOrphans_HistoryIdFetched?(): boolean | void
  FetchingOrphans_InitialHistoryIdFetched?(): boolean | void
  FetchingOrphans_Any?(): boolean | void
  FetchingOrphans_OrphansFetched?(): boolean | void
  FetchingOrphans_Exception?(): boolean | void
  FetchingOrphans_exit?(): boolean | void
  FetchingOrphans_end?(): boolean | void | Promise<boolean | void>
  OrphansFetched_Enabled?(): boolean | void
  OrphansFetched_Initializing?(): boolean | void
  OrphansFetched_Ready?(): boolean | void
  OrphansFetched_ConfigSet?(): boolean | void
  OrphansFetched_SubsReady?(): boolean | void
  OrphansFetched_SubsInited?(): boolean | void
  OrphansFetched_Reading?(): boolean | void
  OrphansFetched_ReadingDone?(): boolean | void
  OrphansFetched_QuotaExceeded?(): boolean | void
  OrphansFetched_RestartingNetwork?(): boolean | void
  OrphansFetched_NetworkRestarted?(): boolean | void
  OrphansFetched_Writing?(): boolean | void
  OrphansFetched_WritingDone?(): boolean | void
  OrphansFetched_FetchingLabels?(): boolean | void
  OrphansFetched_LabelsFetched?(): boolean | void
  OrphansFetched_FetchingHistoryId?(): boolean | void
  OrphansFetched_HistoryIdFetched?(): boolean | void
  OrphansFetched_InitialHistoryIdFetched?(): boolean | void
  OrphansFetched_FetchingOrphans?(): boolean | void
  OrphansFetched_Any?(): boolean | void
  OrphansFetched_Exception?(): boolean | void
  OrphansFetched_exit?(): boolean | void
  OrphansFetched_end?(): boolean | void | Promise<boolean | void>
  Exception_Enabled?(): boolean | void
  Exception_Initializing?(): boolean | void
  Exception_Ready?(): boolean | void
  Exception_ConfigSet?(): boolean | void
  Exception_SubsReady?(): boolean | void
  Exception_SubsInited?(): boolean | void
  Exception_Reading?(): boolean | void
  Exception_ReadingDone?(): boolean | void
  Exception_QuotaExceeded?(): boolean | void
  Exception_RestartingNetwork?(): boolean | void
  Exception_NetworkRestarted?(): boolean | void
  Exception_Writing?(): boolean | void
  Exception_WritingDone?(): boolean | void
  Exception_FetchingLabels?(): boolean | void
  Exception_LabelsFetched?(): boolean | void
  Exception_FetchingHistoryId?(): boolean | void
  Exception_HistoryIdFetched?(): boolean | void
  Exception_InitialHistoryIdFetched?(): boolean | void
  Exception_FetchingOrphans?(): boolean | void
  Exception_OrphansFetched?(): boolean | void
  Exception_exit?(): boolean | void
  Exception_end?(): boolean | void | Promise<boolean | void>
}

/** All the state names */
export type TStates =
  | 'Enabled'
  | 'Initializing'
  | 'Ready'
  | 'ConfigSet'
  | 'SubsReady'
  | 'SubsInited'
  | 'Reading'
  | 'ReadingDone'
  | 'QuotaExceeded'
  | 'RestartingNetwork'
  | 'NetworkRestarted'
  | 'Writing'
  | 'WritingDone'
  | 'FetchingLabels'
  | 'LabelsFetched'
  | 'FetchingHistoryId'
  | 'HistoryIdFetched'
  | 'InitialHistoryIdFetched'
  | 'FetchingOrphans'
  | 'OrphansFetched'

/** All the transition names */
export type TTransitions =
  | 'Enabled_Any'
  | 'Enabled_Initializing'
  | 'Enabled_Ready'
  | 'Enabled_ConfigSet'
  | 'Enabled_SubsReady'
  | 'Enabled_SubsInited'
  | 'Enabled_Reading'
  | 'Enabled_ReadingDone'
  | 'Enabled_QuotaExceeded'
  | 'Enabled_RestartingNetwork'
  | 'Enabled_NetworkRestarted'
  | 'Enabled_Writing'
  | 'Enabled_WritingDone'
  | 'Enabled_FetchingLabels'
  | 'Enabled_LabelsFetched'
  | 'Enabled_FetchingHistoryId'
  | 'Enabled_HistoryIdFetched'
  | 'Enabled_InitialHistoryIdFetched'
  | 'Enabled_FetchingOrphans'
  | 'Enabled_OrphansFetched'
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
  | 'Initializing_QuotaExceeded'
  | 'Initializing_RestartingNetwork'
  | 'Initializing_NetworkRestarted'
  | 'Initializing_Writing'
  | 'Initializing_WritingDone'
  | 'Initializing_FetchingLabels'
  | 'Initializing_LabelsFetched'
  | 'Initializing_FetchingHistoryId'
  | 'Initializing_HistoryIdFetched'
  | 'Initializing_InitialHistoryIdFetched'
  | 'Initializing_FetchingOrphans'
  | 'Initializing_OrphansFetched'
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
  | 'Ready_QuotaExceeded'
  | 'Ready_RestartingNetwork'
  | 'Ready_NetworkRestarted'
  | 'Ready_Writing'
  | 'Ready_WritingDone'
  | 'Ready_FetchingLabels'
  | 'Ready_LabelsFetched'
  | 'Ready_FetchingHistoryId'
  | 'Ready_HistoryIdFetched'
  | 'Ready_InitialHistoryIdFetched'
  | 'Ready_FetchingOrphans'
  | 'Ready_OrphansFetched'
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
  | 'ConfigSet_QuotaExceeded'
  | 'ConfigSet_RestartingNetwork'
  | 'ConfigSet_NetworkRestarted'
  | 'ConfigSet_Writing'
  | 'ConfigSet_WritingDone'
  | 'ConfigSet_FetchingLabels'
  | 'ConfigSet_LabelsFetched'
  | 'ConfigSet_FetchingHistoryId'
  | 'ConfigSet_HistoryIdFetched'
  | 'ConfigSet_InitialHistoryIdFetched'
  | 'ConfigSet_FetchingOrphans'
  | 'ConfigSet_OrphansFetched'
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
  | 'SubsReady_QuotaExceeded'
  | 'SubsReady_RestartingNetwork'
  | 'SubsReady_NetworkRestarted'
  | 'SubsReady_Writing'
  | 'SubsReady_WritingDone'
  | 'SubsReady_FetchingLabels'
  | 'SubsReady_LabelsFetched'
  | 'SubsReady_FetchingHistoryId'
  | 'SubsReady_HistoryIdFetched'
  | 'SubsReady_InitialHistoryIdFetched'
  | 'SubsReady_FetchingOrphans'
  | 'SubsReady_OrphansFetched'
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
  | 'SubsInited_QuotaExceeded'
  | 'SubsInited_RestartingNetwork'
  | 'SubsInited_NetworkRestarted'
  | 'SubsInited_Writing'
  | 'SubsInited_WritingDone'
  | 'SubsInited_FetchingLabels'
  | 'SubsInited_LabelsFetched'
  | 'SubsInited_FetchingHistoryId'
  | 'SubsInited_HistoryIdFetched'
  | 'SubsInited_InitialHistoryIdFetched'
  | 'SubsInited_FetchingOrphans'
  | 'SubsInited_OrphansFetched'
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
  | 'Reading_QuotaExceeded'
  | 'Reading_RestartingNetwork'
  | 'Reading_NetworkRestarted'
  | 'Reading_Writing'
  | 'Reading_WritingDone'
  | 'Reading_FetchingLabels'
  | 'Reading_LabelsFetched'
  | 'Reading_FetchingHistoryId'
  | 'Reading_HistoryIdFetched'
  | 'Reading_InitialHistoryIdFetched'
  | 'Reading_FetchingOrphans'
  | 'Reading_OrphansFetched'
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
  | 'ReadingDone_QuotaExceeded'
  | 'ReadingDone_RestartingNetwork'
  | 'ReadingDone_NetworkRestarted'
  | 'ReadingDone_Writing'
  | 'ReadingDone_WritingDone'
  | 'ReadingDone_FetchingLabels'
  | 'ReadingDone_LabelsFetched'
  | 'ReadingDone_FetchingHistoryId'
  | 'ReadingDone_HistoryIdFetched'
  | 'ReadingDone_InitialHistoryIdFetched'
  | 'ReadingDone_FetchingOrphans'
  | 'ReadingDone_OrphansFetched'
  | 'ReadingDone_Exception'
  | 'ReadingDone_exit'
  | 'ReadingDone_end'
  | 'QuotaExceeded_Enabled'
  | 'QuotaExceeded_Initializing'
  | 'QuotaExceeded_Ready'
  | 'QuotaExceeded_ConfigSet'
  | 'QuotaExceeded_SubsReady'
  | 'QuotaExceeded_SubsInited'
  | 'QuotaExceeded_Reading'
  | 'QuotaExceeded_ReadingDone'
  | 'QuotaExceeded_Any'
  | 'QuotaExceeded_RestartingNetwork'
  | 'QuotaExceeded_NetworkRestarted'
  | 'QuotaExceeded_Writing'
  | 'QuotaExceeded_WritingDone'
  | 'QuotaExceeded_FetchingLabels'
  | 'QuotaExceeded_LabelsFetched'
  | 'QuotaExceeded_FetchingHistoryId'
  | 'QuotaExceeded_HistoryIdFetched'
  | 'QuotaExceeded_InitialHistoryIdFetched'
  | 'QuotaExceeded_FetchingOrphans'
  | 'QuotaExceeded_OrphansFetched'
  | 'QuotaExceeded_Exception'
  | 'QuotaExceeded_exit'
  | 'QuotaExceeded_end'
  | 'RestartingNetwork_Enabled'
  | 'RestartingNetwork_Initializing'
  | 'RestartingNetwork_Ready'
  | 'RestartingNetwork_ConfigSet'
  | 'RestartingNetwork_SubsReady'
  | 'RestartingNetwork_SubsInited'
  | 'RestartingNetwork_Reading'
  | 'RestartingNetwork_ReadingDone'
  | 'RestartingNetwork_QuotaExceeded'
  | 'RestartingNetwork_Any'
  | 'RestartingNetwork_NetworkRestarted'
  | 'RestartingNetwork_Writing'
  | 'RestartingNetwork_WritingDone'
  | 'RestartingNetwork_FetchingLabels'
  | 'RestartingNetwork_LabelsFetched'
  | 'RestartingNetwork_FetchingHistoryId'
  | 'RestartingNetwork_HistoryIdFetched'
  | 'RestartingNetwork_InitialHistoryIdFetched'
  | 'RestartingNetwork_FetchingOrphans'
  | 'RestartingNetwork_OrphansFetched'
  | 'RestartingNetwork_Exception'
  | 'RestartingNetwork_exit'
  | 'RestartingNetwork_end'
  | 'NetworkRestarted_Enabled'
  | 'NetworkRestarted_Initializing'
  | 'NetworkRestarted_Ready'
  | 'NetworkRestarted_ConfigSet'
  | 'NetworkRestarted_SubsReady'
  | 'NetworkRestarted_SubsInited'
  | 'NetworkRestarted_Reading'
  | 'NetworkRestarted_ReadingDone'
  | 'NetworkRestarted_QuotaExceeded'
  | 'NetworkRestarted_RestartingNetwork'
  | 'NetworkRestarted_Any'
  | 'NetworkRestarted_Writing'
  | 'NetworkRestarted_WritingDone'
  | 'NetworkRestarted_FetchingLabels'
  | 'NetworkRestarted_LabelsFetched'
  | 'NetworkRestarted_FetchingHistoryId'
  | 'NetworkRestarted_HistoryIdFetched'
  | 'NetworkRestarted_InitialHistoryIdFetched'
  | 'NetworkRestarted_FetchingOrphans'
  | 'NetworkRestarted_OrphansFetched'
  | 'NetworkRestarted_Exception'
  | 'NetworkRestarted_exit'
  | 'NetworkRestarted_end'
  | 'Writing_Enabled'
  | 'Writing_Initializing'
  | 'Writing_Ready'
  | 'Writing_ConfigSet'
  | 'Writing_SubsReady'
  | 'Writing_SubsInited'
  | 'Writing_Reading'
  | 'Writing_ReadingDone'
  | 'Writing_QuotaExceeded'
  | 'Writing_RestartingNetwork'
  | 'Writing_NetworkRestarted'
  | 'Writing_Any'
  | 'Writing_WritingDone'
  | 'Writing_FetchingLabels'
  | 'Writing_LabelsFetched'
  | 'Writing_FetchingHistoryId'
  | 'Writing_HistoryIdFetched'
  | 'Writing_InitialHistoryIdFetched'
  | 'Writing_FetchingOrphans'
  | 'Writing_OrphansFetched'
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
  | 'WritingDone_QuotaExceeded'
  | 'WritingDone_RestartingNetwork'
  | 'WritingDone_NetworkRestarted'
  | 'WritingDone_Writing'
  | 'WritingDone_Any'
  | 'WritingDone_FetchingLabels'
  | 'WritingDone_LabelsFetched'
  | 'WritingDone_FetchingHistoryId'
  | 'WritingDone_HistoryIdFetched'
  | 'WritingDone_InitialHistoryIdFetched'
  | 'WritingDone_FetchingOrphans'
  | 'WritingDone_OrphansFetched'
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
  | 'FetchingLabels_QuotaExceeded'
  | 'FetchingLabels_RestartingNetwork'
  | 'FetchingLabels_NetworkRestarted'
  | 'FetchingLabels_Writing'
  | 'FetchingLabels_WritingDone'
  | 'FetchingLabels_Any'
  | 'FetchingLabels_LabelsFetched'
  | 'FetchingLabels_FetchingHistoryId'
  | 'FetchingLabels_HistoryIdFetched'
  | 'FetchingLabels_InitialHistoryIdFetched'
  | 'FetchingLabels_FetchingOrphans'
  | 'FetchingLabels_OrphansFetched'
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
  | 'LabelsFetched_QuotaExceeded'
  | 'LabelsFetched_RestartingNetwork'
  | 'LabelsFetched_NetworkRestarted'
  | 'LabelsFetched_Writing'
  | 'LabelsFetched_WritingDone'
  | 'LabelsFetched_FetchingLabels'
  | 'LabelsFetched_Any'
  | 'LabelsFetched_FetchingHistoryId'
  | 'LabelsFetched_HistoryIdFetched'
  | 'LabelsFetched_InitialHistoryIdFetched'
  | 'LabelsFetched_FetchingOrphans'
  | 'LabelsFetched_OrphansFetched'
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
  | 'FetchingHistoryId_QuotaExceeded'
  | 'FetchingHistoryId_RestartingNetwork'
  | 'FetchingHistoryId_NetworkRestarted'
  | 'FetchingHistoryId_Writing'
  | 'FetchingHistoryId_WritingDone'
  | 'FetchingHistoryId_FetchingLabels'
  | 'FetchingHistoryId_LabelsFetched'
  | 'FetchingHistoryId_Any'
  | 'FetchingHistoryId_HistoryIdFetched'
  | 'FetchingHistoryId_InitialHistoryIdFetched'
  | 'FetchingHistoryId_FetchingOrphans'
  | 'FetchingHistoryId_OrphansFetched'
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
  | 'HistoryIdFetched_QuotaExceeded'
  | 'HistoryIdFetched_RestartingNetwork'
  | 'HistoryIdFetched_NetworkRestarted'
  | 'HistoryIdFetched_Writing'
  | 'HistoryIdFetched_WritingDone'
  | 'HistoryIdFetched_FetchingLabels'
  | 'HistoryIdFetched_LabelsFetched'
  | 'HistoryIdFetched_FetchingHistoryId'
  | 'HistoryIdFetched_Any'
  | 'HistoryIdFetched_InitialHistoryIdFetched'
  | 'HistoryIdFetched_FetchingOrphans'
  | 'HistoryIdFetched_OrphansFetched'
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
  | 'InitialHistoryIdFetched_QuotaExceeded'
  | 'InitialHistoryIdFetched_RestartingNetwork'
  | 'InitialHistoryIdFetched_NetworkRestarted'
  | 'InitialHistoryIdFetched_Writing'
  | 'InitialHistoryIdFetched_WritingDone'
  | 'InitialHistoryIdFetched_FetchingLabels'
  | 'InitialHistoryIdFetched_LabelsFetched'
  | 'InitialHistoryIdFetched_FetchingHistoryId'
  | 'InitialHistoryIdFetched_HistoryIdFetched'
  | 'InitialHistoryIdFetched_Any'
  | 'InitialHistoryIdFetched_FetchingOrphans'
  | 'InitialHistoryIdFetched_OrphansFetched'
  | 'InitialHistoryIdFetched_Exception'
  | 'InitialHistoryIdFetched_exit'
  | 'InitialHistoryIdFetched_end'
  | 'FetchingOrphans_Enabled'
  | 'FetchingOrphans_Initializing'
  | 'FetchingOrphans_Ready'
  | 'FetchingOrphans_ConfigSet'
  | 'FetchingOrphans_SubsReady'
  | 'FetchingOrphans_SubsInited'
  | 'FetchingOrphans_Reading'
  | 'FetchingOrphans_ReadingDone'
  | 'FetchingOrphans_QuotaExceeded'
  | 'FetchingOrphans_RestartingNetwork'
  | 'FetchingOrphans_NetworkRestarted'
  | 'FetchingOrphans_Writing'
  | 'FetchingOrphans_WritingDone'
  | 'FetchingOrphans_FetchingLabels'
  | 'FetchingOrphans_LabelsFetched'
  | 'FetchingOrphans_FetchingHistoryId'
  | 'FetchingOrphans_HistoryIdFetched'
  | 'FetchingOrphans_InitialHistoryIdFetched'
  | 'FetchingOrphans_Any'
  | 'FetchingOrphans_OrphansFetched'
  | 'FetchingOrphans_Exception'
  | 'FetchingOrphans_exit'
  | 'FetchingOrphans_end'
  | 'OrphansFetched_Enabled'
  | 'OrphansFetched_Initializing'
  | 'OrphansFetched_Ready'
  | 'OrphansFetched_ConfigSet'
  | 'OrphansFetched_SubsReady'
  | 'OrphansFetched_SubsInited'
  | 'OrphansFetched_Reading'
  | 'OrphansFetched_ReadingDone'
  | 'OrphansFetched_QuotaExceeded'
  | 'OrphansFetched_RestartingNetwork'
  | 'OrphansFetched_NetworkRestarted'
  | 'OrphansFetched_Writing'
  | 'OrphansFetched_WritingDone'
  | 'OrphansFetched_FetchingLabels'
  | 'OrphansFetched_LabelsFetched'
  | 'OrphansFetched_FetchingHistoryId'
  | 'OrphansFetched_HistoryIdFetched'
  | 'OrphansFetched_InitialHistoryIdFetched'
  | 'OrphansFetched_FetchingOrphans'
  | 'OrphansFetched_Any'
  | 'OrphansFetched_Exception'
  | 'OrphansFetched_exit'
  | 'OrphansFetched_end'
  | 'Exception_Enabled'
  | 'Exception_Initializing'
  | 'Exception_Ready'
  | 'Exception_ConfigSet'
  | 'Exception_SubsReady'
  | 'Exception_SubsInited'
  | 'Exception_Reading'
  | 'Exception_ReadingDone'
  | 'Exception_QuotaExceeded'
  | 'Exception_RestartingNetwork'
  | 'Exception_NetworkRestarted'
  | 'Exception_Writing'
  | 'Exception_WritingDone'
  | 'Exception_FetchingLabels'
  | 'Exception_LabelsFetched'
  | 'Exception_FetchingHistoryId'
  | 'Exception_HistoryIdFetched'
  | 'Exception_InitialHistoryIdFetched'
  | 'Exception_FetchingOrphans'
  | 'Exception_OrphansFetched'
  | 'Exception_exit'
  | 'Exception_end'

/** Typesafe state interface */
export interface IState extends IStateBase<TStates> {}

/** Subclassable typesafe state interface */
export interface IStateExt<T extends string> extends IStateBase<T | TStates> {}

export interface IBind extends IBindBase {
  // Non-params events and transitions
  (event: TTransitions, listener: () => boolean | void, context?: Object): this
}

export interface IEmit extends IEmitBase {
  // Non-params events and transitions
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
  QuotaExceeded: IState
  RestartingNetwork: IState
  NetworkRestarted: IState
  Writing: IState
  WritingDone: IState
  FetchingLabels: IState
  LabelsFetched: IState
  FetchingHistoryId: IState
  HistoryIdFetched: IState
  InitialHistoryIdFetched: IState
  FetchingOrphans: IState
  OrphansFetched: IState
  Exception?: IState
}
