// AB Testing Configuration System for Warden Landing Page
// This system enables easy A/B testing of different content variants for each section

export interface ABVariant {
  id: string;
  name: string;
  weight: number; // Percentage weight for traffic allocation (0-100)
  config: any; // The variant configuration data
}

export interface ABTest {
  testId: string;
  name: string;
  description: string;
  enabled: boolean;
  variants: ABVariant[];
  defaultVariant: string; // Fallback variant ID
  startDate?: Date;
  endDate?: Date;
}

// ===== HERO SECTION AB TEST =====
export const heroABTest: ABTest = {
  testId: 'hero-messaging-test',
  name: 'Hero Section Messaging Test',
  description: 'Testing different hero messaging approaches for conversion optimization',
  enabled: true,
  defaultVariant: 'original',
  variants: [
    {
      id: 'original',
      name: 'Original - Guardian Focus',
      weight: 50,
      config: {
        title: "Warden: The Shield in the Deep",
        subtitle: "Mining is still dangerous. We're building guardians who never blink.",
        quote: "Mining can't be rewritten overnight—but we can begin with intelligence, respect, and armor.",
        cta: {
          text: "Join the Mission",
          link: "#join"
        }
      }
    },
    {
      id: 'protective-focus',
      name: 'Alternative - Protection Focus',
      weight: 50,
      config: {
        title: "Warden: The Shield in the Deep",
        subtitle: "Protecting those who still dare to dig. A new era of mining has begun.",
        quote: "Mining can't be rewritten overnight—but we can begin with intelligence, empathy, and armor.",
        cta: {
          text: "Join the Mission",
          link: "#join"
        }
      }
    }
  ]
};

// ===== MISSION SECTION AB TEST =====
export const missionABTest: ABTest = {
  testId: 'mission-approach-test',
  name: 'Mission Section Approach Test',
  description: 'Testing different mission messaging approaches',
  enabled: true,
  defaultVariant: 'current',
  variants: [
    {
      id: 'current',
      name: 'Current - Statistics Focus',
      weight: 60,
      config: {
        problem: {
          tagline: "⚠️ The Reality Underground",
          heading: "Mining remains one of the most dangerous occupations worldwide",
          stats: [
            { number: "28", label: "US mining fatalities in 2024 (MSHA)", color: "red", source: "MSHA Daily Fatality Report" },
            { number: "2.29", label: "global TRIFR per 1M hours (ICMM 2024)", color: "orange", source: "ICMM Safety Data" }
          ],
          description: [
            "Gas leaks. Collapses. Heat. Silence.",
            "Behind every verified statistic is a family waiting at the kitchen table. Even with progress, mining workers face risks that demand our attention and protection."
          ],
          quote: "We're not trying to replace the miner — we're becoming their shield in the deep.",
          solution: "Warden is the first AI system built to shield, warn, and remember — before danger strikes.",
          context: "Based on official 2024 data from MSHA (US) and ICMM (global mining companies representing ~1/3 of industry)."
        }
      }
    },
    {
      id: 'aspirational',
      name: 'Alternative - Aspirational Focus', 
      weight: 40,
      config: {
        problem: {
          tagline: "⚠️ The Reality Underground",
          heading: "What if we could mine without loss?",
          stats: [
            { number: "15,000+", label: "mining deaths yearly", color: "red" },
            { number: "60%", label: "preventable incidents", color: "orange" }
          ],
          description: [
            "We believe no one should die just to earn a living.",
            "Earthform is building AI-powered drones that understand danger, protect lives, and keep the earth intact."
          ],
          quote: "We respect the minerals — and the people — who make modern life possible.",
          solution: "Warden is creating a future where mining and human dignity coexist.",
          context: "Based on global mining safety analysis and industry incident reports."
        }
      }
    }
  ]
};

// ===== CTA SECTION AB TEST =====
export const ctaABTest: ABTest = {
  testId: 'cta-messaging-test',
  name: 'Call-to-Action Messaging Test',
  description: 'Testing different CTA button text and messaging for conversion',
  enabled: true,
  defaultVariant: 'mission-focus',
  variants: [
    {
      id: 'mission-focus',
      name: 'Mission Focus',
      weight: 33,
      config: {
        heading: "Join the Mission",
        subtitle: "Help us build AI systems that protect lives and honor the Earth.",
        form: {
          submitText: "Back the Mission"
        }
      }
    },
    {
      id: 'tech-focus',
      name: 'Technology Focus',
      weight: 33,
      config: {
        heading: "See Our Technology",
        subtitle: "Discover how AI-powered guardians are revolutionizing mining safety.",
        form: {
          submitText: "Learn More"
        }
      }
    },
    {
      id: 'community-focus',
      name: 'Community Focus',
      weight: 34,
      config: {
        heading: "Join Our Community",
        subtitle: "Be part of the movement to make mining safer for everyone.",
        form: {
          submitText: "Get Involved"
        }
      }
    }
  ]
};

// ===== AB TEST REGISTRY =====
export const abTestRegistry = {
  hero: heroABTest,
  mission: missionABTest,
  cta: ctaABTest
};

// ===== AB TESTING CONFIGURATION =====
export const abTestConfig = {
  enabled: true, // Global AB testing enable/disable
  cookieName: 'warden_ab_variants',
  cookieExpireDays: 30,
  analyticsEnabled: true,
  debugMode: false, // Set to true for development debugging
  
  // Segment configuration for user targeting
  segments: {
    // Default: random assignment for all users
    default: {
      name: 'Default Segment',
      rules: [], // Empty rules = applies to all users
      tests: ['hero-messaging-test', 'mission-approach-test', 'cta-messaging-test']
    }
    // Future: Add more segments like 'returning-visitor', 'mobile-users', etc.
  }
};

// ===== ANALYTICS EVENT TYPES =====
export const ABAnalyticsEvents = {
  VARIANT_ASSIGNED: 'ab_variant_assigned',
  VARIANT_VIEWED: 'ab_variant_viewed',
  VARIANT_CONVERSION: 'ab_variant_conversion',
  VARIANT_INTERACTION: 'ab_variant_interaction'
} as const;

export type ABAnalyticsEventType = typeof ABAnalyticsEvents[keyof typeof ABAnalyticsEvents];

export interface ABAnalyticsEvent {
  type: ABAnalyticsEventType;
  testId: string;
  variantId: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}