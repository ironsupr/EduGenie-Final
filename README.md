# 🎓 EduGenie - AI-Powered Educational Platform

> **Transform your learning experience with AI-driven course generation, intelligent notes, and personalized study plans.**

[![Built with React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.19-purple.svg)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-10.14.1-orange.svg)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.14-teal.svg)](https://tailwindcss.com/)

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Project Architecture](#-project-architecture)
- [Installation & Setup](#-installation--setup)
- [Environment Configuration](#-environment-configuration)
- [User Workflow](#-user-workflow)
- [AI Features Deep Dive](#-ai-features-deep-dive)
- [Project Structure](#-project-structure)
- [Key Components](#-key-components)
- [API Integration](#-api-integration)
- [Development Guide](#-development-guide)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Overview

**EduGenie** is a cutting-edge educational platform that leverages artificial intelligence to revolutionize online learning. The platform combines traditional learning management system capabilities with advanced AI features to create personalized, interactive, and efficient learning experiences.

### What Makes EduGenie Special?

🤖 **AI-Powered Content Generation**: Automatically generate comprehensive course content from syllabi, YouTube videos, or custom topics

📚 **Intelligent Study Materials**: AI-generated notes, flashcards, and quizzes tailored to your learning style

🎯 **Personalized Learning Paths**: Custom study plans based on your pace and preferences

🔄 **Multi-Source Course Creation**: Import from YouTube, upload syllabi, or create from scratch

📊 **Advanced Analytics**: Track progress with detailed learning analytics

## ✨ Features

### 🔐 **Authentication & User Management**

- **Secure Authentication**: Email/password authentication with Firebase Auth
- **User Profiles**: Personalized user dashboards and preferences
- **Role-based Access**: Support for students, instructors, and administrators

### 📚 **Course Management**

- **Multiple Course Creation Methods**:
  - 📄 **Syllabus Upload**: Upload PDF syllabi and generate complete courses
  - 🎥 **YouTube Integration**: Import YouTube playlists/videos as courses
  - ✍️ **Manual Creation**: Build courses from scratch with custom content
- **Interactive Course Player**: Enhanced video player with AI-generated supplementary content
- **Progress Tracking**: Comprehensive learning progress monitoring

### 🤖 **AI-Powered Learning Features**

- **Smart Notes Generation**: AI creates comprehensive study notes from any content
- **Interactive Flashcards**: Automatically generated flashcards for key concepts
- **Intelligent Quizzes**: Adaptive quizzes that adjust to your learning level
- **Memory Aids**: AI-generated mnemonics and memory techniques
- **Topic-Based Content**: AI focuses on educational value rather than metadata

### 📊 **Study Planning & Analytics**

- **Personalized Study Plans**: AI-generated study schedules based on your goals
- **Progress Analytics**: Detailed insights into your learning journey
- **Performance Tracking**: Monitor quiz scores, completion rates, and time spent

### 🎨 **User Experience**

- **Responsive Design**: Seamless experience across desktop, tablet, and mobile
- **Modern UI/UX**: Clean, intuitive interface built with Tailwind CSS
- **Accessibility**: ARIA-compliant components for inclusive learning
- **Real-time Feedback**: Toast notifications and loading states for better UX

## 🛠 Technology Stack

### **Frontend Technologies**

- **[React 18.3.1](https://reactjs.org/)**: Modern UI library with hooks and concurrent features
- **[TypeScript 5.6.2](https://www.typescriptlang.org/)**: Type-safe JavaScript for better development experience
- **[Vite 5.4.19](https://vitejs.dev/)**: Lightning-fast build tool and development server
- **[Tailwind CSS 3.4.14](https://tailwindcss.com/)**: Utility-first CSS framework for rapid styling
- **[Lucide React](https://lucide.dev/)**: Beautiful SVG icons library

### **Backend & Services**

- **[Firebase 10.14.1](https://firebase.google.com/)**:
  - **Authentication**: Secure user management
  - **Firestore**: NoSQL document database
  - **Storage**: File storage for syllabi and media
  - **Hosting**: Scalable web hosting
- **[Google AI (Gemini)](https://ai.google.dev/)**: Advanced AI for content generation
- **[YouTube Data API](https://developers.google.com/youtube/v3)**: Video content integration

### **Development Tools**

- **[ESLint](https://eslint.org/)**: Code linting and quality assurance
- **[PostCSS](https://postcss.org/)**: CSS processing and optimization
- **[React Router](https://reactrouter.com/)**: Client-side routing
- **Git**: Version control and collaboration

## 🏗 Project Architecture

### **Frontend Architecture**

```
┌─────────────────────────────────────────┐
│                UI Layer                 │
├─────────────────────────────────────────┤
│  React Components + TypeScript          │
│  ├── Pages (Route Components)           │
│  ├── Components (Reusable UI)           │
│  └── Contexts (State Management)        │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│              Service Layer              │
├─────────────────────────────────────────┤
│  ├── Firebase Services                  │
│  ├── AI/Gemini Integration              │
│  ├── YouTube API Services               │
│  └── Authentication Services            │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│             Backend Services            │
├─────────────────────────────────────────┤
│  ├── Firebase (Auth, Firestore, Storage)│
│  ├── Google AI (Gemini)                 │
│  └── YouTube Data API v3                │
└─────────────────────────────────────────┘
```

### **Data Flow**

1. **User Interaction** → React Components
2. **State Management** → React Context + useState/useEffect
3. **API Calls** → Service Layer (Firebase, AI, YouTube)
4. **Data Processing** → AI Content Generation
5. **State Updates** → UI Re-rendering
6. **Persistence** → Firebase Firestore

## 📥 Installation & Setup

### **Prerequisites**

- **Node.js**: Version 16.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Git**: For version control
- **Modern Browser**: Chrome, Firefox, Safari, or Edge

### **Step 1: Clone Repository**

```bash
git clone https://github.com/your-username/edugenie.git
cd edugenie
```

### **Step 2: Install Dependencies**

```bash
npm install
```

### **Step 3: Environment Setup**

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local with your API keys (see Environment Configuration section)
```

### **Step 4: Start Development Server**

```bash
npm run dev
```

### **Step 5: Open in Browser**

Navigate to `http://localhost:5173` to see the application running.

## 🔧 Environment Configuration

Create a `.env.local` file in the project root with the following variables:

### **Firebase Configuration**

```bash
# Firebase Project Configuration
# Get these from Firebase Console → Project Settings → General → Your Apps
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### **AI Integration**

```bash
# Google AI (Gemini) API Key
# Get from: https://ai.google.dev/
VITE_GOOGLE_AI_API_KEY=your-google-ai-api-key
GOOGLE_AI_API_KEY=your-google-ai-api-key
```

### **YouTube Integration**

```bash
# YouTube Data API v3 Key
# Get from: https://developers.google.com/youtube/v3/getting-started
VITE_YOUTUBE_API_KEY=your-youtube-api-key
YOUTUBE_API_KEY=your-youtube-api-key
```

### **How to Get API Keys**

#### **Firebase Setup**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Navigate to Project Settings → General → Your Apps
4. Add a web app and copy the configuration
5. Enable Authentication, Firestore, and Storage

#### **Google AI (Gemini) Setup**

1. Visit [Google AI Studio](https://ai.google.dev/)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key to your environment file

#### **YouTube API Setup**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Copy the API key to your environment file

## 👤 User Workflow

### **1. Getting Started**

```
User Registration → Email Verification → Profile Setup → Dashboard Access
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── services/           # API services (Firebase)
├── contexts/           # React contexts
├── types/              # TypeScript type definitions
├── config/             # Configuration files
└── styles/             # CSS and styling
```

## 🔑 Key Components

### **Core Application Components**

#### **App.tsx**

- Main application wrapper
- Router configuration
- Global state providers

#### **AuthContext.tsx**

- User authentication state management
- Login/logout functionality
- User session persistence

#### **Navbar.tsx**

- Global navigation
- User authentication status
- Mobile-responsive menu

### **Page Components**

#### **ImprovedCourseLearning.tsx**

- Enhanced course player with AI features
- Tabbed interface for different learning modes:
  - **Overview**: Course structure and objectives
  - **AI Notes**: Intelligent study notes
  - **Flashcards**: Interactive flashcard system
  - **Quiz**: Adaptive quizzes and assessments

#### **UniversityExam.tsx**

- Syllabus upload and processing
- AI-powered course generation
- Study plan creation and download

#### **YouTubeAIAgent.tsx**

- YouTube video/playlist import
- Content analysis and enhancement
- Course structure generation

### **Service Layer**

#### **geminiService.ts**

- Google AI (Gemini) integration
- Content generation for notes, flashcards, and quizzes
- Topic-based AI processing

#### **aiNotesService.ts**

- Specialized AI notes generation
- Memory aids and mnemonics creation
- Structured learning content

#### **courseService.ts**

- Course CRUD operations
- Firebase integration for course data
- Progress tracking and analytics

## 🔗 API Integration

### **Firebase Integration**

```typescript
// Authentication
import { auth } from "./config/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

// Firestore Database
import { db } from "./config/firebase";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

// Storage
import { storage } from "./config/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
```

### **Google AI (Gemini) Integration**

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
```

### **YouTube Data API Integration**

```typescript
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

// Video details, playlists, channel information
```

## 💻 Development Guide

### **Available Scripts**

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking

# Testing
npm run test             # Run tests (if configured)
```

### **Development Workflow**

1. **Feature Development**

   ```bash
   git checkout -b feature/your-feature-name
   # Make changes
   npm run lint
   npm run build
   git commit -m "feat: add your feature"
   git push origin feature/your-feature-name
   ```

2. **Code Standards**

   - Use TypeScript for type safety
   - Follow ESLint configuration
   - Use Tailwind CSS for styling
   - Implement responsive design
   - Add proper error handling
   - Include loading states

3. **Component Development**
   - Create reusable components
   - Use proper TypeScript interfaces
   - Implement accessibility features
   - Add proper documentation

### **Debugging**

#### **Browser DevTools**

- React Developer Tools
- Firebase debugging
- Network tab for API calls

#### **Common Issues**

- **Environment Variables**: Ensure all required variables are set
- **API Keys**: Verify API keys are valid and have proper permissions
- **Firebase Rules**: Check Firestore and Storage security rules
- **CORS Issues**: Verify API configurations

## 🚀 Deployment

### **Production Build**

```bash
npm run build
```

### **Firebase Hosting**

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting
firebase init hosting

# Deploy
firebase deploy
```

### **Environment Variables for Production**

Ensure all environment variables are properly set in your hosting environment:

- Firebase configuration
- API keys for Google AI and YouTube
- Any other third-party service keys

### **Performance Optimization**

- Code splitting with dynamic imports
- Image optimization
- Bundle size analysis
- Caching strategies

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### **How to Contribute**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Ensure code passes linting
6. Submit a pull request

### **Code Standards**

- Follow TypeScript best practices
- Use consistent naming conventions
- Add proper documentation
- Implement error handling
- Write meaningful commit messages

### **Pull Request Process**

1. Update documentation if needed
2. Ensure all tests pass
3. Get approval from maintainers
4. Merge to main branch

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Google** for AI services and YouTube API
- **Firebase** for backend infrastructure
- **Tailwind CSS** for styling framework
- **Lucide** for beautiful icons

## 📞 Support

For support, please contact:

- **Email**: support@edugenie.com
- **Documentation**: [docs.edugenie.com](https://docs.edugenie.com)
- **Issues**: [GitHub Issues](https://github.com/your-username/edugenie/issues)

---

**Built with ❤️ by the EduGenie Team**

_Transforming education through the power of AI_
