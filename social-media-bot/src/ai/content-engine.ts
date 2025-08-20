/**
 * Content Generation Engine
 * Orchestrates local and cloud AI to generate platform-specific content
 */

import { logger } from '../utils/logger.js';
import { LocalAIService } from './local-ai.js';
import { CloudAIService } from './cloud-ai.js';

export interface ProjectContext {
  // GitHub activity
  recentCommits: GitHubCommit[];
  openIssues: GitHubIssue[];
  recentPRs: GitHubPR[];
  releases: GitHubRelease[];
  
  // Community data
  discordActivity: DiscordMetrics;
  discussions: Discussion[];
  achievements: Achievement[];
  
  // External context
  industryNews: NewsItem[];
  marketTrends: TrendData[];
  
  // Performance metrics
  metrics: {
    communityGrowth: number;
    engagementRate: number;
    projectActivity: number;
  };
}

export interface ContentGenerationRequest {
  platform: string;
  context: ProjectContext;
  template?: string;
  urgency?: 'low' | 'medium' | 'high';
  tone?: 'professional' | 'casual' | 'technical' | 'inspiring';
}

export interface GeneratedContent {
  platform: string;
  content: string;
  media?: MediaSuggestion[];
  hashtags?: string[];
  scheduledFor?: Date;
  confidence: number; // 0-1 quality score
}

export interface MediaSuggestion {
  type: 'image' | 'chart' | 'infographic';
  description: string;
  data?: any;
}

export class ContentEngine {
  private localAI: LocalAIService;
  private cloudAI: CloudAIService;
  private contentCache: Map<string, GeneratedContent> = new Map();

  constructor() {
    this.localAI = new LocalAIService();
    this.cloudAI = new CloudAIService();
  }

  async initialize(): Promise<void> {
    logger.info('🧠 Initializing Content Engine...');
    
    await Promise.all([
      this.localAI.initialize(),
      this.cloudAI.initialize()
    ]);
    
    logger.info('✅ Content Engine initialized');
  }

  /**
   * Generate content batch for all platforms
   */
  async generateContentBatch(context: ProjectContext): Promise<GeneratedContent[]> {
    const platforms = ['discord', 'twitter', 'reddit', 'linkedin'];
    const contentPromises = platforms.map(platform => 
      this.generateContentForPlatform(platform, context)
    );
    
    const results = await Promise.allSettled(contentPromises);
    
    return results
      .filter((result): result is PromiseFulfilledResult<GeneratedContent> => 
        result.status === 'fulfilled'
      )
      .map(result => result.value);
  }

  /**
   * Generate content for specific platform
   */
  async generateContentForPlatform(
    platform: string, 
    context: ProjectContext,
    options: Partial<ContentGenerationRequest> = {}
  ): Promise<GeneratedContent> {
    const cacheKey = `${platform}-${this.hashContext(context)}`;
    
    // Check cache first
    if (this.contentCache.has(cacheKey)) {
      const cached = this.contentCache.get(cacheKey)!;
      if (Date.now() - cached.scheduledFor!.getTime() < 3600000) { // 1 hour
        return cached;
      }
    }

    try {
      // Create detailed prompt
      const prompt = await this.createPrompt(platform, context, options);
      
      // Decide which AI to use based on urgency and quality needs
      const useCloudAI = options.urgency === 'high' || 
                        platform === 'linkedin' || 
                        Math.random() < 0.3; // 30% cloud AI for quality

      let content: string;
      if (useCloudAI && await this.cloudAI.isAvailable()) {
        content = await this.cloudAI.generateContent(prompt);
      } else {
        content = await this.localAI.generateContent(prompt);
      }

      // Extract and validate content
      const generatedContent = await this.extractContent(content, platform, context);
      
      // Cache the result
      this.contentCache.set(cacheKey, generatedContent);
      
      return generatedContent;
      
    } catch (error) {
      logger.error(`Failed to generate content for ${platform}:`, error);
      
      // Fallback to template-based content
      return this.generateFallbackContent(platform, context);
    }
  }

