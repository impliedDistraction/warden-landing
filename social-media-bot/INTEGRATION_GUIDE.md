# 🔗 Warden Social Media Bot Integration Guide

## Overview

This guide explains how the separate social media bot project integrates with the existing Warden landing page infrastructure to leverage shared data sources, APIs, and community engagement tools.

## 🏗️ Integration Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Warden Landing (Main Project)                   │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │  Discord Bot    │  │ Social Publisher│  │ Community Stats │     │
│  │  /api/discord-  │  │ /api/social-    │  │ /api/community- │     │
│  │  bot.ts         │  │ publisher.ts    │  │ stats.ts        │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
│           │                     │                     │             │
│           │                     │                     │             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │ GitHub Webhook  │  │ Achievement     │  │ Weekly Digest   │     │
│  │ /api/github-    │  │ /api/achievement│  │ /api/weekly-    │     │
│  │ webhook.ts      │  │ -tracker.ts     │  │ digest.ts       │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ API Integration
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                Social Media Bot (Separate Container)                 │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │ Context         │  │ Content Engine  │  │ Platform        │     │
│  │ Aggregator      │  │                 │  │ Adapters        │     │
│  │                 │  │ • Local AI      │  │                 │     │
│  │ • Warden API    │  │ • Cloud AI      │  │ • Discord       │     │
│  │ • GitHub API    │  │ • Templates     │  │ • Twitter/X     │     │
│  │ • Community     │  │ • Validation    │  │ • Reddit        │     │
│  │ • External      │  │                 │  │ • Facebook      │     │
│  └─────────────────┘  └─────────────────┘  │ • LinkedIn      │     │
│                                            └─────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

## 📡 Data Integration Points

### 1. Warden API Endpoints

The bot consumes existing Warden APIs for real-time project data:

```typescript
// src/data/warden-api.ts
export class WardenAPIClient {
  private baseURL = process.env.WARDEN_API_BASE || 'https://warden-landing.vercel.app/api';
  
  async getCommunityStats(): Promise<CommunityStats> {
    return this.get('/community-stats');
  }
  
  async getWeeklyDigest(): Promise<WeeklyDigest> {
    return this.get('/weekly-digest');
  }
  
  async getAchievements(): Promise<Achievement[]> {
    return this.get('/achievement-tracker');
  }
  
  async getDiscordActivity(): Promise<DiscordActivity> {
    return this.get('/discord-activity');
  }
}
```

### 2. GitHub Repository Integration

Direct GitHub API access for development activity:

```typescript
// src/data/github-client.ts
export class GitHubClient {
  async getRecentCommits(repo: string, days: number = 7): Promise<Commit[]> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.get(`/repos/${repo}/commits?since=${since.toISOString()}`);
  }
  
  async getOpenIssues(repo: string): Promise<Issue[]> {
    return this.get(`/repos/${repo}/issues?state=open`);
  }
  
  async getRecentReleases(repo: string): Promise<Release[]> {
    return this.get(`/repos/${repo}/releases?per_page=5`);
  }
}
```

### 3. Shared Content Templates

Leverage existing social media templates from the Warden project:

```typescript
// src/config/shared-templates.ts
import { POST_TEMPLATES } from '../../../api/social-publisher.js';

export class SharedTemplateAdapter {
  /**
   * Convert Warden templates to bot format
   */
  adaptWardenTemplates(): BotTemplate[] {
    return POST_TEMPLATES.map(template => ({
      id: template.id,
      name: template.name,
      platforms: template.platforms,
      variables: template.variables,
      content: this.adaptTemplateContent(template.template)
    }));
  }
  
  private adaptTemplateContent(template: any): PlatformContent {
    return {
      discord: this.formatForDiscord(template.discord || template.twitter),
      twitter: template.twitter,
      reddit: template.reddit?.content || template.twitter,
      linkedin: template.linkedin || template.twitter,
      facebook: template.facebook || template.linkedin || template.twitter
    };
  }
}
```

## 🔄 Real-time Event Integration

### Webhook Coordination

The bot can receive events from the Warden webhook system:

```typescript
// src/web/webhooks.ts
export class BotWebhookHandler {
  /**
   * Receive GitHub events forwarded from Warden webhook
   */
  async handleGitHubEvent(event: GitHubWebhookEvent): Promise<void> {
    const { action, repository, sender } = event;
    
    // Trigger immediate response for important events
    if (this.isUrgentEvent(event)) {
      await this.bot.emergencyWake('github-event', event);
    }
    
    // Store for next regular cycle
    await this.contextStore.addEvent(event);
  }
  
  /**
   * Coordinate with existing Discord bot to avoid duplicates
   */
  async coordinateWithDiscordBot(message: DiscordMessage): Promise<boolean> {
    // Check if existing Discord bot already handled this
    const recentMessages = await this.discordAPI.getRecentMessages();
    const isDuplicate = recentMessages.some(msg => 
      this.isSimilarContent(msg.content, message.content)
    );
    
    return !isDuplicate;
  }
}
```

### Event Deduplication

Prevent duplicate posts between the bot and existing Warden automation:

