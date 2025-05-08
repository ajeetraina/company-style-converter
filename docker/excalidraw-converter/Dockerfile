FROM node:18-slim

# Install dependencies for canvas
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    python3 \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Create directories for uploads and templates
RUN mkdir -p /app/uploads /app/templates

# Environment variables
ENV NODE_ENV=production \
    PORT=8080

# Expose the port
EXPOSE 8080

# Start the application
CMD ["node", "excalidraw-processor.js"]
