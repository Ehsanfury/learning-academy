# ============================================
# 🐳 Dockerfile - Learning Academy
# ============================================

# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Backend
FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm ci --production

COPY backend/ ./backend/
COPY --from=frontend-builder /app/dist ./backend/public

WORKDIR /app/backend

EXPOSE 5001

CMD ["node", "server.js"]