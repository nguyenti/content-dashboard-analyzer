import { db } from '../database';
import { ContentPost, PlatformMetrics, ContentScript, AIAnalysis, PlatformType } from '../types';
import type { ContentPost as SupabaseContentPost } from '../supabase';

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
    const postData = {
      content_id: data.contentId,
      title: data.title,
      content: data.content,
      media_urls: data.mediaUrls,
      published_at: data.publishedAt.toISOString(),
      platform_id: data.platformId,
      platform_type: data.platformType,
      platform_name: data.platformName,
      metrics: data.metrics,
      script_id: data.script?.id,
      script_source: data.script?.source,
      script_title: data.script?.title,
      script_content: data.script?.content,
      script_url: data.script?.url,
      script_uploaded_at: data.script?.uploadedAt?.toISOString(),
    };

    const post = await db.createContentPost(postData);
    return this.transformSupabasePost(post);
  }

  static async getPostsByPlatform(platformType: PlatformType): Promise<ContentPost[]> {
    const posts = await db.getContentPosts({
      platformType,
      orderBy: 'published_at',
      order: 'desc'
    });

    return posts.map(this.transformSupabasePost);
  }

  static async updatePostAnalysis(
    postId: string, 
    analysis: Omit<AIAnalysis, 'id' | 'postId'>
  ): Promise<ContentPost> {
    const updateData = {
      ai_analysis_id: `analysis_${postId}`,
      performance_score: analysis.performanceScore,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      recommendations: analysis.recommendations,
      hook_effectiveness: analysis.contentStructureAnalysis.hookEffectiveness,
      storytelling_structure: analysis.contentStructureAnalysis.storytellingStructure,
      call_to_action_presence: analysis.contentStructureAnalysis.callToActionPresence,
      emotional_tone: analysis.contentStructureAnalysis.emotionalTone,
      key_topics: analysis.contentStructureAnalysis.keyTopics,
      readability_score: analysis.contentStructureAnalysis.readabilityScore,
      visual_content_ratio: analysis.contentStructureAnalysis.visualContentRatio,
      top_performing_elements: analysis.trendAnalysis.topPerformingElements,
      emerging_patterns: analysis.trendAnalysis.emergingPatterns,
      seasonal_trends: analysis.trendAnalysis.seasonalTrends,
      audience_preferences: analysis.trendAnalysis.audiencePreferences,
      ai_generated_at: analysis.generatedAt?.toISOString(),
    };

    const post = await db.updateContentPost(postId, updateData);
    return this.transformSupabasePost(post);
  }

  static async getTopPerformingPosts(limit: number = 10): Promise<ContentPost[]> {
    const posts = await db.getTopPerformingPosts(limit);
    return posts.map(this.transformSupabasePost);
  }

  private static transformSupabasePost(supabasePost: SupabaseContentPost): ContentPost {
    const metrics = supabasePost.metrics as PlatformMetrics;
    
    const script = supabasePost.script_id ? {
      id: supabasePost.script_id,
      source: supabasePost.script_source as 'google_doc' | 'upload',
      title: supabasePost.script_title,
      content: supabasePost.script_content,
      url: supabasePost.script_url,
      uploadedAt: supabasePost.script_uploaded_at ? new Date(supabasePost.script_uploaded_at) : undefined,
    } : undefined;

    const aiAnalysis = supabasePost.ai_analysis_id ? {
      id: supabasePost.ai_analysis_id,
      postId: supabasePost.id,
      performanceScore: supabasePost.performance_score,
      strengths: supabasePost.strengths || [],
      weaknesses: supabasePost.weaknesses || [],
      recommendations: supabasePost.recommendations || [],
      contentStructureAnalysis: {
        hookEffectiveness: supabasePost.hook_effectiveness,
        storytellingStructure: supabasePost.storytelling_structure,
        callToActionPresence: supabasePost.call_to_action_presence,
        emotionalTone: supabasePost.emotional_tone || [],
        keyTopics: supabasePost.key_topics || [],
        readabilityScore: supabasePost.readability_score,
        visualContentRatio: supabasePost.visual_content_ratio,
      },
      trendAnalysis: {
        topPerformingElements: supabasePost.top_performing_elements || [],
        emergingPatterns: supabasePost.emerging_patterns || [],
        seasonalTrends: supabasePost.seasonal_trends || [],
        audiencePreferences: supabasePost.audience_preferences || [],
      },
      generatedAt: supabasePost.ai_generated_at ? new Date(supabasePost.ai_generated_at) : undefined,
    } : undefined;

    return {
      id: supabasePost.id,
      platform: {
        id: supabasePost.platform_id,
        type: supabasePost.platform_type as PlatformType,
        displayName: supabasePost.platform_name,
        isActive: true,
      },
      contentId: supabasePost.content_id,
      title: supabasePost.title,
      content: supabasePost.content,
      mediaUrls: supabasePost.media_urls || [],
      publishedAt: new Date(supabasePost.published_at),
      metrics,
      script,
      aiAnalysis,
      createdAt: new Date(supabasePost.created_at),
      updatedAt: new Date(supabasePost.updated_at),
    };
  }
}