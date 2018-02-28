import { DBRecord } from './sync/root'

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

export type ILabelDefinition =
  | ILabelDefinition1
  | ILabelDefinition2
  | ILabelDefinition3

export interface ILabelDefinition1 {
  symbol: string
  shortcut: string
  name: string
  prefix: string
  colors?: { bg: string; fg: string }
}

export interface ILabelDefinition2 {
  name: string
  prefix: string
  colors?: { bg: string; fg: string }
}

export interface ILabelDefinition3 {
  symbol: string
  prefix: string
  colors?: { bg: string; fg: string }
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
  exception_delay: number
  gtasks: {
    request_quota_100: number
    request_quota_day: number
    quota_exceeded_delay: number
    // seconds
    sync_frequency: number
  }
  // redirect_url: string
  labels: ILabelDefinition[]
  label_filters: ILabelFilter[]
  sync_frequency: number
  lists: IListConfig[]
  // TODO this could be dynamic?
  status_map: { [shortcut: string]: string }
  // lists_labels_in_title: LabelsInTitles
  // lists_defaults: ILabelDefaults,
}

export type TRawEmail = string
