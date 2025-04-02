// Test runner for the Arabic Learning Browser Extension
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import '../styles/tailwind.css';
import { runBasicTests, testOnWebsite } from '../utils/testing';

// Test Runner component
const TestRunner: React.FC = () => {
  // State for test results
  const [testResults, setTestResults] = useState<any>(null);
  const [websiteTestResults, setWebsiteTestResults] = useState<any>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('https://quran.com');
  
  // Run basic tests
  const handleRunBasicTests = async () => {
    setIsRunningTests(true);
    try {
      const results = await runBasicTests();
      setTestResults(results);
    } catch (error) {
      setTestResults({
        success: false,
        results: [{ name: 'Test Runner Error', passed: false, message: error.message }]
      });
    } finally {
      setIsRunningTests(false);
    }
  };
  
  // Run website test
  const handleRunWebsiteTest = async () => {
    setIsRunningTests(true);
    try {
      const results = await testOnWebsite(websiteUrl);
      setWebsiteTestResults(results);
    } catch (error) {
      setWebsiteTestResults({
        success: false,
        message: `Error: ${error.message}`,
        arabicContentDetected: false,
        relevantWordsCount: 0
      });
    } finally {
      setIsRunningTests(false);
    }
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold mb-6">Arabic Learning Extension - Test Runner</h1>
      
      {/* Basic Tests Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Core Functionality Tests</h2>
          <button
            className={`px-4 py-2 rounded-lg ${
              isRunningTests
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
            onClick={handleRunBasicTests}
            disabled={isRunningTests}
          >
            {isRunningTests ? 'Running Tests...' : 'Run Basic Tests'}
          </button>
        </div>
        
        {testResults && (
          <div className={`p-4 rounded-lg mb-4 ${
            testResults.success ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
          }`}>
            <p className="font-semibold mb-2">
              {testResults.success ? '✅ All tests passed!' : '❌ Some tests failed'}
            </p>
            
            <div className="space-y-2 mt-4">
              {testResults.results.map((result: any, index: number) => (
                <div 
                  key={index}
                  className={`p-3 rounded ${
                    result.passed 
                      ? 'bg-green-50 dark:bg-green-800' 
                      : 'bg-red-50 dark:bg-red-800'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="mr-2">
                      {result.passed ? '✅' : '❌'}
                    </span>
                    <span className="font-medium">{result.name}</span>
                  </div>
                  {result.message && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 ml-6">
                      {result.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Website Test Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Test on Website</h2>
        
        <div className="flex mb-4">
          <input
            type="text"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="Enter website URL"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          />
          <button
            className={`px-4 py-2 rounded-r-lg ${
              isRunningTests
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
            onClick={handleRunWebsiteTest}
            disabled={isRunningTests}
          >
            Test
          </button>
        </div>
        
        {websiteTestResults && (
          <div className={`p-4 rounded-lg ${
            websiteTestResults.success ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
          }`}>
            <p className="font-semibold mb-2">
              {websiteTestResults.success ? '✅ Website test passed!' : '❌ Website test failed'}
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              {websiteTestResults.message}
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-3 bg-white dark:bg-gray-700 rounded shadow">
                <p className="text-sm text-gray-500 dark:text-gray-400">Arabic Content Detected</p>
                <p className="text-lg font-medium">
                  {websiteTestResults.arabicContentDetected ? 'Yes' : 'No'}
                </p>
              </div>
              
              <div className="p-3 bg-white dark:bg-gray-700 rounded shadow">
                <p className="text-sm text-gray-500 dark:text-gray-400">Relevant Words Found</p>
                <p className="text-lg font-medium">
                  {websiteTestResults.relevantWordsCount}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Render the test runner
const root = document.createElement('div');
document.body.appendChild(root);
ReactDOM.createRoot(root).render(<TestRunner />);
