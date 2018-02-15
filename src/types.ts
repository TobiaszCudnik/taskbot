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
  name: string,
  db_query: (r: DBRecord) => boolean
  add: string[]
  remove: string[]
}

export interface IListConfig {
  name: string
  gmail_query: string
  db_query: (record: DBRecord) => boolean
  enter: {
    add: string[]
    remove: string[]
  }
  exit: {
    add: string[]
    remove: string[]
  }
}

export type IConfig = {
  debug: boolean
  google: {
    scopes: string[]
  }
  client_id: string
  client_secret: string
  access_token: string
  refresh_token: string
  gmail_username: string
  gmail_password: string
  gmail_host: string
  redirect_url: string
  text_labels: {
    symbol: string
    shortcut?: string
    label?: string
    prefix?: string
    create?: boolean
  }[]
  label_filters: ILabelFilter[]
  status_labels: string[]
  sync_frequency: number
  lists: IListConfig[]
  // TODO this could be dynamic?
  status_map: { [shortcut: string]: string }
  // lists_labels_in_title: LabelsInTitles
  // lists_defaults: ILabelDefaults,
}

// TODO
export enum LabelsInTitles {
  A,
  B,
  C
}

export type TRawEmail = string
