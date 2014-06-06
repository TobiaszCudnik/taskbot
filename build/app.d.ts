/// <reference path="../node_modules/compiled-coffee/node_modules/typescript-yield/example/d.ts/suspend.d.ts" />
/// <reference path="../d.ts/global.d.ts" />
import gmail = require('./gmail');
export declare var go: typeof suspend.resume;
export declare var async: typeof suspend.async;
export declare class App extends gmail.Connection {
    public Connected_enter(states: string[]): boolean;
}
