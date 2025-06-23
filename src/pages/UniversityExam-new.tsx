import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  Download, 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  BookOpen, 
  Target,
  Brain,
  Sparkles,
  Clock,
  Users,
  PlayCircle,
  Loader2,
  ArrowRight,
  FileCheck,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { uploadSyllabus, createStudyPlan } from '../services/studyPlanService';
import { syllabusProcessorService, SyllabusAnalysis, GeneratedCourse } from '../services/syllabusProcessorService';
import { createCourse } from '../services/courseService';
import { StudyPlan } from '../types';

const UniversityExam = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingCourse, setIsGeneratingCourse] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [courseGenerated, setCourseGenerated] = useState(false);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [syllabusAnalysis, setSyllabusAnalysis] = useState<SyllabusAnalysis | null>(null);
  const [generatedCourse, setGeneratedCourse] = useState<GeneratedCourse | null>(null);
  const [currentStep, setCurrentStep] = useState<'upload' | 'analyzing' | 'complete' | 'generating-course' | 'course-ready'>('upload');
  
  const { currentUser } = useAuth();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedFile || !currentUser) return;

    setIsProcessing(true);
    setCurrentStep('analyzing');
    
    try {
      console.log('Starting syllabus analysis...');
      
      // Extract text from the uploaded file
      const syllabusText = await syllabusProcessorService.extractTextFromFile(uploadedFile);
      console.log('Extracted text length:', syllabusText.length);
      
      // Analyze syllabus with AI
      const analysis = await syllabusProcessorService.analyzeSyllabus(syllabusText);
      console.log('Syllabus analysis complete:', analysis);
      
      setSyllabusAnalysis(analysis);
      
      // Create traditional study plan from analysis
      const subjects = analysis.modules.map(module => ({
        id: module.number.toString(),
        name: module.title,
        weightage: `${Math.round(100 / analysis.modules.length)}%`,
        difficulty: 'Medium' as const,
        estimatedHours: module.duration,
        topics: module.topics.map((topic, index) => ({
          id: `${module.number}-${index + 1}`,
          name: topic,
          completed: false,
          resources: []
        }))
      }));
      
      // Upload file to storage
      await uploadSyllabus(uploadedFile, currentUser.uid);
      
      // Create study plan
      const newStudyPlan: Omit<StudyPlan, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: currentUser.uid,
        syllabusFileName: uploadedFile.name,
        subjects,
        totalWeeks: Math.ceil(analysis.totalHours / 15), // Assuming 15 hours per week
        hoursPerWeek: 15,
        startDate: new Date(),
      };
      
      const studyPlanId = await createStudyPlan(newStudyPlan);
      
      setStudyPlan({
        ...newStudyPlan,
        id: studyPlanId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      setAnalysisComplete(true);
      setCurrentStep('complete');
      
    } catch (error) {
      console.error('Error analyzing syllabus:', error);
      setCurrentStep('upload');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateCourse = async () => {
    if (!syllabusAnalysis || !currentUser) return;

    setIsGeneratingCourse(true);
    setCurrentStep('generating-course');
    
    try {
      console.log('Generating course from syllabus...');
      
      // Generate course structure with AI
      const course = await syllabusProcessorService.generateCourseFromSyllabus(
        syllabusAnalysis, 
        currentUser.uid
      );
      
      console.log('Course generated:', course);
      
      // Save course to Firebase
      const courseId = await createCourse({
        title: course.title,
        description: course.description,
        instructor: course.instructor,
        instructorId: course.instructorId,
        category: course.category,
        level: course.level,
        price: course.price,
        duration: course.duration,
        rating: course.rating,
        studentsCount: course.studentsCount,
        imageUrl: course.imageUrl,
        modules: course.modules,
        isPublished: course.isPublished
      });
      
      console.log('Course saved with ID:', courseId);
      
      setGeneratedCourse({ ...course, id: courseId });
      setCourseGenerated(true);
      setCurrentStep('course-ready');
      
    } catch (error) {
      console.error('Error generating course:', error);
    } finally {
      setIsGeneratingCourse(false);
    }
  };

  const resetProcess = () => {
    setUploadedFile(null);
    setIsProcessing(false);
    setIsGeneratingCourse(false);
    setAnalysisComplete(false);
    setCourseGenerated(false);
    setStudyPlan(null);
    setSyllabusAnalysis(null);
    setGeneratedCourse(null);
    setCurrentStep('upload');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            AI Syllabus <span className="text-purple-600">Course Generator</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Upload your university syllabus and get an AI-powered complete course with study plans, 
            interactive lessons, quizzes, and comprehensive learning materials.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-8">
            {[
              { id: 'upload', title: 'Upload Syllabus', icon: Upload, active: currentStep === 'upload' },
              { id: 'analyzing', title: 'AI Analysis', icon: Brain, active: currentStep === 'analyzing' },
              { id: 'complete', title: 'Study Plan Ready', icon: CheckCircle, active: currentStep === 'complete' },
              { id: 'generating-course', title: 'Creating Course', icon: Sparkles, active: currentStep === 'generating-course' },
              { id: 'course-ready', title: 'Course Ready', icon: GraduationCap, active: currentStep === 'course-ready' }
            ].map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  step.active || (index < ['upload', 'analyzing', 'complete', 'generating-course', 'course-ready'].indexOf(currentStep))
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <span className={`text-sm mt-2 ${
                  step.active ? 'text-purple-600 font-semibold' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upload Step */}
        {currentStep === 'upload' && (
          <div className="text-center">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center justify-center gap-3">
                <Upload className="w-7 h-7 text-purple-600" />
                Upload Your Syllabus
              </h2>
              
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  dragActive 
                    ? 'border-purple-500 bg-purple-50' 
                    : uploadedFile 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {uploadedFile ? (
                  <div className="space-y-4">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{uploadedFile.name}</p>
                      <p className="text-gray-600">File uploaded successfully</p>
                      <p className="text-sm text-gray-500">Size: {(uploadedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Choose different file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-16 w-16 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-lg font-semibold text-gray-900 mb-2">
                        Drag and drop your syllabus file here
                      </p>
                      <p className="text-gray-600 mb-4">
                        Supports PDF, DOC, DOCX, TXT formats (Max 10MB)
                      </p>
                      <label className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors cursor-pointer">
                        Browse Files
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={handleFileSelect}
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {uploadedFile && (
                <div className="mt-6 space-y-4">
                  <button
                    onClick={handleAnalyze}
                    disabled={isProcessing || !currentUser}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all font-semibold text-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Analyzing Syllabus...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5" />
                        <span>Analyze Syllabus &amp; Generate Study Plan</span>
                      </>
                    )}
                  </button>
                  {!currentUser && (
                    <p className="text-sm text-red-600 text-center">
                      Please log in to analyze your syllabus
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analysis in Progress */}
        {currentStep === 'analyzing' && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-lg p-12">
              <div className="animate-spin w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-6"></div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Analyzing Your Syllabus</h3>
              <p className="text-gray-600 mb-6">
                Our AI is carefully reading through your syllabus, identifying modules, topics, 
                learning objectives, and creating a comprehensive analysis.
              </p>
              <div className="space-y-2 text-left max-w-md mx-auto">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">Extracting course information</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">Identifying modules and topics</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                  <span className="text-sm text-gray-600">Creating study plan structure</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Complete - Study Plan Ready */}
        {currentStep === 'complete' && syllabusAnalysis && studyPlan && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Study Plan Generated</h3>
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-6 h-6" />
                    <span className="font-medium">Complete</span>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-900">Course Information</h4>
                    <p className="text-lg font-bold text-purple-700">{syllabusAnalysis.courseTitle}</p>
                    <p className="text-sm text-purple-600">{syllabusAnalysis.courseCode}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900">Study Timeline</h4>
                    <p className="text-lg font-bold text-blue-700">{studyPlan.totalWeeks} weeks</p>
                    <p className="text-sm text-blue-600">{studyPlan.hoursPerWeek} hours/week</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Course Modules</h4>
                  {syllabusAnalysis.modules.map((module, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold text-gray-900">
                          Module {module.number}: {module.title}
                        </h5>
                        <span className="text-sm text-gray-500">{module.duration} hours</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{module.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {module.topics.slice(0, 4).map((topic, topicIndex) => (
                          <span 
                            key={topicIndex}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {topic}
                          </span>
                        ))}
                        {module.topics.length > 4 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            +{module.topics.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-lg p-8 text-white">
                <h3 className="text-xl font-bold mb-4">Ready for Next Step?</h3>
                <p className="mb-6 text-purple-100">
                  Transform your study plan into a complete interactive course with AI-generated content.
                </p>
                
                <button
                  onClick={handleGenerateCourse}
                  disabled={isGeneratingCourse}
                  className="w-full bg-white text-purple-600 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isGeneratingCourse ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating Course...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate Complete Course</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Course Will Include:</h4>
                <div className="space-y-3">
                  {[
                    { icon: PlayCircle, text: 'Interactive video lessons' },
                    { icon: FileText, text: 'AI-generated study notes' },
                    { icon: Brain, text: 'Smart flashcards' },
                    { icon: Target, text: 'Practice quizzes' },
                    { icon: Users, text: 'Discussion forums' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5 text-purple-600" />
                      <span className="text-sm text-gray-700">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Actions</h4>
                <div className="space-y-3">
                  <button
                    onClick={() => {/* Download study plan */}}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Study Plan</span>
                  </button>
                  <button
                    onClick={resetProcess}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload New Syllabus</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Course Generation in Progress */}
        {currentStep === 'generating-course' && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-lg p-12">
              <div className="relative mb-6">
                <div className="animate-spin w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto"></div>
                <Sparkles className="w-6 h-6 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Creating Your Complete Course</h3>
              <p className="text-gray-600 mb-6">
                Our AI is generating comprehensive course content including lessons, notes, 
                flashcards, quizzes, and interactive materials based on your syllabus.
              </p>
              <div className="space-y-2 text-left max-w-md mx-auto">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">Course structure created</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                  <span className="text-sm text-gray-600">Generating lesson content</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-400">Creating assessments</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Course Ready */}
        {currentStep === 'course-ready' && generatedCourse && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl shadow-lg p-8 text-white text-center mb-8">
              <GraduationCap className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-3xl font-bold mb-4">Your Course is Ready! 🎉</h3>
              <p className="text-lg text-green-100 mb-6">
                We&apos;ve successfully created a complete interactive course from your syllabus.
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{generatedCourse.modules.length}</div>
                  <div className="text-sm text-green-100">Modules</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {generatedCourse.modules.reduce((total, module) => total + module.lessons.length, 0)}
                  </div>
                  <div className="text-sm text-green-100">Lessons</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{generatedCourse.duration}</div>
                  <div className="text-sm text-green-100">Duration</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h4 className="text-2xl font-bold text-gray-900 mb-6">{generatedCourse.title}</h4>
              <p className="text-gray-600 mb-6">{generatedCourse.description}</p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Course Modules</h5>
                  <div className="space-y-2">
                    {generatedCourse.modules.map((module, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">{module.title}</span>
                        <span className="text-sm text-gray-500">{module.lessons.length} lessons</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Course Features</h5>
                  <div className="space-y-3">
                    {[
                      { icon: PlayCircle, text: 'Interactive video content' },
                      { icon: Brain, text: 'AI-generated notes & flashcards' },
                      { icon: Target, text: 'Assessments & quizzes' },
                      { icon: Users, text: 'Discussion & collaboration' }
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <feature.icon className="w-5 h-5 text-purple-600" />
                        <span className="text-sm text-gray-700">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => window.location.href = `/courses/${generatedCourse.id}`}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-semibold flex items-center justify-center space-x-2"
                >
                  <ArrowRight className="w-5 h-5" />
                  <span>Start Learning</span>
                </button>
                <button
                  onClick={() => {/* Share course functionality */}}
                  className="flex-1 border-2 border-purple-600 text-purple-600 py-3 px-6 rounded-lg hover:bg-purple-50 transition-colors font-semibold"
                >
                  Share Course
                </button>
                <button
                  onClick={resetProcess}
                  className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Create Another Course
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversityExam;
