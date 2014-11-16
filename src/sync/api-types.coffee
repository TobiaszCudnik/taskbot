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
  headers: typedef.Collection
    name: String
    value: String

IMessage = typedef
  historyId: String
  id: String
  labelIds: [String]
  payload: opt IMessagePart
  raw: String
  sizeEstimate: Number
  snippet: String
  threadId: String

IThread = typedef
  historyId: String
  id: String
	messages: opt [IMessage]
  snippet: String

IThreads = typedef
  nextPageToken: opt String
  resultSizeEstimate: Number
  threads: [IThread]

ITask = typedef
  id: String
  kind: String
  etag: String
  position: String
  selfLink: String
  status: String
  title: String
  updated: String
  # optional
  completed: opt String
  deleted: opt Boolean
  due: opt String
  hidden: opt Boolean
  links: opt typedef.Collection
    description: String
    link: String
    type: String
  notes: opt String
  parent: opt String

ITasks = typedef
  etag: String
  items: opt [ITask]
  kind: String
  nextPageToken: opt String

module.exports = {
  ITaskList
  ITaskLists
  IQuery
  IThread
  IThreads
  ITask
  ITasks
  IMessage
}