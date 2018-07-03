## Bugs

* cant add status labels in google tasks
  * adding `!w` to a google task in `!Next` doesnt move the task
  * adding `!e` to a google task in `!Waiting` doesnt complete the task
    * should work for lists without query matches `!e !f`
  * force only 1 status label at a time
* http server leaks 42mb per hour for 2 users
  * StackDrivers also may
    * `Warning: connect.session() MemoryStore is not`
    * check memory usage on GAE without the StackDriver transport
* new P/\* labels added in gmail dont appear in gtasks descriptions
  * service restart required
* after starting the service for 2 users
  * `connections-error [gtd...@gmail.com] Request 'gtasks.api.tasks.list' aborted by the abort() function +0ms`
* emails in inbox (unread ones)
  * when changed a status AND archived simultaneously
  * go back to the inbox
* restart after an exception doesnt kick in

## Milestone 1:

* support gtasks force-refresh via add-n-remove a status label (in gmail)
  * per-user per-api internal quota
    * quota to avoid too many dirty refreshes
  * count gtasks short quota per user
  * per-user ip to skip 100 per user quota
    * needed?
  * check how it works with deleting (and orphan threads)
* `T/task` and `A/answer` labels
  * add `T/refresh-next` to refresh the `s-next-action` list
  * `A/quota-exceeded` pops up if the user ran out of quota
    * that included both users-internal and the global quotas
* reduce gtasks per-list refresh freq to 10 mins
* encrypt sensitive info in the logs with MD5 hashes
  * only for PROD
  * salt
* results limit
  * gtasks paging support
  * max limit of results per query/gtask list
* handle deleted labels (from gmail)
* user signup (password protected)
  * collect the ip
* users admin panel
  * enable / disable syncing per user
  * enable / disable logging per user
  * activate user accounts
  * sync per api in the last 1h, 24h

## Milestone 1.2

* separate service for the website on GAE std
* logger
  _ ability to turn on debug per specific user
  _ handle errors from winston
* delete per-user-logs when deleting an account
* store users in Cloud Datastore
  * local emulator for development

## TODO

* implement Dirty states for gtask lists
  * create/modify Record
  * remove from list
* store history ID times per user in the DB
  * helps with first-start merge to compare dates
* consider unifying hashtags
  * ^foo into #r-foo
  * \*foo into #l-foo
  * or switch the symbols to \*ref, ^loc
  * duplicates may be a problem
  * not the action tags - !na is fine
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

* move from `typings` to `@types`
* replace async-map with Promise.all(array.map(async ...))
* merge GC and time array into a single TimeArray class
* make (root) requests generic (instead of google-specific)
* rename settings to config

## Milestone 2

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
