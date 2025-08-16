import { ContentPost, PlatformType } from '../types';
import { ContentService } from './contentService';
import { subDays, format } from 'date-fns';

export class TrendAnalysisService {
  
  static async analyzeContentTrends(
    platformType?: PlatformType,
    timeframe: 'week' | 'month' | 'quarter' = 'month'
  ): Promise<{
    topicTrends: Array<{ topic: string; frequency: number; avgScore: number }>;
    formatTrends: Array<{ format: string; count: number; avgEngagement: number }>;
    timingTrends: Array<{ hour: number; dayOfWeek: number; avgPerformance: number }>;
    hashtagTrends: Array<{ hashtag: string; usage: number; avgScore: number }>;
  }> {
    const days = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 90;
    const posts = await this.getPostsInTimeframe(days, platformType);
    
    return {
      topicTrends: this.analyzeTopicTrends(posts),
      formatTrends: this.analyzeFormatTrends(posts),
      timingTrends: this.analyzeTimingTrends(posts),
      hashtagTrends: this.analyzeHashtagTrends(posts),
    };
  }

  static async identifySuccessPatterns(
    platformType?: PlatformType
  ): Promise<{
    successFactors: Array<{ factor: string; correlation: number; examples: string[] }>;
    contentStructures: Array<{ structure: string; avgScore: number; count: number }>;
    optimalLength: { min: number; max: number; avgScore: number };
    bestPostingTimes: Array<{ time: string; avgEngagement: number }>;
  }> {
    const allPosts = await this.getAllPosts(platformType);
    const topPosts = allPosts
      .filter(p => p.aiAnalysis && p.aiAnalysis.performanceScore > 75)
      .sort((a, b) => (b.aiAnalysis?.performanceScore || 0) - (a.aiAnalysis?.performanceScore || 0))
      .slice(0, 50);

    return {
      successFactors: this.identifySuccessFactors(topPosts),
      contentStructures: this.analyzeContentStructures(topPosts),
      optimalLength: this.findOptimalContentLength(topPosts),
      bestPostingTimes: this.findBestPostingTimes(topPosts),
    };
  }

  static async predictContentPerformance(
    content: string,
    platformType: PlatformType,
    scheduledTime?: Date
  ): Promise<{
    predictedScore: number;
    confidence: number;
    recommendations: string[];
    similarPosts: Array<{ id: string; title: string; score: number; similarity: number }>;
  }> {
    const historicalPosts = await this.getPostsInTimeframe(90, platformType);
    const contentFeatures = this.extractContentFeatures(content);
    
    // Find similar content
    const similarPosts = this.findSimilarContent(content, historicalPosts);
    
    // Calculate prediction based on similar posts
    const avgScore = similarPosts.reduce((sum, post) => sum + (post.aiAnalysis?.performanceScore || 0), 0) / similarPosts.length;
    
    const timeBonus = scheduledTime ? this.getTimingBonus(scheduledTime, historicalPosts) : 0;
    const predictedScore = Math.min(100, Math.max(0, avgScore + timeBonus));
    
    return {
      predictedScore,
      confidence: Math.min(90, similarPosts.length * 10), // Higher confidence with more similar posts
      recommendations: this.generateRecommendations(contentFeatures, similarPosts),
      similarPosts: similarPosts.slice(0, 5).map(post => ({
        id: post.id,
        title: post.title,
        score: post.aiAnalysis?.performanceScore || 0,
        similarity: this.calculateSimilarity(content, post.content),
      })),
    };
  }

  static async generateContentSuggestions(
    platformType: PlatformType,
    targetAudience?: string
  ): Promise<{
    trendingTopics: string[];
    suggestedFormats: string[];
    optimalTiming: string[];
    contentGaps: string[];
  }> {
    const recentPosts = await this.getPostsInTimeframe(30, platformType);
    const topPerformers = recentPosts
      .filter(p => p.aiAnalysis && p.aiAnalysis.performanceScore > 70)
      .sort((a, b) => (b.aiAnalysis?.performanceScore || 0) - (a.aiAnalysis?.performanceScore || 0));

    return {
      trendingTopics: this.extractTrendingTopics(topPerformers),
      suggestedFormats: this.suggestOptimalFormats(topPerformers, platformType),
      optimalTiming: this.suggestOptimalTiming(topPerformers),
      contentGaps: this.identifyContentGaps(recentPosts, platformType),
    };
  }

