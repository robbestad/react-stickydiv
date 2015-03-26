BIN = ./node_modules/.bin
uglify = /usr/local/lib/node_modules/uglify-js/bin/uglifyjs

install link:
	@npm $@

lint:
	./node_modules/.bin/eslint index.jsx

patch: 
	lint
	@$(call release,patch)

minor: 
	lint 
	@$(call release,minor)

major: 
	lint 
	@$(call release,major)

jsx: 
	@$(call lint)
	gulp	
	@$(uglify) index.js > dist/react-stickydiv.min.js

publish:
	@$(call jsx)
	@(sh bin/authors)
	@$(uglify) index.js > dist/react-stickydiv.min.js
	git commit -am "`npm view . version`" --allow-empty
	@$(call release,patch)
	git push --tags origin HEAD:master
	npm publish

define release
	npm version $(1)
endef
