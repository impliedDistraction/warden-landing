/**
 * Platform Adapter Interface
 * Defines the contract for all social media platform integrations
 */

export interface PlatformContent {
  text: string;
  media?: MediaAttachment[];
  metadata?: Record<string, any>;
}

export interface MediaAttachment {
  type: 'image' | 'video' | 'gif';
  url: string;
  altText?: string;
}

export interface PostResult {
  success: boolean;
  postId?: string;
  url?: string;
  error?: string;
  rateLimitReset?: Date;
}

export interface RateLimitInfo {
  remaining: number;
  resetTime: Date;
  window: number; // seconds
}

export interface PlatformConfig {
  name: string;
  enabled: boolean;
  credentials: Record<string, string>;
  rateLimits: {
    postsPerHour: number;
    postsPerDay: number;
  };
  contentLimits: {
    maxLength: number;
    maxMedia: number;
    allowedMediaTypes: string[];
  };
}

export abstract class BasePlatformAdapter {
  protected config: PlatformConfig;
  protected rateLimitTracker: Map<string, RateLimitInfo> = new Map();

  constructor(config: PlatformConfig) {
    this.config = config;
  }

  abstract get platformName(): string;

  /**
   * Post content to the platform
   */
  abstract post(content: PlatformContent): Promise<PostResult>;

  /**
   * Validate content meets platform requirements
   */
  abstract validateContent(content: PlatformContent): Promise<boolean>;

  /**
   * Check if posting is allowed based on rate limits
   */
  async canPost(): Promise<boolean> {
    const rateLimitKey = `${this.platformName}-posts`;
    const rateLimit = this.rateLimitTracker.get(rateLimitKey);
    
    if (!rateLimit) return true;
    
    if (new Date() > rateLimit.resetTime) {
      this.rateLimitTracker.delete(rateLimitKey);
      return true;
    }
    
    return rateLimit.remaining > 0;
  }

  /**
   * Update rate limit information after API call
   */
  protected updateRateLimit(
    endpoint: string, 
    remaining: number, 
    resetTime: Date
  ): void {
    this.rateLimitTracker.set(endpoint, {
      remaining,
      resetTime,
      window: 3600 // 1 hour default
    });
  }

  /**
   * Wait for rate limit reset if needed
   */
  protected async handleRateLimit(): Promise<void> {
    const rateLimitKey = `${this.platformName}-posts`;
    const rateLimit = this.rateLimitTracker.get(rateLimitKey);
    
    if (rateLimit && rateLimit.remaining <= 0) {
      const waitTime = rateLimit.resetTime.getTime() - Date.now();
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  /**
   * Format content for platform-specific requirements
   */
  protected abstract formatContent(content: PlatformContent): any;

  /**
   * Get platform health status
   */
  async getHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    latency?: number;
    rateLimitStatus?: RateLimitInfo;
  }> {
    try {
      const start = Date.now();
      await this.healthCheck();
      const latency = Date.now() - start;
      
      return {
        status: 'healthy',
        latency,
        rateLimitStatus: this.rateLimitTracker.get(`${this.platformName}-posts`)
      };
    } catch (error) {
      return { status: 'down' };
    }
  }

  /**
   * Platform-specific health check
   */
  protected abstract healthCheck(): Promise<void>;

  /**
   * Get adapter configuration
   */
  getConfig(): PlatformConfig {
    return { ...this.config };
  }

  /**
   * Update adapter configuration
   */
  updateConfig(updates: Partial<PlatformConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}