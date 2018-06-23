import { DBRecord } from './sync/root'

export interface ILabelFilter {
  name: string
  db_query(r: DBRecord): boolean
  add?(r: DBRecord): string[]
  remove?(r: DBRecord): string[]
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
  writers?: string[]
  // seconds
  sync_frequency?: {
    gtasks?: number
  }
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
  // ignore errors on those
  symbol?: string
  shortcut?: string
}

export interface ILabelDefinition3 {
  symbol: string
  prefix: string
  colors?: { bg: string; fg: string }
  // ignore errors on those
  name?: string
  shortcut?: string
}

export interface IConfig extends IConfigBase {
  google: IConfigGoogle
}

export interface IConfigBase {
  repl_port: number
  google: IConfigGoogleBase
  gmail: {
    // TODO
    max_results: number
    included_labels: RegExp[]
    domain: string
    orphans_freq_min: number
  }
  exception_delay: number
  exception_flood_delay: number
  gtasks: {
    request_quota_100: number
    request_quota_day: number
    quota_exceeded_delay: number
    // seconds
    sync_frequency: number
  }
  labels: ILabelDefinition[]
  label_filters: ILabelFilter[]
  sync_frequency: number
  lists: IListConfig[]
}

export interface IConfigGoogle
  extends IConfigGoogleBase,
    IConfigGoogleCredentials {}

export type TConfigCredentials = {
  google: IConfigGoogleCredentials
}

export interface IConfigGoogleCredentials {
  client_id: string
  client_secret: string
  redirect_url: string
  users: TConfigGoogleUserAuth[]
}

export interface IConfigGoogleBase {
  scopes: string[]
}

export type TConfigGoogleUserAuth = {
  id: number
  username: string
  access_token: string
  refresh_token: string
  sync_frequency?: number
}

export type TRawEmail = string
