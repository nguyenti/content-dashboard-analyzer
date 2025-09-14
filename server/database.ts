import { supabase, tables } from './supabase.ts';
import type { ContentPost, Platform, AnalysisPlugin, User } from './supabase.ts';

// Database service class that wraps Supabase operations
export class DatabaseService {
  
  // Content Posts operations
  async createContentPost(data: Partial<ContentPost>): Promise<ContentPost> {
    const { data: result, error } = await supabase
      .from(tables.contentPosts)
      .insert(data)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create content post: ${error.message}`);
    return result;
  }

  async getContentPost(id: string): Promise<ContentPost | null> {
    const { data, error } = await supabase
      .from(tables.contentPosts)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw new Error(`Failed to get content post: ${error.message}`);
    }
    
    return data;
  }

  async getContentPostByContentId(contentId: string): Promise<ContentPost | null> {
    const { data, error } = await supabase
      .from(tables.contentPosts)
      .select('*')
      .eq('content_id', contentId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get content post by content ID: ${error.message}`);
    }
    
    return data;
  }

  async updateContentPost(id: string, data: Partial<ContentPost>): Promise<ContentPost> {
    const { data: result, error } = await supabase
      .from(tables.contentPosts)
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to update content post: ${error.message}`);
    return result;
  }

  async deleteContentPost(id: string): Promise<void> {
    const { error } = await supabase
      .from(tables.contentPosts)
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(`Failed to delete content post: ${error.message}`);
  }

  async getContentPosts(options?: {
    platformType?: string;
    limit?: number;
    offset?: number;
    orderBy?: 'published_at' | 'performance_score' | 'created_at';
    order?: 'asc' | 'desc';
  }): Promise<ContentPost[]> {
    let query = supabase.from(tables.contentPosts).select('*');
    
    if (options?.platformType) {
      query = query.eq('platform_type', options.platformType);
    }
    
    if (options?.orderBy) {
      query = query.order(options.orderBy, { ascending: options.order === 'asc' });
    }
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }
    
    const { data, error } = await query;
    
    if (error) throw new Error(`Failed to get content posts: ${error.message}`);
    return data || [];
  }

  async getTopPerformingPosts(limit: number = 5): Promise<ContentPost[]> {
    const { data, error } = await supabase
      .from(tables.contentPosts)
      .select('*')
      .not('performance_score', 'is', null)
      .order('performance_score', { ascending: false })
      .limit(limit);
    
    if (error) throw new Error(`Failed to get top performing posts: ${error.message}`);
    return data || [];
  }

  // Platform operations
  async createPlatform(data: Partial<Platform>): Promise<Platform> {
    const { data: result, error } = await supabase
      .from(tables.platforms)
      .insert(data)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create platform: ${error.message}`);
    return result;
  }

  async getPlatform(id: string): Promise<Platform | null> {
    const { data, error } = await supabase
      .from(tables.platforms)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get platform: ${error.message}`);
    }
    
    return data;
  }

  async getPlatformByType(type: string): Promise<Platform | null> {
    const { data, error } = await supabase
      .from(tables.platforms)
      .select('*')
      .eq('type', type)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get platform by type: ${error.message}`);
    }
    
    return data;
  }

  async updatePlatform(id: string, data: Partial<Platform>): Promise<Platform> {
    const { data: result, error } = await supabase
      .from(tables.platforms)
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to update platform: ${error.message}`);
    return result;
  }

  async getPlatforms(): Promise<Platform[]> {
    const { data, error } = await supabase
      .from(tables.platforms)
      .select('*')
      .order('created_at');
    
    if (error) throw new Error(`Failed to get platforms: ${error.message}`);
    return data || [];
  }

  async getActivePlatforms(): Promise<Platform[]> {
    const { data, error } = await supabase
      .from(tables.platforms)
      .select('*')
      .eq('is_active', true)
      .order('created_at');
    
    if (error) throw new Error(`Failed to get active platforms: ${error.message}`);
    return data || [];
  }

  // Analysis Plugin operations
  async createAnalysisPlugin(data: Partial<AnalysisPlugin>): Promise<AnalysisPlugin> {
    const { data: result, error } = await supabase
      .from(tables.analysisPlugins)
      .insert(data)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create analysis plugin: ${error.message}`);
    return result;
  }

  async getAnalysisPlugin(id: string): Promise<AnalysisPlugin | null> {
    const { data, error } = await supabase
      .from(tables.analysisPlugins)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get analysis plugin: ${error.message}`);
    }
    
    return data;
  }

  async updateAnalysisPlugin(id: string, data: Partial<AnalysisPlugin>): Promise<AnalysisPlugin> {
    const { data: result, error } = await supabase
      .from(tables.analysisPlugins)
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to update analysis plugin: ${error.message}`);
    return result;
  }

  async getAnalysisPlugins(): Promise<AnalysisPlugin[]> {
    const { data, error } = await supabase
      .from(tables.analysisPlugins)
      .select('*')
      .order('created_at');
    
    if (error) throw new Error(`Failed to get analysis plugins: ${error.message}`);
    return data || [];
  }

  async getActiveAnalysisPlugins(): Promise<AnalysisPlugin[]> {
    const { data, error } = await supabase
      .from(tables.analysisPlugins)
      .select('*')
      .eq('is_active', true)
      .order('created_at');
    
    if (error) throw new Error(`Failed to get active analysis plugins: ${error.message}`);
    return data || [];
  }

  // Analytics and metrics operations
  async getMetricsOverview(): Promise<{
    totalPosts: number;
    avgPerformanceScore: number;
    topPlatform: string;
    recentPosts: number;
  }> {
    const [totalResult, avgResult, recentResult] = await Promise.all([
      supabase.from(tables.contentPosts).select('id', { count: 'exact' }),
      supabase.from(tables.contentPosts)
        .select('performance_score')
        .not('performance_score', 'is', null),
      supabase.from(tables.contentPosts)
        .select('id', { count: 'exact' })
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    ]);

    const totalPosts = totalResult.count || 0;
    const recentPosts = recentResult.count || 0;
    
    const scores = avgResult.data?.map(p => p.performance_score).filter(Boolean) || [];
    const avgPerformanceScore = scores.length > 0 
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
      : 0;

    // Get top platform by post count
    const { data: platformData } = await supabase
      .from(tables.contentPosts)
      .select('platform_type')
      .not('platform_type', 'is', null);
    
    const platformCounts = (platformData || []).reduce((acc, post) => {
      acc[post.platform_type] = (acc[post.platform_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topPlatform = Object.entries(platformCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';

    return {
      totalPosts,
      avgPerformanceScore: Math.round(avgPerformanceScore * 100) / 100,
      topPlatform,
      recentPosts
    };
  }

  // User operations for OAuth authentication
  async createUser(data: Partial<User>): Promise<User> {
    const { data: result, error } = await supabase
      .from(tables.users)
      .insert(data)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create user: ${error.message}`);
    return result;
  }

  async getUserByGoogleId(googleId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from(tables.users)
      .select('*')
      .eq('google_id', googleId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get user by Google ID: ${error.message}`);
    }
    
    return data;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from(tables.users)
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get user by email: ${error.message}`);
    }
    
    return data;
  }

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from(tables.users)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get user by ID: ${error.message}`);
    }
    
    return data;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const { data: result, error } = await supabase
      .from(tables.users)
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to update user: ${error.message}`);
    return result;
  }

  async updateUserLastLogin(id: string): Promise<User> {
    return this.updateUser(id, { 
      last_login: new Date().toISOString() 
    });
  }

  async createOrUpdateUserFromGoogle(googleData: {
    id: string;
    email: string;
    name?: string;
    picture?: string;
  }): Promise<User> {
    // Try to find existing user
    const existingUser = await this.getUserByGoogleId(googleData.id);
    
    if (existingUser) {
      // Update last login and any changed data
      return this.updateUser(existingUser.id, {
        name: googleData.name || existingUser.name,
        avatar_url: googleData.picture || existingUser.avatar_url,
        last_login: new Date().toISOString()
      });
    } else {
      // Create new user
      return this.createUser({
        google_id: googleData.id,
        email: googleData.email,
        name: googleData.name,
        avatar_url: googleData.picture,
        role: 'user', // Default role
        last_login: new Date().toISOString()
      });
    }
  }

  // Allowed users operations
  async isUserAllowed(email: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('allowed_users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error(`Failed to check allowed user: ${error.message}`);
      return false;
    }
    
    return !!data;
  }

  async addAllowedUser(email: string, invitedBy?: string): Promise<void> {
    const { error } = await supabase
      .from('allowed_users')
      .insert({
        email: email.toLowerCase(),
        invited_by: invitedBy
      });
    
    if (error) throw new Error(`Failed to add allowed user: ${error.message}`);
  }

  async removeAllowedUser(email: string): Promise<void> {
    const { error } = await supabase
      .from('allowed_users')
      .delete()
      .eq('email', email.toLowerCase());
    
    if (error) throw new Error(`Failed to remove allowed user: ${error.message}`);
  }

  async getAllowedUsers(): Promise<any[]> {
    const { data, error } = await supabase
      .from('allowed_users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to get allowed users: ${error.message}`);
    return data || [];
  }
}

// Export singleton instance
export const db = new DatabaseService();