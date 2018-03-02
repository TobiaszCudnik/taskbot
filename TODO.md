Bugs:

* dont delete tasks with children
  * mark as deleted?
* cant add !p to V/now
* cant add !f to V/now, INBOX in gmail
* double "email:XXXX" ref link in gtasks description

TODO:

* HeartBeat state - global keep-alive timeout, checking on the root machine
* label matching should be case-insensitive
* only emails send by yourself should be parsed for tags while in inbox
* missing extended GTD labels
  * S/Started or S/Current
  * RP/ - reference project, eg 'buy stuff #js-conf ##store'
* order for labels
  * always the same, defined in the settings
* handle exceptions
  * should add the Exception state
  * network errors eg EHOSTUNREACH, ECONNRESET
  * API errors res.statusCode == 500
  * simulate in node_modules/googleapis/node_modules/google-auth-library/lib/transporters.js:34
  * redo Ready as a special case
* periodic cache save
  * resume on start
* label filters - add labels based on a stream of changes
  * instead of query=add|remove
  * get the latest label changeset from time on labels
* timeouts for requests
* use etags in patch requests in gtasks
  * reuse the answer
  * avoid the Dirty state
* auto setup all the required labels on the startup
* handle deleted task IDs
* rename settings to config
* label masks eg S/\* matches S/Action and S/Finished
  * settings - label filters
  * settings - lists
* use lucene query parse to get condition checking from gmail queries
* variadic resync times
  * per list/gmail/google and all combined
  * not important list and lists used for archiving should be low priority
* GTasks results limit
  * paging support
  * max limit of results per query/gtask list (for archived lists)
* put a limit on initial gmail inbox size
* paging support in gtasks
* list all available debug namespaces on exit
* threads out-of-queries arent observed for changes
  * is that a real problem?
* check if keepalive is used in googleapis
* implement deleting
  * currently the record is re-added from the other source
* mark gmail queries as Dirty based on related labels
* check if all the requests use the 'fields' limits
* print diffs using the logger
* exceeded quota
  * should add the Exception state in the specific sync instance
  * should slow down the refresh
    * bases on the estimation
    * before the limit is hit
* use views from lokijs
* argv processor
* tmp IDs for entries from non-gmail sources
* check if requests are gzipped
* use history ID changes instead of refetching gmail queries
  * gmail pubsub
* merge only if sth changed
  * should be safe to merge in the same record many times
* use keep alive in google auth
* make requests generic (instead of google-specific)

Later:

* ID mapper (sync, async)
