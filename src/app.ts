import 'source-map-support/register'
import settings from '../settings'
import settings_debug from '../settings-debug'
import Sync, {State} from './manager/sync'
import Gmail from "./google/gmail/gmail";
import * as google from "googleapis";
import Auth from "./google/auth";
import {IConfig} from "./types";
import {Semaphore} from "await-semaphore/index";

if (process.env['DEBUG']) {
  settings = settings_debug
}

settings = {
  ...settings,
  gmail_max_results: 300
}

class App {
}