```typescript
// src/utils/deduplication.ts
export class ContentDeduplicationService {
  private recentPosts: Map<string, PostRecord> = new Map();
  
  async isDuplicateContent(
    platform: string, 
    content: string, 
    timeWindow: number = 3600000 // 1 hour
  ): Promise<boolean> {
    const key = `${platform}-${this.hashContent(content)}`;
    const existing = this.recentPosts.get(key);
    
    if (!existing) return false;
    
    return (Date.now() - existing.timestamp) < timeWindow;
  }
  
  recordPost(platform: string, content: string, postId: string): void {
    const key = `${platform}-${this.hashContent(content)}`;
    this.recentPosts.set(key, {
      postId,
      timestamp: Date.now(),
      content: content.substring(0, 100) // Store excerpt
    });
  }
}
```

## 🚀 Deployment Integration

### Environment Coordination

Share certain environment variables between projects:

```bash
# Shared environment variables
WARDEN_GITHUB_TOKEN=shared-github-token
WARDEN_API_BASE=https://warden-landing.vercel.app/api
DISCORD_WEBHOOK_URL=shared-discord-webhook

# Bot-specific variables
BOT_DISCORD_TOKEN=separate-bot-token
LOCAL_AI_ENDPOINT=http://ollama:11434
OPENAI_API_KEY=bot-specific-openai-key
```

### Database Coordination

Option 1: Shared database for community data
```typescript
// src/data/shared-database.ts
export class SharedDatabaseClient {
  async getCommunityMetrics(): Promise<CommunityMetrics> {
    // Connect to same database as Warden landing
    return this.query(`
      SELECT 
        COUNT(DISTINCT user_id) as active_users,
        AVG(engagement_score) as avg_engagement,
        COUNT(*) as total_interactions
      FROM community_interactions 
      WHERE created_at > NOW() - INTERVAL '7 days'
    `);
  }
}
```

Option 2: API-based data sharing (recommended)
```typescript
// src/data/context-aggregator.ts
export class ContextAggregator {
  async aggregateContext(): Promise<ProjectContext> {
    const [
      communityStats,
      githubActivity,
      discordMetrics,
      achievements
    ] = await Promise.all([
      this.wardenAPI.getCommunityStats(),
      this.githubClient.getRecentActivity(),
      this.wardenAPI.getDiscordActivity(),
      this.wardenAPI.getAchievements()
    ]);
    
    return {
      community: communityStats,
      development: githubActivity,
      social: discordMetrics,
      milestones: achievements,
      aggregatedAt: new Date()
    };
  }
}
```

## 📊 Analytics Coordination

### Shared Metrics Dashboard

Integrate bot metrics with existing Warden analytics:

```typescript
// src/analytics/metrics-reporter.ts
export class MetricsReporter {
  async reportToWardenAnalytics(metrics: BotMetrics): Promise<void> {
    // Send metrics to shared analytics endpoint
    await fetch(`${this.wardenAPIBase}/analytics/bot-metrics`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WARDEN_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source: 'social-media-bot',
        timestamp: new Date().toISOString(),
        metrics: {
          postsGenerated: metrics.postsGenerated,
          engagementRate: metrics.engagementRate,
          platformReach: metrics.platformReach,
          communityGrowth: metrics.communityGrowth
        }
      })
    });
  }
}
```

### Cross-platform Attribution

Track which content drives traffic to Warden landing:

```typescript
// src/analytics/attribution-tracker.ts
export class AttributionTracker {
  generateTrackingURL(baseURL: string, platform: string, contentId: string): string {
    const params = new URLSearchParams({
      utm_source: 'social_bot',
      utm_medium: platform,
      utm_campaign: 'automated_engagement',
      utm_content: contentId
    });
    
    return `${baseURL}?${params.toString()}`;
  }
  
  async trackConversion(
    platform: string, 
    contentId: string, 
    conversionType: string
  ): Promise<void> {
    // Report back to Warden analytics
    await this.wardenAPI.recordConversion({
      source: 'social_bot',
      platform,
      contentId,
      conversionType,
      timestamp: new Date()
    });
  }
}
```

## 🔧 Configuration Synchronization

### Shared Configuration Management

Keep bot configuration in sync with Warden project settings:

```typescript
// src/config/config-sync.ts
export class ConfigurationSyncer {
  async syncWithWardenConfig(): Promise<void> {
    // Fetch latest configuration from Warden API
    const wardenConfig = await this.wardenAPI.getBotConfiguration();
    
    // Update local configuration
    this.updatePlatformSettings(wardenConfig.platforms);
    this.updateContentTemplates(wardenConfig.templates);
    this.updateSchedulingRules(wardenConfig.scheduling);
    
    logger.info('Configuration synchronized with Warden project');
  }
  
  async updateWardenConfig(updates: Partial<BotConfig>): Promise<void> {
    // Send configuration updates back to Warden
    await this.wardenAPI.updateBotConfiguration(updates);
  }
}
```

### Content Guidelines Sync

Ensure bot follows the same content guidelines as official Warden communications:

