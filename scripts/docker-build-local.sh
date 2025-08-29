#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
  export $(cat .env | xargs)
fi

# Build Docker image with PUBLIC environment variables only
# NOTE: STRIPE_SECRET_KEY is NOT included in build - it's provided at runtime
docker build \
  --build-arg NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" \
  --build-arg NEXT_PUBLIC_BASE_URL="$NEXT_PUBLIC_BASE_URL" \
  -t nextjs-stripe-app .