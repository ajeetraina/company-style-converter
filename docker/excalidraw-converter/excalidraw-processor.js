/**
 * Excalidraw Processor - Standalone Docker Image
 * 
 * This script processes Excalidraw images and converts them to company brand style.
 * It runs as a standalone service in a Docker container.
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const sharp = require('sharp');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('/app/uploads'));

// Configure file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/app/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Load brand configuration
let brandConfig;
try {
  // Try to load from mounted config
  brandConfig = require('/app/config/brandConfig');
} catch (e) {
  // Fall back to default config
  brandConfig = {
    colors: {
      primary: '#0066CC',
      secondary: '#FF9900',
      accent: '#00CC99',
      dark: '#333333',
      light: '#F5F5F5',
      neutral: '#CCCCCC',
      excalidrawMapping: {
        '#1971c2': '#0066CC',
        '#e67700': '#FF9900',
        '#087f5b': '#00CC99',
        '#000000': '#333333',
        '#343a40': '#333333',
        '#868e96': '#CCCCCC',
      }
    },
    fonts: {
      primary: 'Helvetica Neue, Arial, sans-serif',
      weights: {
        regular: 400,
        bold: 700
      }
    },
    logos: {
      watermark: {
        opacity: 0.15
      }
    },
    templates: {
      excalidraw: {
        name: 'Excalidraw Brand Converter',
        preserveTextFormats: true,
        preserveLayout: true,
        adjustColors: true,
        addWatermark: true,
        watermarkPosition: 'bottom-right',
        replaceFonts: true,
        scaleRatio: 1.0,
        lineThicknessMultiplier: 1.0
      }
    }
  };
}

/**
 * Process Excalidraw SVG file
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
      processedSvg = processedSvg.replace(/font-family="[^"]*"/g, `font-family="${brandConfig.fonts.primary}"`);
    }
    
    // Add watermark if enabled
    if (template.addWatermark) {
      // Find the closing </svg> tag
      const svgEndIndex = processedSvg.lastIndexOf('</svg>');
      if (svgEndIndex !== -1) {
        // Create watermark element
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
 * Process Excalidraw JSON file
 */
async function processExcalidrawJson(inputPath, templateName, outputPath) {
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
 * Process Excalidraw raster image (PNG/JPG)
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
 * Process an Excalidraw image (PNG, SVG, or JSON)
 */
async function processExcalidrawImage(inputPath, templateName, outputPath) {
  console.log(`Processing Excalidraw image with template: ${templateName}`);
  
  // Determine file type
  const fileExtension = path.extname(inputPath).toLowerCase();
  
  // Process based on file type
  if (fileExtension === '.json') {
    return processExcalidrawJson(inputPath, templateName, outputPath);
  } else if (fileExtension === '.svg') {
    return processExcalidrawSvg(inputPath, templateName, outputPath);
  } else if (['.png', '.jpg', '.jpeg'].includes(fileExtension)) {
    return processExcalidrawRaster(inputPath, templateName, outputPath);
  } else {
    throw new Error(`Unsupported file type: ${fileExtension}`);
  }
}

// Routes
app.post('/api/convert', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const inputPath = req.file.path;
    const templateName = req.body.template || 'excalidraw';
    const outputFormat = req.body.outputFormat || 'png';
    
    // Determine output path based on format
    const outputPath = `/app/uploads/${Date.now()}-converted.${outputFormat}`;
    
    // Process the image
    const result = await processExcalidrawImage(inputPath, templateName, outputPath);
    
    // Return the processed image URL and metadata
    res.json({
      success: true,
      inputFile: path.basename(inputPath),
      outputFile: path.basename(outputPath),
      templateName,
      metadata: result.metadata
    });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ message: 'Failed to process file', error: error.message });
  }
});

// Get templates endpoint
app.get('/api/templates', (req, res) => {
  try {
    const templates = Object.keys(brandConfig.templates).map(key => ({
      id: key,
      name: brandConfig.templates[key].name,
      description: brandConfig.templates[key].description || null
    }));
    
    res.json({ templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ message: 'Failed to fetch templates', error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', version: '1.0.0' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Excalidraw Processor running on port ${PORT}`);
  console.log(`Using ${Object.keys(brandConfig.templates).length} templates`);
});
