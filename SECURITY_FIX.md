# Security Fix: Stripe API Key Exposure

## Problem
Your Stripe secret key was being embedded into the Docker image during the build process, making it accessible to anyone who could access the Docker image. This is why Stripe flagged your API key as "accessible on the internet."

## What Was Fixed
1. **Removed STRIPE_SECRET_KEY from Docker build process**
2. **Updated all build scripts to exclude secret keys**
3. **Modified CI/CD pipeline to not embed secrets in images**

## Secure Deployment Instructions

### For Production Deployment

1. **Build the new secure Docker image:**
```bash
# This will NOT include your secret key in the image
docker build \
  --build-arg NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_your_publishable_key" \
  --build-arg NEXT_PUBLIC_BASE_URL="https://yourdomain.com" \
  -t your-app:latest .
```

2. **Run the container with secret key as runtime environment variable:**
```bash
docker run -d \
  --name stripe-checkout \
  -p 3000:3000 \
  -e STRIPE_SECRET_KEY="sk_live_your_secret_key" \
  -e NODE_ENV="production" \
  your-app:latest
```

### For Your EC2 Instance

1. **Create a secure environment file on your server:**
```bash
# On your EC2 instance, create a secure .env file
sudo nano /opt/app/.env.production
```

2. **Add your secret key (this file stays on the server only):**
```
STRIPE_SECRET_KEY=sk_live_your_new_secret_key
NODE_ENV=production
```

3. **Set proper permissions:**
```bash
sudo chmod 600 /opt/app/.env.production
sudo chown ubuntu:ubuntu /opt/app/.env.production
```

4. **Run your container with the env file:**
```bash
docker run -d \
  --name stripe-checkout \
  -p 3000:3000 \
  --env-file /opt/app/.env.production \
  sumaiya369/checkout:latest
```

## Immediate Actions Required

1. **Generate a new Stripe API key** (the current one is compromised)
2. **Delete the old API key from Stripe dashboard**
3. **Rebuild and redeploy your Docker image** using the secure method above
4. **Never commit API keys to Git** - they should only exist as runtime environment variables

## Security Best Practices Going Forward

- ✅ Secret keys are provided at runtime only
- ✅ Docker images contain no sensitive data
- ✅ Environment files are secured with proper permissions
- ✅ CI/CD pipeline doesn't embed secrets in images
- ❌ Never put secret keys in Dockerfiles or build args
- ❌ Never commit .env files with real secrets to Git