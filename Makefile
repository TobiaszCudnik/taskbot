STATES_TYPES_BIN = node_modules/asyncmachine/bin/am-types.js

compile:
	node_modules/.bin/tsc --pretty --noEmit

compile-watch:
	node_modules/.bin/tsc --pretty --watch --noEmit

build:
	node_modules/.bin/tsc 

build-watch:
	node_modules/.bin/tsc --watch

start:
	DEBUG=root,\*-error DEBUG_FILE=1 node src/app.js

start-am:
	DEBUG=\*-error,requests-verbose,root,gmail,gtasks,record-diffs,\*-am,gmail-verbose,gtasks-verbose \
		DEBUG_FILE=1 \
		DEBUG_AM=1 \
		node --inspect \
		src/app.js

start-verbose:
	DEBUG=\*-error,\*-verbose,root,gmail,gtasks,record-diffs \
		DEBUG_FILE=1 \
		DEBUG_AM=1 \
		node --inspect \
		src/app.js

start-ami:
	DEBUG=root,gmail,gtasks DEBUG_FILE=1 DEBUG_AMI=1 DEBUG_AM=1 \
		node --inspect src/app.js
		#node --inspect-brk src/app.js

start-inspect:
	DEBUG=root node --inspect src/app.js

start-am-heartbeat:
	@echo 'Start with expressive logging for HeartBeat with the --inspect flag'
	# requests-verbose,
	DEBUG=root\*,gtasks,\*-am \
		DEBUG_FILE=1 \
		DEBUG_AM=1 \
		node --inspect src/app.js
		#node --inspect-brk src/app.js

clear-logs:
	rm logs/*

debug:
	DEBUG=root DEBUG_FILE=1 node --inspect-brk src/app.js

debug-list-next:
	DEBUG=record-diffs,google,gmail,gtasks,gmail-query-next,gmail-list-next,gtasks-list-next \
		DEBUG_FILE=1 \
		DEBUG_AM=1 \
		node --inspect-brk src/app.js

debug-gmail:
	DEBUG=record-diffs,google,gmail,gmail-verbose,\*-errors,gtasks \
		DEBUG_FILE=1 \
		DEBUG_AM=1 \
		node --inspect src/app.js

format:
	prettier --config package.json --write *.ts
	prettier --config package.json --write src/*.ts
	prettier --config package.json --write src/**/*.ts
	prettier --config package.json --write src/**/**/*.ts

am-types:
	mkdir -p typings/machines/sync
	mkdir -p typings/machines/google/gmail
	mkdir -p typings/machines/google/tasks

	$(STATES_TYPES_BIN) src/sync/reader.js -e sync_reader_state \
		-o typings/machines/sync/reader.ts
	$(STATES_TYPES_BIN) src/sync/writer.js -e sync_writer_state \
		-o typings/machines/sync/writer.ts
	$(STATES_TYPES_BIN) src/sync/root.js -e sync_state \
		-o typings/machines/sync/root.ts

	$(STATES_TYPES_BIN) src/google/sync.js -e sync_state \
		-o typings/machines/google/sync.ts
	$(STATES_TYPES_BIN) src/google/auth.json \
		-o typings/machines/google/auth.ts

	$(STATES_TYPES_BIN) src/google/tasks/sync.js -e sync_state \
		-o typings/machines/google/tasks/sync.ts
	$(STATES_TYPES_BIN) src/google/tasks/sync-list.js -e sync_state \
		-o typings/machines/google/tasks/sync-list.ts

	$(STATES_TYPES_BIN) src/google/gmail/sync-list.js -e sync_state \
		-o typings/machines/google/gmail/sync-list.ts
	$(STATES_TYPES_BIN) src/google/gmail/sync.js -e sync_state \
		-o typings/machines/google/gmail/sync.ts
	$(STATES_TYPES_BIN) src/google/gmail/query.js -e sync_state \
		-o typings/machines/google/gmail/query.ts

npmi:
	npm i
	npm link asyncmachine
	npm link ami-logger

.PHONY: test break build
