# Multi-stage build for frontend
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build React application
RUN npm run build

# Production stage - serve with node
FROM node:18-alpine

WORKDIR /app

# Install serve to run production build
RUN npm install -g serve

# Copy built application from builder
COPY --from=builder /app/build ./build

# Copy package.json for reference
COPY --from=builder /app/package.json ./

# Expose port
EXPOSE 3000

# Start application - serve the build directory
CMD ["serve", "-s", "build", "-l", "3000"]
