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
// STATE: DBReady
// ----- ----- ----- ----- -----

/** machine.bind('DBReady', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'DBReady_enter',
    listener: () => /* param1: any?, param2: any? */ boolean | undefined,
    context?: Object
  ): this
  (
    event: 'DBReady_state',
    listener: () => /* param1: any?, param2: any? */ any,
    context?: Object
  ): this
}

/** machine.emit('DBReady', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'DBReady_enter' /*, param1: any?, param2: any? */): boolean | void
  (event: 'DBReady_state' /*, param1: any?, param2: any? */): boolean | void
}

/** Method declarations */
export interface ITransitions {
  DBReady_enter /* param1: any?, param2: any? */?(): boolean | void
  DBReady_state /* param1: any?, param2: any? */?():
    | boolean
    | void
    | Promise<boolean | void>
}

// ----- ----- ----- ----- -----
// STATE: HeartBeat
// ----- ----- ----- ----- -----

/** machine.bind('HeartBeat', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'HeartBeat_enter',
    listener: () => /* param1: any?, param2: any? */ boolean | undefined,
    context?: Object
  ): this
  (
    event: 'HeartBeat_state',
    listener: () => /* param1: any?, param2: any? */ any,
    context?: Object
  ): this
}

/** machine.emit('HeartBeat', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'HeartBeat_enter' /*, param1: any?, param2: any? */): boolean | void
  (event: 'HeartBeat_state' /*, param1: any?, param2: any? */): boolean | void
}

/** Method declarations */
export interface ITransitions {
  HeartBeat_enter /* param1: any?, param2: any? */?(): boolean | void
  HeartBeat_state /* param1: any?, param2: any? */?():
    | boolean
    | void
    | Promise<boolean | void>
}

// ----- ----- ----- ----- -----
// STATE: Scheduled
// ----- ----- ----- ----- -----

/** machine.bind('Scheduled', (param1, param2) => {}) */
export interface IBind extends IBindBase {
  (
    event: 'Scheduled_enter',
    listener: () => /* param1: any?, param2: any? */ boolean | undefined,
    context?: Object
  ): this
  (
    event: 'Scheduled_state',
    listener: () => /* param1: any?, param2: any? */ any,
    context?: Object
  ): this
}

/** machine.emit('Scheduled', param1, param2) */
export interface IEmit extends IEmitBase {
  (event: 'Scheduled_enter' /*, param1: any?, param2: any? */): boolean | void
  (event: 'Scheduled_state' /*, param1: any?, param2: any? */): boolean | void
}

