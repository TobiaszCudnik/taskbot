///<reference path="../d.ts/global.d.ts"/>
///<reference path="../d.ts/imap.d.ts"/>
///<reference path="../node_modules/asyncmachine/build/asyncmachine.d.ts"/>
	
//c lass Connection extends asyncmachine.AsyncMachine {
class Connection {

	// ATTRIBUTES

	max_concurrency: number;
	searches: Query[];
	connection: imap.Imap;
	last_promise: rsvp.Defered;
	box_opening_promise: rsvp.Defered;
	delayed_timer: number;
	concurrency: Query[];
//	threads: number[] = [];
	settings: IGtdBotSettings;
}

class Query {
}

//c lass Search extends asyncmachine.AsyncMachine {
//}