```typescript
// src/content/guidelines-validator.ts
export class ContentGuidelinesValidator {
  private guidelines: ContentGuidelines;
  
  async loadGuidelinesFromWarden(): Promise<void> {
    this.guidelines = await this.wardenAPI.getContentGuidelines();
  }
  
  validateContent(content: string, platform: string): ValidationResult {
    const violations = [];
    
    // Check against Warden brand guidelines
    if (!this.checkBrandCompliance(content)) {
      violations.push('Brand guideline violation');
    }
    
    // Check tone consistency
    if (!this.checkToneConsistency(content, this.guidelines.tone)) {
      violations.push('Tone inconsistency');
    }
    
    // Check messaging alignment
    if (!this.checkMessagingAlignment(content, this.guidelines.keyMessages)) {
      violations.push('Message misalignment');
    }
    
    return {
      isValid: violations.length === 0,
      violations,
      confidence: this.calculateComplianceScore(content)
    };
  }
}
```

## 🚨 Monitoring Integration

### Unified Health Monitoring

Report bot health to Warden monitoring systems:

```typescript
// src/monitoring/health-reporter.ts
export class HealthReporter {
  async reportHealth(): Promise<void> {
    const healthStatus = {
      botId: 'warden-social-bot',
      status: this.getOverallHealth(),
      platforms: this.getPlatformHealth(),
      ai: this.getAIHealth(),
      lastActive: new Date(),
      metrics: this.getCurrentMetrics()
    };
    
    // Send to Warden monitoring
    await this.wardenAPI.reportBotHealth(healthStatus);
    
    // Also send to centralized monitoring
    await this.prometheusClient.pushMetrics(healthStatus);
  }
}
```

### Alert Coordination

Coordinate alerts with existing Warden alerting systems:

```typescript
// src/monitoring/alert-coordinator.ts
export class AlertCoordinator {
  async sendAlert(alert: BotAlert): Promise<void> {
    // Send to Warden team via existing channels
    if (alert.severity === 'critical') {
      await this.wardenAPI.sendCriticalAlert({
        source: 'social-bot',
        message: alert.message,
        details: alert.details,
        timestamp: new Date()
      });
    }
    
    // Use existing Discord webhook for team notifications
    await this.discordWebhook.send({
      embeds: [{
        title: `🤖 Bot Alert: ${alert.title}`,
        description: alert.message,
        color: this.getAlertColor(alert.severity),
        timestamp: new Date().toISOString()
      }]
    });
  }
}
```

## 🔒 Security Integration

### Shared Authentication

Use Warden's authentication system for bot administration:

```typescript
// src/auth/warden-auth.ts
export class WardenAuthProvider {
  async validateAdminToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.wardenAPIBase}/auth/validate`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      return response.ok;
    } catch (error) {
      return false;
    }
  }
  
  async getPermissions(token: string): Promise<Permission[]> {
    const response = await fetch(`${this.wardenAPIBase}/auth/permissions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    return response.json();
  }
}
```

## 📦 Deployment Coordination

### Staging Environment Sync

Keep staging environments in sync:

```bash
# Deploy bot to staging when Warden staging is updated
name: Deploy Bot to Staging
on:
  repository_dispatch:
    types: [warden-staging-deployed]

jobs:
  deploy-bot:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy Bot
        run: |
          # Deploy bot with latest Warden staging API endpoints
          docker-compose -f docker-compose.staging.yml up -d --build
```

### Production Deployment Dependencies

Ensure bot deployment coordinates with Warden releases:

```yaml
# docker-compose.production.yml
version: '3.8'
services:
  social-bot:
    image: warden-social-bot:${WARDEN_VERSION}
    environment:
      - WARDEN_API_BASE=https://warden-landing.vercel.app/api
      - WARDEN_VERSION=${WARDEN_VERSION}
    depends_on:
      - warden-api-health-check
      
  warden-api-health-check:
    image: curlimages/curl
    command: >
      sh -c "
        echo 'Waiting for Warden API...' &&
        until curl -f ${WARDEN_API_BASE}/health; do
          echo 'Warden API not ready, retrying in 5s...'
          sleep 5
        done &&
        echo 'Warden API is ready!'
      "
```

## 📋 Implementation Checklist

### Phase 1: Basic Integration
- [ ] Set up API client for Warden endpoints
- [ ] Implement GitHub data fetching
- [ ] Configure shared environment variables
- [ ] Test basic data aggregation

### Phase 2: Content Coordination  
- [ ] Implement deduplication service
- [ ] Set up webhook coordination
- [ ] Sync content templates
- [ ] Test content generation with Warden data

### Phase 3: Analytics Integration
- [ ] Report metrics to Warden analytics
- [ ] Set up attribution tracking
- [ ] Implement cross-platform monitoring
- [ ] Create unified dashboard views

### Phase 4: Production Integration
- [ ] Set up shared authentication
- [ ] Coordinate deployment pipelines
- [ ] Implement health monitoring
- [ ] Set up alert coordination

This integration ensures the social media bot enhances rather than duplicates the existing Warden community engagement infrastructure while providing advanced AI-driven content generation capabilities.