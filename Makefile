# NODE = node --harmony
NODE = ~/.nvm/v0.11.13/bin/node --harmony
NODE_DEBUG = node debug --harmony
MOCHA = node_modules/.bin/mocha
BUILDER = node_modules/contracts.coffee/bin/coffee
COFFEE = node_modules/contracts.coffee/bin/coffee
# CCOFFEE = node_modules/compiled-coffee/bin/ccoffee
CCOFFEE = node_modules/compiled-coffee/bin/ccoffee-osx

TESTS = build/vanilla/test/bootstrap.js

RUN = ~/node_modules/.bin/runjs

POST_PARAMS = -r should \
		-R spec

LIVE = buzz

build-proto-gmail:
	# build without contracts
	$(COFFEE) -cw \
		-o prototypes/gmail/build \
		prototypes/gmail/*.coffee &
	# build with contracts
	$(COFFEE) -Ccw \
		-o prototypes/gmail/build-ctrs \
		prototypes/gmail/*.coffee

run-proto-gmail:
	node-dev --harmony prototypes/gmail/build/updates.js

run-proto-gmail-ctrs:
	node-dev --harmony prototypes/gmail/build-ctrs/updates.js

break:
	$(NODE) --debug-brk \
		$(MOCHA) \
		$(TESTS) \
		$(POST_PARAMS) \
		--timeout 600000

break-live:
	$(LIVE) $(NODE) --debug-brk \
		$(MOCHA) \
		$(TESTS) \
		$(POST_PARAMS) \
		--timeout 600000

debug:
	$(NODE) --debug-brk build/app.js

run:
	$(NODE) build/app.js
	
# TODO debug-watch

test:
	$(NODE) \
		$(MOCHA) \
		$(TESTS) \
		$(POST_PARAMS)

test-live:
	$(RUN) \
		$(MOCHA) \
		$(TESTS) \
		$(POST_PARAMS)

build-deps:
	make -C node_modules/jsprops

build:
	$(CCOFFEE) \
		--yield \
		-o build/ \
		-i src/

build-watch:
	$(CCOFFEE) \
		--watch \
		--yield \
		-o build/ \
		-i src/

build-contracts-live:
	$(BUILDER) \
		--contracts \
		-o build/vanilla \
		-cw build/vanilla-sources

# TODO build-contracts build-contracts-live

.PHONY: test break build