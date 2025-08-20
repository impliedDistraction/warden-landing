import React from 'react';
import { motion } from 'framer-motion';
import { AnimatedSection, TechButton } from './FramerMotionComponents.tsx';
import { useCTAABTest } from '../hooks/useABTest';

interface CTAFormProps {
  emailPlaceholder?: string;
  messagePlaceholder?: string;
  submitText?: string;
  action?: string;
}

interface CTAProps {
  // Default props (fallback)
  heading?: string;
  subtitle?: string;
  form?: CTAFormProps;
}

export const ABTestEnabledCTASection: React.FC<CTAProps> = ({ 
  heading: defaultHeading = "Join the Mission",
  subtitle: defaultSubtitle = "Help us build AI systems that protect lives and honor the Earth.",
  form: defaultForm = {
    emailPlaceholder: "Enter your email",
    messagePlaceholder: "Tell us how you'd like to help...",
    submitText: "Back the Mission",
    action: "https://formspree.io/f/mdkdpgvn"
  }
}) => {
  const { config, isLoading, trackConversion, trackInteraction } = useCTAABTest();
  
  // Use AB test config if available, otherwise use defaults/original site config
  const heading = config?.heading || defaultHeading;
  const subtitle = config?.subtitle || defaultSubtitle; 
  const form = {
    emailPlaceholder: config?.form?.emailPlaceholder || defaultForm.emailPlaceholder,
    messagePlaceholder: config?.form?.messagePlaceholder || defaultForm.messagePlaceholder,
    submitText: config?.form?.submitText || defaultForm.submitText,
    action: config?.form?.action || defaultForm.action
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    trackConversion({ 
      submit_text: form.submitText,
      variant_heading: heading,
      form_action: form.action
    });
    
    // Let the form submit naturally
  };

  const handleFormInteraction = (field: string) => {
    trackInteraction('form_field_focus', { field });
  };

  const handleHeadingView = () => {
    trackInteraction('heading_view', { heading_text: heading });
  };

  return (
    <section id="join" className="py-20 bg-gradient-to-br from-gray-900 via-black to-blue-900/20 relative overflow-hidden scroll-snap-section min-h-screen flex items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <motion.div 
          animate={{ 
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(45deg, transparent 49%, rgba(59, 130, 246, 0.1) 50%, rgba(59, 130, 246, 0.1) 51%, transparent 52%),
              linear-gradient(-45deg, transparent 49%, rgba(34, 197, 94, 0.1) 50%, rgba(34, 197, 94, 0.1) 51%, transparent 52%)
            `,
            backgroundSize: '30px 30px'
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 relative w-full">
        <div className="text-center mb-16">
          <AnimatedSection direction="up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/30 rounded-full text-green-300 text-sm font-medium mb-6 font-mono">
              <motion.span
                animate={{ rotate: [0, 180, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                🛡️
              </motion.span>
              <span className="tracking-wide">JOIN.THE.MISSION</span>
            </div>

            {/* AB Test Tracked Heading */}
            <motion.h2
              className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-green-400 to-blue-500 bg-clip-text text-transparent mb-6 tracking-tight"
              onViewportEnter={handleHeadingView}
            >
              {heading}
            </motion.h2>

            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          </AnimatedSection>
        </div>

        {/* Contact Form with AB Test Tracking */}
        <AnimatedSection direction="up" delay={0.2}>
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 md:p-12 shadow-2xl">
            <form 
              action={form.action} 
              method="POST"
              onSubmit={handleFormSubmit}
              className="space-y-6"
            >
              {/* Email Input */}
              <motion.div
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder={form.emailPlaceholder}
                  onFocus={() => handleFormInteraction('email')}
                  className="w-full px-4 py-4 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </motion.div>

              {/* Message Input */}
              <motion.div
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                  How would you like to help?
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder={form.messagePlaceholder}
                  onFocus={() => handleFormInteraction('message')}
                  className="w-full px-4 py-4 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                />
              </motion.div>

              {/* Submit Button with AB Test Text */}
              <div className="pt-4">
                <TechButton
                  type="submit"
                  className="w-full group relative bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-500 hover:to-green-500 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  <span className="flex items-center justify-center gap-3">
                    {form.submitText}
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-xl"
                    >
                      →
                    </motion.span>
                  </span>
                  
                  {/* Button Glow Effect */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600/20 to-green-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                </TechButton>
              </div>
            </form>

            {/* Trust Indicators */}
            <div className="mt-8 pt-8 border-t border-gray-700/50">
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">🔒</span>
                  <span>Your privacy is protected</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">💻</span>
                  <span>100% open source development</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">🚫</span>
                  <span>No spam, ever</span>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Social Proof / Next Steps */}
        <AnimatedSection direction="up" delay={0.4}>
          <div className="mt-12 text-center">
            <p className="text-gray-400 mb-6">Join the community building the future of mining safety</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="https://discord.gg/tMK9S68bjQ" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => trackInteraction('discord_link_click')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-lg transition-all duration-300"
              >
                <span>💬</span>
                <span>Join Discord</span>
              </a>
              <a 
                href="https://github.com/Earthform-AI" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => trackInteraction('github_link_click')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-lg transition-all duration-300"
              >
                <span>🔗</span>
                <span>Follow on GitHub</span>
              </a>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};