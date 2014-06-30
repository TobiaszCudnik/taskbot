///<reference path="../../d.ts/global.d.ts"/>
///<reference path="../../d.ts/imap.d.ts"/>
///<reference path="../../d.ts/async.d.ts"/>
///<reference path="../../node_modules/asyncmachine/lib/asyncmachine.d.ts"/>
///<reference path="./query"/>


class Connection extends asyncmachine.AsyncMachine {

	// ATTRIBUTES
	
	imap: imap.Imap;
	settings: IGtdBotSettings;

	queries: query.Query[];
	queries_executing: query.Query[];
	queries_executing_limit: number;
//	box: imap.Box;
//	fetch: imap.ImapFetch;
    
	Connected_enter(states: string[]): boolean;
    
    constructor(settings: any);
    public addQuery(query: any, update_interval: any): any;
    public Connecting_enter(states?: any): void;
    public Connecting_exit(states?: any): any;
    public Connected_enter(states?: string[]): boolean;
    public Connected_exit(): any;
    public OpeningBox_enter(): boolean;
    public BoxOpened_enter(states: any, err: any, box: any): any;
    public BoxOpeningError_enter(err: any): void;
    public BoxClosing_enter(): any;
    public Ready_enter(): boolean;
    public Active_enter(): boolean;
    public Connected_Active(): boolean;
    public ExecutingQueries_enter(): any;
    public ExecutingQueries_Disconnecting(states: any, force: any): void;
    public Fetching_exit(): boolean;
    public Disconnected_enter(states: any, force: any): boolean;
    public Disconnecting_exit(): boolean;
    public fetchScheduledQueries(): any;
    public queryFetched(query: any, tick: any): void;
    public minInterval_(): any;
}

//interface Hash<T> {
//	[index: string]: T;
//}
