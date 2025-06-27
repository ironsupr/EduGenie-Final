import { GoogleGenerativeAI } from '@google/generative-ai';

// Browser-compatible Gemini service
class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    this.initializeGemini();
  }
  private initializeGemini() {
    try {
      const apiKey = (import.meta as any).env?.VITE_GOOGLE_AI_API_KEY;
      console.log('Initializing Gemini service...');
      console.log('API Key available:', apiKey ? 'Yes' : 'No');
      console.log('API Key length:', apiKey ? apiKey.length : 0);
      
      if (!apiKey) {
        console.warn('Google AI API key not found. Gemini features will be disabled.');
        return;
      }
        this.genAI = new GoogleGenerativeAI(apiKey);      // Try gemini-1.5-pro first, fallback to gemini-1.5-flash
      const modelName = (import.meta as any).env?.VITE_GEMINI_MODEL || (import.meta as any).env?.GEMINI_MODEL || 'gemini-1.5-pro';
      this.model = this.genAI.getGenerativeModel({ model: modelName });
      console.log('Gemini service initialized successfully with model:', modelName);
    } catch (error) {
      console.error('Failed to initialize Gemini:', error);
    }
  }
  async generateText(prompt: string): Promise<string> {
    console.log('generateText called with prompt length:', prompt.length);
    
    if (!this.model) {
      console.error('Gemini model not available - initialization failed');
      throw new Error('Gemini AI is not available. Please check your API key.');
    }

    try {
      console.log('Sending request to Gemini...');
      const result = await this.model.generateContent(prompt);
      console.log('Gemini response received');
      const response = await result.response;
      const text = response.text();
      console.log('Generated text length:', text.length);
      return text;    } catch (error) {
      console.error('Gemini generation error:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        // Check for quota exceeded error
        if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED')) {
          throw new Error('Daily API quota exceeded. Please try again tomorrow or upgrade to a paid plan.');
        }
      }
      throw new Error('Failed to generate content with Gemini AI: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }
  async analyzeVideoContent(title: string, description: string, _transcript?: string): Promise<{
    summary: string;
    keyTopics: string[];
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    category: string;
    notes: string;
    flashcards: Array<{ question: string; answer: string; }>;
    importantQuestions: string[];
  }> {
    const prompt = `
Generate comprehensive educational content about the TOPIC/SUBJECT, not just video content analysis.

TOPIC TO TEACH: ${title}
CONTEXT HINT: ${description}

FOCUS ON TOPIC EDUCATION:
- Generate content about the subject matter itself (e.g., if title is "Machine Learning Basics", teach about machine learning comprehensively)
- Create educational content as if you're a subject expert teaching this topic
- Don't limit to what might be in a video description or transcript
- Provide complete coverage of the topic for thorough understanding
- Include fundamental concepts, practical applications, and key insights
- Make flashcards and questions that test topic mastery, not video recall

Please return a JSON object with the following structure:
{
  "summary": "A concise 2-3 sentence summary explaining what students will learn about this TOPIC and why it's important",
  "keyTopics": ["fundamental aspect 1", "core concept 2", "practical application 3"],
  "difficulty": "Beginner|Intermediate|Advanced",
  "category": "Programming|Mathematics|Science|Business|Design|Language|Other",
  "notes": "Detailed educational notes covering the complete topic with key concepts, theoretical foundations, practical examples, and real-world applications. Focus on comprehensive topic education.",
  "flashcards": [
    {
      "question": "Topic-focused question testing understanding of core concepts",
      "answer": "Clear, educational answer that builds topic mastery"
    }
  ],
  "importantQuestions": [
    "Deep understanding question about topic fundamentals",
    "Application question testing practical topic knowledge"
  ]
}

CRITICAL REQUIREMENTS:
- TOPIC-FOCUSED: Generate content about the subject matter, not video analysis
- EDUCATIONAL DEPTH: Cover theoretical foundations and practical applications
- COMPREHENSIVE: Include all essential aspects students need to master the topic
- FLASHCARDS: Create 5-8 flashcards that test topic understanding and build knowledge
- QUESTIONS: Generate 3-5 important questions that assess topic mastery
- ACADEMIC QUALITY: Suitable for educational study and assessment

Make sure to provide 5-8 flashcards and 3-5 important questions that test comprehensive understanding of the TOPIC.
Return only valid JSON without any markdown formatting or additional text.
`;

    try {
      const response = await this.generateText(prompt);
      // Clean up the response to ensure it's valid JSON
      const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedResponse);    } catch (error) {
      console.error('Error analyzing video content:', error);
      // Return fallback data that focuses on the topic
      const topicWords = title.split(' ').slice(0, 3);
      const mainTopic = topicWords.join(' ');
      
      return {
        summary: `Learn about ${title} - a comprehensive guide covering fundamental concepts, practical applications, and key insights in this important topic.`,
        keyTopics: [
          `${mainTopic} fundamentals`,
          `${mainTopic} applications`,
          `${mainTopic} best practices`
        ],
        difficulty: 'Beginner' as const,
        category: 'Other',
        notes: `# ${title}\n\n## Overview\n${description}\n\n## Key Learning Points\n- Fundamental concepts and principles\n- Practical applications and use cases\n- Best practices and common approaches\n- Real-world examples and implementations\n\n## Important Concepts\n- Core principles underlying ${mainTopic}\n- Essential techniques and methods\n- Common patterns and solutions\n\n## Practical Applications\n- How ${mainTopic} is used in real scenarios\n- Benefits and advantages\n- Implementation considerations`,
        flashcards: [
          {
            question: `What are the fundamental concepts of ${title}?`,
            answer: `${title} involves understanding core principles, practical applications, and best practices in this field.`
          },
          {
            question: `Why is ${mainTopic} important to learn?`,
            answer: `${mainTopic} provides essential knowledge and skills that are valuable for practical applications and professional development.`
          },
          {
            question: `What are the key applications of ${mainTopic}?`,
            answer: `${mainTopic} can be applied in various real-world scenarios to solve problems and create solutions.`
          }
        ],
        importantQuestions: [
          `Explain the fundamental principles underlying ${title}.`,
          `How can ${mainTopic} be applied in practical scenarios?`,
          `What are the key benefits and advantages of understanding ${title}?`
        ]
      };
    }
  }

  async groupRelatedVideos(videos: Array<{ title: string; description: string; }>): Promise<Array<{
    moduleName: string;
    videos: number[];
    description: string;
  }>> {
    if (!this.model) {
      // Fallback grouping without AI
      return this.fallbackGrouping(videos);
    }

    const prompt = `
Analyze these video titles and descriptions and group them into logical learning modules.
Each module should contain related videos that build upon each other or cover similar topics.

Videos:
${videos.map((video, index) => `${index}: ${video.title} - ${video.description}`).join('\n')}

Please return a JSON array with this structure:
[
  {
    "moduleName": "Descriptive module name",
    "videos": [0, 1, 2],
    "description": "What this module covers and learning objectives"
  }
]

Guidelines:
- Group 2-4 related videos per module
- Create module names that clearly describe the learning focus
- Ensure modules follow a logical learning progression
- Provide clear descriptions of what each module teaches

Return only valid JSON without any markdown formatting.
`;

    try {
      const response = await this.generateText(prompt);
      const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Error grouping videos:', error);
      return this.fallbackGrouping(videos);
    }
  }

  private fallbackGrouping(videos: Array<{ title: string; description: string; }>): Array<{
    moduleName: string;
    videos: number[];
    description: string;
  }> {
    const modules = [];
    const videosPerModule = Math.max(2, Math.ceil(videos.length / 4));
    
    for (let i = 0; i < videos.length; i += videosPerModule) {
      const moduleVideos = Array.from({ length: Math.min(videosPerModule, videos.length - i) }, (_, j) => i + j);
      const moduleNumber = Math.floor(i / videosPerModule) + 1;
      
      modules.push({
        moduleName: `Module ${moduleNumber}: ${videos[i]?.title.split(' ').slice(0, 3).join(' ') || 'Learning Module'}`,
        videos: moduleVideos,
        description: `Learn about ${videos[i]?.title.split(' ').slice(0, 5).join(' ') || 'key concepts'} and related topics.`
      });
    }
    
    return modules;
  }
  async generateQuizQuestions(moduleContent: Array<{ title: string; summary: string; keyTopics: string[]; }>): Promise<Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>> {
    if (!this.model) {
      return this.fallbackQuizQuestions(moduleContent);
    }

    const prompt = `
Generate quiz questions that test comprehensive understanding of these TOPICS, not just video content recall.

TOPICS TO CREATE QUIZ FOR:
${moduleContent.map(video => 
  `- TOPIC: ${video.title}\n  Summary: ${video.summary}\n  Key Areas: ${video.keyTopics.join(', ')}`
).join('\n\n')}

FOCUS ON TOPIC MASTERY:
- Create questions that test understanding of the subject matter itself
- Test conceptual knowledge, practical applications, and theoretical foundations
- Questions should assess topic comprehension, not video recall
- Include questions about fundamentals, applications, and advanced concepts
- Make questions educational and suitable for academic assessment

Please return a JSON array with this structure:
[
  {
    "question": "Clear, specific question testing topic understanding and mastery",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Educational explanation that reinforces topic understanding"
  }
]

CRITICAL REQUIREMENTS:
- TOPIC-FOCUSED: Questions test subject matter understanding, not video content recall
- EDUCATIONAL VALUE: Questions should teach and reinforce key concepts
- COMPREHENSIVE: Cover fundamental concepts, applications, and advanced topics
- PRACTICAL: Include questions about real-world applications and use cases
- ACADEMIC QUALITY: Suitable for educational assessment and skill evaluation

Guidelines:
- Questions should test understanding and application, not just memorization
- Include a mix of conceptual, practical, and analytical questions
- Make incorrect options plausible but clearly wrong to experienced practitioners
- Provide educational explanations that reinforce learning and topic mastery
- Create 5 high-quality questions that comprehensively assess topic knowledge

Return only valid JSON without any markdown formatting.
`;

    try {
      const response = await this.generateText(prompt);
      const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Error generating quiz questions:', error);
      return this.fallbackQuizQuestions(moduleContent);
    }
  }
  private fallbackQuizQuestions(moduleContent: Array<{ title: string; summary: string; keyTopics: string[]; }>): Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }> {
    const firstVideo = moduleContent[0];
    if (!firstVideo) return [];

    const topicWords = firstVideo.title.split(' ').slice(0, 3).join(' ');
    const firstKeyTopic = firstVideo.keyTopics[0] || 'key concepts';

    return [
      {
        question: `What are the fundamental concepts of ${firstVideo.title}?`,
        options: [
          `Understanding core principles and practical applications of ${topicWords}`,
          'Basic video editing techniques',
          'Social media marketing strategies',
          'General computer skills'
        ],
        correctAnswer: 0,
        explanation: `This directly relates to the core educational content and fundamental understanding of ${firstVideo.title}.`
      },
      {
        question: `Which concept is most important when learning about ${topicWords}?`,
        options: [
          'Memorizing video content',
          firstKeyTopic,
          'Taking detailed notes',
          'Watching multiple times'
        ],
        correctAnswer: 1,
        explanation: `${firstKeyTopic} is a key concept that forms the foundation for understanding ${firstVideo.title}.`
      },
      {
        question: `How can you best apply knowledge of ${firstVideo.title} in practice?`,
        options: [
          'By watching more videos on the topic',
          'By taking extensive notes',
          `By understanding the principles and applying them to real-world scenarios involving ${topicWords}`,
          'By memorizing the content exactly'
        ],
        correctAnswer: 2,
        explanation: `Practical application involves understanding the underlying principles and using them to solve real problems related to ${firstVideo.title}.`
      }
    ];
  }

  isAvailable(): boolean {
    return this.model !== null;
  }
}

const geminiService = new GeminiService();
export { geminiService };
export default geminiService;