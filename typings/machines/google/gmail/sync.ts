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
// STATE: Cached
// ----- ----- ----- ----- -----

/** machine.bind('Cached', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'Cached_enter',
    listener: () => /* param1: any?, param2: any? */ boolean | undefined,
    context?: Object
  ): this
  (
    event: 'Cached_state',
    listener: () => /* param1: any?, param2: any? */ any,
    context?: Object
  ): this
}

/** machine.emit('Cached', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'Cached_enter' /*, param1: any?, param2: any? */): boolean | void
  (event: 'Cached_state' /*, param1: any?, param2: any? */): boolean | void
}

/** Method declarations */
export interface ITransitions {
  Cached_enter /* param1: any?, param2: any? */?(): boolean | void
  Cached_state /* param1: any?, param2: any? */?():
    | boolean
    | void
    | Promise<boolean | void>
}

// ----- ----- ----- ----- -----
// STATE: Dirty
// ----- ----- ----- ----- -----

/** machine.bind('Dirty', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'Dirty_enter',
    listener: () => /* param1: any?, param2: any? */ boolean | undefined,
    context?: Object
  ): this
  (
    event: 'Dirty_state',
    listener: () => /* param1: any?, param2: any? */ any,
    context?: Object
  ): this
}

/** machine.emit('Dirty', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'Dirty_enter' /*, param1: any?, param2: any? */): boolean | void
  (event: 'Dirty_state' /*, param1: any?, param2: any? */): boolean | void
}

/** Method declarations */
export interface ITransitions {
  Dirty_enter /* param1: any?, param2: any? */?(): boolean | void
  Dirty_state /* param1: any?, param2: any? */?():
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
// STATE: Restarting
// ----- ----- ----- ----- -----

/** machine.bind('Restarting', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'Restarting_enter',
    listener: () => /* param1: any?, param2: any? */ boolean | undefined,
    context?: Object
  ): this
  (
    event: 'Restarting_state',
    listener: () => /* param1: any?, param2: any? */ any,
    context?: Object
  ): this
}

/** machine.emit('Restarting', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'Restarting_enter' /*, param1: any?, param2: any? */): boolean | void
  (event: 'Restarting_state' /*, param1: any?, param2: any? */): boolean | void
}

/** Method declarations */
export interface ITransitions {
  Restarting_enter /* param1: any?, param2: any? */?(): boolean | void
  Restarting_state /* param1: any?, param2: any? */?():
    | boolean
    | void
    | Promise<boolean | void>
}

// ----- ----- ----- ----- -----
// STATE: Restarted
// ----- ----- ----- ----- -----

/** machine.bind('Restarted', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'Restarted_enter',
    listener: () => /* param1: any?, param2: any? */ boolean | undefined,
    context?: Object
  ): this
  (
    event: 'Restarted_state',
    listener: () => /* param1: any?, param2: any? */ any,
    context?: Object
  ): this
}

/** machine.emit('Restarted', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'Restarted_enter' /*, param1: any?, param2: any? */): boolean | void
  (event: 'Restarted_state' /*, param1: any?, param2: any? */): boolean | void
}

