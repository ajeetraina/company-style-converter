import React from 'react';

function ResultViewer({ imageData }) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageData.convertedImageUrl;
    link.download = 'company-styled-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Determine processing method from metadata
  const getProcessingMethod = () => {
    if (!imageData.metadata || !imageData.metadata.processMethod) {
      return 'Standard Processing';
    }
    
    const method = imageData.metadata.processMethod;
    
    if (method === 'docker-model-runner') {
      return 'Docker Model Runner AI Processing';
    } else if (method === 'mcp') {
      return 'Model Context Protocol (MCP)';
    } else if (method.includes('fallback')) {
      return 'Basic Image Processing (Fallback)';
    }
    
    return method;
  };

  // Get a badge color based on processing method
  const getMethodBadgeColor = () => {
    if (!imageData.metadata || !imageData.metadata.processMethod) {
      return 'bg-gray-100 text-gray-800';
    }
    
    const method = imageData.metadata.processMethod;
    
    if (method === 'docker-model-runner') {
      return 'bg-blue-100 text-blue-800';
    } else if (method === 'mcp') {
      return 'bg-green-100 text-green-800';
    } else if (method.includes('fallback')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Converted Result</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Original Image</h3>
          <div className="border rounded-lg overflow-hidden">
            <img
              src={imageData.originalImageUrl}
              alt="Original"
              className="w-full h-auto"
            />
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Company-Styled Image</h3>
          <div className="border rounded-lg overflow-hidden">
            <img
              src={imageData.convertedImageUrl}
              alt="Converted"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
      
      <div className="border-t pt-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div className="mb-4 md:mb-0">
            <h4 className="text-sm font-medium text-gray-700">Processing Details:</h4>
            <div className="mt-1 flex flex-col space-y-2">
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">Template:</span>
                <span className="text-sm font-medium">{imageData.templateName}</span>
              </div>
              
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">Processing Method:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodBadgeColor()}`}>
                  {getProcessingMethod()}
                </span>
              </div>
              
              {imageData.metadata && imageData.metadata.modelUsed && (
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">AI Model:</span>
                  <span className="text-sm font-medium">{imageData.metadata.modelUsed}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Download
            </button>
            
            {imageData.metadata && imageData.metadata.processMethod === 'docker-model-runner' && (
              <div className="text-center text-xs text-gray-500">
                Processed with Docker Model Runner
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultViewer;
