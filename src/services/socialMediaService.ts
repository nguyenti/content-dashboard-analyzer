import { Platform, ContentPost, PlatformType } from '../types';
import { LinkedInService } from './socialMedia/linkedinService';
import { YouTubeService } from './socialMedia/youtubeService';
import { InstagramService } from './socialMedia/instagramService';
import { ContentService } from './contentService';
import { prisma } from '../server/db';

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
    await prisma.platform.update({
      where: { type: platformType },
      data: { lastSyncAt: new Date() },
    });

    return syncedPosts;
  }

  static async syncPostMetrics(postId: string): Promise<ContentPost> {
    const post = await prisma.contentPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    const platform = await this.getPlatform(post.platformType as PlatformType);
    if (!platform) {
      throw new Error(`Platform ${post.platformType} not configured`);
    }

    let service: any;
    let metrics: any;

    switch (post.platformType) {
      case 'linkedin':
        service = new LinkedInService(platform as any);
        metrics = await service.getPostMetrics(post.contentId);
        break;
      case 'youtube':
        service = new YouTubeService(platform as any);
        metrics = await service.getVideoMetrics(post.contentId);
        break;
      case 'instagram':
        service = new InstagramService(platform as any);
        metrics = await service.getPostMetrics(post.contentId);
        break;
      default:
        throw new Error(`Unsupported platform: ${post.platformType}`);
    }

    // Update post with new metrics
    const updatedPost = await prisma.contentPost.update({
      where: { id: postId },
      data: {
        metricsJson: JSON.stringify(metrics),
        updatedAt: new Date(),
      },
    });

    return ContentService['transformPrismaPost'](updatedPost);
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
    const platform = await prisma.platform.findUnique({
      where: { type: platformType },
    });

    if (!platform) {
      return null;
    }

    const credentials = JSON.parse(platform.credentialsJson);

    return {
      id: platform.id,
      type: platformType,
      displayName: platform.displayName,
      isActive: platform.isActive,
      lastSyncAt: platform.lastSyncAt,
      credentials,
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
    const existingPost = await prisma.contentPost.findUnique({
      where: { contentId },
    });

    if (existingPost) {
      // Update metrics only
      const metrics = await service.getPostMetrics ? 
        await service.getPostMetrics(contentId) : 
        { likes: 0, comments: 0, shares: 0, engagementRate: 0 };

      const updatedPost = await prisma.contentPost.update({
        where: { contentId },
        data: {
          metricsJson: JSON.stringify(metrics),
          updatedAt: new Date(),
        },
      });

      return ContentService['transformPrismaPost'](updatedPost);
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