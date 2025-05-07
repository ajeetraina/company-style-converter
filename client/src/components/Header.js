import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Header() {
  const [modelRunnerStatus, setModelRunnerStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkModelRunnerStatus = async () => {
      try {
        const response = await axios.get('/api/model-runner/status');
        setModelRunnerStatus(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking Model Runner status:', error);
        setModelRunnerStatus({ status: 'error', message: 'Failed to fetch status' });
        setIsLoading(false);
      }
    };

    checkModelRunnerStatus();
  }, []);

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <svg
              className="h-8 w-8 text-blue-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span className="ml-2 text-xl font-semibold text-gray-800">Company Style Converter</span>
          </div>
          
          <div className="flex items-center">
            {!isLoading && modelRunnerStatus && (
              <div className="mr-4 flex items-center">
                <span className="text-sm mr-2">Docker Model Runner:</span>
                {modelRunnerStatus.status === 'available' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                      <circle cx="4" cy="4" r="3" />
                    </svg>
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-gray-400" fill="currentColor" viewBox="0 0 8 8">
                      <circle cx="4" cy="4" r="3" />
                    </svg>
                    Inactive
                  </span>
                )}
              </div>
            )}
            
            <nav>
              <ul className="flex space-x-4">
                <li>
                  <a href="/" className="text-gray-600 hover:text-blue-600">Home</a>
                </li>
                <li>
                  <a href="#templates" className="text-gray-600 hover:text-blue-600">Templates</a>
                </li>
                <li>
                  <a href="#help" className="text-gray-600 hover:text-blue-600">Help</a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        
        {!isLoading && modelRunnerStatus && modelRunnerStatus.status === 'available' && modelRunnerStatus.models && modelRunnerStatus.models.length > 0 && (
          <div className="bg-blue-50 rounded-md p-2 mb-4 text-sm text-blue-700">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p>
                  <span className="font-medium">Docker Model Runner is active.</span> The application will use AI models for image processing.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
