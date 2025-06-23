import { geminiService } from './geminiService';

export interface ExamReadyNotes {
  summary: string;
  keyPoints: KeyPoint[];
  concepts: ConceptExplanation[];
  examQuestions: ExamQuestion[];
  practiceProblems: PracticeProblem[];
  mnemonics: Mnemonic[];
  quickReview: QuickReviewSection;
  studyTips: string[];
  timeToMaster: string;
}

export interface KeyPoint {
  id: string;
  title: string;
  description: string;
  importance: 'Critical' | 'Important' | 'Useful';
  examWeight: number; // 1-10 scale
  memorization: 'Formula' | 'Concept' | 'Application' | 'Definition';
}

export interface ConceptExplanation {
  id: string;
  concept: string;
  simpleExplanation: string;
  detailedExplanation: string;
  realWorldExample: string;
  commonMistakes: string[];
  relatedConcepts: string[];
}

export interface ExamQuestion {
  id: string;
  question: string;
  type: 'MCQ' | 'Short Answer' | 'Long Answer' | 'Problem Solving' | 'True/False';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  answer: string;
  explanation: string;
  examTips: string;
  timeToSolve: string;
}

export interface PracticeProblem {
  id: string;
  problem: string;
  solution: string;
  steps: string[];
  skillTested: string;
  variants: string[];
}

export interface Mnemonic {
  id: string;
  concept: string;
  mnemonic: string;
  explanation: string;
  type: 'Acronym' | 'Phrase' | 'Visual' | 'Story';
}

export interface QuickReviewSection {
  mustKnow: string[];
  formulasToMemorize: string[];
  keyTerms: { term: string; definition: string; }[];
  commonFormulas: { name: string; formula: string; whenToUse: string; }[];
  lastMinuteTips: string[];
}

class AINotesService {
  
  /**
   * Generates comprehensive, exam-ready AI notes for a lesson
   */
  async generateExamReadyNotes(
    title: string, 
    description: string, 
    content?: string,
    subject?: string,
    level?: 'Beginner' | 'Intermediate' | 'Advanced'
  ): Promise<ExamReadyNotes> {
    
    const prompt = `
You are an expert educational AI creating exam-ready study notes for students. Create comprehensive but concise notes that help students master the topic and excel in exams.

Topic: ${title}
Description: ${description}
Subject: ${subject || 'General'}
Level: ${level || 'Intermediate'}
${content ? `Additional Content: ${content.substring(0, 1000)}` : ''}

Generate exam-focused study notes in this exact JSON format:

{
  "summary": "2-3 sentence executive summary highlighting what students will master",
  "keyPoints": [
    {
      "id": "unique_id_1",
      "title": "Key concept title",
      "description": "Clear, concise explanation (2-3 sentences max)",
      "importance": "Critical|Important|Useful",
      "examWeight": "number 1-10 indicating how often this appears in exams",
      "memorization": "Formula|Concept|Application|Definition"
    }
  ],
  "concepts": [
    {
      "id": "concept_1",
      "concept": "Main concept name",
      "simpleExplanation": "Explain like I'm 12 years old",
      "detailedExplanation": "Comprehensive explanation for exam understanding",
      "realWorldExample": "Concrete example students can relate to",
      "commonMistakes": ["mistake 1", "mistake 2"],
      "relatedConcepts": ["concept 1", "concept 2"]
    }
  ],
  "examQuestions": [
    {
      "id": "q1",
      "question": "Exam-style question testing understanding",
      "type": "MCQ|Short Answer|Long Answer|Problem Solving|True/False",
      "difficulty": "Easy|Medium|Hard",
      "answer": "Complete answer",
      "explanation": "Why this answer is correct",
      "examTips": "Strategy for answering similar questions",
      "timeToSolve": "Estimated time needed"
    }
  ],
  "practiceProblems": [
    {
      "id": "prob1",
      "problem": "Practice problem statement",
      "solution": "Step-by-step solution",
      "steps": ["step 1", "step 2", "step 3"],
      "skillTested": "What skill this problem tests",
      "variants": ["Similar problem variations"]
    }
  ],
  "mnemonics": [
    {
      "id": "mnem1",
      "concept": "Concept to remember",
      "mnemonic": "Memory device (acronym, phrase, etc.)",
      "explanation": "How to use this mnemonic",
      "type": "Acronym|Phrase|Visual|Story"
    }
  ],
  "quickReview": {
    "mustKnow": ["Essential point 1", "Essential point 2"],
    "formulasToMemorize": ["formula 1", "formula 2"],
    "keyTerms": [
      {"term": "term", "definition": "definition"}
    ],
    "commonFormulas": [
      {"name": "formula name", "formula": "actual formula", "whenToUse": "when to apply"}
    ],
    "lastMinuteTips": ["tip 1", "tip 2"]
  },
  "studyTips": [
    "Specific study strategy 1",
    "Specific study strategy 2"
  ],
  "timeToMaster": "Estimated time to master this topic"
}

IMPORTANT REQUIREMENTS:
1. Make it EXAM-FOCUSED - everything should help students succeed in tests
2. Be CONCISE but COMPREHENSIVE - cover all important points briefly
3. Include PRACTICAL examples students can understand
4. Provide MEMORIZATION aids (mnemonics, acronyms)
5. Include realistic PRACTICE QUESTIONS
6. Give specific STUDY STRATEGIES
7. Focus on what's most likely to appear in EXAMS
8. Use clear, student-friendly language
9. Include common mistakes to avoid
10. Provide quick review section for last-minute study

Generate 5-8 key points, 3-5 concepts, 5-8 exam questions, 3-5 practice problems, 3-5 mnemonics.
Return ONLY valid JSON without markdown formatting.
`;

    try {
      const response = await geminiService.generateText(prompt);
      const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      
      try {
        return JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.warn('Failed to parse AI notes response, using fallback');
        return this.generateFallbackNotes(title, description, subject);
      }
    } catch (error) {
      console.error('Error generating exam-ready notes:', error);
      return this.generateFallbackNotes(title, description, subject);
    }
  }

