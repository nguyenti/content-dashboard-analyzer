import { AnalysisPlugin, PluginAnalysisResult, ContentPost } from '../types';
import { prisma } from '../server/db';

export class PluginSystem {
  private static plugins = new Map<string, AnalysisPlugin>();

  static async loadPlugins(): Promise<void> {
    const dbPlugins = await prisma.analysisPlugin.findMany({
      where: { isActive: true },
    });

    for (const dbPlugin of dbPlugins) {
      try {
        const plugin = this.createPluginFromDb(dbPlugin);
        this.plugins.set(plugin.id, plugin);
      } catch (error) {
        console.error(`Failed to load plugin ${dbPlugin.name}:`, error);
      }
    }

    // Load built-in plugins
    this.loadBuiltInPlugins();
  }

  static async registerPlugin(plugin: Omit<AnalysisPlugin, 'id'>): Promise<string> {
    const dbPlugin = await prisma.analysisPlugin.create({
      data: {
        name: plugin.name,
        description: plugin.description,
        version: plugin.version,
        isActive: true,
        configJson: JSON.stringify(plugin.config),
      },
    });

    const fullPlugin: AnalysisPlugin = {
      ...plugin,
      id: dbPlugin.id,
    };

    this.plugins.set(fullPlugin.id, fullPlugin);
    return fullPlugin.id;
  }

  static async runAnalysis(postId: string, post: ContentPost): Promise<PluginAnalysisResult[]> {
    const results: PluginAnalysisResult[] = [];

    for (const [pluginId, plugin] of this.plugins) {
      try {
        const result = await plugin.analyze(post);
        results.push({
          ...result,
          pluginId,
          pluginName: plugin.name,
        } as any);
      } catch (error) {
        console.error(`Plugin ${plugin.name} failed:`, error);
      }
    }

    return results;
  }

  static getAvailablePlugins(): AnalysisPlugin[] {
    return Array.from(this.plugins.values());
  }

  static async togglePlugin(pluginId: string, isActive: boolean): Promise<void> {
    await prisma.analysisPlugin.update({
      where: { id: pluginId },
      data: { isActive },
    });

    if (isActive) {
      // Reload plugin if activating
      const dbPlugin = await prisma.analysisPlugin.findUnique({
        where: { id: pluginId },
      });
      if (dbPlugin) {
        const plugin = this.createPluginFromDb(dbPlugin);
        this.plugins.set(plugin.id, plugin);
      }
    } else {
      // Remove plugin if deactivating
      this.plugins.delete(pluginId);
    }
  }

  private static createPluginFromDb(dbPlugin: any): AnalysisPlugin {
    const config = JSON.parse(dbPlugin.configJson);
    
    return {
      id: dbPlugin.id,
      name: dbPlugin.name,
      description: dbPlugin.description,
      version: dbPlugin.version,
      isActive: dbPlugin.isActive,
      config,
      analyze: this.createAnalysisFunction(dbPlugin.name, config),
    };
  }

  private static createAnalysisFunction(
    pluginName: string, 
    config: any
  ): (post: ContentPost) => Promise<PluginAnalysisResult> {
    // This would typically load the actual plugin code
    // For now, return a factory function based on plugin name
    switch (pluginName) {
      case 'sentiment-analyzer':
        return this.sentimentAnalyzer;
      case 'readability-checker':
        return this.readabilityChecker;
      case 'hashtag-optimizer':
        return this.hashtagOptimizer;
      default:
        return this.defaultAnalyzer;
    }
  }

