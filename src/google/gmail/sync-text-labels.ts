import Sync from '../../sync/sync'
import GmailQuery from './query'

export default class GmailTextLabelsSync extends Sync {
  query: GmailQuery

  constructor(public api, public labels) {}
}
