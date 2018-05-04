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
1.  `$ tsc`
1.  `$ make start`
1.  Enable keyboard shortcuts and multi inbox in Gmail
1.  Use your fav GTasks client for mobile and [tasks canvas](https://mail.google.com/tasks/canvas) for the web

## Still to come

* More tasks APIs covered
* Spreadsheets support
* Faster syncing
* Multi user support
* [and more...](https://github.com/TobiaszCudnik/gtd-bot/blob/master/TODO.md)
