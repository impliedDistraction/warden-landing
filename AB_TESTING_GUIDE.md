# AB Testing System for Warden Landing Page

This comprehensive AB testing system enables you to test different variants of content across all sections of the landing page. It's designed to integrate seamlessly with the existing config-driven architecture while providing powerful analytics and variant management capabilities.

## 🎯 Overview

The AB testing system consists of:
- **Configuration system** for defining tests and variants
- **Variant selection engine** with weighted distribution
- **React hooks** for easy component integration
- **Analytics tracking** with Vercel Analytics integration
- **Local storage & cookie persistence** for consistent user experience
- **Debug tools** for development and testing

## 📁 File Structure

```
src/
├── ab-testing.config.ts       # Test definitions and configurations
├── ab-testing.utils.ts        # Core AB testing logic and utilities
├── hooks/
│   └── useABTest.ts          # React hooks for AB testing
└── components/
    ├── ABTestEnabledHeroSection.tsx    # AB test-enabled Hero section
    └── ABTestEnabledCTASection.tsx     # AB test-enabled CTA section
```

## 🚀 Quick Start

### 1. Enable AB Testing (Global Toggle)

AB testing is controlled by a global flag in `ab-testing.config.ts`:

```typescript
export const abTestConfig = {
  enabled: true, // Set to false to disable all AB tests
  debugMode: false, // Set to true for development debugging
  // ... other config
};
```

### 2. Use in React Components

The simplest way to add AB testing to any section:

```tsx
import { useHeroABTest } from '../hooks/useABTest';

function MyHeroSection() {
  const { config, trackConversion, trackInteraction } = useHeroABTest();
  
  // Use config values or fallback to defaults
  const title = config?.title || "Default Title";
  const subtitle = config?.subtitle || "Default Subtitle";
  
  const handleCTAClick = () => {
    trackConversion({ cta_text: title });
  };
  
  return (
    <div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <button onClick={handleCTAClick}>Click Me</button>
    </div>
  );
}
```

### 3. Replace Existing Components

To enable AB testing on existing sections, simply replace the component import:

```tsx
// Before
import { EnhancedHeroSection } from '../components/EnhancedHeroSectionV2.tsx';

// After  
import { ABTestEnabledHeroSection } from '../components/ABTestEnabledHeroSection.tsx';
```

## 🧪 Currently Available Tests

### Hero Section Test (`hero-messaging-test`)
- **Original**: "Mining is still dangerous. We're building guardians who never blink."
- **Alternative**: "Protecting those who still dare to dig. A new era of mining has begun."
- **Split**: 50/50
- **Tracks**: CTA clicks, quote interactions, heading views

### Mission Section Test (`mission-approach-test`) 
- **Current** (60%): Statistics-focused messaging with official MSHA data
- **Aspirational** (40%): Future-focused messaging about mining without loss
- **Tracks**: Section engagement, stat interactions

### CTA Section Test (`cta-messaging-test`)
- **Mission Focus** (33%): "Join the Mission" / "Back the Mission"
- **Tech Focus** (33%): "See Our Technology" / "Learn More"  
- **Community Focus** (34%): "Join Our Community" / "Get Involved"
- **Tracks**: Form submissions, field interactions, social link clicks

## 📊 Analytics & Tracking

### Automatic Event Tracking

The system automatically tracks these events:
- `ab_variant_assigned` - When a user is assigned to a variant
- `ab_variant_viewed` - When a variant is displayed  
- `ab_variant_conversion` - When a conversion action occurs
- `ab_variant_interaction` - When a user interacts with variant content

### Manual Conversion Tracking

```tsx
// Track specific conversions
trackConversion('form_submission', { 
  form_type: 'contact',
  variant_heading: heading 
});

// Track interactions
trackInteraction('button_hover', { 
  button_text: 'Learn More' 
});
```

### View Analytics in Vercel

Events are automatically sent to Vercel Analytics. View them in your Vercel dashboard under Analytics > Events.

## 🛠️ Creating New Tests

### Step 1: Define the Test

Add your test to `ab-testing.config.ts`:

```typescript
export const myNewTest: ABTest = {
  testId: 'my-section-test',
  name: 'My Section Content Test',
  description: 'Testing different approaches for my section',
  enabled: true,
  defaultVariant: 'original',
  variants: [
    {
      id: 'original',
      name: 'Original Version',
      weight: 50,
      config: {
        heading: "Original Heading",
        subtitle: "Original subtitle text",
        // ... your content configuration
      }
    },
    {
      id: 'alternative',
      name: 'Alternative Version', 
      weight: 50,
      config: {
        heading: "Alternative Heading",
        subtitle: "Alternative subtitle text",
        // ... your alternative configuration
      }
    }
  ]
};

// Add to registry
export const abTestRegistry = {
  hero: heroABTest,
  mission: missionABTest,
  cta: ctaABTest,
  mySection: myNewTest, // Add your test here
};
```

### Step 2: Create Component Hook

Add a convenience hook in `hooks/useABTest.ts`:

```typescript
export function useMyNewABTest(userId?: string) {
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sectionConfig = getVariantConfig('my-section-test', userId);
    setConfig(sectionConfig);
    setIsLoading(false);
  }, [userId]);

  const trackMyConversion = (metadata?: Record<string, any>) => {
    trackConversion('my-section-test', 'my_conversion', metadata);
  };

  return { config, isLoading, trackConversion: trackMyConversion };
}
```

### Step 3: Update Your Component

```tsx
import { useMyNewABTest } from '../hooks/useABTest';

function MySection() {
  const { config, trackConversion } = useMyNewABTest();
  
  const heading = config?.heading || "Default Heading";
  const subtitle = config?.subtitle || "Default Subtitle";
  
  return (
    <div>
      <h2>{heading}</h2>
      <p>{subtitle}</p>
      <button onClick={() => trackConversion()}>
        Convert!
      </button>
    </div>
  );
}
```

