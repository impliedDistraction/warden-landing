/**
 * Main Bot Orchestrator
 * Coordinates the wake/sleep cycle and manages all bot activities
 */

import { logger } from '../utils/logger.js';
import { BotScheduler } from './scheduler.js';
import { ContentEngine } from '../ai/content-engine.js';
import { PlatformManager } from '../platforms/platform-manager.js';
import { ContextAggregator } from '../data/context-aggregator.js';
import { HealthMonitor } from './health.js';

export class SocialMediaBot {
  private scheduler: BotScheduler;
  private contentEngine: ContentEngine;
  private platformManager: PlatformManager;
  private contextAggregator: ContextAggregator;
  private healthMonitor: HealthMonitor;
  private isRunning: boolean = false;

  constructor() {
    this.scheduler = new BotScheduler();
    this.contentEngine = new ContentEngine();
    this.platformManager = new PlatformManager();
    this.contextAggregator = new ContextAggregator();
    this.healthMonitor = new HealthMonitor();
  }

  async start(): Promise<void> {
    logger.info('🤖 Starting Warden Social Media Bot...');
    
    try {
      // Initialize all services
      await this.initializeServices();
      
      // Start health monitoring
      await this.healthMonitor.start();
      
      // Begin the wake/sleep cycle
      this.isRunning = true;
      await this.scheduler.start(this.performEngagementCycle.bind(this));
      
      logger.info('✅ Bot started successfully');
    } catch (error) {
      logger.error('❌ Failed to start bot:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    logger.info('🛑 Stopping bot...');
    
    this.isRunning = false;
    await this.scheduler.stop();
    await this.healthMonitor.stop();
    
    logger.info('✅ Bot stopped successfully');
  }

  /**
   * Main engagement cycle - called when bot wakes up
   */
  private async performEngagementCycle(): Promise<void> {
    if (!this.isRunning) return;

    const cycleId = `cycle-${Date.now()}`;
    logger.info(`🌅 Starting engagement cycle: ${cycleId}`);

    try {
      // 1. Gather context from all sources
      const context = await this.contextAggregator.aggregateContext();
      logger.debug('📊 Context aggregated', { metrics: context.metrics });

      // 2. Generate content for all platforms
      const contentBatch = await this.contentEngine.generateContentBatch(context);
      logger.info(`📝 Generated ${contentBatch.length} content pieces`);

      // 3. Publish content across platforms
      const publishResults = await this.platformManager.publishBatch(contentBatch);
      
      // 4. Log results
      const successCount = publishResults.filter(r => r.success).length;
      const failureCount = publishResults.length - successCount;
      
      logger.info(`📤 Published content: ${successCount} success, ${failureCount} failed`);

      // 5. Update analytics
      await this.updateAnalytics(cycleId, context, contentBatch, publishResults);

    } catch (error) {
      logger.error(`❌ Engagement cycle failed: ${cycleId}`, error);
    }

    logger.info(`😴 Engagement cycle complete: ${cycleId}`);
  }

  private async initializeServices(): Promise<void> {
    logger.info('🔧 Initializing services...');
    
    await Promise.all([
      this.contentEngine.initialize(),
      this.platformManager.initialize(),
      this.contextAggregator.initialize()
    ]);
    
    logger.info('✅ All services initialized');
  }

  private async updateAnalytics(
    cycleId: string,
    context: any,
    content: any[],
    results: any[]
  ): Promise<void> {
    // Implementation for tracking performance metrics
    // This would integrate with your analytics system
  }

  /**
   * Emergency wake - for urgent responses
   */
  async emergencyWake(trigger: string, data?: any): Promise<void> {
    if (!this.isRunning) return;

    logger.warn(`🚨 Emergency wake triggered: ${trigger}`, data);
    
    try {
      // Generate emergency response content
      const urgentContext = await this.contextAggregator.getUrgentContext(trigger, data);
      const urgentContent = await this.contentEngine.generateUrgentContent(urgentContext);
      
      // Publish immediately to relevant platforms
      await this.platformManager.publishUrgent(urgentContent);
      
      logger.info(`✅ Emergency response completed for: ${trigger}`);
    } catch (error) {
      logger.error(`❌ Emergency response failed for: ${trigger}`, error);
    }
  }

  /**
   * Get current bot status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      health: this.healthMonitor.getStatus(),
      scheduler: this.scheduler.getStatus(),
      platforms: this.platformManager.getStatus()
    };
  }
}