  private static loadBuiltInPlugins(): void {
    const builtInPlugins: AnalysisPlugin[] = [
      {
        id: 'sentiment-analyzer',
        name: 'Sentiment Analyzer',
        description: 'Analyzes emotional sentiment of content',
        version: '1.0.0',
        isActive: true,
        config: { threshold: 0.5 },
        analyze: this.sentimentAnalyzer,
      },
      {
        id: 'readability-checker',
        name: 'Readability Checker',
        description: 'Checks content readability and complexity',
        version: '1.0.0',
        isActive: true,
        config: { targetGrade: 8 },
        analyze: this.readabilityChecker,
      },
      {
        id: 'hashtag-optimizer',
        name: 'Hashtag Optimizer',
        description: 'Suggests optimal hashtags for content',
        version: '1.0.0',
        isActive: true,
        config: { maxSuggestions: 10 },
        analyze: this.hashtagOptimizer,
      },
    ];

    builtInPlugins.forEach(plugin => {
      this.plugins.set(plugin.id, plugin);
    });
  }

  private static async sentimentAnalyzer(post: ContentPost): Promise<PluginAnalysisResult> {
    // Simple sentiment analysis based on keywords
    const positiveWords = ['great', 'amazing', 'excellent', 'love', 'best', 'awesome'];
    const negativeWords = ['bad', 'terrible', 'hate', 'worst', 'awful', 'horrible'];
    
    const content = post.content.toLowerCase();
    const positiveCount = positiveWords.filter(word => content.includes(word)).length;
    const negativeCount = negativeWords.filter(word => content.includes(word)).length;
    
    const sentimentScore = (positiveCount - negativeCount + 5) * 10; // Scale to 0-100
    const sentiment = sentimentScore > 60 ? 'positive' : sentimentScore < 40 ? 'negative' : 'neutral';

    return {
      score: Math.max(0, Math.min(100, sentimentScore)),
      insights: [
        `Content sentiment: ${sentiment}`,
        `Positive words: ${positiveCount}`,
        `Negative words: ${negativeCount}`,
      ],
      data: {
        sentiment,
        positiveWords: positiveCount,
        negativeWords: negativeCount,
      },
    };
  }

  private static async readabilityChecker(post: ContentPost): Promise<PluginAnalysisResult> {
    const content = post.content;
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const avgWordsPerSentence = words.length / sentences.length;
    
    // Simple readability scoring
    let readabilityScore = 100;
    if (avgWordsPerSentence > 20) readabilityScore -= 20;
    if (avgWordsPerSentence > 30) readabilityScore -= 20;
    
    const complexWords = words.filter(word => word.length > 6).length;
    const complexityRatio = complexWords / words.length;
    if (complexityRatio > 0.3) readabilityScore -= 30;

    return {
      score: Math.max(0, readabilityScore),
      insights: [
        `Average words per sentence: ${avgWordsPerSentence.toFixed(1)}`,
        `Complex words ratio: ${(complexityRatio * 100).toFixed(1)}%`,
        readabilityScore > 70 ? 'Good readability' : 'Consider simplifying content',
      ],
      data: {
        sentences: sentences.length,
        words: words.length,
        avgWordsPerSentence,
        complexityRatio,
      },
    };
  }

  private static async hashtagOptimizer(post: ContentPost): Promise<PluginAnalysisResult> {
    const content = post.content;
    const existingHashtags = content.match(/#\w+/g) || [];
    
    // Simple hashtag suggestions based on content keywords
    const words = content.toLowerCase().split(/\s+/);
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const keywords = words
      .filter(word => word.length > 3 && !commonWords.includes(word))
      .slice(0, 5);

    const suggestedHashtags = keywords.map(word => `#${word}`);
    const score = existingHashtags.length > 0 ? 80 : 40; // Bonus for having hashtags

    return {
      score,
      insights: [
        `Current hashtags: ${existingHashtags.length}`,
        `Suggested hashtags: ${suggestedHashtags.join(', ')}`,
        existingHashtags.length === 0 ? 'Consider adding hashtags for better reach' : 'Good hashtag usage',
      ],
      data: {
        existingHashtags,
        suggestedHashtags,
        keywordsFound: keywords,
      },
    };
  }

  private static async defaultAnalyzer(post: ContentPost): Promise<PluginAnalysisResult> {
    return {
      score: 50,
      insights: ['Default analysis - no specific plugin logic'],
      data: { analyzed: true },
    };
  }
}