# Content Performance Dashboard

AI-powered social media content analysis dashboard that helps you understand what makes your content perform well across LinkedIn, YouTube, and Instagram.

## Features

🤖 **AI Content Analysis** - Claude-powered insights on content performance  
📊 **Multi-Platform Support** - LinkedIn, YouTube, Instagram with easy extensibility  
📈 **Trend Analysis** - Identify patterns in successful content  
🔌 **Plugin System** - Extensible analysis modules (sentiment, readability, hashtags)  
📝 **Content Ingestion** - Import scripts from Google Docs or file uploads  
🎯 **Performance Prediction** - Predict how content will perform before posting  
📱 **Responsive Dashboard** - Clean, modern UI with customizable metrics  

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite + Prisma
- **AI**: Claude 3.5 Sonnet via Anthropic API
- **Build**: Vite for fast development

## Quick Start

### Prerequisites

- Node.js 18+
- Claude API key from Anthropic

### Installation

1. **Clone and install**
   ```bash
   git clone <your-repo-url>
   cd cwc-data-dashboard
   npm install
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your API keys:
   ```bash
   ANTHROPIC_API_KEY=your_claude_api_key_here
   ```

3. **Set up database**
   ```bash
   npm run db:push
   npm run db:generate
   mkdir uploads
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open dashboard**
   ```
   http://localhost:3000
   ```

## Configuration

### Required API Keys

- **Anthropic API Key** - Get from [console.anthropic.com](https://console.anthropic.com)

### Optional API Keys (for live data)

- **LinkedIn** - Client ID/Secret from LinkedIn Developer Portal
- **YouTube** - API Key from Google Cloud Console  
- **Instagram** - Access Token from Meta for Developers
- **Google Drive** - For Google Docs integration

### Social Media Setup

<details>
<summary>LinkedIn API Setup</summary>

1. Go to [LinkedIn Developer Portal](https://developer.linkedin.com)
2. Create a new app
3. Add these permissions: `r_liteprofile`, `r_organization_social`, `rw_organization_admin`
4. Add redirect URI: `http://localhost:3001/auth/linkedin/callback`
5. Copy Client ID and Secret to `.env`

</details>

<details>
<summary>YouTube API Setup</summary>

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable YouTube Data API v3
3. Create API Key
4. Copy to `.env` as `YOUTUBE_API_KEY`

</details>

<details>
<summary>Instagram API Setup</summary>

1. Go to [Meta for Developers](https://developers.facebook.com)
2. Create Facebook App
3. Add Instagram Basic Display product
4. Generate User Access Token
5. Copy to `.env` as `INSTAGRAM_ACCESS_TOKEN`

</details>

## Usage

### Dashboard Overview

- **Metrics Grid** - Customizable performance metrics with add/remove functionality
- **Performance Chart** - Trend analysis across platforms over time
- **Platform Overview** - Post counts and average scores per platform
- **Top Posts** - Best performing content with AI scores

### Content Analysis

1. **Sync Posts** - Connect social media accounts to import existing content
2. **AI Analysis** - Automatic content structure and performance analysis
3. **Script Linking** - Connect posts to original scripts from Google Docs
4. **Trend Insights** - Identify what makes content successful

### Plugin System

Built-in plugins:
- **Sentiment Analyzer** - Emotional tone analysis
- **Readability Checker** - Content complexity scoring
- **Hashtag Optimizer** - Hashtag suggestions and analysis

Create custom plugins:
```typescript
const customPlugin = {
  name: 'Brand Voice Checker',
  analyze: async (post) => {
    // Your analysis logic here
    return { score: 85, insights: ['Brand voice analysis'] };
  }
};
```

## API Endpoints

### Content Management
- `GET /api/posts` - List all posts
- `POST /api/posts` - Create new post
- `GET /api/posts/:id` - Get specific post
- `PUT /api/posts/:id/analyze` - Run AI analysis

### Analytics
- `GET /api/analytics/trends` - Content trend analysis
- `GET /api/analytics/predictions` - Performance predictions
- `GET /api/metrics/overview` - Dashboard metrics

### Platform Integration
- `POST /api/platforms/sync/:platform` - Sync platform posts
- `GET /api/platforms/:platform/validate` - Validate credentials

## Database Schema

The app uses SQLite with Prisma for type-safe database access:

- **ContentPost** - Social media posts with metrics and AI analysis
- **Platform** - Platform configurations and credentials
- **AnalysisPlugin** - Extensible analysis modules

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:push      # Push database schema
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
```

### Project Structure

```
src/
├── client/          # React frontend
│   ├── pages/       # Dashboard pages
│   └── App.tsx      # Main app component
├── components/      # Reusable UI components
│   ├── ui/          # Basic UI components
│   ├── charts/      # Data visualization
│   └── layout/      # Layout components
├── server/          # Express backend
│   ├── db.ts        # Database connection
│   └── index.js     # Server entry point
├── services/        # Business logic
│   ├── aiAnalysisService.ts
│   ├── socialMediaService.ts
│   ├── trendAnalysisService.ts
│   └── pluginSystem.ts
└── types/           # TypeScript definitions
```

## Extending the Platform

### Adding New Social Media Platforms

1. **Update types** in `src/types/index.ts`:
   ```typescript
   export type PlatformType = 'linkedin' | 'youtube' | 'instagram' | 'tiktok';
   ```

2. **Create platform service** in `src/services/socialMedia/`:
   ```typescript
   export class TikTokService {
     async getUserPosts(): Promise<any[]> { /* ... */ }
     async getPostMetrics(postId: string): Promise<TikTokMetrics> { /* ... */ }
   }
   ```

3. **Add to main service** in `socialMediaService.ts`

### Creating Custom Analysis Plugins

```typescript
import { AnalysisPlugin } from './types';

const seoPlugin: AnalysisPlugin = {
  name: 'SEO Analyzer',
  description: 'Analyzes content for SEO best practices',
  version: '1.0.0',
  analyze: async (post) => {
    const keywordDensity = analyzeKeywords(post.content);
    const score = calculateSEOScore(keywordDensity);
    
    return {
      score,
      insights: [`Keyword density: ${keywordDensity}%`],
      data: { keywordDensity }
    };
  }
};

// Register the plugin
await PluginSystem.registerPlugin(seoPlugin);
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

- 📧 [Create an issue](https://github.com/your-username/cwc-data-dashboard/issues)
- 📖 [Documentation](https://github.com/your-username/cwc-data-dashboard/wiki)

---

Built with ❤️ for content creators who want to understand what makes their content successful.