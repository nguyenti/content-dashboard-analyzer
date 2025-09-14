import { createClient } from '@supabase/supabase-js';

// Supabase configuration - these should be set in environment variables
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase credentials not found in environment variables');
}

// Create Supabase client with service role key for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database table names mapping from Prisma to Supabase
export const tables = {
  contentPosts: 'content_posts',
  platforms: 'platforms', 
  analysisPlugins: 'analysis_plugins',
  users: 'users'
} as const;

// Helper types for database operations
export interface ContentPost {
  id: string;
  content_id: string;
  title: string;
  content: string;
  media_urls: string[] | null;
  published_at: string;
  
  // Platform info
  platform_id: string;
  platform_type: 'linkedin' | 'youtube' | 'instagram';
  platform_name: string;
  
  // Platform-specific metrics
  metrics: any;
  
  // Optional script
  script_id?: string;
  script_source?: 'google_doc' | 'upload';
  script_title?: string;
  script_content?: string;
  script_url?: string;
  script_uploaded_at?: string;
  
  // Optional AI analysis
  ai_analysis_id?: string;
  performance_score?: number;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  
  // Content structure analysis
  hook_effectiveness?: number;
  storytelling_structure?: string;
  call_to_action_presence?: boolean;
  emotional_tone?: string[];
  key_topics?: string[];
  readability_score?: number;
  visual_content_ratio?: number;
  
  // Trend analysis
  top_performing_elements?: string[];
  emerging_patterns?: string[];
  seasonal_trends?: string[];
  audience_preferences?: string[];
  ai_generated_at?: string;
  
  created_at: string;
  updated_at: string;
}

export interface Platform {
  id: string;
  type: 'linkedin' | 'youtube' | 'instagram';
  display_name: string;
  is_active: boolean;
  last_sync_at?: string;
  credentials: any;
  created_at: string;
  updated_at: string;
}

export interface AnalysisPlugin {
  id: string;
  name: string;
  description: string;
  version: string;
  is_active: boolean;
  config: any;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  google_id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role: 'admin' | 'user' | 'viewer';
  created_at: string;
  last_login?: string;
  updated_at: string;
}