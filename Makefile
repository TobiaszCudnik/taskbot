
compile:
	node_modules/.bin/tsc --pretty

compile-watch:
	node_modules/.bin/tsc --pretty --watch

.PHONY: test break build
