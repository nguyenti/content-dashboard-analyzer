export interface ContentPost {
  id: string;
  platform: Platform;
  contentId: string;
  title: string;
  content: string;
  mediaUrls: string[];
  publishedAt: Date;
  metrics: PlatformMetrics;
  script?: ContentScript;
  aiAnalysis?: AIAnalysis;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentScript {
  id: string;
  source: 'google_doc' | 'upload';
  title: string;
  content: string;
  url?: string;
  uploadedAt: Date;
}

// Base metrics that all platforms share
export interface BaseMetrics {
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
}

// Platform-specific metric interfaces
export interface LinkedInMetrics extends BaseMetrics {
  impressions: number;
  clickThroughRate: number;
  reach: number;
}

export interface YouTubeMetrics extends BaseMetrics {
  views: number;
  watchTime: number;
  subscribers: number;
  averageViewDuration: number;
}

export interface InstagramMetrics extends BaseMetrics {
  views?: number;
  saves: number;
  reach: number;
  impressions: number;
  profileVisits: number;
}

// Union type for all platform metrics
export type PlatformMetrics = LinkedInMetrics | YouTubeMetrics | InstagramMetrics;

export interface AIAnalysis {
  id: string;
  postId: string;
  performanceScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  contentStructureAnalysis: ContentStructureAnalysis;
  trendAnalysis: TrendAnalysis;
  generatedAt: Date;
}

export interface ContentStructureAnalysis {
  hookEffectiveness: number;
  storytellingStructure: string;
  callToActionPresence: boolean;
  emotionalTone: string[];
  keyTopics: string[];
  readabilityScore: number;
  visualContentRatio: number;
}

export interface TrendAnalysis {
  topPerformingElements: string[];
  emergingPatterns: string[];
  seasonalTrends: string[];
  audiencePreferences: string[];
}

// Platform types
export type PlatformType = 'linkedin' | 'youtube' | 'instagram';

export interface BasePlatform {
  id: string;
  type: PlatformType;
  displayName: string;
  isActive: boolean;
  lastSyncAt?: Date;
}

export interface LinkedInPlatform extends BasePlatform {
  type: 'linkedin';
  credentials: {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
  };
}

export interface YouTubePlatform extends BasePlatform {
  type: 'youtube';
  credentials: {
    apiKey: string;
    channelId: string;
  };
}

export interface InstagramPlatform extends BasePlatform {
  type: 'instagram';
  credentials: {
    accessToken: string;
    userId: string;
    expiresAt?: Date;
  };
}

export type Platform = LinkedInPlatform | YouTubePlatform | InstagramPlatform;


export interface AnalysisPlugin {
  id: string;
  name: string;
  description: string;
  version: string;
  isActive: boolean;
  config: Record<string, any>;
  analyze: (post: ContentPost) => Promise<PluginAnalysisResult>;
}

export interface PluginAnalysisResult {
  score: number;
  insights: string[];
  data: Record<string, any>;
}

export interface DashboardFilters {
  platforms: string[];
  dateRange: {
    start: Date;
    end: Date;
  };
  performanceThreshold?: number;
  contentTypes?: string[];
}

export interface PerformanceMetric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}