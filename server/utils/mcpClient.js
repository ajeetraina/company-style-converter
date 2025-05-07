/**
 * Model Context Protocol (MCP) Client Implementation
 * 
 * This module handles communication with MCP-compatible services
 * to apply company branding to design assets.
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const brandConfig = require('../config/brandConfig');

// MCP Configuration
const MCP_ENDPOINT = process.env.MCP_ENDPOINT || 'http://localhost:8080/v1/mcpserver';

/**
 * MCP Client for Style Conversion
 */
class McpClient {
  constructor(config = {}) {
    this.endpoint = config.endpoint || MCP_ENDPOINT;
    this.apiKey = config.apiKey || process.env.MCP_API_KEY;
    this.timeout = config.timeout || 30000; // 30 seconds default timeout
  }

  /**
   * Process an image with MCP Server
   * 
   * @param {string} imagePath - Path to input image
   * @param {string} templateName - Template to apply
   * @param {object} options - Additional processing options
   * @returns {Promise<object>} - Processing results
   */
  async processImage(imagePath, templateName, options = {}) {
    try {
      // Read image file
      const imageBuffer = await fs.readFile(imagePath);
      const imageBase64 = imageBuffer.toString('base64');
      
      // Get template configuration
      const templateConfig = brandConfig.templates[templateName] || brandConfig.templates.default;
      
      // Prepare MCP request
      const mcpRequest = {
        type: 'image_style_conversion',
        input: {
          image: {
            data: imageBase64,
            format: path.extname(imagePath).substring(1) || 'png'
          },
          template: templateName,
          brand_config: this._getBrandConfigForTemplate(templateConfig),
          options: {
            preserve_content: options.preserveContent !== false,
            quality: options.quality || 90,
            output_format: options.outputFormat || 'png',
            ...options
          }
        }
      };
      
      // Call MCP service
      const response = await axios.post(this.endpoint, mcpRequest, {
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {})
        },
        timeout: this.timeout
      });
      
      // Return processed result
      return {
        success: true,
        result: response.data,
        processedImage: response.data.output.processed_image.data,
        metadata: response.data.output.metadata
      };
    } catch (error) {
      console.error('MCP processing error:', error.message);
      throw new Error(`MCP processing failed: ${error.message}`);
    }
  }

  /**
   * Save a processed image to disk
   * 
   * @param {object} processResult - Result from processImage
   * @param {string} outputPath - Path to save output
   * @returns {Promise<string>} - Path to saved file
   */
  async saveProcessedImage(processResult, outputPath) {
    if (!processResult.processedImage) {
      throw new Error('No processed image data available');
    }

    try {
      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      await fs.mkdir(outputDir, { recursive: true });
      
      // Save image data
      const imageBuffer = Buffer.from(processResult.processedImage, 'base64');
      await fs.writeFile(outputPath, imageBuffer);
      
      return outputPath;
    } catch (error) {
      console.error('Error saving processed image:', error.message);
      throw new Error(`Failed to save processed image: ${error.message}`);
    }
  }

  /**
   * Transform brand config for MCP format
   * 
   * @param {object} templateConfig - Template configuration
   * @returns {object} - Formatted brand config for MCP
   * @private
   */
  _getBrandConfigForTemplate(templateConfig) {
    // Get logo configuration
    const logoConfig = brandConfig.logos[templateConfig.logo] || brandConfig.logos.primary;
    
    // Get color scheme
    const colorScheme = (templateConfig.colorScheme || []).map(colorName => {
      return brandConfig.colors[colorName] || '#ffffff';
    });
    
    // Construct MCP-compatible brand configuration
    return {
      colors: colorScheme,
      logo: {
        path: logoConfig.path,
        position: logoConfig.position || 'bottom-right',
        size: logoConfig.size || 0.15,
        opacity: logoConfig.opacity || 1.0
      },
      font_family: brandConfig.fonts[templateConfig.fontFamily] || brandConfig.fonts.primary,
      transformations: {
        ...brandConfig.transformations
      }
    };
  }

  /**
   * Get available templates from MCP server
   * 
   * @returns {Promise<Array>} - List of available templates
   */
  async getAvailableTemplates() {
    try {
      const response = await axios.get(`${this.endpoint}/templates`, {
        headers: {
          ...(this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {})
        },
        timeout: this.timeout
      });
      
      return response.data.templates || [];
    } catch (error) {
      console.error('Error fetching templates:', error.message);
      
      // Return local templates as fallback
      return Object.keys(brandConfig.templates).map(key => ({
        id: key,
        name: brandConfig.templates[key].name
      }));
    }
  }
}

module.exports = McpClient;
