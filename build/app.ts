///<reference path="../node_modules/asyncmachine/lib/asyncmachine.d.ts"/>
///<reference path="../node_modules/compiled-coffee/node_modules/typescript-yield/d.ts/suspend.d.ts" />
///<reference path="../d.ts/global.d.ts" />
import suspend = require('suspend');
import gmail = require('./gmail');
import settings = require('../settings');
export var go = suspend.resume;
export var async = suspend.async;

export class App extends gmail.Connection {
    constructor(settings) {
        super(settings);
        this.addQuery("label:P-test", 5000);
        if (!this.add("Active")) {
            this.log("cant activate Active (states: " + (this.is()) + ")");
        }
    }
}

export var client = new App(settings);
