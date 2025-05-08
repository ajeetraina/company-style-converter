/**
 * Excalidraw Converter Utility
 * 
 * This module provides functions to convert Excalidraw images to company-branded style
 */

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');
const brandConfig = require('../config/brandConfig');
const sharp = require('sharp');

/**
 * Process an Excalidraw image (PNG or SVG) and apply company branding
 * 
 * @param {string} inputPath - Path to the source Excalidraw image
 * @param {string} templateName - Template name to apply (from brandConfig)
 * @param {string} outputPath - Path to save the processed image
 * @returns {Promise<object>} - Processing result with metadata
 */
async function processExcalidrawImage(inputPath, templateName, outputPath) {
  console.log(`Processing Excalidraw image with template: ${templateName}`);
  
  // Determine file type
  const fileExtension = path.extname(inputPath).toLowerCase();
  
  // Check if it's an Excalidraw file (JSON format) or an exported image
  if (fileExtension === '.json') {
    return processExcalidrawJsonFile(inputPath, templateName, outputPath);
  } else if (fileExtension === '.svg') {
    return processExcalidrawSvg(inputPath, templateName, outputPath);
  } else if (['.png', '.jpg', '.jpeg'].includes(fileExtension)) {
    return processExcalidrawRaster(inputPath, templateName, outputPath);
  } else {
    throw new Error(`Unsupported file type: ${fileExtension}`);
  }
}

/**
 * Process Excalidraw JSON file
 * 
 * @param {string} inputPath - Path to the Excalidraw JSON file
 * @param {string} templateName - Template to apply
 * @param {string} outputPath - Path to save the processed image
 * @returns {Promise<object>} - Processing result
 */
async function processExcalidrawJsonFile(inputPath, templateName, outputPath) {
  try {
    // Load the Excalidraw JSON file
    const fileContent = fs.readFileSync(inputPath, 'utf8');
    const excalidrawData = JSON.parse(fileContent);
    
    // Get the template configuration
    const template = brandConfig.templates[templateName] || brandConfig.templates.excalidraw;
    
    // Transform the elements according to brand guidelines
    excalidrawData.elements = excalidrawData.elements.map(element => {
      // Apply color transformations
      if (element.strokeColor && brandConfig.colors.excalidrawMapping[element.strokeColor]) {
        element.strokeColor = brandConfig.colors.excalidrawMapping[element.strokeColor];
      }
      
      if (element.backgroundColor && brandConfig.colors.excalidrawMapping[element.backgroundColor]) {
        element.backgroundColor = brandConfig.colors.excalidrawMapping[element.backgroundColor];
      }
      
      // Apply font transformations if enabled
      if (template.replaceFonts && element.type === 'text') {
        element.fontFamily = brandConfig.fonts.primary;
      }
      
      // Apply line thickness adjustments
      if (element.strokeWidth) {
        element.strokeWidth = element.strokeWidth * template.lineThicknessMultiplier;
      }
      
      return element;
    });
    
    // Add company branding metadata
    excalidrawData.appState = {
      ...excalidrawData.appState,
      companyBranded: true,
      brandTemplate: templateName,
      brandTimestamp: new Date().toISOString()
    };
    
    // Save the processed file
    const processedJson = JSON.stringify(excalidrawData, null, 2);
    fs.writeFileSync(outputPath, processedJson);
    
    // If the output path has a PNG extension, we need to also generate a PNG
    if (outputPath.toLowerCase().endsWith('.png')) {
      // For this example, we would need the Excalidraw library to render the JSON as PNG
      // This is a simplified placeholder - in a real implementation you'd use the Excalidraw library
      // or a rendering service to generate the PNG from the JSON
      
      // For now, we'll just create a placeholder notification
      return {
        success: true,
        metadata: {
          processMethod: 'excalidraw-json',
          templateApplied: templateName,
          message: 'JSON processed with branding applied. To generate PNG, please open in Excalidraw.'
        }
      };
    }
    
    return {
      success: true,
      metadata: {
        processMethod: 'excalidraw-json',
        templateApplied: templateName
      }
    };
  } catch (error) {
    console.error('Error processing Excalidraw JSON:', error);
    throw error;
  }
}

/**
 * Process Excalidraw SVG file
 * 
 * @param {string} inputPath - Path to the Excalidraw SVG file
 * @param {string} templateName - Template to apply
 * @param {string} outputPath - Path to save the processed image
 * @returns {Promise<object>} - Processing result
 */