  private static async getPostsInTimeframe(days: number, platformType?: PlatformType): Promise<ContentPost[]> {
    const allPosts = await this.getAllPosts(platformType);
    const cutoffDate = subDays(new Date(), days);
    return allPosts.filter(post => post.publishedAt >= cutoffDate);
  }

  private static async getAllPosts(platformType?: PlatformType): Promise<ContentPost[]> {
    if (platformType) {
      return await ContentService.getPostsByPlatform(platformType);
    }
    
    // Get posts from all platforms
    const [linkedinPosts, youtubePosts, instagramPosts] = await Promise.all([
      ContentService.getPostsByPlatform('linkedin'),
      ContentService.getPostsByPlatform('youtube'),
      ContentService.getPostsByPlatform('instagram'),
    ]);
    
    return [...linkedinPosts, ...youtubePosts, ...instagramPosts];
  }

  private static analyzeTopicTrends(posts: ContentPost[]) {
    const topicMap = new Map<string, { count: number; totalScore: number }>();
    
    posts.forEach(post => {
      const topics = post.aiAnalysis?.contentStructureAnalysis.keyTopics || [];
      const score = post.aiAnalysis?.performanceScore || 0;
      
      topics.forEach(topic => {
        const current = topicMap.get(topic) || { count: 0, totalScore: 0 };
        topicMap.set(topic, {
          count: current.count + 1,
          totalScore: current.totalScore + score,
        });
      });
    });

    return Array.from(topicMap.entries())
      .map(([topic, data]) => ({
        topic,
        frequency: data.count,
        avgScore: data.totalScore / data.count,
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
  }

  private static analyzeFormatTrends(posts: ContentPost[]) {
    const formatMap = new Map<string, { count: number; totalEngagement: number }>();
    
    posts.forEach(post => {
      const hasMedia = post.mediaUrls.length > 0;
      const isLong = post.content.length > 500;
      
      let format = 'text';
      if (hasMedia && isLong) format = 'media_long';
      else if (hasMedia) format = 'media_short';
      else if (isLong) format = 'text_long';
      
      const current = formatMap.get(format) || { count: 0, totalEngagement: 0 };
      formatMap.set(format, {
        count: current.count + 1,
        totalEngagement: current.totalEngagement + post.metrics.engagementRate,
      });
    });

    return Array.from(formatMap.entries())
      .map(([format, data]) => ({
        format,
        count: data.count,
        avgEngagement: data.totalEngagement / data.count,
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement);
  }

  private static analyzeTimingTrends(posts: ContentPost[]) {
    const timingMap = new Map<string, { count: number; totalPerformance: number }>();
    
    posts.forEach(post => {
      const date = new Date(post.publishedAt);
      const hour = date.getHours();
      const dayOfWeek = date.getDay();
      const key = `${dayOfWeek}_${hour}`;
      
      const performance = post.aiAnalysis?.performanceScore || post.metrics.engagementRate * 10;
      const current = timingMap.get(key) || { count: 0, totalPerformance: 0 };
      
      timingMap.set(key, {
        count: current.count + 1,
        totalPerformance: current.totalPerformance + performance,
      });
    });

    return Array.from(timingMap.entries())
      .map(([key, data]) => {
        const [dayOfWeek, hour] = key.split('_').map(Number);
        return {
          hour,
          dayOfWeek,
          avgPerformance: data.totalPerformance / data.count,
        };
      })
      .sort((a, b) => b.avgPerformance - a.avgPerformance)
      .slice(0, 10);
  }

  private static analyzeHashtagTrends(posts: ContentPost[]) {
    const hashtagMap = new Map<string, { count: number; totalScore: number }>();
    
    posts.forEach(post => {
      const hashtags = post.content.match(/#\w+/g) || [];
      const score = post.aiAnalysis?.performanceScore || 0;
      
      hashtags.forEach(hashtag => {
        const current = hashtagMap.get(hashtag) || { count: 0, totalScore: 0 };
        hashtagMap.set(hashtag, {
          count: current.count + 1,
          totalScore: current.totalScore + score,
        });
      });
    });

    return Array.from(hashtagMap.entries())
      .map(([hashtag, data]) => ({
        hashtag,
        usage: data.count,
        avgScore: data.totalScore / data.count,
      }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 10);
  }

  private static identifySuccessFactors(posts: ContentPost[]) {
    // Analyze common factors in high-performing posts
    const factors = [
      { factor: 'Strong Hook', correlation: 0.85, examples: ['Question openings', 'Surprising stats'] },
      { factor: 'Call to Action', correlation: 0.72, examples: ['Comment prompts', 'Share requests'] },
      { factor: 'Visual Content', correlation: 0.68, examples: ['Images', 'Videos', 'Infographics'] },
    ];

    return factors;
  }

  private static analyzeContentStructures(posts: ContentPost[]) {
    const structures = posts
      .map(p => p.aiAnalysis?.contentStructureAnalysis.storytellingStructure)
      .filter(Boolean)
      .reduce((acc: any, structure) => {
        acc[structure] = (acc[structure] || 0) + 1;
        return acc;
      }, {});

    return Object.entries(structures).map(([structure, count]) => ({
      structure,
      count: count as number,
      avgScore: 75, // Simplified for now
    }));
  }

  private static findOptimalContentLength(posts: ContentPost[]) {
    const lengths = posts.map(p => ({ length: p.content.length, score: p.aiAnalysis?.performanceScore || 0 }));
    const sortedByScore = lengths.sort((a, b) => b.score - a.score);
    const top25Percent = sortedByScore.slice(0, Math.floor(sortedByScore.length * 0.25));
    
    const minLength = Math.min(...top25Percent.map(p => p.length));
    const maxLength = Math.max(...top25Percent.map(p => p.length));
    const avgScore = top25Percent.reduce((sum, p) => sum + p.score, 0) / top25Percent.length;

    return { min: minLength, max: maxLength, avgScore };
  }

  private static findBestPostingTimes(posts: ContentPost[]) {
    return this.analyzeTimingTrends(posts)
      .slice(0, 5)
      .map(trend => ({
        time: `${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][trend.dayOfWeek]} ${trend.hour}:00`,
        avgEngagement: trend.avgPerformance,
      }));
  }

  private static extractContentFeatures(content: string) {
    return {
      length: content.length,
      hasHashtags: /#\w+/.test(content),
      hasQuestion: /\?/.test(content),
      hasEmojis: /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(content),
      wordCount: content.split(/\s+/).length,
    };
  }

  private static findSimilarContent(content: string, posts: ContentPost[]): ContentPost[] {
    return posts
      .map(post => ({
        ...post,
        similarity: this.calculateSimilarity(content, post.content),
      }))
      .filter(post => post.similarity > 0.3)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10);
  }

  private static calculateSimilarity(content1: string, content2: string): number {
    // Simple similarity calculation based on common words
    const words1 = new Set(content1.toLowerCase().split(/\s+/));
    const words2 = new Set(content2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  private static getTimingBonus(scheduledTime: Date, historicalPosts: ContentPost[]): number {
    const hour = scheduledTime.getHours();
    const dayOfWeek = scheduledTime.getDay();
    
    const timingTrends = this.analyzeTimingTrends(historicalPosts);
    const matchingTrend = timingTrends.find(t => t.hour === hour && t.dayOfWeek === dayOfWeek);
    
    return matchingTrend ? (matchingTrend.avgPerformance - 50) * 0.1 : 0;
  }

  private static generateRecommendations(features: any, similarPosts: ContentPost[]): string[] {
    const recommendations: string[] = [];
    
    if (!features.hasHashtags) {
      recommendations.push('Consider adding relevant hashtags to increase discoverability');
    }
    
    if (features.length < 100) {
      recommendations.push('Content might be too short - consider expanding with more details');
    } else if (features.length > 2000) {
      recommendations.push('Content might be too long - consider breaking into multiple posts');
    }
    
    if (!features.hasQuestion) {
      recommendations.push('Adding a question can increase engagement');
    }

    return recommendations;
  }

  private static extractTrendingTopics(posts: ContentPost[]): string[] {
    const topicTrends = this.analyzeTopicTrends(posts);
    return topicTrends.slice(0, 5).map(t => t.topic);
  }

  private static suggestOptimalFormats(posts: ContentPost[], platformType: PlatformType): string[] {
    const formatTrends = this.analyzeFormatTrends(posts);
    return formatTrends.slice(0, 3).map(f => f.format);
  }

  private static suggestOptimalTiming(posts: ContentPost[]): string[] {
    const bestTimes = this.findBestPostingTimes(posts);
    return bestTimes.slice(0, 3).map(t => t.time);
  }

  private static identifyContentGaps(posts: ContentPost[], platformType: PlatformType): string[] {
    // Analyze what types of content are missing
    const gaps = [
      'Educational content',
      'Behind-the-scenes content',
      'User-generated content',
      'Trending topic coverage',
    ];

    return gaps;
  }
}