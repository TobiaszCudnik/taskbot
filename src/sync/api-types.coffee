typedef = require 'tracery'
opt = typedef.Optional

ITaskList = typedef
  id: String
  kind: String
  title: String
  selfLink: String
  updated: String

ITaskLists = typedef [ITaskList]

IQuery = typedef
  query: String
  labels_new_task: opt [String]
  task_completed: opt typedef
    add: opt [String]
    remove: opt [String]

IMessagePart = typedef
  headers: [typedef
    name: String
    value: String
  ]

IMessage = typedef
  id: String
  labelIds: [String]
  historyId: opt String
  # TODO fix
#  payload: opt IMessagePart
  raw: opt String
  sizeEstimate: opt Number
  snippet: opt String
  threadId: opt String

IThread = typedef
  id: String
  historyId: opt String
	messages: (opt [IMessage])
  snippet: opt String

IThreads = typedef
  nextPageToken: opt String
  resultSizeEstimate: opt Number
  threads: [IThread]

ITask = typedef
  id: String
  etag: String
  title: String
  status: String
  kind: opt String
  position: opt String
  selfLink: opt String
  updated: opt String
  # optional
  completed: opt String
  deleted: opt Boolean
  due: opt String
  hidden: opt Boolean
  links: opt typedef.Collection
    type: String
    link: String
    description: opt String
  notes: opt String
  parent: opt String

ITasks = typedef
  etag: String
  items: opt [ITask]
  kind: opt String
  nextPageToken: opt String

ILabel = typedef
  id: String
  labelListVisibility: String
  messageListVisibility: String
  messagesTotal: Number
  messagesUnread: Number
  name: String
  threadsTotal: Number
  threadsUnread: Number
  type: String

module.exports = {
  ITaskList
  ITaskLists
  IQuery
  IThread
  IThreads
  ITask
  ITasks
  IMessage
  IMessagePart
  ILabel
}