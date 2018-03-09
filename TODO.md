Bugs:

* cant archive new email in inbox bc S/Finished is active: false, by default
* double "email:XXXX" ref link in gtasks description
  * reproduce
* references R/Foo as ^Foo dont show up in tasks
* change from gmail, undone by the labels filter isnt applied back to gmail

TODO:

* log requests to a separate file
* tmp: include the full link to the email
* on HeartBeat reset - kill all the active connections, release the semaphore
* tasks for archived emails from the inbox should be deleted
  * from the task list, instead of completed
* S/Ignored should remove other statuses
  * remove S/Ignored if not necessary
* move the child tasks along with the parent
* label matching should be case-insensitive
* only emails send by yourself should be parsed for tags while in inbox
* order for labels
  * always the same, defined in the settings
* define timeout for googlapis requests (and others) in the settings
* error handling & redo logic for the init phase
  * before Ready is set
  * include quota checking
* calculate the daily quota by counting requests
* handle deleted task IDs
  * ... ?
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
* put a limit on initial gmail inbox size
* threads out-of-queries arent observed for changes
  * is that a real problem?
* implement deleting
  * currently the record is re-added from the other source
* cli params
  * config
  * terminal debugs
  * AM debug / level
  * AMI debug / host / level
  * file debug / level
    * append logs
* add some useful repl commands
  * print all machines
  * print the DB
    * gmail, gtasks

Optimizations:

* clone records for diffing only in the debug mode
* use etags in patch requests in gtasks
  * reuse the answer
  * avoid the Dirty state
* use keep alive in google auth
* gmail pubsub instead of pulling
* mark gmail queries as Dirty based on related labels
* check if all the requests use the 'fields' limits
* use views from lokijs
* check if requests are gzipped
* use Users.messages.batchModify for gmail labels

Refactor:

* merge GC and time array into a single TimeArray class
* make (root) requests generic (instead of google-specific)
* rename settings to config

Milestone 2:

* project label mapped to an email address
  * search query, like a gmail filter?
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
* OCR interface
* google spreadsheets backend
* missing extended GTD labels
  * S/Started or S/Current
  * RP/ - reference project, eg 'buy stuff #js-conf ##store'
  * Contexts?
* periodic cache save
  * resume on start
  * include etags and history IDs

Later:

* ID mapper (instead of email IDs)
