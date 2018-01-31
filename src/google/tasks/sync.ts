import * as google from 'googleapis'
import GTasksListSync from './sync-list'
import { IGTasksList } from '../../types'
import Sync from '../../sync/sync'

// TODO state

export default class GTasksSync extends Sync {
  etags: {
    task_lists: string | null
  } = {
    task_lists: null
  }
  api: google.gmail.v1.Tasks

  constructor(public data: LokiCollection, public config, public auth) {
    super()
    this.api = google.tasks('v1', { auth: this.auth.client })
  }

  getState() {
    return super.getState().id('GTasks')
  }

  initSubs() {
    for (const [name, config] of this.config.lists) {
      this.subs[name] = new GTasksListSync(
        this.datastore,
        name,
        config,
        this.config.list_defaults
      )
    }
  }

  async FetchingTaskLists_state() {
    let abort = this.state.getAbort('FetchingTaskLists')
    let [list, res] = await this.req(
      this.api.tasklists.list,
      {
        etag: this.etags.task_lists
      },
      abort,
      true
    )
    if (abort()) {
      console.log('abort', abort)
      return
    }
    if (res.statusCode !== 304) {
      console.log('[FETCHED] tasks lists')
      this.etags.task_lists = res.headers.etag
      this.task_lists = list.items
    } else {
      console.log('[CACHED] tasks lists')
    }
    return this.state.add('TaskListsFetched')
  }

  initTaskListsSync() {
    for (let [name, data] of Object.entries(this.config.tasks.queries)) {
      if (name === 'labels_defaults') continue
      let task_list = new TaskListSync(name, data as IGTasksList, this)
      // this.states.pipe(
      //   'TaskListSyncEnabled',
      //   task_list.states,
      //   'Enabled',
      //   PipeFlags.LOCAL_QUEUE
      // )
      this.auth.pipe('Ready', task_list.states, 'Authenticated')
      task_list.states.pipe('Synced', this.states, 'TaskListsSynced')
      task_list.states.pipe('Syncing', this.states, 'SyncingTaskLists')
      // TODO handle error of non existing task list in the inner classes
      //			task_list.states.on 'Restart.enter', => @states.drop 'TaskListsFetched'
      this.task_lists_sync.push(task_list)
    }
  }
}
