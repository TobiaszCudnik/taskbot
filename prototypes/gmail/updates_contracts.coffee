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
	addSearch: (Str) -> GmailManagerChannel
}

GmailManagerCtr = ? {
	locked: Bool
#	cursor_: Num
	searched: (Any?) -> Any?
	addSearch: -> Any?
#	activate: -> Promise
	activate: -> Any?
}

module.exports = {
	GmailCtr
	GmailManagerCtr
}