// Type definitions for Google APIs Node.js Client
// Project: https://github.com/google/google-api-nodejs-client
// Definitions by: Robby Cornelissen <https://github.com/procrastinatos/>
// Definitions: https://github.com/procrastinatos/google-api-node-tsd

/// <reference types="node" />

declare module 'googleapis' {
  var google: GoogleApis

  import * as http from 'http'

  interface GoogleApis {
    new (options?: any): GoogleApis
    tasks(version: string): any
    tasks(version: 'v1'): google.tasks.v1.Tasks
    gmail(version: string): any
    gmail(version: 'v1'): google.gmail.v1.Gmail

    options(options?: any): void
  }

  interface Request {}

  interface Callback {
    (error: any, body: any, response: http.IncomingMessage): void
  }

  export = google

  // TODO type response as IncomingMessage
  // TOTO type request

  namespace google {
    namespace gmail {
      namespace v1 {
        export interface Gmail {
          new (options: any): Gmail

          users: {
            getProfile: (
              parameters: { userId: string; fields?: string },
              callback: (
                error: any,
                body: Profile,
                response: http.IncomingMessage
              ) => void
            ) => Request
            stop: (
              parameters: { userId: string; fields?: string },
              callback: (
                error: any,
                body: any,
                response: http.IncomingMessage
              ) => void
            ) => Request
            watch: (
              parameters: { userId: string; fields?: string },
              callback: (
                error: any,
                body: WatchResponse,
                response: http.IncomingMessage
              ) => void
            ) => Request

            drafts: {
              create: (
                parameters: { userId: string; fields?: string },
                callback: (
                  error: any,
                  body: Draft,
                  response: http.IncomingMessage
                ) => void
              ) => Request
              delete: (
                parameters: { id: string; userId: string; fields?: string },
                callback: (
                  error: any,
                  body: any,
                  response: http.IncomingMessage
                ) => void
              ) => Request
              get: (
                parameters: {
                  format?: string
                  id: string
                  userId: string
                  fields?: string
                },
                callback: (
                  error: any,
                  body: Draft,
                  response: http.IncomingMessage
                ) => void
              ) => Request
              list: (
                parameters: {
                  maxResults?: number
                  pageToken?: string
                  userId: string
                  fields?: string
                },
                callback: (
                  error: any,
                  body: ListDraftsResponse,
                  response: http.IncomingMessage
                ) => void
              ) => Request
              send: (
                parameters: { userId: string; fields?: string },
                callback: (
                  error: any,
                  body: Message,
                  response: http.IncomingMessage
                ) => void
              ) => Request
              update: (
                parameters: { id: string; userId: string; fields?: string },
                callback: (
                  error: any,
                  body: Draft,
                  response: http.IncomingMessage
                ) => void
              ) => Request
            }
            history: {
              list: (
                parameters: {
                  labelId?: string
                  maxResults?: number
                  pageToken?: string
                  startHistoryId?: string
                  userId: string
                  fields?: string
                },
                callback: (
                  error: any,
                  body: ListHistoryResponse,
                  response: http.IncomingMessage
                ) => void
              ) => Request
            }
            labels: {
              create: (
                parameters: {
                  userId: string
                  fields?: string
                  resource: Label
                },
                callback: (
                  error: any,
                  body: Label,
                  response: http.IncomingMessage
                ) => void
              ) => Request
              delete: (
                parameters: { id: string; userId: string; fields?: string },
                callback: (
                  error: any,
                  body: any,
                  response: http.IncomingMessage
                ) => void
              ) => Request
              get: (
                parameters: { id: string; userId: string; fields?: string },
                callback: (
                  error: any,
                  body: Label,
                  response: http.IncomingMessage
                ) => void
              ) => Request
              list: (
                parameters: { userId: string; fields?: string },
                callback: (
                  error: any,
                  body: ListLabelsResponse,
                  response: http.IncomingMessage
                ) => void
              ) => Request
              patch: (
                parameters: {
                  id: string
                  userId: string
                  fields?: string
                  resource: Partial<Label>
                },
                callback: (
                  error: any,
                  body: Label,
                  response: http.IncomingMessage
                ) => void
              ) => Request
              update: (
                parameters: { id: string; userId: string; fields?: string },
                callback: (
                  error: any,
                  body: Label,
                  response: http.IncomingMessage
                ) => void
              ) => Request
            }
            messages: {
              delete: (
                parameters: { id: string; userId: string; fields?: string },
                callback: (
                  error: any,
                  body: any,
                  response: http.IncomingMessage
                ) => void
              ) => Request
              get: (
                parameters: {
                  format?: string
                  id: string
                  metadataHeaders?: string
                  userId: string
                  fields?: string
                },
                callback: (
                  error: any,
                  body: Message,
                  response: http.IncomingMessage
                ) => void
              ) => Request
              import: (
                parameters: {
                  deleted?: boolean
                  internalDateSource?: string
                  neverMarkSpam?: boolean
                  processForCalendar?: boolean
                  userId: string
                  fields?: string
                },
                callback: (
                  error: any,
                  body: Message,
                  response: http.IncomingMessage
                ) => void
              ) => Request
              insert: (
                parameters: {
                  deleted?: boolean
                  internalDateSource?: string
                  userId: string
                  fields?: string
                  resource: {
                    raw: string
                    labelIds?: string[]
                    threadId?: string
                  }
                },
                callback: (
                  error: any,
                  body: Message,
                  response: http.IncomingMessage
                ) => void
              ) => Request
              list: (
                parameters: {
                  includeSpamTrash?: boolean
                  labelIds?: string
                  maxResults?: number
                  pageToken?: string
                  q?: string
                  userId: string
                  fields?: string
                },
                callback: (
                  error: any,
                  body: ListMessagesResponse,
                  response: http.IncomingMessage
                ) => void
              ) => Request
              modify: (
                parameters: { id: string; userId: string; fields?: string },
                callback: (
                  error: any,
                  body: Message,
                  response: http.IncomingMessage
                ) => void
              ) => Request
              send: (
                parameters: { userId: string; fields?: string },
                callback: (
                  error: any,
                  body: Message,
                  response: http.IncomingMessage
                ) => void
              ) => Request
              trash: (
                parameters: { id: string; userId: string; fields?: string },
                callback: (
                  error: any,
                  body: Message,
                  response: http.IncomingMessage
                ) => void
              ) => Request
              untrash: (
                parameters: { id: string; userId: string; fields?: string },
                callback: (
                  error: any,
                  body: Message,
                  response: http.IncomingMessage
                ) => void
              ) => Request

              attachments: {
                get: (
                  parameters: {
                    id: string
                    messageId: string
                    userId: string
                    fields?: string
                  },
                  callback: (
                    error: any,
                    body: MessagePartBody,
                    response: http.IncomingMessage
                  ) => void
                ) => Request
              }
            }
            threads: {
              delete: (
                parameters: { id: string; userId: string; fields?: string },
                callback: (
                  error: any,
                  body: any,
                  response: http.IncomingMessage
                ) => void
              ) => Request
              get: (
                parameters: {
                  format?: string
                  id: string
                  metadataHeaders?: string | string[]
                  userId: string
                  fields?: string
                },
                callback: (
                  error: any,
                  body: Thread,
                  response: http.IncomingMessage
                ) => void
              ) => Request
              list: (
                parameters: {
                  includeSpamTrash?: boolean
                  labelIds?: string | undefined
                  maxResults?: number
                  pageToken?: string
                  q?: string
                  userId: string
                  fields?: string
                },
                callback: (
                  error: any,
                  body: ListThreadsResponse,
                  response: http.IncomingMessage
                ) => void
              ) => Request
              modify: (
                parameters: {
                  id: string
                  userId: string
                  fields?: string
                  resource: {
                    addLabelIds: string[]
                    removeLabelIds: string[]
                  }
                },
                callback: (
                  error: any,
                  body: Thread,
                  response: http.IncomingMessage
                ) => void
              ) => Request
              trash: (
                parameters: { id: string; userId: string; fields?: string },
                callback: (
                  error: any,
                  body: Thread,
                  response: http.IncomingMessage
                ) => void
              ) => Request
              untrash: (
                parameters: { id: string; userId: string; fields?: string },
                callback: (
                  error: any,
                  body: Thread,
                  response: http.IncomingMessage
                ) => void
              ) => Request
            }
          }
        }

