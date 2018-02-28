import AsyncMachine from 'asyncmachine'
import { Sync } from './sync'

export default class BaseMachine extends AsyncMachine<any, any, any> {
  target: Sync

  Exception_enter(err, ...rest): boolean {
    this.target.log('Error: %O', err)
    if (this.target.root) {
      this.target.root.state.add('Exception', err, ...rest)
      return false
    }
  }
}
