/// <reference path="../node_modules/compiled-coffee/node_modules/typescript-yield/d.ts/suspend.d.ts" />
/// <reference path="../d.ts/global.d.ts" />
import suspend = require('suspend');
import gmail = require('./gmail');
import settings = require('../settings');
export var go = suspend.resume;
export var async = suspend.async;

export class App  extends gmail.Connection {
    Connected_enter(states: string[]) {
        super.Connected_enter(states);
        this.log("adding searches");
        this.addQuery("*", 1000);
        this.addQuery("label:sent", 5000);
        this.addQuery("label:T-foo", 5000);
        if (!this.add("Active")) {
            this.log("cant activate", this.is());
        }
        return true;
    }
}

suspend(() => {
    var client = new App(settings);
    yield(setTimeout(go(), 10 * 1000));
    return client.add("Disconnected");
})();
