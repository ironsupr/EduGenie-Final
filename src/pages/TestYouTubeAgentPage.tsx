import { useState } from 'react';
import { youtubeAIService } from '../services/youtubeAIService';
import { geminiService } from '../services/geminiService';

const TestYouTubeAgentPage = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addTestResult = (name: string, success: boolean, details: any) => {
    setTestResults(prev => [...prev, { name, success, details, timestamp: new Date() }]);
  };

  const runTests = async () => {
    setIsLoading(true);
    setTestResults([]);

    // Test 1: Check if services are available
    try {
      const youtubeAvailable = youtubeAIService.isAvailable();
      const geminiAvailable = geminiService.isAvailable();
      
      addTestResult('Service Availability', true, {
        youtube: youtubeAvailable,
        gemini: geminiAvailable
      });
    } catch (error) {
      addTestResult('Service Availability', false, error);
    }

    // Test 2: Extract playlist ID
    try {
      const playlistId = await youtubeAIService.extractPlaylistId(
        'https://www.youtube.com/playlist?list=PLillGF-RfqbYeckUaD1z6nviTp31GLTH8'
      );
      addTestResult('Playlist ID Extraction', true, { playlistId });
    } catch (error) {
      addTestResult('Playlist ID Extraction', false, error);
    }

    // Test 3: Fetch mock videos
    try {
      const videos = await youtubeAIService.fetchPlaylistVideos('test', 5);
      addTestResult('Fetch Videos (Mock)', videos.length > 0, {
        videoCount: videos.length,
        firstVideo: videos[0]?.title
      });
    } catch (error) {
      addTestResult('Fetch Videos (Mock)', false, error);
    }

    // Test 4: AI Video Analysis (if Gemini available)
    if (geminiService.isAvailable()) {
      try {
        const analysis = await geminiService.analyzeVideoContent(
          'Introduction to React',
          'Learn the basics of React components and JSX'
        );
        addTestResult('AI Video Analysis', true, {
          summary: analysis.summary,
          topicsCount: analysis.keyTopics.length
        });
      } catch (error) {
        addTestResult('AI Video Analysis', false, error);
      }
    }

    // Test 5: Full playlist processing
    try {
      const course = await youtubeAIService.processPlaylistWithAI(
        'https://www.youtube.com/playlist?list=test',
        'Test Instructor',
        3
      );
      addTestResult('Full Playlist Processing', true, {
        courseTitle: course.title,
        moduleCount: course.modules.length,
        totalVideos: course.totalVideos
      });
    } catch (error) {
      addTestResult('Full Playlist Processing', false, error);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">YouTube Agent Test Page</h1>
          
          <div className="mb-6">
            <button
              onClick={runTests}
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Running Tests...' : 'Run YouTube Agent Tests'}
            </button>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Test Results</h2>
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-semibold ${
                      result.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {result.name}
                    </h3>
                    <span className={`px-2 py-1 rounded text-sm ${
                      result.success ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                    }`}>
                      {result.success ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                  <pre className="text-sm text-gray-600 bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                  <div className="text-xs text-gray-500 mt-2">
                    {result.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Test Information</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• This page tests the YouTube AI Agent functionality</li>
              <li>• Tests include playlist processing, AI analysis, and course generation</li>
              <li>• Mock data is used when YouTube API is not available</li>
              <li>• Gemini AI tests only run if API key is configured</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestYouTubeAgentPage;