/** Method declarations */
export interface ITransitions {
  Restarted_enter /* param1: any?, param2: any? */?(): boolean | void
  Restarted_state /* param1: any?, param2: any? */?():
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
  Enabled_Cached?(): boolean | void
  Enabled_Dirty?(): boolean | void
  Enabled_QuotaExceeded?(): boolean | void
  Enabled_Restarting?(): boolean | void
  Enabled_Restarted?(): boolean | void
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
  Initializing_Cached?(): boolean | void
  Initializing_Dirty?(): boolean | void
  Initializing_QuotaExceeded?(): boolean | void
  Initializing_Restarting?(): boolean | void
  Initializing_Restarted?(): boolean | void
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
  Ready_Cached?(): boolean | void
  Ready_Dirty?(): boolean | void
  Ready_QuotaExceeded?(): boolean | void
  Ready_Restarting?(): boolean | void
  Ready_Restarted?(): boolean | void
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
  ConfigSet_Cached?(): boolean | void
  ConfigSet_Dirty?(): boolean | void
  ConfigSet_QuotaExceeded?(): boolean | void
  ConfigSet_Restarting?(): boolean | void
  ConfigSet_Restarted?(): boolean | void
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
  SubsReady_Cached?(): boolean | void
  SubsReady_Dirty?(): boolean | void
  SubsReady_QuotaExceeded?(): boolean | void
  SubsReady_Restarting?(): boolean | void
  SubsReady_Restarted?(): boolean | void
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
  SubsInited_Cached?(): boolean | void
  SubsInited_Dirty?(): boolean | void
  SubsInited_QuotaExceeded?(): boolean | void
  SubsInited_Restarting?(): boolean | void
  SubsInited_Restarted?(): boolean | void
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
  Reading_Cached?(): boolean | void
  Reading_Dirty?(): boolean | void
  Reading_QuotaExceeded?(): boolean | void
  Reading_Restarting?(): boolean | void
  Reading_Restarted?(): boolean | void
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
  ReadingDone_Cached?(): boolean | void
  ReadingDone_Dirty?(): boolean | void
  ReadingDone_QuotaExceeded?(): boolean | void
  ReadingDone_Restarting?(): boolean | void
  ReadingDone_Restarted?(): boolean | void
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
  Cached_Enabled?(): boolean | void
  Cached_Initializing?(): boolean | void
  Cached_Ready?(): boolean | void
  Cached_ConfigSet?(): boolean | void
  Cached_SubsReady?(): boolean | void
  Cached_SubsInited?(): boolean | void
  Cached_Reading?(): boolean | void
  Cached_ReadingDone?(): boolean | void
  Cached_Any?(): boolean | void
  Cached_Dirty?(): boolean | void
  Cached_QuotaExceeded?(): boolean | void
  Cached_Restarting?(): boolean | void
  Cached_Restarted?(): boolean | void
  Cached_Writing?(): boolean | void
  Cached_WritingDone?(): boolean | void
  Cached_FetchingLabels?(): boolean | void
  Cached_LabelsFetched?(): boolean | void
  Cached_FetchingHistoryId?(): boolean | void
  Cached_HistoryIdFetched?(): boolean | void
  Cached_InitialHistoryIdFetched?(): boolean | void
  Cached_FetchingOrphans?(): boolean | void
  Cached_OrphansFetched?(): boolean | void
  Cached_Exception?(): boolean | void
  Cached_exit?(): boolean | void
  Cached_end?(): boolean | void | Promise<boolean | void>
  Dirty_Enabled?(): boolean | void
  Dirty_Initializing?(): boolean | void
  Dirty_Ready?(): boolean | void
  Dirty_ConfigSet?(): boolean | void
  Dirty_SubsReady?(): boolean | void
  Dirty_SubsInited?(): boolean | void
  Dirty_Reading?(): boolean | void
  Dirty_ReadingDone?(): boolean | void
  Dirty_Cached?(): boolean | void
  Dirty_Any?(): boolean | void
  Dirty_QuotaExceeded?(): boolean | void
  Dirty_Restarting?(): boolean | void
  Dirty_Restarted?(): boolean | void
  Dirty_Writing?(): boolean | void
  Dirty_WritingDone?(): boolean | void
  Dirty_FetchingLabels?(): boolean | void
  Dirty_LabelsFetched?(): boolean | void
  Dirty_FetchingHistoryId?(): boolean | void
  Dirty_HistoryIdFetched?(): boolean | void
  Dirty_InitialHistoryIdFetched?(): boolean | void
  Dirty_FetchingOrphans?(): boolean | void
  Dirty_OrphansFetched?(): boolean | void
  Dirty_Exception?(): boolean | void
  Dirty_exit?(): boolean | void
  Dirty_end?(): boolean | void | Promise<boolean | void>
  QuotaExceeded_Enabled?(): boolean | void
  QuotaExceeded_Initializing?(): boolean | void
  QuotaExceeded_Ready?(): boolean | void
  QuotaExceeded_ConfigSet?(): boolean | void
  QuotaExceeded_SubsReady?(): boolean | void
  QuotaExceeded_SubsInited?(): boolean | void
  QuotaExceeded_Reading?(): boolean | void
  QuotaExceeded_ReadingDone?(): boolean | void
  QuotaExceeded_Cached?(): boolean | void
  QuotaExceeded_Dirty?(): boolean | void
  QuotaExceeded_Any?(): boolean | void
  QuotaExceeded_Restarting?(): boolean | void
  QuotaExceeded_Restarted?(): boolean | void
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
  Restarting_Enabled?(): boolean | void
  Restarting_Initializing?(): boolean | void
  Restarting_Ready?(): boolean | void
  Restarting_ConfigSet?(): boolean | void
  Restarting_SubsReady?(): boolean | void
  Restarting_SubsInited?(): boolean | void
  Restarting_Reading?(): boolean | void
  Restarting_ReadingDone?(): boolean | void
  Restarting_Cached?(): boolean | void
  Restarting_Dirty?(): boolean | void
  Restarting_QuotaExceeded?(): boolean | void
  Restarting_Any?(): boolean | void
  Restarting_Restarted?(): boolean | void
  Restarting_Writing?(): boolean | void
  Restarting_WritingDone?(): boolean | void
  Restarting_FetchingLabels?(): boolean | void
  Restarting_LabelsFetched?(): boolean | void
  Restarting_FetchingHistoryId?(): boolean | void
  Restarting_HistoryIdFetched?(): boolean | void
  Restarting_InitialHistoryIdFetched?(): boolean | void
  Restarting_FetchingOrphans?(): boolean | void
  Restarting_OrphansFetched?(): boolean | void
  Restarting_Exception?(): boolean | void
  Restarting_exit?(): boolean | void
  Restarting_end?(): boolean | void | Promise<boolean | void>
  Restarted_Enabled?(): boolean | void
  Restarted_Initializing?(): boolean | void
  Restarted_Ready?(): boolean | void
  Restarted_ConfigSet?(): boolean | void
  Restarted_SubsReady?(): boolean | void
  Restarted_SubsInited?(): boolean | void
  Restarted_Reading?(): boolean | void
  Restarted_ReadingDone?(): boolean | void
  Restarted_Cached?(): boolean | void
  Restarted_Dirty?(): boolean | void
  Restarted_QuotaExceeded?(): boolean | void
  Restarted_Restarting?(): boolean | void
  Restarted_Any?(): boolean | void
  Restarted_Writing?(): boolean | void
  Restarted_WritingDone?(): boolean | void
  Restarted_FetchingLabels?(): boolean | void
  Restarted_LabelsFetched?(): boolean | void
  Restarted_FetchingHistoryId?(): boolean | void
  Restarted_HistoryIdFetched?(): boolean | void
  Restarted_InitialHistoryIdFetched?(): boolean | void
  Restarted_FetchingOrphans?(): boolean | void
  Restarted_OrphansFetched?(): boolean | void
  Restarted_Exception?(): boolean | void
  Restarted_exit?(): boolean | void
  Restarted_end?(): boolean | void | Promise<boolean | void>
  Writing_Enabled?(): boolean | void
  Writing_Initializing?(): boolean | void
  Writing_Ready?(): boolean | void
  Writing_ConfigSet?(): boolean | void
  Writing_SubsReady?(): boolean | void
  Writing_SubsInited?(): boolean | void
  Writing_Reading?(): boolean | void
  Writing_ReadingDone?(): boolean | void
  Writing_Cached?(): boolean | void
  Writing_Dirty?(): boolean | void
  Writing_QuotaExceeded?(): boolean | void
  Writing_Restarting?(): boolean | void
  Writing_Restarted?(): boolean | void
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
  WritingDone_Cached?(): boolean | void
  WritingDone_Dirty?(): boolean | void
  WritingDone_QuotaExceeded?(): boolean | void
  WritingDone_Restarting?(): boolean | void
  WritingDone_Restarted?(): boolean | void
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
  FetchingLabels_Cached?(): boolean | void
  FetchingLabels_Dirty?(): boolean | void
  FetchingLabels_QuotaExceeded?(): boolean | void
  FetchingLabels_Restarting?(): boolean | void
  FetchingLabels_Restarted?(): boolean | void
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
  LabelsFetched_Cached?(): boolean | void
  LabelsFetched_Dirty?(): boolean | void
  LabelsFetched_QuotaExceeded?(): boolean | void
  LabelsFetched_Restarting?(): boolean | void
  LabelsFetched_Restarted?(): boolean | void
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
  FetchingHistoryId_Cached?(): boolean | void
  FetchingHistoryId_Dirty?(): boolean | void
  FetchingHistoryId_QuotaExceeded?(): boolean | void
  FetchingHistoryId_Restarting?(): boolean | void
  FetchingHistoryId_Restarted?(): boolean | void
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
  HistoryIdFetched_Cached?(): boolean | void
  HistoryIdFetched_Dirty?(): boolean | void
  HistoryIdFetched_QuotaExceeded?(): boolean | void
  HistoryIdFetched_Restarting?(): boolean | void
  HistoryIdFetched_Restarted?(): boolean | void
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
  InitialHistoryIdFetched_Cached?(): boolean | void
  InitialHistoryIdFetched_Dirty?(): boolean | void
  InitialHistoryIdFetched_QuotaExceeded?(): boolean | void
  InitialHistoryIdFetched_Restarting?(): boolean | void
  InitialHistoryIdFetched_Restarted?(): boolean | void
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
  FetchingOrphans_Cached?(): boolean | void
  FetchingOrphans_Dirty?(): boolean | void
  FetchingOrphans_QuotaExceeded?(): boolean | void
  FetchingOrphans_Restarting?(): boolean | void
  FetchingOrphans_Restarted?(): boolean | void
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
  OrphansFetched_Cached?(): boolean | void
  OrphansFetched_Dirty?(): boolean | void
  OrphansFetched_QuotaExceeded?(): boolean | void
  OrphansFetched_Restarting?(): boolean | void
  OrphansFetched_Restarted?(): boolean | void
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
  Exception_Cached?(): boolean | void
  Exception_Dirty?(): boolean | void
  Exception_QuotaExceeded?(): boolean | void
  Exception_Restarting?(): boolean | void
  Exception_Restarted?(): boolean | void
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
  | 'Cached'
  | 'Dirty'
  | 'QuotaExceeded'
  | 'Restarting'
  | 'Restarted'
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
  | 'Enabled_Cached'
  | 'Enabled_Dirty'
  | 'Enabled_QuotaExceeded'
  | 'Enabled_Restarting'
  | 'Enabled_Restarted'
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
  | 'Initializing_Cached'
  | 'Initializing_Dirty'
  | 'Initializing_QuotaExceeded'
  | 'Initializing_Restarting'
  | 'Initializing_Restarted'
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
  | 'Ready_Cached'
  | 'Ready_Dirty'
  | 'Ready_QuotaExceeded'
  | 'Ready_Restarting'
  | 'Ready_Restarted'
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
  | 'ConfigSet_Cached'
  | 'ConfigSet_Dirty'
  | 'ConfigSet_QuotaExceeded'
  | 'ConfigSet_Restarting'
  | 'ConfigSet_Restarted'
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
  | 'SubsReady_Cached'
  | 'SubsReady_Dirty'
  | 'SubsReady_QuotaExceeded'
  | 'SubsReady_Restarting'
  | 'SubsReady_Restarted'
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
  | 'SubsInited_Cached'
  | 'SubsInited_Dirty'
  | 'SubsInited_QuotaExceeded'
  | 'SubsInited_Restarting'
  | 'SubsInited_Restarted'
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
  | 'Reading_Cached'
  | 'Reading_Dirty'
  | 'Reading_QuotaExceeded'
  | 'Reading_Restarting'
  | 'Reading_Restarted'
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
  | 'ReadingDone_Cached'
  | 'ReadingDone_Dirty'
  | 'ReadingDone_QuotaExceeded'
  | 'ReadingDone_Restarting'
  | 'ReadingDone_Restarted'
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
  | 'Cached_Enabled'
  | 'Cached_Initializing'
  | 'Cached_Ready'
  | 'Cached_ConfigSet'
  | 'Cached_SubsReady'
  | 'Cached_SubsInited'
  | 'Cached_Reading'
  | 'Cached_ReadingDone'
  | 'Cached_Any'
  | 'Cached_Dirty'
  | 'Cached_QuotaExceeded'
  | 'Cached_Restarting'
  | 'Cached_Restarted'
  | 'Cached_Writing'
  | 'Cached_WritingDone'
  | 'Cached_FetchingLabels'
  | 'Cached_LabelsFetched'
  | 'Cached_FetchingHistoryId'
  | 'Cached_HistoryIdFetched'
  | 'Cached_InitialHistoryIdFetched'
  | 'Cached_FetchingOrphans'
  | 'Cached_OrphansFetched'
  | 'Cached_Exception'
  | 'Cached_exit'
  | 'Cached_end'
  | 'Dirty_Enabled'
  | 'Dirty_Initializing'
  | 'Dirty_Ready'
  | 'Dirty_ConfigSet'
  | 'Dirty_SubsReady'
  | 'Dirty_SubsInited'
  | 'Dirty_Reading'
  | 'Dirty_ReadingDone'
  | 'Dirty_Cached'
  | 'Dirty_Any'
  | 'Dirty_QuotaExceeded'
  | 'Dirty_Restarting'
  | 'Dirty_Restarted'
  | 'Dirty_Writing'
  | 'Dirty_WritingDone'
  | 'Dirty_FetchingLabels'
  | 'Dirty_LabelsFetched'
  | 'Dirty_FetchingHistoryId'
  | 'Dirty_HistoryIdFetched'
  | 'Dirty_InitialHistoryIdFetched'
  | 'Dirty_FetchingOrphans'
  | 'Dirty_OrphansFetched'
  | 'Dirty_Exception'
  | 'Dirty_exit'
  | 'Dirty_end'
  | 'QuotaExceeded_Enabled'
  | 'QuotaExceeded_Initializing'
  | 'QuotaExceeded_Ready'
  | 'QuotaExceeded_ConfigSet'
  | 'QuotaExceeded_SubsReady'
  | 'QuotaExceeded_SubsInited'
  | 'QuotaExceeded_Reading'
  | 'QuotaExceeded_ReadingDone'
  | 'QuotaExceeded_Cached'
  | 'QuotaExceeded_Dirty'
  | 'QuotaExceeded_Any'
  | 'QuotaExceeded_Restarting'
  | 'QuotaExceeded_Restarted'
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
  | 'Restarting_Enabled'
  | 'Restarting_Initializing'
  | 'Restarting_Ready'
  | 'Restarting_ConfigSet'
  | 'Restarting_SubsReady'
  | 'Restarting_SubsInited'
  | 'Restarting_Reading'
  | 'Restarting_ReadingDone'
  | 'Restarting_Cached'
  | 'Restarting_Dirty'
  | 'Restarting_QuotaExceeded'
  | 'Restarting_Any'
  | 'Restarting_Restarted'
  | 'Restarting_Writing'
  | 'Restarting_WritingDone'
  | 'Restarting_FetchingLabels'
  | 'Restarting_LabelsFetched'
  | 'Restarting_FetchingHistoryId'
  | 'Restarting_HistoryIdFetched'
  | 'Restarting_InitialHistoryIdFetched'
  | 'Restarting_FetchingOrphans'
  | 'Restarting_OrphansFetched'
  | 'Restarting_Exception'
  | 'Restarting_exit'
  | 'Restarting_end'
  | 'Restarted_Enabled'
  | 'Restarted_Initializing'
  | 'Restarted_Ready'
  | 'Restarted_ConfigSet'
  | 'Restarted_SubsReady'
  | 'Restarted_SubsInited'
  | 'Restarted_Reading'
  | 'Restarted_ReadingDone'
  | 'Restarted_Cached'
  | 'Restarted_Dirty'
  | 'Restarted_QuotaExceeded'
  | 'Restarted_Restarting'
  | 'Restarted_Any'
  | 'Restarted_Writing'
  | 'Restarted_WritingDone'
  | 'Restarted_FetchingLabels'
  | 'Restarted_LabelsFetched'
  | 'Restarted_FetchingHistoryId'
  | 'Restarted_HistoryIdFetched'
  | 'Restarted_InitialHistoryIdFetched'
  | 'Restarted_FetchingOrphans'
  | 'Restarted_OrphansFetched'
  | 'Restarted_Exception'
  | 'Restarted_exit'
  | 'Restarted_end'
  | 'Writing_Enabled'
  | 'Writing_Initializing'
  | 'Writing_Ready'
  | 'Writing_ConfigSet'
  | 'Writing_SubsReady'
  | 'Writing_SubsInited'
  | 'Writing_Reading'
  | 'Writing_ReadingDone'
  | 'Writing_Cached'
  | 'Writing_Dirty'
  | 'Writing_QuotaExceeded'
  | 'Writing_Restarting'
  | 'Writing_Restarted'
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
  | 'WritingDone_Cached'
  | 'WritingDone_Dirty'
  | 'WritingDone_QuotaExceeded'
  | 'WritingDone_Restarting'
  | 'WritingDone_Restarted'
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
  | 'FetchingLabels_Cached'
  | 'FetchingLabels_Dirty'
  | 'FetchingLabels_QuotaExceeded'
  | 'FetchingLabels_Restarting'
  | 'FetchingLabels_Restarted'
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
  | 'LabelsFetched_Cached'
  | 'LabelsFetched_Dirty'
  | 'LabelsFetched_QuotaExceeded'
  | 'LabelsFetched_Restarting'
  | 'LabelsFetched_Restarted'
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
  | 'FetchingHistoryId_Cached'
  | 'FetchingHistoryId_Dirty'
  | 'FetchingHistoryId_QuotaExceeded'
  | 'FetchingHistoryId_Restarting'
  | 'FetchingHistoryId_Restarted'
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
  | 'HistoryIdFetched_Cached'
  | 'HistoryIdFetched_Dirty'
  | 'HistoryIdFetched_QuotaExceeded'
  | 'HistoryIdFetched_Restarting'
  | 'HistoryIdFetched_Restarted'
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
  | 'InitialHistoryIdFetched_Cached'
  | 'InitialHistoryIdFetched_Dirty'
  | 'InitialHistoryIdFetched_QuotaExceeded'
  | 'InitialHistoryIdFetched_Restarting'
  | 'InitialHistoryIdFetched_Restarted'
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
  | 'FetchingOrphans_Cached'
  | 'FetchingOrphans_Dirty'
  | 'FetchingOrphans_QuotaExceeded'
  | 'FetchingOrphans_Restarting'
  | 'FetchingOrphans_Restarted'
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
  | 'OrphansFetched_Cached'
  | 'OrphansFetched_Dirty'
  | 'OrphansFetched_QuotaExceeded'
  | 'OrphansFetched_Restarting'
  | 'OrphansFetched_Restarted'
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
  | 'Exception_Cached'
  | 'Exception_Dirty'
  | 'Exception_QuotaExceeded'
  | 'Exception_Restarting'
  | 'Exception_Restarted'
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
  Cached: IState
  Dirty: IState
  QuotaExceeded: IState
  Restarting: IState
  Restarted: IState
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
