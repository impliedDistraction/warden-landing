# AB Testing Integration Examples for Warden Landing Page

This file demonstrates how to integrate the AB testing system with different landing page sections and provides ready-to-use configurations.

## Hero Section Integration

Replace the current hero section in `src/pages/index.astro` with the AB-enabled version:

```astro
---
// Replace this import:
// import { EnhancedHeroSection } from '../components/EnhancedHeroSectionV2.tsx';

// With this import:
import { ABTestEnabledHeroSection } from '../components/ABTestEnabledHeroSection.tsx';
---

<!-- In the template, replace: -->
<!-- <EnhancedHeroSection 
  title="Warden: The Shield in the Deep"
  subtitle="Mining is still dangerous. We're building guardians who never blink."
  quote="Mining can't be rewritten overnight—but we can begin with intelligence, respect, and armor."
  cta={{ text: "Join the Mission", link: "#join" }}
  client:load 
/> -->

<!-- With: -->
<ABTestEnabledHeroSection client:load />
```

## CTA Section Integration

Replace the current CTA section:

```astro
---
// Replace this import:
// import { EnhancedCTASection } from '../components/EnhancedCTASection.tsx';

// With this import:
import { ABTestEnabledCTASection } from '../components/ABTestEnabledCTASection.tsx';
import { cta } from '../site.config';
---

<!-- In the template, replace: -->
<!-- <EnhancedCTASection
  heading={cta.heading}
  subtitle={cta.subtitle}
  form={cta.form}
  client:load
/> -->

<!-- With: -->
<ABTestEnabledCTASection
  heading={cta.heading}
  subtitle={cta.subtitle}
  form={cta.form}
  client:load
/>
```

## Additional Test Variants

### Hero Section Alternative Messaging

```typescript
// Add to ab-testing.config.ts
export const heroVariant3: ABVariant = {
  id: 'safety-first',
  name: 'Safety-First Messaging',
  weight: 0, // Disabled by default
  config: {
    title: "Warden: Your Underground Guardian",
    subtitle: "Every miner deserves to come home safe. We're building AI that watches their back.",
    quote: "Technology should serve life, not just profit—starting with the most dangerous job on Earth.",
    cta: {
      text: "Protect Our Miners",
      link: "#join"
    }
  }
};

// Add to heroABTest variants array:
heroABTest.variants.push(heroVariant3);
```

### Mission Section AB Test

```typescript
// Add to ab-testing.config.ts
export const missionABTest: ABTest = {
  testId: 'mission-approach-test',
  name: 'Mission Section Approach Test',
  description: 'Testing emotional vs. technical mission messaging',
  enabled: true,
  defaultVariant: 'emotional',
  variants: [
    {
      id: 'emotional',
      name: 'Emotional Appeal',
      weight: 50,
      config: {
        tagline: "💔 The Human Cost",
        heading: "Behind every statistic is a family",
        description: "Mining feeds the modern world, but at what cost? We believe technology can protect the people who power our civilization.",
        cta: "Join Our Mission to Save Lives"
      }
    },
    {
      id: 'technical',
      name: 'Technical Solution',
      weight: 50,
      config: {
        tagline: "🤖 AI-Powered Protection",
        heading: "Advanced monitoring systems for underground safety",
        description: "Our AI drones use computer vision, gas sensors, and predictive analytics to identify hazards before they become fatal.",
        cta: "See Our Technology"
      }
    }
  ]
};
```

### CTA Button Variations

```typescript
// Additional CTA variants for testing different psychological triggers
export const ctaVariants = [
  {
    id: 'urgency',
    name: 'Urgency Focus',
    weight: 25,
    config: {
      heading: "Time is Running Out",
      subtitle: "Mining accidents happen every day. Help us build the solution now.",
      form: { submitText: "Act Now" }
    }
  },
  {
    id: 'community',
    name: 'Community Focus',
    weight: 25,
    config: {
      heading: "Join 1,000+ Safety Advocates",
      subtitle: "Be part of the global movement making mining safer for everyone.",
      form: { submitText: "Join the Movement" }
    }
  },
  {
    id: 'innovation',
    name: 'Innovation Focus',
    weight: 25,
    config: {
      heading: "Build the Future of Mining",
      subtitle: "Help us create AI systems that will revolutionize underground safety.",
      form: { submitText: "Build With Us" }
    }
  }
];
```

## A/B Testing Strategies