## 🔧 Advanced Configuration

### Weighted Distribution

Control traffic allocation with weights (must add up to 100 or less):

```typescript
variants: [
  { id: 'control', weight: 60 },    // 60% of users
  { id: 'variant-a', weight: 30 },  // 30% of users  
  { id: 'variant-b', weight: 10 }   // 10% of users
]
```

### User Targeting (Future)

The system supports user segmentation:

```typescript
export const abTestConfig = {
  segments: {
    returning: {
      name: 'Returning Visitors',
      rules: [{ type: 'cookie_exists', value: 'returning_visitor' }],
      tests: ['hero-messaging-test']
    },
    mobile: {
      name: 'Mobile Users', 
      rules: [{ type: 'screen_width', operator: '<', value: 768 }],
      tests: ['cta-messaging-test']
    }
  }
};
```

### Test Scheduling

Control when tests run:

```typescript
export const heroABTest: ABTest = {
  // ... other config
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-02-01'),
};
```

## 🐛 Debugging & Development

### Enable Debug Mode

Set `debugMode: true` in `abTestConfig` to:
- Log all AB test events to console
- Access global debugging functions
- See detailed variant assignment info

### Debug Console Commands

When debug mode is enabled, these are available in browser console:

```javascript
// Get current AB test state
ABTesting.getDebugInfo();

// Force a specific variant (debug only)
ABTesting.forceVariant('hero-messaging-test', 'protective-focus');

// Track test conversion
ABTesting.trackConversion('hero-messaging-test', 'debug_conversion');

// Track interaction  
ABTesting.trackInteraction('hero-messaging-test', 'debug_click', { test: true });
```

### View Current Assignments

```javascript
// See which variants the current user is assigned to
console.log(ABTesting.getDebugInfo().currentVariants);
```

## 📈 Performance Considerations

### Client-Side Only
- Variant selection happens client-side to avoid hydration issues
- Initial render shows default/fallback content
- Variants load immediately after hydration (< 100ms)

### Caching Strategy
- Assignments stored in localStorage + cookies
- 30-day persistence (configurable)
- Consistent experience across sessions

### Minimal Bundle Impact
- Lazy loading of AB test logic
- Tree-shaking friendly exports
- ~3KB gzipped for full system

## 🔄 Migration Guide

### From Static to AB Tested

1. **Identify sections** you want to test
2. **Extract current content** to AB test config as 'original' variant  
3. **Create alternative variants** with different messaging
4. **Replace component imports** with AB-enabled versions
5. **Add analytics tracking** to measure performance
6. **Monitor results** and iterate

### Backwards Compatibility

AB test components accept the same props as original components, ensuring backwards compatibility:

```tsx
// This still works
<ABTestEnabledHeroSection 
  title="Fallback Title"
  subtitle="Fallback Subtitle" 
/>

// AB test config overrides props when available
// Falls back to props when AB testing disabled
```

## 📊 Results Analysis

### Key Metrics to Track

1. **Conversion Rate**: Form submissions / unique visitors
2. **Engagement Rate**: Interactions / page views  
3. **Click-Through Rate**: CTA clicks / CTA views
4. **Time on Section**: How long users spend in each section
5. **Bounce Rate**: Users who leave after viewing one section

### Statistical Significance

For reliable results:
- **Minimum sample size**: 100 conversions per variant
- **Test duration**: At least 1-2 weeks
- **Confidence level**: 95% (p < 0.05)
- **Effect size**: Look for >10% difference between variants

### Tools for Analysis

1. **Vercel Analytics**: Built-in event tracking  
2. **Google Analytics**: Enhanced ecommerce tracking
3. **Segment**: Customer data platform integration
4. **Custom dashboards**: Build your own analysis tools

## 🚀 Deployment

### Environment Variables

No additional environment variables required - the system works out of the box with Vercel Analytics.

### Production Checklist

- [ ] Set `debugMode: false` in production
- [ ] Verify analytics tracking is working  
- [ ] Test variant assignment persistence
- [ ] Confirm conversion tracking accuracy
- [ ] Check mobile device compatibility
- [ ] Validate analytics dashboard setup

## 🔮 Future Enhancements

Planned improvements:
- **Server-side variant selection** for SEO optimization
- **Real-time dashboard** for monitoring test performance  
- **Automatic statistical significance** calculation
- **Multi-variate testing** support (testing multiple elements simultaneously)
- **Behavioral targeting** based on user actions
- **Integration with external tools** (Optimizely, VWO, etc.)

## 🤝 Contributing

To add new AB tests or improve the system:

1. **Follow the patterns** established in existing tests
2. **Add TypeScript types** for new configuration options
3. **Include analytics tracking** for meaningful metrics
4. **Test thoroughly** across devices and browsers
5. **Document your changes** in this guide

## 🆘 Troubleshooting

### Common Issues

**Variants not showing**: Check if AB testing is enabled globally and the specific test is enabled.

**Analytics not tracking**: Verify Vercel Analytics is properly configured and events are being sent.

**Inconsistent assignment**: Clear localStorage and cookies, check for caching issues.

**Hydration mismatches**: Ensure fallback content is provided for server-side rendering.

**TypeScript errors**: Check that all config interfaces match the expected types.

### Getting Help

1. Check browser console for AB testing debug logs
2. Verify network requests to analytics endpoints
3. Test in incognito mode to simulate new users
4. Use debug mode to inspect variant assignments
5. Review analytics dashboard for data collection

---

**Need help?** Create an issue in the repository or check the troubleshooting section above!