import Anthropic from '@anthropic-ai/sdk';
import { ContentPost, AIAnalysis, ContentStructureAnalysis, TrendAnalysis } from '../types';
import { ContentService } from './contentService';

export class AIAnalysisService {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async analyzePost(post: ContentPost): Promise<AIAnalysis> {
    const analysis = await this.generateAnalysis(post);
    
    // Save analysis to database
    await ContentService.updatePostAnalysis(post.id, analysis);
    
    return analysis;
  }

  async analyzeBatchPosts(posts: ContentPost[]): Promise<AIAnalysis[]> {
    const analyses: AIAnalysis[] = [];
    
    for (const post of posts) {
      try {
        const analysis = await this.analyzePost(post);
        analyses.push(analysis);
      } catch (error) {
        console.error(`Failed to analyze post ${post.id}:`, error);
      }
    }
    
    return analyses;
  }

  async compareTopAndBottomPerformers(
    topPosts: ContentPost[], 
    bottomPosts: ContentPost[]
  ): Promise<{
    successFactors: string[];
    failureFactors: string[];
    recommendations: string[];
  }> {
    const prompt = this.buildComparisonPrompt(topPosts, bottomPosts);
    
    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    });

    return this.parseComparisonResponse(response.content[0].text || '');
  }

  async generateContentRecommendations(
    posts: ContentPost[], 
    targetPlatform: string
  ): Promise<{
    contentStructure: string[];
    topics: string[];
    timing: string[];
    format: string[];
  }> {
    const prompt = this.buildRecommendationPrompt(posts, targetPlatform);
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
    });

    return this.parseRecommendationResponse(response.content[0].text || '');
  }

  private async generateAnalysis(post: ContentPost): Promise<Omit<AIAnalysis, 'id' | 'postId'>> {
    const prompt = this.buildAnalysisPrompt(post);
    
    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    });

    const analysisText = response.content[0].text || '';
    return this.parseAnalysisResponse(analysisText, post);
  }

  private buildAnalysisPrompt(post: ContentPost): string {
    const metricsInfo = this.formatMetrics(post);
    
    return `
Analyze this ${post.platform.type} post for content performance:

CONTENT:
Title: ${post.title}
Content: ${post.content}
Published: ${post.publishedAt.toISOString()}
Media URLs: ${post.mediaUrls.length} items

PERFORMANCE METRICS:
${metricsInfo}

${post.script ? `ORIGINAL SCRIPT:
Title: ${post.script.title}
Content: ${post.script.content}
` : ''}

Please provide a comprehensive analysis in this JSON format:
{
  "performanceScore": number (0-100),
  "strengths": [list of what worked well],
  "weaknesses": [list of what could be improved],
  "recommendations": [actionable suggestions],
  "contentStructure": {
    "hookEffectiveness": number (0-100),
    "storytellingStructure": "description of structure used",
    "callToActionPresence": boolean,
    "emotionalTone": [list of emotional tones],
    "keyTopics": [main topics covered],
    "readabilityScore": number (0-100),
    "visualContentRatio": number (0-100)
  },
  "trends": {
    "topPerformingElements": [elements that drove engagement],
    "emergingPatterns": [patterns noticed],
    "seasonalTrends": [any seasonal relevance],
    "audiencePreferences": [what audience responded to]
  }
}

Consider platform-specific best practices for ${post.platform.type}.
`;
  }

  private buildComparisonPrompt(topPosts: ContentPost[], bottomPosts: ContentPost[]): string {
    const topSummary = topPosts.map(p => `${p.title}: ${this.formatMetrics(p)}`).join('\n');
    const bottomSummary = bottomPosts.map(p => `${p.title}: ${this.formatMetrics(p)}`).join('\n');
    
    return `
Compare high-performing vs low-performing content:

TOP PERFORMERS:
${topSummary}

BOTTOM PERFORMERS:
${bottomSummary}

Analyze the differences and provide insights in JSON format:
{
  "successFactors": [what made top posts successful],
  "failureFactors": [what held back bottom posts],
  "recommendations": [how to improve future content]
}
`;
  }

  private buildRecommendationPrompt(posts: ContentPost[], platform: string): string {
    const contentSummary = posts.slice(0, 10).map(p => 
      `${p.title} (Score: ${p.aiAnalysis?.performanceScore || 'N/A'})`
    ).join('\n');
    
    return `
Based on content performance analysis for ${platform}, generate recommendations:

RECENT CONTENT:
${contentSummary}

Provide recommendations in JSON format:
{
  "contentStructure": [recommended content structures],
  "topics": [trending/recommended topics],
  "timing": [best posting times/frequency],
  "format": [recommended content formats]
}
`;
  }

  private formatMetrics(post: ContentPost): string {
    const metrics = post.metrics;
    return `Likes: ${metrics.likes}, Comments: ${metrics.comments}, Shares: ${metrics.shares}, Engagement: ${metrics.engagementRate.toFixed(2)}%`;
  }

  private parseAnalysisResponse(response: string, post: ContentPost): Omit<AIAnalysis, 'id' | 'postId'> {
    try {
      const parsed = JSON.parse(response);
      
      return {
        performanceScore: parsed.performanceScore || 0,
        strengths: parsed.strengths || [],
        weaknesses: parsed.weaknesses || [],
        recommendations: parsed.recommendations || [],
        contentStructureAnalysis: {
          hookEffectiveness: parsed.contentStructure?.hookEffectiveness || 0,
          storytellingStructure: parsed.contentStructure?.storytellingStructure || '',
          callToActionPresence: parsed.contentStructure?.callToActionPresence || false,
          emotionalTone: parsed.contentStructure?.emotionalTone || [],
          keyTopics: parsed.contentStructure?.keyTopics || [],
          readabilityScore: parsed.contentStructure?.readabilityScore || 0,
          visualContentRatio: parsed.contentStructure?.visualContentRatio || 0,
        },
        trendAnalysis: {
          topPerformingElements: parsed.trends?.topPerformingElements || [],
          emergingPatterns: parsed.trends?.emergingPatterns || [],
          seasonalTrends: parsed.trends?.seasonalTrends || [],
          audiencePreferences: parsed.trends?.audiencePreferences || [],
        },
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error('Failed to parse AI analysis response:', error);
      
      // Fallback analysis
      return {
        performanceScore: post.metrics.engagementRate * 10, // Simple fallback
        strengths: ['Content published successfully'],
        weaknesses: ['Analysis parsing failed'],
        recommendations: ['Review content structure'],
        contentStructureAnalysis: {
          hookEffectiveness: 50,
          storytellingStructure: 'Unknown structure',
          callToActionPresence: false,
          emotionalTone: ['neutral'],
          keyTopics: ['general'],
          readabilityScore: 50,
          visualContentRatio: post.mediaUrls.length > 0 ? 100 : 0,
        },
        trendAnalysis: {
          topPerformingElements: [],
          emergingPatterns: [],
          seasonalTrends: [],
          audiencePreferences: [],
        },
        generatedAt: new Date(),
      };
    }
  }

  private parseComparisonResponse(response: string): {
    successFactors: string[];
    failureFactors: string[];
    recommendations: string[];
  } {
    try {
      return JSON.parse(response);
    } catch {
      return {
        successFactors: [],
        failureFactors: [],
        recommendations: ['Review content analysis'],
      };
    }
  }

  private parseRecommendationResponse(response: string): {
    contentStructure: string[];
    topics: string[];
    timing: string[];
    format: string[];
  } {
    try {
      return JSON.parse(response);
    } catch {
      return {
        contentStructure: [],
        topics: [],
        timing: [],
        format: [],
      };
    }
  }
}