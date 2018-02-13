Bugs:
...

TODO:
- check if keepalive is used in googleapis
- implement deleting
  - currently the record is re-added from the other source
- mark gmail queries as Dirty based on related labels
- check if all the requests use the 'fields' limits
- print diffs using the logger
- exceeded quota
  - should add the Exception state in the specific sync instance
  - should slow down the refresh
    - bases on the estimation
    - before the limit is hit
- use views from lokijs
- dry run
  - argv processor
- tmp IDs for entries from non-gmail sources
- gzip
- gmail pubsub
- merge only if sth changed
  - should be safe to merge in the same record many times
- use keep alive in google auth
- make requests generic (instead of google-specific)

Later:
- ID mapper (sync, async)
