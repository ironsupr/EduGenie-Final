import React, { useState } from 'react';
import { aiNotesService, ExamReadyNotes } from '../services/aiNotesService';
import { Brain, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const TestAINotesGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState<ExamReadyNotes | null>(null);
  const [error, setError] = useState<string | null>(null);  const [testData, setTestData] = useState({
    title: 'Introduction to React Hooks',
    description: 'Complete beginner guide to React Hooks - learn about useState, useEffect, and custom hooks for managing state and side effects in functional components. Designed for people with zero React experience.',
    subject: 'Programming',
    level: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced'
  });

  const generateTestNotes = async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedNotes(null);

    try {
      console.log('Testing AI notes generation with:', testData);
      const notes = await aiNotesService.generateExamReadyNotes(
        testData.title,
        testData.description,
        undefined, // content
        testData.subject,
        testData.level
      );
      
      console.log('Generated notes:', notes);
      setGeneratedNotes(notes);
    } catch (err) {
      console.error('Error generating test notes:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="mb-8">        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-600" />
          AI Notes Generator Test - Zero Knowledge Learners
        </h2>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">🎯 Testing Focus: Complete Beginners</h3>
          <p className="text-blue-800 text-sm">
            This test generates AI notes designed for learners with <strong>zero prior knowledge</strong> about the topic. 
            The notes should provide all essential information from the original content without requiring the user to watch/read it.
          </p>
          <ul className="text-blue-700 text-sm mt-2 list-disc list-inside space-y-1">
            <li>Explains everything from scratch with no assumptions</li>
            <li>Defines all technical terms and concepts</li>
            <li>Uses simple, beginner-friendly language</li>
            <li>Provides step-by-step knowledge building</li>
            <li>Includes relatable real-world examples</li>
          </ul>
        </div>
        
        {/* Test Input Form */}
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">Test Configuration</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={testData.title}
                onChange={(e) => setTestData({ ...testData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                value={testData.subject}
                onChange={(e) => setTestData({ ...testData, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={testData.description}
                onChange={(e) => setTestData({ ...testData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
              <select
                value={testData.level}
                onChange={(e) => setTestData({ ...testData, level: e.target.value as 'Beginner' | 'Intermediate' | 'Advanced' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={generateTestNotes}
            disabled={isGenerating || !testData.title || !testData.description}
            className="mt-4 flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating AI Notes...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                Generate Test Notes
              </>
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Error generating notes:</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}

        {/* Results Display */}
        {generatedNotes && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800 font-medium">
                <CheckCircle className="w-5 h-5" />
                AI Notes Generated Successfully!
              </div>
              <div className="text-green-700 text-sm mt-2">
                Generated {generatedNotes.keyPoints.length} key points, {generatedNotes.concepts.length} concepts, 
                {generatedNotes.examQuestions.length} exam questions, and {generatedNotes.practiceProblems.length} practice problems.
              </div>
            </div>

            {/* Notes Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-blue-900 mb-2">Summary</h4>
              <p className="text-blue-800">{generatedNotes.summary}</p>
              <p className="text-blue-600 text-sm mt-2">Time to master: {generatedNotes.timeToMaster}</p>
            </div>

            {/* Key Points Preview */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Key Points ({generatedNotes.keyPoints.length})</h4>
              <div className="space-y-3">
                {generatedNotes.keyPoints.slice(0, 3).map((point, index) => (
                  <div key={point.id} className="border-l-4 border-green-400 pl-4">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-gray-900">{index + 1}. {point.title}</h5>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        point.importance === 'Critical' ? 'bg-red-100 text-red-800' :
                        point.importance === 'Important' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {point.importance}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mt-1">{point.description}</p>
                  </div>
                ))}
                {generatedNotes.keyPoints.length > 3 && (
                  <p className="text-gray-500 text-sm">... and {generatedNotes.keyPoints.length - 3} more key points</p>
                )}
              </div>
            </div>

            {/* Concepts Preview */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Concepts ({generatedNotes.concepts.length})</h4>
              <div className="space-y-4">
                {generatedNotes.concepts.slice(0, 2).map((concept, index) => (
                  <div key={concept.id} className="border border-gray-100 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">{index + 1}. {concept.concept}</h5>
                    <p className="text-gray-700 text-sm mb-2"><strong>Simple:</strong> {concept.simpleExplanation}</p>
                    <p className="text-gray-700 text-sm"><strong>Example:</strong> {concept.realWorldExample}</p>
                  </div>
                ))}
                {generatedNotes.concepts.length > 2 && (
                  <p className="text-gray-500 text-sm">... and {generatedNotes.concepts.length - 2} more concepts</p>
                )}
              </div>
            </div>

            {/* Quick Review Preview */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Review</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Must Know:</h5>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {generatedNotes.quickReview.mustKnow.slice(0, 3).map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Study Tips:</h5>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {generatedNotes.studyTips.slice(0, 3).map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-4 h-4 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center mt-0.5 flex-shrink-0">
                          {i + 1}
                        </span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* JSON Output for Debugging */}
            <details className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <summary className="font-medium text-gray-900 cursor-pointer">Raw JSON Output (for debugging)</summary>
              <pre className="text-xs text-gray-600 mt-2 overflow-auto max-h-96 bg-white p-4 rounded border">
                {JSON.stringify(generatedNotes, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestAINotesGenerator;
