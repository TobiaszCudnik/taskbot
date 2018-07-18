import { Semaphore } from 'await-semaphore'
import * as http from 'http'
import { promisifyArray } from 'typed-promisify-tob/index'
import * as google from 'googleapis'
import GC from '../sync/gc'
import { log_fn, default as Logger } from './logger'

/**
 * TODO logger mixin
 * TODO global auth?
 * TODO support for non-google APIs
 * - quotas
 * - semaphores
 */
export default class Connections {
  // connections = []
  semaphore_global: Semaphore
  semaphore_user: { [username: string]: Semaphore } = {}
  pending_requests_global = 0
  pending_requests_user: { [username: string]: number } = {}
  active_requests_global = 0
  active_requests_user: { [username: string]: number } = {}
  executed_requests_global = 0
  executed_requests_user: { [username: string]: number } = {}
  // TODO config
  config_max_active_requests_user = 5
  config_max_active_requests_global = 5
  // TODO implement LoggerMixin
  log: log_fn
  log_error: log_fn
  log_verbose: log_fn
  log_stats: log_fn

  apis: {
    gtasks: google.tasks.v1.Tasks | null
    gmail: google.gmail.v1.Gmail | null
  } = {
    gtasks: null,
    gmail: null
  }

  // Request log used to calculate the quota (API wide)
  // TODO extract TimeArray
  requests: { gtasks: number[] } = { gtasks: [] }
  requests_gc = new GC('gtasks', this.requests.gtasks)

  constructor(public logger: Logger) {
    this.initLoggers()
    this.restartNetwork()
  }

  restartNetwork() {
    // TODO dispose existing resources
    for (const user_id of Object.keys(this.semaphore_user)) {
      this.initUser(Number(user_id))
    }
    this.semaphore_global = new Semaphore(
      this.config_max_active_requests_global
    )
    // re-init APIs
    this.initGTasksAPI()
    this.initGmailAPI()
    // re-init reqs stats
    this.active_requests_global = 0
    this.pending_requests_global = 0
  }

  initUser(user_id: number) {
    this.semaphore_user[user_id] = new Semaphore(
      this.config_max_active_requests_user
    )
  }

  addUser(user_id: number) {
    this.initUser(user_id)
    this.active_requests_user[user_id] = 0
    this.executed_requests_user[user_id] = 0
    this.pending_requests_user[user_id] = 0
  }

  initGTasksAPI() {
    this.log('Init GTasks API')
    if (this.apis.gtasks) {
      // TODO dispose
    }
    this.apis.gtasks = google.tasks('v1')
  }

  initGmailAPI() {
    this.log('Init GMail API')
    if (this.apis.gmail) {
      // TODO dispose
    }
    this.apis.gmail = google.gmail('v1')
  }

  // TODO take abort() as the second param
  async req<A, T, T2>(
    username: number,
    method_name: string,
    method: (arg: A, cb: (err: any, res: T, res2: T2) => void) => void,
    params: A,
    abort: (() => boolean) | null | undefined,
    returnArray: true,
    options?: object,
    retries?: number
  ): Promise<[T, T2] | null>
  async req<A, T>(
    username: number,
    method_name: string,
    method: (arg: A, cb: (err: any, res: T) => void) => void,
    params: A,
    abort: (() => boolean) | null | undefined,
    returnArray: false,
    options?: object,
    retries?: number
  ): Promise<T | null>
  async req<A, T>(
    user_id: number,
    method_name: string,
    method: (arg: A, cb: (err: any, res: T) => void) => void,
    params: A,
    abort: (() => boolean) | null | undefined,
    return_array: boolean,
    options?: object,
    retries = 3
  ): Promise<any> {
    let ret
    // prepare a version of params for logging
    let params_log = null
    if (!params) {
      params = {} as A
    }
    // @ts-ignore
    params_log = { method_name, ...params }
    delete params_log.auth
    if (params_log.headers) {
      params_log.headers = { ...params_log.headers }
      delete params_log.headers['Authorization']
    }
    params_log.user_id = user_id
    // called if the call gets aborted
    const aborted = (release_user, release_global?) => {
      this.log_error(
        `${method_name} aborted by the abort() function`,
        params_log,
        this.getReqsStats()
      )
      // release semaphores
      release_user()
      if (release_global) release_global()
      // dec the stats
      this.pending_requests_global--
      this.pending_requests_user[user_id]--

      return return_array ? [null, null] : null
    }
    // run the query with retries
    for (let try_n = 1; try_n <= retries; try_n++) {
      // TODO keep username as a part of json (logger API)
      this.pending_requests_global++
      this.pending_requests_user[user_id]++
      const release_user = await this.semaphore_user[user_id].acquire()
      if (abort && abort()) {
        return aborted(release_user)
      }
      const release_global = await this.semaphore_global.acquire()
      if (abort && abort()) {
        return aborted(release_user, release_global)
      }
      // stats
      this.pending_requests_global--
      this.pending_requests_user[user_id]--
      this.active_requests_global++
      this.active_requests_user[user_id]++
      params_log.try = try_n
      // log everything we know
      this.log_verbose(`${method_name} (${try_n}):\n%O`, params_log)
      this.log_stats('Stats:\n%O', this.getReqsStats())
      // TODO googleapis specific code should be in google/sync.ts
      try {
        // @ts-ignore
        ret = await promisifyArray(method)(params, options)
        const res: http.IncomingMessage = ret[1]
        const was2xx = res && res.statusCode.toString().match(/^2/)
        const wasNoContent = res && res.statusMessage == 'No Content'
        if (was2xx && ret[0] === undefined && !wasNoContent) {
          throw Error('Empty response on 2xx')
        } else if (ret[1] === undefined && ret[0] === undefined) {
          throw Error('Response and body empty')
        }
        // stop redoing
        break
      } catch (e) {
        // retry on backend errors only
        if (try_n == retries || !e.code || e.code.toString()[0] != '5') {
          // attach the request body
          e.params = params_log
          throw e
        }
      } finally {
        release_global()
        release_user()
        this.active_requests_global--
        this.active_requests_user[user_id]--
        this.executed_requests_global++
        this.executed_requests_user[user_id]++
      }
      this.log_verbose(`${method_name} request finished`)
    }
    return return_array ? ret : ret[0]
  }

  getReqsStats() {
    return {
      active_requests_global: this.active_requests_global,
      active_requests_user: this.active_requests_user,
      executed_requests_global: this.executed_requests_global,
      executed_requests_user: this.executed_requests_user
    }
  }

  // TODO implement LoggerMixin
  initLoggers() {
    let name = 'connections'

    this.log = this.logger.createLogger(name)
    this.log_verbose = this.logger.createLogger(name, 'verbose')
    this.log_error = this.logger.createLogger(name, 'error')
    this.log_stats = this.logger.createLogger(name + '-stats')
  }
}
