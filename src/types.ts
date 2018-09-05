import { DBRecord } from './sync/root'
import { Credentials as GoogleCredentials } from 'google-auth-library/build/src/auth/credentials'

export type TModifyLabels = {
  add?: string[]
  remove?: string[]
}

export interface ILabelFilter {
  name: string
  db_query(r: DBRecord): boolean
  modify?(r: DBRecord): TModifyLabels
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
    gtasks_multi?: number
    gmail_multi?: number
  }
}

export type ILabelDefinition = ILabelDefinitionBase &
  (
    | ILabelDefinition1
    | ILabelDefinition2
    | ILabelDefinition3
    | ILabelDefinition4)

export interface ILabelDefinitionBase {
  colors?: { bg: string; fg: string }
  // hide in the menu
  hide_menu?: boolean
  // hide in the tread view
  hide_list?: boolean
  alias?: string[]
}

export interface ILabelDefinition1 {
  symbol: string
  shortcut: string
  name: string
  prefix: string
}

export interface ILabelDefinition2 {
  name: string
  prefix: string
  // ignore errors on those
  symbol?: string
  shortcut?: string
}

export interface ILabelDefinition3 {
  symbol: string
  prefix: string
  // ignore errors on those
  name?: string
  shortcut?: string
}

export interface ILabelDefinition4 {
  prefix: ''
  name: string
}

export interface IConfig extends IConfigPublic, IConfigPrivate, IConfigAccount {
  google: IConfigPublicGoogle & IConfigAccountGoogle & IConfigPrivateGoogle
}

export interface IConfigPublic {
  sync_frequency_multi?: number
  repl_port: number
  google: IConfigPublicGoogle
  gmail: {
    // TODO
    max_results: number
    included_labels: RegExp[]
    domain: string
    orphans_freq_min: number
    request_quota_100_user: number
    request_quota_100: number
    request_quota_day: number
    // seconds
    sync_frequency?: number
  }
  exception_delay: number
  exception_flood_delay: number
  gtasks: {
    request_quota_100_user: number
    request_quota_day: number
    quota_exceeded_delay: number
    // seconds
    sync_frequency: number
  }
  labels: ILabelDefinition[]
  label_filters: ILabelFilter[]
  sync_frequency: number
  lists: (IListConfig | ((config: IConfig) => IListConfig))[]
  www?: IConfigWWW
}

export interface IConfigWWW {
  google: {
    client_id: string
    scope: string
  }
  firebase: {
    url: string
    credentials: object
  }
}

export interface IConfigPrivate {
  // extract to the account type
  sync_frequency_multi?: number
  service: {
    email: string
    name: string
    bypass_code: string
    // TODO type
    google_tokens: object
  }
  google: IConfigPrivateGoogle
  firebase: {
    url: string
    // TODO type
    admin: any
  }
}

export interface IConfigPrivateGoogle {
  // app
  client_id: string
  client_secret: string
  redirect_url: string
}

export interface IConfigAccountGoogle extends GoogleCredentials {
  username: string
  // optional for non-authorized accounts
  access_token?: string
}

export interface IConfigAccount {
  user: {
    id: string,
    uid: string
  }
  google: IConfigAccountGoogle
}

export interface IAccount {
  uid: string,
  email: string
  registered: string
  invitation_code?: string
  client_data: {
    sync_enabled: boolean
    sync_gtasks?: boolean
  }
  // TODO last_sync: {gmail: string, gtasks: string}
  // TODO last_sync_client_ping: string
  sync_enabled: boolean
  dev: boolean
  config: IConfigAccount
  welcome_email_sent: boolean
  invitation_granted: boolean
  ip: string
}

export interface IConfigPublicGoogle {
  scopes: string[]
}

export type TRawEmail = string
