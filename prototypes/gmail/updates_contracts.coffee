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
	locked: Bool
#	cursor_: Num
	channels: (Any?) -> Any?
	createChannel: -> Any?
#	activate: -> Promise
	activate: -> Any?
}

module.exports = {
	GmailCtr
	GmailManagerCtr
}