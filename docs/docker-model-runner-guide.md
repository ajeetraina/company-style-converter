# Docker Model Runner Integration Guide

This guide explains how to use Docker Model Runner for AI-powered image styling in the Company Style Converter application.

## Prerequisites

Before using Docker Model Runner with this application, ensure you have:

1. Docker Desktop 4.40+ installed on your machine
2. Docker Model Runner feature enabled
3. MacOS with Apple Silicon (M1/M2/M3/M4) for GPU acceleration (Windows support coming soon)

## Enabling Docker Model Runner

### Method 1: Using Docker Desktop UI

1. Open Docker Desktop
2. Navigate to Settings > Features in Development
3. Enable "Docker Model Runner"
4. Optionally enable "Host-side TCP support" (default port: 12434)
5. Click "Apply & Restart"

### Method 2: Using Command Line

```bash
# Enable Docker Model Runner
docker desktop enable model-runner

# Enable with TCP support on specific port
docker desktop enable model-runner --tcp 12434
```

## Downloading Required Models

Before using the application with Docker Model Runner, download the necessary AI model:

```bash
# Download the model
docker model pull ai/llama3.2:1B-Q8_0

# Verify the model is available
docker model ls
```

## Connection Methods

The application can connect to Docker Model Runner in two ways:

### 1. Container-to-Model-Runner Connection

When running the application inside a Docker container, it connects via the internal DNS name:

```
http://model-runner.docker.internal/engines/llama.cpp/v1/
```

This is configured in the Docker Compose file and is the default connection method.

### 2. TCP Host Connection

If you've enabled "Host-side TCP support" in Docker Desktop, the application can connect via the configured port (default: 12434):

```
http://host.docker.internal:12434/engines/llama.cpp/v1/
```

To use this method, update the `MODEL_RUNNER_HOST` and `MODEL_RUNNER_PORT` environment variables in your `.env` file.

## Monitoring GPU Usage

When the application processes images using Docker Model Runner, you can monitor GPU usage:

1. Open Activity Monitor on MacOS
2. Navigate to the "GPU" tab
3. You should see increased GPU activity during image processing

## Model Runner API Format

The application uses Docker Model Runner's OpenAI-compatible API format for image processing:

```javascript
const request = {
  model: "ai/llama3.2:1B-Q8_0",
  messages: [
    {
      role: "system",
      content: "You are an expert in image styling..."
    },
    {
      role: "user",
      content: [
        { type: "text", text: "Convert this image..." },
        { type: "image_url", image_url: { url: "data:image/png;base64,..." } }
      ]
    }
  ],
  tools: [
    {
      type: "function",
      function: {
        name: "process_image",
        description: "Process and convert an image",
        parameters: {
          // JSON schema for parameters
        }
      }
    }
  ],
  tool_choice: {
    type: "function",
    function: { name: "process_image" }
  }
};
```

## Fallback Processing

If Docker Model Runner is unavailable, the application automatically falls back to:

1. MCP-based processing (if configured)
2. Simple image transformations (if MCP is unavailable)

## Verifying Integration

To verify Docker Model Runner integration:

1. Start the application
2. Check the header area for the Docker Model Runner status indicator
3. Upload an image for processing
4. The processing details will show which method was used

## Troubleshooting

If you encounter issues with Docker Model Runner:

1. Verify Docker Model Runner is enabled and running:
   ```bash
   docker model status
   ```

2. Check if the model is properly downloaded:
   ```bash
   docker model ls
   ```

3. Examine Docker Model Runner logs:
   ```bash
   tail -f ~/Library/Containers/com.docker.docker/Data/log/host/inference-llama.cpp.log
   ```

4. Ensure the application has the correct configuration in the `.env` file

## Further Resources

- [Docker Model Runner Documentation](https://docs.docker.com/desktop/model-runner/)
- [Docker Model Hub](https://hub.docker.com/u/ai)
- [Docker Model CLI Reference](https://docs.docker.com/engine/reference/commandline/model/)
