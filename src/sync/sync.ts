// import { IBind, IEmit, IState, TStates } from '../google/gmail/gmail-types'
import { IBind, IEmit, IState } from 'asyncmachine/build/types'
import Gmail from '../google/gmail/gmail'
import AsyncMachine from 'asyncmachine'

export class SyncState extends AsyncMachine<any, IBind, IEmit>
    implements ISyncState{
  Enabled: IState = {}

  Initializing: IState = { require: ['Enabled'] }
  Ready: IState = { drop: ['Initializing'] }

  Writing: IState = {
    drop: ['WritingDone', 'Reading', 'ReadingDone'],
    require: ['Enabled', 'Ready'],
    add: ['Syncing']
  }
  WritingDone: IState = {
    drop: ['Writing', 'Reading', 'ReadingDone'],
    require: ['Enabled']
  }

  Reading: IState = {
    drop: ['ReadingDone', 'Writing', 'WritingDone'],
    require: ['Enabled', 'Ready'],
    add: ['Syncing']
  }
  ReadingDone: IState = {
    drop: ['Reading', 'Writing', 'WritingDone'],
    require: ['Enabled']
  }

  Syncing: IState = { drop: ['Synced'], require: ['Ready'] }
  Synced: IState = { drop: ['Syncing'] }

  constructor(target: Gmail) {
    super(target)
    this.registerAll()
  }
}

export interface ISyncState {
  Enabled: IState
  Initializing: IState
  Ready: IState
  Writing: IState
  WritingDone: IState
  Reading: IState
  ReadingDone: IState
  Syncing: IState
  Synced: IState
}

export default class Sync {
  state: ISyncState

  constructor() {
    this.state = new this.state_class(this)
  }

  get state_class() {
    return SyncState
  }
}
