#COFFEE = /home/bob/workspace/dropbox/engineer-thesis/node_modules/contracts.coffee/bin/coffee
COFFEE = ./node_modules/.bin/coffee


all: build

build:
	$(COFFEE) -c --contracts -o lib-contracts src
	$(COFFEE) -c -o lib src
	$(COFFEE) -c test

test:
	make build
	./node_modules/.bin/mocha \
		--reporter list \
		test/properties.js \
		test/signals.js


.PHONY: test build