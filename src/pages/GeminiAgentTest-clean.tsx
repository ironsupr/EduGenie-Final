import { useAuth } from '../contexts/AuthContext';

const GeminiAgentTest = () => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Gemini Agent Test</h1>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Service Temporarily Disabled</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    The Gemini Agent Service has been disabled due to browser compatibility issues. 
                    The service was attempting to use Node.js modules (child_process, fs, path) which 
                    are not available in the browser environment.
                  </p>
                  <p className="mt-2">
                    To use this feature, the service needs to be refactored to work as a backend API 
                    or use browser-compatible alternatives.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Alternative Options:</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Use the standard YouTube import functionality</li>
              <li>Manually create courses using the course creator</li>
              <li>Import individual videos and organize them manually</li>
            </ul>
          </div>
          
          {!currentUser && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">Please sign in to access course creation features.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeminiAgentTest;
