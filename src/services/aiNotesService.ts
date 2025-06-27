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
   */  async generateExamReadyNotes(
    title: string, 
    description: string, 
    _content?: string,
    subject?: string,
    level?: 'Beginner' | 'Intermediate' | 'Advanced'
  ): Promise<ExamReadyNotes> {
      const prompt = `Create comprehensive study notes about the TOPIC itself, not just the video content. Generate educational content that teaches the complete subject matter.

TOPIC TO TEACH: ${title}
BRIEF DESCRIPTION: ${description}
SUBJECT AREA: ${subject || 'General'}
TARGET LEVEL: ${level || 'Beginner'}

FOCUS ON THE TOPIC, NOT THE VIDEO:
- Generate content about the SUBJECT MATTER itself (e.g., if title is "JavaScript Variables", teach about JavaScript variables comprehensively)
- Create educational content as if you're a subject matter expert teaching this topic
- Don't limit to what might be in a video description
- Provide complete coverage of the topic for thorough understanding
- Include fundamental concepts, practical applications, and advanced insights
- Make it educational and comprehensive, suitable for academic study

CRITICAL REQUIREMENTS FOR COMPREHENSIVE TOPIC COVERAGE:
- TOPIC-FOCUSED: Generate content about the subject matter, not video content
- COMPLETE EDUCATION: Cover all essential aspects of the topic
- ACADEMIC DEPTH: Include theoretical foundations and practical applications  
- BEGINNER-FRIENDLY: Start from basics but build to comprehensive understanding
- SELF-CONTAINED: Student should master the topic from these notes alone
- EXAM-READY: Include everything needed for tests and assessments
- PRACTICAL: Real-world applications and examples
- STRUCTURED: Logical progression from fundamentals to advanced concepts

Return ONLY this JSON structure:

{
  "summary": "2-3 sentences explaining what complete beginners will learn and why it matters",  "keyPoints": [
    {
      "id": "kp1",
      "title": "Core Topic Concept (comprehensive coverage)",
      "description": "Complete explanation of this aspect of the topic",
      "importance": "Critical|Important|Useful",
      "examWeight": 8,
      "memorization": "Definition|Concept|Formula|Application"
    }
  ],
  "concepts": [
    {
      "id": "c1",
      "concept": "Fundamental Topic Concept",
      "simpleExplanation": "Clear introduction to this concept within the topic",
      "detailedExplanation": "Comprehensive explanation with academic depth and context",
      "realWorldExample": "Practical application showing how this concept is used",
      "commonMistakes": ["typical error 1", "typical error 2"],
      "relatedConcepts": ["connected concept A", "related topic B"]
    }
  ],
  "examQuestions": [
    {
      "id": "eq1",
      "question": "Comprehensive question testing topic understanding",
      "type": "MCQ|Short Answer|Long Answer|Problem Solving|True/False",
      "difficulty": "Easy|Medium|Hard", 
      "answer": "Complete answer demonstrating topic mastery",
      "explanation": "Detailed explanation connecting to topic fundamentals",
      "examTips": "Strategy for answering topic-related questions",
      "timeToSolve": "3-5 minutes"
    }
  ],
  "practiceProblems": [
    {
      "id": "pp1",
      "problem": "Practical problem applying topic concepts",
      "solution": "Step-by-step solution using topic principles",
      "steps": ["analysis step", "application step", "solution step"],
      "skillTested": "Core topic competency being assessed",
      "variants": ["alternative applications of same concept"]
    }
  ],
  "mnemonics": [
    {
      "id": "m1",
      "concept": "Key topic element to remember",
      "mnemonic": "Memory device for topic mastery",
      "explanation": "How this aids topic comprehension and recall",
      "type": "Acronym|Phrase|Visual|Story"
    }
  ],
  "quickReview": {
    "mustKnow": ["Essential topic fact 1", "Essential topic fact 2", "Essential topic fact 3"],
    "formulasToMemorize": ["key topic formula 1", "key topic formula 2"],
    "keyTerms": [
      {"term": "topic-specific term", "definition": "comprehensive definition with context"}
    ],
    "commonFormulas": [
      {"name": "formula name", "formula": "mathematical expression", "whenToUse": "application context"}
    ],
    "lastMinuteTips": ["topic mastery tip 1", "topic mastery tip 2", "topic mastery tip 3"]
  },
  "studyTips": [
    "Effective strategy for mastering this topic",
    "Advanced technique for topic comprehension", 
    "Practice method for topic retention"
  ],
  "timeToMaster": "realistic estimate for topic proficiency"
}

TOPIC-FOCUSED CONTENT GENERATION:
- TEACH THE SUBJECT: Focus on comprehensive topic education, not video content
- ACADEMIC DEPTH: Cover theoretical foundations and practical applications
- COMPLETE COVERAGE: Include all essential aspects of the topic
- EXPERT KNOWLEDGE: Generate content as if you're a subject matter expert
- PRACTICAL APPLICATION: Show real-world uses and implementations
- CONCEPTUAL CLARITY: Explain underlying principles and theories
- SKILL BUILDING: Progress from fundamentals to advanced applications
- ASSESSMENT READY: Include content suitable for tests and evaluations

GENERATE COMPREHENSIVE CONTENT:
- 5-6 key points covering all major topic aspects
- 3-4 core concepts with full theoretical and practical explanations
- 4-6 exam questions testing complete topic understanding
- 2-4 practice problems applying topic principles in different contexts
- 3-5 topic-specific mnemonics for essential concepts
- Complete quick review covering all topic fundamentals

EDUCATIONAL GOAL: Create a complete study resource for mastering this topic, not just understanding a video.
RETURN: Only valid JSON, no markdown formatting or extra text.`;try {
      console.log('Generating AI notes with optimized prompt...');
      const response = await geminiService.generateText(prompt);
      console.log('AI response received, cleaning and parsing...');
      
      // Clean the response more thoroughly
      let cleanedResponse = response.trim();
      
      // Remove markdown code blocks
      cleanedResponse = cleanedResponse.replace(/```json\s*|\s*```/g, '');
      
      // Remove any text before the first { or after the last }
      const firstBrace = cleanedResponse.indexOf('{');
      const lastBrace = cleanedResponse.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanedResponse = cleanedResponse.substring(firstBrace, lastBrace + 1);
      }
      
      try {
        const parsedNotes = JSON.parse(cleanedResponse);
        console.log('Successfully parsed AI notes');
        
        // Validate the structure and fix any missing fields
        const validatedNotes = this.validateAndFixNotes(parsedNotes, title, description, subject);
        return validatedNotes;
        
      } catch (parseError) {
        console.warn('Failed to parse AI notes response:', parseError);
        console.log('Raw response:', response.substring(0, 500) + '...');
        console.log('Cleaned response:', cleanedResponse.substring(0, 500) + '...');
        
        // Try to extract partial data or use fallback
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
  }  /**
   * Fallback notes generation when AI fails
   */
  private generateFallbackNotes(title: string, description: string, subject?: string): ExamReadyNotes {
    return {
      summary: `Complete beginner's guide to ${title}: Everything you need to know about this topic, explained from the ground up for someone with zero prior knowledge.`,
      keyPoints: [
        {
          id: 'key1',
          title: `What is ${title}? (Starting from Basics)`,
          description: 'We begin by understanding what this topic is, why it exists, and why it matters in simple, everyday terms.',
          importance: 'Critical',
          examWeight: 10,
          memorization: 'Definition'
        },
        {
          id: 'key2',
          title: 'Basic Terminology and Key Words',
          description: 'Learn the essential vocabulary and terms you need to understand when people talk about this topic.',
          importance: 'Critical',
          examWeight: 9,
          memorization: 'Definition'
        },
        {
          id: 'key3',
          title: 'Core Principles and How Things Work',
          description: 'The fundamental rules and principles that govern this topic, explained step-by-step for beginners.',
          importance: 'Critical',
          examWeight: 9,
          memorization: 'Concept'
        },
        {
          id: 'key4',
          title: 'Real-World Applications and Examples',
          description: 'Where and how you encounter this topic in everyday life, with concrete examples you can relate to.',
          importance: 'Important',
          examWeight: 8,
          memorization: 'Application'
        },
        {
          id: 'key5',
          title: 'Common Beginner Mistakes and How to Avoid Them',
          description: 'Typical errors that newcomers make when learning this topic and simple ways to prevent them.',
          importance: 'Important',
          examWeight: 7,
          memorization: 'Concept'
        }
      ],
      concepts: [
        {
          id: 'concept1',
          concept: `What is ${title}?`,
          simpleExplanation: `Think of ${title} as a fundamental concept in ${subject || 'this field'} that beginners need to understand first.`,
          detailedExplanation: description || `${title} is a key topic that involves understanding basic principles and learning how they work in practice. This forms the foundation that everything else builds upon, so it's crucial for beginners to grasp these fundamentals before moving to more advanced concepts.`,
          realWorldExample: `Just like learning to ride a bike, you start with understanding what a bike is and why people use it before learning to balance and pedal.`,
          commonMistakes: ['Trying to learn advanced concepts before mastering basics', 'Skipping fundamental definitions', 'Not practicing with simple examples first'],
          relatedConcepts: ['Basic Fundamentals', 'Essential Terminology', 'Beginner Applications']
        },
        {
          id: 'concept2',
          concept: 'Essential Terminology',
          simpleExplanation: 'Every field has its own language - key words and terms that experts use when discussing the topic.',
          detailedExplanation: 'Understanding the basic vocabulary is like learning the alphabet before reading. Each term has a specific meaning, and knowing these terms helps you understand more complex explanations and communicate with others about the topic.',
          realWorldExample: 'Like learning cooking terms (sauté, simmer, dice) before following recipes, you need to know the basic terms before diving deeper.',
          commonMistakes: ['Assuming you understand terms without checking definitions', 'Using words incorrectly', 'Getting overwhelmed by technical language'],
          relatedConcepts: [title, 'Basic Definitions', 'Communication Skills']
        },
        {
          id: 'concept3',
          concept: 'How Things Work (Basic Principles)',
          simpleExplanation: 'The fundamental rules that explain why and how things happen in this topic area.',
          detailedExplanation: 'Every topic has underlying principles - like laws of nature - that govern how things work. Understanding these basic rules helps you predict outcomes, solve problems, and make sense of new situations you encounter.',
          realWorldExample: 'Like understanding that water boils at 100°C helps you cook better, knowing basic principles helps you apply knowledge correctly.',
          commonMistakes: ['Memorizing facts without understanding principles', 'Skipping the "why" and only learning the "what"', 'Not connecting principles to real examples'],
          relatedConcepts: ['Fundamental Rules', 'Cause and Effect', 'Problem Solving']
        }
      ],
      examQuestions: [
        {
          id: 'q1',
          question: `In simple terms, what is ${title} and why is it important for beginners to learn?`,
          type: 'Short Answer',
          difficulty: 'Easy',
          answer: `${title} is ${description || 'a fundamental concept'} that beginners need to understand because it forms the foundation for more advanced learning in this area.`,
          explanation: 'This tests whether you understand the basic definition and importance of the topic.',
          examTips: 'Start with a simple definition, then explain why it matters to someone new to the field.',
          timeToSolve: '3-4 minutes'
        },
        {
          id: 'q2',
          question: `What are the most important terms a complete beginner should know about ${title}?`,
          type: 'Short Answer',
          difficulty: 'Easy',
          answer: 'Key terms include basic definitions related to the core concepts, fundamental principles, and essential vocabulary used in this field.',
          explanation: 'Tests knowledge of essential terminology that forms the foundation of understanding.',
          examTips: 'List 3-5 key terms and give a simple definition for each one.',
          timeToSolve: '4-5 minutes'
        },
        {
          id: 'q3',
          question: `Give a real-world example that helps explain ${title} to someone who has never heard of it before.`,
          type: 'Short Answer',
          difficulty: 'Medium',
          answer: 'Use an everyday example that most people can relate to, showing how the concepts apply in familiar situations.',
          explanation: 'Tests ability to connect abstract concepts with concrete, relatable examples.',
          examTips: 'Choose an example from daily life that clearly illustrates the main principles.',
          timeToSolve: '4-5 minutes'
        },
        {
          id: 'q4',
          question: `What are the most common mistakes beginners make when learning ${title}, and how can they be avoided?`,
          type: 'Short Answer',
          difficulty: 'Medium',
          answer: 'Common mistakes include rushing through basics, not understanding terminology, and trying advanced concepts too early. Avoid these by taking time with fundamentals.',
          explanation: 'Tests awareness of learning pitfalls and strategies for effective beginner learning.',
          examTips: 'Mention 2-3 specific mistakes and give practical advice for avoiding each one.',
          timeToSolve: '5-6 minutes'
        }
      ],
      practiceProblems: [
        {
          id: 'prob1',
          problem: `Practice identifying and explaining the basic components of ${title} in simple terms.`,
          solution: 'Break down the topic into its simplest parts, define each component clearly, and explain how they work together.',
          steps: ['Identify the main components', 'Define each part in simple language', 'Explain how parts connect', 'Give a practical example'],
          skillTested: 'Basic comprehension and ability to break down complex ideas',
          variants: ['Different examples from the same topic', 'Varying levels of detail', 'Different explanation styles']
        },
        {
          id: 'prob2',
          problem: `Create a simple explanation of ${title} that you could give to a friend who knows nothing about it.`,
          solution: 'Use everyday language, start with familiar concepts, build up gradually, and include relatable examples.',
          steps: ['Start with what they already know', 'Introduce new concepts gradually', 'Use simple analogies', 'Check for understanding'],
          skillTested: 'Communication skills and deep understanding of basics',
          variants: ['Different audiences', 'Various explanation formats', 'Different levels of detail']
        },
        {
          id: 'prob3',
          problem: `Apply the basic principles of ${title} to solve a simple, real-world scenario.`,
          solution: 'Identify the relevant principles, understand the scenario, apply step-by-step reasoning, and verify the solution makes sense.',
          steps: ['Understand the problem clearly', 'Identify which principles apply', 'Apply principles step by step', 'Check if the solution is reasonable'],
          skillTested: 'Practical application of fundamental knowledge',
          variants: ['Different real-world contexts', 'Various problem complexities', 'Multiple solution approaches']
        }
      ],
      mnemonics: [
        {
          id: 'mnem1',
          concept: `Basic structure of ${title}`,
          mnemonic: `Remember the foundation: "Start Simple, Build Smart" - always begin with basics before advancing`,
          explanation: 'This reminds you to always master the fundamentals before moving to complex concepts.',
          type: 'Phrase'
        },
        {
          id: 'mnem2',
          concept: 'Learning sequence for beginners',
          mnemonic: 'BASIC: Begin, Absorb, Study, Implement, Check',
          explanation: 'Begin with definitions, Absorb the concepts, Study examples, Implement practice, Check understanding.',
          type: 'Acronym'
        },
        {
          id: 'mnem3',
          concept: 'Key elements to remember',
          mnemonic: `Think "What, Why, How, When" - the four questions every beginner should ask about ${title}`,
          explanation: 'What is it? Why does it matter? How does it work? When do you use it?',
          type: 'Phrase'
        },
        {
          id: 'mnem4',
          concept: 'Avoiding beginner mistakes',
          mnemonic: 'SLOW: Start Light, Organize Well - don\'t rush, build knowledge systematically',
          explanation: 'Reminds beginners to take their time and organize learning step by step.',
          type: 'Acronym'
        }
      ],
      quickReview: {
        mustKnow: [
          `Basic definition of ${title} in simple terms`,
          'Why this topic is important and useful',
          'Essential vocabulary and key terms',
          'Fundamental principles that govern how it works',
          'Common real-world applications and examples',
          'Typical beginner mistakes to avoid'
        ],
        formulasToMemorize: subject === 'Mathematics' || subject === 'Physics' || subject === 'Chemistry' ? 
          ['Basic formula 1 (with explanation of what each part means)', 'Basic formula 2 (with when to use it)', 'Basic formula 3 (with simple example)'] : [],
        keyTerms: [
          { term: title, definition: description || 'The main topic we are learning about from scratch' },
          { term: 'Fundamentals', definition: 'The basic, essential concepts that everything else builds upon' },
          { term: 'Principles', definition: 'The basic rules that explain how and why things work' },
          { term: 'Application', definition: 'How you use the knowledge in real situations' }
        ],
        commonFormulas: subject === 'Mathematics' || subject === 'Physics' || subject === 'Chemistry' ? [
          { name: 'Basic calculation', formula: 'Simple Formula = Input + Process', whenToUse: 'When beginners need to apply basic principles' },
          { name: 'Problem solving', formula: 'Solution = Understanding + Method + Practice', whenToUse: 'For systematic problem-solving approach' }
        ] : [],
        lastMinuteTips: [
          'Review basic definitions first - they are the foundation',
          'Make sure you can explain the topic in your own simple words',
          'Practice with one basic example to test understanding',
          'Don\'t panic if you forget details - focus on main concepts',
          'Remember: everyone was a beginner once, take your time'
        ]
      },
      studyTips: [
        'Start with the absolute basics - don\'t skip foundational concepts',
        'Learn key vocabulary first - it\'s like learning the alphabet before reading',
        'Use simple analogies to connect new ideas to things you already know',
        'Practice explaining concepts in your own words to test understanding',
        'Work through basic examples step-by-step before attempting complex problems',
        'Don\'t be afraid to ask questions - confusion is normal when learning something new',
        'Take breaks and review previous concepts before adding new ones',
        'Find real-world examples that make abstract concepts concrete and relatable'
      ],
      timeToMaster: 'For complete beginners: 4-6 hours for solid understanding of basics, 10-15 hours for confident application'
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

  /**
   * Validates and fixes the AI-generated notes structure
   */
  private validateAndFixNotes(notes: any, title: string, description: string, subject?: string): ExamReadyNotes {
    try {
      // Ensure all required fields exist with proper defaults
      const validatedNotes: ExamReadyNotes = {
        summary: notes.summary || `Comprehensive study guide for ${title} covering essential concepts and exam preparation.`,
        keyPoints: Array.isArray(notes.keyPoints) ? notes.keyPoints.map((point: any, index: number) => ({
          id: point.id || `kp${index + 1}`,
          title: point.title || `Key Point ${index + 1}`,
          description: point.description || 'Important concept to understand.',
          importance: (['Critical', 'Important', 'Useful'].includes(point.importance)) ? point.importance : 'Important',
          examWeight: (typeof point.examWeight === 'number' && point.examWeight >= 1 && point.examWeight <= 10) ? point.examWeight : 7,
          memorization: (['Definition', 'Concept', 'Formula', 'Application'].includes(point.memorization)) ? point.memorization : 'Concept'
        })) : [],
        
        concepts: Array.isArray(notes.concepts) ? notes.concepts.map((concept: any, index: number) => ({
          id: concept.id || `c${index + 1}`,
          concept: concept.concept || `Concept ${index + 1}`,
          simpleExplanation: concept.simpleExplanation || 'Basic explanation of the concept.',
          detailedExplanation: concept.detailedExplanation || 'Detailed explanation for comprehensive understanding.',
          realWorldExample: concept.realWorldExample || 'Practical application example.',
          commonMistakes: Array.isArray(concept.commonMistakes) ? concept.commonMistakes : ['Misunderstanding the basic principles'],
          relatedConcepts: Array.isArray(concept.relatedConcepts) ? concept.relatedConcepts : []
        })) : [],
        
        examQuestions: Array.isArray(notes.examQuestions) ? notes.examQuestions.map((q: any, index: number) => ({
          id: q.id || `eq${index + 1}`,
          question: q.question || `Sample question about ${title}`,
          type: (['MCQ', 'Short Answer', 'Long Answer', 'Problem Solving', 'True/False'].includes(q.type)) ? q.type : 'Short Answer',
          difficulty: (['Easy', 'Medium', 'Hard'].includes(q.difficulty)) ? q.difficulty : 'Medium',
          answer: q.answer || 'Complete answer explanation.',
          explanation: q.explanation || 'Explanation of the correct answer.',
          examTips: q.examTips || 'Strategy for answering similar questions.',
          timeToSolve: q.timeToSolve || '3-5 minutes'
        })) : [],
        
        practiceProblems: Array.isArray(notes.practiceProblems) ? notes.practiceProblems.map((p: any, index: number) => ({
          id: p.id || `pp${index + 1}`,
          problem: p.problem || `Practice problem for ${title}`,
          solution: p.solution || 'Step-by-step solution.',
          steps: Array.isArray(p.steps) ? p.steps : ['Identify the problem', 'Apply concepts', 'Solve systematically'],
          skillTested: p.skillTested || 'Application of key concepts',
          variants: Array.isArray(p.variants) ? p.variants : ['Similar problem variations']
        })) : [],
        
        mnemonics: Array.isArray(notes.mnemonics) ? notes.mnemonics.map((m: any, index: number) => ({
          id: m.id || `m${index + 1}`,
          concept: m.concept || `Key concept ${index + 1}`,
          mnemonic: m.mnemonic || 'Memory aid device',
          explanation: m.explanation || 'How to use this memory aid.',
          type: (['Acronym', 'Phrase', 'Visual', 'Story'].includes(m.type)) ? m.type : 'Phrase'
        })) : [],
        
        quickReview: {
          mustKnow: Array.isArray(notes.quickReview?.mustKnow) ? notes.quickReview.mustKnow : [`Understanding of ${title}`, 'Key principles', 'Practical applications'],
          formulasToMemorize: Array.isArray(notes.quickReview?.formulasToMemorize) ? notes.quickReview.formulasToMemorize : [],
          keyTerms: Array.isArray(notes.quickReview?.keyTerms) ? notes.quickReview.keyTerms.map((term: any) => ({
            term: term.term || 'Key Term',
            definition: term.definition || 'Important definition'
          })) : [{ term: title, definition: description }],
          commonFormulas: Array.isArray(notes.quickReview?.commonFormulas) ? notes.quickReview.commonFormulas.map((formula: any) => ({
            name: formula.name || 'Formula',
            formula: formula.formula || 'Mathematical expression',
            whenToUse: formula.whenToUse || 'When to apply this formula'
          })) : [],
          lastMinuteTips: Array.isArray(notes.quickReview?.lastMinuteTips) ? notes.quickReview.lastMinuteTips : ['Review key concepts', 'Practice examples', 'Understand applications']
        },
        
        studyTips: Array.isArray(notes.studyTips) ? notes.studyTips : [
          'Create visual diagrams and mind maps',
          'Practice with real examples',
          'Use spaced repetition for memorization',
          'Teach concepts to someone else'
        ],
        
        timeToMaster: notes.timeToMaster || '2-4 hours of focused study'
      };
      
      // Ensure we have minimum content for a useful study guide
      if (validatedNotes.keyPoints.length === 0) {
        validatedNotes.keyPoints = this.generateDefaultKeyPoints(title, description);
      }      
      if (validatedNotes.concepts.length === 0) {
        validatedNotes.concepts = this.generateDefaultConcepts(title, description);
      }
      
      if (validatedNotes.mnemonics.length === 0) {
        validatedNotes.mnemonics = this.generateDefaultMnemonics(title, description);
      }
      
      console.log('Notes validated successfully:', {
        keyPoints: validatedNotes.keyPoints.length,
        concepts: validatedNotes.concepts.length,
        examQuestions: validatedNotes.examQuestions.length,
        practiceProblems: validatedNotes.practiceProblems.length,
        mnemonics: validatedNotes.mnemonics.length
      });
      
      return validatedNotes;
      
    } catch (error) {
      console.error('Error validating notes:', error);
      return this.generateFallbackNotes(title, description, subject);
    }
  }  /**
   * Generate default key points when AI doesn't provide them
   */
  private generateDefaultKeyPoints(title: string, _description: string): KeyPoint[] {
    return [
      {
        id: 'kp1',
        title: `What is ${title}? (Complete Beginner Introduction)`,
        description: 'Starting from absolute zero - understanding what this topic is, why it exists, and why beginners need to learn it.',
        importance: 'Critical',
        examWeight: 10,
        memorization: 'Definition'
      },
      {
        id: 'kp2',
        title: 'Essential Vocabulary for Beginners',
        description: 'Key terms and words that complete beginners must know to understand any discussion about this topic.',
        importance: 'Critical',
        examWeight: 9,
        memorization: 'Definition'
      },
      {
        id: 'kp3',
        title: 'Basic Principles Explained Simply',
        description: 'The fundamental rules that govern this topic, broken down into simple concepts anyone can understand.',
        importance: 'Critical',
        examWeight: 9,
        memorization: 'Concept'
      },
      {
        id: 'kp4',
        title: 'Real-World Examples for Zero-Knowledge Learners',
        description: 'Concrete, everyday examples that help complete beginners see how this topic applies in familiar situations.',
        importance: 'Important',
        examWeight: 8,
        memorization: 'Application'
      },
      {
        id: 'kp5',
        title: 'Step-by-Step Learning Path for Beginners',
        description: 'The logical sequence beginners should follow to build understanding from zero to competence.',
        importance: 'Important',
        examWeight: 7,
        memorization: 'Concept'
      }
    ];
  }

  /**
   * Generate default concepts when AI doesn't provide them
   */
  private generateDefaultConcepts(title: string, description: string): ConceptExplanation[] {
    return [
      {
        id: 'c1',
        concept: `${title} for Complete Beginners`,
        simpleExplanation: `If you've never heard of ${title} before, think of it as a new skill or knowledge area that people learn to solve specific types of problems or understand how certain things work.`,
        detailedExplanation: description || `${title} is a topic that requires building knowledge step by step, starting with basic definitions and principles, then gradually adding more complex ideas. Like learning a new language, you start with simple words and basic grammar before attempting complex conversations.`,
        realWorldExample: 'Just like learning to cook starts with understanding what ingredients are and basic techniques before attempting complex recipes.',
        commonMistakes: ['Trying to skip the basics and jump to advanced topics', 'Not learning essential vocabulary first', 'Getting discouraged by initial complexity'],
        relatedConcepts: ['Basic Fundamentals', 'Learning Prerequisites', 'Foundation Skills']
      },
      {
        id: 'c2',
        concept: 'Building Blocks and Prerequisites',
        simpleExplanation: 'Every topic has foundational pieces that you need to understand first, like learning the alphabet before reading words.',
        detailedExplanation: 'Understanding the building blocks means identifying what basic knowledge and skills you need before diving deeper. This includes key vocabulary, fundamental principles, and basic relationships between different parts of the topic.',
        realWorldExample: 'Like needing to understand numbers and basic math before learning algebra, or knowing basic computer use before learning programming.',
        commonMistakes: ['Assuming you understand prerequisites without checking', 'Rushing through foundational concepts', 'Not connecting basics to bigger picture'],
        relatedConcepts: [title, 'Foundation Learning', 'Progressive Skill Building']
      },
      {
        id: 'c3',
        concept: 'From Zero to Understanding: The Learning Journey',
        simpleExplanation: 'There\'s a logical path from knowing nothing about a topic to being able to use that knowledge confidently.',
        detailedExplanation: 'The learning journey involves several stages: first understanding what the topic is about, then learning key vocabulary, grasping basic principles, seeing examples, practicing with simple problems, and gradually building to more complex applications.',
        realWorldExample: 'Like learning to drive: first understanding what cars are for, learning parts of the car, basic rules, practicing in empty lots, then gradually driving in more complex situations.',
        commonMistakes: ['Skipping steps in the learning process', 'Not allowing enough time for each stage', 'Comparing your beginning to others\' expertise'],
        relatedConcepts: ['Progressive Learning', 'Skill Development', 'Knowledge Building']      }
    ];
  }
  /**
   * Generate default mnemonics when AI doesn't provide them
   */
  private generateDefaultMnemonics(title: string, _description: string): Mnemonic[] {
    return [
      {
        id: 'mnem1',
        concept: `Basic structure of ${title}`,
        mnemonic: `Remember the foundation: "Start Simple, Build Smart" - always begin with basics before advancing`,
        explanation: 'This reminds you to always master the fundamentals before moving to complex concepts.',
        type: 'Phrase'
      },
      {
        id: 'mnem2',
        concept: 'Learning sequence for beginners',
        mnemonic: 'BASIC: Begin, Absorb, Study, Implement, Check',
        explanation: 'Begin with definitions, Absorb the concepts, Study examples, Implement practice, Check understanding.',
        type: 'Acronym'
      },
      {
        id: 'mnem3',
        concept: 'Key elements to remember',
        mnemonic: `Think "What, Why, How, When" - the four questions every beginner should ask about ${title}`,
        explanation: 'What is it? Why does it matter? How does it work? When do you use it?',
        type: 'Phrase'
      },
      {
        id: 'mnem4',
        concept: 'Beginner study approach',
        mnemonic: 'LEARN: Look at examples, Explain to yourself, Apply practice, Review mistakes, Note patterns',
        explanation: 'A systematic approach for beginners to process new information effectively.',
        type: 'Acronym'
      },
      {
        id: 'mnem5',
        concept: 'Foundation before complexity',
        mnemonic: 'Like building a house: Foundation First, Walls Second, Roof Last',
        explanation: 'Always build understanding layer by layer, ensuring each level is solid before moving up.',
        type: 'Visual'
      }
    ];
  }
}

export const aiNotesService = new AINotesService();
