'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '@/lib/audio';
import { useLanguage } from '@/lib/i18n';
import ScaryPumpkin from '@/components/ScaryPumpkin';

interface UnwrapExperienceProps {
  partnerName: string;
  senderName: string;
  welcomeGreeting: string;
  onUnwrapComplete: () => void;
}

export default function UnwrapExperience({
  partnerName,
  senderName,
  welcomeGreeting,
  onUnwrapComplete,
}: UnwrapExperienceProps) {
  const { isZh } = useLanguage();
  const [isOpening, setIsOpening] = useState(false);
  const [sealCracked, setSealCracked] = useState(false);

  const handleOpen = () => {
    if (isOpening) return;
    setIsOpening(true);

    // Audio cue
    soundEngine.playHeartbeat();
    setTimeout(() => {
      setSealCracked(true);
      soundEngine.playUnwrapCelebration();

      // Confetti burst of rose petals and gold stars
      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f43f5e', '#fb7185', '#fbcfe8', '#fef08a', '#fda4af'],
          shapes: ['circle'],
          scalar: 1.2,
        });
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#fda4af', '#f43f5e', '#ffe4e6'],
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#fda4af', '#f43f5e', '#ffe4e6'],
          });
        }, 350);
      } catch {
        // Fallback safe
      }

      setTimeout(() => {
        onUnwrapComplete();
      }, 1600);
    }, 450);
  };

  return (
    <div
      id="unwrap-experience"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-[#090a0f]/95 backdrop-blur-xl overflow-hidden"
    >
      {/* Gentle floating ambient glow circles */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
        className="text-center max-w-lg mx-auto mb-8 z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs tracking-widest uppercase mb-4">
          <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/30 animate-pulse" />
          {isZh ? '来自心底的专属之礼' : 'A Special Delivery For You'}
        </div>

        <h1 className="font-serif-romantic text-4xl sm:text-5xl md:text-6xl text-rose-100 font-normal tracking-wide leading-tight mb-3">
          {isZh ? `致 ${partnerName}` : `For ${partnerName}`}
        </h1>

        <p className="text-stone-300 text-sm sm:text-base font-light max-w-md mx-auto leading-relaxed italic">
          &ldquo;{welcomeGreeting}&rdquo;
        </p>
      </motion.div>

      {/* The Romantic Vintage Wax-Sealed Envelope */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative w-full max-w-sm sm:max-w-md perspective-1000 z-10"
      >
        {/* Subtle rotating celestial halo rings framing the envelope */}
        <div className="absolute -inset-10 sm:-inset-14 rounded-full border border-rose-500/10 pointer-events-none animate-celestial" />
        <div className="absolute -inset-6 sm:-inset-8 rounded-full border border-dashed border-rose-400/15 pointer-events-none animate-celestial-reverse" />

        <div
          id="envelope-wrapper"
          onClick={handleOpen}
          className={`group cursor-pointer relative bg-gradient-to-b from-[#1d1b28] via-[#161522] to-[#12111a] border border-rose-500/25 rounded-3xl shadow-2xl p-6 sm:p-8 transition-all duration-700 select-none ${
            isOpening
              ? 'scale-105 shadow-rose-500/30'
              : 'hover:scale-[1.02] hover:border-rose-400/50 hover:shadow-rose-950/60'
          }`}
        >
          {/* Glowing starlight corner badges */}
          <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-rose-400/40 animate-ping" />
          <div className="absolute bottom-3 right-3 w-2 h-2 rounded-full bg-rose-400/40 animate-ping" style={{ animationDelay: '1.2s' }} />

          {/* Subtle envelope fold design */}
          <div className="relative border border-rose-300/15 rounded-2xl bg-gradient-to-b from-[#181622]/90 to-[#12111a]/95 p-6 sm:p-8 text-center overflow-hidden">
            {/* Ribbon accents with specular shine */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-12 bg-gradient-to-r from-transparent via-rose-500/15 to-transparent pointer-events-none" />

            <div className="flex flex-col items-center justify-center py-6">
              <span className="font-script text-3xl sm:text-4xl text-rose-300/90 mb-2 drop-shadow-sm">
                {isZh ? '纸短情长 · 吻你万千' : 'With All My Heart'}
              </span>
              <p className="text-xs tracking-widest text-stone-400 uppercase font-sans-clean">
                {isZh ? `寄信人：${senderName}` : `From ${senderName}`}
              </p>

              {/* The Interactive Wax Seal Stamp */}
              <div className="relative my-8">
                {/* Outer seal glow aura */}
                <div className="absolute -inset-4 rounded-full bg-rose-500/20 blur-md pointer-events-none animate-pulse" />

                <motion.div
                  animate={
                    !isOpening
                      ? {
                          scale: [1, 1.07, 1],
                          boxShadow: [
                            '0 0 20px rgba(225, 29, 72, 0.4)',
                            '0 0 35px rgba(225, 29, 72, 0.7)',
                            '0 0 20px rgba(225, 29, 72, 0.4)',
                          ],
                        }
                      : { scale: 1.18 }
                  }
                  transition={{ repeat: Infinity, duration: 2.6 }}
                  className={`w-20 h-20 sm:w-22 sm:h-22 rounded-full flex items-center justify-center shadow-2xl border-2 border-rose-200/50 transition-colors duration-300 relative ${
                    sealCracked
                      ? 'bg-gradient-to-br from-amber-500 via-rose-600 to-rose-800'
                      : 'bg-gradient-to-br from-rose-500 via-rose-700 to-rose-950'
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {sealCracked ? (
                      <motion.div
                        key="cracked"
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="text-amber-100"
                      >
                        <Heart className="w-9 h-9 fill-rose-100 text-rose-100 filter drop-shadow-md" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="heart"
                        initial={{ scale: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="flex flex-col items-center justify-center text-rose-100"
                      >
                        <Heart className="w-8 h-8 fill-rose-100 text-rose-100 filter drop-shadow" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Realistic Wax drip details */}
                  <div className="absolute -bottom-1.5 -right-1 w-5 h-5 rounded-full bg-rose-700/90 blur-[0.5px]" />
                  <div className="absolute -top-1.5 -left-1 w-4 h-4 rounded-full bg-rose-700/90 blur-[0.5px]" />
                </motion.div>
              </div>

              <div className="flex items-center gap-2 text-rose-300/90 text-xs sm:text-sm font-medium tracking-wide">
                <Gift className="w-4 h-4 text-rose-400 animate-bounce" />
                <span>
                  {isOpening
                    ? (isZh ? '正在为你展开专属星空...' : 'Unfolding our universe...')
                    : (isZh ? '轻触火漆印拆开信笺' : 'Tap the wax seal to open')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Gentle hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1 }}
        className="text-xs text-stone-500 mt-6 tracking-wide"
      >
        <Sparkles className="inline-block w-3 h-3 mr-1 text-rose-400/70" />
        {isZh ? '点击任意处可沉浸式体验' : 'Crafted with endless love'}
      </motion.p>

      {/* Atmospheric Scary Pumpkins matched to the cosmic dark-wine palette */}
      <div className="fixed bottom-4 left-4 sm:bottom-8 sm:left-8 z-50 pointer-events-auto">
        <ScaryPumpkin side="left" size="md" rotation={16} />
      </div>

      <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 pointer-events-auto">
        <ScaryPumpkin side="right" size="md" rotation={-16} />
      </div>
    </div>
  );
}
