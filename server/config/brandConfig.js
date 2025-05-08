/**
 * Company Brand Configuration
 * 
 * This file defines the brand elements used for style conversion
 */

module.exports = {
  // Company color palette
  colors: {
    primary: '#0066CC',         // Main brand color
    secondary: '#FF9900',       // Secondary brand color
    accent: '#00CC99',          // Accent color
    dark: '#333333',            // Dark color for text
    light: '#F5F5F5',           // Light color for backgrounds
    neutral: '#CCCCCC',         // Neutral gray
    success: '#00AA55',         // Success indicators
    warning: '#FFCC00',         // Warning indicators
    error: '#CC3300',           // Error indicators
    info: '#0099FF',            // Information indicators
    
    // Excalidraw to brand color mappings
    excalidrawMapping: {
      // Map common Excalidraw default colors to company colors
      '#1971c2': '#0066CC',     // Excalidraw blue to company primary
      '#e67700': '#FF9900',     // Excalidraw orange to company secondary
      '#087f5b': '#00CC99',     // Excalidraw green to company accent
      '#000000': '#333333',     // Excalidraw black to company dark
      '#343a40': '#333333',     // Excalidraw dark gray to company dark
      '#868e96': '#CCCCCC',     // Excalidraw gray to company neutral
    }
  },
  
  // Company fonts
  fonts: {
    primary: 'Helvetica Neue, Arial, sans-serif',
    secondary: 'Georgia, Times, serif',
    monospace: 'Courier New, monospace',
    
    // Font weights
    weights: {
      light: 300,
      regular: 400,
      semibold: 600,
      bold: 700
    }
  },
  
  // Company logos and assets
  logos: {
    primary: {
      path: '/assets/logos/company-logo.svg',
      width: 180,
      height: 60
    },
    icon: {
      path: '/assets/logos/company-icon.svg',
      width: 40,
      height: 40
    },
    watermark: {
      path: '/assets/logos/company-watermark.svg',
      opacity: 0.15
    }
  },
  
  // Diagram style templates
  templates: {
    default: {
      name: 'Default Template',
      background: '#FFFFFF',
      strokeWidth: 2,
      cornerRadius: 4,
      fontFamily: 'Helvetica Neue, Arial, sans-serif',
      fontSize: {
        header: 20,
        subheader: 16,
        body: 14,
        caption: 12
      },
      shapes: {
        rectangle: {
          fill: '#F5F5F5',
          stroke: '#0066CC',
          opacity: 0.9
        },
        ellipse: {
          fill: '#F5F5F5',
          stroke: '#0066CC', 
          opacity: 0.9
        },
        diamond: {
          fill: '#F5F5F5',
          stroke: '#FF9900',
          opacity: 0.9
        },
        arrow: {
          stroke: '#333333',
          strokeWidth: 2,
          arrowheadSize: 10
        }
      },
      watermark: true
    },
    
    technical: {
      name: 'Technical Diagram',
      background: '#F8F9FA',
      strokeWidth: 1.5,
      cornerRadius: 2,
      fontFamily: 'Courier New, monospace',
      fontSize: {
        header: 18,
        subheader: 15,
        body: 12,
        caption: 10
      },
      shapes: {
        rectangle: {
          fill: '#F5F5F5',
          stroke: '#333333',
          opacity: 0.95
        },
        ellipse: {
          fill: '#F5F5F5',
          stroke: '#333333',
          opacity: 0.95
        },
        diamond: {
          fill: '#F5F5F5',
          stroke: '#333333',
          opacity: 0.95
        },
        arrow: {
          stroke: '#333333',
          strokeWidth: 1.5,
          arrowheadSize: 8
        }
      },
      watermark: true
    },
    
    presentation: {
      name: 'Presentation Style',
      background: '#FFFFFF',
      strokeWidth: 2.5,
      cornerRadius: 8,
      fontFamily: 'Helvetica Neue, Arial, sans-serif',
      fontSize: {
        header: 24,
        subheader: 20,
        body: 16,
        caption: 14
      },
      shapes: {
        rectangle: {
          fill: '#0066CC',
          stroke: '#0066CC',
          opacity: 0.8,
          textColor: '#FFFFFF'
        },
        ellipse: {
          fill: '#FF9900',
          stroke: '#FF9900',
          opacity: 0.8,
          textColor: '#FFFFFF'
        },
        diamond: {
          fill: '#00CC99',
          stroke: '#00CC99', 
          opacity: 0.8,
          textColor: '#FFFFFF'
        },
        arrow: {
          stroke: '#333333',
          strokeWidth: 3,
          arrowheadSize: 12
        }
      },
      watermark: false
    },
    
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
  }
};
