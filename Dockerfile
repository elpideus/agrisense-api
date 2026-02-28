# Base image
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production image
FROM node:22-alpine

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Copy start script — strip Windows CRLF in case the file was edited on Windows
COPY start.sh ./start.sh
RUN sed -i 's/\r//' ./start.sh && chmod +x ./start.sh

# Expose the application port (configured via PORT env var, default 3143)
EXPOSE ${PORT:-3143}

# Start server
ENTRYPOINT ["./start.sh"]
CMD ["node", "dist/src/main"]
