import { geminiService } from './geminiService';

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  publishedAt: string;
  url: string;
}

interface VideoAnalysis {
  summary: string;
  keyTopics: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  notes: string;
  flashcards: Array<{ question: string; answer: string; }>;
  importantQuestions: string[];
}

interface CourseModule {
  id: string;
  name: string;
  description: string;
  videos: Array<YouTubeVideo & VideoAnalysis>;
  quiz: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>;
  order: number;
}

interface ProcessedCourse {
  id: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  level: string;
  duration: string;
  thumbnail: string;
  modules: CourseModule[];
  totalVideos: number;
  createdAt: string;
  source: 'youtube';
  playlistId: string;
}

class YouTubeAIService {
  private apiKey: string | null = null;
  constructor() {
    this.apiKey = (import.meta as any).env?.VITE_YOUTUBE_API_KEY || null;
  }

  async extractPlaylistId(url: string): Promise<string> {
    const patterns = [
      /[?&]list=([^&]+)/,
      /playlist\?list=([^&]+)/,
      /\/playlist\/([^?&]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    throw new Error('Invalid YouTube playlist URL');
  }

  async fetchPlaylistVideos(playlistId: string, maxResults: number = 20): Promise<YouTubeVideo[]> {
    if (!this.apiKey) {
      // Return mock data for development
      return this.getMockPlaylistVideos(maxResults);
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=${maxResults}&key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.items.map((item: any, index: number) => ({
        id: item.contentDetails.videoId,
        title: item.snippet.title,
        description: item.snippet.description || '',
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || '',
        duration: 'Unknown', // We'd need another API call for duration
        publishedAt: item.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${item.contentDetails.videoId}`,
      }));
    } catch (error) {
      console.error('Error fetching playlist videos:', error);
      return this.getMockPlaylistVideos(maxResults);
    }
  }

  private getMockPlaylistVideos(count: number): YouTubeVideo[] {
    const mockVideos = [
      {
        id: 'mock-1',
        title: 'Introduction to React - Getting Started with Components',
        description: 'Learn the fundamentals of React components and how to build your first React application. We cover JSX, props, and basic component structure.',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=480&h=360&fit=crop',
        duration: '15:30',
        publishedAt: '2024-01-15T10:00:00Z',
        url: 'https://www.youtube.com/watch?v=mock-1'
      },
      {
        id: 'mock-2',
        title: 'React State Management - useState and useEffect Hooks',
        description: 'Deep dive into React hooks including useState for state management and useEffect for side effects. Learn how to manage component lifecycle.',
        thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=480&h=360&fit=crop',
        duration: '22:45',
        publishedAt: '2024-01-17T10:00:00Z',
        url: 'https://www.youtube.com/watch?v=mock-2'
      },
      {
        id: 'mock-3',
        title: 'Building Forms in React - Controlled Components',
        description: 'Master form handling in React using controlled components. Learn about form validation, submission handling, and best practices.',
        thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=480&h=360&fit=crop',
        duration: '18:20',
        publishedAt: '2024-01-20T10:00:00Z',
        url: 'https://www.youtube.com/watch?v=mock-3'
      },
      {
        id: 'mock-4',
        title: 'React Router - Navigation and Routing',
        description: 'Implement client-side routing in React applications using React Router. Learn about routes, navigation, and URL parameters.',
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=480&h=360&fit=crop',
        duration: '25:10',
        publishedAt: '2024-01-22T10:00:00Z',
        url: 'https://www.youtube.com/watch?v=mock-4'
      },
      {
        id: 'mock-5',
        title: 'Context API and Global State Management',
        description: 'Learn how to manage global state in React using Context API. Understand when to use context vs local state.',
        thumbnail: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=480&h=360&fit=crop',
        duration: '20:35',
        publishedAt: '2024-01-25T10:00:00Z',
        url: 'https://www.youtube.com/watch?v=mock-5'
      },
      {
        id: 'mock-6',
        title: 'React Performance Optimization Techniques',
        description: 'Optimize your React applications with memo, useMemo, useCallback, and other performance techniques. Learn to avoid common pitfalls.',
        thumbnail: 'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?w=480&h=360&fit=crop',
        duration: '28:15',
        publishedAt: '2024-01-27T10:00:00Z',
        url: 'https://www.youtube.com/watch?v=mock-6'
      },
      {
        id: 'mock-7',
        title: 'Testing React Components with Jest and React Testing Library',
        description: 'Learn comprehensive testing strategies for React components. Write unit tests, integration tests, and ensure code quality.',
        thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=480&h=360&fit=crop',
        duration: '32:40',
        publishedAt: '2024-01-30T10:00:00Z',
        url: 'https://www.youtube.com/watch?v=mock-7'
      },
      {
        id: 'mock-8',
        title: 'Deploying React Applications to Production',
        description: 'Deploy your React applications using various platforms including Vercel, Netlify, and AWS. Learn about build optimization and CI/CD.',
        thumbnail: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=480&h=360&fit=crop',
        duration: '24:50',
        publishedAt: '2024-02-02T10:00:00Z',
        url: 'https://www.youtube.com/watch?v=mock-8'
      }
    ];

    return mockVideos.slice(0, count);
  }

  async processPlaylistWithAI(
    playlistUrl: string, 
    instructorName: string = 'AI Instructor',
    maxVideos: number = 20
  ): Promise<ProcessedCourse> {
    try {
      // Extract playlist ID
      const playlistId = await this.extractPlaylistId(playlistUrl);
      
      // Fetch videos
      const videos = await this.fetchPlaylistVideos(playlistId, maxVideos);
      
      if (videos.length === 0) {
        throw new Error('No videos found in playlist');
      }

      // Analyze each video with AI
      const analyzedVideos: Array<YouTubeVideo & VideoAnalysis> = [];
      
      for (const video of videos) {
        try {
          const analysis = await geminiService.analyzeVideoContent(
            video.title,
            video.description
          );
          
          analyzedVideos.push({
            ...video,
            ...analysis
          });
        } catch (error) {
          console.warn(`Failed to analyze video ${video.id}:`, error);
          // Add fallback analysis
          analyzedVideos.push({
            ...video,
            summary: `Educational content about: ${video.title}`,
            keyTopics: [video.title.split(' ').slice(0, 3).join(' ')],
            difficulty: 'Beginner' as const,
            category: 'Other',
            notes: `# ${video.title}\n\n${video.description}\n\nKey learning points from this video.`,
            flashcards: [{
              question: `What is the main topic of "${video.title}"?`,
              answer: video.description.substring(0, 100) + '...'
            }],
            importantQuestions: [`Explain the key concepts from "${video.title}".`]
          });
        }
      }

      // Group videos into modules using AI
      const videoSummaries = analyzedVideos.map(v => ({
        title: v.title,
        description: v.description
      }));
      
      const moduleGroups = await geminiService.groupRelatedVideos(videoSummaries);
      
      // Create modules with quizzes
      const modules: CourseModule[] = [];
      
      for (let i = 0; i < moduleGroups.length; i++) {
        const group = moduleGroups[i];
        const moduleVideos = group.videos.map(index => analyzedVideos[index]).filter(Boolean);
        
        if (moduleVideos.length === 0) continue;

        // Generate quiz for this module
        const quizQuestions = await geminiService.generateQuizQuestions(
          moduleVideos.map(v => ({
            title: v.title,
            summary: v.summary,
            keyTopics: v.keyTopics
          }))
        );

        modules.push({
          id: `module-${i + 1}`,
          name: group.moduleName,
          description: group.description,
          videos: moduleVideos,
          quiz: quizQuestions,
          order: i + 1
        });
      }

      // Determine overall course info
      const firstVideo = analyzedVideos[0];
      const mostCommonCategory = this.getMostCommonValue(analyzedVideos.map(v => v.category));
      const averageDifficulty = this.getAverageDifficulty(analyzedVideos.map(v => v.difficulty));
      const totalDuration = this.calculateTotalDuration(videos);

      return {
        id: `course-${Date.now()}`,
        title: this.generateCourseTitle(analyzedVideos),
        description: this.generateCourseDescription(analyzedVideos),
        instructor: instructorName,
        category: mostCommonCategory,
        level: averageDifficulty,
        duration: totalDuration,
        thumbnail: firstVideo.thumbnail,
        modules,
        totalVideos: videos.length,
        createdAt: new Date().toISOString(),
        source: 'youtube',
        playlistId
      };

    } catch (error) {
      console.error('Error processing playlist:', error);
      throw error;
    }
  }

  private generateCourseTitle(videos: Array<YouTubeVideo & VideoAnalysis>): string {
    const topics = videos.flatMap(v => v.keyTopics);
    const mostCommonTopic = this.getMostCommonValue(topics);
    return `Complete ${mostCommonTopic} Course`;
  }

  private generateCourseDescription(videos: Array<YouTubeVideo & VideoAnalysis>): string {
    const topics = [...new Set(videos.flatMap(v => v.keyTopics))].slice(0, 5);
    return `Master ${topics.join(', ')} and more with this comprehensive course featuring ${videos.length} lessons. Learn through hands-on examples, detailed explanations, and practical exercises.`;
  }

  private getMostCommonValue(values: string[]): string {
    const counts = values.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).reduce((a, b) => 
      counts[a[0]] > counts[b[0]] ? a : b
    )[0] || 'General';
  }

  private getAverageDifficulty(difficulties: string[]): string {
    const counts = difficulties.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    if (counts['Advanced'] > counts['Beginner'] && counts['Advanced'] > counts['Intermediate']) {
      return 'Advanced';
    } else if (counts['Intermediate'] > counts['Beginner']) {
      return 'Intermediate';
    }
    return 'Beginner';
  }

  private calculateTotalDuration(videos: YouTubeVideo[]): string {
    // Simple estimation - in real implementation, you'd sum actual durations
    const estimatedMinutes = videos.length * 15; // 15 min average per video
    const hours = Math.floor(estimatedMinutes / 60);
    const minutes = estimatedMinutes % 60;
    return `${hours}h ${minutes}m`;
  }

  isAvailable(): boolean {
    return geminiService.isAvailable();
  }
}

export const youtubeAIService = new YouTubeAIService();
export default youtubeAIService;
