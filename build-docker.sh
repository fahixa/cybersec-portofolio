#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Building CyberSec Portfolio Docker Image${NC}"
echo "=================================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Build the Docker image
echo -e "${YELLOW}📦 Building Docker image...${NC}"
docker build -t cybersec-portfolio:latest . || {
    echo -e "${RED}❌ Docker build failed!${NC}"
    exit 1
}

echo -e "${GREEN}✅ Docker image built successfully!${NC}"

# Show image info
echo -e "${BLUE}📋 Image Information:${NC}"
docker images cybersec-portfolio:latest

echo ""
echo -e "${GREEN}🎉 Build completed successfully!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Import this image to Portainer"
echo "2. Or run locally with: docker run -d -p 3000:80 cybersec-portfolio:latest"
echo "3. Or use docker-compose: docker-compose up -d"