FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN corepack enable pnpm && pnpm install

# Copy source code
COPY . .

# Accept build arguments for environment variables (PUBLIC KEYS ONLY)
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_BASE_URL

# Set environment variables from build args (PUBLIC KEYS ONLY)
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

# NOTE: STRIPE_SECRET_KEY should NEVER be in the Docker image
# It will be provided at runtime via environment variables

# Build the application with environment variables
RUN pnpm run build

# Create data directory and set permissions
RUN mkdir -p /app/data && chown -R node:node /app/data

# Expose port 3000
EXPOSE 3000

# Switch to non-root user for security
USER node

# Start the application
CMD ["pnpm", "start"]