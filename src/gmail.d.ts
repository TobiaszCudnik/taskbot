///<reference path="../d.ts/global.d.ts"/>
///<reference path="../d.ts/imap.d.ts"/>
///<reference path="../d.ts/async.d.ts"/>
///<reference path="../node_modules/asyncmachine/lib/asyncmachine.d.ts"/>
///<reference path="asyncmachine-task.d.ts"/>
	
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

// c lass Query extends Task {
class Query extends asyncmachine.AsyncMachine {
    private msg: imap.Message;
	
	results: IHash<Message>;
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
