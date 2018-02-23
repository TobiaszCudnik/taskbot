import { DBRecord } from './sync/root'

// export interface ILabelDefaults {
//   email_unmatched?: string[]
//   labels_new_task?: string[]
//   task_completed?: {
//     add?: string[]
//     remove?: string[]
//   }
// }

export interface ILabelFilter {
  name: string
  db_query: (r: DBRecord) => boolean
  add?: string[]
  remove?: string[]
}

export interface IListConfig {
  name: string
  gmail_query: string
  db_query: (record: DBRecord) => boolean
  enter: {
    add?: string[]
    remove?: string[]
  }
  exit: {
    add?: string[]
    remove?: string[]
  }
  // seconds
  sync_frequency?: number
}

export type IConfig = {
  debug: boolean
  google: {
    scopes: string[]
  }
  client_id?: string
  client_secret?: string
  access_token?: string
  refresh_token?: string
  gmail_username?: string
  gmail_password?: string
  gmail_host: string
  // TODO
  gmail_max_results: number
  gtasks: {
    request_quota_100: number
    request_quota_day: number
    quota_exceeded_delay: number
    // seconds
    sync_frequency: number
  }
  // redirect_url: string
  labels: {
    symbol: string
    shortcut?: string
    name?: string
    prefix?: string
    colors?: { bg: string; fg: string }
  }[]
  label_filters: ILabelFilter[]
  sync_frequency: number
  lists: IListConfig[]
  // TODO this could be dynamic?
  status_map: { [shortcut: string]: string }
  // lists_labels_in_title: LabelsInTitles
  // lists_defaults: ILabelDefaults,
}

export type TRawEmail = string
