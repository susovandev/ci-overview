# Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies for build
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build



# Runtime Stage
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production


# Create non-root user
RUN addgroup -S app \
 && adduser -S app -G app


# Install prod deps only
COPY package*.json ./
RUN npm ci --omit=dev \
 && npm cache clean --force


# Copy build artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public


# Create runtime dirs
RUN mkdir -p /app/logs \
 && chown -R app:app /app


# Drop root privileges
USER app

# Port exposed
EXPOSE 5555

# Run the app
CMD ["node","dist/main.js"]
