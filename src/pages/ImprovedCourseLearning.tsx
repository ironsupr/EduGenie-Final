import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ChevronDown, 
  ChevronRight, 
  Play, 
  FileText, 
  MessageCircle,
  Download,
  Bookmark,
  Share2,
  Clock,
  Users,
  BookOpen,
  CheckCircle,
  PlayCircle,
  Brain,
  Zap,
  HelpCircle,
  Timer,
  Loader2,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { getCourse } from '../services/courseService';
import { geminiService } from '../services/geminiService';
import { Course, Module, Lesson } from '../types';

interface LessonData extends Lesson {
  notes?: string;
  aiGeneratedNotes?: string;
  flashcards?: Array<{ question: string; answer: string; }>;
  aiQuiz?: {
    questions: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
    }>;
  };
}

interface ModuleData extends Module {
  lessons: LessonData[];
}

interface EnhancedCourse extends Course {
  modules: ModuleData[];
}

const ImprovedCourseLearning = () => {
  const { courseId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [currentLesson, setCurrentLesson] = useState<{moduleId: string; lessonId: string} | null>(null);
  const [course, setCourse] = useState<EnhancedCourse | null>(null);
  const [loading, setLoading] = useState(true);
  
  // AI Content Generation State
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{ [lessonId: string]: {
    notes?: string;
    flashcards?: Array<{ question: string; answer: string; }>;
    quiz?: {
      questions: Array<{
        question: string;
        options: string[];
        correctAnswer: number;
        explanation: string;
      }>;
    };
  } }>({});

  // Flashcards State
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  
  // Quiz State
  const [currentQuizAnswers, setCurrentQuizAnswers] = useState<{ [key: number]: number }>({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) return;
      
      try {
        setLoading(true);
        const courseData = await getCourse(courseId);
        setCourse(courseData as EnhancedCourse);
        
        if (courseData && courseData.modules && courseData.modules.length > 0) {
          const firstModule = courseData.modules[0];
          setExpandedModules([firstModule.id]);
          if (firstModule.lessons && firstModule.lessons.length > 0) {
            setCurrentLesson({
              moduleId: firstModule.id,
              lessonId: firstModule.lessons[0].id
            });
          }
        }
      } catch (error) {
        console.error('Error loading course:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const selectLesson = (moduleId: string, lessonId: string) => {
    setCurrentLesson({ moduleId, lessonId });
  };

  const getCurrentLesson = (): LessonData | null => {
    if (!course || !currentLesson) return null;
    
    const module = course.modules?.find(m => m.id === currentLesson.moduleId);
    if (!module) return null;
    
    const lesson = module.lessons?.find(l => l.id === currentLesson.lessonId);
    return lesson || null;
  };

  const getVideoEmbedUrl = (videoUrl: string): string | null => {
    if (!videoUrl) return null;
    if (videoUrl.includes('youtube.com/watch?v=')) {
      const videoId = videoUrl.split('v=')[1]?.split('&')[0];
      return 'https://www.youtube.com/embed/' + videoId;
    } else if (videoUrl.includes('youtu.be/')) {
      const videoId = videoUrl.split('/').pop();
      return 'https://www.youtube.com/embed/' + videoId;
    }
    return videoUrl;
  };

  const currentLessonData = getCurrentLesson();

  // Helper functions to calculate course progress and duration
  const calculateCourseDuration = (): number => {
    if (!course?.modules) return 0;
    let totalMinutes = 0;
    course.modules.forEach(module => {
      module.lessons?.forEach(lesson => {
        if (lesson.duration) {
          // Parse duration like "5:30" or "1:05:30" into minutes
          const parts = lesson.duration.split(':');
          if (parts.length === 2) {
            totalMinutes += parseInt(parts[0]) + parseInt(parts[1]) / 60;
          } else if (parts.length === 3) {
            totalMinutes += parseInt(parts[0]) * 60 + parseInt(parts[1]) + parseInt(parts[2]) / 60;
          }
        }
      });
    });
    return totalMinutes;
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const calculateProgress = () => {
    if (!course?.modules) return { percentage: 0, completed: 0, total: 0 };
    const totalLessons = course.modules.reduce((acc, module) => acc + (module.lessons?.length || 0), 0);
    const completedLessons = 0; // We'll implement lesson completion tracking
    const percentage = Math.round((completedLessons / Math.max(totalLessons, 1)) * 100);
    return { percentage, completed: completedLessons, total: totalLessons };
  };

  // AI Content Generation Functions
  const generateAINotes = async (lesson: LessonData) => {
    if (!lesson || isGeneratingNotes) return;
    
    // Check cache first
    const cacheKey = `ai-notes-${courseId}-${lesson.id}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const cachedData = JSON.parse(cached);
        // Use cached data if it's less than 24 hours old
        const cacheAge = new Date().getTime() - new Date(cachedData.timestamp).getTime();
        if (cacheAge < 24 * 60 * 60 * 1000) { // 24 hours
          console.log('Using cached AI notes');
          setGeneratedContent(prev => ({
            ...prev,
            [lesson.id]: {
              ...prev[lesson.id],
              notes: cachedData.notes
            }
          }));
          return;
        }
      } catch (e) {
        console.warn('Failed to parse cached notes');
      }
    }
    
    console.log('Generating AI notes for lesson:', lesson.title);
    setIsGeneratingNotes(true);
    try {
      // Fast and focused prompt for quicker generation
      const notesPrompt = `Create concise study notes for: "${lesson.title}"

Key points to cover:
- Main concepts (3-4 bullet points)
- Important definitions (2-3 terms)  
- Practical applications
- Study tips for exam prep

Keep it focused and under 200 words for quick reading.

Topic: ${lesson.description || lesson.title}
Duration: ${lesson.duration}`;
      
      console.log('Calling Gemini service...');
      const notesContent = await geminiService.generateText(notesPrompt);
      console.log('Notes generated successfully');
      
      setGeneratedContent(prev => ({
        ...prev,
        [lesson.id]: {
          ...prev[lesson.id],
          notes: notesContent
        }
      }));
      
      // Cache with lesson-specific identifier
      localStorage.setItem(cacheKey, JSON.stringify({
        notes: notesContent,
        timestamp: new Date().toISOString(),
        lessonTitle: lesson.title
      }));
      
    } catch (error) {
      console.error('Error generating AI notes:', error);
      // Provide helpful fallback content
      const fallbackNotes = `# ${lesson.title}

## Overview
${lesson.description || 'Educational content covering key concepts and practical applications.'}

## Study Notes
- **Duration**: ${lesson.duration}
- **Main Focus**: Core concepts and practical understanding
- **Key Topics**: Based on the lesson title and content
- **Study Tip**: Review this content and take notes on the most important points

## Quick Review Points
- What are the main concepts covered?
- How can you apply this knowledge practically?
- What questions would you ask to test understanding?

*Note: AI generation temporarily unavailable. ${error instanceof Error && error.message.includes('quota') ? 'Daily quota exceeded - try again tomorrow.' : 'Please check your internet connection.'}*`;

      setGeneratedContent(prev => ({
        ...prev,
        [lesson.id]: {
          ...prev[lesson.id],
          notes: fallbackNotes
        }
      }));
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  // AI Flashcards Generation
  const generateAIFlashcards = async (lesson: LessonData) => {
    if (!lesson || isGeneratingFlashcards) return;
    
    // Check cache first
    const cacheKey = `ai-flashcards-${courseId}-${lesson.id}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const cachedData = JSON.parse(cached);
        // Use cached data if it's less than 24 hours old
        const cacheAge = new Date().getTime() - new Date(cachedData.timestamp).getTime();
        if (cacheAge < 24 * 60 * 60 * 1000) { // 24 hours
          console.log('Using cached AI flashcards');
          setGeneratedContent(prev => ({
            ...prev,
            [lesson.id]: {
              ...prev[lesson.id],
              flashcards: cachedData.flashcards
            }
          }));
          return;
        }
      } catch (e) {
        console.warn('Failed to parse cached flashcards');
      }
    }
    
    console.log('Generating AI flashcards for lesson:', lesson.title);
    setIsGeneratingFlashcards(true);
    try {
      const flashcardsPrompt = `Create 6-8 flashcards for quick knowledge testing on: "${lesson.title}"

Generate flashcards that test:
- Key concepts and definitions
- Important facts to remember
- Practical applications
- Quick recall questions

Topic: ${lesson.description || lesson.title}
Duration: ${lesson.duration}

Return ONLY a JSON array format:
[
  {"question": "What is...", "answer": "Brief answer..."},
  {"question": "How does...", "answer": "Explanation..."}
]

Keep questions concise and answers clear for quick study.`;
      
      console.log('Calling Gemini service for flashcards...');
      const response = await geminiService.generateText(flashcardsPrompt);
      console.log('Flashcards generated successfully');
      
      // Clean and parse JSON response
      const cleanedResponse = response.replace(/```json|```/g, '').trim();
      let flashcards;
      
      try {
        flashcards = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.warn('Failed to parse flashcards JSON, using fallback');
        // Fallback if parsing fails
        flashcards = [
          {
            question: `What is the main topic of "${lesson.title}"?`,
            answer: lesson.description || "Key concepts from this lesson"
          },
          {
            question: "What are the key takeaways from this lesson?",
            answer: "Important concepts and practical applications covered in the video"
          }
        ];
      }
      
      setGeneratedContent(prev => ({
        ...prev,
        [lesson.id]: {
          ...prev[lesson.id],
          flashcards: flashcards
        }
      }));
      
      // Cache the flashcards
      localStorage.setItem(cacheKey, JSON.stringify({
        flashcards: flashcards,
        timestamp: new Date().toISOString(),
        lessonTitle: lesson.title
      }));
      
    } catch (error) {
      console.error('Error generating AI flashcards:', error);
      // Set fallback flashcards with helpful content
      const fallbackFlashcards = [
        {
          question: `What is "${lesson.title}" about?`,
          answer: lesson.description || "This lesson covers important concepts and practical applications."
        },
        {
          question: "What should you focus on when studying this lesson?",
          answer: "Key concepts, practical applications, and how the content relates to your learning goals."
        },
        {
          question: "How long is this lesson?",
          answer: `${lesson.duration} - Plan your study time accordingly.`
        },
        {
          question: "Study Tip",
          answer: error instanceof Error && error.message.includes('quota') 
            ? "AI generation temporarily unavailable (quota exceeded). Try again tomorrow." 
            : "Take notes while watching and review key concepts multiple times."
        }
      ];
      
      setGeneratedContent(prev => ({
        ...prev,
        [lesson.id]: {
          ...prev[lesson.id],
          flashcards: fallbackFlashcards
        }
      }));
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  // AI Quiz Generation
  const generateAIQuiz = async (lesson: LessonData) => {
    if (!lesson || isGeneratingQuiz) return;
    
    // Check cache first
    const cacheKey = `ai-quiz-${courseId}-${lesson.id}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const cachedData = JSON.parse(cached);
        // Use cached data if it's less than 24 hours old
        const cacheAge = new Date().getTime() - new Date(cachedData.timestamp).getTime();
        if (cacheAge < 24 * 60 * 60 * 1000) { // 24 hours
          console.log('Using cached AI quiz');
          setGeneratedContent(prev => ({
            ...prev,
            [lesson.id]: {
              ...prev[lesson.id],
              quiz: cachedData.quiz
            }
          }));
          return;
        }
      } catch (e) {
        console.warn('Failed to parse cached quiz');
      }
    }
    
    console.log('Generating AI quiz for lesson:', lesson.title);
    setIsGeneratingQuiz(true);
    try {
      const quizPrompt = `Create a 5-question multiple choice quiz for: "${lesson.title}"

Generate questions that test understanding of:
- Core concepts
- Key definitions
- Practical knowledge
- Application scenarios

Topic: ${lesson.description || lesson.title}
Duration: ${lesson.duration}

Return ONLY a JSON object format:
{
  "questions": [
    {
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this answer is correct..."
    }
  ]
}

Make questions challenging but fair for knowledge testing.`;
      
      console.log('Calling Gemini service for quiz...');
      const response = await geminiService.generateText(quizPrompt);
      console.log('Quiz generated successfully');
      
      // Clean and parse JSON response
      const cleanedResponse = response.replace(/```json|```/g, '').trim();
      let quizData;
      
      try {
        quizData = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.warn('Failed to parse quiz JSON, using fallback');
        // Fallback if parsing fails
        quizData = {
          questions: [
            {
              question: `What is the main focus of "${lesson.title}"?`,
              options: [
                lesson.title,
                "Unrelated Topic A",
                "Unrelated Topic B",
                "Unrelated Topic C"
              ],
              correctAnswer: 0,
              explanation: `This lesson focuses on ${lesson.title} as indicated by the title and content.`
            }
          ]
        };
      }
      
      setGeneratedContent(prev => ({
        ...prev,
        [lesson.id]: {
          ...prev[lesson.id],
          quiz: quizData
        }
      }));
      
      // Cache the quiz
      localStorage.setItem(cacheKey, JSON.stringify({
        quiz: quizData,
        timestamp: new Date().toISOString(),
        lessonTitle: lesson.title
      }));
      
    } catch (error) {
      console.error('Error generating AI quiz:', error);
      // Set fallback quiz with helpful content
      const fallbackQuiz = {
        questions: [
          {
            question: `What is the main topic of "${lesson.title}"?`,
            options: [
              lesson.description || "The main educational content",
              "Completely unrelated topic",
              "Random subject matter",
              "Off-topic information"
            ],
            correctAnswer: 0,
            explanation: `This lesson focuses on ${lesson.title}. ${lesson.description || ''}`
          },
          {
            question: "How long is this lesson?",
            options: [
              lesson.duration,
              "5 minutes",
              "30 minutes", 
              "2 hours"
            ],
            correctAnswer: 0,
            explanation: `The lesson duration is ${lesson.duration}.`
          },
          {
            question: "Study Status",
            options: [
              error instanceof Error && error.message.includes('quota') 
                ? "AI generation quota exceeded - try tomorrow" 
                : "AI generation temporarily unavailable",
              "Ready to study",
              "Content loaded",
              "Quiz active"
            ],
            correctAnswer: 0,
            explanation: error instanceof Error && error.message.includes('quota')
              ? "You've reached the daily quota for AI generation. The quota will reset tomorrow."
              : "There was an issue generating the quiz. Please check your internet connection and try again."
          }
        ]
      };
      
      setGeneratedContent(prev => ({
        ...prev,
        [lesson.id]: {
          ...prev[lesson.id],
          quiz: fallbackQuiz
        }
      }));
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Flashcard navigation functions
  const nextFlashcard = () => {
    const flashcards = generatedContent[getCurrentLesson()?.id || '']?.flashcards;
    if (flashcards && currentFlashcard < flashcards.length - 1) {
      setCurrentFlashcard(prev => prev + 1);
      setShowAnswer(false);
    }
  };

  const prevFlashcard = () => {
    if (currentFlashcard > 0) {
      setCurrentFlashcard(prev => prev - 1);
      setShowAnswer(false);
    }
  };

  // Quiz functions
  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    setCurrentQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const submitQuiz = () => {
    const quiz = generatedContent[getCurrentLesson()?.id || '']?.quiz;
    if (!quiz) return;
    
    let correct = 0;
    quiz.questions.forEach((question, index) => {
      if (currentQuizAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    
    const score = Math.round((correct / quiz.questions.length) * 100);
    setQuizScore(score);
    setShowQuizResults(true);
  };

  const resetQuiz = () => {
    setCurrentQuizAnswers({});
    setShowQuizResults(false);
    setQuizScore(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h2>
          <p className="text-gray-600">The requested course could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar - Course Content */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Course Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{course.title}</h2>
              <p className="text-sm text-gray-500">by {course.instructor || 'Unknown'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(calculateCourseDuration())}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-4 h-4" />
              <span>{course.level || 'Beginner'}</span>
            </div>
          </div>
          
          <div className="mt-4">
            {(() => {
              const progress = calculateProgress();
              return (
                <>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Course Progress</span>
                    <span>{progress.completed}/{progress.total} lessons</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${progress.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    Total Duration: {formatDuration(calculateCourseDuration())}
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Modules List */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Course Content</h3>
          <div className="space-y-2">
            {course.modules?.map((module, moduleIndex) => (
              <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full p-4 text-left bg-white hover:bg-gray-50 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                      {moduleIndex + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{module.title}</p>
                      <p className="text-xs text-gray-500">{module.lessons?.length || 0} lessons</p>
                    </div>
                  </div>
                  {expandedModules.includes(module.id) ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {expandedModules.includes(module.id) && (
                  <div className="bg-gray-50 border-t border-gray-200">
                    {module.lessons?.map((lesson) => {
                      const isActive = currentLesson?.lessonId === lesson.id && currentLesson?.moduleId === module.id;
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => selectLesson(module.id, lesson.id)}
                          className={'w-full p-3 text-left flex items-center gap-3 hover:bg-white transition-colors ' + (isActive ? 'bg-indigo-50 border-r-4 border-indigo-600' : '')}
                        >
                          <div className="flex-shrink-0">
                            {isActive ? (
                              <PlayCircle className="w-5 h-5 text-indigo-600" />
                            ) : (
                              <Play className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{lesson.title}</p>
                            <p className="text-xs text-gray-500">{lesson.duration || '5:00'}</p>
                          </div>
                          <CheckCircle className="w-4 h-4 text-gray-300" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Video Player Section */}
        <div className="bg-black relative">
          <div className="aspect-video bg-gray-900 flex items-center justify-center">
            {currentLessonData && currentLessonData.videoUrl ? (
              <iframe
                src={getVideoEmbedUrl(currentLessonData.videoUrl) || ''}
                title={currentLessonData.title}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : (
              <div className="text-center text-white p-8">
                <PlayCircle className="w-20 h-20 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">Welcome to the Course</h3>
                <p className="text-gray-400">Select a lesson from the sidebar to start learning</p>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 bg-white">
          <div className="max-w-4xl mx-auto p-6">
            {/* Lesson Title */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {currentLessonData?.title || course.title}
              </h1>
              <p className="text-gray-600">
                {currentLessonData?.description || course.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 mb-8">
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <Bookmark className="w-4 h-4" />
                Bookmark
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
                Resources
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'overview', label: 'Overview', icon: FileText },
                  { id: 'ai-notes', label: 'AI Notes', icon: Brain },
                  { id: 'flashcards', label: 'Flashcards', icon: Zap },
                  { id: 'quiz', label: 'Quiz', icon: HelpCircle },
                  { id: 'discussion', label: 'Discussion', icon: MessageCircle }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={'py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ' + (activeTab === tab.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300')}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="prose max-w-none">
              {activeTab === 'overview' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">About this lesson</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {currentLessonData?.content || currentLessonData?.description || 
                     'This lesson will cover important concepts and practical applications. Make sure to take notes and practice the examples shown in the video.'}
                  </p>
                </div>
              )}

              {activeTab === 'ai-notes' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      AI Study Notes
                    </h3>
                    <button
                      onClick={() => generateAINotes(currentLessonData!)}
                      disabled={isGeneratingNotes || !currentLessonData}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isGeneratingNotes ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate Notes
                        </>
                      )}
                    </button>
                  </div>
                  
                  {generatedContent[currentLessonData?.id || '']?.notes ? (
                    <div className="prose max-w-none">
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-2 text-purple-800 font-medium mb-2">
                          <Sparkles className="w-4 h-4" />
                          AI-Generated Study Notes
                        </div>
                        <p className="text-purple-700 text-sm">
                          These notes are optimized for quick review and exam preparation.
                        </p>
                      </div>
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                        {generatedContent[currentLessonData?.id || '']?.notes}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {isGeneratingNotes ? 'Creating AI Notes...' : 'Ready to Generate AI Notes?'}
                      </h4>
                      <p className="mb-6">
                        {isGeneratingNotes 
                          ? 'Our AI is analyzing the lesson content to create focused study notes for you.'
                          : 'Get AI-powered study notes that highlight key concepts and important information for quick review.'
                        }
                      </p>
                      {isGeneratingNotes && (
                        <div className="flex justify-center">
                          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'flashcards' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-600" />
                      AI Flashcards
                    </h3>
                    <button
                      onClick={() => generateAIFlashcards(currentLessonData!)}
                      disabled={isGeneratingFlashcards || !currentLessonData}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isGeneratingFlashcards ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate Flashcards
                        </>
                      )}
                    </button>
                  </div>
                  
                  {generatedContent[currentLessonData?.id || '']?.flashcards && generatedContent[currentLessonData?.id || '']?.flashcards!.length > 0 ? (
                    <div className="max-w-2xl mx-auto">
                      {(() => {
                        const flashcards = generatedContent[currentLessonData!.id]?.flashcards!;
                        const flashcard = flashcards[currentFlashcard];
                        return (
                          <div className="bg-white border-2 border-yellow-200 rounded-xl p-8 shadow-lg">
                            <div className="text-center mb-6">
                              <div className="flex justify-between items-center mb-4">
                                <span className="text-sm text-gray-500">
                                  {currentFlashcard + 1} of {flashcards.length}
                                </span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={prevFlashcard}
                                    disabled={currentFlashcard === 0}
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                                  >
                                    <ArrowLeft className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={nextFlashcard}
                                    disabled={currentFlashcard >= (flashcards.length - 1)}
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                                  >
                                    <ArrowRight className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              
                              <div className="min-h-[200px] flex items-center justify-center">
                                {!showAnswer ? (
                                  <div className="text-center">
                                    <h4 className="text-xl font-semibold text-gray-900 mb-4">
                                      {flashcard.question}
                                    </h4>
                                    <button
                                      onClick={() => setShowAnswer(true)}
                                      className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors"
                                    >
                                      Show Answer
                                    </button>
                                  </div>
                                ) : (
                                  <div className="text-center">
                                    <h4 className="text-lg font-medium text-gray-700 mb-4">
                                      {flashcard.question}
                                    </h4>
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                      <p className="text-gray-800 font-medium">{flashcard.answer}</p>
                                    </div>
                                    <button
                                      onClick={() => setShowAnswer(false)}
                                      className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                                    >
                                      Hide Answer
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Zap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {isGeneratingFlashcards ? 'Creating Flashcards...' : 'Ready to Create Flashcards?'}
                      </h4>
                      <p className="mb-6">
                        {isGeneratingFlashcards 
                          ? 'Our AI is creating interactive flashcards to help you test your knowledge.'
                          : 'Generate AI-powered flashcards for quick knowledge testing and review.'
                        }
                      </p>
                      {isGeneratingFlashcards && (
                        <div className="flex justify-center">
                          <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'quiz' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-green-600" />
                      AI Quiz
                    </h3>
                    <div className="flex gap-2">
                      {showQuizResults && (
                        <button
                          onClick={resetQuiz}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Reset Quiz
                        </button>
                      )}
                      <button
                        onClick={() => generateAIQuiz(currentLessonData!)}
                        disabled={isGeneratingQuiz || !currentLessonData}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isGeneratingQuiz ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Generate Quiz
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {generatedContent[currentLessonData?.id || '']?.quiz && generatedContent[currentLessonData?.id || '']?.quiz!.questions.length > 0 ? (
                    <div className="max-w-3xl mx-auto">
                      {(() => {
                        const quiz = generatedContent[currentLessonData!.id]?.quiz!;
                        return (
                          <div>
                            {showQuizResults ? (
                              <div className="text-center py-8">
                                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                                  quizScore! >= 80 ? 'bg-green-100 text-green-600' : 
                                  quizScore! >= 60 ? 'bg-yellow-100 text-yellow-600' : 
                                  'bg-red-100 text-red-600'
                                }`}>
                                  <span className="text-2xl font-bold">{quizScore}%</span>
                                </div>
                                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                                  Quiz Complete!
                                </h4>
                                <p className="text-gray-600 mb-6">
                                  You scored {quizScore}% on this quiz. 
                                  {quizScore! >= 80 ? ' Excellent work!' : 
                                   quizScore! >= 60 ? ' Good job!' : ' Keep studying!'}
                                </p>
                                
                                <div className="text-left space-y-4">
                                  {quiz.questions.map((question, index) => (
                                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                                      <h5 className="font-medium text-gray-900 mb-2">
                                        {index + 1}. {question.question}
                                      </h5>
                                      <div className="space-y-2">
                                        {question.options.map((option, optIndex) => (
                                          <div key={optIndex} className={`p-2 rounded ${
                                            optIndex === question.correctAnswer ? 'bg-green-100 text-green-800' :
                                            optIndex === currentQuizAnswers[index] && optIndex !== question.correctAnswer ? 'bg-red-100 text-red-800' :
                                            'bg-white'
                                          }`}>
                                            {option}
                                            {optIndex === question.correctAnswer && ' ✓'}
                                            {optIndex === currentQuizAnswers[index] && optIndex !== question.correctAnswer && ' ✗'}
                                          </div>
                                        ))}
                                      </div>
                                      <p className="text-sm text-gray-600 mt-2 italic">
                                        {question.explanation}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="space-y-6">
                                  {quiz.questions.map((question, index) => (
                                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                                      <h4 className="text-lg font-medium text-gray-900 mb-4">
                                        {index + 1}. {question.question}
                                      </h4>
                                      <div className="space-y-2">
                                        {question.options.map((option, optIndex) => (
                                          <label key={optIndex} className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                                            <input
                                              type="radio"
                                              name={`question-${index}`}
                                              value={optIndex}
                                              checked={currentQuizAnswers[index] === optIndex}
                                              onChange={() => handleQuizAnswer(index, optIndex)}
                                              className="mr-3 text-green-600"
                                            />
                                            <span className="text-gray-700">{option}</span>
                                          </label>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                
                                <div className="text-center mt-8">
                                  <button
                                    onClick={submitQuiz}
                                    disabled={Object.keys(currentQuizAnswers).length < quiz.questions.length}
                                    className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    Submit Quiz
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <HelpCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {isGeneratingQuiz ? 'Creating Quiz...' : 'Ready to Test Your Knowledge?'}
                      </h4>
                      <p className="mb-6">
                        {isGeneratingQuiz 
                          ? 'Our AI is creating a comprehensive quiz to test your understanding.'
                          : 'Generate an AI-powered quiz with multiple choice questions to test your knowledge.'
                        }
                      </p>
                      {isGeneratingQuiz && (
                        <div className="flex justify-center">
                          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'notes' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Lesson Notes</h3>
                  {currentLessonData?.content ? (
                    <div dangerouslySetInnerHTML={{ __html: currentLessonData.content }} />
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No notes available for this lesson yet.</p>
                      <p className="text-sm">Notes will be added as the course develops.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'discussion' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Discussion</h3>
                  <div className="text-center py-12">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No discussions yet</h4>
                    <p className="text-gray-600 mb-6">Be the first to start a discussion about this lesson!</p>
                    <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                      Start Discussion
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'ai-flashcards' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      AI Flashcards
                    </h3>
                    <button
                      onClick={() => generateAIFlashcards(currentLessonData!)}
                      disabled={isGeneratingFlashcards || !currentLessonData}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isGeneratingFlashcards ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate Flashcards
                        </>
                      )}
                    </button>
                  </div>
                  
                  {generatedContent[currentLessonData?.id || '']?.flashcards && generatedContent[currentLessonData?.id || '']?.flashcards.length > 0 ? (
                    <div className="space-y-4">
                      {generatedContent[currentLessonData.id].flashcards.map((flashcard, index) => (
                        <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <p className="text-purple-800 font-medium">{flashcard.question}</p>
                          {showAnswer && (
                            <p className="mt-2 text-gray-700">{flashcard.answer}</p>
                          )}
                        </div>
                      ))}
                      
                      {/* Flashcard navigation buttons */}
                      <div className="flex justify-between text-sm text-gray-600 mt-4">
                        <button 
                          onClick={prevFlashcard} 
                          disabled={currentFlashcard === 0}
                          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <button 
                          onClick={nextFlashcard} 
                          disabled={currentFlashcard >= (generatedContent[currentLessonData.id].flashcards.length - 1)}
                          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {isGeneratingFlashcards ? 'Creating AI Flashcards...' : 'Ready to Generate AI Flashcards?'}
                      </h4>
                      <p className="mb-6">
                        {isGeneratingFlashcards 
                          ? 'Our AI is generating flashcards to help you test your knowledge and retain key concepts.'
                          : 'Get AI-powered flashcards that challenge your understanding and improve recall.'
                        }
                      </p>
                      {isGeneratingFlashcards && (
                        <div className="flex justify-center">
                          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'ai-quiz' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      AI Quiz
                    </h3>
                    <button
                      onClick={() => generateAIQuiz(currentLessonData!)}
                      disabled={isGeneratingQuiz || !currentLessonData}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isGeneratingQuiz ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate Quiz
                        </>
                      )}
                    </button>
                  </div>
                  
                  {showQuizResults ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <p className="text-green-800 font-medium">
                        Your Score: {quizScore !== null ? `${quizScore}%` : 'N/A'}
                      </p>
                      <button 
                        onClick={resetQuiz} 
                        className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Retry Quiz
                      </button>
                    </div>
                  ) : null}
                  
                  {generatedContent[currentLessonData?.id || '']?.quiz && generatedContent[currentLessonData?.id || '']?.quiz.questions.length > 0 ? (
                    <div className="space-y-4">
                      {generatedContent[currentLessonData.id].quiz.questions.map((question, index) => (
                        <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <p className="text-purple-800 font-medium">{question.question}</p>
                          <div className="mt-2">
                            {question.options.map((option, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <input 
                                  type="radio" 
                                  name={`question-${index}`} 
                                  value={idx} 
                                  onChange={() => handleQuizAnswer(index, idx)} 
                                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <label className="text-gray-700">{option}</label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      
                      {/* Submit button for quiz */}
                      <div className="flex justify-end">
                        <button 
                          onClick={submitQuiz} 
                          className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Submit Quiz
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {isGeneratingQuiz ? 'Creating AI Quiz...' : 'Ready to Generate AI Quiz?'}
                      </h4>
                      <p className="mb-6">
                        {isGeneratingQuiz 
                          ? 'Our AI is generating a quiz to test your knowledge and reinforce learning.'
                          : 'Get AI-powered quizzes that adapt to your knowledge level and challenge your understanding.'
                        }
                      </p>
                      {isGeneratingQuiz && (
                        <div className="flex justify-center">
                          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImprovedCourseLearning;
