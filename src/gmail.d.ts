///<reference path="../d.ts/global.d.ts"/>
///<reference path="../d.ts/imap.d.ts"/>
///<reference path="../node_modules/asyncmachine/lib/asyncmachine.d.ts"/>
///<reference path="asyncmachine-task.d.ts"/>
	
class Connection extends asyncmachine.AsyncMachine {

	// ATTRIBUTES
	
	imap: imap.Imap;
	settings: IGtdBotSettings;

	queries: Query[];
	queries_running: Query[];
	queries_running_limit: number;
	
}

class Query extends Task {
}