import { geminiService } from './geminiService';
import { Course, Module, Lesson, Resource } from '../types';

export interface SyllabusAnalysis {
  courseCode: string;
  courseTitle: string;
  credits: number;
  prerequisites: string[];
  objectives: string[];
  outcomes: string[];
  modules: SyllabusModule[];
  evaluationCriteria: string;
  referenceBooks: ReferenceBook[];
  totalHours: number;
}

export interface SyllabusModule {
  number: number;
  title: string;
  description: string;
  topics: string[];
  duration: number; // in hours
  learningObjectives: string[];
}

export interface ReferenceBook {
  title: string;
  authors: string[];
  publisher: string;
  isbn?: string;
  edition?: string;
}

export interface GeneratedCourse extends Course {
  originalSyllabus: SyllabusAnalysis;
}

class SyllabusProcessorService {
  
  /**
   * Extracts text content from uploaded file
   */
  async extractTextFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const text = event.target?.result as string;
        resolve(text);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      // For now, treat all files as text. In production, you'd handle PDFs differently
      if (file.type === 'application/pdf') {
        // For PDF files, you'd use a PDF parsing library like pdf-parse
        // For this demo, we'll just read as text
        reader.readAsText(file);
      } else {
        reader.readAsText(file);
      }
    });
  }

  /**
   * Analyzes syllabus text using AI to extract structured information
   */
  async analyzeSyllabus(syllabusText: string): Promise<SyllabusAnalysis> {
    const analysisPrompt = `
Analyze this university course syllabus and extract key information in JSON format:

${syllabusText}

Please extract and structure the following information in JSON format:
{
  "courseCode": "Course code (e.g., CSE0002)",
  "courseTitle": "Full course title",
  "credits": number_of_credits,
  "prerequisites": ["list of prerequisite courses"],
  "objectives": ["course objectives as bullet points"],
  "outcomes": ["learning outcomes as bullet points"],
  "modules": [
    {
      "number": module_number,
      "title": "module title",
      "description": "detailed description",
      "topics": ["topic 1", "topic 2", "subtopic 1", "subtopic 2"],
      "duration": hours_for_this_module,
      "learningObjectives": ["what students will learn in this module"]
    }
  ],
  "evaluationCriteria": "assessment and grading information",
  "referenceBooks": [
    {
      "title": "book title",
      "authors": ["author1", "author2"],
      "publisher": "publisher name",
      "isbn": "ISBN if available",
      "edition": "edition if available"
    }
  ],
  "totalHours": total_course_hours
}

Extract all modules and topics comprehensively. If information is missing, use reasonable defaults.
Return only valid JSON without any markdown formatting.
`;

    try {
      const response = await geminiService.generateText(analysisPrompt);
      const cleanedResponse = response.replace(/```json|```/g, '').trim();
      
      try {
        return JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.warn('Failed to parse syllabus analysis, using fallback structure');
        
        // Create a fallback structure from the original text
        return this.createFallbackAnalysis(syllabusText);
      }
    } catch (error) {
      console.error('Error analyzing syllabus with AI:', error);
      return this.createFallbackAnalysis(syllabusText);
    }
  }

  /**
   * Creates a fallback analysis when AI processing fails
   */
  private createFallbackAnalysis(syllabusText: string): SyllabusAnalysis {
    const lines = syllabusText.split('\n').filter(line => line.trim());
    
    // Try to extract basic information using simple parsing
    const courseTitle = this.extractCourseTitle(lines);
    const courseCode = this.extractCourseCode(lines);
    
    return {
      courseCode: courseCode || 'COURSE001',
      courseTitle: courseTitle || 'University Course',
      credits: 3,
      prerequisites: [],
      objectives: ['Study the fundamental concepts covered in the syllabus'],
      outcomes: ['Understand key topics', 'Apply learned concepts', 'Demonstrate knowledge through assessments'],
      modules: this.extractBasicModules(syllabusText),
      evaluationCriteria: 'Standard university assessment methods',
      referenceBooks: [],
      totalHours: 40
    };
  }

  private extractCourseTitle(lines: string[]): string {
    for (const line of lines) {
      if (line.length > 10 && line.length < 100 && 
          (line.includes('Course') || line.includes('Subject') || line.toUpperCase() === line)) {
        return line.trim();
      }
    }
    return 'University Course';
  }

  private extractCourseCode(lines: string[]): string {
    for (const line of lines) {
      const match = line.match(/[A-Z]{2,4}\d{4}/);
      if (match) {
        return match[0];
      }
    }
    return 'COURSE001';
  }

  private extractBasicModules(text: string): SyllabusModule[] {
    const modules: SyllabusModule[] = [];
    const modulePattern = /module\s+(\d+)|unit\s+(\d+)|chapter\s+(\d+)/gi;
    const matches = text.match(modulePattern);
      if (matches && matches.length > 0) {
      matches.forEach((_, index) => {
        modules.push({
          number: index + 1,
          title: `Module ${index + 1}`,
          description: 'Key concepts and topics from the syllabus',
          topics: ['Core concepts', 'Practical applications', 'Advanced topics'],
          duration: 8,
          learningObjectives: ['Understand fundamental concepts', 'Apply knowledge practically']
        });
      });
    } else {
      // Create default modules
      for (let i = 1; i <= 5; i++) {
        modules.push({
          number: i,
          title: `Module ${i}`,
          description: 'Important topics covered in this module',
          topics: ['Fundamental concepts', 'Key principles', 'Practical applications'],
          duration: 8,
          learningObjectives: ['Master core concepts', 'Apply theoretical knowledge']
        });
      }
    }
    
    return modules;
  }

  /**
   * Generates a complete course structure from syllabus analysis
   */
  async generateCourseFromSyllabus(syllabusAnalysis: SyllabusAnalysis, instructorId: string = 'ai-generated'): Promise<GeneratedCourse> {
    const courseId = `course_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate course modules with AI-enhanced content
    const modules = await this.generateCourseModules(syllabusAnalysis);
    
    const course: GeneratedCourse = {
      id: courseId,
      title: syllabusAnalysis.courseTitle,
      description: this.generateCourseDescription(syllabusAnalysis),
      instructor: 'AI Generated Course',
      instructorId,
      category: this.determineCourseCategory(syllabusAnalysis.courseTitle),
      level: this.determineCourseLevel(syllabusAnalysis),
      price: 0, // Free AI-generated course
      duration: `${syllabusAnalysis.totalHours} hours`,
      rating: 4.5,
      studentsCount: 0,
      imageUrl: this.generateCourseImageUrl(syllabusAnalysis.courseTitle),
      modules,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublished: true,
      originalSyllabus: syllabusAnalysis
    };

    return course;
  }

  /**
   * Generates detailed course modules from syllabus modules
   */
  private async generateCourseModules(syllabusAnalysis: SyllabusAnalysis): Promise<Module[]> {
    const modules: Module[] = [];

    for (const [index, syllabusModule] of syllabusAnalysis.modules.entries()) {
      const lessons = await this.generateLessonsForModule(syllabusModule, index);
      
      const module: Module = {
        id: `module_${index + 1}`,
        title: syllabusModule.title,
        description: syllabusModule.description,
        duration: `${syllabusModule.duration} hours`,
        order: index + 1,
        lessons
      };

      modules.push(module);
    }

    return modules;
  }

  /**
   * Generates lessons for a specific module
   */
  private async generateLessonsForModule(syllabusModule: SyllabusModule, moduleIndex: number): Promise<Lesson[]> {
    const lessons: Lesson[] = [];
    const topicsPerLesson = Math.ceil(syllabusModule.topics.length / 3); // Aim for 3-4 lessons per module
    
    for (let i = 0; i < syllabusModule.topics.length; i += topicsPerLesson) {
      const lessonTopics = syllabusModule.topics.slice(i, i + topicsPerLesson);
      const lessonIndex = Math.floor(i / topicsPerLesson) + 1;
      
      const lesson: Lesson = {
        id: `lesson_${moduleIndex + 1}_${lessonIndex}`,
        title: lessonTopics.length === 1 ? lessonTopics[0] : `${lessonTopics[0]} and Related Topics`,
        description: `Comprehensive coverage of: ${lessonTopics.join(', ')}`,
        duration: `${Math.round(syllabusModule.duration / Math.ceil(syllabusModule.topics.length / topicsPerLesson))} hours`,
        order: lessonIndex,
        content: await this.generateLessonContent(lessonTopics, syllabusModule.title),
        resources: this.generateLessonResources(lessonTopics),
        completed: false
      };

      lessons.push(lesson);
    }

    return lessons;
  }

  /**
   * Generates detailed lesson content using AI
   */
  private async generateLessonContent(topics: string[], moduleTitle: string): Promise<string> {
    const contentPrompt = `
Create comprehensive educational content for a university lesson covering these topics:

Module: ${moduleTitle}
Topics to cover: ${topics.join(', ')}

Please create structured lesson content with:
1. Learning Objectives (3-4 points)
2. Introduction and Overview
3. Detailed explanations for each topic
4. Key concepts and definitions
5. Practical examples where applicable
6. Summary and key takeaways
7. Self-assessment questions

Format the content in markdown for easy reading. Make it comprehensive but accessible for university students.
`;

    try {
      const content = await geminiService.generateText(contentPrompt);
      return content;
    } catch (error) {
      console.warn('Failed to generate AI content, using fallback');
      return this.generateFallbackLessonContent(topics, moduleTitle);
    }
  }

  private generateFallbackLessonContent(topics: string[], moduleTitle: string): string {
    return `# ${moduleTitle} - Lesson Content

## Learning Objectives
- Understand the fundamental concepts of ${topics.join(' and ')}
- Apply theoretical knowledge to practical scenarios
- Develop problem-solving skills in this domain
- Prepare for assessments and examinations

## Topics Covered

${topics.map(topic => `### ${topic}

This section covers the essential concepts related to ${topic}. Students will learn:
- Core principles and theories
- Practical applications and use cases
- Common challenges and solutions
- Best practices and methodologies

`).join('\n')}

## Summary
This lesson provides a comprehensive overview of ${topics.join(', ')} within the context of ${moduleTitle}. Students should review all concepts and practice with the provided exercises.

## Self-Assessment
1. What are the key concepts covered in this lesson?
2. How do these topics relate to each other?
3. What are the practical applications of this knowledge?
4. How can you apply what you've learned?
`;
  }

  /**
   * Generates learning resources for a lesson
   */
  private generateLessonResources(topics: string[]): Resource[] {
    const resources: Resource[] = [];

    topics.forEach((topic, index) => {
      resources.push({
        id: `resource_${index + 1}`,
        title: `${topic} - Study Guide`,
        type: 'document',
        url: `#study-guide-${topic.toLowerCase().replace(/\s+/g, '-')}`,
        size: '2 MB'
      });

      resources.push({
        id: `resource_video_${index + 1}`,
        title: `${topic} - Video Tutorial`,
        type: 'video',
        url: `#video-${topic.toLowerCase().replace(/\s+/g, '-')}`,
        size: '50 MB'
      });
    });

    return resources;
  }

  private generateCourseDescription(syllabusAnalysis: SyllabusAnalysis): string {
    return `
This comprehensive course covers ${syllabusAnalysis.courseTitle} (${syllabusAnalysis.courseCode}) based on the official university syllabus.

**Course Objectives:**
${syllabusAnalysis.objectives.map(obj => `• ${obj}`).join('\n')}

**Learning Outcomes:**
${syllabusAnalysis.outcomes.map(outcome => `• ${outcome}`).join('\n')}

**Duration:** ${syllabusAnalysis.totalHours} hours across ${syllabusAnalysis.modules.length} modules

This AI-generated course ensures comprehensive coverage of all syllabus topics with structured learning paths, practical exercises, and assessment materials.
    `.trim();
  }

  private determineCourseCategory(courseTitle: string): string {
    const title = courseTitle.toLowerCase();
    
    if (title.includes('computer') || title.includes('software') || title.includes('programming')) {
      return 'Computer Science';
    } else if (title.includes('math') || title.includes('statistics')) {
      return 'Mathematics';
    } else if (title.includes('business') || title.includes('management')) {
      return 'Business';
    } else if (title.includes('science') || title.includes('physics') || title.includes('chemistry')) {
      return 'Science';
    } else if (title.includes('engineering')) {
      return 'Engineering';
    } else {
      return 'General';
    }
  }

  private determineCourseLevel(syllabusAnalysis: SyllabusAnalysis): 'Beginner' | 'Intermediate' | 'Advanced' {
    const courseCode = syllabusAnalysis.courseCode;
    
    // Determine level based on course code pattern
    const numberMatch = courseCode.match(/\d+/);
    if (numberMatch) {
      const courseNumber = parseInt(numberMatch[0]);
      if (courseNumber <= 1000) return 'Beginner';
      if (courseNumber <= 3000) return 'Intermediate';
      return 'Advanced';
    }
    
    return 'Intermediate';
  }

  private generateCourseImageUrl(courseTitle: string): string {
    // In production, you'd generate or select appropriate course images
    return `https://via.placeholder.com/400x300?text=${encodeURIComponent(courseTitle)}`;
  }
}

export const syllabusProcessorService = new SyllabusProcessorService();
