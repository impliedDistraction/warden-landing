// AB Testing Utilities for Warden Landing Page
// Core logic for variant selection, tracking, and analytics

import { 
  abTestRegistry, 
  abTestConfig, 
  ABAnalyticsEvents, 
  type ABTest, 
  type ABVariant, 
  type ABAnalyticsEvent,
  type ABAnalyticsEventType 
} from './ab-testing.config';

// ===== VARIANT SELECTION UTILITIES =====

/**
 * Get or assign a variant for a specific AB test
 */
export function getVariant(testId: string, userId?: string): ABVariant | null {
  const test = getTestByIdFromRegistry(testId);
  if (!test || !test.enabled || !abTestConfig.enabled) {
    return getDefaultVariant(test);
  }

  // Check if variant is already stored in cookie/localStorage
  const storedVariant = getStoredVariant(testId);
  if (storedVariant && isValidVariant(test, storedVariant)) {
    trackAnalyticsEvent(ABAnalyticsEvents.VARIANT_VIEWED, testId, storedVariant);
    return getVariantById(test, storedVariant);
  }

  // Assign new variant based on weights
  const selectedVariant = assignVariantByWeight(test, userId);
  if (selectedVariant) {
    storeVariant(testId, selectedVariant.id);
    trackAnalyticsEvent(ABAnalyticsEvents.VARIANT_ASSIGNED, testId, selectedVariant.id);
    return selectedVariant;
  }

  return getDefaultVariant(test);
}

/**
 * Get variant configuration for a specific test
 */
export function getVariantConfig(testId: string, userId?: string): any {
  const variant = getVariant(testId, userId);
  return variant?.config || null;
}

/**
 * Get the test configuration from registry
 */
function getTestByIdFromRegistry(testId: string): ABTest | null {
  return Object.values(abTestRegistry).find(test => test.testId === testId) || null;
}

/**
 * Get variant by ID from test
 */
function getVariantById(test: ABTest, variantId: string): ABVariant | null {
  return test.variants.find(v => v.id === variantId) || null;
}

/**
 * Get the default variant for a test
 */
function getDefaultVariant(test: ABTest | null): ABVariant | null {
  if (!test) return null;
  return getVariantById(test, test.defaultVariant);
}

/**
 * Assign variant based on weighted distribution
 */
function assignVariantByWeight(test: ABTest, userId?: string): ABVariant | null {
  const enabledVariants = test.variants.filter(v => v.weight > 0);
  if (enabledVariants.length === 0) {
    return getDefaultVariant(test);
  }

  // Create a deterministic random number based on userId or fallback to Math.random()
  const random = userId ? hashStringToNumber(userId + test.testId) : Math.random();
  const randomPercent = random * 100;
  
  let cumulativeWeight = 0;
  for (const variant of enabledVariants) {
    cumulativeWeight += variant.weight;
    if (randomPercent <= cumulativeWeight) {
      return variant;
    }
  }

  // Fallback to first variant if weights don't add up properly
  return enabledVariants[0];
}

/**
 * Convert string to deterministic number between 0-1
 */
function hashStringToNumber(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) / Math.pow(2, 31);
}

// ===== STORAGE UTILITIES =====

/**
 * Get stored variant from cookie/localStorage
 */
function getStoredVariant(testId: string): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    // Try localStorage first
    const stored = localStorage.getItem(`ab_${testId}`);
    if (stored) return stored;

    // Fallback to cookie
    const cookieValue = getCookie(abTestConfig.cookieName);
    if (cookieValue) {
      const variants = JSON.parse(cookieValue);
      return variants[testId] || null;
    }
  } catch (e) {
    console.warn('Error getting stored AB variant:', e);
  }
  
  return null;
}

/**
 * Store variant assignment
 */
function storeVariant(testId: string, variantId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Store in localStorage
    localStorage.setItem(`ab_${testId}`, variantId);
    
    // Also store in cookie for server-side access
    const cookieValue = getCookie(abTestConfig.cookieName);
    let variants = {};
    
    if (cookieValue) {
      try {
        variants = JSON.parse(cookieValue);
      } catch (e) {
        variants = {};
      }
    }
    
    variants[testId] = variantId;
    setCookie(abTestConfig.cookieName, JSON.stringify(variants), abTestConfig.cookieExpireDays);
  } catch (e) {
    console.warn('Error storing AB variant:', e);
  }
}

