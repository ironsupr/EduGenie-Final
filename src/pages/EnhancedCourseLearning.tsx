import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ChevronDown, 
  ChevronRight, 
  Play, 
  FileText, 
  MessageCircle,
  BookOpen,
  CheckCircle,
  PlayCircle,
  Brain,
  Zap,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Target,
  Trophy,
  Lightbulb,
  RotateCcw,
  Users,
  Clock,
  Search,
  Bookmark,
  BookmarkCheck,
  Download,
  Settings,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Timer,
  TrendingUp,
  Award,
  Star,
  AlertCircle,
  PenTool,
  Save,
  RefreshCw,
  ChevronUp,
  Filter,
  BarChart3,
  Calendar,
  Share2
} from 'lucide-react';
import { getCourse } from '../services/courseService';
import { Course, Module, Lesson } from '../types';
import ExamReadyNotesComponent from '../components/ExamReadyNotesComponent';

interface LessonData extends Lesson {
  notes?: string;
  flashcards?: Array<{ question: string; answer: string; }>;
  importantQuestions?: string[];
}

interface ModuleData extends Module {
  lessons: LessonData[];
}

interface EnhancedCourse extends Course {
  modules: ModuleData[];
}

const EnhancedCourseLearning = () => {
  const { courseId } = useParams();
  const [activeTab, setActiveTab] = useState('video');
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [currentLesson, setCurrentLesson] = useState<{moduleId: string; lessonId: string} | null>(null);
  const [course, setCourse] = useState<EnhancedCourse | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Enhanced flashcard state
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Set<number>>(new Set());
  const [studyMode, setStudyMode] = useState<'all' | 'difficult' | 'mastered'>('all');
  
  // Enhanced quiz state
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizAttempts, setQuizAttempts] = useState(0);
  const [showExplanations, setShowExplanations] = useState(false);

  // New enhanced features
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [bookmarkedLessons, setBookmarkedLessons] = useState<Set<string>>(new Set());
  const [personalNotes, setPersonalNotes] = useState<{ [lessonId: string]: string }>({});
  const [currentNote, setCurrentNote] = useState('');
  const [isNoteEditing, setIsNoteEditing] = useState(false);
  const [studyTime, setStudyTime] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [learningStreak, setLearningStreak] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState(5); // hours per week
  const [showProgress, setShowProgress] = useState(true);
  const [videoSpeed, setVideoSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
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
        
        // Load user progress from localStorage
        loadUserProgress();
        setSessionStartTime(new Date());
      } catch (error) {
        console.error('Error loading course:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId]);

  // Study time tracking
  useEffect(() => {
    const interval = setInterval(() => {
      if (sessionStartTime) {
        const elapsed = Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000 / 60);
        setStudyTime(prev => prev + elapsed);
        setSessionStartTime(new Date());
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // Save progress periodically
  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveUserProgress();
    }, 30000); // Save every 30 seconds

    return () => clearInterval(saveInterval);
  }, [completedLessons, bookmarkedLessons, personalNotes, studyTime]);

  const loadUserProgress = () => {
    try {
      const saved = localStorage.getItem(`course-progress-${courseId}`);
      if (saved) {
        const progress = JSON.parse(saved);
        setCompletedLessons(new Set(progress.completedLessons || []));
        setBookmarkedLessons(new Set(progress.bookmarkedLessons || []));
        setPersonalNotes(progress.personalNotes || {});
        setStudyTime(progress.studyTime || 0);
        setLearningStreak(progress.learningStreak || 0);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const saveUserProgress = () => {
    try {
      const progress = {
        completedLessons: Array.from(completedLessons),
        bookmarkedLessons: Array.from(bookmarkedLessons),
        personalNotes,
        studyTime,
        learningStreak,
        lastStudyDate: new Date().toISOString()
      };
      localStorage.setItem(`course-progress-${courseId}`, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const calculateProgress = () => {
    if (!course || !course.modules) return 0;
    const totalLessons = course.modules.reduce((acc, module) => acc + (module.lessons?.length || 0), 0);
    const completed = completedLessons.size;
    return Math.round((completed / Math.max(totalLessons, 1)) * 100);
  };

  const markLessonComplete = (lessonId: string) => {
    setCompletedLessons(prev => new Set([...prev, lessonId]));
    
    // Update learning streak
    const today = new Date().toDateString();
    const lastStudy = localStorage.getItem(`last-study-${courseId}`);
    if (lastStudy !== today) {
      setLearningStreak(prev => prev + 1);
      localStorage.setItem(`last-study-${courseId}`, today);
    }
  };

  const toggleBookmark = (lessonId: string) => {
    setBookmarkedLessons(prev => {
      const newSet = new Set(prev);
      if (newSet.has(lessonId)) {
        newSet.delete(lessonId);
      } else {
        newSet.add(lessonId);
      }
      return newSet;
    });
  };

  const savePersonalNote = () => {
    if (currentLesson) {
      setPersonalNotes(prev => ({
        ...prev,
        [currentLesson.lessonId]: currentNote
      }));
      setIsNoteEditing(false);
    }
  };

  const getFilteredFlashcards = () => {
    const currentLesson_ = getCurrentLesson();
    if (!currentLesson_?.flashcards) return [];
    
    switch (studyMode) {
      case 'mastered':
        return currentLesson_.flashcards.filter((_, index) => masteredCards.has(index));
      case 'difficult':
        return currentLesson_.flashcards.filter((_, index) => !masteredCards.has(index));
      default:
        return currentLesson_.flashcards;
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const selectLesson = (moduleId: string, lessonId: string) => {
    setCurrentLesson({ moduleId, lessonId });
    setActiveTab('video');
  };

  const getCurrentLesson = (): LessonData | null => {
    if (!currentLesson || !course) return null;
    const module = course.modules.find(m => m.id === currentLesson.moduleId);
    return module?.lessons.find(l => l.id === currentLesson.lessonId) || null;
  };

  const getCurrentModule = (): ModuleData | null => {
    if (!currentLesson || !course) return null;
    return course.modules.find(m => m.id === currentLesson.moduleId) || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
          <p className="text-gray-600">The course you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }
  const currentLesson_ = getCurrentLesson();
  const currentModule = getCurrentModule();
  const progress = calculateProgress();

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Enhanced Header with Progress and Actions */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm sticky top-0 z-50`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={course?.imageUrl}
                alt={course?.title}
                className="w-12 h-12 object-cover rounded-lg"
              />
              <div>
                <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {course?.title}
                </h1>
                <div className="flex items-center space-x-4 text-sm">
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Progress: {progress}%
                  </span>
                  <div className="flex items-center space-x-1">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Streak: {learningStreak} days
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Timer className="h-4 w-4 text-blue-500" />
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {Math.floor(studyTime / 60)}h {studyTime % 60}m
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Search */}
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search lessons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 pr-4 py-2 rounded-lg border text-sm w-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
              
              {/* Action buttons */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Settings className="h-5 w-5" />
              </button>
              
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center">
                <Share2 className="h-4 w-4 mr-2" />
                Share Progress
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Enhanced Sidebar */}
        <div className={`w-80 h-screen overflow-y-auto transition-colors ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border-r`}>
          <div className="p-6">
            {/* Course Stats */}
            <div className={`rounded-lg p-4 mb-6 ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Your Progress</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {completedLessons.size}
                  </div>
                  <div className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Completed</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    {bookmarkedLessons.size}
                  </div>
                  <div className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Bookmarked</div>
                </div>
              </div>
            </div>

            {/* Module Navigation */}
            <div className="space-y-2">
              {course?.modules?.map((module) => (
                <div key={module.id} className={`rounded-lg overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <button
                    onClick={() => toggleModule(module.id)}
                    className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors ${
                      darkMode ? 'hover:bg-gray-600 text-white' : 'hover:bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-3 text-purple-600" />
                      <div>
                        <div className="font-medium">{module.title}</div>
                        <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {module.lessons?.length || 0} lessons
                        </div>
                      </div>
                    </div>
                    {expandedModules.includes(module.id) ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                    }
                  </button>
                  
                  {expandedModules.includes(module.id) && (
                    <div className="px-4 pb-2">
                      {module.lessons?.filter(lesson => 
                        !searchTerm || lesson.title.toLowerCase().includes(searchTerm.toLowerCase())
                      ).map((lesson) => (
                        <button
                          key={lesson.id}
                          onClick={() => selectLesson(module.id, lesson.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-all ${
                            currentLesson?.lessonId === lesson.id
                              ? darkMode 
                                ? 'bg-blue-600 text-white shadow-md' 
                                : 'bg-blue-600 text-white shadow-md'
                              : darkMode
                                ? 'hover:bg-gray-600 text-gray-300'
                                : 'hover:bg-white text-gray-700 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center min-w-0 flex-1">
                              <div className="flex items-center mr-2">
                                {completedLessons.has(lesson.id) ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <PlayCircle className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium truncate">{lesson.title}</div>
                                <div className={`text-xs ${
                                  currentLesson?.lessonId === lesson.id 
                                    ? 'text-blue-200' 
                                    : darkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  {lesson.duration}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              {bookmarkedLessons.has(lesson.id) && (
                                <BookmarkCheck className="h-3 w-3 text-yellow-500" />
                              )}
                              {personalNotes[lesson.id] && (
                                <PenTool className="h-3 w-3 text-blue-500" />
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {course.studentsCount || 0}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {course.duration}
              </div>
            </div>
          </div>

          <div className="p-4">
            {course.modules.map((module) => (
              <div key={module.id} className="mb-4">
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="font-semibold text-gray-900">{module.title}</span>
                  </div>
                  {expandedModules.includes(module.id) ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </button>

                {expandedModules.includes(module.id) && (
                  <div className="mt-2 ml-4 space-y-2">
                    {module.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => selectLesson(module.id, lesson.id)}
                        className={`w-full flex items-center p-3 rounded-lg text-left transition-colors ${ 
                          currentLesson?.lessonId === lesson.id
                            ? 'bg-blue-50 border border-blue-200'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <PlayCircle className={`h-4 w-4 mr-3 ${
                          currentLesson?.lessonId === lesson.id ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        <div className="flex-1">
                          <div className={`font-medium ${
                            currentLesson?.lessonId === lesson.id ? 'text-blue-900' : 'text-gray-700'
                          }`}>
                            {lesson.title}
                          </div>
                          <div className="text-sm text-gray-500">{lesson.duration}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Enhanced Header Bar */}
          <div className={`shadow-sm border-b px-8 py-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {currentLesson_?.title || 'Select a lesson'}
                </h2>
                {currentModule && (
                  <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{currentModule.title}</p>
                )}
              </div>
              
              {currentLesson_ && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleBookmark(currentLesson_.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      bookmarkedLessons.has(currentLesson_.id)
                        ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                        : darkMode 
                          ? 'text-gray-400 hover:bg-gray-700' 
                          : 'text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    {bookmarkedLessons.has(currentLesson_.id) ? 
                      <BookmarkCheck className="h-5 w-5" /> : 
                      <Bookmark className="h-5 w-5" />
                    }
                  </button>
                  
                  <button
                    onClick={() => markLessonComplete(currentLesson_.id)}
                    disabled={completedLessons.has(currentLesson_.id)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      completedLessons.has(currentLesson_.id)
                        ? 'bg-green-100 text-green-800 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {completedLessons.has(currentLesson_.id) ? 'Completed' : 'Mark Complete'}
                  </button>
                </div>
              )}
            </div>

            {/* Enhanced Tab Navigation */}
            <div className="mt-6 flex space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { id: 'video', label: 'Video', icon: Play },
                { id: 'notes', label: 'AI Notes', icon: FileText },
                { id: 'personal-notes', label: 'My Notes', icon: PenTool },
                { id: 'flashcards', label: 'Flashcards', icon: Zap },
                { id: 'quiz', label: 'Quiz', icon: HelpCircle }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm transform scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-8 overflow-y-auto">
            {activeTab === 'video' && currentLesson_ && (
              <div className="space-y-6">
                {/* Enhanced Video Player */}
                <div className="relative">
                  <div className={`bg-black rounded-lg aspect-video flex items-center justify-center relative ${
                    isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
                  }`}>
                    {currentLesson_.videoUrl ? (
                      <>
                        <iframe
                          src={`${currentLesson_.videoUrl.replace('watch?v=', 'embed/')}?autoplay=0&controls=1`}
                          className="w-full h-full rounded-lg"
                          allowFullScreen
                          title={currentLesson_.title}
                        />
                        
                        {/* Video Controls Overlay */}
                        <div className="absolute bottom-4 right-4 flex space-x-2">
                          <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="bg-black bg-opacity-50 text-white p-2 rounded-lg hover:bg-opacity-70 transition-all"
                          >
                            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-white text-center">
                        <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-xl">Video not available</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Lesson Information */}
                <div className={`rounded-lg p-6 shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {currentLesson_.title}
                  </h3>
                  <p className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {currentLesson_.description}
                  </p>
                  
                  {/* Lesson Metadata */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-400" />
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                          {currentLesson_.duration}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Target className="h-4 w-4 mr-1 text-gray-400" />
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                          {currentLesson_.level || 'Intermediate'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                        darkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>
                        <Download className="h-4 w-4 inline mr-1" />
                        Export Notes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}            {activeTab === 'notes' && currentLesson_ && (
              <ExamReadyNotesComponent
                lessonId={currentLesson_.id}
                lessonTitle={currentLesson_.title}
                lessonDescription={currentLesson_.description}
                subject={course?.category}
                level={course?.level}
                content={currentLesson_.content}
                onNotesGenerated={(notes) => {
                  console.log('Generated notes for lesson:', notes);
                }}
              />
            )}

            {activeTab === 'personal-notes' && currentLesson_ && (
              <div className={`rounded-lg p-8 shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <PenTool className="h-6 w-6 text-blue-600 mr-3" />
                    <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Personal Notes
                    </h3>
                  </div>
                  
                  <button
                    onClick={() => setIsNoteEditing(!isNoteEditing)}
                    className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <PenTool className="h-4 w-4 mr-1" />
                    {isNoteEditing ? 'Cancel' : 'Edit'}
                  </button>
                </div>
                
                {isNoteEditing ? (
                  <div className="space-y-4">
                    <textarea
                      value={currentNote}
                      onChange={(e) => setCurrentNote(e.target.value)}
                      placeholder="Write your personal notes here..."
                      className={`w-full h-64 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setIsNoteEditing(false)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          darkMode 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={savePersonalNote}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Notes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {personalNotes[currentLesson_.id] ? (
                      <div className={`whitespace-pre-wrap leading-relaxed ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {personalNotes[currentLesson_.id]}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <PenTool className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className={`text-lg mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          No personal notes yet
                        </p>
                        <button
                          onClick={() => {
                            setCurrentNote(personalNotes[currentLesson_.id] || '');
                            setIsNoteEditing(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          Start Taking Notes
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'flashcards' && currentLesson_ && (
              <div className="max-w-2xl mx-auto">
                {currentLesson_.flashcards && currentLesson_.flashcards.length > 0 ? (
                  <div className={`rounded-lg shadow-lg p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="text-center mb-6">
                      <div className="flex items-center justify-center mb-4">
                        <Zap className="h-8 w-8 text-yellow-500 mr-3" />
                        <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Study Flashcards
                        </h3>
                      </div>
                      
                      {/* Study Mode Selector */}
                      <div className="flex justify-center space-x-2 mb-4">
                        {[
                          { value: 'all', label: 'All Cards', icon: BookOpen },
                          { value: 'difficult', label: 'Difficult', icon: AlertCircle },
                          { value: 'mastered', label: 'Mastered', icon: Award }
                        ].map(mode => (
                          <button
                            key={mode.value}
                            onClick={() => setStudyMode(mode.value as any)}
                            className={`px-3 py-1 rounded-lg text-sm flex items-center transition-colors ${
                              studyMode === mode.value
                                ? 'bg-blue-600 text-white'
                                : darkMode 
                                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <mode.icon className="h-3 w-3 mr-1" />
                            {mode.label}
                          </button>
                        ))}
                      </div>
                      
                      <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                        Card {currentFlashcard + 1} of {currentLesson_.flashcards.length}
                      </p>
                    </div>

                    {/* Enhanced Flashcard */}
                    <div 
                      className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 min-h-[250px] flex items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02] relative overflow-hidden"
                      onClick={() => setShowAnswer(!showAnswer)}
                    >
                      {/* Decorative elements */}
                      <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-30 -translate-x-10 -translate-y-10"></div>
                      <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-purple-200 to-pink-200 rounded-full opacity-30 translate-x-8 translate-y-8"></div>
                      
                      <div className="text-center relative z-10">
                        {!showAnswer ? (
                          <div>
                            <h4 className="text-xl font-bold text-gray-900 mb-6">Question:</h4>
                            <p className="text-lg text-gray-700 mb-8">
                              {currentLesson_.flashcards[currentFlashcard].question}
                            </p>
                            <div className="flex items-center justify-center text-blue-600">
                              <Eye className="h-5 w-5 mr-2" />
                              <span className="text-sm font-medium">Click to reveal answer</span>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h4 className="text-xl font-bold text-green-700 mb-6">Answer:</h4>
                            <p className="text-lg text-gray-700 mb-8">
                              {currentLesson_.flashcards[currentFlashcard].answer}
                            </p>
                            <div className="flex items-center justify-center text-green-600">
                              <EyeOff className="h-5 w-5 mr-2" />
                              <span className="text-sm font-medium">Click to hide answer</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Enhanced Navigation and Actions */}
                    <div className="flex items-center justify-between mt-6">
                      <button
                        onClick={() => {
                          setCurrentFlashcard(prev => 
                            prev === 0 ? currentLesson_.flashcards!.length - 1 : prev - 1
                          );
                          setShowAnswer(false);
                        }}
                        className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Previous
                      </button>
                      
                      {showAnswer && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setMasteredCards(prev => {
                              const newSet = new Set(prev);
                              newSet.delete(currentFlashcard);
                              return newSet;
                            })}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                          >
                            Difficult
                          </button>
                          <button
                            onClick={() => setMasteredCards(prev => new Set([...prev, currentFlashcard]))}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                          >
                            Mastered
                          </button>
                        </div>
                      )}
                      
                      <button
                        onClick={() => {
                          setCurrentFlashcard(prev => (prev + 1) % currentLesson_.flashcards!.length);
                          setShowAnswer(false);
                        }}
                        className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </button>
                    </div>
                    
                    {/* Progress Indicators */}
                    <div className="mt-6 flex justify-center space-x-1">
                      {currentLesson_.flashcards.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentFlashcard
                              ? 'bg-blue-600'
                              : masteredCards.has(index)
                                ? 'bg-green-500'
                                : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className={`rounded-lg p-8 shadow-sm text-center ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <Zap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className={`text-lg mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No flashcards available for this lesson
                    </p>
                    <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors">
                      Generate Flashcards
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'quiz' && currentModule && (
              <div className={`max-w-3xl mx-auto rounded-lg shadow-lg p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <Trophy className="h-8 w-8 text-purple-600 mr-3" />
                    <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Module Quiz
                    </h3>
                  </div>
                  <p className={`mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Test your understanding of this module
                  </p>
                  
                  {currentModule.quiz ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                          <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            {currentModule.quiz.questions.length}
                          </div>
                          <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Questions</div>
                        </div>
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
                          <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                            {quizAttempts}
                          </div>
                          <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Attempts</div>
                        </div>
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
                          <div className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                            {quizScore || 0}%
                          </div>
                          <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Best Score</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-center space-x-4">
                        <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors font-medium">
                          Start Quiz
                        </button>
                        <button 
                          onClick={() => setShowExplanations(!showExplanations)}
                          className={`px-6 py-3 rounded-lg transition-colors font-medium ${
                            darkMode 
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {showExplanations ? 'Hide' : 'Show'} Explanations
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className={`text-lg mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        No quiz available for this module
                      </p>
                      <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                        Generate Quiz
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCourseLearning;