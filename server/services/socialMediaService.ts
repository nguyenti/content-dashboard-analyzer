import { Platform, ContentPost, PlatformType } from '../types';
import { LinkedInService } from './socialMedia/linkedinService';
import { YouTubeService } from './socialMedia/youtubeService';
import { InstagramService } from './socialMedia/instagramService';
import { ContentService } from './contentService';
import { db } from '../database';

export class SocialMediaService {
  
  static async syncPlatformPosts(platformType: PlatformType): Promise<ContentPost[]> {
    const platform = await this.getPlatform(platformType);
    if (!platform) {
      throw new Error(`Platform ${platformType} not configured`);
    }

    let posts: any[] = [];
    let service: any;

    switch (platformType) {
      case 'linkedin':
        service = new LinkedInService(platform as any);
        posts = await service.getUserPosts();
        break;
      case 'youtube':
        service = new YouTubeService(platform as any);
        posts = await service.getChannelVideos();
        break;
      case 'instagram':
        service = new InstagramService(platform as any);
        posts = await service.getUserPosts();
        break;
      default:
        throw new Error(`Unsupported platform: ${platformType}`);
    }

    const syncedPosts: ContentPost[] = [];

    for (const post of posts) {
      try {
        const contentPost = await this.transformAndSavePost(post, platform, service);
        syncedPosts.push(contentPost);
      } catch (error) {
        console.error(`Failed to sync post ${post.id}:`, error);
      }
    }

    // Update platform last sync time
    const platformForUpdate = await db.getPlatformByType(platformType);
    if (platformForUpdate) {
      await db.updatePlatform(platformForUpdate.id, { 
        last_sync_at: new Date().toISOString() 
      });
    }

    return syncedPosts;
  }

  static async syncPostMetrics(postId: string): Promise<ContentPost> {
    const post = await db.getContentPost(postId);

    if (!post) {
      throw new Error('Post not found');
    }

    const platform = await this.getPlatform(post.platform_type as PlatformType);
    if (!platform) {
      throw new Error(`Platform ${post.platform_type} not configured`);
    }

    let service: any;
    let metrics: any;

    switch (post.platform_type) {
      case 'linkedin':
        service = new LinkedInService(platform as any);
        metrics = await service.getPostMetrics(post.content_id);
        break;
      case 'youtube':
        service = new YouTubeService(platform as any);
        metrics = await service.getVideoMetrics(post.content_id);
        break;
      case 'instagram':
        service = new InstagramService(platform as any);
        metrics = await service.getPostMetrics(post.content_id);
        break;
      default:
        throw new Error(`Unsupported platform: ${post.platform_type}`);
    }

    // Update post with new metrics
    const updatedPost = await db.updateContentPost(postId, {
      metrics: metrics,
    });

    return ContentService['transformSupabasePost'](updatedPost);
  }

  static async validatePlatformCredentials(platformType: PlatformType): Promise<boolean> {
    const platform = await this.getPlatform(platformType);
    if (!platform) {
      return false;
    }

    try {
      switch (platformType) {
        case 'linkedin':
          const linkedinService = new LinkedInService(platform as any);
          return await linkedinService.validateToken();
        case 'youtube':
          const youtubeService = new YouTubeService(platform as any);
          return await youtubeService.validateApiKey();
        case 'instagram':
          const instagramService = new InstagramService(platform as any);
          return await instagramService.validateToken();
        default:
          return false;
      }
    } catch {
      return false;
    }
  }

  private static async getPlatform(platformType: PlatformType): Promise<Platform | null> {
    const platform = await db.getPlatformByType(platformType);

    if (!platform) {
      return null;
    }

    return {
      id: platform.id,
      type: platformType,
      displayName: platform.display_name,
      isActive: platform.is_active,
      lastSyncAt: platform.last_sync_at ? new Date(platform.last_sync_at) : undefined,
      credentials: platform.credentials,
    } as Platform;
  }

  private static async transformAndSavePost(
    rawPost: any, 
    platform: Platform, 
    service: any
  ): Promise<ContentPost> {
    let contentId: string;
    let title: string;
    let content: string;
    let mediaUrls: string[] = [];
    let publishedAt: Date;

    // Transform based on platform
    switch (platform.type) {
      case 'linkedin':
        contentId = rawPost.id;
        title = rawPost.text?.text?.substring(0, 100) || 'LinkedIn Post';
        content = rawPost.text?.text || '';
        publishedAt = new Date(rawPost.created?.time || Date.now());
        break;
      case 'youtube':
        contentId = rawPost.snippet.resourceId.videoId;
        title = rawPost.snippet.title;
        content = rawPost.snippet.description || '';
        mediaUrls = [rawPost.snippet.thumbnails?.high?.url || ''];
        publishedAt = new Date(rawPost.snippet.publishedAt);
        break;
      case 'instagram':
        contentId = rawPost.id;
        title = rawPost.caption?.substring(0, 100) || 'Instagram Post';
        content = rawPost.caption || '';
        mediaUrls = rawPost.media_url ? [rawPost.media_url] : [];
        publishedAt = new Date(rawPost.timestamp);
        break;
      default:
        throw new Error(`Unsupported platform: ${platform.type}`);
    }

    // Check if post already exists
    const existingPost = await db.getContentPostByContentId(contentId);

    if (existingPost) {
      // Update metrics only
      const metrics = await service.getPostMetrics ? 
        await service.getPostMetrics(contentId) : 
        { likes: 0, comments: 0, shares: 0, engagementRate: 0 };

      const updatedPost = await db.updateContentPost(existingPost.id, {
        metrics: metrics,
      });

      return ContentService['transformSupabasePost'](updatedPost);
    } else {
      // Create new post
      const metrics = await service.getPostMetrics ? 
        await service.getPostMetrics(contentId) : 
        { likes: 0, comments: 0, shares: 0, engagementRate: 0 };

      return await ContentService.createPost({
        contentId,
        title,
        content,
        mediaUrls,
        publishedAt,
        platformId: platform.id,
        platformType: platform.type,
        platformName: platform.displayName,
        metrics,
      });
    }
  }
}