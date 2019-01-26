AM_TYPES_BIN = node_modules/asyncmachine/bin/am-types.js
SHOWDOWN_BIN = node_modules/showdown/bin/showdown.js

compile:
	node_modules/.bin/tsc --pretty --noEmit

compile-watch:
	node_modules/.bin/tsc --pretty --watch --noEmit

clean-www-cache:
	rm -rf www/node_modules/.cache/babel-loader/*

build:
	-node_modules/.bin/tsc
	make build-www

build-www:
	make clean-www-cache
	cd www && NODE_ENV=production node_modules/.bin/next build

build-watch:
	node_modules/.bin/tsc --watch

start:
	DEBUG_FILE=1 \
		DEBUG=root:\*-info,\*-error,app-info \
		node src/app/bootstrap.js

start-production-env:
	# forcing production
	NODE_ENV=production TB_ENV=production \
		DEBUG_FILE=1 \
		DEBUG=root:\*-info,\*-error,app-info \
		node src/app/bootstrap.js

start-staging-env:
	# forcing staging
	NODE_ENV=production TB_ENV=staging \
		DEBUG_FILE=1 \
		DEBUG=root:\*-info,\*-error,app-info \
		node src/app/bootstrap.js

start-am:
	DEBUG=\*-error,connections-verbose,db-diff,record-diff-verbose,root:\*-info,gmail-root,gtasks-root,\*inbox-labels\*,\*task-labels\*,\*gmail\*pending\*,\*next\*,\*-am \
		DEBUG_FILE=1 \
		DEBUG_AM=1 \
		node --inspect \
		src/app/bootstrap.js

start-verbose:
	DEBUG=\*-error,\*-verbose,root:\*-info,gmail-root,gtasks-root,record-diff-verbose \
		DEBUG_FILE=1 \
		DEBUG_AM=1 \
		node --inspect \
		src/app/bootstrap.js

start-ami:
	DEBUG=root:\*-info,gmail-root,gtasks DEBUG_FILE=1 DEBUG_AMI=1 DEBUG_AM=1 \
		node --inspect src/app/bootstrap.js
		#node --inspect-brk src/app/bootstrap.js

start-inspect:
	DEBUG=root node --inspect src/app/bootstrap.js

start-am-heartbeat:
	@echo 'Start with expressive logging for HeartBeat with the --inspect flag'
	# connections-verbose,
	DEBUG=root\*,gmail-root,gtasks-root,\*-am,\*-error,gmail-query-next\* \
		DEBUG_FILE=1 \
		DEBUG_AM=3 \
		node --inspect src/app/bootstrap.js
		#node --inspect-brk src/app/bootstrap.js

start-www:
	cd www && npm run dev

clear-logs:
	rm logs/*

site:
	$(SHOWDOWN_BIN) makehtml \
		-i static/privacy-policy.md -o static/privacy-policy-output.html

deploy-production:
	# TODO switch to the correct project
	make build-www
	gcloud app deploy configs/production.yaml --version=production
	# sudo docker exec -t -i gaeapp /bin/bash
	# sudo apt-get install mc fish htop
	# kill -HUP 1

deploy-staging:
	# TODO switch to the correct project
	make build-www
	gcloud app deploy configs/staging.yaml --version=staging
	# sudo docker exec -t -i gaeapp /bin/bash
	# sudo apt-get install mc fish htop
	# kill -HUP 1

debug:
	DEBUG=root DEBUG_FILE=1 node --inspect-brk src/app/bootstrap.js

debug-list-next:
	DEBUG=google\*-info,gmail-root\*-info,gtasks-root\*-info,gmail-query-next\*,gmail-list-next\*,gtasks-list-next\*,\*-error,db-diff,record-diff-verbose \
		DEBUG_FILE=1 \
		DEBUG_AM=1 \
		node --inspect src/app/bootstrap.js
		#node --inspect-brk src/app/bootstrap.js

debug-gmail:
	DEBUG=record-diff-verbose,google,gmail-root,gmail-verbose,\*-error,gtasks \
		DEBUG_FILE=1 \
		DEBUG_AM=1 \
		node --inspect src/app/bootstrap.js

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

test:
	-SCENARIO=0 npx jest gmail
	sleep 30
	-SCENARIO=1 npx jest gmail
	sleep 30
	-SCENARIO=2 npx jest gmail
	sleep 30
	-SCENARIO=0 npx jest gtasks
	sleep 30
	-SCENARIO=1 npx jest gtasks
	sleep 30
	-SCENARIO=2 npx jest gtasks
	sleep 30
	-SCENARIO=0 npx jest sync
	sleep 5
	-SCENARIO=1 npx jest sync
	sleep 5
	-SCENARIO=2 npx jest sync

fix-lucene:
	# lucene is an optional dep and doesnt support the regexp query syntax
	rm -Rf node_modules/lucene
	rm -Rf node_modules/lucene-queryparser

test-mocks:
	make fix-lucene
	SCENARIO=0 \
		DEBUG=tests,google\*-info,gmail-root\*-info,gtasks-root\*-info,gmail-query-next\*,gmail-list-next\*,gtasks-list-next\*,\*-error,db\*,label-filter-\*,\*inbox-labels\*,root:\* \
		DEBUG_FILE=1 \
		DEBUG_AM=1 \
		node \
		./node_modules/jest/bin/jest.js \
		mocks

test-gtasks-mocked:
	make fix-lucene
	DEBUG=root:\*-info,\*-error,app-info,\*-am \
		MOCK=true \
		npx jest \
			gtasks

.PHONY: test break build
