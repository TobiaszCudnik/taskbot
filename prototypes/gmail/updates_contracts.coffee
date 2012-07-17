## CONTRACTS
promise_ctr = ? {
	then: Any
}

GmailCtr = ? {
	fetchQuery: -> promise_ctr
}

GmailManagerChannel = ? {

}

GmailManagerCtr = ? {
	createChannel: (Str) -> GmailManagerChannel
}

module.exports = {
	GmailCtr
	GmailManagerCtr
}