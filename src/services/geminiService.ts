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
        this.genAI = new GoogleGenerativeAI(apiKey);
      // Try gemini-1.5-pro first, fallback to gemini-1.5-flash
      const modelName = (import.meta as any).env?.GEMINI_MODEL || 'gemini-1.5-pro';
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

  async analyzeVideoContent(title: string, description: string, transcript?: string): Promise<{
    summary: string;
    keyTopics: string[];
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    category: string;
    notes: string;
    flashcards: Array<{ question: string; answer: string; }>;
    importantQuestions: string[];
  }> {
    const content = `
Title: ${title}
Description: ${description}
${transcript ? `Transcript: ${transcript.substring(0, 2000)}...` : ''}
`;

    const prompt = `
Analyze this educational video content and provide a comprehensive analysis in JSON format:

${content}

Please return a JSON object with the following structure:
{
  "summary": "A concise 2-3 sentence summary of the video content",
  "keyTopics": ["topic1", "topic2", "topic3"],
  "difficulty": "Beginner|Intermediate|Advanced",
  "category": "Programming|Mathematics|Science|Business|Design|Language|Other",
  "notes": "Detailed educational notes with key concepts, explanations, and examples. Include relevant diagrams in ASCII art if applicable.",
  "flashcards": [
    {
      "question": "Key concept question",
      "answer": "Clear, concise answer"
    }
  ],
  "importantQuestions": [
    "Important question 1 for understanding",
    "Important question 2 for understanding"
  ]
}

Make sure to provide 5-8 flashcards and 3-5 important questions that test understanding of the core concepts.
Return only valid JSON without any markdown formatting or additional text.
`;

    try {
      const response = await this.generateText(prompt);
      // Clean up the response to ensure it's valid JSON
      const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Error analyzing video content:', error);
      // Return fallback data
      return {
        summary: `Educational content about: ${title}`,
        keyTopics: [title.split(' ').slice(0, 3).join(' ')],
        difficulty: 'Beginner' as const,
        category: 'Other',
        notes: `# ${title}\n\n${description}\n\nKey learning points:\n- Main concepts covered in this video\n- Practical applications\n- Important takeaways`,
        flashcards: [
          {
            question: `What is the main topic of "${title}"?`,
            answer: description.substring(0, 100) + '...'
          }
        ],
        importantQuestions: [
          `Explain the key concepts covered in "${title}".`,
          `How can you apply what you learned from this video?`
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

    const content = moduleContent.map(video => 
      `Title: ${video.title}\nSummary: ${video.summary}\nKey Topics: ${video.keyTopics.join(', ')}`
    ).join('\n\n');

    const prompt = `
Based on this module content, create 5 multiple-choice quiz questions to test understanding:

${content}

Please return a JSON array with this structure:
[
  {
    "question": "Clear, specific question about the content",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Why this answer is correct and brief explanation"
  }
]

Guidelines:
- Questions should test understanding, not just memorization
- Include a mix of conceptual and application questions
- Make incorrect options plausible but clearly wrong
- Provide helpful explanations for learning

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

    return [
      {
        question: `What is the main focus of "${firstVideo.title}"?`,
        options: [
          firstVideo.summary.substring(0, 50) + '...',
          'Unrelated topic A',
          'Unrelated topic B',
          'Unrelated topic C'
        ],
        correctAnswer: 0,
        explanation: 'This directly relates to the video content and main learning objectives.'
      },
      {
        question: `Which of these topics is covered in this module?`,
        options: [
          'Unrelated topic',
          firstVideo.keyTopics[0] || 'Key concept',
          'Another unrelated topic',
          'Yet another unrelated topic'
        ],
        correctAnswer: 1,
        explanation: 'This topic is specifically mentioned in the video content.'
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