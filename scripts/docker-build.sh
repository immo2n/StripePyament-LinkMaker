#!/bin/bash

# Docker build script for Next.js Stripe Payment System
echo "🚀 Building Next.js Stripe Payment System Docker Image..."

# Build the Docker image
docker build -t nextjs-stripe-payment:latest .

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully!"
    echo "📦 Image name: nextjs-stripe-payment:latest"
    
    # Show image size
    echo "📊 Image size:"
    docker images nextjs-stripe-payment:latest
    
    echo ""
    echo "🎯 To run the container:"
    echo "docker run -p 3000:3000 --env-file .env.production nextjs-stripe-payment:latest"
    echo ""
    echo "🐳 Or use docker-compose:"
    echo "docker-compose up -d"
else
    echo "❌ Docker build failed!"
    exit 1
fi