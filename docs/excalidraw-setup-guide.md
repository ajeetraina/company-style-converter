# Excalidraw Converter Setup Guide

This guide provides step-by-step instructions for setting up the Excalidraw to Company Style Converter.

## System Requirements

- Docker Desktop 4.40 or later
- Docker Model Runner extension enabled
- 4GB RAM minimum (8GB recommended)
- 10GB free disk space
- Internet connection for pulling Docker images

## Installation Steps

### 1. Enable Docker Model Runner

The Excalidraw converter requires Docker Model Runner to be enabled in Docker Desktop:

1. Open Docker Desktop
2. Go to Settings > Features in Development
3. Enable 'Docker Model Runner'
4. Optional: Enable 'Host-side TCP support' (port: 12434)
5. Click 'Apply & Restart'

Alternatively, run the included setup script:

```bash
bash setup-model-runner.sh
```

### 2. Set Up Environment Configuration

1. Create a `.env` file from the example template:

```bash
cp .env.example .env
```

2. Open the `.env` file and edit the following settings:

```
# Server Configuration
PORT=5000
NODE_ENV=development

# MCP Configuration
MCP_ENDPOINT=http://localhost:8080/v1/mcpserver
MCP_API_KEY=your_api_key_here

# Docker Model Runner Configuration
MODEL_RUNNER_HOST=model-runner.docker.internal
MODEL_RUNNER_PORT=80
MODEL_RUNNER_ENGINE=llama.cpp
DEFAULT_MODEL=ai/llama3.2:1B-Q8_0

# Optional: TCP Host configuration (if enabled in Docker Desktop)
MODEL_RUNNER_TCP_HOST=host.docker.internal
MODEL_RUNNER_TCP_PORT=12434
```

For Excalidraw-specific configuration, no special changes are needed as the default settings work well with Excalidraw.

### 3. Build and Start the Services

Start all services using Docker Compose:

```bash
docker-compose up -d
```

This will:
- Start the main application server
- Start the Excalidraw converter service
- Configure the Model Runner integration

Verify all services are running:

```bash
docker-compose ps
```

You should see three services running: `app`, `excalidraw-converter`, and `model-runner`.

### 4. Access the Web Interface

Open a web browser and navigate to:

```
http://localhost:3000
```

You should see the Company Style Converter web interface. Look for the "Excalidraw" tab or option to access the Excalidraw-specific converter.

## Customizing Excalidraw Conversion

### Brand Configuration

The default brand configuration is in `server/config/brandConfig.js`. You can customize the Excalidraw-specific settings:

```javascript
// For Excalidraw specifically
excalidraw: {
  name: 'Excalidraw Brand Converter',
  preserveTextFormats: true,
  preserveLayout: true,
  adjustColors: true,
  addWatermark: true,
  watermarkPosition: 'bottom-right',
  replaceFonts: true,
  scaleRatio: 1.0,  // Keep original size
  lineThicknessMultiplier: 1.0,
  applyGradients: true,
  enhanceShadows: true
}
```

### Color Mapping

You can customize how Excalidraw colors map to your company colors by editing the `excalidrawMapping` section:

```javascript
excalidrawMapping: {
  '#1971c2': '#0066CC',     // Excalidraw blue to company primary
  '#e67700': '#FF9900',     // Excalidraw orange to company secondary
  '#087f5b': '#00CC99',     // Excalidraw green to company accent
  '#000000': '#333333',     // Excalidraw black to company dark
  '#343a40': '#333333',     // Excalidraw dark gray to company dark
  '#868e96': '#CCCCCC',     // Excalidraw gray to company neutral
}
```

## Troubleshooting

### Common Issues

#### Docker Model Runner Not Working

If you see this error: "MCP processing failed, falling back to Model Runner"

1. Check if Docker Model Runner is enabled:
   ```bash
   docker model status
   ```

2. If not enabled, run the setup script again:
   ```bash
   bash setup-model-runner.sh
   ```

#### Excalidraw Converter Service Not Responding

If the Excalidraw converter isn't working:

1. Check if the service is running:
   ```bash
   docker-compose ps excalidraw-converter
   ```

2. Check the logs:
   ```bash
   docker-compose logs excalidraw-converter
   ```

3. Restart the service:
   ```bash
   docker-compose restart excalidraw-converter
   ```

#### Issues with SVG Processing

If SVG files aren't converting properly:

1. Make sure the `sharp` and `canvas` dependencies are installed correctly:
   ```bash
   docker-compose exec excalidraw-converter npm list sharp canvas
   ```

2. Try converting to PNG format instead, which sometimes works better for complex SVGs.

### Getting Logs

To see the logs for all services:

```bash
docker-compose logs
```

For specific services:

```bash
docker-compose logs app
docker-compose logs excalidraw-converter
docker-compose logs model-runner
```

## Updating

When new versions are released:

1. Pull the latest code:
   ```bash
   git pull origin main
   ```

2. Rebuild and restart the containers:
   ```bash
   docker-compose down
   docker-compose build
   docker-compose up -d
   ```

## Advanced Configuration

### Running on a Different Port

To change the port from the default 3000, edit the `.env` file and the `docker-compose.yml` file:

1. In `.env`, update `PORT=5000`
2. In `docker-compose.yml`, update the ports mapping for the app service:
   ```yaml
   ports:
     - "8000:5000"  # Change 8000 to your desired port
   ```

### Using a GPU for Model Runner

If you have a compatible GPU, you can enable GPU acceleration for Model Runner by ensuring the device is properly configured in `docker-compose.yml`:

```yaml
model-runner:
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            count: 1
            capabilities: [gpu]
```

## Support

For additional help:
- Check the main README.md file
- Contact the internal tools team
- Raise an issue in the GitHub repository
