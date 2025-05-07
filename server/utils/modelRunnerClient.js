/**
 * Docker Model Runner Client
 * 
 * This module provides integration with Docker Model Runner for
 * image processing and style conversion using AI models.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration for Docker Model Runner
const MODEL_RUNNER_HOST = process.env.MODEL_RUNNER_HOST || 'model-runner.docker.internal';
const MODEL_RUNNER_PORT = process.env.MODEL_RUNNER_PORT || 80;
const MODEL_RUNNER_URL = `http://${MODEL_RUNNER_HOST}:${MODEL_RUNNER_PORT}`;
const MODEL_RUNNER_ENGINE = process.env.MODEL_RUNNER_ENGINE || 'llama.cpp';

// Default model to use for image processing
const DEFAULT_MODEL = process.env.DEFAULT_MODEL || 'ai/llama3.2:1B-Q8_0';

/**
 * Process image using Docker Model Runner
 * 
 * @param {string} imagePath - Path to the source image
 * @param {string} templateName - Template to apply
 * @param {string} outputPath - Path to save the processed image
 * @returns {Promise<object>} - Processing result
 */
async function processImageWithModelRunner(imagePath, templateName, outputPath) {
  try {
    console.log(`Processing image with Docker Model Runner using template: ${templateName}`);
    
    // Load image as base64
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString('base64');
    
    // Get company branding configuration
    const brandConfig = require('../config/brandConfig');
    const templateConfig = brandConfig.templates[templateName] || brandConfig.templates.default;
    
    // Prepare prompt for the model
    const systemPrompt = `You are an expert in corporate branding and image style conversion. 
    Your task is to analyze the provided image and apply the company's ${templateName} style to it.
    Use the following brand guidelines:
    - Primary color: ${brandConfig.colors.primary}
    - Secondary color: ${brandConfig.colors.secondary}
    - Logo position: ${brandConfig.logos.primary.position}
    - Font family: ${brandConfig.fonts.primary}`;
    
    // Prepare request to Model Runner using OpenAI-compatible format
    const modelRunnerRequest = {
      model: DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: `Convert this image to match our company's ${templateName} style.` 
            },
            { 
              type: "image_url", 
              image_url: { 
                url: `data:image/png;base64,${imageBase64}` 
              } 
            }
          ]
        }
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "process_image",
            description: "Process and convert an image to match company branding",
            parameters: {
              type: "object",
              properties: {
                style_name: {
                  type: "string",
                  description: "The name of the style template to apply"
                },
                color_adjustments: {
                  type: "object",
                  properties: {
                    primary_color: { type: "string" },
                    secondary_color: { type: "string" }
                  }
                },
                add_logo: {
                  type: "boolean",
                  description: "Whether to add the company logo"
                },
                logo_position: {
                  type: "string",
                  enum: ["top-left", "top-right", "bottom-left", "bottom-right", "center"]
                }
              },
              required: ["style_name"]
            }
          }
        }
      ],
      tool_choice: {
        type: "function",
        function: { name: "process_image" }
      }
    };
    
    // Call Docker Model Runner's OpenAI-compatible endpoint
    const response = await axios.post(
      `${MODEL_RUNNER_URL}/engines/${MODEL_RUNNER_ENGINE}/v1/chat/completions`, 
      modelRunnerRequest, 
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Process the response
    if (response.data && 
        response.data.choices && 
        response.data.choices.length > 0 && 
        response.data.choices[0].message &&
        response.data.choices[0].message.tool_calls &&
        response.data.choices[0].message.tool_calls.length > 0) {
      
      // Get tool call parameters
      const toolCall = response.data.choices[0].message.tool_calls[0];
      const params = JSON.parse(toolCall.function.arguments);
      
      // In a real implementation, we would process the image with these parameters
      // For now, we'll simulate the processing
      await simulateImageProcessing(imagePath, outputPath, params);
      
      return {
        success: true,
        metadata: {
          processMethod: 'docker-model-runner',
          modelUsed: DEFAULT_MODEL,
          styleParams: params
        }
      };
    } else {
      throw new Error('Invalid response from Model Runner');
    }
  } catch (error) {
    console.error('Error calling Docker Model Runner:', error.message);
    
    // Fall back to simple processing
    await simulateImageProcessing(imagePath, outputPath, { style_name: templateName });
    
    return {
      success: true,
      metadata: {
        processMethod: 'fallback',
        error: error.message
      }
    };
  }
}

/**
 * Simulate image processing (for development/fallback)
 */
async function simulateImageProcessing(imagePath, outputPath, params) {
  console.log('Simulating image processing with params:', params);
  
  // In a real implementation, we would process the image with AI
  // For now, we'll just copy the file
  fs.copyFileSync(imagePath, outputPath);
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    params
  };
}

/**
 * Check if Docker Model Runner is available
 * @returns {Promise<boolean>} - Whether Model Runner is available
 */
async function checkModelRunnerAvailability() {
  try {
    // Check Docker Model Runner status
    const result = execSync('docker model status').toString().trim();
    return result.includes('Docker Model Runner is running');
  } catch (error) {
    console.error('Error checking Model Runner status:', error.message);
    return false;
  }
}

/**
 * List available models in Docker Model Runner
 * @returns {Promise<Array>} - List of available models
 */
async function listAvailableModels() {
  try {
    // List models
    const modelList = execSync('docker model ls').toString().trim();
    return modelList.split('\n').slice(1); // Skip header row
  } catch (error) {
    console.error('Error listing models:', error.message);
    return [];
  }
}

module.exports = {
  processImageWithModelRunner,
  checkModelRunnerAvailability,
  listAvailableModels
};
