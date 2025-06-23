import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Courses from './pages/Courses';
import NewCourses from './pages/NewCourses';
import SuperSimpleCourses from './pages/SuperSimpleCourses';
import CreateCourse from './pages/CreateCourse';
import YouTubeAIAgent from './pages/YouTubeAIAgent';
import GeminiAgentTest from './pages/GeminiAgentTest';
import GeminiTest from './pages/GeminiTest';
import AdminPanel from './pages/AdminPanel';
import UniversityExam from './pages/UniversityExam';
import EnhancedCourseLearning from './pages/ImprovedCourseLearning';
import Quiz from './pages/Quiz';
import TestPage from './TestPage';
import DebugCourses from './components/DebugCourses';
import SimpleFirebaseTest from './components/SimpleFirebaseTest';
import SimpleCoursesList from './components/SimpleCoursesList';
import DirectFirebaseTest from './components/DirectFirebaseTest';
import TestAINotesPage from './pages/TestAINotesPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/test" element={<TestPage />} />
            <Route path="/test-ai-notes" element={<TestAINotesPage />} />
            <Route path="/debug-courses" element={<DebugCourses />} />
            <Route path="/firebase-test" element={<SimpleFirebaseTest />} />
            <Route path="/simple-courses" element={<SimpleCoursesList />} />
            <Route path="/direct-test" element={<DirectFirebaseTest />} />
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<SuperSimpleCourses />} />
            <Route path="/courses-new" element={<NewCourses />} />
            <Route path="/courses-old" element={<Courses />} />
            <Route path="/courses/create" element={<CreateCourse />} />
            <Route path="/youtube-import" element={<YouTubeAIAgent />} />
            <Route path="/gemini-test" element={<GeminiAgentTest />} />
            <Route path="/gemini-simple-test" element={<GeminiTest />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/university-exam" element={<UniversityExam />} />
            <Route path="/course/:courseId" element={<EnhancedCourseLearning />} />
            <Route path="/quiz/:moduleId" element={<Quiz />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;