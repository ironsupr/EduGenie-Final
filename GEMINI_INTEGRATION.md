# Gemini YouTube Agent Integration

This integration connects your powerful YouTube Gemini AI agent with the EduGenie platform, enabling AI-powered course generation directly from YouTube playlists.

## Features

- **🤖 AI-Powered Course Generation**: Uses Google Gemini to analyze YouTube playlists and create comprehensive course structures
- **📚 Intelligent Module Organization**: Automatically groups videos into logical learning modules
- **🧠 Auto-Generated Content**: Creates quizzes, assignments, and learning objectives
- **🔄 Seamless Integration**: Works directly within the EduGenie YouTube import workflow
- **📊 Rich Metadata**: Extracts and analyzes video transcripts for better course structure

## How It Works

1. **Playlist Analysis**: The agent extracts video metadata, descriptions, and transcripts from YouTube playlists
2. **AI Processing**: Google Gemini analyzes the content and creates a structured learning path
3. **Course Generation**: Generates modules, lessons, quizzes, and assignments based on the content
4. **EduGenie Integration**: Converts the AI-generated structure to EduGenie's course format and saves to Firebase

## Setup

### Prerequisites

1. **Python 3.8+** installed on your system
2. **YouTube Data API v3 Key**
3. **Google AI (Gemini) API Key**

### Environment Variables

Add these to your `.env.local` file:

```bash
# YouTube Data API
YOUTUBE_API_KEY=your_youtube_api_key_here

# Google AI API (for Gemini)
GOOGLE_AI_API_KEY=your_gemini_api_key_here
```

### Python Dependencies

Install the required Python packages:

```bash
cd YT_AGENT
pip install google-generativeai google-api-python-client youtube-transcript-api python-dotenv
```

## Usage

### Via YouTube Importer UI

1. Go to `/youtube-import` in the EduGenie app
2. Look for the "🚀 AI-Powered Course Generation" section
3. Enable the "Enable AI Course Generation" checkbox
4. Select the maximum number of videos to process
5. Paste your YouTube playlist URL
6. Click "Generate AI Course"

### Via Admin Panel Test

1. Go to `/admin` in the EduGenie app
2. Click on "Test Gemini Agent"
3. Check agent status and test with a playlist URL

### Via Test Page

1. Go to `/gemini-test` for dedicated testing
2. Check agent availability
3. Test with different playlist URLs and settings

## Agent Output Structure

The Gemini agent generates comprehensive course data including:

```json
{
  "course": {
    "title": "Course Title",
    "description": "Detailed description",
    "category": "Programming",
    "level": "Beginner/Intermediate/Advanced",
    "price": 29.99,
    "duration": "8 weeks",
    "instructor": "Channel Name",
    "tags": ["python", "programming"],
    "prerequisites": ["Basic computer skills"],
    "learningObjectives": ["Objective 1", "Objective 2"],
    "estimatedHours": 40
  },
  "modules": [
    {
      "id": "module-1",
      "title": "Module Title",
      "description": "Module description",
      "lessons": [
        {
          "id": "lesson-1-1",
          "title": "Lesson Title",
          "type": "video|text|quiz|project",
          "content": {...},
          "resources": [...]
        }
      ]
    }
  ],
  "assignments": [...],
  "finalExam": {...}
}
```

## Integration Architecture

```
YouTube Playlist URL
        ↓
YT_AGENT/yt_agent.py (Python)
        ↓
geminiAgentService.ts (TypeScript)
        ↓
courseServiceNew.ts (Firebase)
        ↓
EduGenie Course Database
```

## Files Created/Modified

### New Files
- `src/services/geminiAgentService.ts` - Main integration service
- `src/pages/GeminiAgentTest.tsx` - Test page for the agent
- `YT_AGENT/` - Your existing Python agent directory

### Modified Files
- `src/pages/YouTubeImporter.tsx` - Added AI-powered import option
- `src/pages/AdminPanel.tsx` - Added Gemini agent test link
- `src/App.tsx` - Added new route for test page

## Troubleshooting

### Agent Not Available
- Ensure Python is installed and accessible via `python` command
- Check that all required Python packages are installed
- Verify API keys are set in environment variables
- Make sure the `YT_AGENT/yt_agent.py` file exists

### Import Failures
- Check Python agent logs in the console
- Verify YouTube playlist is public and accessible
- Ensure API quotas are not exceeded
- Try with fewer videos initially

### Performance
- Large playlists (50+ videos) may take several minutes to process
- The agent processes videos sequentially to avoid API rate limits
- Consider using smaller batches for initial testing

## API Quotas

### YouTube Data API
- Default quota: 10,000 units per day
- Playlist processing uses ~100-200 units per playlist
- Video details use ~1 unit per video

### Google AI API
- Gemini API has generous free tier
- Monitor usage in Google AI Studio

## Example Playlists for Testing

- Programming: `https://www.youtube.com/playlist?list=PLWKjhJtqVAbnqBxcdjVGgT3uVR10bzTEB`
- Web Development: `https://www.youtube.com/playlist?list=PLWKjhJtqVAbmFP5CRK5yN9HcUdlf8oKZe`
- Short Educational: `https://www.youtube.com/playlist?list=PLWKjhJtqVAbleDe3_ZA8h3AO2rXar-q2V`

## Benefits Over Standard Import

| Feature | Standard Import | Gemini AI Import |
|---------|----------------|------------------|
| Module Organization | Fixed grouping (8 videos/module) | Intelligent content-based grouping |
| Quizzes | None | Auto-generated per module |
| Assignments | None | Content-relevant assignments |
| Learning Objectives | Basic | Comprehensive and specific |
| Course Structure | Simple | Pedagogically sound |
| Content Analysis | Title/description only | Full transcript analysis |

## Future Enhancements

- **Multi-language Support**: Process playlists in different languages
- **Custom Prompts**: Allow users to customize the AI generation prompts
- **Batch Processing**: Process multiple playlists simultaneously
- **Advanced Analytics**: Provide insights on content quality and structure
- **Integration Testing**: Automated testing of the integration pipeline

## Support

For issues with the integration:
1. Check the console logs for Python agent errors
2. Verify all environment variables are set correctly
3. Test the agent independently using the Python script
4. Check Firebase console for course creation issues

## Contributing

To improve the integration:
1. Enhance the conversion logic in `geminiAgentService.ts`
2. Add more robust error handling
3. Improve the UI feedback and progress indicators
4. Add support for additional content types