### 1. Traffic Allocation Strategy
```typescript
// Conservative approach - test small changes
variants: [
  { id: 'control', weight: 80 },     // 80% get current version
  { id: 'test', weight: 20 }         // 20% get test version
]

// Aggressive approach - major redesign
variants: [
  { id: 'current', weight: 50 },     // 50/50 split
  { id: 'redesign', weight: 50 }
]

// Multi-variant testing
variants: [
  { id: 'control', weight: 40 },
  { id: 'variant-a', weight: 30 },
  { id: 'variant-b', weight: 30 }
]
```

### 2. User Segmentation
```typescript
// Future enhancement - target specific user types
export const segmentedTest: ABTest = {
  testId: 'segmented-hero-test',
  segments: {
    'new-visitors': {
      variants: [
        { id: 'simple-hero', weight: 50 },
        { id: 'detailed-hero', weight: 50 }
      ]
    },
    'returning-visitors': {
      variants: [
        { id: 'advanced-hero', weight: 100 }
      ]
    }
  }
};
```

### 3. Conversion Funnel Testing
```typescript
// Test entire conversion flow
export const conversionFunnelTest = {
  steps: [
    { section: 'hero', metric: 'cta_clicks' },
    { section: 'mission', metric: 'scroll_depth' },
    { section: 'cta', metric: 'form_submissions' }
  ],
  variants: [
    { id: 'trust-focused', theme: 'safety-first' },
    { id: 'tech-focused', theme: 'innovation' }
  ]
};
```

## Analytics & Tracking Examples

### Custom Event Tracking
```typescript
// Track specific user behaviors
trackInteraction('hero-scroll-test', 'deep_scroll', { 
  scroll_depth: 75,
  time_spent: 45 
});

// Track conversion quality
trackConversion('cta-form-test', 'high_intent_signup', {
  message_length: 150,
  included_contact_info: true
});
```

### Success Metrics to Monitor
```typescript
export const testMetrics = {
  hero: {
    primary: 'cta_click_rate',      // Main success metric
    secondary: [
      'time_on_hero',               // Engagement
      'scroll_to_next_section',     // User journey
      'quote_interaction_rate'      // Content resonance
    ]
  },
  mission: {
    primary: 'section_completion_rate',
    secondary: [
      'stat_click_rate',
      'philosophy_read_rate',
      'scroll_depth_percentage'
    ]
  },
  cta: {
    primary: 'form_submission_rate',
    secondary: [
      'email_field_completion',
      'message_field_completion', 
      'social_link_clicks'
    ]
  }
};
```

## Testing Best Practices

### 1. Statistical Significance
- Run tests for minimum 1-2 weeks
- Aim for 100+ conversions per variant
- Use 95% confidence level (p < 0.05)
- Account for seasonal/weekly patterns

### 2. Test Design
```typescript
// Good: Testing one clear hypothesis
{
  hypothesis: "Emotional messaging will increase CTA clicks",
  variants: ['current-rational', 'new-emotional'],
  metric: 'cta_click_rate'
}

// Avoid: Testing multiple changes at once
{
  changes: ['new-headline', 'new-color', 'new-cta', 'new-layout'], // Too many variables
}
```

### 3. Implementation Checklist
- [ ] Define clear hypothesis before testing
- [ ] Set up proper analytics tracking
- [ ] Ensure variants have equal exposure
- [ ] Test on mobile and desktop
- [ ] Monitor for technical issues
- [ ] Document test results
- [ ] Implement winning variant
- [ ] Archive test for future reference

## Ready-to-Use Test Scenarios

### Scenario 1: New User Onboarding
Test different approaches for first-time visitors:
- Variant A: Technical specs and features
- Variant B: Safety benefits and human impact
- Variant C: Community and open-source angle

### Scenario 2: Call-to-Action Optimization
Test different psychological triggers:
- Variant A: "Join the Mission" (belonging)
- Variant B: "Save Lives" (purpose)
- Variant C: "Build the Future" (innovation)

### Scenario 3: Content Length Testing
Test information density:
- Variant A: Minimal text, big visuals
- Variant B: Detailed explanations
- Variant C: Bullet points and quick facts

### Scenario 4: Trust Building
Test different credibility indicators:
- Variant A: Emphasize open source
- Variant B: Show team credentials
- Variant C: Highlight partnerships/endorsements

## Integration with Existing Analytics

```typescript
// Send AB test data to Google Analytics
if (typeof gtag !== 'undefined') {
  gtag('event', 'ab_test_assignment', {
    test_name: testId,
    variant_name: variantId,
    custom_parameter_1: 'value'
  });
}

// Send to other analytics platforms
if (typeof analytics !== 'undefined') {
  analytics.track('AB Test Assignment', {
    testId,
    variantId,
    timestamp: new Date().toISOString()
  });
}
```