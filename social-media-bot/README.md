# 🤖 Warden Social Media Bot

## Project Overview

An autonomous, containerized social media bot that periodically engages across multiple platforms using AI-generated content tailored to the Warden project context. This bot wakes up on schedule, analyzes project activity, generates contextual content using local and cloud AI, and publishes across Discord, Twitter/X, Reddit, Facebook, and LinkedIn.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Social Media Bot Container                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Scheduler     │  │ Content Engine  │  │ Platform Manager│ │
│  │                 │  │                 │  │                 │ │
│  │ • Wake/Sleep    │  │ • Context Agg.  │  │ • Discord       │ │
│  │ • Event Driven  │  │ • AI Generation │  │ • Twitter/X     │ │
│  │ • Cron Jobs     │  │ • Content Extract│  │ • Reddit        │ │
│  └─────────────────┘  └─────────────────┘  │ • Facebook      │ │
│           │                     │          │ • LinkedIn      │ │
│           │                     │          └─────────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐           │          │
│  │   Local AI      │  │   Cloud AI      │           │          │
│  │                 │  │                 │           │          │
│  │ • Ollama        │  │ • GPT-5 API     │           │          │
│  │ • Llama 3.1     │  │ • Content Gen   │           │          │
│  │ • Fast Response │  │ • High Quality  │           │          │
│  └─────────────────┘  └─────────────────┘           │          │
│           │                     │                   │          │
├─────────────────────────────────────────────────────────────────┤
│                        Data Sources                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Warden Project  │  │ Community Data  │  │ External APIs   │ │
│  │ • GitHub API    │  │ • Discord Stats │  │ • Industry News │ │
│  │ • Commit Data   │  │ • Discussions   │  │ • Market Data   │ │
│  │ • Issues/PRs    │  │ • Achievements  │  │ • Competitor    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ (for development)
- Platform API credentials (see Configuration section)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd social-media-bot
cp .env.example .env
# Edit .env with your API credentials
```

### 2. Build and Run
```bash
# Development
docker-compose -f docker-compose.dev.yml up --build

# Production
docker-compose up -d --build
```

### 3. Verify Installation
```bash
# Check bot status
curl http://localhost:3000/health

# View logs
docker-compose logs -f social-bot

# Access dashboard
open http://localhost:3000/dashboard
```

## 📋 Configuration

### Environment Variables
```env
# Core Configuration
NODE_ENV=production
BOT_NAME=warden-social-bot
LOG_LEVEL=info

# Scheduling
WAKE_INTERVAL=2h          # How often bot wakes up
SLEEP_DURATION=1h         # How long bot sleeps
EMERGENCY_WAKE_ENABLED=true

# AI Configuration
LOCAL_AI_ENDPOINT=http://ollama:11434
LOCAL_AI_MODEL=llama3.1:latest
OPENAI_API_KEY=your-openai-key
OPENAI_MODEL=gpt-4-turbo

# Platform APIs
DISCORD_BOT_TOKEN=your-discord-token
DISCORD_WEBHOOK_URL=your-webhook-url
TWITTER_API_KEY=your-twitter-key
TWITTER_API_SECRET=your-twitter-secret
TWITTER_ACCESS_TOKEN=your-access-token
TWITTER_ACCESS_SECRET=your-access-secret
REDDIT_CLIENT_ID=your-reddit-client
REDDIT_CLIENT_SECRET=your-reddit-secret
REDDIT_USERNAME=your-reddit-username
REDDIT_PASSWORD=your-reddit-password
FACEBOOK_ACCESS_TOKEN=your-facebook-token
LINKEDIN_ACCESS_TOKEN=your-linkedin-token

