'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Flame, Copy, Check, Feather, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '@/lib/audio';
import { useLanguage, CHINESE_DEFAULTS } from '@/lib/i18n';
import { initialGiftData } from '@/lib/defaultData';

interface LoveLetterViewProps {
  partnerName: string;
  senderName: string;
  letter: {
    title: string;
    content: string;
    writtenDate: string;
    sealColor: string;
  };
}

export default function LoveLetterView({ partnerName, senderName, letter }: LoveLetterViewProps) {
  const { isZh } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [candleLit, setCandleLit] = useState(true);
  const [goldInk, setGoldInk] = useState(false);
  const [stampCount, setStampCount] = useState(0);
  const [isStamping, setIsStamping] = useState(false);

  // If user hasn't custom-edited the default English letter, display the authentic Chinese love letter when in Chinese mode
  const isDefaultLetter =
    letter.title === initialGiftData.loveLetter.title ||
    letter.content.trim() === initialGiftData.loveLetter.content.trim();

  const displayTitle = isZh && isDefaultLetter ? CHINESE_DEFAULTS.loveLetter.title : letter.title;
  const displayContent = isZh && isDefaultLetter ? CHINESE_DEFAULTS.loveLetter.content : letter.content;

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `${displayTitle}\n\n${displayContent}\n\n${isZh ? '永远爱你的，' : 'With all my love,'}\n${senderName}`
    );
    setCopied(true);
    soundEngine.playChime();
    setTimeout(() => setCopied(false), 2500);
  };

  const toggleCandle = () => {
    setCandleLit(!candleLit);
    soundEngine.playTine(candleLit ? 440 : 880, 0, 1.2);
  };

  const toggleGoldInk = () => {
    setGoldInk(!goldInk);
    soundEngine.playTine(goldInk ? 523.25 : 1046.5, 0, 0.5);
  };

  const handlePressSeal = () => {
    if (isStamping) return;
    setIsStamping(true);
    soundEngine.playWaxStamp();
    setStampCount((prev) => prev + 1);

    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#f59e0b', '#fbbf24', '#f43f5e', '#fda4af'],
      });
    } catch {
      // Safe fallback
    }

    setTimeout(() => setIsStamping(false), 500);
  };

  return (
    <div id="love-letter-section" className="relative w-full max-w-3xl mx-auto py-6 px-4">
      {/* Candlelight Atmospheric Ambiance */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs tracking-wider uppercase mb-2">
            <Feather className="w-3 h-3 text-rose-400" />
            {isZh ? '纸短情长 · 见字如面' : 'From My Heart To Yours'}
          </div>
          <h2 className="font-serif-romantic text-3xl sm:text-4xl text-rose-100 font-normal">
            {isZh ? '深情封存的信笺' : 'The Sealed Love Letter'}
          </h2>
        </div>

        {/* Interactive Controls: Candle, Gold Ink, Copy */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={toggleCandle}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 cursor-pointer ${
              candleLit
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-100 shadow-md shadow-amber-500/25'
                : 'bg-stone-900 border-stone-700 text-stone-400'
            }`}
            title={isZh ? '开启/关闭烛光氛围' : 'Toggle candlelight ambiance'}
          >
            {candleLit ? (
              <div className="relative w-3.5 h-4 flex items-center justify-center">
                <span className="absolute w-2 h-2 rounded-full bg-amber-400/60 blur-[2px] animate-ping" />
                <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-flicker" />
              </div>
            ) : (
              <Flame className="w-3.5 h-3.5 text-stone-500" />
            )}
            <span>{candleLit ? (isZh ? '温暖烛光' : 'Candle Flickering') : (isZh ? '点亮烛光' : 'Light Candle')}</span>
          </button>

          <button
            onClick={toggleGoldInk}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 cursor-pointer ${
              goldInk
                ? 'bg-amber-400/25 border-amber-400/60 text-amber-200 shadow-md shadow-amber-500/30'
                : 'bg-[#161722] border-rose-500/25 text-stone-300 hover:text-amber-200 hover:border-amber-400/40'
            }`}
            title={isZh ? '切换鎏金手写体' : 'Toggle enchanted gold calligraphy ink'}
          >
            <Sparkles className={`w-3.5 h-3.5 ${goldInk ? 'text-amber-300 animate-spin' : 'text-stone-400'}`} style={{ animationDuration: '4s' }} />
            <span>{goldInk ? (isZh ? '鎏金墨迹' : 'Gold Foil Inked') : (isZh ? '鎏金笔触' : 'Gold Ink')}</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#161722] border border-rose-500/25 text-stone-300 hover:text-rose-100 hover:border-rose-400/50 transition-colors cursor-pointer"
            title={isZh ? '复制整封情书' : 'Save or copy letter'}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-rose-400" />}
            <span>
              {copied
                ? (isZh ? '已复制到剪贴板' : 'Copied to Clipboard')
                : (isZh ? '珍藏情书' : 'Keep Letter')}
            </span>
          </button>
        </div>
      </div>

      {/* Parchment Love Letter Sheet */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className={`relative rounded-3xl p-8 sm:p-12 md:p-14 border transition-all duration-700 shadow-2xl overflow-hidden ${
          candleLit
            ? 'bg-gradient-to-b from-[#1a1724] via-[#14121d] to-[#100f17] border-amber-500/30 shadow-amber-950/30'
            : 'bg-[#12131c] border-rose-500/20 shadow-rose-950/30'
        }`}
      >
        {/* Soft corner warm candle halo & organic flickering light */}
        {candleLit && (
          <>
            <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-amber-500/15 blur-3xl pointer-events-none animate-flicker" />
            <div className="absolute top-10 right-10 w-2 h-2 rounded-full bg-amber-300/40 blur-[1px] animate-ping" />
          </>
        )}
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

        {/* Delicate golden inner parchment frame */}
        <div className="absolute inset-3 sm:inset-4 rounded-2xl border border-rose-400/10 pointer-events-none" />

        {/* Vintage Paper Header */}
        <div className="relative text-center border-b border-rose-500/20 pb-6 mb-8">
          <span className="font-script text-3xl sm:text-4xl text-rose-300/90 block mb-1">
            {isZh ? '执子之手 · 与子偕老' : 'Forever & Always'}
          </span>
          <h3 className="font-serif-romantic text-2xl sm:text-3xl text-rose-100 font-normal tracking-wide">
            {displayTitle}
          </h3>
          <p className="text-xs font-mono text-stone-400 mt-2 italic">
            {letter.writtenDate} • {isZh ? `致 ${partnerName}` : `For ${partnerName}`}
          </p>
        </div>

        {/* Letter Text with romantic typography & optional gold ink */}
        <div
          className={`relative space-y-6 font-serif-romantic text-lg sm:text-xl md:text-2xl leading-relaxed tracking-wide font-normal whitespace-pre-line text-left transition-colors duration-500 ${
            goldInk
              ? 'text-amber-100 drop-shadow-[0_1px_4px_rgba(251,191,36,0.3)]'
              : 'text-stone-200'
          }`}
        >
          {displayContent}
        </div>

        {/* Letter Sign-off & Interactive Wax Stamp */}
        <div className="relative mt-12 pt-8 border-t border-rose-500/20 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-stone-400 font-sans-clean block mb-1">
              {isZh ? '永远爱你的，' : 'Devotedly Yours,'}
            </span>
            <span className="font-script text-3xl sm:text-4xl text-rose-300">
              {senderName}
            </span>
          </div>

          {/* Interactive Embossed Wax Seal */}
          <motion.button
            onClick={handlePressSeal}
            animate={isStamping ? { scale: [1, 0.88, 1.05, 1], rotate: [0, -4, 4, 0] } : {}}
            transition={{ duration: 0.5 }}
            className="relative flex items-center gap-3 group cursor-pointer select-none text-left p-2 rounded-2xl hover:bg-rose-500/5 transition-all"
            title={isZh ? '点击加盖火漆印章' : 'Tap to stamp wax seal!'}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg border border-rose-300/40 relative group-hover:scale-105 transition-transform"
              style={{
                background: `radial-gradient(circle at 35% 35%, #f43f5e, ${letter.sealColor || '#be123c'}, #881337)`,
                boxShadow: '0 4px 14px rgba(225, 29, 72, 0.45)',
              }}
            >
              <Heart className="w-6 h-6 fill-rose-100 text-rose-100 filter drop-shadow animate-pulse" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-rose-900/90 blur-[0.5px]" />
            </div>
            <div>
              <div className="text-xs text-rose-200/90 font-medium group-hover:text-rose-100 flex items-center gap-1">
                <span>
                  {stampCount > 0
                    ? (isZh ? `已加盖真爱火漆 (${stampCount})` : `Stamped with Love (${stampCount})`)
                    : (isZh ? '真爱火漆印记' : 'Sealed with Love')}
                </span>
                <Sparkles className="w-3 h-3 text-amber-300" />
              </div>
              <div className="text-[11px] text-stone-400 font-light">
                {stampCount > 0
                  ? (isZh ? '永恒烙印在心' : 'Pressed into eternal wax')
                  : (isZh ? '轻触加盖火漆印章' : 'Tap to press wax stamp')}
              </div>
            </div>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
