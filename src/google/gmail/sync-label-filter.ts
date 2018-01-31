import Sync, { SyncState } from '../../sync/sync'
import GmailQuery from './query'
import * as google from 'googleapis'

export class State extends SyncState {
  // TODO
  constructor(target: Sync) {
    super(target)
    this.registerAll()
  }
}

export default class GmailLabelFilterSync extends Sync {
  query: GmailQuery

  constructor(
    public datastore: DataStore,
    public api: google.gmail.v1.Gmail,
    public query: string,
    public name: string
  ) {
    super()
    // // narrow the query to results requiring the labels modification
    // let exclusive_query = query
    // // labels to add
    // if (labels[0].length) {
    //   exclusive_query +=
    //     ' (-label:' +
    //     labels[0].map(this.normalizeLabelName).join(' OR -label:') +
    //     ')'
    // }
    // // labels to remove
    // // TODO loose casting once compiler will figure
    // if (labels[1] && (<string[]>labels[1]).length) {
    //   exclusive_query +=
    //     ' (label:' +
    //     (<string[]>labels[1]).map(this.normalizeLabelName).join(' OR label:') +
    //     ')'
    // }
    this.query = GmailQuery('TODO', name, true)
    // this.query = GmailQuery(exclusive_query, name, true)
  }

  getState() {
    const state = new State(this)
    state.id(this.name)
    return state
  }
}