# Warden Project Integration
WARDEN_GITHUB_TOKEN=your-github-token
WARDEN_REPO=Earthform-AI/warden-landing
WARDEN_API_BASE=https://warden-landing.vercel.app/api

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/social_bot
REDIS_URL=redis://localhost:6379

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3001
WEBHOOK_SECRET=your-webhook-secret
```

### Content Templates
The bot uses configurable templates for each platform:

```typescript
// config/content-templates.ts
export const CONTENT_TEMPLATES = {
  discord: {
    project_update: "🚀 **Warden Update**: {{summary}}\n\n{{details}}\n\nCheck it out: {{url}}",
    community_highlight: "🌟 **Community Spotlight**: {{achievement}}\n\n{{description}}",
    weekly_digest: "📊 **This Week in Warden**:\n{{metrics}}\n\n{{highlights}}"
  },
  twitter: {
    project_update: "🚀 {{summary}}\n\n{{hashtags}}\n\n{{url}}",
    quick_tip: "💡 {{tip}}\n\n#AI #MiningSafety #WisdomWednesday",
    milestone: "🎉 {{milestone}} achieved!\n\n{{impact}}\n\n{{hashtags}}"
  },
  reddit: {
    discussion_starter: {
      title: "{{title}}",
      body: "{{body}}\n\n**Context**: {{context}}\n\n**Discussion**: {{questions}}"
    }
  }
  // ... more platforms
};
```

## 🔧 Development

### Project Structure
```
social-media-bot/
├── src/
│   ├── core/
│   │   ├── bot.ts              # Main bot orchestrator
│   │   ├── scheduler.ts        # Wake/sleep scheduling
│   │   └── health.ts           # Health monitoring
│   ├── ai/
│   │   ├── local-ai.ts         # Ollama integration
│   │   ├── cloud-ai.ts         # GPT-5 integration
│   │   └── content-engine.ts   # Content generation
│   ├── platforms/
│   │   ├── base-adapter.ts     # Platform adapter interface
│   │   ├── discord.ts          # Discord integration
│   │   ├── twitter.ts          # Twitter/X integration
│   │   ├── reddit.ts           # Reddit integration
│   │   ├── facebook.ts         # Facebook integration
│   │   └── linkedin.ts         # LinkedIn integration
│   ├── data/
│   │   ├── context-aggregator.ts # Project context collection
│   │   ├── warden-api.ts       # Warden project integration
│   │   └── analytics.ts        # Performance tracking
│   ├── utils/
│   │   ├── rate-limiter.ts     # Rate limiting
│   │   ├── content-validator.ts # Content validation
│   │   └── logger.ts           # Structured logging
│   └── web/
│       ├── dashboard.ts        # Admin dashboard
│       ├── api.ts              # REST API
│       └── webhooks.ts         # Webhook handlers
├── config/
│   ├── content-templates.ts    # Platform templates
│   ├── platform-configs.ts    # Platform-specific settings
│   └── scheduling-rules.ts     # Wake/sleep rules
├── tests/
│   ├── unit/                   # Unit tests
│   ├── integration/            # Integration tests
│   └── e2e/                    # End-to-end tests
├── docker/
│   ├── Dockerfile              # Main container
│   ├── Dockerfile.dev          # Development container
│   └── ollama.Dockerfile       # Local AI container
├── monitoring/
│   ├── prometheus.yml          # Metrics config
│   ├── grafana/                # Dashboard configs
│   └── alerts.yml              # Alert rules
└── docs/
    ├── API.md                  # API documentation
    ├── DEPLOYMENT.md           # Deployment guide
    └── TROUBLESHOOTING.md      # Common issues
```

### Local Development Setup
```bash
# Install dependencies
npm install

# Start local AI (Ollama)
docker run -d -p 11434:11434 ollama/ollama
docker exec -it ollama ollama pull llama3.1

# Start development services
docker-compose -f docker-compose.dev.yml up postgres redis

# Run bot in development mode
npm run dev

# Run tests
npm test
npm run test:integration
npm run test:e2e
```

### Testing Strategy
```typescript
// Example test structure
describe('ContentEngine', () => {
  it('should generate platform-specific content', async () => {
    const context = mockProjectContext();
    const content = await contentEngine.generateContent('discord', context);
    
    expect(content).toMatchSchema(discordContentSchema);
    expect(content.length).toBeLessThan(DISCORD_MESSAGE_LIMIT);
  });
});