  /**
   * Generates enhanced flashcards focused on exam preparation
   */
  async generateExamFlashcards(notes: ExamReadyNotes): Promise<Array<{
    id: string;
    front: string;
    back: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    category: string;
    examRelevance: number;
    hints: string[];
  }>> {
    const prompt = `
Based on these study notes, create exam-focused flashcards that help students memorize and understand key concepts.

Key Points: ${JSON.stringify(notes.keyPoints)}
Concepts: ${JSON.stringify(notes.concepts)}
Quick Review: ${JSON.stringify(notes.quickReview)}

Generate 15-20 flashcards in this JSON format:
[
  {
    "id": "card_1",
    "front": "Question or concept to test",
    "back": "Clear, complete answer",
    "difficulty": "Easy|Medium|Hard",
    "category": "Definition|Formula|Application|Concept|Problem",
    "examRelevance": "number 1-10 for exam importance",
    "hints": ["hint if student struggles", "memory aid"]
  }
]

Focus on:
- Key definitions and terms
- Important formulas
- Conceptual understanding
- Application problems
- Common exam questions
- Memory aids and mnemonics

Return only valid JSON array.
`;

    try {
      const response = await geminiService.generateText(prompt);
      const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      return this.generateFallbackFlashcards(notes);
    }
  }

  /**
   * Creates a study schedule based on the notes complexity and exam timeline
   */
  generateStudySchedule(notes: ExamReadyNotes, daysUntilExam: number): {
    dailyPlan: Array<{
      day: number;
      focus: string;
      activities: string[];
      timeRequired: string;
      difficulty: 'Light' | 'Moderate' | 'Intensive';
    }>;
    reviewSchedule: Array<{
      day: number;
      reviewType: 'Quick' | 'Detailed' | 'Practice';
      topics: string[];
    }>;
    finalPrep: string[];
  } {
    const totalSessions = Math.max(3, Math.min(daysUntilExam, 14));
    const dailyPlan = [];
    const reviewSchedule = [];

    // Distribute key points across study sessions
    const pointsPerSession = Math.ceil(notes.keyPoints.length / totalSessions);
    
    for (let day = 1; day <= totalSessions; day++) {
      const startIndex = (day - 1) * pointsPerSession;
      const endIndex = Math.min(startIndex + pointsPerSession, notes.keyPoints.length);
      const dayPoints = notes.keyPoints.slice(startIndex, endIndex);
      
      const activities = [
        'Read and understand concepts',
        'Create summary notes',
        'Practice flashcards',
        'Solve practice problems',
        'Test understanding with quiz questions'
      ];

      dailyPlan.push({
        day,
        focus: dayPoints.map(p => p.title).join(', '),
        activities: activities.slice(0, day <= totalSessions / 2 ? 3 : 5),
        timeRequired: dayPoints.length > 2 ? '2-3 hours' : '1-2 hours',        difficulty: (day <= totalSessions / 3 ? 'Light' : 
                   day <= 2 * totalSessions / 3 ? 'Moderate' : 'Intensive') as 'Light' | 'Moderate' | 'Intensive'
      });

      // Add review sessions
      if (day > 2) {
        reviewSchedule.push({
          day,
          reviewType: (day % 3 === 0 ? 'Practice' : 'Quick') as 'Quick' | 'Detailed' | 'Practice',
          topics: notes.keyPoints.slice(0, startIndex).map(p => p.title)
        });
      }
    }

    const finalPrep = [
      'Review all flashcards',
      'Go through quick review section',
      'Practice with exam questions',
      'Review common mistakes',
      'Use mnemonics for memorization',
      'Get adequate sleep before exam'
    ];

    return { dailyPlan, reviewSchedule, finalPrep };
  }

