NODE = node --harmony
NODE_DEBUG = node debug --harmony
MOCHA = node_modules/.bin/mocha
BUILDER = node_modules/contracts.coffee/bin/coffee
COFFEE = ./node_modules/contracts.coffee/bin/coffee

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
	node-dev --harmony prototypes/gmail/updates.js

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
	$(NODE_DEBUG) \
		$(MOCHA) \
		$(TESTS) \
		$(POST_PARAMS)

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
	$(BUILDER) \
		-o build/vanilla/ \
		-c build/_sources/

build-contracts:
	$(BUILDER) \
		--contracts \
		-o build/vanilla \
		-c build/vanilla-sources

build-live:
	$(BUILDER) \
		-o build/vanilla \
		-cw build/vanilla-sources

build-contracts-live:
	$(BUILDER) \
		--contracts \
		-o build/vanilla \
		-cw build/vanilla-sources

# TODO build-contracts build-contracts-live

.PHONY: test break build