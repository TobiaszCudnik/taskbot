AM_TYPES_BIN = node_modules/asyncmachine/bin/am-types.js
SHOWDOWN_BIN = node_modules/showdown/bin/showdown.js

compile:
	node_modules/.bin/tsc --pretty --noEmit

compile-watch:
	node_modules/.bin/tsc --pretty --watch --noEmit

build:
	node_modules/.bin/tsc 

build-watch:
	node_modules/.bin/tsc --watch

start:
	DEBUG=root:\*-info,\*-error,http-server-info DEBUG_FILE=1 node src/app/app.js

start-prod:
	PROD=1 DEBUG=root:\*-info,\*-error DEBUG_FILE=1 DEBUG_AM=1 node src/app/app.js

start-am:
	DEBUG=\*-error,connections-verbose,root:\*-info,gmail-root,gtasks-root,record-diffs,\*-am:\* \
		DEBUG_FILE=1 \
		DEBUG_AM=1 \
		node --inspect \
		src/app/app.js

start-verbose:
	DEBUG=\*-error,\*-verbose,root:\*-info,gmail-root,gtasks-root,record-diffs \
		DEBUG_FILE=1 \
		DEBUG_AM=1 \
		node --inspect \
		src/app/app.js

start-ami:
	DEBUG=root:\*-info,gmail-root,gtasks DEBUG_FILE=1 DEBUG_AMI=1 DEBUG_AM=1 \
		node --inspect src/app/app.js
		#node --inspect-brk src/app/app.js

start-inspect:
	DEBUG=root node --inspect src/app/app.js

start-am-heartbeat:
	@echo 'Start with expressive logging for HeartBeat with the --inspect flag'
	# connections-verbose,
	DEBUG=root\*,gmail-root,gtasks-root,\*-am,\*-error,gmail-query-next\* \
		DEBUG_FILE=1 \
		DEBUG_AM=3 \
		node --inspect src/app/app.js
		#node --inspect-brk src/app/app.js

clear-logs:
	rm logs/*
	
site:
	$(SHOWDOWN_BIN) makehtml \
		-i static/privacy-policy.md -o static/privacy-policy-output.html

deploy:
	# test
	gcloud app deploy app.yaml --version=test
	# sudo apt-get install mc fish htop
	#gcloud app deploy

debug:
	DEBUG=root DEBUG_FILE=1 node --inspect-brk src/app/app.js

debug-list-next:
	DEBUG=record-diffs,google,gmail-root,gtasks-root,gmail-query-next\*,gmail-list-next\*,gtasks-list-next\*,\*-error \
		DEBUG_FILE=1 \
		DEBUG_AM=1 \
		node --inspect src/app/app.js
		#node --inspect-brk src/app/app.js

debug-gmail:
	DEBUG=record-diffs,google,gmail-root,gmail-verbose,\*-error,gtasks \
		DEBUG_FILE=1 \
		DEBUG_AM=1 \
		node --inspect src/app/app.js

format:
	prettier --config package.json --write *.ts
	prettier --config package.json --write src/*.ts
	prettier --config package.json --write src/**/*.ts
	prettier --config package.json --write src/**/**/*.ts

am-types:
	mkdir -p typings/machines/sync
	mkdir -p typings/machines/google/gmail
	mkdir -p typings/machines/google/tasks

	$(AM_TYPES_BIN) src/sync/reader.js -e sync_reader_state \
		-o typings/machines/sync/reader.ts
	$(AM_TYPES_BIN) src/sync/writer.js -e sync_writer_state \
		-o typings/machines/sync/writer.ts
	$(AM_TYPES_BIN) src/sync/root.js -e sync_state \
		-o typings/machines/sync/root.ts

	$(AM_TYPES_BIN) src/google/sync.js -e sync_state \
		-o typings/machines/google/sync.ts
	$(AM_TYPES_BIN) src/google/auth.json \
		-o typings/machines/google/auth.ts

	$(AM_TYPES_BIN) src/google/tasks/sync.js -e sync_state \
		-o typings/machines/google/tasks/sync.ts
	$(AM_TYPES_BIN) src/google/tasks/sync-list.js -e sync_state \
		-o typings/machines/google/tasks/sync-list.ts

	$(AM_TYPES_BIN) src/google/gmail/sync-list.js -e sync_state \
		-o typings/machines/google/gmail/sync-list.ts
	$(AM_TYPES_BIN) src/google/gmail/sync.js -e sync_state \
		-o typings/machines/google/gmail/sync.ts
	$(AM_TYPES_BIN) src/google/gmail/query.js -e sync_state \
		-o typings/machines/google/gmail/query.ts

npmi:
	npm i
	npm link asyncmachine
	npm link ami-logger

.PHONY: test break build
