# ============================================
# REWARD HUNTER BACKEND - Production Dockerfile
# ============================================

FROM node:22-slim

WORKDIR /app

# Install OpenSSL library required by Prisma on Debian slim images
RUN apt-get update -y && apt-get install -y openssl

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including devDeps needed for build)
RUN npm install

# Copy source code
COPY . .

# Build the NestJS application
RUN npm run build

# Verify dist folder exists
RUN ls -la dist/

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/src/main.js"]
