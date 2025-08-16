import axios from 'axios';
import { LinkedInMetrics, LinkedInPlatform } from '../../types';

export class LinkedInService {
  private accessToken: string;
  private baseUrl = 'https://api.linkedin.com/v2';

  constructor(platform: LinkedInPlatform) {
    this.accessToken = platform.credentials.accessToken;
  }

  async getUserPosts(userId?: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/shares`, {
        params: {
          q: 'owners',
          owners: userId || await this.getCurrentUserId(),
          sortBy: 'CREATED',
          count: 50,
        },
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      });

      return response.data.elements || [];
    } catch (error) {
      console.error('LinkedIn API error:', error);
      throw new Error('Failed to fetch LinkedIn posts');
    }
  }

  async getPostMetrics(postId: string): Promise<LinkedInMetrics> {
    try {
      // Get post statistics
      const statsResponse = await axios.get(`${this.baseUrl}/socialActions/${postId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      });

      const stats = statsResponse.data;
      
      // Calculate engagement rate
      const totalEngagements = (stats.likesSummary?.totalLikes || 0) + 
                              (stats.commentsSummary?.totalComments || 0) + 
                              (stats.sharesSummary?.totalShares || 0);
      
      const impressions = stats.impressions || 1;
      const engagementRate = (totalEngagements / impressions) * 100;

      return {
        likes: stats.likesSummary?.totalLikes || 0,
        comments: stats.commentsSummary?.totalComments || 0,
        shares: stats.sharesSummary?.totalShares || 0,
        engagementRate,
        impressions: stats.impressions || 0,
        clickThroughRate: stats.clickThroughRate || 0,
        reach: stats.reach || 0,
      };
    } catch (error) {
      console.error('LinkedIn metrics error:', error);
      throw new Error('Failed to fetch LinkedIn post metrics');
    }
  }

  async getCurrentUserId(): Promise<string> {
    try {
      const response = await axios.get(`${this.baseUrl}/people/~`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      });

      return response.data.id;
    } catch (error) {
      console.error('LinkedIn user ID error:', error);
      throw new Error('Failed to get current user ID');
    }
  }

  async validateToken(): Promise<boolean> {
    try {
      await this.getCurrentUserId();
      return true;
    } catch {
      return false;
    }
  }

  static async refreshAccessToken(refreshToken: string, clientId: string, clientSecret: string): Promise<{
    accessToken: string;
    expiresAt: Date;
  }> {
    try {
      const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token, expires_in } = response.data;
      const expiresAt = new Date(Date.now() + (expires_in * 1000));

      return {
        accessToken: access_token,
        expiresAt,
      };
    } catch (error) {
      console.error('LinkedIn token refresh error:', error);
      throw new Error('Failed to refresh LinkedIn access token');
    }
  }
}