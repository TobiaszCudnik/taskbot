NODE = node --harmony
# NODE = ~/.nvm/v0.11.13/bin/node --harmony
NODE_DEBUG = node debug --harmony
MOCHA = node_modules/.bin/mocha
BUILDER = node_modules/contracts.coffee/bin/coffee
COFFEE = coffee
CCOFFEE = node_modules/compiled-coffee/bin/ccoffee
# CCOFFEE = node_modules/compiled-coffee/bin/ccoffee-osx

build-typed:
	$(CCOFFEE) \
		--yield \
		-o build/ \
		-i src/

build-typed-watch:
	$(CCOFFEE) \
		--watch \
		--yield \
		-o build/ \
		-i src/

build-watch:
	$(COFFEE) \
		--watch \
		-o build/ \
		src/ *.coffee

build-watch-maps:
	$(COFFEE) \
		--watch \
		-o build/ \
		-m \
		src/ *.coffee

debug-js:
	forever -c "node --debug-brk --harmony" build/app.js

debug:
	$(COFFEE) --nodejs "--debug-brk --harmony" src/app.coffee

.PHONY: test break build
