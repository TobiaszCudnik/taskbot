## Bugs

* after starting the service for 2 users
  * `connections-error [gtd...@gmail.com] Request 'gtasks.api.tasks.list' aborted by the abort() function +0ms`
* restart after an exception doesnt kick in

## Milestone 1:

* make `tail -f` show ansi colors
  * separate log file `debug.log` showing loggers from the `DEBUG` env var
  * make `combined.log` optional
  * disable the google log
* unify hashtags
  * `^foo` into `#r-foo`
  * `*foo` into `#l-foo`
  * duplicates may be a problem
  * not the action tags - !na is fine
* hidden label '!gtd' to list all the emails with a status
* tests
  * unhide and restore the parent
    * assert the parent stays the same
  * service
    * restarting 
    * reacting on exceptions 
* welcome email with instructions
  * `TaskBot Welcome Email`
  * `!T/Sync GTasks`
* when checking initial labels compare using the normalized form
* react to `code: 'ECONNRESET'`
* handle `invalid_grant` in google auth
* hide `!T/` labels from the label list
* `!T/task` and `A/answer` labels auto-removed after 
  a certain amount of time
* encrypt sensitive info in the logs with MD5 hashes
  * only for PROD
  * salt
* user signup (password protected)
  * collect the ip

## Milestone 1.2

* in case of a color conflict
  * try to remove custom colors (scan and compare)
  * avoid updating the color (continue using the users one)
* results limit
  * gtasks paging support
  * max limit of results per query/gtask list
* per-user ip to skip 100 per user quota
* separate service for the website on GAE std
* logger
  * ability to turn on debug per specific user
  * handle errors from winston
* delete per-user-logs when deleting an account
* store users in Cloud Datastore
  * local emulator for development
* handle google auth “error” : “invalid_grant”
  * https://blog.timekit.io/google-oauth-invalid-grant-nightmare-and-how-to-fix-it-9f4efaf1da35
* users admin panel
  * enable / disable syncing per user
  * enable / disable logging per user
  * activate user accounts
  * sync per api in the last 1h, 24h

## TODO

* read local logs with kibana
* split `connections-info` to `connections/gmail-info` etc
* print new records on db-diffs and record=diffs
* dont re-order non-status labels, keep them in the text
* scrape email content to a new task
  * all the links
  * snippet
* 'download task' task command
  * dumps all the description and children (with descs) into a new self-email
  * sends to the thread with the label
  * detect empty descs and ignore
  * OR downloads to an editable draft
* implement Dirty states for gtask lists
  * create/modify Record
  * remove from list
* store history ID times per user in the DB
  * helps with first-start merge to compare dates
* auto create the logs dir
* show the origin of a finished request in root::req
* check if `(#tag)` works
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

* reduce the number of appengine health checks
* share the same http agent across all the users on the node
* apply the change manually on the internal readers' data structs
  * to avoid impossible re-reads in case of too frequent syncs
  * the change is applied, but the system cant get new data to confirm this
  * trust the HTTP response codes
* custom docker image
  * https://lugassy.net/accelerate-optimize-your-google-app-engine-deployments-9358414f80f6
* SyncList dedicated to Orphaned Threads
  * monitor when they disappear from the query
  * merge changes in
  * query by IDs, one result, compare the history ID, inherit from SyncList
* route requests through several apps to bypass quota limits
* clone records for diffing only in the debug mode
* use etags in patch requests in gtasks
  * reuse the answer
  * avoid the Dirty state
* set a global auth and don't re-send with every req
* use keep alive in google auth
* gmail
  * pubsub instead of pulling
    * https://mixmax.com/blog/adventures-in-the-gmail-pubsub-api
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

* google-auth-info not present on the loggers list at the end
* move from `typings` to `@types`
* replace async-map with Promise.all(array.map(async ...))
* merge GC and time array into a single TimeArray class
* make (root) requests generic (instead of google-specific)
* rename settings to config

## Milestone 2

* merge as an asyncmachine
  * merge for each record as an asyncmachine
  * copy each record before the merge and compare with the one after the merge
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
