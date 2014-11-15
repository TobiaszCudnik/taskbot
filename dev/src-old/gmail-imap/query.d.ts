///<reference path="../../d.ts/global.d.ts"/>
///<reference path="../../d.ts/imap.d.ts"/>
///<reference path="../../node_modules/asyncmachine/lib/asyncmachine.d.ts"/>
///<reference path="./message.d"/>

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
	
	messages: IHash<message.Message>;
	query_results: IHash<message.Message>;
	
	// EVENTS
    // TODO define overrides to get the typing in place
	
	on(event: 'new-msg', listener: (msg: message.Message) => void); 
	once(event: 'new-msg', listener: (msg: message.Message) => void);
	
	on(event: 'labels-changed', listener: (msg: message.Message) => void); 
	once(event: 'labels-changed', listener: (msg: message.Message) => void);
	
	// TODO triggers
	
	// METHODS
	
	FetchingMessage_enter(states: string[], msg: imap.ImapMessage, id?: number);
	FetchingResults_enter(states: string[], results: number[]);
	QueryFetched_enter(states: string[], results: number[]);
    FetchingMessage_exit(id: number);
    
}