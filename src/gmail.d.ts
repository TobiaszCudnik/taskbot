///<reference path="../d.ts/node.d.ts"/>
///<reference path="../d.ts/sugar.d.ts"/>
///<reference path="../node_modules/asyncmachine/build/asyncmachine.d.ts"/>
	
class GmailManager extends asyncmachine.AsyncMachine {

	// ATTRIBUTES

	max_concurrency: number = 3;
	searches: GmailSearch[] = [];
	connection: imap.ImapConnection;
	box_opening_promise: rsvp.Promise;
	delayed_timer: number;
	concurrency: GmailSearch[] = [];
	threads: number[] = [];
}

//class Connection extends asyncmachine.AsyncMachine {
//}