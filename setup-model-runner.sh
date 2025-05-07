#!/bin/bash

# Setup script for Docker Model Runner integration with Company Style Converter

# Text formatting
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BOLD}Company Style Converter - Docker Model Runner Setup${NC}\n"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed.${NC}"
    echo "Please install Docker Desktop first (version 4.40 or later required)."
    exit 1
fi

# Check Docker version
DOCKER_VERSION=$(docker --version | awk '{print $3}' | sed 's/,//')
echo -e "Detected Docker version: ${BOLD}${DOCKER_VERSION}${NC}"

# Check if Docker Desktop is running
if ! docker info &> /dev/null; then
    echo -e "${YELLOW}Warning: Docker Desktop does not appear to be running.${NC}"
    echo "Please start Docker Desktop and run this script again."
    exit 1
fi

echo -e "\n${BOLD}Step 1: Enabling Docker Model Runner${NC}"
echo "Attempting to enable Docker Model Runner..."

# Try to enable Model Runner
if docker desktop enable model-runner --tcp 12434 2>/dev/null; then
    echo -e "${GREEN}Successfully enabled Docker Model Runner with TCP support on port 12434.${NC}"
else
    echo -e "${YELLOW}Could not enable Docker Model Runner via CLI.${NC}"
    echo "Please enable it manually in Docker Desktop:"
    echo "1. Open Docker Desktop"
    echo "2. Go to Settings > Features in Development"
    echo "3. Enable 'Docker Model Runner'"
    echo "4. Optional: Enable 'Host-side TCP support' (port: 12434)"
    echo "5. Click 'Apply & Restart'"
    
    read -p "Press Enter once you've enabled Docker Model Runner..." 
fi

echo -e "\n${BOLD}Step 2: Checking Docker Model Runner status${NC}"
if docker model status 2>/dev/null | grep -q "Docker Model Runner is running"; then
    echo -e "${GREEN}Docker Model Runner is running.${NC}"
else
    echo -e "${YELLOW}Docker Model Runner does not appear to be running.${NC}"
    echo "Please make sure it's properly enabled in Docker Desktop and try again."
    exit 1
fi

echo -e "\n${BOLD}Step 3: Downloading required AI model${NC}"
echo "Downloading ai/llama3.2:1B-Q8_0 model (this may take a while)..."
if docker model pull ai/llama3.2:1B-Q8_0; then
    echo -e "${GREEN}Successfully downloaded the model.${NC}"
else
    echo -e "${RED}Failed to download the model.${NC}"
    echo "Please check your internet connection and try again."
    exit 1
fi

echo -e "\n${BOLD}Step 4: Verifying available models${NC}"
docker model ls

echo -e "\n${BOLD}Step 5: Setting up environment${NC}"
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo -e "${GREEN}Created .env file.${NC}"
else
    echo -e "${YELLOW}The .env file already exists. Make sure it has the correct Model Runner settings:${NC}"
    echo "MODEL_RUNNER_HOST=model-runner.docker.internal"
    echo "MODEL_RUNNER_PORT=80"
    echo "MODEL_RUNNER_ENGINE=llama.cpp"
    echo "DEFAULT_MODEL=ai/llama3.2:1B-Q8_0"
fi

echo -e "\n${BOLD}Configuration complete!${NC}"
echo -e "${GREEN}Docker Model Runner is now configured for use with Company Style Converter.${NC}"
echo -e "\nTo start the application, run: ${BOLD}docker compose up -d${NC}"
echo -e "Then visit: ${BOLD}http://localhost:3000${NC}"
echo -e "\nFor more information, see: ${BOLD}docs/docker-model-runner-guide.md${NC}"
