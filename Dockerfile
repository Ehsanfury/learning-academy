# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copy frontend dependencies
COPY package*.json ./
RUN npm ci --silent

# Copy frontend source
COPY . .

# Build frontend
RUN npm run build

# Stage 2: Build Backend
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend dependencies
COPY backend/package*.json ./
RUN npm ci --silent

# Copy backend source
COPY backend/ .

# Stage 3: Production Image
FROM node:18-alpine

WORKDIR /app

# Install production dependencies
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder /app/backend . ./backend/

# Copy frontend build
COPY --from=frontend-builder /app/dist ./frontend

# Copy content
COPY content ./content

# Set environment
ENV NODE_ENV=production
ENV PORT=5001

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/health', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

# Start backend
WORKDIR /app/backend
CMD ["node", "server.js"]