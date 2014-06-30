///<reference path="../d.ts/global.d.ts" />
///<reference path="../node_modules/compiled-coffee/node_modules/typescript-yield/d.ts/suspend.d.ts" />
///<reference path="../node_modules/asyncmachine/lib/asyncmachine.d.ts"/>
///<reference path="gmail/connection"/>

//c lass App extends GmailManager
class App extends Connection {
	Connected_enter(states: string[]): boolean;
}