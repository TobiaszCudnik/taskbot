# GTD Bot

Real time Gmail to Google Tasks sync and a GTD workflow manager.

## Features

* **~0.1 sec** sync time
* GTD workflows using Gmail labels and GTasks lists
* Automatically managed status labels
* `#hashtags` to labels from subjects and tasks (`S/Action` == `!a`)
* Label types
  * `Status` - `S/Action`, `!a`
  * `Project` - `P/groceries`, `#groceries`
  * `Reference` - `R/document`, *document
  * `Location` - `L/home`, `^home`
* Auto label colors
* multi user support
* quota calculation and throttling
* per user restarts
* AppEngine Flexible deployment

## Usage

1.  `npm i`
1.  Create a [Google API project](https://console.cloud.google.com/iam-admin/) and a backend service account
1.  Rename `config-credentials-template.ts` to `config-credentials.ts`
1.  Fill it in using the service account credentials
1.  Rename `config-users-template.ts` to `config-users.ts`
1.  Generate a token using `node /dev/tools/oauth/oauth.js`
1.  Paste into `config-users.ts`
1.  `make build`
1.  `make start` (or `make start-prod`)
1.  Enable keyboard shortcuts and multi inbox in Gmail
1.  Use your fav GTasks client on mobile and [tasks canvas](https://mail.google.com/tasks/canvas) on the web

## Roadmap

* Dedicated PWA
* Multi user support with signups
* Syncing with Todoist
* Syncing with Remember The Milk
* Syncing with Google Spreadsheets
* Syncing with Google Calendar
* Even faster syncing
* [and more...](https://github.com/TobiaszCudnik/gtd-bot/blob/master/TODO.md)
