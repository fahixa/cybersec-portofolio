# 🚀 Fast Deployment Guide

## Quick Docker Build

### 1. Build Image (Fast)
```bash
./build-docker-fast.sh
```

### 2. Run Locally
```bash
# Quick test
docker run -d -p 3000:80 --name cybersec-portfolio cybersec-portfolio:latest

# Or with docker-compose
docker-compose -f docker-compose.fast.yml up -d
```

### 3. Export for Portainer
```bash
docker save cybersec-portfolio:latest > cybersec-portfolio.tar
```

## Portainer Deployment

1. **Import Image**
   - Go to Portainer → Images → Import
   - Upload `cybersec-portfolio.tar`

2. **Create Container**
   - Name: `cybersec-portfolio`
   - Image: `cybersec-portfolio:latest`
   - Port: `3000:80`
   - Restart: `Unless stopped`

3. **Access Application**
   - URL: `http://your-server:3000`
   - Admin: `http://your-server:3000/authorize`

## Admin Credentials
- Email: `fakhrityhikmawan@gmail.com`
- Password: `CyberSec2024!`

## Features
- ✅ Fast build (no TypeScript checking)
- ✅ Optimized nginx config
- ✅ Health check endpoint
- ✅ Production ready
- ✅ Database integration for data persistence

## File Structure
```
cybersec-portfolio/
├── Dockerfile.fast           # Fast build dockerfile
├── docker-compose.fast.yml   # Fast compose config
├── build-docker-fast.sh      # Build script
└── README-DEPLOYMENT.md      # This file
```

## Troubleshooting

### Build fails
```bash
# Check Docker is running
docker info

# Check build logs
./build-docker-fast.sh
```

### Container won't start
```bash
# Check logs
docker logs cybersec-portfolio

# Check health
curl http://localhost:3000/health
```

### Port conflicts
```bash
# Use different port
docker run -d -p 3001:80 cybersec-portfolio:latest
```

---
**🎉 Your CyberSec Portfolio is ready for production!**