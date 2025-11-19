# Minimal maintenance commands for this Jekyll blog
.PHONY: help install build serve clean pre-commit-check

.DEFAULT_GOAL := help

help:
	@echo "Available targets:"
	@echo "  make install            # Install Ruby gems"
	@echo "  make build              # Build the site once"
	@echo "  make serve              # Run the local dev server"
	@echo "  make clean              # Remove build artifacts"
	@echo "  make pre-commit-check   # Quick build check before committing"

install:
	bundle install

build:
	bundle exec jekyll build

serve:
	bundle exec jekyll serve

clean:
	bundle exec jekyll clean

pre-commit-check:
	@echo "Running a quiet build…"
	@bundle exec jekyll build --quiet
	@echo "All good!"
