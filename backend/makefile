# Build all services
.PHONY: build
build:
	@docker compose build

# Start up all services
.PHONY: up
up:
	@docker compose up -d

# Tear down all services
.PHONY: down
down:
	@docker compose down --volumes
	
.PHONY: ps
ps:
	@docker compose ps

# Remove all older setup and start fresh services
.PHONY: recreate
recreate: down build up ps