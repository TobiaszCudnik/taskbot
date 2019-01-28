import { Gmail, Tasks } from '../test/mocks/mocks'

declare namespace NodeJS {
  export interface Global {
    am_logger: any
    am_network: any
    GOOGLEAPIS_MOCK: any
    GMAIL_MOCK: Gmail
    TASKS_MOCK: Tasks
  }
}
