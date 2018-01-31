export interface ILabelDefaults {
  email_unmatched?: string[],
  labels_new_task?: string[],
  task_completed?: {
    add?: string[],
    remove?: string[]
  }
}

export interface IGmailQuery {
  query: string,
  add: string[],
  remove?: string[]
}

export interface IGTasksList {
  labels_in_title: LabelsInTitles,
  query: string,
  name: string,
  labels_new_task?: string[]
}

export type IConfig = {
  debug: boolean,
  google: {
      scopes: string[]
  },
  client_id: string,
  client_secret: string,
  access_token: string,
  refresh_token: string,
  gmail_username: string,
  gmail_password: string,
  gmail_host: string,
  redirect_url: string,
  text_labels: {
      symbol: string,
      shortcut?: string,
      label?: string,
      prefix?: string,
      create?: boolean
  }[],
  status_labels: string[],
  sync_frequency: number,
  gmail_queries: IGmailQuery[],
  // TODO this could be dynamic?
  status_map: { [shortcut: string]: string },
  lists_labels_in_title: LabelsInTitles
  lists_defaults: ILabelDefaults,
  gtasks: IGTasksList[],
}

// TODO
export enum LabelsInTitles {
    A,
    B,
    C
}

export type TRawEmail = string;
