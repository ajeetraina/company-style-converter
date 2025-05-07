FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create directories for assets
RUN mkdir -p /app/assets/templates /app/assets/logos /app/assets/fonts

# Make script executable
RUN chmod +x /app/start.sh

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PORT=8080 \
    MODEL_CACHE_DIR=/app/model_cache \
    COMPANY_ASSETS_DIR=/app/assets

# Expose the port
EXPOSE 8080

# Command to run the MCP service
CMD ["/app/start.sh"]
