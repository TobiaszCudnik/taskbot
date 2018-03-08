Bugs:

* double "email:XXXX" ref link in gtasks description
  * reproduce
* investigate "gmail-query-next History ID changed for thread" after start

TODO:

* support archiving email in the inbox
  * no status bounces back to inbox
  * add S/Ignored
* define timeout for googlapis requests (and others) in the settings
* merge GC and time array into a single TimeArray class
* move the child tasks along with the parent
* label matching should be case-insensitive
* only emails send by yourself should be parsed for tags while in inbox
* order for labels
  * always the same, defined in the settings
* periodic cache save
  * resume on start
  * include etags and history IDs
* use etags in patch requests in gtasks
  * reuse the answer
  * avoid the Dirty state
* error handling & redo logic for the init phase
* auto setup all the required labels on the startup
* handle deleted task IDs
* rename settings to config
* label masks eg S/\* matches S/Action and S/Finished
  * settings - label filters
  * settings - lists
* use lucene query parse to get condition checking from gmail queries
* variadic resync times
  * per gtasks list
  * not important list and lists used for archiving should be low priority
* GTasks results limit
  * paging support
  * max limit of results per query/gtask list (for archived lists)
* rotate file logs
* add some useful repl commands
* put a limit on initial gmail inbox size
* threads out-of-queries arent observed for changes
  * is that a real problem?
* implement deleting
  * currently the record is re-added from the other source
* mark gmail queries as Dirty based on related labels
* check if all the requests use the 'fields' limits
* use views from lokijs
* argv processor
* check if requests are gzipped
* gmail pubsub instead of pulling
* use keep alive in google auth
* make (root) requests generic (instead of google-specific)

Milestone 2:

* custom list
  * query creator
* merge subtasks
  * for the same email ID between different lists
  * only un completed ones
* stream based label filters
  * stream of label changes
  * with dates for both active and inactive (for the same label)
  * simple version: get the latest label changeset from times on labels
* siri/ical interface
* IM interface
* google spreadsheets backend
* missing extended GTD labels
  * S/Started or S/Current
  * RP/ - reference project, eg 'buy stuff #js-conf ##store'

Later:

* ID mapper (sync, async)
