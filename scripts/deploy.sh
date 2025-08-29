#!/bin/bash

# Deployment script for Next.js Stripe Application
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="nextjs-stripe-app"
CONTAINER_NAME="nextjs-stripe-app"
PORT="3000"
DATA_DIR="/opt/app-data"

echo -e "${GREEN}🚀 Starting deployment...${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Load environment variables
if [ -f .env.production ]; then
    echo -e "${YELLOW}📋 Loading production environment variables...${NC}"
    export $(cat .env.production | xargs)
else
    echo -e "${YELLOW}⚠️  No .env.production file found. Using build arguments...${NC}"
fi

# Build Docker image
echo -e "${GREEN}🔨 Building Docker image...${NC}"
# NOTE: STRIPE_SECRET_KEY is NOT included in build - it's provided at runtime for security
docker build \
    --build-arg NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}" \
    --build-arg NEXT_PUBLIC_BASE_URL="${NEXT_PUBLIC_BASE_URL}" \
    -t $IMAGE_NAME .

# Stop existing container
echo -e "${YELLOW}🛑 Stopping existing container...${NC}"
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# Create data directory
echo -e "${GREEN}📁 Creating data directory...${NC}"
mkdir -p $DATA_DIR

# Run new container
echo -e "${GREEN}🏃 Starting new container...${NC}"
docker run -d \
    --name $CONTAINER_NAME \
    --restart unless-stopped \
    -p $PORT:3000 \
    -v $DATA_DIR:/app/data \
    $IMAGE_NAME

# Check if container is running
if docker ps | grep -q $CONTAINER_NAME; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo -e "${GREEN}🌐 Application is running at http://localhost:$PORT${NC}"
    echo -e "${GREEN}📊 Admin panel: http://localhost:$PORT/admin${NC}"
    echo -e "${GREEN}🔑 Default credentials: admin / admin123${NC}"
else
    echo -e "${RED}❌ Deployment failed. Container is not running.${NC}"
    echo -e "${YELLOW}📋 Container logs:${NC}"
    docker logs $CONTAINER_NAME
    exit 1
fi

# Clean up old images
echo -e "${YELLOW}🧹 Cleaning up old images...${NC}"
docker image prune -f

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"