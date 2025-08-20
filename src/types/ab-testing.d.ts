// Type declarations for AB Testing system
// This ensures TypeScript knows about our global extensions

declare global {
  interface Window {
    va?: (event: string, type: string, data?: Record<string, any>) => void;
    ABTesting?: {
      getDebugInfo: () => any;
      forceVariant: (testId: string, variantId: string) => void;
      getVariant: (testId: string, userId?: string) => any;
      trackConversion: (testId: string, conversionType?: string, metadata?: Record<string, any>) => void;
      trackInteraction: (testId: string, interactionType: string, metadata?: Record<string, any>) => void;
    };
  }
}

export {};