/**
 * Check if variant ID is valid for test
 */
function isValidVariant(test: ABTest, variantId: string): boolean {
  return test.variants.some(v => v.id === variantId);
}

// ===== COOKIE UTILITIES =====

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function setCookie(name: string, value: string, days: number): void {
  if (typeof document === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

// ===== ANALYTICS UTILITIES =====

/**
 * Track AB testing analytics event
 */
function trackAnalyticsEvent(
  type: ABAnalyticsEventType, 
  testId: string, 
  variantId: string, 
  metadata?: Record<string, any>
): void {
  if (!abTestConfig.analyticsEnabled) return;
  
  const event: ABAnalyticsEvent = {
    type,
    testId,
    variantId,
    timestamp: new Date(),
    metadata
  };
  
  // Log for debugging
  if (abTestConfig.debugMode) {
    console.log('[AB Test]', event);
  }
  
  // Send to analytics service (Vercel Analytics in this case)
  if (typeof window !== 'undefined' && window.va) {
    window.va('track', type, {
      test_id: testId,
      variant_id: variantId,
      ...metadata
    });
  }
  
  // Could also send to other analytics services here
}

/**
 * Track conversion event for AB test
 */
export function trackConversion(testId: string, conversionType: string = 'default', metadata?: Record<string, any>): void {
  const variant = getStoredVariant(testId);
  if (variant) {
    trackAnalyticsEvent(ABAnalyticsEvents.VARIANT_CONVERSION, testId, variant, {
      conversion_type: conversionType,
      ...metadata
    });
  }
}

/**
 * Track interaction event for AB test
 */
export function trackInteraction(testId: string, interactionType: string, metadata?: Record<string, any>): void {
  const variant = getStoredVariant(testId);
  if (variant) {
    trackAnalyticsEvent(ABAnalyticsEvents.VARIANT_INTERACTION, testId, variant, {
      interaction_type: interactionType,
      ...metadata
    });
  }
}

// ===== CONVENIENCE FUNCTIONS FOR SPECIFIC TESTS =====

/**
 * Get hero section variant configuration
 */
export function getHeroVariant(userId?: string): any {
  return getVariantConfig('hero-messaging-test', userId);
}

/**
 * Get mission section variant configuration  
 */
export function getMissionVariant(userId?: string): any {
  return getVariantConfig('mission-approach-test', userId);
}

/**
 * Get CTA section variant configuration
 */
export function getCTAVariant(userId?: string): any {
  return getVariantConfig('cta-messaging-test', userId);
}

// ===== DEBUG UTILITIES =====

/**
 * Get debug information about current AB tests
 */
export function getABTestDebugInfo(): any {
  if (typeof window === 'undefined') return {};
  
  const debug = {
    config: abTestConfig,
    tests: abTestRegistry,
    currentVariants: {},
    cookies: getCookie(abTestConfig.cookieName)
  };
  
  Object.keys(abTestRegistry).forEach(key => {
    const test = abTestRegistry[key];
    const variant = getVariant(test.testId);
    debug.currentVariants[test.testId] = {
      variantId: variant?.id,
      variantName: variant?.name,
      config: variant?.config
    };
  });
  
  return debug;
}

/**
 * Force a specific variant for testing (debug only)
 */
export function forceVariant(testId: string, variantId: string): void {
  if (!abTestConfig.debugMode) {
    console.warn('forceVariant only works in debug mode');
    return;
  }
  
  storeVariant(testId, variantId);
  console.log(`Forced variant ${variantId} for test ${testId}`);
}

// Make debug functions available globally in debug mode
if (typeof window !== 'undefined' && abTestConfig.debugMode) {
  window.ABTesting = {
    getDebugInfo: getABTestDebugInfo,
    forceVariant: forceVariant,
    getVariant: getVariant,
    trackConversion: trackConversion,
    trackInteraction: trackInteraction
  };
}