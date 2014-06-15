///<reference path="../node_modules/asyncmachine/lib/asyncmachine.d.ts"/>
///<reference path="../node_modules/compiled-coffee/node_modules/typescript-yield/d.ts/suspend.d.ts" />
///<reference path="../d.ts/global.d.ts" />
import suspend = require('suspend');
import gmail = require('./gmail');
import settings = require('../settings');
export var go = suspend.resume;
export var async = suspend.async;

export class App extends gmail.Connection {
    Connected_enter(states: string[]) {
        this.addQuery("*", 1000);
        if (!this.add("Active")) {
            this.log("cant activate Active (states: " + (this.is()) + ")");
        }
        return true;
    }
}

suspend.fn(() => {
    var client = new App(settings);
    yield(setTimeout(go(), 10 * 1000));
    return client.add("Disconnected", true);
})();
