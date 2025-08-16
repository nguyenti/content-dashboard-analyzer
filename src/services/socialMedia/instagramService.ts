import axios from 'axios';
import { InstagramMetrics, InstagramPlatform } from '../../types';

export class InstagramService {
  private accessToken: string;
  private userId: string;
  private baseUrl = 'https://graph.instagram.com';

  constructor(platform: InstagramPlatform) {
    this.accessToken = platform.credentials.accessToken;
    this.userId = platform.credentials.userId;
  }

  async getUserPosts(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/${this.userId}/media`, {
        params: {
          fields: 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp',
          access_token: this.accessToken,
          limit: 50,
        },
      });

      return response.data.data || [];
    } catch (error) {
      console.error('Instagram API error:', error);
      throw new Error('Failed to fetch Instagram posts');
    }
  }

  async getPostMetrics(postId: string): Promise<InstagramMetrics> {
    try {
      const response = await axios.get(`${this.baseUrl}/${postId}/insights`, {
        params: {
          metric: 'likes,comments,shares,saves,impressions,reach,profile_visits',
          access_token: this.accessToken,
        },
      });

      const insights = response.data.data;
      const metrics: any = {};

      // Parse insights data
      insights.forEach((insight: any) => {
        metrics[insight.name] = insight.values[0]?.value || 0;
      });

      // Get basic engagement data
      const engagementResponse = await axios.get(`${this.baseUrl}/${postId}`, {
        params: {
          fields: 'like_count,comments_count',
          access_token: this.accessToken,
        },
      });

      const engagement = engagementResponse.data;
      
      const likes = engagement.like_count || 0;
      const comments = engagement.comments_count || 0;
      const shares = metrics.shares || 0;
      const saves = metrics.saves || 0;
      const impressions = metrics.impressions || 1;
      
      // Calculate engagement rate
      const totalEngagements = likes + comments + shares + saves;
      const engagementRate = (totalEngagements / impressions) * 100;

      return {
        likes,
        comments,
        shares,
        engagementRate,
        views: metrics.video_views, // Only for videos
        saves,
        reach: metrics.reach || 0,
        impressions,
        profileVisits: metrics.profile_visits || 0,
      };
    } catch (error) {
      console.error('Instagram metrics error:', error);
      throw new Error('Failed to fetch Instagram post metrics');
    }
  }

  async getAccountInsights(): Promise<{
    followerCount: number;
    mediaCount: number;
    impressions: number;
    reach: number;
  }> {
    try {
      // Get account info
      const accountResponse = await axios.get(`${this.baseUrl}/${this.userId}`, {
        params: {
          fields: 'followers_count,media_count',
          access_token: this.accessToken,
        },
      });

      // Get account insights (requires business account)
      let insights = { impressions: 0, reach: 0 };
      try {
        const insightsResponse = await axios.get(`${this.baseUrl}/${this.userId}/insights`, {
          params: {
            metric: 'impressions,reach',
            period: 'day',
            since: Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000), // Last 7 days
            until: Math.floor(Date.now() / 1000),
            access_token: this.accessToken,
          },
        });

        const insightsData = insightsResponse.data.data;
        insightsData.forEach((insight: any) => {
          if (insight.name === 'impressions') {
            insights.impressions = insight.values.reduce((sum: number, val: any) => sum + val.value, 0);
          } else if (insight.name === 'reach') {
            insights.reach = insight.values.reduce((sum: number, val: any) => sum + val.value, 0);
          }
        });
      } catch (insightError) {
        console.warn('Could not fetch Instagram insights (may require business account)');
      }

      return {
        followerCount: accountResponse.data.followers_count || 0,
        mediaCount: accountResponse.data.media_count || 0,
        impressions: insights.impressions,
        reach: insights.reach,
      };
    } catch (error) {
      console.error('Instagram account insights error:', error);
      throw new Error('Failed to fetch Instagram account insights');
    }
  }

  async validateToken(): Promise<boolean> {
    try {
      await axios.get(`${this.baseUrl}/${this.userId}`, {
        params: {
          fields: 'id',
          access_token: this.accessToken,
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  static async refreshAccessToken(accessToken: string): Promise<{
    accessToken: string;
    expiresAt: Date;
  }> {
    try {
      const response = await axios.get('https://graph.instagram.com/refresh_access_token', {
        params: {
          grant_type: 'ig_refresh_token',
          access_token: accessToken,
        },
      });

      const { access_token, expires_in } = response.data;
      const expiresAt = new Date(Date.now() + (expires_in * 1000));

      return {
        accessToken: access_token,
        expiresAt,
      };
    } catch (error) {
      console.error('Instagram token refresh error:', error);
      throw new Error('Failed to refresh Instagram access token');
    }
  }
}