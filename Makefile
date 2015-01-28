BIN = ./node_modules/.bin
uglify = /usr/local/lib/node_modules/uglify-js/bin/uglifyjs

install link:
	@npm $@

lint:
	jsxhint -c .jshintrc ./index.js

patch: 
	lint
	@$(call release,patch)

minor: 
	lint 
	@$(call release,minor)

major: 
	lint 
	@$(call release,major)

v: 
	@(npm view . version)

jsx: 
	lint
	gulp	

publish:
	@$(uglify) index.js > dist/react-stickydiv.min.js
	git commit -am "`npm view . version`" --allow-empty
	git push --tags origin HEAD:master
	npm publish

define release
	npm version $(1)
endef
