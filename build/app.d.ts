/// <reference path="../node_modules/asyncmachine/lib/asyncmachine.d.ts" />
/// <reference path="../node_modules/compiled-coffee/node_modules/typescript-yield/d.ts/suspend.d.ts" />
/// <reference path="../d.ts/global.d.ts" />
import gmail = require('./gmail');
export declare var go: typeof suspend.resume;
export declare var async: typeof suspend.async;
export declare class App extends gmail.Connection {
    constructor(settings: any);
}
export declare var client: App;
