///<reference path="../d.ts/global.d.ts"/>
///<reference path="../d.ts/imap.d.ts"/>
///<reference path="../d.ts/async.d.ts"/>
///<reference path="../node_modules/asyncmachine/lib/asyncmachine.d.ts"/>
///<reference path="asyncmachine-task.d.ts"/>

// c lass Query extends Task {
class Query extends asyncmachine.AsyncMachine {
	
	// STATES
	
	Fetching: asyncmachine.IState;
	Idle: asyncmachine.IState;
	ResultsAvailable: asyncmachine.IState;
	FetchingQuery: asyncmachine.IState;
	QueryFetched: asyncmachine.IState;
	FetchingResults: asyncmachine.IState;
	ResultsFetched: asyncmachine.IState;
	FetchingMessage: asyncmachine.IState;
	MessageFetched: asyncmachine.IState;
	ResultsFetchingError: asyncmachine.IState;
	QueryFetchingError: asyncmachine.IState;
	
	// ATTRIBUTES
	
	private tmp_msgs: imap.ImapMessage[];
	
	messages: IHash<Message>;
	query_results: IHash<Message>;
	
	// EVENTS
    // TODO define overrides to get the typing in place
	
	on(event: 'new-msg', listener: (msg: Message) => void); 
	once(event: 'new-msg', listener: (msg: Message) => void);
	
	on(event: 'labels-changed', listener: (msg: Message) => void); 
	once(event: 'labels-changed', listener: (msg: Message) => void);
	
	// TODO triggers
	
	// METHODS
	
	FetchingMessage_enter(states: string[], msg: imap.ImapMessage, id?: number);
	FetchingResults_enter(states: string[], results: number[]);
	QueryFetched_enter(states: string[], results: number[]);
    FetchingMessage_exit(id: number);
    
}
	
class Connection extends asyncmachine.AsyncMachine {

	// ATTRIBUTES
	
	imap: imap.Imap;
	settings: IGtdBotSettings;

	queries: Query[];
	queries_executing: Query[];
	queries_executing_limit: number;
//	box: imap.Box;
//	fetch: imap.ImapFetch;
}

//interface Hash<T> {
//	[index: string]: T;
//}

class Message {
	id: number;
	subject: string;
	body: string;
	labels: string[];
	fetch_id: number;
	
	constructor(id: number, subject: string, labels: string[], body?: string);
}
