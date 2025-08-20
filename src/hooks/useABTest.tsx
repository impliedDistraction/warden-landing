// React Hook for AB Testing in Warden Landing Page Components
// Provides easy integration with React components for AB test variants

import React, { useState, useEffect } from 'react';
import { 
  getVariant, 
  getVariantConfig, 
  trackConversion, 
  trackInteraction,
  getHeroVariant,
  getMissionVariant,
  getCTAVariant
} from '../ab-testing.utils';
import { type ABVariant } from '../ab-testing.config';

// ===== MAIN AB TESTING HOOK =====

/**
 * Main hook for AB testing functionality
 */
export function useABTest(testId: string, userId?: string) {
  const [variant, setVariant] = useState<ABVariant | null>(null);
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get variant on client side only to avoid hydration mismatches
    const selectedVariant = getVariant(testId, userId);
    const variantConfig = selectedVariant?.config || null;
    
    setVariant(selectedVariant);
    setConfig(variantConfig);
    setIsLoading(false);
  }, [testId, userId]);

  const trackTestConversion = (conversionType: string = 'default', metadata?: Record<string, any>) => {
    trackConversion(testId, conversionType, metadata);
  };

  const trackTestInteraction = (interactionType: string, metadata?: Record<string, any>) => {
    trackInteraction(testId, interactionType, metadata);
  };

  return {
    variant,
    config,
    isLoading,
    variantId: variant?.id || null,
    variantName: variant?.name || null,
    trackConversion: trackTestConversion,
    trackInteraction: trackTestInteraction
  };
}

// ===== SPECIFIC SECTION HOOKS =====

/**
 * Hook for Hero section AB testing
 */
export function useHeroABTest(userId?: string) {
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const heroConfig = getHeroVariant(userId);
    setConfig(heroConfig);
    setIsLoading(false);
  }, [userId]);

  const trackHeroConversion = (metadata?: Record<string, any>) => {
    trackConversion('hero-messaging-test', 'hero_cta_click', metadata);
  };

  const trackHeroInteraction = (interactionType: string, metadata?: Record<string, any>) => {
    trackInteraction('hero-messaging-test', interactionType, metadata);
  };

  return {
    config,
    isLoading,
    trackConversion: trackHeroConversion,
    trackInteraction: trackHeroInteraction
  };
}

/**
 * Hook for Mission section AB testing
 */
export function useMissionABTest(userId?: string) {
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const missionConfig = getMissionVariant(userId);
    setConfig(missionConfig);
    setIsLoading(false);
  }, [userId]);

  const trackMissionConversion = (metadata?: Record<string, any>) => {
    trackConversion('mission-approach-test', 'mission_engagement', metadata);
  };

  const trackMissionInteraction = (interactionType: string, metadata?: Record<string, any>) => {
    trackInteraction('mission-approach-test', interactionType, metadata);
  };

  return {
    config,
    isLoading,
    trackConversion: trackMissionConversion,
    trackInteraction: trackMissionInteraction
  };
}

/**
 * Hook for CTA section AB testing
 */
export function useCTAABTest(userId?: string) {
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const ctaConfig = getCTAVariant(userId);
    setConfig(ctaConfig);
    setIsLoading(false);
  }, [userId]);

  const trackCTAConversion = (metadata?: Record<string, any>) => {
    trackConversion('cta-messaging-test', 'form_submission', metadata);
  };

  const trackCTAInteraction = (interactionType: string, metadata?: Record<string, any>) => {
    trackInteraction('cta-messaging-test', interactionType, metadata);
  };

  return {
    config,
    isLoading,
    trackConversion: trackCTAConversion,
    trackInteraction: trackCTAInteraction
  };
}

// ===== UTILITY HOOKS =====

/**
 * Hook for tracking AB test events easily
 */
export function useABTestTracking(testId: string) {
  const trackTestConversion = (conversionType: string = 'default', metadata?: Record<string, any>) => {
    trackConversion(testId, conversionType, metadata);
  };

  const trackTestInteraction = (interactionType: string, metadata?: Record<string, any>) => {
    trackInteraction(testId, interactionType, metadata);
  };

  return {
    trackConversion: trackTestConversion,
    trackInteraction: trackTestInteraction
  };
}

// ===== HIGHER-ORDER COMPONENT FOR AB TESTING =====

/**
 * HOC that provides AB test variant to a component
 */
export function withABTest<P extends object>(
  WrappedComponent: React.ComponentType<P & { abTestVariant?: any; abTestTracking?: any }>,
  testId: string
) {
  return function ABTestWrapper(props: P) {
    const { config, isLoading, trackConversion, trackInteraction } = useABTest(testId);
    
    if (isLoading) {
      // Return the component with default props while loading
      return <WrappedComponent {...props} />;
    }

    return (
      <WrappedComponent 
        {...props} 
        abTestVariant={config}
        abTestTracking={{ trackConversion, trackInteraction }}
      />
    );
  };
}

// ===== AB TEST PROVIDER CONTEXT (Optional) =====

import { createContext, useContext } from 'react';

interface ABTestContextType {
  trackConversion: (testId: string, conversionType?: string, metadata?: Record<string, any>) => void;
  trackInteraction: (testId: string, interactionType: string, metadata?: Record<string, any>) => void;
}

const ABTestContext = createContext<ABTestContextType | undefined>(undefined);

/**
 * Provider component for AB testing context
 */
export function ABTestProvider({ children }: { children: React.ReactNode }) {
  const contextValue: ABTestContextType = {
    trackConversion: (testId: string, conversionType: string = 'default', metadata?: Record<string, any>) => {
      trackConversion(testId, conversionType, metadata);
    },
    trackInteraction: (testId: string, interactionType: string, metadata?: Record<string, any>) => {
      trackInteraction(testId, interactionType, metadata);
    }
  };

  return (
    <ABTestContext.Provider value={contextValue}>
      {children}
    </ABTestContext.Provider>
  );
}

/**
 * Hook to use AB test context
 */
export function useABTestContext() {
  const context = useContext(ABTestContext);
  if (context === undefined) {
    throw new Error('useABTestContext must be used within an ABTestProvider');
  }
  return context;
}