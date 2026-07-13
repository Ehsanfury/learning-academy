# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copy frontend dependencies
COPY package*.json ./
RUN npm ci --silent

# Copy frontend source (excluding backend to preserve cache)
COPY index.html vite.config.js tailwind.config.js postcss.config.js jsconfig.json ./
COPY src ./src
COPY public ./public

# Build frontend
RUN npm run build

# ============================================
# Stage 2: Build Backend (install prod deps only)
# ============================================
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend dependencies
COPY backend/package*.json ./
RUN npm ci --silent

# Copy backend source
COPY backend/ .

# Prune to production dependencies only
RUN npm prune --omit=dev

# ============================================
# Stage 3: Production Image
# ============================================
FROM node:18-alpine

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy backend (with production-only node_modules)
COPY --from=backend-builder --chown=appuser:appgroup /app/backend ./backend

# Copy frontend build
COPY --from=frontend-builder --chown=appuser:appgroup /app/dist ./frontend

# Copy content (lesson JSONs, etc.)
COPY --chown=appuser:appgroup content ./content

# Set environment
ENV NODE_ENV=production
ENV PORT=5001

# Expose port
EXPOSE 5001

# Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/health', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

# Start backend
WORKDIR /app/backend
CMD ["node", "server.js"]
