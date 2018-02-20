Bugs:

* gtasks can send 2 different responses with the same etag
  * periodically perform a full refresh

TODO:

* exclude filter for gmail labels (eg CATEGORY\_\*, IMPORTANT, UNREAD)
* use lucene query parse to get condition checking from gmail queries
* variadic resync times
  * per list/gmail/google and all combined
  * not important list and lists used for archiving should be low priority
* GTasks results limit
  * paging support
  * max limit of results per query/gtask list (for archived lists)
* put a limit on initial gmail inbox size
* paging support in gtasks
* text to labels
* list all available debug namespaces on exit
* threads out-of-queries arent observed for changes
  * is that a real problem?
* check if keepalive is used in googleapis
* implement deleting
  * currently the record is re-added from the other source
* implement moving google tasks between lists
  * using copies
  * download hidden tasks on initial sync
    * with a min date limit (1 month back?)
* mark gmail queries as Dirty based on related labels
* check if all the requests use the 'fields' limits
* print diffs using the logger
* exceeded quota
  * should add the Exception state in the specific sync instance
  * should slow down the refresh
    * bases on the estimation
    * before the limit is hit
* use views from lokijs
* dry run
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
