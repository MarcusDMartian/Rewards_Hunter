# ============================================
# REWARD HUNTER BACKEND - Production Dockerfile
# ============================================
# Multi-stage build: smaller image, dev deps stripped from final layer

# ---------- Stage 1: build ----------
FROM node:22-slim AS builder

WORKDIR /app

# OpenSSL is required by Prisma on Debian slim
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# Cache dependency install when source files change
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Copy and build
COPY . .
RUN npm run build

# Prune dev dependencies for the runtime image
RUN npm prune --omit=dev

# ---------- Stage 2: runtime ----------
FROM node:22-slim AS runtime

ENV NODE_ENV=production \
    PORT=3000

WORKDIR /app

# OpenSSL required at runtime for Prisma engine
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl tini \
    && rm -rf /var/lib/apt/lists/*

# Copy only what we need
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

# Run as a non-root user
RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nodejs \
    && chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000

# tini handles signal forwarding for graceful shutdown
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "dist/src/main.js"]
