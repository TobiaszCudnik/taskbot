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
  symbol?: undefined
  shortcut?: undefined
}

export interface ILabelDefinition3 {
  symbol: string
  prefix: string
  // ignore errors on those
  name?: undefined
  shortcut?: undefined
}

export interface ILabelDefinition4 {
  prefix: ''
  name: string
  // ignore errors on those
  symbol?: undefined
  shortcut?: undefined
}

export interface IConfigParsed extends IConfig {
  lists: IListConfig[]
}

export interface IConfig extends IConfigPublic, IConfigPrivate, IConfigAccount {
  google: IConfigPublicGoogle & IConfigAccountGoogle & IConfigPrivateGoogle
}

export interface IConfigPublic {
  tls?: {
    key: string,
    cert: string
  },
  http_port: number,
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
    request_quota_100_user_cap: number,
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

export interface IFirebaseConfig {
  apiKey: string
  authDomain: string
  databaseURL: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
}

export interface IConfigWWW {
  firebase: IFirebaseConfig
  firebase_staging?: Partial<IFirebaseConfig>
  firebase_dev?: Partial<IFirebaseConfig>
  ga_tracking_id: string
}

export interface IConfigPrivate {
  // extract to the account type
  sync_frequency_multi?: number
  service: {
    salt: string
    email: string
    name: string
    google_tokens: GoogleCredentials
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
}

export interface IConfigAccount {
  user: {
    id: string
    // duplicated IAccount.uid
    uid: string
  }
  google: IConfigAccountGoogle
}

export interface IAccount {
  // duplicated from config.user.uid
  uid: string
  email: string
  registered: string
  invitation_code?: string
  client_data: {
    sync_enabled: boolean
    sync_gtasks?: boolean
  }
  sync_enabled: boolean
  config: IConfigAccount
  invitation_granted: boolean
  welcome_email_sent: boolean
  invitation_email_sent: boolean
  ip: string
}

export interface IConfigPublicGoogle {
  scopes: string[]
}

export type TRawEmail = string
