##
## ┌────────────────────────────────────────────────────────────────────────────
## │ @author        Christophe Vandevoir
## ├────────────────────────────────────────────────────────────────────────────
## │ @file          Makefile
## │ @path          Makefile
## │ @description   Docker environment manager
## │ @version       1.1.0
## │
## │ @email         christophe.vandevoir@epitech.eu
## │ @date          2025-05-01
## ├────────────────────────────────────────────────────────────────────────────
## │ @copyright     (c) 2025 Christophe Vandevoir
## └────────────────────────────────────────────────────────────────────────────
##

PROJECT=pooltracker_prod

# Compose files
COMPOSE_PROD	=	docker-compose.yml

# Compose commands
DC	=	docker-compose -p $(PROJECT) -f docker-compose.yml

# Colors
BLUE	=	\033[1;34m
GREEN	=	\033[1;32m
YELLOW	=	\033[1;33m
RED		=	\033[1;31m
RESET	=	\033[0m

.PHONY: help build up down restart logs clean

define step
	@printf "$(BLUE)==> $(1)$(RESET)\n"
endef

define done
	@printf "$(GREEN)[✔] Done.$(RESET)\n"
endef

define loading
	@for i in 1 2 3; do printf "$(YELLOW)."; sleep 0.3; done; printf "$(RESET)\n"
endef

all:
	$(call step,"Building production images...")
	$(DC) build
	$(call done)
	$(call step,"Starting production containers...")
	$(DC) up -d
	$(call done)

# Production
build:
	$(call step,"Building production images...")
	$(DC) build
	$(call done)

build-no-cache:
	$(call step,"Building production images (no cache)...")
	$(DC) build --no-cache
	$(call done)

start:
	$(call step,"Starting production containers...")
	$(DC) up -d
	$(call done)

stop:
	$(call step,"Stopping production containers...")
	$(DC) stop
	$(call done)

down:
	$(call step,"Stopping all containers...")
	$(DC) down
	$(call done)

restart:
	$(call step,"Restarting production containers...")
	$(DC) down
	$(call loading)
	$(DC) up -d --build
	$(call done)

logs:
	$(call step,"Showing logs 'press Ctrl+C to exit'...")
	$(DC) logs -f

# Cleanup
clean:
	$(call step,"Removing containers...")
	$(DC) down -v --rmi all --remove-orphans
	$(call done)

re: clean all

help:
	@echo ""
	@echo "$(YELLOW)📦 Docker Environment Commands:$(RESET)"
	@echo "  $(GREEN)make build$(RESET)     → Build production images"
	@echo "  $(GREEN)make up$(RESET)        → Start production containers"
	@echo "  $(GREEN)make down$(RESET)      → Stop and remove all containers"
	@echo "  $(GREEN)make restart$(RESET)   → Restart production containers"
	@echo "  $(GREEN)make logs$(RESET)      → Show production logs"
	@echo "  $(GREEN)make clean$(RESET)     → Remove volumes/images/orphans"
	@echo ""