/** Method declarations */
export interface ITransitions {
  Scheduled_enter /* param1: any?, param2: any? */?(): boolean | void
  Scheduled_state /* param1: any?, param2: any? */?():
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
  Enabled_Restarting?(): boolean | void
  Enabled_Restarted?(): boolean | void
  Enabled_Writing?(): boolean | void
  Enabled_WritingDone?(): boolean | void
  Enabled_DBReady?(): boolean | void
  Enabled_Exception?(): boolean | void
  Enabled_HeartBeat?(): boolean | void
  Enabled_Scheduled?(): boolean | void
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
  Initializing_Restarting?(): boolean | void
  Initializing_Restarted?(): boolean | void
  Initializing_Writing?(): boolean | void
  Initializing_WritingDone?(): boolean | void
  Initializing_DBReady?(): boolean | void
  Initializing_Exception?(): boolean | void
  Initializing_HeartBeat?(): boolean | void
  Initializing_Scheduled?(): boolean | void
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
  Ready_Restarting?(): boolean | void
  Ready_Restarted?(): boolean | void
  Ready_Writing?(): boolean | void
  Ready_WritingDone?(): boolean | void
  Ready_DBReady?(): boolean | void
  Ready_Exception?(): boolean | void
  Ready_HeartBeat?(): boolean | void
  Ready_Scheduled?(): boolean | void
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
  ConfigSet_Restarting?(): boolean | void
  ConfigSet_Restarted?(): boolean | void
  ConfigSet_Writing?(): boolean | void
  ConfigSet_WritingDone?(): boolean | void
  ConfigSet_DBReady?(): boolean | void
  ConfigSet_Exception?(): boolean | void
  ConfigSet_HeartBeat?(): boolean | void
  ConfigSet_Scheduled?(): boolean | void
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
  SubsReady_Restarting?(): boolean | void
  SubsReady_Restarted?(): boolean | void
  SubsReady_Writing?(): boolean | void
  SubsReady_WritingDone?(): boolean | void
  SubsReady_DBReady?(): boolean | void
  SubsReady_Exception?(): boolean | void
  SubsReady_HeartBeat?(): boolean | void
  SubsReady_Scheduled?(): boolean | void
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
  SubsInited_Restarting?(): boolean | void
  SubsInited_Restarted?(): boolean | void
  SubsInited_Writing?(): boolean | void
  SubsInited_WritingDone?(): boolean | void
  SubsInited_DBReady?(): boolean | void
  SubsInited_Exception?(): boolean | void
  SubsInited_HeartBeat?(): boolean | void
  SubsInited_Scheduled?(): boolean | void
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
  Reading_Restarting?(): boolean | void
  Reading_Restarted?(): boolean | void
  Reading_Writing?(): boolean | void
  Reading_WritingDone?(): boolean | void
  Reading_DBReady?(): boolean | void
  Reading_Exception?(): boolean | void
  Reading_HeartBeat?(): boolean | void
  Reading_Scheduled?(): boolean | void
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
  ReadingDone_Restarting?(): boolean | void
  ReadingDone_Restarted?(): boolean | void
  ReadingDone_Writing?(): boolean | void
  ReadingDone_WritingDone?(): boolean | void
  ReadingDone_DBReady?(): boolean | void
  ReadingDone_Exception?(): boolean | void
  ReadingDone_HeartBeat?(): boolean | void
  ReadingDone_Scheduled?(): boolean | void
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
  QuotaExceeded_Restarting?(): boolean | void
  QuotaExceeded_Restarted?(): boolean | void
  QuotaExceeded_Writing?(): boolean | void
  QuotaExceeded_WritingDone?(): boolean | void
  QuotaExceeded_DBReady?(): boolean | void
  QuotaExceeded_Exception?(): boolean | void
  QuotaExceeded_HeartBeat?(): boolean | void
  QuotaExceeded_Scheduled?(): boolean | void
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
  Restarting_QuotaExceeded?(): boolean | void
  Restarting_Any?(): boolean | void
  Restarting_Restarted?(): boolean | void
  Restarting_Writing?(): boolean | void
  Restarting_WritingDone?(): boolean | void
  Restarting_DBReady?(): boolean | void
  Restarting_Exception?(): boolean | void
  Restarting_HeartBeat?(): boolean | void
  Restarting_Scheduled?(): boolean | void
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
  Restarted_QuotaExceeded?(): boolean | void
  Restarted_Restarting?(): boolean | void
  Restarted_Any?(): boolean | void
  Restarted_Writing?(): boolean | void
  Restarted_WritingDone?(): boolean | void
  Restarted_DBReady?(): boolean | void
  Restarted_Exception?(): boolean | void
  Restarted_HeartBeat?(): boolean | void
  Restarted_Scheduled?(): boolean | void
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
  Writing_QuotaExceeded?(): boolean | void
  Writing_Restarting?(): boolean | void
  Writing_Restarted?(): boolean | void
  Writing_Any?(): boolean | void
  Writing_WritingDone?(): boolean | void
  Writing_DBReady?(): boolean | void
  Writing_Exception?(): boolean | void
  Writing_HeartBeat?(): boolean | void
  Writing_Scheduled?(): boolean | void
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
  WritingDone_Restarting?(): boolean | void
  WritingDone_Restarted?(): boolean | void
  WritingDone_Writing?(): boolean | void
  WritingDone_Any?(): boolean | void
  WritingDone_DBReady?(): boolean | void
  WritingDone_Exception?(): boolean | void
  WritingDone_HeartBeat?(): boolean | void
  WritingDone_Scheduled?(): boolean | void
  WritingDone_Exception?(): boolean | void
  WritingDone_exit?(): boolean | void
  WritingDone_end?(): boolean | void | Promise<boolean | void>
  DBReady_Enabled?(): boolean | void
  DBReady_Initializing?(): boolean | void
  DBReady_Ready?(): boolean | void
  DBReady_ConfigSet?(): boolean | void
  DBReady_SubsReady?(): boolean | void
  DBReady_SubsInited?(): boolean | void
  DBReady_Reading?(): boolean | void
  DBReady_ReadingDone?(): boolean | void
  DBReady_QuotaExceeded?(): boolean | void
  DBReady_Restarting?(): boolean | void
  DBReady_Restarted?(): boolean | void
  DBReady_Writing?(): boolean | void
  DBReady_WritingDone?(): boolean | void
  DBReady_Any?(): boolean | void
  DBReady_Exception?(): boolean | void
  DBReady_HeartBeat?(): boolean | void
  DBReady_Scheduled?(): boolean | void
  DBReady_Exception?(): boolean | void
  DBReady_exit?(): boolean | void
  DBReady_end?(): boolean | void | Promise<boolean | void>
  Exception_Enabled?(): boolean | void
  Exception_Initializing?(): boolean | void
  Exception_Ready?(): boolean | void
  Exception_ConfigSet?(): boolean | void
  Exception_SubsReady?(): boolean | void
  Exception_SubsInited?(): boolean | void
  Exception_Reading?(): boolean | void
  Exception_ReadingDone?(): boolean | void
  Exception_QuotaExceeded?(): boolean | void
  Exception_Restarting?(): boolean | void
  Exception_Restarted?(): boolean | void
  Exception_Writing?(): boolean | void
  Exception_WritingDone?(): boolean | void
  Exception_DBReady?(): boolean | void
  Exception_HeartBeat?(): boolean | void
  Exception_Scheduled?(): boolean | void
  Exception_exit?(): boolean | void
  Exception_end?(): boolean | void | Promise<boolean | void>
  HeartBeat_Enabled?(): boolean | void
  HeartBeat_Initializing?(): boolean | void
  HeartBeat_Ready?(): boolean | void
  HeartBeat_ConfigSet?(): boolean | void
  HeartBeat_SubsReady?(): boolean | void
  HeartBeat_SubsInited?(): boolean | void
  HeartBeat_Reading?(): boolean | void
  HeartBeat_ReadingDone?(): boolean | void
  HeartBeat_QuotaExceeded?(): boolean | void
  HeartBeat_Restarting?(): boolean | void
  HeartBeat_Restarted?(): boolean | void
  HeartBeat_Writing?(): boolean | void
  HeartBeat_WritingDone?(): boolean | void
  HeartBeat_DBReady?(): boolean | void
  HeartBeat_Exception?(): boolean | void
  HeartBeat_Any?(): boolean | void
  HeartBeat_Scheduled?(): boolean | void
  HeartBeat_Exception?(): boolean | void
  HeartBeat_exit?(): boolean | void
  HeartBeat_end?(): boolean | void | Promise<boolean | void>
  Scheduled_Enabled?(): boolean | void
  Scheduled_Initializing?(): boolean | void
  Scheduled_Ready?(): boolean | void
  Scheduled_ConfigSet?(): boolean | void
  Scheduled_SubsReady?(): boolean | void
  Scheduled_SubsInited?(): boolean | void
  Scheduled_Reading?(): boolean | void
  Scheduled_ReadingDone?(): boolean | void
  Scheduled_QuotaExceeded?(): boolean | void
  Scheduled_Restarting?(): boolean | void
  Scheduled_Restarted?(): boolean | void
  Scheduled_Writing?(): boolean | void
  Scheduled_WritingDone?(): boolean | void
  Scheduled_DBReady?(): boolean | void
  Scheduled_Exception?(): boolean | void
  Scheduled_HeartBeat?(): boolean | void
  Scheduled_Any?(): boolean | void
  Scheduled_Exception?(): boolean | void
  Scheduled_exit?(): boolean | void
  Scheduled_end?(): boolean | void | Promise<boolean | void>
  Exception_Enabled?(): boolean | void
  Exception_Initializing?(): boolean | void
  Exception_Ready?(): boolean | void
  Exception_ConfigSet?(): boolean | void
  Exception_SubsReady?(): boolean | void
  Exception_SubsInited?(): boolean | void
  Exception_Reading?(): boolean | void
  Exception_ReadingDone?(): boolean | void
  Exception_QuotaExceeded?(): boolean | void
  Exception_Restarting?(): boolean | void
  Exception_Restarted?(): boolean | void
  Exception_Writing?(): boolean | void
  Exception_WritingDone?(): boolean | void
  Exception_DBReady?(): boolean | void
  Exception_HeartBeat?(): boolean | void
  Exception_Scheduled?(): boolean | void
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
  | 'Restarting'
  | 'Restarted'
  | 'Writing'
  | 'WritingDone'
  | 'DBReady'
  | 'HeartBeat'
  | 'Scheduled'

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
  | 'Enabled_Restarting'
  | 'Enabled_Restarted'
  | 'Enabled_Writing'
  | 'Enabled_WritingDone'
  | 'Enabled_DBReady'
  | 'Enabled_Exception'
  | 'Enabled_HeartBeat'
  | 'Enabled_Scheduled'
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
  | 'Initializing_Restarting'
  | 'Initializing_Restarted'
  | 'Initializing_Writing'
  | 'Initializing_WritingDone'
  | 'Initializing_DBReady'
  | 'Initializing_Exception'
  | 'Initializing_HeartBeat'
  | 'Initializing_Scheduled'
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
  | 'Ready_Restarting'
  | 'Ready_Restarted'
  | 'Ready_Writing'
  | 'Ready_WritingDone'
  | 'Ready_DBReady'
  | 'Ready_Exception'
  | 'Ready_HeartBeat'
  | 'Ready_Scheduled'
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
  | 'ConfigSet_Restarting'
  | 'ConfigSet_Restarted'
  | 'ConfigSet_Writing'
  | 'ConfigSet_WritingDone'
  | 'ConfigSet_DBReady'
  | 'ConfigSet_Exception'
  | 'ConfigSet_HeartBeat'
  | 'ConfigSet_Scheduled'
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
  | 'SubsReady_Restarting'
  | 'SubsReady_Restarted'
  | 'SubsReady_Writing'
  | 'SubsReady_WritingDone'
  | 'SubsReady_DBReady'
  | 'SubsReady_Exception'
  | 'SubsReady_HeartBeat'
  | 'SubsReady_Scheduled'
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
  | 'SubsInited_Restarting'
  | 'SubsInited_Restarted'
  | 'SubsInited_Writing'
  | 'SubsInited_WritingDone'
  | 'SubsInited_DBReady'
  | 'SubsInited_Exception'
  | 'SubsInited_HeartBeat'
  | 'SubsInited_Scheduled'
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
  | 'Reading_Restarting'
  | 'Reading_Restarted'
  | 'Reading_Writing'
  | 'Reading_WritingDone'
  | 'Reading_DBReady'
  | 'Reading_Exception'
  | 'Reading_HeartBeat'
  | 'Reading_Scheduled'
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
  | 'ReadingDone_Restarting'
  | 'ReadingDone_Restarted'
  | 'ReadingDone_Writing'
  | 'ReadingDone_WritingDone'
  | 'ReadingDone_DBReady'
  | 'ReadingDone_Exception'
  | 'ReadingDone_HeartBeat'
  | 'ReadingDone_Scheduled'
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
  | 'QuotaExceeded_Restarting'
  | 'QuotaExceeded_Restarted'
  | 'QuotaExceeded_Writing'
  | 'QuotaExceeded_WritingDone'
  | 'QuotaExceeded_DBReady'
  | 'QuotaExceeded_Exception'
  | 'QuotaExceeded_HeartBeat'
  | 'QuotaExceeded_Scheduled'
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
  | 'Restarting_QuotaExceeded'
  | 'Restarting_Any'
  | 'Restarting_Restarted'
  | 'Restarting_Writing'
  | 'Restarting_WritingDone'
  | 'Restarting_DBReady'
  | 'Restarting_Exception'
  | 'Restarting_HeartBeat'
  | 'Restarting_Scheduled'
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
  | 'Restarted_QuotaExceeded'
  | 'Restarted_Restarting'
  | 'Restarted_Any'
  | 'Restarted_Writing'
  | 'Restarted_WritingDone'
  | 'Restarted_DBReady'
  | 'Restarted_Exception'
  | 'Restarted_HeartBeat'
  | 'Restarted_Scheduled'
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
  | 'Writing_QuotaExceeded'
  | 'Writing_Restarting'
  | 'Writing_Restarted'
  | 'Writing_Any'
  | 'Writing_WritingDone'
  | 'Writing_DBReady'
  | 'Writing_Exception'
  | 'Writing_HeartBeat'
  | 'Writing_Scheduled'
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
  | 'WritingDone_Restarting'
  | 'WritingDone_Restarted'
  | 'WritingDone_Writing'
  | 'WritingDone_Any'
  | 'WritingDone_DBReady'
  | 'WritingDone_Exception'
  | 'WritingDone_HeartBeat'
  | 'WritingDone_Scheduled'
  | 'WritingDone_Exception'
  | 'WritingDone_exit'
  | 'WritingDone_end'
  | 'DBReady_Enabled'
  | 'DBReady_Initializing'
  | 'DBReady_Ready'
  | 'DBReady_ConfigSet'
  | 'DBReady_SubsReady'
  | 'DBReady_SubsInited'
  | 'DBReady_Reading'
  | 'DBReady_ReadingDone'
  | 'DBReady_QuotaExceeded'
  | 'DBReady_Restarting'
  | 'DBReady_Restarted'
  | 'DBReady_Writing'
  | 'DBReady_WritingDone'
  | 'DBReady_Any'
  | 'DBReady_Exception'
  | 'DBReady_HeartBeat'
  | 'DBReady_Scheduled'
  | 'DBReady_Exception'
  | 'DBReady_exit'
  | 'DBReady_end'
  | 'Exception_Enabled'
  | 'Exception_Initializing'
  | 'Exception_Ready'
  | 'Exception_ConfigSet'
  | 'Exception_SubsReady'
  | 'Exception_SubsInited'
  | 'Exception_Reading'
  | 'Exception_ReadingDone'
  | 'Exception_QuotaExceeded'
  | 'Exception_Restarting'
  | 'Exception_Restarted'
  | 'Exception_Writing'
  | 'Exception_WritingDone'
  | 'Exception_DBReady'
  | 'Exception_HeartBeat'
  | 'Exception_Scheduled'
  | 'Exception_exit'
  | 'Exception_end'
  | 'HeartBeat_Enabled'
  | 'HeartBeat_Initializing'
  | 'HeartBeat_Ready'
  | 'HeartBeat_ConfigSet'
  | 'HeartBeat_SubsReady'
  | 'HeartBeat_SubsInited'
  | 'HeartBeat_Reading'
  | 'HeartBeat_ReadingDone'
  | 'HeartBeat_QuotaExceeded'
  | 'HeartBeat_Restarting'
  | 'HeartBeat_Restarted'
  | 'HeartBeat_Writing'
  | 'HeartBeat_WritingDone'
  | 'HeartBeat_DBReady'
  | 'HeartBeat_Exception'
  | 'HeartBeat_Any'
  | 'HeartBeat_Scheduled'
  | 'HeartBeat_Exception'
  | 'HeartBeat_exit'
  | 'HeartBeat_end'
  | 'Scheduled_Enabled'
  | 'Scheduled_Initializing'
  | 'Scheduled_Ready'
  | 'Scheduled_ConfigSet'
  | 'Scheduled_SubsReady'
  | 'Scheduled_SubsInited'
  | 'Scheduled_Reading'
  | 'Scheduled_ReadingDone'
  | 'Scheduled_QuotaExceeded'
  | 'Scheduled_Restarting'
  | 'Scheduled_Restarted'
  | 'Scheduled_Writing'
  | 'Scheduled_WritingDone'
  | 'Scheduled_DBReady'
  | 'Scheduled_Exception'
  | 'Scheduled_HeartBeat'
  | 'Scheduled_Any'
  | 'Scheduled_Exception'
  | 'Scheduled_exit'
  | 'Scheduled_end'
  | 'Exception_Enabled'
  | 'Exception_Initializing'
  | 'Exception_Ready'
  | 'Exception_ConfigSet'
  | 'Exception_SubsReady'
  | 'Exception_SubsInited'
  | 'Exception_Reading'
  | 'Exception_ReadingDone'
  | 'Exception_QuotaExceeded'
  | 'Exception_Restarting'
  | 'Exception_Restarted'
  | 'Exception_Writing'
  | 'Exception_WritingDone'
  | 'Exception_DBReady'
  | 'Exception_HeartBeat'
  | 'Exception_Scheduled'
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
  Restarting: IState
  Restarted: IState
  Writing: IState
  WritingDone: IState
  DBReady: IState
  HeartBeat: IState
  Scheduled: IState
  Exception?: IState
}
