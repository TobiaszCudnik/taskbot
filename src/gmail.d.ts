
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

class SearchAgent extends am_task.Task {
	
}