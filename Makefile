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
	DEBUG=root DEBUG_FILE=1 node src/app.js

debug:
	DEBUG=3 node src/app.js

format:
	prettier --config package.json --write *.ts
	prettier --config package.json --write src/*.ts
	prettier --config package.json --write src/**/*.ts
	prettier --config package.json --write src/**/**/*.ts

am-types:
	mkdir -p typings/machines/sync
	mkdir -p typings/machines/google/gmail
	mkdir -p typings/machines/google/tasks

	$(STATES_TYPES_BIN) src/sync/sync.js -e sync_state \
		-o typings/machines/sync/sync.ts
	$(STATES_TYPES_BIN) src/sync/sync.js -e sync_writer_state \
		-o typings/machines/sync/sync-writer.ts
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
