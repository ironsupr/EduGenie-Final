import { useState, useEffect } from 'react';
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
import { aiNotesService, ExamReadyNotes } from '../services/aiNotesService';
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
    examNotes?: ExamReadyNotes;
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

  // Enhanced content parsing function
  const parseAndFormatContent = (content: string) => {
    if (!content) return [];
    
    const lines = content.split('\n').filter(line => line.trim());
    const sections = [];
    let currentList = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Check for timestamps with optional titles (e.g., "0:00 Introduction" or "0:00 - Getting Started")
      const timestampMatch = line.match(/^(\d{1,2}:\d{2}(?::\d{2})?)\s*[-–]?\s*(.*)$/);
      if (timestampMatch) {
        if (currentList.length > 0) {
          sections.push({ type: 'list', items: [...currentList] });
          currentList = [];
        }
        sections.push({
          type: 'timestamp',
          content: timestampMatch[1],
          title: timestampMatch[2] || null
        });
        continue;
      }
      
      // Check for chapter/section headers (all caps, starts with "Chapter", contains "Part", etc.)
      if (
        (line === line.toUpperCase() && line.length > 3) ||
        line.match(/^(Chapter|Part|Section|Module|Unit)\s+\d+/i) ||
        line.match(/^#+ /)
      ) {
        if (currentList.length > 0) {
          sections.push({ type: 'list', items: [...currentList] });
          currentList = [];
        }
        
        // Extract title and description if separated by colon or dash
        const headerMatch = line.replace(/^#+ /, '').match(/^([^:-]+)(?:[:-]\s*(.+))?$/);
        sections.push({
          type: 'chapter',
          content: headerMatch ? headerMatch[1].trim() : line,
          description: headerMatch && headerMatch[2] ? headerMatch[2].trim() : null
        });
        continue;
      }
      
      // Check for URLs with context
      const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
      if (urlMatch) {
        if (currentList.length > 0) {
          sections.push({ type: 'list', items: [...currentList] });
          currentList = [];
        }
        
        const beforeUrl = line.substring(0, line.indexOf(urlMatch[1])).trim();
        const afterUrl = line.substring(line.indexOf(urlMatch[1]) + urlMatch[1].length).trim();
        
        sections.push({
          type: 'link',
          url: urlMatch[1],
          title: beforeUrl || afterUrl || null,
          description: beforeUrl && afterUrl ? afterUrl : null
        });
        continue;
      }
      
      // Check for list items
      if (line.match(/^[-•*]\s+/) || line.match(/^\d+[\.)]\s+/)) {
        const listItem = line.replace(/^[-•*]\s+/, '').replace(/^\d+[\.)]\s+/, '');
        currentList.push(listItem);
        continue;
      }
      
      // Check for code blocks (lines with multiple spaces or common code indicators)
      if (
        line.match(/^    /) || 
        line.match(/^```/) ||
        line.match(/[{}();]/) && line.length < 100 ||
        line.match(/^import |^export |^function |^const |^let |^var /)
      ) {
        if (currentList.length > 0) {
          sections.push({ type: 'list', items: [...currentList] });
          currentList = [];
        }
        sections.push({
          type: 'code',
          content: line.replace(/^    /, '').replace(/^```\w*/, '').replace(/```$/, '')
        });
        continue;
      }
      
      // Check for highlights/important notes (lines with keywords like "important", "note", etc.)
      if (
        line.match(/^(Important|Note|Warning|Tip|Remember):/i) ||
        line.match(/^\*\*.*\*\*$/) ||
        line.match(/^!!/)
      ) {
        if (currentList.length > 0) {
          sections.push({ type: 'list', items: [...currentList] });
          currentList = [];
        }
        sections.push({
          type: 'highlight',
          content: line.replace(/^(Important|Note|Warning|Tip|Remember):\s*/i, '')
                      .replace(/^\*\*(.*)\*\*$/, '$1')
                      .replace(/^!!\s*/, '')
        });
        continue;
      }
      
      // Regular paragraphs
      if (currentList.length > 0) {
        sections.push({ type: 'list', items: [...currentList] });
        currentList = [];
      }
      
      if (line.length > 10) { // Only add substantial paragraphs
        sections.push({
          type: 'paragraph',
          content: line
        });
      }
    }
    
    // Add any remaining list items
    if (currentList.length > 0) {
      sections.push({ type: 'list', items: [...currentList] });
    }
    
    return sections;
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
              examNotes: cachedData.examNotes
            }
          }));
          return;
        }
      } catch (e) {
        console.warn('Failed to parse cached notes');
      }
    }
    
    console.log('Generating comprehensive AI notes for lesson:', lesson.title);
    setIsGeneratingNotes(true);
    try {
      // Use the comprehensive AI notes service
      const examNotes = await aiNotesService.generateExamReadyNotes(
        lesson.title,
        lesson.description || 'Educational content covering key concepts',
        lesson.content,
        course?.category || 'General',
        'Intermediate' // Could be dynamic based on course level
      );
      
      console.log('Comprehensive notes generated successfully');
      
      setGeneratedContent(prev => ({
        ...prev,
        [lesson.id]: {
          ...prev[lesson.id],
          examNotes: examNotes
        }
      }));
      
      // Cache with lesson-specific identifier
      localStorage.setItem(cacheKey, JSON.stringify({
        examNotes: examNotes,
        timestamp: new Date().toISOString(),
        lessonTitle: lesson.title
      }));
      
    } catch (error) {
      console.error('Error generating AI notes:', error);
      // Provide comprehensive fallback content
      const fallbackNotes: ExamReadyNotes = {
        summary: `Study guide for ${lesson.title}: This lesson covers essential concepts and practical applications needed for mastery of the topic.`,
        keyPoints: [
          {
            id: 'key1',
            title: `Core Concepts of ${lesson.title}`,
            description: 'Understanding the fundamental principles and how they apply in practice.',
            importance: 'Critical',
            examWeight: 9,
            memorization: 'Concept'
          },
          {
            id: 'key2',
            title: 'Practical Applications',
            description: 'Real-world scenarios where these concepts are used and applied.',
            importance: 'Important',
            examWeight: 7,
            memorization: 'Application'
          },
          {
            id: 'key3',
            title: 'Key Definitions',
            description: 'Important terminology and definitions to memorize for exams.',
            importance: 'Critical',
            examWeight: 8,
            memorization: 'Definition'
          }
        ],
        concepts: [
          {
            id: 'concept1',
            concept: lesson.title,
            simpleExplanation: `Think of ${lesson.title} as a building block in your learning journey.`,
            detailedExplanation: lesson.description || 'Detailed explanation of the concept and its significance.',
            realWorldExample: 'This concept applies in professional and academic contexts.',
            commonMistakes: ['Skipping foundational concepts', 'Not practicing enough'],
            relatedConcepts: ['Related topics', 'Connected ideas']
          }
        ],
        examQuestions: [
          {
            id: 'q1',
            question: `Define and explain ${lesson.title} in your own words.`,
            type: 'Short Answer',
            difficulty: 'Medium',
            answer: 'A comprehensive explanation covering key aspects and applications.',
            explanation: 'This tests your understanding of fundamental concepts.',
            examTips: 'Use clear structure and provide examples.',
            timeToSolve: '5-7 minutes'
          }
        ],
        practiceProblems: [
          {
            id: 'prob1',
            problem: `Apply the concepts from ${lesson.title} to solve a practical scenario.`,
            solution: 'Systematic approach using learned principles.',
            steps: ['Identify key concepts', 'Apply methodology', 'Verify solution'],
            skillTested: 'Application of knowledge',
            variants: ['Different scenarios with same principles']
          }
        ],
        mnemonics: [
          {
            id: 'mnem1',
            concept: lesson.title,
            mnemonic: `Remember the key aspects with an easy phrase or acronym.`,
            explanation: 'Use this memory device during exam preparation.',
            type: 'Phrase'
          }
        ],
        quickReview: {
          mustKnow: [
            `Definition of ${lesson.title}`,
            'Key applications',
            'Important formulas or principles'
          ],
          formulasToMemorize: ['Key formulas related to the topic'],
          keyTerms: [
            { term: lesson.title, definition: lesson.description || 'Core concept definition' }
          ],
          commonFormulas: [],
          lastMinuteTips: [
            'Review key definitions',
            'Practice application problems',
            'Understand core concepts'
          ]
        },
        studyTips: [
          'Create concept maps to visualize relationships',
          'Practice with varied examples',
          'Explain concepts to others',
          'Use active recall techniques'
        ],
        timeToMaster: lesson.duration || '2-3 hours'
      };

      setGeneratedContent(prev => ({
        ...prev,
        [lesson.id]: {
          ...prev[lesson.id],
          examNotes: fallbackNotes
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
    
    console.log('Generating topic-focused AI flashcards for lesson:', lesson.title);
    setIsGeneratingFlashcards(true);
    try {
      // Use the updated Gemini service for topic-focused content
      const analysisResult = await geminiService.analyzeVideoContent(
        lesson.title,
        lesson.description || 'Educational content covering key concepts'
      );
      
      console.log('Topic-focused flashcards generated successfully');
      
      setGeneratedContent(prev => ({
        ...prev,
        [lesson.id]: {
          ...prev[lesson.id],
          flashcards: analysisResult.flashcards
        }
      }));
      
      // Cache the flashcards
      localStorage.setItem(cacheKey, JSON.stringify({
        flashcards: analysisResult.flashcards,
        timestamp: new Date().toISOString(),
        lessonTitle: lesson.title
      }));
      
    } catch (error) {
      console.error('Error generating AI flashcards:', error);
      // Enhanced topic-focused fallback flashcards
      const topicWords = lesson.title.split(' ').slice(0, 3).join(' ');
      const fallbackFlashcards = [
        {
          question: `What are the fundamental concepts of ${lesson.title}?`,
          answer: `${lesson.title} involves understanding core principles, practical applications, and best practices in this field.`
        },
        {
          question: `Why is ${topicWords} important to learn?`,
          answer: `${topicWords} provides essential knowledge and skills that are valuable for practical applications and professional development.`
        },
        {
          question: `What are the key applications of ${topicWords}?`,
          answer: `${topicWords} can be applied in various real-world scenarios to solve problems and create solutions.`
        },
        {
          question: `How do you master ${lesson.title}?`,
          answer: `Mastering ${lesson.title} requires understanding theoretical foundations, practicing with real examples, and applying concepts to practical problems.`
        },
        {
          question: `What are common mistakes when learning ${topicWords}?`,
          answer: `Common mistakes include focusing only on theory without practice, skipping fundamentals, and not understanding real-world applications.`
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
    
    console.log('Generating topic-focused AI quiz for lesson:', lesson.title);
    setIsGeneratingQuiz(true);
    try {
      // Use the updated Gemini service for topic-focused quiz questions
      const moduleContent = [{
        title: lesson.title,
        summary: lesson.description || `Educational content about ${lesson.title}`,
        keyTopics: [lesson.title.split(' ').slice(0, 3).join(' ')]
      }];
      
      const quizQuestions = await geminiService.generateQuizQuestions(moduleContent);
      
      const quizData = {
        questions: quizQuestions
      };
      
      console.log('Topic-focused quiz generated successfully');
      
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
      // Enhanced topic-focused fallback quiz
      const topicWords = lesson.title.split(' ').slice(0, 3).join(' ');
      const fallbackQuiz = {
        questions: [
          {
            question: `What are the fundamental concepts of ${lesson.title}?`,
            options: [
              `Understanding core principles and practical applications of ${topicWords}`,
              "Basic memorization techniques",
              "General study strategies",
              "Unrelated theoretical concepts"
            ],
            correctAnswer: 0,
            explanation: `${lesson.title} focuses on understanding core principles and their practical applications in real-world scenarios.`
          },
          {
            question: `Why is learning ${topicWords} important?`,
            options: [
              "It's not particularly important",
              "Only for academic purposes",
              `It provides essential knowledge and skills valuable for practical applications and professional development`,
              "Just for passing tests"
            ],
            correctAnswer: 2,
            explanation: `Learning ${topicWords} provides essential knowledge and practical skills that are valuable in professional and academic contexts.`
          },
          {
            question: `How can you best apply knowledge of ${lesson.title}?`,
            options: [
              "By memorizing all details exactly",
              "By avoiding practical application",
              `By understanding principles and applying them to solve real-world problems involving ${topicWords}`,
              "By only reading about it"
            ],
            correctAnswer: 2,
            explanation: `The best way to apply knowledge is by understanding underlying principles and using them to solve practical problems.`
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
                <div className="space-y-6">
                  {/* Lesson Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <PlayCircle className="w-6 h-6 text-blue-600" />
                      {currentLessonData?.title || 'Lesson Overview'}
                    </h3>
                    
                    {/* Quick Stats */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                      {currentLessonData?.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{currentLessonData.duration}</span>
                        </div>
                      )}
                      {currentLessonData && 'type' in currentLessonData && currentLessonData.type && (
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span className="capitalize">{String(currentLessonData.type)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>Beginner Friendly</span>
                      </div>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Primary Content */}
                    <div className="md:col-span-2 space-y-6">
                      {/* Enhanced Content Overview */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          Content Summary
                        </h4>
                        
                        {/* Video Statistics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{currentLessonData?.duration || '5:00'}</div>
                            <div className="text-sm text-blue-700">Duration</div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">📚</div>
                            <div className="text-sm text-green-700">Study Material</div>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">🎯</div>
                            <div className="text-sm text-purple-700">Interactive</div>
                          </div>
                          <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">🧠</div>
                            <div className="text-sm text-orange-700">AI-Enhanced</div>
                          </div>
                        </div>
                      </div>

                      {/* Lesson Description */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-green-600" />
                          What You'll Learn
                        </h4>
                        <div className="prose prose-sm max-w-none">
                          {currentLessonData?.content || currentLessonData?.description ? (
                            <div className="space-y-4">
                              {/* Smart content formatter with enhanced parsing */}
                              {(() => {
                                const content = currentLessonData?.content || currentLessonData?.description || '';
                                const sections = parseAndFormatContent(content);
                                
                                return sections.map((section, index) => {
                                  switch (section.type) {
                                    case 'timestamp':
                                      return (
                                        <div key={index} className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 p-4 my-3 rounded-r-lg">
                                          <div className="flex items-center gap-2">
                                            <Timer className="w-4 h-4 text-blue-600" />
                                            <span className="font-mono text-sm font-medium text-blue-800">{section.content}</span>
                                          </div>
                                          {section.title && (
                                            <p className="text-blue-700 text-sm mt-1 ml-6">{section.title}</p>
                                          )}
                                        </div>
                                      );
                                    
                                    case 'chapter':
                                      return (
                                        <div key={index} className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 my-4">
                                          <h5 className="text-lg font-bold text-purple-900 flex items-center gap-2">
                                            <BookOpen className="w-5 h-5" />
                                            {section.content}
                                          </h5>
                                          {section.description && (
                                            <p className="text-purple-700 text-sm mt-2">{section.description}</p>
                                          )}
                                        </div>
                                      );
                                    
                                    case 'link':
                                      return (
                                        <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3 my-2">
                                          <div className="flex items-start gap-3">
                                            <Share2 className="w-4 h-4 text-gray-600 mt-1 flex-shrink-0" />
                                            <div>
                                              <a 
                                                href={section.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 underline font-medium break-all"
                                              >
                                                {section.title || section.url}
                                              </a>
                                              {section.description && (
                                                <p className="text-gray-600 text-sm mt-1">{section.description}</p>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    
                                    case 'list':
                                      return (
                                        <div key={index} className="bg-white border border-gray-100 rounded-lg p-4 my-3">
                                          <ul className="space-y-2">
                                            {section.items && section.items.map((item, itemIndex) => (
                                              <li key={itemIndex} className="flex items-start gap-2">
                                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-700">{item}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      );
                                    
                                    case 'highlight':
                                      return (
                                        <div key={index} className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-3 rounded-r-lg">
                                          <div className="flex items-start gap-2">
                                            <Sparkles className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                            <p className="text-yellow-800 font-medium">{section.content}</p>
                                          </div>
                                        </div>
                                      );
                                    
                                    case 'code':
                                      return (
                                        <div key={index} className="bg-gray-900 text-gray-100 rounded-lg p-4 my-3 overflow-x-auto">
                                          <pre className="text-sm font-mono">{section.content}</pre>
                                        </div>
                                      );
                                    
                                    case 'paragraph':
                                    default:
                                      return (
                                        <p key={index} className="text-gray-700 leading-relaxed mb-3">
                                          {section.content}
                                        </p>
                                      );
                                  }
                                });
                              })()}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                              <p>This lesson will cover important concepts and practical applications.</p>
                              <p className="text-sm mt-1">Make sure to take notes and practice the examples shown in the video.</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Enhanced Key Topics with better extraction */}
                      {currentLessonData?.content && (
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-600" />
                            Key Topics & Concepts
                          </h4>
                          <div className="space-y-4">
                            {/* Auto-extracted topics */}
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Main Topics:</h5>
                              <div className="flex flex-wrap gap-2">
                                {(() => {
                                  const content = currentLessonData.content.toLowerCase();
                                  const topics: string[] = [];
                                  
                                  // Enhanced keyword extraction with categories
                                  const keywordCategories = {
                                    'Programming': ['react', 'javascript', 'python', 'java', 'css', 'html', 'typescript', 'node', 'api'],
                                    'Data & Algorithms': ['algorithm', 'data', 'structure', 'database', 'sql', 'array', 'object', 'sorting'],
                                    'Web Development': ['frontend', 'backend', 'server', 'client', 'http', 'routing', 'component'],
                                    'Tools & Framework': ['git', 'github', 'webpack', 'babel', 'npm', 'yarn', 'docker'],
                                    'Concepts': ['function', 'variables', 'loops', 'conditions', 'classes', 'methods', 'async', 'promises']
                                  };
                                  
                                  Object.entries(keywordCategories).forEach(([_category, keywords]) => {
                                    keywords.forEach(keyword => {
                                      if (content.includes(keyword) && !topics.includes(keyword)) {
                                        topics.push(keyword);
                                      }
                                    });
                                  });
                                  
                                  // Extract capitalized words (likely proper nouns/technologies)
                                  const capitalizedWords = (currentLessonData.content.match(/\b[A-Z][a-z]+\b/g) || [])
                                    .filter(word => word.length > 3)
                                    .slice(0, 5);
                                  
                                  const allTopics = [...new Set([...topics, ...capitalizedWords.map(w => w.toLowerCase())])];
                                  
                                  return allTopics.slice(0, 10).map(topic => (
                                    <span key={topic} className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200">
                                      {topic.charAt(0).toUpperCase() + topic.slice(1)}
                                    </span>
                                  ));
                                })()}
                              </div>
                            </div>
                            
                            {/* Learning objectives if extractable */}
                            {(() => {
                              const content = currentLessonData.content;
                              const objectives: string[] = [];
                              
                              // Look for learning indicators
                              const learningPatterns = [
                                /learn (?:how to |about |to )?([^.!?\n]+)/gi,
                                /understand (?:how to |about |to )?([^.!?\n]+)/gi,
                                /explore (?:how to |about |to )?([^.!?\n]+)/gi,
                                /discover (?:how to |about |to )?([^.!?\n]+)/gi
                              ];
                              
                              learningPatterns.forEach(pattern => {
                                let match;
                                while ((match = pattern.exec(content)) !== null && objectives.length < 3) {
                                  if (match[1] && match[1].trim().length > 10 && match[1].trim().length < 100) {
                                    objectives.push(match[1].trim());
                                  }
                                }
                              });
                              
                              if (objectives.length > 0) {
                                return (
                                  <div>
                                    <h5 className="text-sm font-medium text-gray-700 mb-2">Learning Objectives:</h5>
                                    <ul className="space-y-1">
                                      {objectives.map((objective, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                          <span>{objective}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                      {/* Quick Actions */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h4>
                        <div className="space-y-3">
                          <button
                            onClick={() => setActiveTab('ai-notes')}
                            className="w-full flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                          >
                            <Brain className="w-4 h-4" />
                            <span>Generate AI Notes</span>
                            <Sparkles className="w-4 h-4 ml-auto" />
                          </button>
                          <button
                            onClick={() => setActiveTab('flashcards')}
                            className="w-full flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                          >
                            <Zap className="w-4 h-4" />
                            <span>Study Flashcards</span>
                            <ArrowRight className="w-4 h-4 ml-auto" />
                          </button>
                          <button
                            onClick={() => setActiveTab('quiz')}
                            className="w-full flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                          >
                            <HelpCircle className="w-4 h-4" />
                            <span>Take Quiz</span>
                            <ArrowRight className="w-4 h-4 ml-auto" />
                          </button>
                        </div>
                      </div>

                      {/* Learning Progress */}
                      <div className="bg-gradient-to-b from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-indigo-600" />
                          Learning Progress
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Video Progress</span>
                              <span>0%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" style={{width: '0%'}}></div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-center">
                            <div className="bg-white rounded-lg p-3 border border-indigo-100">
                              <div className="text-lg font-bold text-indigo-600">0/4</div>
                              <div className="text-xs text-gray-600">Features Used</div>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-indigo-100">
                              <div className="text-lg font-bold text-purple-600">0%</div>
                              <div className="text-xs text-gray-600">Completion</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Study Tips with AI Enhancement */}
                      <div className="bg-gradient-to-b from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-yellow-600" />
                          Smart Study Tips
                        </h4>
                        <ul className="space-y-3 text-sm text-gray-700">
                          <li className="flex items-start gap-2">
                            <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-yellow-600 font-bold text-xs">1</span>
                            </div>
                            <span><strong>Active Learning:</strong> Take notes while watching and pause to practice examples</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-yellow-600 font-bold text-xs">2</span>
                            </div>
                            <span><strong>AI Notes:</strong> Use AI-generated notes for quick review and exam preparation</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-yellow-600 font-bold text-xs">3</span>
                            </div>
                            <span><strong>Flashcards:</strong> Test your knowledge with spaced repetition</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-yellow-600 font-bold text-xs">4</span>
                            </div>
                            <span><strong>Quiz Practice:</strong> Complete quizzes to validate understanding</span>
                          </li>
                        </ul>
                      </div>

                      {/* Enhanced Prerequisites */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-indigo-600" />
                          Prerequisites & Preparation
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-gray-700">Basic computer skills</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-gray-700">Willingness to learn and practice</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-gray-700">No prior experience needed</span>
                          </div>
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-700">
                              <strong>Tip:</strong> Have a code editor ready if this is a programming lesson!
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
                  
                  {generatedContent[currentLessonData?.id || '']?.examNotes ? (
                    <div className="space-y-6">
                      {(() => {
                        const notes = generatedContent[currentLessonData!.id]?.examNotes!;
                        return (
                          <>
                            {/* Header with topic-focused messaging */}
                            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                              <div className="flex items-center gap-2 text-purple-800 font-medium mb-2">
                                <Sparkles className="w-4 h-4" />
                                AI-Generated Topic-Based Study Notes
                              </div>
                              <p className="text-purple-700 text-sm mb-2">
                                Comprehensive educational content about <strong>{currentLessonData?.title}</strong> designed for complete topic mastery.
                              </p>
                              <p className="text-sm text-purple-600">
                                <Clock className="w-4 h-4 inline mr-1" />
                                Estimated study time: {notes.timeToMaster}
                              </p>
                            </div>

                            {/* Summary */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Summary
                              </h4>
                              <p className="text-gray-700 leading-relaxed">{notes.summary}</p>
                            </div>

                            {/* Key Points */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                Key Points ({notes.keyPoints.length})
                              </h4>
                              <div className="space-y-4">
                                {notes.keyPoints.map((point, index) => (
                                  <div key={point.id} className="border-l-4 border-green-400 pl-4 py-2">
                                    <div className="flex items-center justify-between mb-2">
                                      <h5 className="font-semibold text-gray-900">{index + 1}. {point.title}</h5>
                                      <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                          point.importance === 'Critical' ? 'bg-red-100 text-red-800' :
                                          point.importance === 'Important' ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-blue-100 text-blue-800'
                                        }`}>
                                          {point.importance}
                                        </span>
                                        <span className="text-xs text-gray-500">Exam Weight: {point.examWeight}/10</span>
                                      </div>
                                    </div>
                                    <p className="text-gray-700 text-sm">{point.description}</p>
                                    <p className="text-xs text-gray-500 mt-1">Memorization: {point.memorization}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Concepts */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Brain className="w-5 h-5 text-purple-600" />
                                Key Concepts ({notes.concepts.length})
                              </h4>
                              <div className="space-y-6">
                                {notes.concepts.map((concept, index) => (
                                  <div key={concept.id} className="border border-gray-100 rounded-lg p-4">
                                    <h5 className="font-semibold text-gray-900 mb-2">{index + 1}. {concept.concept}</h5>
                                    <div className="grid md:grid-cols-2 gap-4">
                                      <div>
                                        <h6 className="font-medium text-green-700 text-sm mb-1">Simple Explanation:</h6>
                                        <p className="text-gray-700 text-sm mb-3">{concept.simpleExplanation}</p>
                                        <h6 className="font-medium text-blue-700 text-sm mb-1">Real Example:</h6>
                                        <p className="text-gray-700 text-sm">{concept.realWorldExample}</p>
                                      </div>
                                      <div>
                                        <h6 className="font-medium text-red-700 text-sm mb-1">Common Mistakes:</h6>
                                        <ul className="text-gray-700 text-sm space-y-1 mb-3">
                                          {concept.commonMistakes.map((mistake, i) => (
                                            <li key={i} className="flex items-start gap-1">
                                              <span className="text-red-500 mt-1">•</span>
                                              {mistake}
                                            </li>
                                          ))}
                                        </ul>
                                        <h6 className="font-medium text-purple-700 text-sm mb-1">Related Concepts:</h6>
                                        <div className="flex flex-wrap gap-1">
                                          {concept.relatedConcepts.map((related, i) => (
                                            <span key={i} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                                              {related}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Quick Review */}
                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-600" />
                                Quick Review
                              </h4>
                              <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                  <h5 className="font-medium text-gray-900 mb-2">Must Know:</h5>
                                  <ul className="space-y-1">
                                    {notes.quickReview.mustKnow.map((item, i) => (
                                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h5 className="font-medium text-gray-900 mb-2">Key Terms:</h5>
                                  <div className="space-y-2">
                                    {notes.quickReview.keyTerms.map((term, i) => (
                                      <div key={i} className="bg-white rounded p-3 border border-gray-200">
                                        <div className="font-medium text-sm text-gray-900">{term.term}</div>
                                        <div className="text-xs text-gray-600 mt-1">{term.definition}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              
                              {notes.quickReview.lastMinuteTips.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-yellow-200">
                                  <h5 className="font-medium text-gray-900 mb-2">Last Minute Tips:</h5>
                                  <div className="flex flex-wrap gap-2">
                                    {notes.quickReview.lastMinuteTips.map((tip, i) => (
                                      <span key={i} className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full">
                                        {tip}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Study Tips */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-blue-600" />
                                Study Tips
                              </h4>
                              <div className="grid gap-3">
                                {notes.studyTips.map((tip, i) => (
                                  <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                      {i + 1}
                                    </span>
                                    <p className="text-gray-700 text-sm">{tip}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Mnemonics */}
                            {notes.mnemonics && notes.mnemonics.length > 0 && (
                              <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                  <RefreshCw className="w-5 h-5 text-green-600" />
                                  Memory Aids ({notes.mnemonics.length})
                                </h4>
                                <div className="space-y-4">
                                  {notes.mnemonics.map((mnemonic, index) => (
                                    <div key={mnemonic.id || `mnemonic-${index}`} className="border-l-4 border-green-400 pl-4 py-2 bg-green-50 rounded-r-lg">
                                      <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                                          {mnemonic.type || 'Memory Aid'}
                                        </span>
                                        {mnemonic.concept}
                                      </h5>
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

                            {/* Debug info for mnemonics - remove in production */}
                            {process.env.NODE_ENV === 'development' && (
                              <div className="bg-gray-100 p-4 rounded-lg text-xs text-gray-600">
                                <strong>Debug:</strong> Mnemonics array length: {notes.mnemonics?.length || 0}
                                {notes.mnemonics?.length === 0 && (
                                  <div className="mt-2 text-red-600">
                                    No mnemonics found. Check AI generation or fallback logic.
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {isGeneratingNotes ? 'Creating Comprehensive AI Notes...' : 'Ready to Generate AI Study Notes?'}
                      </h4>
                      <p className="mb-6">
                        {isGeneratingNotes 
                          ? 'Our AI is creating detailed, exam-focused study notes with key concepts, practice questions, and memory aids.'
                          : 'Get comprehensive AI-powered study notes with key points, concepts, practice questions, mnemonics, and study strategies.'
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
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-600" />
                        Topic-Based AI Flashcards
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Study cards focusing on <strong>{currentLessonData?.title}</strong> fundamentals and applications
                      </p>
                    </div>
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
                    <div className="text-center py-12">
                      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8">
                        <Zap className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          Generate Topic-Based Flashcards
                        </h4>
                        <p className="text-gray-600 mb-4">
                          Create interactive flashcards that test your understanding of <strong>{currentLessonData?.title}</strong> fundamentals and applications.
                        </p>
                        <button
                          onClick={() => generateAIFlashcards(currentLessonData!)}
                          disabled={isGeneratingFlashcards || !currentLessonData}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isGeneratingFlashcards ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Creating topic-based flashcards...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5" />
                              Generate Flashcards
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                      {isGeneratingFlashcards && (
                        <div className="flex justify-center">
                          <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

              {activeTab === 'quiz' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-green-600" />
                        Topic-Based AI Quiz
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Test your understanding of <strong>{currentLessonData?.title}</strong> concepts and applications
                      </p>
                    </div>
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
                  
                  {generatedContent[currentLessonData?.id || '']?.flashcards && (generatedContent[currentLessonData?.id || '']?.flashcards?.length || 0) > 0 ? (
                    <div className="space-y-4">
                      {generatedContent[currentLessonData?.id || '']?.flashcards?.map((flashcard, index) => (
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
                          disabled={currentFlashcard >= ((generatedContent[currentLessonData?.id || '']?.flashcards?.length || 1) - 1)}
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

            </div>
            {/* End of Tab Content */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImprovedCourseLearning;
