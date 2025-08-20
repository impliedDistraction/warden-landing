import React from 'react';
import { motion } from 'framer-motion';
import { AnimatedSection, TechButton, AnimatedCounter } from './FramerMotionComponents.tsx';
import { ParallaxSection, ScrollLinkedAnimation, TextReveal } from './ScrollDrivenComponents.tsx';
import { useHeroABTest } from '../hooks/useABTest';

interface HeroProps {
  // Default props (fallback)
  title?: string;
  subtitle?: string;
  quote?: string;
  cta?: {
    text: string;
    link: string;
  };
}

export const ABTestEnabledHeroSection: React.FC<HeroProps> = ({ 
  title: defaultTitle = "Warden: The Shield in the Deep",
  subtitle: defaultSubtitle = "Mining is still dangerous. We're building guardians who never blink.",
  quote: defaultQuote = "Mining can't be rewritten overnight—but we can begin with intelligence, respect, and armor.",
  cta: defaultCta = { text: "Join the Mission", link: "#join" }
}) => {
  const { config, isLoading, trackConversion, trackInteraction } = useHeroABTest();
  
  // Use AB test config if available, otherwise use defaults
  const title = config?.title || defaultTitle;
  const subtitle = config?.subtitle || defaultSubtitle;
  const quote = config?.quote || defaultQuote;
  const cta = config?.cta || defaultCta;

  const handleCTAClick = () => {
    trackConversion({ cta_text: cta.text, cta_link: cta.link });
    trackInteraction('cta_click', { cta_text: cta.text });
  };

  const handleQuoteInteraction = () => {
    trackInteraction('quote_read', { quote_length: quote.length });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-black via-gray-900/50 to-black scroll-snap-section">
      {/* Background Pattern */}
      <ParallaxSection speed={0.2} className="absolute inset-0 opacity-20">
        <motion.div 
          animate={{ 
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(45deg, transparent 24%, rgba(59, 130, 246, 0.1) 25%, rgba(59, 130, 246, 0.1) 26%, transparent 27%, transparent 74%, rgba(59, 130, 246, 0.1) 75%, rgba(59, 130, 246, 0.1) 76%, transparent 77%, transparent),
              linear-gradient(-45deg, transparent 24%, rgba(34, 197, 94, 0.1) 25%, rgba(34, 197, 94, 0.1) 26%, transparent 27%, transparent 74%, rgba(34, 197, 94, 0.1) 75%, rgba(34, 197, 94, 0.1) 76%, transparent 77%, transparent)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </ParallaxSection>
      
      {/* Tech Grid Overlay - Hidden on mobile to avoid interference */}
      <div className="absolute inset-0 hidden lg:block pointer-events-none overflow-hidden">
        {/* Scanning Lines */}
        <motion.div
          className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"
          animate={{ 
            y: [0, 800],
            opacity: [0, 1, 0]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "linear",
            delay: 0
          }}
        />
        
        {/* Multiple Scanning Lines with different timings */}
        <motion.div
          className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-green-500/20 to-transparent"
          animate={{ 
            x: [100, -800],
            opacity: [0, 1, 0]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "linear",
            delay: 2
          }}
        />
        
        {/* Tech Grid */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-px h-full bg-blue-500/20"
              style={{ left: `${(i + 1) * 5}%` }}
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ 
                duration: 3 + Math.random() * 2, 
                repeat: Infinity, 
                delay: Math.random() * 2 
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 md:px-8 max-w-6xl mx-auto">
        <AnimatedSection className="space-y-6">
          {/* Title with Enhanced Animation */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-2"
          >
            {/* Title */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
              <TextReveal 
                text={title}
                className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent drop-shadow-2xl"
              />
            </h1>
            
            {/* Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <p className="text-xl md:text-2xl lg:text-3xl font-light text-gray-200 max-w-4xl mx-auto leading-relaxed">
                {subtitle}
              </p>
            </motion.div>
          </motion.div>

          {/* Quote Section with Interaction Tracking */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="my-12"
            onMouseEnter={handleQuoteInteraction}
            onTouchStart={handleQuoteInteraction}
          >
            <blockquote className="relative">
              <div className="absolute -top-4 -left-4 text-6xl text-blue-400/20 font-serif">"</div>
              <p className="text-lg md:text-xl text-gray-300 italic max-w-3xl mx-auto leading-relaxed font-light">
                {quote}
              </p>
              <div className="absolute -bottom-4 -right-4 text-6xl text-blue-400/20 font-serif">"</div>
            </blockquote>
          </motion.div>

          {/* CTA Section with AB Test Tracking */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="pt-8"
          >
            <TechButton
              onClick={handleCTAClick}
              className="group relative px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <a 
                href={cta.link}
                className="flex items-center gap-3"
              >
                {cta.text}
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-xl"
                >
                  →
                </motion.span>
              </a>
              
              {/* Button Glow Effect */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600/20 to-blue-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
            </TechButton>
          </motion.div>

          {/* Stats Bar - Enhanced with Counters */}
          <ScrollLinkedAnimation className="mt-16 pt-16 border-t border-gray-700/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">
                  <AnimatedCounter end={2024} duration={2} />
                </div>
                <p className="text-sm text-gray-400">Active Development</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.6 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">
                  <AnimatedCounter end={100} duration={2} suffix="%" />
                </div>
                <p className="text-sm text-gray-400">Open Source</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6, duration: 0.6 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">
                  <AnimatedCounter end={24} duration={2} suffix="/7" />
                </div>
                <p className="text-sm text-gray-400">Always Watching</p>
              </motion.div>
            </div>
          </ScrollLinkedAnimation>
        </AnimatedSection>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-6 h-10 border-2 border-gray-400/50 rounded-full flex justify-center">
          <motion.div
            className="w-1 h-3 bg-blue-400 rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
};