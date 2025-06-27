import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { Zap, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const TestGeminiConnection: React.FC = () => {
  const [isTestingAPI, setIsTestingAPI] = useState(false);
  const [apiResult, setApiResult] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const testGeminiAPI = async () => {
    setIsTestingAPI(true);
    setApiResult(null);
    setApiError(null);

    try {
      console.log('Testing Gemini API connection...');
      const testPrompt = `Generate a simple JSON object about learning React: 
{
  "topic": "React Basics",
  "description": "Brief description",
  "keyPoints": ["point 1", "point 2", "point 3"]
}

Return only valid JSON, no markdown.`;

      const result = await geminiService.generateText(testPrompt);
      console.log('Gemini API test result:', result);
      setApiResult(result);
    } catch (error) {
      console.error('Gemini API test error:', error);
      setApiError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsTestingAPI(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-600" />
          Gemini API Connection Test
        </h2>
        
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <p className="text-gray-700 mb-4">
            This test verifies that the Gemini AI service is properly configured and can generate responses.
          </p>
          
          <button
            onClick={testGeminiAPI}
            disabled={isTestingAPI}
            className="flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isTestingAPI ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Testing API...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Test Gemini API
              </>
            )}
          </button>
        </div>

        {/* Error Display */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">API Test Failed:</span>
            </div>
            <p className="text-red-700 mt-1">{apiError}</p>
            <div className="mt-3 text-sm text-red-600">
              <p>Common issues:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Check if VITE_GOOGLE_AI_API_KEY is set in .env.local</li>
                <li>Verify the API key is valid and has proper permissions</li>
                <li>Ensure you haven't exceeded your daily quota</li>
                <li>Check your internet connection</li>
              </ul>
            </div>
          </div>
        )}

        {/* Success Display */}
        {apiResult && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800 font-medium">
                <CheckCircle className="w-5 h-5" />
                Gemini API Test Successful!
              </div>
              <p className="text-green-700 text-sm mt-1">
                The API is responding correctly and generating content.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">API Response:</h4>
              <div className="bg-gray-50 p-4 rounded border overflow-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">{apiResult}</pre>
              </div>
            </div>

            {/* Try to parse as JSON */}
            {(() => {
              try {
                const parsed = JSON.parse(apiResult);
                return (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-800 font-medium mb-2">
                      <CheckCircle className="w-5 h-5" />
                      JSON Parsing Successful!
                    </div>
                    <p className="text-blue-700 text-sm">
                      The API returned valid JSON that can be parsed correctly.
                    </p>
                    <details className="mt-3">
                      <summary className="cursor-pointer text-blue-800 font-medium">View Parsed Object</summary>
                      <pre className="text-xs text-blue-700 mt-2 bg-white p-3 rounded border overflow-auto">
                        {JSON.stringify(parsed, null, 2)}
                      </pre>
                    </details>
                  </div>
                );
              } catch (e) {
                return (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-yellow-800 font-medium">
                      <AlertCircle className="w-5 h-5" />
                      JSON Parsing Warning
                    </div>
                    <p className="text-yellow-700 text-sm mt-1">
                      The API responded, but the content is not valid JSON. This might affect AI notes generation.
                    </p>
                  </div>
                );
              }
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestGeminiConnection;
