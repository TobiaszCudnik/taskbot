import * as sinon from 'sinon'
import { google, gmail_v1, tasks_v1 } from 'googleapis'
import { TGlobalFields } from '../src/google/sync'

sinon.stub(google, 'gmail', () => new Gmail('test@gmail.com'))

type Thread = gmail_v1.Schema$Thread
type Label = gmail_v1.Schema$Label
type Message = gmail_v1.Schema$Message

class Gmail {
  threads: Thread[]
  labels: Label[]
  messages: Message[]
  historyId: number

  users = new GmailUsers(this)

  constructor(public email: string) {

  }
}

class GmailUsers {
  labels = new GmailUsersLabels(this.gmail)

  constructor(public gmail: Gmail) {}

  async getProfile(
    params: gmail_v1.Params$Resource$Users$Getprofile & TGlobalFields
  ): Promise<gmail_v1.Schema$Profile> {
    return {
      emailAddress: this.gmail.email,
      historyId: String(this.gmail.historyId),
      messagesTotal: this.gmail.messages.length,
      threadsTotal: this.gmail.threads.length
    }
  }
}

class GmailUsersLabels {
  constructor(public gmail: Gmail) {}

  async list(
    params: gmail_v1.Params$Resource$Users$Labels$List & TGlobalFields
  ) {
    return this.gmail.labels
  }
}