  /**
   * Generate urgent content for immediate posting
   */
  async generateUrgentContent(urgentContext: any): Promise<GeneratedContent[]> {
    logger.warn('🚨 Generating urgent content');
    
    const urgentPlatforms = ['discord', 'twitter']; // Quick response platforms
    
    const contentPromises = urgentPlatforms.map(platform =>
      this.generateContentForPlatform(platform, urgentContext, { 
        urgency: 'high',
        tone: 'professional'
      })
    );
    
    return Promise.all(contentPromises);
  }

  /**
   * Create detailed AI prompt
   */
  private async createPrompt(
    platform: string, 
    context: ProjectContext,
    options: Partial<ContentGenerationRequest>
  ): Promise<string> {
    const platformSpecs = this.getPlatformSpecifications(platform);
    const tone = options.tone || 'professional';
    
    return `
You are the Warden project's social media manager. Create engaging content for ${platform}.

PROJECT CONTEXT:
- Recent development activity: ${context.recentCommits.length} commits, ${context.openIssues.length} open issues
- Community metrics: ${context.metrics.communityGrowth}% growth, ${context.metrics.engagementRate}% engagement
- Latest achievements: ${context.achievements.slice(0, 3).map(a => a.title).join(', ')}

PLATFORM REQUIREMENTS:
- Platform: ${platform}
- Max length: ${platformSpecs.maxLength} characters
- Tone: ${tone}
- Include hashtags: ${platformSpecs.useHashtags}

MISSION CONTEXT:
Warden is building AI-powered drones to protect miners underground. We're developing Neural Assembly Language (NAL) - a new approach to consciousness-aware AI that can predict mining hazards and make life-saving decisions.

RECENT HIGHLIGHTS:
${this.formatRecentHighlights(context)}

CONTENT REQUIREMENTS:
1. Be authentic and engaging
2. Highlight real progress and community value
3. Include relevant technical details when appropriate
4. Encourage community participation
5. Maintain professional but approachable tone
6. End with a call-to-action when relevant

Generate compelling content that represents the Warden project's mission to save lives through AI innovation.
`;
  }

  /**
   * Extract structured content from AI response
   */
  private async extractContent(
    aiResponse: string, 
    platform: string, 
    context: ProjectContext
  ): Promise<GeneratedContent> {
    // Parse AI response to extract content, hashtags, media suggestions
    const lines = aiResponse.split('\n').filter(line => line.trim());
    
    let content = '';
    let hashtags: string[] = [];
    let media: MediaSuggestion[] = [];
    
    for (const line of lines) {
      if (line.startsWith('#')) {
        hashtags.push(...line.split(' ').filter(word => word.startsWith('#')));
      } else if (line.includes('media:') || line.includes('image:')) {
        // Extract media suggestions
        media.push({
          type: 'image',
          description: line.replace(/.*(?:media|image):\s*/i, '')
        });
      } else if (line.length > 10) {
        content += line + '\n';
      }
    }

    // Calculate confidence score based on various factors
    const confidence = this.calculateConfidenceScore(content, platform, context);
    
    return {
      platform,
      content: content.trim(),
      hashtags: [...new Set(hashtags)], // Remove duplicates
      media,
      confidence,
      scheduledFor: new Date()
    };
  }

