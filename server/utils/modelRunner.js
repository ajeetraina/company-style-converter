/**
 * Docker Model Runner Integration
 * 
 * This module provides integration with Docker Model Runner and MCP
 * for image processing and style conversion.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration for Docker Model Runner
const MODEL_RUNNER_HOST = process.env.MODEL_RUNNER_HOST || 'localhost';
const MODEL_RUNNER_PORT = process.env.MODEL_RUNNER_PORT || 8000;
const MODEL_RUNNER_URL = `http://${MODEL_RUNNER_HOST}:${MODEL_RUNNER_PORT}`;

/**
 * Process image using Docker Model Runner and MCP
 * 
 * @param {string} imagePath - Path to the source image
 * @param {string} templateName - Template to apply
 * @param {string} outputPath - Path to save the processed image
 * @returns {Promise<object>} - Processing result
 */
async function processImageWithModelRunner(imagePath, templateName, outputPath) {
  try {
    console.log(`Processing image with template: ${templateName}`);
    
    // For development without actual Model Runner:
    // 1. Check if we're in dev mode and should simulate processing
    if (process.env.NODE_ENV === 'development' && process.env.SIMULATE_MODEL_RUNNER === 'true') {
      return simulateModelProcessing(imagePath, templateName, outputPath);
    }
    
    // Load image as base64
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString('base64');
    
    // Prepare request to Model Runner
    const mpcRequest = {
      model: 'image-style-converter',
      input: {
        image: imageBase64,
        template: templateName,
        company_assets: {
          // Load company assets from configuration
          colors: require('../config/brandConfig').colors,
          logos: require('../config/brandConfig').logos,
          // Additional company-specific parameters
        }
      }
    };
    
    // Call Model Runner API
    const response = await axios.post(`${MODEL_RUNNER_URL}/v1/process`, mpcRequest);
    
    // Save the processed image
    if (response.data && response.data.output && response.data.output.processed_image) {
      const processedImageBuffer = Buffer.from(response.data.output.processed_image, 'base64');
      fs.writeFileSync(outputPath, processedImageBuffer);
      
      return {
        success: true,
        metadata: response.data.output.metadata || {}
      };
    } else {
      throw new Error('Invalid response from Model Runner');
    }
  } catch (error) {
    console.error('Error calling Model Runner:', error.message);
    
    // If Model Runner fails, fall back to Docker CLI approach
    return processImageWithDockerCLI(imagePath, templateName, outputPath);
  }
}

/**
 * Alternative approach using Docker CLI directly
 */
function processImageWithDockerCLI(imagePath, templateName, outputPath) {
  try {
    console.log('Falling back to Docker CLI approach');
    
    // Get absolute paths
    const absImagePath = path.resolve(imagePath);
    const absOutputPath = path.resolve(outputPath);
    const absTemplatesPath = path.resolve(__dirname, '../../company-templates');
    
    // Ensure output directory exists
    const outputDir = path.dirname(absOutputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Prepare Docker command
    const dockerCommand = `docker run --rm \
      -v "${absImagePath}:/input.png" \
      -v "${absOutputPath}:/output.png" \
      -v "${absTemplatesPath}:/templates" \
      -e TEMPLATE_NAME=${templateName} \
      company-style-processor:latest`;
    
    // Execute Docker command
    execSync(dockerCommand);
    
    return {
      success: true,
      metadata: {
        processMethod: 'docker-cli'
      }
    };
  } catch (error) {
    console.error('Error processing with Docker CLI:', error.message);
    
    // Emergency fallback - just copy the file if all else fails
    fs.copyFileSync(imagePath, outputPath);
    
    return {
      success: true,
      metadata: {
        processMethod: 'fallback-copy',
        message: 'Processing failed, returned original image'
      }
    };
  }
}

/**
 * Simulate model processing for development
 */
function simulateModelProcessing(imagePath, templateName, outputPath) {
  console.log('Simulating model processing for development');
  
  // In a real implementation, you might apply some basic transformations
  // For now, we'll just copy the file
  fs.copyFileSync(imagePath, outputPath);
  
  // Simulate processing delay
  const startTime = Date.now();
  while (Date.now() - startTime < 1000) {
    // Wait for 1 second to simulate processing time
  }
  
  return {
    success: true,
    metadata: {
      processMethod: 'simulated',
      template: templateName,
      processingTime: '1.0s'
    }
  };
}

module.exports = {
  processImageWithModelRunner
};