describe('PlatformAdapters', () => {
  it('should respect rate limits', async () => {
    const adapter = new TwitterAdapter(mockConfig);
    
    // Test rate limiting
    for (let i = 0; i < 100; i++) {
      await adapter.post(mockContent);
    }
    
    expect(rateLimitTracker.isWithinLimits()).toBe(true);
  });
});
```

## 🚦 Bot Behavior

### Wake/Sleep Cycle
```typescript
interface BotCycle {
  wake(): Promise<void>;      // Gather context, generate content
  engage(): Promise<void>;    // Post to platforms
  analyze(): Promise<void>;   // Review performance
  sleep(): Promise<void>;     // Enter low-power mode
}
```

### Content Generation Flow
1. **Context Aggregation**: Collect data from Warden project, community, and external sources
2. **AI Prompt Creation**: Build detailed prompts with context, platform requirements, and objectives
3. **Content Generation**: Use local AI for quick responses, cloud AI for high-quality content
4. **Content Extraction**: Parse and validate AI responses
5. **Platform Adaptation**: Format content for each platform's requirements
6. **Publishing**: Post to platforms with rate limiting and error handling
7. **Feedback Collection**: Gather engagement metrics for learning

### Emergency Wake Triggers
- Critical GitHub repository events (security issues, major releases)
- Community mentions requiring response
- Breaking news in mining industry
- High-priority notifications from Warden team
- Platform API issues requiring immediate attention

## 📊 Monitoring & Analytics

### Health Endpoints
```
GET /health              # Overall bot health
GET /health/platforms    # Platform connection status
GET /health/ai          # AI service status
GET /metrics            # Prometheus metrics
```

### Dashboard Features
- Real-time bot status and activity
- Content performance analytics
- Platform engagement metrics
- AI generation statistics
- Error logs and debugging tools
- Manual content approval queue
- Emergency controls

### Key Metrics
- **Engagement Rate**: Likes, shares, comments per post
- **Reach**: Unique users reached across platforms
- **Growth**: New followers/members acquired
- **Quality Score**: AI content quality assessment
- **Platform Health**: API success rates and response times
- **Cost Efficiency**: AI token usage and platform API costs

## 🔒 Security & Compliance

### API Security
- Rotating API keys with secure storage
- Rate limiting to prevent abuse
- Input validation and sanitization
- Audit logging for all actions

### Content Safety
- Multi-layer content filtering
- Bias detection and mitigation
- Human review queue for sensitive topics
- Immediate rollback capabilities
- Platform compliance monitoring

### Privacy
- Minimal data collection
- Secure credential storage
- GDPR compliance for EU users
- Transparent bot identification

## 🚀 Deployment Options

### Option 1: Docker Compose (Recommended for Testing)
```bash
# Simple deployment
docker-compose up -d

# With monitoring stack
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
```

### Option 2: Kubernetes
```yaml
# k8s-deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: social-media-bot
spec:
  replicas: 1
  selector:
    matchLabels:
      app: social-media-bot
  template:
    spec:
      containers:
      - name: bot
        image: warden/social-media-bot:latest
        env:
        - name: NODE_ENV
          value: "production"
        # ... more config
```

### Option 3: Cloud Functions (Serverless)
- Deploy individual functions for each platform
- Event-driven scaling
- Cost-effective for irregular usage
- Requires adapting architecture for stateless execution

## 🤝 Integration with Warden Project

### Data Sources
- **GitHub API**: Repository activity, issues, PRs, releases
- **Community Stats API**: Discord engagement, discussion metrics
- **Achievement System**: Community member progress and highlights
- **Project Milestones**: Development progress and announcements

### Shared Infrastructure
- Leverage existing Discord bot commands
- Use established social media templates
- Connect to community database
- Integrate with existing webhook systems

### Content Coordination
- Avoid duplicate posting with existing bots
- Coordinate messaging with official announcements
- Maintain consistent brand voice
- Support official campaigns and initiatives

## 📞 Support & Troubleshooting

### Common Issues
1. **Bot not posting**: Check API credentials and rate limits
2. **Content quality issues**: Review AI prompts and templates
3. **Platform errors**: Verify API status and compliance
4. **Performance problems**: Check resource usage and scaling

### Getting Help
- Check the troubleshooting guide: `docs/TROUBLESHOOTING.md`
- Review logs: `docker-compose logs social-bot`
- Monitor dashboard: `http://localhost:3000/dashboard`
- Contact the team: [Issues](https://github.com/Earthform-AI/warden-landing/issues)

### Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines and how to submit improvements.

---

## 🎯 Next Steps

1. **Review the assessment**: Read `SOCIAL_MEDIA_BOT_ASSESSMENT.md` for detailed analysis
2. **Check the sprint plan**: Follow `SOCIAL_MEDIA_BOT_SPRINT.md` for implementation timeline
3. **Set up credentials**: Configure your platform API access
4. **Start development**: Begin with Discord integration using existing Warden infrastructure
5. **Test thoroughly**: Use the provided test framework to validate functionality
6. **Deploy gradually**: Start with staging environment before production

This bot will significantly enhance the Warden project's community engagement while maintaining high-quality, contextual interactions across all major social media platforms.