  /**
   * Generate fallback content using templates
   */
  private generateFallbackContent(platform: string, context: ProjectContext): GeneratedContent {
    const templates = {
      discord: `🚀 **Warden Update**: We've made ${context.recentCommits.length} commits this week! The team is pushing forward on Neural Assembly Language development. Check out our progress: https://github.com/Earthform-AI/warden-landing`,
      
      twitter: `🚀 This week in #Warden development:\n• ${context.recentCommits.length} new commits\n• ${context.openIssues.length} issues being tackled\n• Building AI to protect miners 🤖⛑️\n\n#AI #MiningSafety #OpenSource`,
      
      reddit: `**This week in Warden development**\n\nOur team made ${context.recentCommits.length} commits this week working on Neural Assembly Language - a new approach to consciousness-aware AI for mining safety.\n\nWe're building drones that can predict hazards and make life-saving decisions autonomously.\n\nCheck out our progress: https://github.com/Earthform-AI/warden-landing`,
      
      linkedin: `This week our team made significant progress on the Warden project - AI-powered mining safety systems that could save thousands of lives.\n\n✅ ${context.recentCommits.length} new commits\n✅ Active community of ${context.metrics.communityGrowth} contributors\n✅ Advancing Neural Assembly Language development\n\nEvery prevented incident is a life preserved. This is why we build.\n\n#AI #MiningSafety #TechForGood`
    };

    return {
      platform,
      content: templates[platform as keyof typeof templates] || templates.discord,
      hashtags: this.getDefaultHashtags(platform),
      confidence: 0.7, // Medium confidence for template content
      scheduledFor: new Date()
    };
  }

  private getPlatformSpecifications(platform: string) {
    const specs = {
      discord: { maxLength: 2000, useHashtags: false },
      twitter: { maxLength: 280, useHashtags: true },
      reddit: { maxLength: 10000, useHashtags: false },
      linkedin: { maxLength: 3000, useHashtags: true },
      facebook: { maxLength: 8000, useHashtags: true }
    };
    
    return specs[platform as keyof typeof specs] || specs.discord;
  }

  private formatRecentHighlights(context: ProjectContext): string {
    const highlights = [];
    
    if (context.recentCommits.length > 0) {
      highlights.push(`Latest commit: ${context.recentCommits[0].message}`);
    }
    
    if (context.achievements.length > 0) {
      highlights.push(`Recent achievement: ${context.achievements[0].title}`);
    }
    
    return highlights.join('\n');
  }

  private calculateConfidenceScore(
    content: string, 
    platform: string, 
    context: ProjectContext
  ): number {
    let score = 0.5; // Base score
    
    // Length appropriateness
    const platformSpecs = this.getPlatformSpecifications(platform);
    if (content.length > 0 && content.length <= platformSpecs.maxLength) {
      score += 0.2;
    }
    
    // Mentions project keywords
    const keywords = ['warden', 'mining', 'ai', 'safety', 'neural'];
    const mentionsKeywords = keywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );
    if (mentionsKeywords) score += 0.2;
    
    // Has call to action
    const hasCallToAction = /(?:check out|visit|join|contribute|learn more)/i.test(content);
    if (hasCallToAction) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  private getDefaultHashtags(platform: string): string[] {
    const baseTags = ['#AI', '#MiningSafety', '#OpenSource'];
    
    const platformTags = {
      twitter: [...baseTags, '#TechForGood', '#Innovation'],
      linkedin: [...baseTags, '#Technology', '#SafetyFirst'],
      facebook: [...baseTags, '#Community', '#Development']
    };
    
    return platformTags[platform as keyof typeof platformTags] || baseTags;
  }

  private hashContext(context: ProjectContext): string {
    // Simple hash of context for caching
    const key = `${context.recentCommits.length}-${context.metrics.communityGrowth}-${Date.now()}`;
    return btoa(key).slice(0, 10);
  }
}

// Type definitions for context data
interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  date: Date;
}

interface GitHubIssue {
  number: number;
  title: string;
  state: string;
  labels: string[];
}

interface GitHubPR {
  number: number;
  title: string;
  state: string;
  merged: boolean;
}

interface GitHubRelease {
  tag: string;
  name: string;
  published_at: Date;
}

interface DiscordMetrics {
  activeMembers: number;
  messagesPerDay: number;
  newJoins: number;
}

interface Discussion {
  title: string;
  category: string;
  comments: number;
  upvotes: number;
}

interface Achievement {
  title: string;
  description: string;
  category: string;
  awarded_to: string;
}

interface NewsItem {
  title: string;
  source: string;
  relevance: number;
  published_at: Date;
}

interface TrendData {
  keyword: string;
  trend: number;
  source: string;
}