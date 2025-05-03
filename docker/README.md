# Docker Configuration for Pool Tracker

This directory contains Docker configuration files to containerize all components of the Pool Tracker application.

## Directory Structure

- `client/`: Contains Dockerfile and Nginx configuration for the React frontend
- `server/`: Contains Dockerfile for the Node.js backend

## Configuration Files

### Client Configuration

- `Dockerfile`: Multi-stage build that:
  1. Uses Node.js Alpine as the build environment
  2. Builds the React application
  3. Uses Nginx to serve the static files
- `nginx.conf`: Configures Nginx to:
  - Serve the React application
  - Proxy API requests to the backend server
  - Proxy phpMyAdmin requests

### Server Configuration

- `Dockerfile`: Sets up the Node.js environment for the backend API

## Usage

The Docker setup is managed through the main `docker-compose.yml` file in the project root.

### Services

- **client**: React frontend (served via Nginx)
- **server**: Node.js Express backend API
- **db**: MySQL database
- **phpmyadmin**: Web interface for database management

### Environment Variables

All Docker services are configured via environment variables. Make sure to create a proper `.env` file in the project root based on the provided `.env.example` template.

### Starting the Application

From the project root:

```bash
# Build and start all services
make all

# Start services without rebuilding
make start

# Restart all services
make restart

# Stop all services
make stop

# View logs
make logs
```

### Cleaning Up

To remove all containers, volumes, and images:

```bash
make clean
```

## Ports

- Frontend: Defined in `.env` as `CLIENT_PORT`
- Backend API: Defined in `.env` as `SERVER_PORT`
- MySQL: Defined in `.env` as `MYSQL_PORT` 
- phpMyAdmin: 8080

## Data Persistence

The MySQL data is persisted in a Docker volume at `./db/`.

## Network

All services are connected to a custom `pool-tracker-network` bridge network for internal communication.