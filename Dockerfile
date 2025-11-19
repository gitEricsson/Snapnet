# Builder: install all deps (including dev) and build the app
FROM node:18-alpine AS builder
WORKDIR /usr/src/app

# Add ca-certificates for some libs if needed
RUN apk add --no-cache python3 make g++ ca-certificates

# Copy package files and install all deps (dev + prod) for build/migration targets
COPY package*.json ./
COPY package-lock.json ./
RUN npm ci

# Copy source and build
COPY tsconfig*.json ./
COPY tsconfig.build.json ./
COPY src ./src
COPY nest-cli.json ./
RUN npm run build

# Migrator target: contains source + dev deps so we can run TS migrations inside container
FROM node:18-alpine AS migrator
WORKDIR /usr/src/app
RUN apk add --no-cache python3 make g++ ca-certificates
COPY package*.json ./
COPY package-lock.json ./
# install all deps (including dev) so ts-node & tsconfig are available
RUN npm ci
COPY tsconfig*.json ./
COPY tsconfig.build.json ./
COPY src ./src
COPY nest-cli.json ./
COPY ormconfig.js ./
# default command is to run migrations (can be overridden)
CMD ["npm", "run", "migration:run"]

# Runtime image: prod-only, copy compiled artefacts
FROM node:18-alpine AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production
# install only production deps
COPY package*.json ./
RUN npm ci --omit=dev
# Copy built dist from builder
COPY --from=builder /usr/src/app/dist ./dist
# Copy any runtime config/orm files if needed
COPY ormconfig.js ./

EXPOSE 3000
CMD ["node", "dist/main.js"]