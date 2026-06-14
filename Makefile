# Variáveis
DB_CONTAINER = my-house-db

# Sobe os containers em segundo plano
up:
	@echo "Subindo os containers e recriando a build se necessário..."
	docker compose up -d --build

# Derruba os containers
down:
	@echo "Parando e removendo os containers..."
	docker compose down

# Reinicia os containers
restart: down up

# Reconstrói os containers (derruba, remove imagens e faz build novo)
rebuild:
	@echo "Derrubando containers e removendo imagens..."
	docker compose down --rmi all
	@echo "Buildando novos containers com as alterações..."
	docker compose up -d --build

# Mostra os logs do banco de dados em tempo real
logs:
	@echo "Exibindo logs do banco de dados..."
	docker logs -f $(DB_CONTAINER)

# Mostra o status dos containers
status:
	@echo "Status dos containers:"
	docker ps
