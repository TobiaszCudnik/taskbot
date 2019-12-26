# TaskBot.app

Real time GMail to Google Tasks sync and a GTD workflow manager.

## Features

* **~0.1 sec** sync time
* GTD workflows using Gmail labels and GTasks lists
* Automatically managed status labels
* `#hashtags` to labels from subjects and tasks (`S/Action` == `!a`)
* Label types
  * `Status` - `S/Action`, `!a`
  * `Project` - `P/groceries`, `#groceries`
  * `Reference` - `R/document`, `#R-document`
  * `Location` - `L/home`, `#L-home`
  * `Commands` - `!T/Sync GTasks`
* Auto label colors
* Multi user support
* Quota calculation and throttling
* Per-user restarts on exceptions
* AppEngine Flexible deployment

## Usage

1.  `npm i`
1.  Create a [Google API project](https://console.cloud.google.com/iam-admin/) and a `Web Application` OAuth2 client account
1.  Go to [Firebase Console](https://console.firebase.google.com/u/0/) and enable it for the project restricting all the access and get the admin config
1.  Rename `config-private-template.ts` to `config-private.ts`
1.  Fill in the OAuth2 account credentials under `google`, including the callback URL
1.  Fill in the Firebase admin config under `firebase_admin`
1.  `make build`
1.  `make start` (or `make start-prod`)
1.  Go to [localhost:8080/signup](http://localhost:8080/signup) and authorize the app
1.  Follow the [How to use](#how-to-use) steps (optional)
1.  GTasks are being pulled rarely, to trigger a pull add `!T/Sync GTasks` to **any** email
1.  Use your fav GTasks client on mobile and [tasks canvas](https://mail.google.com/tasks/canvas) on the web

## Roadmap

* Sharable lists
* Dedicated PWA
* Syncing with Todoist
* Syncing with Remember The Milk
* Syncing with Google Spreadsheets
* Syncing with Google Calendar
* Even faster syncing
* [and more...](https://github.com/TobiaszCudnik/gtd-bot/blob/master/TODO.md)

## How to use

Although GTD Bot configures automatically as much as possible, there's still a couple of optional, but useful steps:

1.  Auto hide sidebar (top left hamburger menu)
1.  Enable keyboard shortcuts in GMail
1.  Setup Multi Inbox

Enable Multi Inbox:

1.  Settings
1.  "Advanced" Tab
1.  Enable "Multiple Inboxes"
1.  "Multiple Inboxes" Tab
1.  Set "Below the inbox"

Configs for Multi Inbox Panes:

* Next
  * Query: `(label:!s-next-action -label:s-finished -label:!s-expired -label:!s-pending) OR (label:!s-pending AND label:unread)`
* Actions
  * Query: `label:!s-action -label:!s-next-action -label:!s-finished -label:!s-expired`
* Pending
  * Query: `( label:drafts OR label:!s-pending ) -label:!s-expired`
* GTD
  * Query: `label:!s`
* Sent
  * Query: `label:sent -label:chats`
