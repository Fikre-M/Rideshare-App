# Multi-stage Dockerfile for Rideshare Application - Production Grade 2026

# Stage 1: Builder
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove devDependencies
RUN npm prune --production

# Stage 2: Production Server
FROM nginx:alpine AS production

# Install curl for health checks and security updates
RUN apk add --no-cache \
    curl \
    ca-certificates \
    tzdata && \
    apk upgrade --no-cache

# Set timezone
ENV TZ=UTC

# Copy built application from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create health check endpoint
RUN echo '<!DOCTYPE html><html><body>OK</body></html>' > /usr/share/nginx/html/health

# Create nginx user and set permissions
RUN addgroup -g 1001 -S nginx && \
    adduser -S nginx -u 1001 -G nginx && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Switch to non-root user
USER nginx

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Labels for metadata
LABEL maintainer="devops@rideshare.com" \
      version="1.0" \
      description="AI-powered rideshare platform frontend" \
      org.opencontainers.image.source="https://github.com/your-org/rideshare-app"

# Start nginx
CMD ["nginx", "-g", "daemon off;"]