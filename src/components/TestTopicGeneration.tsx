import React, { useState } from 'react';
import { aiNotesService } from '../services/aiNotesService';
import { geminiService } from '../services/geminiService';

const TestTopicGeneration: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [aiNotes, setAiNotes] = useState<any>(null);
  const [geminiContent, setGeminiContent] = useState<any>(null);
  const [topic, setTopic] = useState('React Hooks');
  const [description, setDescription] = useState('A brief intro to React hooks');

  const testAINotesGeneration = async () => {
    setLoading(true);
    try {
      console.log('Testing AI Notes Generation with topic:', topic);
      const notes = await aiNotesService.generateExamReadyNotes(
        topic,
        description,
        '', // No video content
        'Programming',
        'Beginner'
      );
      setAiNotes(notes);
      console.log('AI Notes generated:', notes);
    } catch (error) {
      console.error('Error generating AI notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const testGeminiGeneration = async () => {
    setLoading(true);
    try {
      console.log('Testing Gemini Generation with topic:', topic);
      const content = await geminiService.analyzeVideoContent(
        topic,
        description
      );
      setGeminiContent(content);
      console.log('Gemini content generated:', content);
    } catch (error) {
      console.error('Error generating Gemini content:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">🎯 Topic-Based AI Generation Test</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Test Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Topic/Title:</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter topic to test..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Brief Description:</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Brief description..."
            />
          </div>
        </div>
        
        <div className="flex gap-4 mt-4">
          <button
            onClick={testAINotesGeneration}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Test AI Notes'}
          </button>
          <button
            onClick={testGeminiGeneration}
            disabled={loading}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Test Gemini Content'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Notes Results */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-green-700">🧠 AI Notes (Topic-Based)</h2>
          {aiNotes ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700">Summary:</h3>
                <p className="text-sm text-gray-600">{aiNotes.summary}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700">Key Points ({aiNotes.keyPoints?.length || 0}):</h3>
                <ul className="text-sm space-y-1">
                  {aiNotes.keyPoints?.slice(0, 3).map((point: any, idx: number) => (
                    <li key={idx} className="text-gray-600">• {point.title}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700">Mnemonics ({aiNotes.mnemonics?.length || 0}):</h3>
                <ul className="text-sm space-y-1">
                  {aiNotes.mnemonics?.slice(0, 2).map((mnemonic: any, idx: number) => (
                    <li key={idx} className="text-gray-600">• {mnemonic.concept}: {mnemonic.mnemonic}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700">Study Tips ({aiNotes.studyTips?.length || 0}):</h3>
                <ul className="text-sm space-y-1">
                  {aiNotes.studyTips?.slice(0, 2).map((tip: string, idx: number) => (
                    <li key={idx} className="text-gray-600">• {tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">Click "Test AI Notes" to generate topic-based content</p>
          )}
        </div>

        {/* Gemini Content Results */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-purple-700">⚡ Gemini Content (Topic-Based)</h2>
          {geminiContent ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700">Summary:</h3>
                <p className="text-sm text-gray-600">{geminiContent.summary}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700">Key Topics ({geminiContent.keyTopics?.length || 0}):</h3>
                <ul className="text-sm space-y-1">
                  {geminiContent.keyTopics?.map((topic: string, idx: number) => (
                    <li key={idx} className="text-gray-600">• {topic}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700">Flashcards ({geminiContent.flashcards?.length || 0}):</h3>
                <div className="space-y-2">
                  {geminiContent.flashcards?.slice(0, 2).map((card: any, idx: number) => (
                    <div key={idx} className="text-sm bg-gray-50 p-2 rounded">
                      <p className="font-medium">Q: {card.question}</p>
                      <p className="text-gray-600">A: {card.answer}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700">Important Questions ({geminiContent.importantQuestions?.length || 0}):</h3>
                <ul className="text-sm space-y-1">
                  {geminiContent.importantQuestions?.slice(0, 2).map((question: string, idx: number) => (
                    <li key={idx} className="text-gray-600">• {question}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">Click "Test Gemini Content" to generate topic-based content</p>
          )}
        </div>
      </div>

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">🎯 Topic-Based Generation Features:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>✅ Content generated from TOPIC itself, not video description</li>
          <li>✅ Comprehensive subject matter coverage</li>
          <li>✅ Educational flashcards that test understanding</li>
          <li>✅ Academic-quality questions and assessments</li>
          <li>✅ Fallback content ensures reliability</li>
          <li>✅ Works for any topic or subject area</li>
        </ul>
      </div>
    </div>
  );
};

export default TestTopicGeneration;