  /**
   * Fallback notes generation when AI fails
   */
  private generateFallbackNotes(title: string, description: string, subject?: string): ExamReadyNotes {
    return {
      summary: `This lesson covers ${title}, focusing on key concepts and practical applications essential for exam success.`,
      keyPoints: [
        {
          id: 'key1',
          title: `Introduction to ${title}`,
          description: 'Fundamental understanding of the main topic and its importance.',
          importance: 'Critical',
          examWeight: 8,
          memorization: 'Concept'
        },
        {
          id: 'key2',
          title: 'Key Principles',
          description: 'Core principles and rules that govern this topic.',
          importance: 'Critical',
          examWeight: 9,
          memorization: 'Definition'
        },
        {
          id: 'key3',
          title: 'Practical Applications',
          description: 'How to apply the concepts in real-world scenarios.',
          importance: 'Important',
          examWeight: 7,
          memorization: 'Application'
        }
      ],
      concepts: [
        {
          id: 'concept1',
          concept: title,
          simpleExplanation: `Think of ${title} as a fundamental building block in ${subject || 'this field'}.`,
          detailedExplanation: description,
          realWorldExample: 'This concept applies in everyday situations and professional contexts.',
          commonMistakes: ['Confusing basic terminology', 'Misunderstanding core principles'],
          relatedConcepts: ['Related topic 1', 'Related topic 2']
        }
      ],
      examQuestions: [
        {
          id: 'q1',
          question: `Explain the main concept of ${title} and its significance.`,
          type: 'Short Answer',
          difficulty: 'Medium',
          answer: 'A comprehensive explanation covering key aspects and importance.',
          explanation: 'This tests fundamental understanding of the topic.',
          examTips: 'Structure your answer with clear points and examples.',
          timeToSolve: '5-7 minutes'
        }
      ],
      practiceProblems: [
        {
          id: 'prob1',
          problem: `Apply the concepts from ${title} to solve a practical problem.`,
          solution: 'Step-by-step approach to problem-solving.',
          steps: ['Identify the problem', 'Apply relevant concepts', 'Solve systematically'],
          skillTested: 'Application of theoretical knowledge',
          variants: ['Similar problems with different contexts']
        }
      ],
      mnemonics: [
        {
          id: 'mnem1',
          concept: title,
          mnemonic: `Remember ${title} with a simple acronym or phrase.`,
          explanation: 'Use this memory device to recall key points.',
          type: 'Phrase'
        }
      ],
      quickReview: {
        mustKnow: [
          `Definition of ${title}`,
          'Key principles',
          'Main applications'
        ],
        formulasToMemorize: ['Important formulas related to the topic'],
        keyTerms: [
          { term: title, definition: description }
        ],
        commonFormulas: [],
        lastMinuteTips: [
          'Review key definitions',
          'Practice with examples',
          'Understand the main concepts'
        ]
      },
      studyTips: [
        'Create visual diagrams to understand concepts',
        'Practice with real examples',
        'Teach the concept to someone else',
        'Use spaced repetition for memorization'
      ],
      timeToMaster: '3-5 hours of focused study'
    };
  }

  /**
   * Fallback flashcard generation
   */  private generateFallbackFlashcards(notes: ExamReadyNotes): Array<{
    id: string;
    front: string;
    back: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    category: string;
    examRelevance: number;
    hints: string[];
  }> {
    const flashcards: Array<{
      id: string;
      front: string;
      back: string;
      difficulty: 'Easy' | 'Medium' | 'Hard';
      category: string;
      examRelevance: number;
      hints: string[];
    }> = [];
    
    // Generate cards from key points
    notes.keyPoints.forEach((point, index) => {
      flashcards.push({
        id: `card_${index + 1}`,
        front: `What is ${point.title}?`,
        back: point.description,
        difficulty: (point.importance === 'Critical' ? 'Hard' : 'Medium') as 'Easy' | 'Medium' | 'Hard',
        category: 'Definition',
        examRelevance: point.examWeight,
        hints: [`This is ${point.importance.toLowerCase()} for exams`]
      });
    });

    // Generate cards from concepts
    notes.concepts.forEach((concept, index) => {
      flashcards.push({
        id: `concept_card_${index + 1}`,
        front: `Explain ${concept.concept} in simple terms`,
        back: concept.simpleExplanation,
        difficulty: 'Easy',
        category: 'Concept',
        examRelevance: 7,
        hints: [concept.realWorldExample]
      });
    });

    return flashcards;
  }
}

export const aiNotesService = new AINotesService();