        export interface Draft {
          id: string
          message: Message
        }

        export interface History {
          id: string
          labelsAdded: HistoryLabelAdded[]
          labelsRemoved: HistoryLabelRemoved[]
          messages: Message[]
          messagesAdded: HistoryMessageAdded[]
          messagesDeleted: HistoryMessageDeleted[]
        }

        export interface HistoryLabelAdded {
          labelIds: string[]
          message: Message
        }

        export interface HistoryLabelRemoved {
          labelIds: string[]
          message: Message
        }

        export interface HistoryMessageAdded {
          message: Message
        }

        export interface HistoryMessageDeleted {
          message: Message
        }

        export interface Label {
          id: string
          labelListVisibility: string
          messageListVisibility: string
          messagesTotal: number
          messagesUnread: number
          name: string
          color: {
            textColor: string
            backgroundColor: string
          }
          threadsTotal: number
          threadsUnread: number
          type: string
        }

        export interface ListDraftsResponse {
          drafts: Draft[]
          nextPageToken: string
          resultSizeEstimate: number
        }

        export interface ListHistoryResponse {
          history: History[]
          historyId: string
          nextPageToken: string
        }

        export interface ListLabelsResponse {
          labels: Label[]
        }

        export interface ListMessagesResponse {
          messages: Message[]
          nextPageToken: string
          resultSizeEstimate: number
        }

        export interface ListThreadsResponse {
          nextPageToken?: string
          resultSizeEstimate: number
          threads?: Thread[]
        }

        export interface Message {
          historyId: string
          id: string
          internalDate: string
          labelIds: string[]
          payload: MessagePart
          raw: string
          sizeEstimate: number
          snippet: string
          threadId: string
        }

        export interface MessagePart {
          body: MessagePartBody
          filename: string
          headers: MessagePartHeader[]
          mimeType: string
          partId: string
          parts: MessagePart[]
        }

