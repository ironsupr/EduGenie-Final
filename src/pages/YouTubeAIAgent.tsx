import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Youtube, 
  Brain, 
  Sparkles, 
  BookOpen, 
  Users, 
  Clock, 
  Target, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Play,
  FileText,
  HelpCircle,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { youtubeAIService } from '../services/youtubeAIService';
import { createCourse } from '../services/courseService';

interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  description: string;
}

const YouTubeAIAgent: React.FC = () => {
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [instructorName, setInstructorName] = useState('');
  const [maxVideos, setMaxVideos] = useState(10);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const initialSteps: ProcessingStep[] = [
    { id: 'validate', label: 'Validating Playlist', status: 'pending', description: 'Checking playlist URL and accessibility' },
    { id: 'fetch', label: 'Fetching Videos', status: 'pending', description: 'Retrieving video information from YouTube' },
    { id: 'analyze', label: 'AI Content Analysis', status: 'pending', description: 'Analyzing each video with Gemini AI' },
    { id: 'group', label: 'Creating Modules', status: 'pending', description: 'Grouping related videos into learning modules' },
    { id: 'notes', label: 'Generating AI Notes', status: 'pending', description: 'Creating detailed study notes for each video' },
    { id: 'flashcards', label: 'Creating Flashcards', status: 'pending', description: 'Generating flashcards for key concepts' },
    { id: 'quiz', label: 'Building Quizzes', status: 'pending', description: 'Creating comprehension quizzes for each module' },
    { id: 'save', label: 'Saving Course', status: 'pending', description: 'Saving the complete course to your library' }
  ];

  const updateStepStatus = (stepId: string, status: ProcessingStep['status']) => {
    setProcessingSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  };

  const validateForm = (): boolean => {
    if (!playlistUrl.trim()) {
      setError('Please enter a YouTube playlist URL');
      return false;
    }

    if (!instructorName.trim()) {
      setError('Please enter an instructor name');
      return false;
    }

    if (maxVideos < 1 || maxVideos > 50) {
      setError('Please select between 1-50 videos');
      return false;
    }

    return true;
  };

  const processPlaylist = async () => {
    if (!validateForm()) return;
    
    setIsProcessing(true);
    setError(null);
    setResult(null);
    setProcessingSteps([...initialSteps]);

    try {
      // Step 1: Validate
      updateStepStatus('validate', 'processing');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing
      
      if (!youtubeAIService.isAvailable()) {
        throw new Error('AI services are not available. Please check your configuration.');
      }
      updateStepStatus('validate', 'completed');

      // Step 2: Fetch videos
      updateStepStatus('fetch', 'processing');
      await new Promise(resolve => setTimeout(resolve, 1500));
      updateStepStatus('fetch', 'completed');

      // Step 3-7: Process with AI
      updateStepStatus('analyze', 'processing');
      await new Promise(resolve => setTimeout(resolve, 2000));
      updateStepStatus('analyze', 'completed');

      updateStepStatus('group', 'processing');
      await new Promise(resolve => setTimeout(resolve, 1500));
      updateStepStatus('group', 'completed');

      updateStepStatus('notes', 'processing');
      await new Promise(resolve => setTimeout(resolve, 2000));
      updateStepStatus('notes', 'completed');

      updateStepStatus('flashcards', 'processing');
      await new Promise(resolve => setTimeout(resolve, 1500));
      updateStepStatus('flashcards', 'completed');

      updateStepStatus('quiz', 'processing');
      await new Promise(resolve => setTimeout(resolve, 2000));
      updateStepStatus('quiz', 'completed');

      // Process the playlist
      const course = await youtubeAIService.processPlaylistWithAI(
        playlistUrl,
        instructorName,
        maxVideos
      );

      // Step 8: Save course
      updateStepStatus('save', 'processing');      // Save to Firebase
      await createCourse({
        title: course.title,
        description: course.description,
        instructor: course.instructor,
        instructorId: currentUser?.uid || 'anonymous',
        category: course.category,
        level: course.level as 'Beginner' | 'Intermediate' | 'Advanced',
        price: 0,
        duration: course.duration,
        rating: 0,
        studentsCount: 0,
        imageUrl: course.thumbnail,
        modules: course.modules.map(module => ({
          id: module.id,
          title: module.name,
          description: module.description,
          duration: '30m', // estimated
          order: module.order,
          lessons: module.videos.map((video, index) => ({
            id: video.id,
            title: video.title,
            description: video.description,
            duration: video.duration,
            order: index + 1,
            videoUrl: video.url,
            content: video.notes,
            resources: []
          })),          quiz: {
            id: `quiz-${module.id}`,
            title: `${module.name} Quiz`,
            description: `Test your understanding of ${module.name}`,
            questions: module.quiz.map((q, index) => ({
              id: `q-${index}`,
              question: q.question,
              type: 'multiple-choice' as const,
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
              points: 10
            })),
            timeLimit: 30,
            passingScore: 70,
            attempts: 3
          }
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublished: true
      });

      updateStepStatus('save', 'completed');
      setResult(course);

    } catch (err) {
      console.error('Error processing playlist:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      
      // Mark current processing step as error
      const currentStep = processingSteps.find(step => step.status === 'processing');
      if (currentStep) {
        updateStepStatus(currentStep.id, 'error');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const StepIndicator = ({ step }: { step: ProcessingStep }) => {
    const getIcon = () => {
      switch (step.status) {
        case 'completed':
          return <CheckCircle className="h-5 w-5 text-green-500" />;
        case 'processing':
          return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
        case 'error':
          return <AlertCircle className="h-5 w-5 text-red-500" />;
        default:
          return <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>;
      }
    };

    const getColor = () => {
      switch (step.status) {
        case 'completed':
          return 'text-green-700 bg-green-50 border-green-200';
        case 'processing':
          return 'text-blue-700 bg-blue-50 border-blue-200';
        case 'error':
          return 'text-red-700 bg-red-50 border-red-200';
        default:
          return 'text-gray-600 bg-gray-50 border-gray-200';
      }
    };

    return (
      <div className={`flex items-center space-x-3 p-4 rounded-xl border ${getColor()} transition-all duration-300`}>
        {getIcon()}
        <div className="flex-1">
          <div className="font-semibold">{step.label}</div>
          <div className="text-sm opacity-75">{step.description}</div>
        </div>
      </div>
    );
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center bg-white rounded-3xl shadow-xl p-12 max-w-md">
          <div className="bg-gradient-to-br from-blue-500 to-purple-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Brain className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to use the YouTube AI Agent.</p>
          <button
            onClick={() => navigate('/auth')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-600/20 to-transparent rounded-full animate-pulse"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-600/20 to-transparent rounded-full animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-full mb-8">
              <Brain className="h-8 w-8 text-yellow-300 mr-3" />
              <Youtube className="h-8 w-8 text-red-400 mr-3" />
              <Sparkles className="h-8 w-8 text-blue-300" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                YouTube AI Agent
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto text-blue-100/90 leading-relaxed">
              Transform any YouTube playlist into a comprehensive learning experience with AI-powered notes, 
              flashcards, quizzes, and intelligent module organization.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Brain className="h-8 w-8 text-yellow-300" />
                </div>
                <div className="text-sm font-semibold">AI Analysis</div>
              </div>
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <FileText className="h-8 w-8 text-green-300" />
                </div>
                <div className="text-sm font-semibold">Smart Notes</div>
              </div>
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Zap className="h-8 w-8 text-orange-300" />
                </div>
                <div className="text-sm font-semibold">Flashcards</div>
              </div>
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <HelpCircle className="h-8 w-8 text-purple-300" />
                </div>
                <div className="text-sm font-semibold">Auto Quizzes</div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg className="relative block w-full h-16" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39C398.88,31.83,313.53,70.53,226.84,92.83c-33.22,8.57-68.48,15.37-104.6,19.88v7.29H1200V92.83C1146.07,83.48,1013.25,92.83,985.66,92.83z" fill="#f8fafc"></path>
          </svg>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {!isProcessing && !result && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-8 border border-white/20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Create Your AI-Powered Course</h2>
              <p className="text-gray-600 text-lg">Paste a YouTube playlist URL and let our AI transform it into a comprehensive learning experience</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    YouTube Playlist URL *
                  </label>
                  <div className="relative">
                    <Youtube className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
                    <input
                      type="url"
                      value={playlistUrl}
                      onChange={(e) => setPlaylistUrl(e.target.value)}
                      placeholder="https://www.youtube.com/playlist?list=..."
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Instructor Name *
                  </label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500" />
                    <input
                      type="text"
                      value={instructorName}
                      onChange={(e) => setInstructorName(e.target.value)}
                      placeholder="Enter instructor or creator name"
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Maximum Videos to Process
                  </label>
                  <div className="relative">
                    <Target className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-500" />
                    <select
                      value={maxVideos}
                      onChange={(e) => setMaxVideos(parseInt(e.target.value))}
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-lg appearance-none"
                    >
                      <option value={5}>5 videos</option>
                      <option value={10}>10 videos</option>
                      <option value={15}>15 videos</option>
                      <option value={20}>20 videos</option>
                      <option value={30}>30 videos</option>
                      <option value={50}>50 videos</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Sparkles className="h-6 w-6 text-yellow-500 mr-2" />
                  What You'll Get
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-800">AI-Generated Study Notes</div>
                      <div className="text-sm text-gray-600">Comprehensive notes with key concepts and diagrams</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-800">Smart Flashcards</div>
                      <div className="text-sm text-gray-600">Interactive flashcards for each video's key points</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-800">Module Quizzes</div>
                      <div className="text-sm text-gray-600">Comprehension quizzes for each learning module</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-800">Intelligent Organization</div>
                      <div className="text-sm text-gray-600">Videos grouped into logical learning modules</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <div className="text-red-700">{error}</div>
              </div>
            )}

            <div className="mt-8 text-center">
              <button
                onClick={processPlaylist}
                disabled={isProcessing}
                className="group bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white px-12 py-4 rounded-2xl transition-all duration-500 font-bold text-lg flex items-center space-x-3 mx-auto shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Brain className="h-6 w-6" />
                <span>Process with AI</span>
                <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Brain className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">AI is Processing Your Course</h2>
              <p className="text-gray-600 text-lg">This may take a few minutes depending on the playlist size</p>
            </div>

            <div className="space-y-4 max-w-3xl mx-auto">
              {processingSteps.map((step) => (
                <StepIndicator key={step.id} step={step} />
              ))}
            </div>
          </div>
        )}

        {result && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Course Created Successfully!</h2>
              <p className="text-gray-600 text-lg">Your AI-powered course is ready for learning</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 mb-8">
              <div className="flex items-start space-x-6">
                <img
                  src={result.thumbnail}
                  alt={result.title}
                  className="w-32 h-24 object-cover rounded-xl flex-shrink-0"
                />
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{result.title}</h3>
                  <p className="text-gray-600 mb-4">{result.description}</p>
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{result.instructor}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{result.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{result.modules?.length || 0} modules</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Play className="h-4 w-4" />
                      <span>{result.totalVideos} videos</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">AI Notes Generated</h4>
                <p className="text-gray-600 text-sm">Detailed study notes for each video with key concepts and examples</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="bg-yellow-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-yellow-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Flashcards Created</h4>
                <p className="text-gray-600 text-sm">Interactive flashcards to reinforce learning and memory retention</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <HelpCircle className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Quizzes Ready</h4>
                <p className="text-gray-600 text-sm">Comprehension quizzes for each module to test understanding</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => navigate(`/course/${result.id}`)}
                className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-bold text-lg flex items-center space-x-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                <BookOpen className="h-6 w-6" />
                <span>Start Learning</span>
                <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-white text-gray-700 px-8 py-4 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-bold text-lg border-2 border-gray-200 hover:border-gray-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                Create Another Course
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YouTubeAIAgent;
