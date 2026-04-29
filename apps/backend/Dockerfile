# ─── STAGE 1: Builder ─────────────────────────────────────────────────────────
# We use Node 20 Alpine (Alpine = tiny Linux, keeps image small)
FROM node:20-alpine AS builder

# Set working directory inside the container
WORKDIR /app

# Copy package files first — Docker caches this layer
# If package.json hasn't changed, Docker skips npm install on next build (faster)
COPY package*.json ./

# Install ALL dependencies (including devDependencies for TypeScript compile)
RUN npm ci

# Copy all source code
COPY . .

# Compile TypeScript → JavaScript
RUN npm run build

# ─── STAGE 2: Production ──────────────────────────────────────────────────────
# Fresh image — we only copy what we need to RUN the app, not build it
FROM node:20-alpine AS production

# Security best practice: don't run as root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies (no TypeScript, no nodemon etc.)
RUN npm ci --only=production

# Copy compiled JavaScript from the builder stage
COPY --from=builder /app/dist ./dist

# Switch to non-root user
USER appuser

# Tell Docker this app uses port 5000
EXPOSE 5000

# Health check — Docker will ping this every 30s to know if app is healthy
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

# Start the compiled app
CMD ["node", "dist/index.js"]