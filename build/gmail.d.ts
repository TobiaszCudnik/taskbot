/// <reference path="../node_modules/asyncmachine/build/asyncmachine.d.ts" />
/// <reference path="../d.ts/imap.d.ts" />
/// <reference path="../d.ts/global.d.ts" />
export declare var ImapConnection: typeof imap.ImapConnection;
import asyncmachine = require('asyncmachine');
import am_task = require('./asyncmachine-task');
import rsvp = require('rsvp');
export declare class Query extends am_task.Task {
    public HasMonitored: {};
    public Fetching: {
        blocks: string[];
    };
    public Idle: {
        blocks: string[];
    };
    public FetchingQuery: {
        implies: string[];
        blocks: string[];
    };
    public FetchingResults: {
        implies: string[];
        blocks: string[];
    };
    public ResultsFetchingError: {
        implies: string[];
    };
    public FetchingMessage: {
        blocks: string[];
        requires: string[];
    };
    public MessageFetched: {
        blocks: string[];
        requires: string[];
    };
    public active: boolean;
    public last_update: number;
    public headers: string[];
    public monitored: any[];
    public connection: any;
    public name: string;
    public update_interval: number;
    constructor(connection: any, name: any, update_interval: any);
    public FetchingQuery_enter(): any;
    public FetchingQuery_FetchingResults(states: any, err: any, results: any): any;
    public FetchingMessage_enter(states: any, msg: any): any;
    public FetchingMessage_MessageFetched(states: any, msg: any): number;
    public ResultsFetchingError_enter(err: any): void;
    public repl(): Query;
    public log(...msgs: any[]): any;
}
export declare class Connection extends asyncmachine.AsyncMachine {
    public max_concurrency: number;
    public queries: any[];
    public connection: imap.ImapConnection;
    public box_opening_promise: rsvp.Defered;
    public delayed_timer: number;
    public concurrency: Query[];
    public threads: any[];
    public settings: IGtdBotSettings;
    public last_promise: rsvp.Defered;
    public Disconnected: {
        blocks: string[];
    };
    public Disconnecting: {
        blocks: string[];
    };
    public Connected: {
        blocks: string[];
        implies: string[];
    };
    public Connecting: {
        blocks: string[];
    };
    public Idle: {
        requires: string[];
    };
    public Active: {
        requires: string[];
    };
    public Fetched: {};
    public Fetching: {
        requires: string[];
        blocks: string[];
    };
    public Delayed: {
        requires: string[];
        blocks: string[];
    };
    public BoxOpening: {
        requires: string[];
        blocks: string[];
    };
    public BoxOpened: {
        depends: string[];
        requires: string[];
        blocks: string[];
    };
    public BoxClosing: {
        blocks: string[];
    };
    public BoxClosed: {
        requires: string[];
        blocks: string[];
    };
    constructor(settings: any);
    public addQuery(query: any, update_interval: any): any;
    public Connected_enter(states: any): boolean;
    public Connected_Disconnected(): void;
    public Connecting_enter(states: any): any;
    public Connecting_exit(target_states: any): boolean;
    public Connected_exit(): any;
    public BoxOpening_enter(): boolean;
    public BoxOpening_BoxOpening(): asyncmachine.lucidjs.IBinding;
    public BoxOpening_exit(): any;
    public BoxClosing_enter(): any;
    public BoxOpened_enter(): any;
    public Delayed_enter(): any;
    public Delayed_exit(): any;
    public Fetching_enter(): any;
    public Fetching_exit(states: any, args: any): boolean;
    public Fetching_Fetching: () => any;
    public Active_enter(): boolean;
    public minInterval_(): any;
    public repl(): Connection;
    public log(...msgs: any[]): any;
}
