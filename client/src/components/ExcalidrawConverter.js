import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, 
  Paper, 
  Typography, 
  Button, 
  CircularProgress, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Box,
  Alert,
  Divider,
  Card,
  CardMedia,
  CardContent,
  Tab,
  Tabs,
  Link
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import CompareIcon from '@mui/icons-material/Compare';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';

// Styled components
const UploadBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  border: '2px dashed #ccc',
  borderRadius: 8,
  cursor: 'pointer',
  marginBottom: theme.spacing(3),
  transition: 'border .3s ease-in-out',
  '&:hover': {
    border: `2px dashed ${theme.palette.primary.main}`,
  }
}));

const PreviewImage = styled('img')({
  width: '100%',
  maxHeight: 400,
  objectFit: 'contain',
  borderRadius: 4,
  marginTop: 16,
  marginBottom: 16,
  backgroundColor: '#f5f5f5'
});

const LoadingOverlay = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
});

/**
 * Excalidraw Converter Component
 */
const ExcalidrawConverter = () => {
  // State
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [convertedImage, setConvertedImage] = useState('');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('excalidraw');
  const [outputFormat, setOutputFormat] = useState('png');
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  // Fetch templates on component mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  // Fetch templates from API
  const fetchTemplates = async () => {
    try {
      const response = await axios.get('/api/templates/excalidraw');
      setTemplates(response.data.templates || []);
      
      // Set default template if available
      if (response.data.templates && response.data.templates.length > 0) {
        const excalidrawTemplate = response.data.templates.find(t => t.id === 'excalidraw');
        if (excalidrawTemplate) {
          setSelectedTemplate('excalidraw');
        } else {
          setSelectedTemplate(response.data.templates[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      setError('Failed to load templates. Please refresh the page.');
    }
  };

  // Handle file input change
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    handleSelectedFile(selectedFile);
  };

  // Handle file drop
  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      handleSelectedFile(event.dataTransfer.files[0]);
    }
  };

  // Process selected file
  const handleSelectedFile = (selectedFile) => {
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setConvertedImage('');
    
    // Create a preview URL
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      setFilePreview(e.target.result);
    };
    fileReader.readAsDataURL(selectedFile);
    
    // Auto-detect file type for output format
    const fileExt = selectedFile.name.split('.').pop().toLowerCase();
    if (['svg', 'png', 'jpg', 'jpeg', 'json'].includes(fileExt)) {
      // Keep original format if it's supported, otherwise default to PNG
      setOutputFormat(fileExt === 'json' ? 'png' : fileExt);
    }
  };

  // Handle conversion
  const handleConvert = async () => {
    if (!file) {
      setError('Please select an Excalidraw file to convert');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('excalidrawFile', file);
      formData.append('template', selectedTemplate);
      formData.append('outputFormat', outputFormat);
      
      const response = await axios.post('/api/convert/excalidraw', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data && response.data.convertedUrl) {
        setConvertedImage(response.data.convertedUrl);
        setTabValue(1); // Switch to result tab
      } else {
        throw new Error('No converted image URL received');
      }
    } catch (error) {
      console.error('Error converting image:', error);
      setError(error.response?.data?.message || 'Failed to convert image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Drag and drop handlers
  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  };

  // Download the converted image
  const handleDownload = () => {
    if (!convertedImage) return;
    
    const link = document.createElement('a');
    link.href = convertedImage;
    link.download = `company-branded-${Date.now()}.${outputFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Excalidraw to Company Brand Converter
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Transform your Excalidraw diagrams into company-branded images with a single click.
        Upload SVG, PNG, or Excalidraw JSON files.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="converter tabs">
          <Tab label="Upload" id="tab-0" />
          <Tab label="Result" id="tab-1" disabled={!convertedImage} />
          <Tab label="Tips" id="tab-2" />
        </Tabs>
      </Box>
      
      {/* Upload Tab */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <UploadBox 
              elevation={1}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              sx={{
                borderColor: isDragOver ? 'primary.main' : '#ccc',
                borderWidth: isDragOver ? '3px' : '2px'
              }}
            >
              <input
                accept=".svg,.png,.jpg,.jpeg,.json,.excalidraw"
                style={{ display: 'none' }}
                id="excalidraw-file-upload"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="excalidraw-file-upload">
                <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Drag & Drop or Click to Upload
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supports SVG, PNG, JPG and Excalidraw files
                </Typography>
                <Button
                  component="span"
                  variant="contained"
                  sx={{ mt: 2 }}
                >
                  Select File
                </Button>
              </label>
            </UploadBox>
            
            {filePreview && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Preview:
                </Typography>
                <PreviewImage src={filePreview} alt="Preview" />
                <Typography variant="body2" color="text.secondary">
                  File: {file?.name}
                </Typography>
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12} md={5}>
            <Paper elevation={1} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Conversion Options
              </Typography>
              
              <FormControl fullWidth margin="normal">
                <InputLabel id="template-select-label">Template</InputLabel>
                <Select
                  labelId="template-select-label"
                  id="template-select"
                  value={selectedTemplate}
                  label="Template"
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                >
                  {templates.map(template => (
                    <MenuItem key={template.id} value={template.id}>
                      {template.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="normal">
                <InputLabel id="format-select-label">Output Format</InputLabel>
                <Select
                  labelId="format-select-label"
                  id="format-select"
                  value={outputFormat}
                  label="Output Format"
                  onChange={(e) => setOutputFormat(e.target.value)}
                >
                  <MenuItem value="svg">SVG - Vector Graphics</MenuItem>
                  <MenuItem value="png">PNG - Raster Image</MenuItem>
                </Select>
              </FormControl>
              
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                onClick={handleConvert}
                disabled={!file || isLoading}
                startIcon={<CompareIcon />}
                sx={{ mt: 3 }}
              >
                Convert to Company Style
              </Button>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="body2" color="text.secondary">
                Need help? Check the{' '}
                <Link href="/docs/excalidraw-converter-guide.md" target="_blank" rel="noopener noreferrer">
                  User Guide
                </Link>
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* Result Tab */}
      {tabValue === 1 && (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card elevation={2}>
                <CardMedia
                  component="img"
                  image={convertedImage}
                  alt="Converted image"
                  sx={{
                    height: 'auto',
                    maxHeight: '500px',
                    objectFit: 'contain',
                    bgcolor: '#f5f5f5'
                  }}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Company-Branded Image
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownload}
                  >
                    Download
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={1} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Conversion Details
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Template:</strong> {templates.find(t => t.id === selectedTemplate)?.name || selectedTemplate}
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Output Format:</strong> {outputFormat.toUpperCase()}
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Original File:</strong> {file?.name}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2">
                  Your company-branded image is ready! You can download it or try another conversion.
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  onClick={() => {
                    setTabValue(0);
                    setFile(null);
                    setFilePreview('');
                    setConvertedImage('');
                  }}
                  sx={{ mt: 2 }}
                >
                  Convert Another Image
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
      
      {/* Tips Tab */}
      {tabValue === 2 && (
        <Paper elevation={1} sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <TipsAndUpdatesIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Tips for Best Results</Typography>
          </Box>
          
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
            Color Mapping
          </Typography>
          <Typography variant="body2" paragraph>
            Excalidraw default colors are automatically mapped to company colors.
            For best results, stick to the default Excalidraw color palette.
          </Typography>
          
          <Typography variant="subtitle1" gutterBottom>
            SVG Format Recommended
          </Typography>
          <Typography variant="body2" paragraph>
            SVG format preserves vector quality and allows better color replacement.
            Use "Export as SVG" in Excalidraw for best results.
          </Typography>
          
          <Typography variant="subtitle1" gutterBottom>
            Text Elements
          </Typography>
          <Typography variant="body2" paragraph>
            Text elements will be converted to use company fonts.
            Font sizes are preserved, and text colors are mapped to company colors.
          </Typography>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Need more help?
          </Typography>
          <Typography variant="body2">
            Check the full{' '}
            <Link href="/docs/excalidraw-converter-guide.md" target="_blank" rel="noopener noreferrer">
              Excalidraw Converter User Guide
            </Link>{' '}
            for detailed instructions and examples.
          </Typography>
        </Paper>
      )}
      
      {isLoading && (
        <LoadingOverlay>
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <CircularProgress color="inherit" size={60} />
            <Typography variant="h6" sx={{ mt: 2, color: 'white' }}>
              Converting...
            </Typography>
          </Box>
        </LoadingOverlay>
      )}
    </Container>
  );
};

export default ExcalidrawConverter;
