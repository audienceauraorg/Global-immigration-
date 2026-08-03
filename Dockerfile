# ── Stage 1: Build the Next.js app ───────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /build

# Copy Next.js project files
COPY global-immigration-hub/package*.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY global-immigration-hub/ ./

# Build the Next.js app (output goes to .next/)
RUN npm run build

# ── Stage 2: Production image ─────────────────────────────────────────────────
FROM node:20-alpine AS runner

ENV NODE_ENV=production
WORKDIR /app

# ── Next.js app ───────────────────────────────────────────────────────────────
# Copy only what's needed to run in production
COPY --from=builder /build/node_modules       ./node_modules
COPY --from=builder /build/.next              ./.next
COPY --from=builder /build/public             ./public
COPY --from=builder /build/package.json       ./package.json
COPY --from=builder /build/server.js          ./server.js
COPY --from=builder /build/next.config.ts     ./next.config.ts
COPY --from=builder /build/src                ./src

# ── Static WordPress site (sibling directory) ─────────────────────────────────
# server.js references: path.resolve(__dirname, '..', 'Global Immigration Hub')
# In the container __dirname is /app, so the static site must be at /Global Immigration Hub
COPY "Global Immigration Hub/" "/Global Immigration Hub/"

EXPOSE 3000

CMD ["node", "server.js"]
