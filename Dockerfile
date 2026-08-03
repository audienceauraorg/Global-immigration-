# ── Stage 1: Build the Next.js app ───────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /build

# Install dependencies first (layer cache)
COPY package*.json ./
RUN npm install --legacy-peer-deps --ignore-scripts

# Copy all project files (Next.js app + static site)
COPY . .

# Build the Next.js app (prebuild copies static site into public/)
RUN npm run build

# ── Stage 2: Production image ─────────────────────────────────────────────────
FROM node:20-alpine AS runner

ENV NODE_ENV=production
WORKDIR /app

# Copy runtime files
COPY --from=builder /build/node_modules          ./node_modules
COPY --from=builder /build/.next                 ./.next
COPY --from=builder /build/public                ./public
COPY --from=builder /build/package.json          ./package.json
COPY --from=builder /build/server.js             ./server.js
COPY --from=builder /build/next.config.ts        ./next.config.ts
COPY --from=builder /build/src                   ./src

# Static WordPress site — server.js reads: path.resolve(__dirname, 'Global Immigration Hub')
COPY ["Global Immigration Hub/", "./Global Immigration Hub/"]

EXPOSE 3000

CMD ["node", "server.js"]
