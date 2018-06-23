import { Semaphore } from 'await-semaphore'
import * as http from 'http'
import { promisifyArray } from 'typed-promisify-tob/index'
import * as google from 'googleapis'
import { IConfig, TConfigGoogleUserAuth } from '../types'
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

  apis: {
    gtasks?: google.tasks.v1.Tasks
    gmail?: google.gmail.v1.Gmail
  } = {}

  constructor(public logger: Logger) {
    this.initLoggers()
    this.restartNetwork()
  }

  restartNetwork() {
    // TODO dispose existing resources
    for (const username of Object.keys(this.semaphore_user)) {
      this.initUser(username)
    }
    this.semaphore_global = new Semaphore(
      this.config_max_active_requests_global
    )
    this.initGTasksAPI()
    this.initGmailAPI()
  }

  initUser(username: string) {
    this.semaphore_user[username] = new Semaphore(
      this.config_max_active_requests_user
    )
  }

  addUser(username: string) {
    this.initUser(username)
    this.active_requests_user[username] = 0
    this.executed_requests_user[username] = 0
    this.pending_requests_user[username] = 0
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
    user: TConfigGoogleUserAuth,
    method_name: string,
    method: (arg: A, cb: (err: any, res: T, res2: T2) => void) => void,
    params: A,
    abort: (() => boolean) | null | undefined,
    returnArray: true,
    options?: object
  ): Promise<[T, T2] | null>
  async req<A, T>(
    user: TConfigGoogleUserAuth,
    method_name: string,
    method: (arg: A, cb: (err: any, res: T) => void) => void,
    params: A,
    abort: (() => boolean) | null | undefined,
    returnArray: false,
    options?: object
  ): Promise<T | null>
  async req<A, T>(
    user: TConfigGoogleUserAuth,
    method_name: string,
    method: (arg: A, cb: (err: any, res: T) => void) => void,
    params: A,
    abort: (() => boolean) | null | undefined,
    return_array: boolean,
    options?: object
  ): Promise<any> {
    const prefix = `[${user.username}] `
    this.pending_requests_global++
    this.pending_requests_user[user.username]++
    const release_user = await this.semaphore_user[user.username].acquire()
    const release_global = await this.semaphore_global.acquire()
    this.pending_requests_global--
    this.pending_requests_user[user.username]--
    if (abort && abort()) {
      this.log_error(
        `${prefix} Request '${method_name}' aborted by the abort() function`
      )
      release_global()
      release_user()
      return return_array ? [null, null] : null
    }
    this.active_requests_global++
    this.active_requests_user[user.username]++

    let params_log = null
    if (!params) {
      params = {} as A
    } else {
      // @ts-ignore
      params_log = { method_name, ...params }
      delete params_log.auth
      if (params_log.headers) {
        params_log.headers = { ...params_log.headers }
        delete params_log.headers['Authorization']
      }
    }
    this.log_verbose(
      `${prefix} REQUEST '${method_name}' (${
        this.active_requests_global
      } active):\n%O`,
      params_log
    )
    // TODO googleapis specific code should be in google/sync.ts
    let ret
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
    } catch (e) {
      // attach the request body
      e.params = params_log
      throw e
    } finally {
      release_global()
      release_user()
      this.active_requests_global--
      this.active_requests_user[user.username]--
      this.executed_requests_global++
      this.executed_requests_user[user.username]++
    }
    this.log_verbose(
      `${prefix} request finished (${this.pending_requests_global} pending)`
    )

    return return_array ? ret : ret[0]
  }

  // TODO implement LoggerMixin
  initLoggers() {
    let name = 'connections'

    this.log = this.logger.createLogger(name)
    this.log_verbose = this.logger.createLogger(name, 'verbose')
    this.log_error = this.logger.createLogger(name, 'error')
  }
}
