import { prisma } from '../server/db';
import { ContentPost, PlatformMetrics, ContentScript, AIAnalysis, PlatformType } from '../types';

export class ContentService {
  
  static async createPost(data: {
    contentId: string;
    title: string;
    content: string;
    mediaUrls: string[];
    publishedAt: Date;
    platformId: string;
    platformType: PlatformType;
    platformName: string;
    metrics: PlatformMetrics;
    script?: ContentScript;
  }): Promise<ContentPost> {
    const post = await prisma.contentPost.create({
      data: {
        contentId: data.contentId,
        title: data.title,
        content: data.content,
        mediaUrls: JSON.stringify(data.mediaUrls),
        publishedAt: data.publishedAt,
        platformId: data.platformId,
        platformType: data.platformType,
        platformName: data.platformName,
        metricsJson: JSON.stringify(data.metrics),
        scriptId: data.script?.id,
        scriptSource: data.script?.source,
        scriptTitle: data.script?.title,
        scriptContent: data.script?.content,
        scriptUrl: data.script?.url,
        scriptUploadedAt: data.script?.uploadedAt,
      },
    });

    return this.transformPrismaPost(post);
  }

  static async getPostsByPlatform(platformType: PlatformType): Promise<ContentPost[]> {
    const posts = await prisma.contentPost.findMany({
      where: { platformType },
      orderBy: { publishedAt: 'desc' },
    });

    return posts.map(this.transformPrismaPost);
  }

  static async updatePostAnalysis(
    postId: string, 
    analysis: Omit<AIAnalysis, 'id' | 'postId'>
  ): Promise<ContentPost> {
    const post = await prisma.contentPost.update({
      where: { id: postId },
      data: {
        aiAnalysisId: `analysis_${postId}`,
        performanceScore: analysis.performanceScore,
        strengths: JSON.stringify(analysis.strengths),
        weaknesses: JSON.stringify(analysis.weaknesses),
        recommendations: JSON.stringify(analysis.recommendations),
        hookEffectiveness: analysis.contentStructureAnalysis.hookEffectiveness,
        storytellingStructure: analysis.contentStructureAnalysis.storytellingStructure,
        callToActionPresence: analysis.contentStructureAnalysis.callToActionPresence,
        emotionalTone: JSON.stringify(analysis.contentStructureAnalysis.emotionalTone),
        keyTopics: JSON.stringify(analysis.contentStructureAnalysis.keyTopics),
        readabilityScore: analysis.contentStructureAnalysis.readabilityScore,
        visualContentRatio: analysis.contentStructureAnalysis.visualContentRatio,
        topPerformingElements: JSON.stringify(analysis.trendAnalysis.topPerformingElements),
        emergingPatterns: JSON.stringify(analysis.trendAnalysis.emergingPatterns),
        seasonalTrends: JSON.stringify(analysis.trendAnalysis.seasonalTrends),
        audiencePreferences: JSON.stringify(analysis.trendAnalysis.audiencePreferences),
        aiGeneratedAt: analysis.generatedAt,
      },
    });

    return this.transformPrismaPost(post);
  }

  static async getTopPerformingPosts(limit: number = 10): Promise<ContentPost[]> {
    const posts = await prisma.contentPost.findMany({
      where: {
        performanceScore: { not: null },
      },
      orderBy: { performanceScore: 'desc' },
      take: limit,
    });

    return posts.map(this.transformPrismaPost);
  }

  private static transformPrismaPost(prismaPost: any): ContentPost {
    const metrics = JSON.parse(prismaPost.metricsJson) as PlatformMetrics;
    
    const script = prismaPost.scriptId ? {
      id: prismaPost.scriptId,
      source: prismaPost.scriptSource as 'google_doc' | 'upload',
      title: prismaPost.scriptTitle,
      content: prismaPost.scriptContent,
      url: prismaPost.scriptUrl,
      uploadedAt: prismaPost.scriptUploadedAt,
    } : undefined;

    const aiAnalysis = prismaPost.aiAnalysisId ? {
      id: prismaPost.aiAnalysisId,
      postId: prismaPost.id,
      performanceScore: prismaPost.performanceScore,
      strengths: JSON.parse(prismaPost.strengths || '[]'),
      weaknesses: JSON.parse(prismaPost.weaknesses || '[]'),
      recommendations: JSON.parse(prismaPost.recommendations || '[]'),
      contentStructureAnalysis: {
        hookEffectiveness: prismaPost.hookEffectiveness,
        storytellingStructure: prismaPost.storytellingStructure,
        callToActionPresence: prismaPost.callToActionPresence,
        emotionalTone: JSON.parse(prismaPost.emotionalTone || '[]'),
        keyTopics: JSON.parse(prismaPost.keyTopics || '[]'),
        readabilityScore: prismaPost.readabilityScore,
        visualContentRatio: prismaPost.visualContentRatio,
      },
      trendAnalysis: {
        topPerformingElements: JSON.parse(prismaPost.topPerformingElements || '[]'),
        emergingPatterns: JSON.parse(prismaPost.emergingPatterns || '[]'),
        seasonalTrends: JSON.parse(prismaPost.seasonalTrends || '[]'),
        audiencePreferences: JSON.parse(prismaPost.audiencePreferences || '[]'),
      },
      generatedAt: prismaPost.aiGeneratedAt,
    } : undefined;

    return {
      id: prismaPost.id,
      platform: {
        id: prismaPost.platformId,
        type: prismaPost.platformType as PlatformType,
        displayName: prismaPost.platformName,
        isActive: true,
      },
      contentId: prismaPost.contentId,
      title: prismaPost.title,
      content: prismaPost.content,
      mediaUrls: JSON.parse(prismaPost.mediaUrls),
      publishedAt: prismaPost.publishedAt,
      metrics,
      script,
      aiAnalysis,
      createdAt: prismaPost.createdAt,
      updatedAt: prismaPost.updatedAt,
    };
  }
}