async function processExcalidrawSvg(inputPath, templateName, outputPath) {
  try {
    // Load the SVG content
    const svgContent = fs.readFileSync(inputPath, 'utf8');
    
    // Get the template configuration
    const template = brandConfig.templates[templateName] || brandConfig.templates.excalidraw;
    
    // Process the SVG content
    let processedSvg = svgContent;
    
    // Replace colors using regex
    if (template.adjustColors) {
      Object.entries(brandConfig.colors.excalidrawMapping).forEach(([excalidrawColor, brandColor]) => {
        // Create a regex to find color values in the SVG
        const colorRegex = new RegExp(excalidrawColor.replace('#', '\\#'), 'g');
        processedSvg = processedSvg.replace(colorRegex, brandColor);
      });
    }
    
    // Replace fonts if enabled
    if (template.replaceFonts) {
      // This is a simplified approach - in a real implementation you'd use proper SVG parsing
      processedSvg = processedSvg.replace(/font-family="[^"]*"/g, `font-family="${brandConfig.fonts.primary}"`);
    }
    
    // Add watermark if enabled
    if (template.addWatermark) {
      // Find the closing </svg> tag
      const svgEndIndex = processedSvg.lastIndexOf('</svg>');
      if (svgEndIndex !== -1) {
        // Create watermark element - simplified version
        const watermark = `
          <g opacity="${brandConfig.logos.watermark.opacity}" id="company-watermark">
            <text x="95%" y="95%" text-anchor="end" font-family="${brandConfig.fonts.primary}" font-size="12" fill="${brandConfig.colors.primary}">
              Company Brand
            </text>
          </g>
        `;
        
        // Insert watermark before closing SVG tag
        processedSvg = processedSvg.substring(0, svgEndIndex) + watermark + processedSvg.substring(svgEndIndex);
      }
    }
    
    // Save the processed SVG
    fs.writeFileSync(outputPath, processedSvg);
    
    // If the output requires PNG, convert SVG to PNG
    if (outputPath.toLowerCase().endsWith('.png')) {
      const svgBuffer = Buffer.from(processedSvg);
      await sharp(svgBuffer)
        .png()
        .toFile(outputPath);
    }
    
    return {
      success: true,
      metadata: {
        processMethod: 'excalidraw-svg',
        templateApplied: templateName
      }
    };
  } catch (error) {
    console.error('Error processing Excalidraw SVG:', error);
    throw error;
  }
}

/**
 * Process Excalidraw raster image (PNG/JPG)
 * 
 * @param {string} inputPath - Path to the Excalidraw PNG/JPG file
 * @param {string} templateName - Template to apply
 * @param {string} outputPath - Path to save the processed image
 * @returns {Promise<object>} - Processing result
 */
async function processExcalidrawRaster(inputPath, templateName, outputPath) {
  try {
    // Get the template configuration
    const template = brandConfig.templates[templateName] || brandConfig.templates.excalidraw;
    
    // Load the image
    const image = await loadImage(inputPath);
    
    // Create canvas with the same dimensions
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    
    // Draw the original image
    ctx.drawImage(image, 0, 0);
    
    // For raster images, we can't easily replace colors like in SVG or JSON
    // Instead, we'll add a watermark and maybe some branding elements
    
    // Add watermark if enabled
    if (template.addWatermark) {
      // Set watermark text properties
      ctx.font = `${brandConfig.fonts.weights.regular} 14px ${brandConfig.fonts.primary}`;
      ctx.fillStyle = brandConfig.colors.primary;
      ctx.globalAlpha = brandConfig.logos.watermark.opacity;
      
      // Position based on template configuration
      const watermarkText = 'Company Brand';
      const textMetrics = ctx.measureText(watermarkText);
      
      let x, y;
      switch (template.watermarkPosition) {
        case 'bottom-right':
          x = image.width - textMetrics.width - 20;
          y = image.height - 20;
          break;
        case 'bottom-left':
          x = 20;
          y = image.height - 20;
          break;
        case 'top-right':
          x = image.width - textMetrics.width - 20;
          y = 30;
          break;
        case 'top-left':
        default:
          x = 20;
          y = 30;
          break;
      }
      
      // Draw the watermark text
      ctx.fillText(watermarkText, x, y);
      
      // Reset alpha
      ctx.globalAlpha = 1.0;
    }
    
    // Save the processed image
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    
    return {
      success: true,
      metadata: {
        processMethod: 'excalidraw-raster',
        templateApplied: templateName
      }
    };
  } catch (error) {
    console.error('Error processing Excalidraw raster image:', error);
    throw error;
  }
}

/**
 * Detect if an image is from Excalidraw
 * 
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<boolean>} - Returns true if image is likely from Excalidraw
 */
async function isExcalidrawImage(imagePath) {
  try {
    const fileExtension = path.extname(imagePath).toLowerCase();
    
    // Check if it's an Excalidraw JSON file
    if (fileExtension === '.json') {
      const fileContent = fs.readFileSync(imagePath, 'utf8');
      const jsonData = JSON.parse(fileContent);
      return jsonData.type === 'excalidraw' || (jsonData.elements && Array.isArray(jsonData.elements));
    }
    
    // Check if it's an SVG file with Excalidraw markers
    if (fileExtension === '.svg') {
      const svgContent = fs.readFileSync(imagePath, 'utf8');
      return svgContent.includes('excalidraw') || 
             svgContent.includes('Made with Excalidraw') || 
             svgContent.includes('data-source="excalidraw"');
    }
    
    // For raster images, we can check for specific visual patterns or metadata
    // This is more challenging and would require image analysis
    // For now, we'll rely on filename patterns
    
    return imagePath.toLowerCase().includes('excalidraw');
  } catch (error) {
    console.error('Error detecting Excalidraw image:', error);
    return false;
  }
}

module.exports = {
  processExcalidrawImage,
  isExcalidrawImage
};
