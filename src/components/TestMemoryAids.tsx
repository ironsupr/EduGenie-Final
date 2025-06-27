import { useState } from 'react';
import { aiNotesService, ExamReadyNotes } from '../services/aiNotesService';
import { Brain, Loader2 } from 'lucide-react';

const TestMemoryAids = () => {
  const [notes, setNotes] = useState<ExamReadyNotes | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testMemoryAids = async () => {
    setLoading(true);
    setError('');
    
    try {
      const testNotes = await aiNotesService.generateExamReadyNotes(
        'Introduction to JavaScript',
        'Learn the basics of JavaScript programming language for beginners',
        'JavaScript is a programming language used to make websites interactive. Variables store data, functions perform actions, and loops repeat code.',
        'Programming',
        'Beginner'
      );
      
      console.log('Generated notes:', testNotes);
      setNotes(testNotes);
    } catch (err) {
      console.error('Error generating notes:', err);
      setError('Failed to generate notes: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-600" />
          Memory Aids Test
        </h2>
        
        <button
          onClick={testMemoryAids}
          disabled={loading}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4" />
              Test Memory Aids
            </>
          )}
        </button>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {notes && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Debug Info:</h3>
              <p className="text-sm text-gray-600">
                Mnemonics count: {notes.mnemonics?.length || 0}
              </p>
              <p className="text-sm text-gray-600">
                Notes object keys: {Object.keys(notes).join(', ')}
              </p>
            </div>

            {notes.mnemonics && notes.mnemonics.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Memory Aids ({notes.mnemonics.length})
                </h3>
                <div className="space-y-4">
                  {notes.mnemonics.map((mnemonic: any, index: number) => (
                    <div key={mnemonic.id || index} className="border-l-4 border-green-400 pl-4 py-2 bg-green-50 rounded-r-lg">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                          {mnemonic.type}
                        </span>
                        {mnemonic.concept}
                      </h4>
                      <div className="bg-white border border-green-200 rounded-lg p-3 mb-3">
                        <p className="text-lg font-mono text-green-800 font-semibold">
                          "{mnemonic.mnemonic}"
                        </p>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        <strong>How to use:</strong> {mnemonic.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!notes.mnemonics || notes.mnemonics.length === 0) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">No memory aids found. This suggests an issue with generation or fallback logic.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestMemoryAids;