        export interface MessagePartBody {
          attachmentId: string
          data: string
          size: number
        }

        export interface MessagePartHeader {
          name: string
          value: string
        }

        export interface ModifyMessageRequest {
          addLabelIds: string[]
          removeLabelIds: string[]
        }

        export interface ModifyThreadRequest {
          addLabelIds: string[]
          removeLabelIds: string[]
        }

        export interface Profile {
          emailAddress: string
          historyId: string
          messagesTotal: number
          threadsTotal: number
        }

        export interface Thread {
          historyId: string
          id: string
          messages: Message[]
          snippet: string
        }

        export interface WatchRequest {
          labelFilterAction: string
          labelIds: string[]
          topicName: string
        }

        export interface WatchResponse {
          expiration: string
          historyId: string
        }
      }
    }

    namespace tasks {
      namespace v1 {
        export interface Tasks {
          new (options: any): Tasks

          tasklists: {
            delete: (
              parameters: { tasklist: string; fields?: string },
              callback: (
                error: any,
                body: any,
                response: http.IncomingMessage
              ) => void
            ) => Request
            get: (
              parameters: { tasklist: string; fields?: string },
              callback: (
                error: any,
                body: TaskList,
                response: http.IncomingMessage
              ) => void
            ) => Request
            insert: (
              parameters: any,
              callback: (
                error: any,
                body: TaskList,
                response: http.IncomingMessage
              ) => void
            ) => Request
            list: (
              parameters: {
                maxResults?: string
                pageToken?: string
                fields?: string
                etag?: string
              },
              callback: (
                error: any,
                body: TaskLists,
                response: http.IncomingMessage
              ) => void
            ) => Request
            patch: (
              parameters: { tasklist: string; fields?: string },
              callback: (
                error: any,
                body: TaskList,
                response: http.IncomingMessage
              ) => void
            ) => Request
            update: (
              parameters: { tasklist: string; fields?: string },
              callback: (
                error: any,
                body: TaskList,
                response: http.IncomingMessage
              ) => void
            ) => Request
          }
          tasks: {
            clear: (
              parameters: { tasklist: string; fields?: string },
              callback: (
                error: any,
                body: any,
                response: http.IncomingMessage
              ) => void
            ) => Request
            delete: (
              parameters: { task: string; tasklist: string; fields?: string },
              callback: (
                error: any,
                body: any,
                response: http.IncomingMessage
              ) => void
            ) => Request
            get: (
              parameters: { task: string; tasklist: string; fields?: string },
              callback: (
                error: any,
                body: Task,
                response: http.IncomingMessage
              ) => void
            ) => Request
            insert: (
              parameters: {
                parent?: string
                previous?: string
                tasklist: string
                fields?: string
                resource: {
                  completed?: string | null
                  deleted?: boolean
                  due?: string
                  etag?: string
                  hidden?: boolean
                  id?: string
                  kind?: string
                  links?: {
                    description: string
                    link: string
                    type: string
                  }[]
                  notes?: string
                  parent?: string
                  position?: string
                  selfLink?: string
                  status?: string
                  title?: string
                  updated?: string
                }
              },
              callback: (
                error: any,
                body: Task,
                response: http.IncomingMessage
              ) => void
            ) => Request
            list: (
              parameters: {
                completedMax?: string
                completedMin?: string
                dueMax?: string
                dueMin?: string
                maxResults?: string
                pageToken?: string
                showCompleted?: boolean
                showDeleted?: boolean
                showHidden?: boolean
                tasklist: string
                updatedMin?: string
                fields?: string
                etag?: string
                headers?: { [header: string]: string }
              },
              callback: (
                error: any,
                body: Tasks,
                response: http.IncomingMessage
              ) => void
            ) => Request
            move: (
              parameters: {
                parent?: string
                previous?: string
                task: string
                tasklist: string
                fields?: string
              },
              callback: (
                error: any,
                body: Task,
                response: http.IncomingMessage
              ) => void
            ) => Request
            patch: (
              parameters: {
                task: string
                tasklist: string
                fields?: string
                resource: Partial<Task>
              },
              callback: (
                error: any,
                body: Task,
                response: http.IncomingMessage
              ) => void
            ) => Request
            update: (
              parameters: { task: string; tasklist: string; fields?: string },
              callback: (
                error: any,
                body: Task,
                response: http.IncomingMessage
              ) => void
            ) => Request
          }
        }

        export interface Task {
          deleted: boolean
          due: string
          etag: string
          hidden: boolean
          id: string
          kind: string
          links: {
            description: string
            link: string
            type: string
          }[]
          notes: string
          parent: string
          position: string
          selfLink: string
          status: 'completed' | 'needsAction'
          title: string
          updated: string
        }

        export interface TaskList {
          etag: string
          id: string
          kind: string
          selfLink: string
          title: string
          updated: string
        }

        export interface TaskLists {
          etag: string
          items: TaskList[]
          kind: string
          nextPageToken: string
        }

        export interface Tasks {
          etag: string
          items: Task[]
          kind: string
          nextPageToken: string
        }
      }
    }
  }
}
