## Bugs

* changing from S/Finished to S/Pending works the second time
* references R/Foo as ^Foo dont show up in tasks
* change from gmail, undone by the labels filter isnt applied back to gmail
* after 500 backendError
  * root HeartBeat, restarting because of - 'Reading timeout' +2m
  * restart doesnt work
  * queue error?
* out-of-memory after 2 days on default sync freqs

## TODO

* colors should be added when the new label has been discovered
  * this includes added via #hashtags and via gmail
  * currently colors are set only on the start
* auto create the logs dir
* parse #hashtags only if email send by the author to HIMSELF
  * currently only the sender is checked
* stream based label filters
  * stream of label changes
  * with dates for both active and inactive (for the same label)
  * simple version: get the latest label changeset from times on labels
* on HeartBeat reset - kill all the active connections, release the semaphore
* show the origin of a finished request in root::req
* log requests to a separate file
* include the full link to the email
* check if `(#tag)` works
* tasks for archived emails from the inbox should be deleted
  * from the task list, instead of completed
  * not needed as inbox isnt covered anymore?
* S/Ignored should remove other statuses
  * remove S/Ignored if not necessary
  * not needed as inbox isnt covered anymore?
* move the child tasks along with the parent
* label matching should be case-insensitive
* only emails send by yourself should be parsed for tags while in inbox
  * not needed as inbox isnt covered anymore?
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

## Optimizations

* route requests through several apps to bypass quota limits
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
* use a real DB when running in node
  * required a DAO layer

## Refactor

* merge GC and time array into a single TimeArray class
* make (root) requests generic (instead of google-specific)
* rename settings to config

## Milestone 2

* multi user mode for syncing gtasks lists only
  * usecase: share a google tasks list with someone
* collaborative syncing
* project label mapped to an email address
  * search query, like a gmail filter?
* custom list
  * query creator
* merge subtasks
  * for the same email ID between different lists
  * only un completed ones
* siri/ical interface
* IM interface
* OCR interface
* google spreadsheets backend
* other todo app backend
  * Todoist?
  * remember the milk?
* integrate google contacts, add @ mention
  * define shortcuts (where?)
* integrate google calendar
  * language processing, dates, etc
* web crawling bots backend
* missing extended GTD labels
  * S/Started or S/Current
  * RP/ - reference project, eg 'buy stuff #js-conf ##store'
  * Contexts?
* periodic cache save
  * resume on start
  * include etags and history IDs
* auto archive completed tasks
  * being completed for longer than XXX days
* ID mapper (instead of email IDs)
