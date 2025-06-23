import React, { useState } from 'react';
import { Brain, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { geminiService } from '../services/geminiService';

const GeminiTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const testGemini = async () => {
    setIsLoading(true);
    setError('');
    setTestResult('');

    try {
      const prompt = "Explain what React hooks are in 2 sentences.";
      const result = await geminiService.generateText(prompt);
      setTestResult(result);
    } catch (err: any) {
      setError(err.message || 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const testVideoAnalysis = async () => {
    setIsLoading(true);
    setError('');
    setTestResult('');

    try {
      const result = await geminiService.analyzeVideoContent(
        'Introduction to React Hooks',
        'Learn about useState, useEffect, and custom hooks in React',
        'This video covers the basics of React hooks...'
      );
      setTestResult(JSON.stringify(result, null, 2));
    } catch (err: any) {
      setError(err.message || 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-6">
            <Brain className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Gemini AI Service Test</h1>
          </div>

          <div className="space-y-6">
            <div className="flex space-x-4">
              <button
                onClick={testGemini}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center"
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
                Test Basic Generation
              </button>

              <button
                onClick={testVideoAnalysis}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center"
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
                Test Video Analysis
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-red-800 font-medium">Error</h3>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            {testResult && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-green-800 font-medium mb-2">Success!</h3>
                    <pre className="text-green-700 text-sm whitespace-pre-wrap bg-white p-3 rounded border overflow-auto max-h-96">
                      {testResult}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-blue-800 font-medium mb-2">Instructions</h3>
              <p className="text-blue-700 text-sm">
                This test page verifies that the Gemini AI service is properly configured and working. 
                Make sure you have set your <code>VITE_GOOGLE_AI_API_KEY</code> in the .env.local file.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeminiTest;
