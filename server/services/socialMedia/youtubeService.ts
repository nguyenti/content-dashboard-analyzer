import axios from 'axios';
import { YouTubeMetrics, YouTubePlatform } from '../../types';

export class YouTubeService {
  private apiKey: string;
  private channelId: string;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor(platform: YouTubePlatform) {
    this.apiKey = platform.credentials.apiKey;
    this.channelId = platform.credentials.channelId;
  }

  async getChannelVideos(): Promise<any[]> {
    try {
      // First get the uploads playlist ID
      const channelResponse = await axios.get(`${this.baseUrl}/channels`, {
        params: {
          part: 'contentDetails',
          id: this.channelId,
          key: this.apiKey,
        },
      });

      const uploadsPlaylistId = channelResponse.data.items[0]?.contentDetails?.relatedPlaylists?.uploads;
      
      if (!uploadsPlaylistId) {
        throw new Error('No uploads playlist found');
      }

      // Get videos from uploads playlist
      const videosResponse = await axios.get(`${this.baseUrl}/playlistItems`, {
        params: {
          part: 'snippet',
          playlistId: uploadsPlaylistId,
          maxResults: 50,
          key: this.apiKey,
        },
      });

      return videosResponse.data.items || [];
    } catch (error) {
      console.error('YouTube API error:', error);
      throw new Error('Failed to fetch YouTube videos');
    }
  }

  async getVideoMetrics(videoId: string): Promise<YouTubeMetrics> {
    try {
      const response = await axios.get(`${this.baseUrl}/videos`, {
        params: {
          part: 'statistics,contentDetails',
          id: videoId,
          key: this.apiKey,
        },
      });

      const video = response.data.items[0];
      if (!video) {
        throw new Error('Video not found');
      }

      const stats = video.statistics;
      const duration = this.parseDuration(video.contentDetails.duration);
      
      const views = parseInt(stats.viewCount || '0');
      const likes = parseInt(stats.likeCount || '0');
      const comments = parseInt(stats.commentCount || '0');
      
      // Calculate engagement rate (likes + comments) / views * 100
      const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0;
      
      // Estimate watch time (simplified calculation)
      const estimatedWatchTime = Math.floor(views * duration * 0.4); // Assume 40% average view duration
      
      return {
        likes,
        comments,
        shares: 0, // YouTube API doesn't provide share count directly
        engagementRate,
        views,
        watchTime: estimatedWatchTime,
        subscribers: parseInt(stats.subscriberCount || '0'),
        averageViewDuration: Math.floor(duration * 0.4), // Estimated 40% of video length
      };
    } catch (error) {
      console.error('YouTube metrics error:', error);
      throw new Error('Failed to fetch YouTube video metrics');
    }
  }

  async getChannelStats(): Promise<{
    subscriberCount: number;
    videoCount: number;
    viewCount: number;
  }> {
    try {
      const response = await axios.get(`${this.baseUrl}/channels`, {
        params: {
          part: 'statistics',
          id: this.channelId,
          key: this.apiKey,
        },
      });

      const stats = response.data.items[0]?.statistics;
      
      return {
        subscriberCount: parseInt(stats?.subscriberCount || '0'),
        videoCount: parseInt(stats?.videoCount || '0'),
        viewCount: parseInt(stats?.viewCount || '0'),
      };
    } catch (error) {
      console.error('YouTube channel stats error:', error);
      throw new Error('Failed to fetch YouTube channel statistics');
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await this.getChannelStats();
      return true;
    } catch {
      return false;
    }
  }

  private parseDuration(duration: string): number {
    // Parse ISO 8601 duration (PT4M13S) to seconds
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    return hours * 3600 + minutes * 60 + seconds;
  }
}