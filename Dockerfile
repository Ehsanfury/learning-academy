# Dockerfile
# Path: Dockerfile
# Description: Multi-stage Dockerfile for production
# Version: 2.0 - Improved with non-root user, npm prune, security
# Features:
# - ✅ Multi-stage build (smaller final image)
# - ✅ Non-root user
# - ✅ npm prune (dev dependencies removed)
# - ✅ Health check
# - ✅ Security hardening
# - ✅ Layer caching optimization
# - ✅ .dockerignore for smaller context

# ============================================
# Stage 1: Build Frontend
# ============================================
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Install dependencies (cached layer)
COPY package*.json ./
RUN npm ci --silent

# Copy frontend config files
COPY index.html vite.config.js tailwind.config.js postcss.config.js jsconfig.json ./

# Copy source
COPY src ./src
COPY public ./public

# Build
RUN npm run build

# ============================================
# Stage 2: Build Backend (install prod deps only)
# ============================================
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

# Install dependencies
COPY backend/package*.json ./
RUN npm ci --silent

# Copy backend source
COPY backend/ .

# Prune to production dependencies only
RUN npm prune --omit=dev

# ============================================
# Stage 3: Production Image
# ============================================
FROM node:18-alpine AS production

# Install required packages
RUN apk --no-cache add curl tini

# Create non-root user
RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup -h /app

# Set working directory
WORKDIR /app

# Copy backend (with production-only node_modules)
COPY --from=backend-builder --chown=appuser:appgroup /app/backend ./backend

# Copy frontend build
COPY --from=frontend-builder --chown=appuser:appgroup /app/dist ./frontend

# Copy content (lesson JSONs, etc.)
COPY --chown=appuser:appgroup content ./content

# Create uploads directory
RUN mkdir -p /app/uploads && chown appuser:appgroup /app/uploads

# Create logs directory
RUN mkdir -p /app/logs && chown appuser:appgroup /app/logs

# Set environment
ENV NODE_ENV=production
ENV PORT=5001
ENV NODE_OPTIONS="--max-old-space-size=512"

# Expose port
EXPOSE 5001

# Switch to non-root user
USER appuser

# Health check (with curl)
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:5001/health || exit 1

# Use tini for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start backend
WORKDIR /app/backend
CMD ["node", "server.js"]
