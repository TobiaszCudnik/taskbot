import AsyncMachine, { machine } from 'asyncmachine'
import {
  IBind,
  IEmit,
  IJSONStates,
  IState,
  TStates
} from '../../typings/machines/sync/writer'
import { SyncReader, sync_reader_state } from './reader'

export type TSyncStateWriter = AsyncMachine<TStates, IBind, IEmit>

export { IState }
export const sync_writer_state: IJSONStates = {
  // inherit the SyncReader
  ...sync_reader_state,

  Writing: {
    drop: ['WritingDone', 'Reading', 'ReadingDone'],
    require: ['Enabled', 'Ready']
  },
  WritingDone: {
    drop: ['Writing', 'Reading', 'ReadingDone']
  },

  Reading: {
    drop: ['ReadingDone', 'Writing', 'WritingDone'],
    require: ['Enabled', 'Ready']
  },
  ReadingDone: {
    drop: ['Reading', 'Writing', 'WritingDone']
  },

  RestartingNetwork: { drop: ['NetworkRestarted'] },
  NetworkRestarted: { drop: ['RestartingNetwork'] }
}
// TODO consider moving to a separate file?
export abstract class SyncWriter<
  TConfig,
  TStates,
  IBind,
  IEmit
> extends SyncReader<TConfig, TStates, IBind, IEmit> {
  get state_writer(): TSyncStateWriter {
    return this.state
  }
  // TODO automate `bindToSubs()`
  // sub_states_inbound: [TStatesWriter, TStatesWriter][]
  // sub_states_outbound: [TStatesWriter, TStatesWriter][]

  last_write_end: moment.Moment
  last_write_start: moment.Moment
  last_write_time: moment.Duration

  get subs_flat_writers(): SyncWriter<any, any, any, any>[] {
    // TODO cast
    return <any>this.subs_flat.filter(sync => sync instanceof SyncWriter)
  }

  // ----- -----
  // Transitions
  // ----- -----

  Writing_enter() {
    if (!this.daily_quota_ok) {
      this.log_error('Skipping sync because of quota')
      this.state.add('WritingDone')
      return false
    }
    if (!this.last_read_end) {
      return false
    }
  }

  Writing_state() {
    this.last_write_start = moment()
  }

  WritingDone_enter() {
    return this.subs_flat_writers.every(sync => sync.state.is('WritingDone'))
  }

  WritingDone_state() {
    this.last_write_end = moment()
    this.last_write_time = moment.duration(
      this.last_write_end.diff(this.last_write_start)
    )
  }

  NetworkRestarted_enter() {
    return this.subs_flat_writers.every(sync =>
      sync.state.is('NetworkRestarted')
    )
  }

  // ----- -----
  // Methods
  // ----- -----

  getState(): AsyncMachine<any, any, any> {
    return machine(sync_writer_state).id('SyncWriter')
  }

  bindToSubs() {
    super.bindToSubs()
    for (const sync of this.subs_flat_writers) {
      // inbound
      sync.state.pipe('WritingDone', this.state_writer)
      sync.state.pipe('NetworkRestarted', this.state_writer)
      // outbound
      this.state_writer.pipe('Writing', sync.state)
      this.state_writer.pipe('RestartingNetwork', sync.state)
    }
  }
}
