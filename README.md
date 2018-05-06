# GTD bot

Real time Gmail to Google Tasks sync and a GTD workflow manager.

## Features

* **~0.1 sec** sync time
* GTD workflows using Gmail labels and GTasks lists
* Automatically managed status labels
* `#hashtags` to labels from subjects and tasks
* Label types: `Status`, `Project`, `Reference`, `Location`, `View`
* Auto label colors

## Usage

1.  `$ npm i`
1.  Create a [Google API project](https://console.cloud.google.com/iam-admin/) and a backend service account
1.  Rename `settings.credentials-template.ts` to `settings.credentials.ts`
1.  Fill it in using the service account credentials
1.  Generate a token using `$ node /dev/tools/oauth/oauth.js`
1.  Paste into `settings.credentials.ts`
1.  `$ make build`
1.  `$ make start`
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
