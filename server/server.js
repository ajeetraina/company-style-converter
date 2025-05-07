const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load env variables
dotenv.config();

// Import utilities
const { processImageWithModelRunner } = require('./utils/modelRunner');
const McpClient = require('./utils/mcpClient');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize MCP client
const mcpClient = new McpClient({
  endpoint: process.env.MCP_ENDPOINT,
  apiKey: process.env.MCP_API_KEY
});

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.post('/api/convert', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const imagePath = req.file.path;
    const templateName = req.body.template || 'default';
    
    // Path for converted image
    const convertedImageDir = './uploads/converted';
    if (!fs.existsSync(convertedImageDir)) {
      fs.mkdirSync(convertedImageDir, { recursive: true });
    }
    
    const convertedImageName = `${Date.now()}-converted.png`;
    const convertedImagePath = path.join(convertedImageDir, convertedImageName);

    // Process image using preferred method (MCP or Model Runner)
    let processingResult;
    
    // First try with MCP
    try {
      console.log('Processing with MCP client...');
      const mcpResult = await mcpClient.processImage(imagePath, templateName, {
        preserveContent: true,
        quality: 95
      });
      await mcpClient.saveProcessedImage(mcpResult, convertedImagePath);
      processingResult = {
        success: true,
        metadata: mcpResult.metadata,
        processMethod: 'mcp'
      };
    } catch (mcpError) {
      console.log('MCP processing failed, falling back to Model Runner:', mcpError.message);
      // Fall back to Model Runner if MCP fails
      processingResult = await processImageWithModelRunner(imagePath, templateName, convertedImagePath);
    }
    
    // Construct URLs for frontend
    const originalImageUrl = `${req.protocol}://${req.get('host')}/uploads/${path.basename(imagePath)}`;
    const convertedImageUrl = `${req.protocol}://${req.get('host')}/uploads/converted/${convertedImageName}`;

    res.json({
      success: true,
      originalImageUrl,
      convertedImageUrl,
      templateName,
      metadata: processingResult.metadata
    });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ message: 'Failed to process image', error: error.message });
  }
});

// Get available templates
app.get('/api/templates', async (req, res) => {
  try {
    const templates = await mcpClient.getAvailableTemplates();
    res.json({ templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    // Fall back to local templates from brandConfig
    const brandConfig = require('./config/brandConfig');
    const localTemplates = Object.keys(brandConfig.templates).map(key => ({
      id: key,
      name: brandConfig.templates[key].name
    }));
    
    res.json({ 
      templates: localTemplates,
      message: 'Retrieved from local configuration due to MCP service error'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    services: {
      mcp: process.env.MCP_ENDPOINT ? 'configured' : 'not_configured',
      modelRunner: process.env.MODEL_RUNNER_URL ? 'configured' : 'not_configured'
    }
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`MCP endpoint: ${process.env.MCP_ENDPOINT || 'Not configured (using fallback)'}`);
  console.log(`Model Runner: ${process.env.MODEL_RUNNER_URL || 'Not configured (using fallback)'}`);
});
