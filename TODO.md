## Bugs

* tags get duplicated in gtasks
  * test #foo ^locA #foo ^locA
* out-of-memory after 2 days on default sync freqs
* `*loc1` causes `root MERGE LIMIT EXCEEDED`

## Milestone 1:

* colors should be added when a new label has been discovered
  * this includes added via #hashtags and via gmail
  * currently colors are set only on the start
  * requires pub sub
  * temp solution is pooling for changes every X minutes
* sync multiple users
  * work on the same quota
  * reuse the API clients (support the RestartingNetwork state)
* parse #hashtags only if email send by the author to HIMSELF
  * currently only the sender is checked
  * monitor inbox separately from the lists
* implement list.writers for gmail
* on HeartBeat reset - kill all the active connections, release the semaphore
* push logs to a log service
  * OR rotate file logs
* results limit
  * gtasks paging support
  * max limit of results per query/gtask list
* support moving to trash
  * ignore syncing
  * mark as completed in gtasks
  * same when deleted from gtasks and not found in any other lists
    * add label:Trash
* include payload in request-related errors
* include the endpoint in the requests log

## TODO

* removed orphaned tasks
* change logger names
  * 'gtasks' -> 'gtasks-root', 'google' -> 'google-root'
* auto create the logs dir
* show the origin of a finished request in root::req
* check if `(#tag)` works
* tasks for archived emails from the inbox should be deleted
  * from the task list, instead of completed
  * not needed as inbox isnt covered anymore?
* S/Ignored should remove other statuses
  * remove S/Ignored if not necessary
  * not needed as inbox isnt covered anymore?
* define timeout for googlapis requests (and others) in the settings
* error handling & redo logic for the init phase
  * before Ready is set
  * include quota checking
* use lucene query parse to get condition checking from gmail queries
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
* set a global auth and don't re-send with every req
* use keep alive in google auth
* gmail
  * pubsub instead of pulling
  * OR track own gmail changes and DONT re-fetch
* mark gmail queries as Dirty based on related labels
* check if all the requests use the 'fields' limits
* use views from lokijs
* check if requests are gzipped
* use Users.messages.batchModify for gmail labels
* use a real DB when running in node
  * required a DAO layer
* consider serverless architecture

## Refactor

* merge GC and time array into a single TimeArray class
* make (root) requests generic (instead of google-specific)
* rename settings to config

## Milestone 2

* customizable gmail domain
* multi user mode for syncing gtasks lists only
  * usecase: share a google tasks list with someone
  * sharing lists via the project tag eg P/groceries
  * sharing via a dedicated CP, reading contacts directly from gmail
  * the other person has to have the service active
  * sync directly via own APIs
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
