# Base URL Configuration Guide

This guide explains how to configure the correct base URL for your payment links so they work with your actual domain instead of localhost.

## 🎯 The Problem

By default, payment links are generated with `localhost:3000`, which only works locally. When you deploy to production, you need to set the correct domain.

## ✅ Solutions

### Option 1: Environment Variable (Recommended)

Set the `NEXT_PUBLIC_BASE_URL` environment variable to your actual domain:

#### For GitHub Actions Deployment:
Add this secret to your GitHub repository:
```
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

#### For Manual Deployment:
Create `.env.production` file:
```bash
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
```

#### For Docker Run:
```bash
docker run -d \
  --name nextjs-stripe-app \
  -p 3000:3000 \
  -e NEXT_PUBLIC_BASE_URL=https://yourdomain.com \
  -e STRIPE_SECRET_KEY=your_stripe_secret \
  -e NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable \
  your-image-name
```

### Option 2: Automatic Detection (Fallback)

If you don't set `NEXT_PUBLIC_BASE_URL`, the system will automatically detect the URL from:

1. **Vercel**: Uses `VERCEL_URL` environment variable
2. **Railway**: Uses `RAILWAY_PUBLIC_DOMAIN` environment variable  
3. **Render**: Uses `RENDER_EXTERNAL_URL` environment variable
4. **Request Headers**: Detects from incoming HTTP requests
5. **Localhost**: Falls back to `http://localhost:3000` for development

## 🚀 Quick Setup Examples

### For Different Platforms:

#### **Your Own Domain:**
```bash
NEXT_PUBLIC_BASE_URL=https://payments.yourcompany.com
```

#### **Vercel:**
```bash
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
```

#### **Railway:**
```bash
NEXT_PUBLIC_BASE_URL=https://your-app.railway.app
```

#### **DigitalOcean:**
```bash
NEXT_PUBLIC_BASE_URL=https://your-app.ondigitalocean.app
```

#### **Custom Server:**
```bash
NEXT_PUBLIC_BASE_URL=https://your-server-ip:3000
# or with domain
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## 🔧 Testing the Fix

1. **Set your base URL** using one of the methods above
2. **Rebuild and deploy** your application
3. **Create a new payment link** in the admin panel
4. **Check the generated link** - it should now use your domain instead of localhost
5. **Share the link** with someone else to test

## 🐛 Troubleshooting

### Links still show localhost:
- ✅ Check that `NEXT_PUBLIC_BASE_URL` is set correctly
- ✅ Rebuild your Docker image with the new environment variable
- ✅ Restart your container/application
- ✅ Clear any cached payment links and create new ones

### Links show wrong domain:
- ✅ Verify the `NEXT_PUBLIC_BASE_URL` value is correct
- ✅ Make sure there are no trailing slashes: `https://domain.com` not `https://domain.com/`
- ✅ Use `https://` for production, `http://` only for local development

### Environment variable not loading:
- ✅ For Docker: Pass the variable with `-e` flag or in docker-compose
- ✅ For GitHub Actions: Add it to repository secrets
- ✅ For manual deployment: Include in `.env.production` file

## 📝 Example Configurations

### Complete .env.production:
```bash
# Your actual domain
NEXT_PUBLIC_BASE_URL=https://payments.mycompany.com

# Production Stripe keys
STRIPE_SECRET_KEY=sk_live_51ABC123...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51ABC123...

# Environment
NODE_ENV=production
```

### GitHub Secrets Setup:
```
Repository Settings → Secrets and variables → Actions → New repository secret

Name: NEXT_PUBLIC_BASE_URL
Value: https://yourdomain.com

Name: STRIPE_SECRET_KEY  
Value: sk_live_your_actual_stripe_secret_key

Name: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Value: pk_live_your_actual_stripe_publishable_key
```

### Docker Compose Example:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_BASE_URL=https://yourdomain.com
      - STRIPE_SECRET_KEY=sk_live_your_key
      - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
    volumes:
      - ./data:/app/data
```

## ✨ What This Fixes

After setting up the base URL correctly:

- ✅ **Payment links** will use your actual domain
- ✅ **Links work for everyone** who receives them
- ✅ **Professional appearance** with your domain
- ✅ **SSL/HTTPS support** for secure payments
- ✅ **Proper redirects** after payment completion

## 🔄 After Deployment

1. **Test a payment link** end-to-end
2. **Verify SSL certificate** is working
3. **Check admin panel** access
4. **Monitor application** health at `/api/health`

Your payment links should now work perfectly with your actual domain! 🎉