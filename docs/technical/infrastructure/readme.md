# Infrastructure

This section documents the Docker and deployment configuration for StoryMaps.

## Overview

The application uses Docker containers to package the frontend, backend, and database. Docker Compose orchestrates the services together.

## Services

| Service | Container | Port | Description |
|---------|-----------|------|-------------|
| client | Angular app | 80/443 | Frontend web server |
| server | Express API | 3000 | Backend REST API |
| nginx | Reverse proxy | 80 | Routes requests to client and server |

## Docker Files

### Client Dockerfile

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist/client /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Server Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/ ./

# Create database directory
RUN mkdir -p /app/data

EXPOSE 3000
CMD ["node", "src/index.js"]
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name localhost;

    # Frontend
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://server:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Docker Compose

```yaml
version: '3.8'

services:
  server:
    build:
      context: .
      dockerfile: docker/Dockerfile.server
    volumes:
      - ./server/data:/app/data
    environment:
      - NODE_ENV=production
      - PORT=3000
    networks:
      - storymaps-network

  client:
    build:
      context: .
      dockerfile: docker/Dockerfile.client
    ports:
      - "8080:80"
    depends_on:
      - server
    networks:
      - storymaps-network

networks:
  storymaps-network:
    driver: bridge
```

## Running with Docker

### Development

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production

```bash
# Build production images
docker-compose -f docker-compose.yml build

# Start services
docker-compose -f docker-compose.yml up -d
```

## Volume Mounts

- `./server/data:/app/data` - Persists SQLite database

## Network

All services communicate on the `storymaps-network` bridge network:
- Client accesses server via `http://server:3000`
- Nginx proxies `/api/` requests to server