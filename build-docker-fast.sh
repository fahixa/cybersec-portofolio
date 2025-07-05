#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Fast Docker Build - CyberSec Portfolio${NC}"
echo "=============================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Build with fast Dockerfile
echo -e "${YELLOW}🐳 Building Docker image (fast mode)...${NC}"
docker build -f Dockerfile.fast -t cybersec-portfolio:latest . || {
    echo -e "${RED}❌ Docker build failed!${NC}"
    exit 1
}

echo -e "${GREEN}✅ Docker image built successfully!${NC}"

# Show image info
echo -e "${BLUE}📋 Image Information:${NC}"
docker images cybersec-portfolio:latest

echo ""
echo -e "${GREEN}🎉 Fast build completed!${NC}"
echo ""
echo -e "${YELLOW}📦 Quick commands:${NC}"
echo "docker run -d -p 3000:80 --name cybersec-portfolio cybersec-portfolio:latest"
echo "docker-compose -f docker-compose.fast.yml up -d"
echo ""
echo -e "${YELLOW}📦 Export for Portainer:${NC}"
echo "docker save cybersec-portfolio:latest > cybersec-portfolio.tar"