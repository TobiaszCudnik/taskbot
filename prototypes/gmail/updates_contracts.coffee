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

GmailManagerCtr = ? {
	lock: Bool
	cursor: Num
	channels: (Any?) -> Any?
	createChannel: -> Any?
#	activate: -> Promise
	activate: -> Any?
}

module.exports = {
	GmailCtr
	GmailManagerCtr
	GmailManagerCtr
}