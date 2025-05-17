.PHONY: help install dev build test lint format clean docker-up docker-down docker-restart docker-logs docker-bash setup-db migrate seed

# Colors
GREEN  := $(shell tput -Txterm setaf 2)
YELLOW := $(shell tput -Txterm setaf 3)
WHITE  := $(shell tput -Txterm setaf 7)
RESET  := $(shell tput -Txterm sgr0)

TARGET_MAX_CHAR_NUM=20

## Show help
display_help:
	@echo ''
	@echo 'Usage:'
	@echo '  ${YELLOW}make${RESET} ${GREEN}<target>${RESET}'
	@echo ''
	@echo 'Targets:'
	@awk '/^[a-zA-Z\-\_0-9]+:/ { \
		helpMessage = match(lastLine, /^## (.*)/); \
		if (helpMessage) { \
			helpCommand = substr($$1, 0, index($$1, ":")); \
			helpMessage = substr(lastLine, RSTART + 3, RLENGTH); \
			printf "  ${YELLOW}%-$(TARGET_MAX_CHAR_NUM)s${RESET} ${GREEN}%s${RESET}\n", helpCommand, helpMessage; \
		} \
	} \
	{ lastLine = $$0 }' $(MAKEFILE_LIST) | sort

## Install dependencies
install:
	npm install --workspaces

## Start development servers
dev:
	docker-compose up -d
	@echo "${GREEN}🚀 Development servers started!${RESET}"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend API: http://localhost:3001/api"
	@echo "Mongo Express: http://localhost:8081"

## Build for production
build:
	npm run build --workspaces

## Run tests
test:
	npm test --workspaces

## Lint code
lint:
	npm run lint --workspaces

## Format code
format:
	npm run format --workspaces

## Clean build artifacts
clean:
	npm run clean --workspaces
	rm -rf node_modules
	rm -rf **/node_modules
	rm -rf **/dist
	rm -rf **/.next
	rm -rf coverage

## Start Docker containers
docker-up:
	docker-compose up -d

## Stop Docker containers
docker-down:
	docker-compose down

## Restart Docker containers
docker-restart:
	docker-compose restart

## Show Docker logs
DOCKER_SERVICE ?= backend
docker-logs:
	docker-compose logs -f $(DOCKER_SERVICE)

## Open bash in a container
DOCKER_SERVICE ?= backend
docker-bash:
	docker-compose exec $(DOCKER_SERVICE) /bin/sh

## Setup database
setup-db:
	docker-compose exec mongodb mongosh astrobalendar /docker-entrypoint-initdb.d/mongo-init.js

## Run database migrations
migrate:
	npm run migrate --workspace=backend

## Seed database with test data
seed:
	npm run seed --workspace=backend

## Show help by default
help: display_help

## Default target
.DEFAULT_GOAL := help
