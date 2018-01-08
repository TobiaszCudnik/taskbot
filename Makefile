STATES_TYPES_BIN = node_modules/asyncmachine/tools/states-to-types.js

compile:
	node_modules/.bin/tsc --pretty --noEmit

compile-watch:
	node_modules/.bin/tsc --pretty --watch --noEmit

build:
	node_modules/.bin/tsc 

build-watch:
	node_modules/.bin/tsc --watch

start:
	node src/app.js

debug:
	DEBUG=3 node src/app.js

format:
	prettier --single-quote --no-semi --write src/**/*.ts

state-types:
	node $(STATES_TYPES_BIN) src/sync/task-list-sync-states.js -s
	node $(STATES_TYPES_BIN) src/sync/gmail-query.js -s
	node $(STATES_TYPES_BIN) src/sync/sync.js -s
	node $(STATES_TYPES_BIN) src/sync/gmail.js -s
	node $(STATES_TYPES_BIN) src/auth.js -s

.PHONY: test break build
