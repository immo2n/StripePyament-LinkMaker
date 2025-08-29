# Deployment Guide

This guide covers multiple deployment options for your Next.js Stripe Custom Checkout application.

## 🚀 Quick Deployment Options

### 1. GitHub Actions (Recommended)

#### Prerequisites
- GitHub repository
- Server with Docker installed
- Domain name (optional)

#### Setup Steps

1. **Add GitHub Secrets** (See GITHUB_SECRETS_SETUP.md for detailed instructions)
   Go to your GitHub repository → Settings → Secrets and variables → Actions

   Required secrets:
   ```
   # Docker Hub
   DOCKER_USERNAME=your_dockerhub_username
   DOCKER_PASSWORD=your_dockerhub_password
   
   # Public Configuration (safe to include in build)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
   NEXT_PUBLIC_BASE_URL=https://yourdomain.com
   
   # Deployment Configuration
   DEPLOY_HOST=your-ec2-ip-or-domain
   EC2_SSH_KEY=your_private_ssh_key_content
   
   # Secret Key (NEVER included in Docker image - runtime only)
   STRIPE_SECRET_KEY=sk_live_your_NEW_secret_key
   ```

   ⚠️ **SECURITY**: The STRIPE_SECRET_KEY is NEVER embedded in the Docker image. It's only provided at runtime on your server.

2. **Push to main branch**
   ```bash
   git add .
   git commit -m "Setup deployment"
   git push origin main
   ```

3. **Monitor deployment**
   - Go to Actions tab in your GitHub repository
   - Watch the deployment progress
   - Access your app at `http://your-server:3000`

### 2. Manual Docker Deployment

#### On your server:

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/your-repo.git
   cd your-repo
   ```

2. **Create production environment file**
   ```bash
   cp .env.production.example .env.production
   # Edit .env.production with your actual values
   nano .env.production
   ```

3. **Run deployment script**
   ```bash
   chmod +x scripts/deploy.sh
   ./scripts/deploy.sh
   ```

### 3. Docker Compose (Advanced)

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      args:
        STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    restart: unless-stopped
    environment:
      - NODE_ENV=production

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
```

Deploy with:
```bash
docker-compose up -d
```

## 🌐 Platform-Specific Deployments

### Vercel (Easiest for Next.js)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Add environment variables in Vercel dashboard**

### Railway

1. **Connect GitHub repository**
2. **Add environment variables**
3. **Deploy automatically on push**

### DigitalOcean App Platform

1. **Create new app from GitHub**
2. **Configure build settings**
3. **Add environment variables**
4. **Deploy**

## 🔧 Server Setup

### Ubuntu/Debian Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Setup firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000
sudo ufw --force enable

# Create app directory
sudo mkdir -p /opt/nextjs-stripe-app
sudo chown $USER:$USER /opt/nextjs-stripe-app
```

## 🔒 SSL/HTTPS Setup

### Using Nginx + Let's Encrypt

1. **Install Certbot**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Create Nginx config** (`/etc/nginx/sites-available/your-domain`)
   ```nginx
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Enable site and get SSL**
   ```bash
   sudo ln -s /etc/nginx/sites-available/your-domain /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

## 📊 Monitoring & Maintenance

### Health Check Script
```bash
#!/bin/bash
# health-check.sh

if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ App is healthy"
else
    echo "❌ App is down, restarting..."
    docker restart nextjs-stripe-app
fi
```

### Backup Script
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups"
mkdir -p $BACKUP_DIR

# Backup data directory
tar -czf $BACKUP_DIR/app-data-$DATE.tar.gz /opt/app-data/

# Keep only last 7 days of backups
find $BACKUP_DIR -name "app-data-*.tar.gz" -mtime +7 -delete
```

### Crontab Setup
```bash
# Add to crontab (crontab -e)
*/5 * * * * /path/to/health-check.sh
0 2 * * * /path/to/backup.sh
```

## 🐛 Troubleshooting

### Common Issues

1. **Container won't start**
   ```bash
   docker logs nextjs-stripe-app
   ```

2. **Port already in use**
   ```bash
   sudo lsof -i :3000
   sudo kill -9 <PID>
   ```

3. **Permission issues with data directory**
   ```bash
   sudo chown -R 1001:1001 /opt/app-data
   ```

4. **Environment variables not loading**
   - Check if secrets are properly set in GitHub
   - Verify .env.production file exists and has correct format

### Logs and Debugging

```bash
# View container logs
docker logs -f nextjs-stripe-app

# Access container shell
docker exec -it nextjs-stripe-app /bin/sh

# Check container resource usage
docker stats nextjs-stripe-app
```

## 🔄 Updates and Rollbacks

### Update Application
```bash
git pull origin main
./scripts/deploy.sh
```

### Rollback to Previous Version
```bash
# List available images
docker images

# Run previous version
docker run -d --name nextjs-stripe-app-rollback -p 3001:3000 <previous-image-id>

# Switch traffic after testing
docker stop nextjs-stripe-app
docker rename nextjs-stripe-app nextjs-stripe-app-old
docker rename nextjs-stripe-app-rollback nextjs-stripe-app
```

## 📈 Performance Optimization

### Production Optimizations

1. **Enable compression in Nginx**
2. **Use CDN for static assets**
3. **Implement Redis for session storage**
4. **Set up database connection pooling**
5. **Configure proper caching headers**

### Monitoring Tools

- **Uptime monitoring**: UptimeRobot, Pingdom
- **Error tracking**: Sentry
- **Performance**: New Relic, DataDog
- **Logs**: ELK Stack, Grafana

---

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review container logs
3. Verify environment variables
4. Check server resources (disk space, memory)
5. Ensure all required ports are open

For additional help, create an issue in the GitHub repository with:
- Error messages
- Container logs
- Server specifications
- Deployment method used