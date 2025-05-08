# Excalidraw to Company Brand Converter Guide

This guide explains how to convert Excalidraw diagrams to company-branded images using the Company Style Converter.

## What is this tool?

The Excalidraw Converter takes diagrams created in Excalidraw and automatically applies your company's branding:

- Replaces Excalidraw colors with company brand colors
- Applies company fonts
- Adds watermarks (optional)
- Maintains the diagram's layout and structure
- Works with SVG, PNG, and Excalidraw JSON files

## Quick Start Guide

### Step 1: Create Your Diagram in Excalidraw

1. Go to [Excalidraw](https://excalidraw.com/) or use the Excalidraw app
2. Create your diagram or open an existing one
3. Use standard Excalidraw colors and styles - they'll be automatically converted

### Step 2: Export Your Diagram

Choose one of these export options:

- **SVG Export** (Recommended): 
  - Click on the Export button in Excalidraw
  - Select "SVG" format
  - Save the file

- **PNG Export**:
  - Click on the Export button in Excalidraw
  - Select "PNG" format
  - Save the file

- **Excalidraw File**:
  - Click on the Save button in Excalidraw
  - Select "Save to disk"
  - This saves as a `.excalidraw` file (JSON format)

### Step 3: Convert to Company Brand Style

1. Go to the Company Style Converter (http://localhost:3000)
2. Click "Upload Image" and select your exported Excalidraw file
3. Select "Excalidraw Brand Converter" from the template dropdown
4. Click "Convert"
5. Download your company-branded diagram

## Tips for Best Results

### Color Mapping

Excalidraw default colors are automatically mapped to company colors:

| Excalidraw Color | Company Color |
|------------------|---------------|
| Blue (#1971c2)   | Primary (#0066CC) |
| Orange (#e67700) | Secondary (#FF9900) |
| Green (#087f5b)  | Accent (#00CC99) |
| Black (#000000)  | Dark (#333333) |
| Dark gray (#343a40) | Dark (#333333) |
| Gray (#868e96)   | Neutral (#CCCCCC) |

For best results, stick to these default Excalidraw colors in your diagrams.

### Text Elements

- Text elements will be converted to use company fonts
- Font sizes are preserved
- Text colors are mapped to company colors

### Shapes and Lines

- Rectangle, ellipse, and diamond shapes are converted to company colors
- Line thickness is preserved (or can be adjusted in templates)
- Arrow styles are preserved

## Advanced Options

### Template Selection

We offer multiple templates for Excalidraw conversion:

1. **Excalidraw Brand Converter** (Default)
   - Standard company branding
   - Preserves original layout
   - Adds subtle watermark

2. **Technical Diagram**
   - Monospace fonts
   - Minimal styling for technical documentation
   - Smaller line thickness

3. **Presentation Style**
   - Bold colors for presentations
   - Larger fonts
   - No watermark

### Output Formats

- **PNG**: Best for presentations and general use
- **SVG**: Best for web use and further editing
- **JSON**: Excalidraw-compatible file for further editing in Excalidraw

## Command Line Usage (for Technical Users)

You can also use the Excalidraw converter via API:

```bash
# Convert using curl
curl -X POST \
  -F "file=@/path/to/diagram.svg" \
  -F "template=excalidraw" \
  -F "outputFormat=png" \
  http://localhost:8086/api/convert
```

## Troubleshooting

### Common Issues

1. **Colors not converting properly**:
   - Make sure you're using standard Excalidraw colors
   - Check if the SVG export has the expected structure

2. **Text formatting issues**:
   - Complex text formatting might not convert perfectly
   - Try using simpler text styles

3. **File too large**:
   - Very complex diagrams might be too large
   - Try splitting into multiple diagrams

### Getting Help

If you encounter any issues:

1. Contact the internal tools team
2. Provide the original Excalidraw file
3. Describe what's not converting correctly

## Feedback

We're constantly improving the Excalidraw converter. Please send your feedback to the tools team!
