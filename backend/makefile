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
	@docker compose down

.PHONY: ps
ps:
	@docker compose ps

.PHONY: remove-data
remove-data:
	@if [ $$(docker volume ls -q -f name=case_service_db.case.formative.aguas.local) ]; then \
		docker volume rm case_service_db.case.formative.aguas.local; \
	else \
		echo "Volume case_service_db.case.formative.aguas.local does not exist, skipping removal"; \
	fi

# Remove all older setup and start fresh services
.PHONY: recreate
recreate: down remove-data build up ps