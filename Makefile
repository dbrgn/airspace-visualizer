help:
	@echo "Usage: make <target>"
	@echo ""
	@echo "Available targets: dev, dist"

test:
	wasm-pack test --headless --firefox

build-dev:
	wasm-pack build

build-release:
	wasm-pack build --release

dev: build-dev
	cd www && npm run start

dist: build-release
	cd www && npm run build
	@echo ""
	@echo "Done, you can find the dist bundle in the www/dist/ directory."
