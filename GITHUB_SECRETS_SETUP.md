# GitHub Secrets Setup for Secure Deployment

## Required GitHub Repository Secrets

You need to add these secrets to your GitHub repository for the CI/CD pipeline to work securely:

### Go to: Repository → Settings → Secrets and variables → Actions

Add the following secrets:

## 1. Docker Hub Credentials
```
DOCKER_USERNAME = your_dockerhub_username
DOCKER_PASSWORD = your_dockerhub_password_or_token
```

## 2. Stripe Configuration (PUBLIC ONLY in CI/CD)
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_your_publishable_key
NEXT_PUBLIC_BASE_URL = https://yourdomain.com
```

## 3. Deployment Configuration
```
DEPLOY_HOST = your-ec2-ip-address (e.g., ec2-35-153-55-84.compute-1.amazonaws.com)
EC2_SSH_KEY = your_private_ssh_key_content
STRIPE_SECRET_KEY = sk_live_your_new_secret_key
```

## Setting up EC2_SSH_KEY Secret

1. **Copy your private key content:**
```bash
# On your local machine, copy the entire content of your .pem file
cat checkout.pem
```

2. **Add to GitHub Secrets:**
   - Copy the ENTIRE content including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`
   - Paste it as the value for `EC2_SSH_KEY` secret

## Setting up STRIPE_SECRET_KEY Secret

⚠️ **IMPORTANT**: This should be your NEW secret key (not the compromised one)

1. **Generate a new Stripe secret key:**
   - Go to Stripe Dashboard → Developers → API Keys
   - Delete the old compromised key
   - Create a new secret key

2. **Add to GitHub Secrets:**
   - Copy the new secret key (starts with `sk_live_` or `sk_test_`)
   - Add it as `STRIPE_SECRET_KEY` secret

## How the Secure Deployment Works

1. **Build Phase**: 
   - Docker image is built WITHOUT any secret keys
   - Only public keys are embedded in the image

2. **Deploy Phase**:
   - Connects to your EC2 instance via SSH
   - Creates a secure environment file on the server
   - Runs the container with the secret key as a runtime environment variable
   - The secret key never leaves GitHub's secure environment

## Verification

After setting up all secrets, push a commit to the `master` branch and check:

1. **GitHub Actions tab** - both build and deploy jobs should succeed
2. **Your EC2 instance** - new container should be running
3. **Your application** - should work with the new secret key
4. **Stripe Dashboard** - should show API calls from the new key

## Security Benefits

✅ Secret keys are never embedded in Docker images
✅ Secret keys are only stored in GitHub's secure secrets
✅ Secret keys are only present on your server at runtime
✅ Automatic deployment without manual intervention
✅ Old containers are automatically cleaned up