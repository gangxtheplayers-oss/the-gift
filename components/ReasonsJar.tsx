'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Scroll, Smile, Coffee, Sun, Compass, X, Shuffle } from 'lucide-react';
import { LoveReason } from '@/lib/types';
import { soundEngine } from '@/lib/audio';
import { useLanguage, CHINESE_DEFAULTS } from '@/lib/i18n';

interface ReasonsJarProps {
  reasons: LoveReason[];
  partnerName: string;
}

export default function ReasonsJar({ reasons, partnerName }: ReasonsJarProps) {
  const { isZh } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<'all' | 'smile' | 'comfort' | 'heart' | 'future'>('all');
  const [selectedReason, setSelectedReason] = useState<LoveReason | null>(null);
  const [openedCount, setOpenedCount] = useState<Record<string, boolean>>({});
  const [isShaking, setIsShaking] = useState(false);

  const categories = [
    { id: 'all', label: isZh ? '全部便签' : 'All Notes', icon: Scroll },
    { id: 'smile', label: isZh ? '想要微笑时' : 'When You Need a Smile', icon: Smile },
    { id: 'comfort', label: isZh ? '需要温柔拥抱时' : 'When You Need Comfort', icon: Coffee },
    { id: 'heart', label: isZh ? '来自心底的告白' : 'From My Deepest Heart', icon: Heart },
    { id: 'future', label: isZh ? '关于未来的约定' : 'Our Future Dreams', icon: Compass },
  ] as const;

  const getReasonText = (r: LoveReason) => {
    if (!isZh) return r.text;
    const zhMatch = CHINESE_DEFAULTS.reasons.find((item) => item.id === r.id);
    return zhMatch ? zhMatch.text : r.text;
  };

  const filtered = activeCategory === 'all'
    ? reasons
    : reasons.filter((r) => r.category === activeCategory);

  const handleOpenReason = (r: LoveReason) => {
    soundEngine.playChime();
    setSelectedReason(r);
    setOpenedCount((prev) => ({ ...prev, [r.id]: true }));
  };

  const handlePickRandom = () => {
    setIsShaking(true);
    soundEngine.playTine(659.25, 0, 0.4);
    setTimeout(() => soundEngine.playTine(830.61, 0, 0.4), 150);
    setTimeout(() => {
      setIsShaking(false);
      const rand = filtered[Math.floor(Math.random() * filtered.length)] || reasons[0];
      handleOpenReason(rand);
    }, 450);
  };

  const unlockedCount = Object.keys(openedCount).length;

  return (
    <div id="reasons-jar-section" className="relative w-full max-w-5xl mx-auto py-6 px-4">
      {/* Header & Animated Glass Jar Showcase */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 bg-gradient-to-b from-[#181926]/90 via-[#13141f]/90 to-[#0e0f17]/95 border border-rose-500/20 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Soft background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs tracking-wider uppercase mb-3">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/40 animate-pulse" />
            {isZh ? '装满爱意的浪漫胶囊' : 'Little Capsules of Devotion'}
          </div>
          <h2 className="font-serif-romantic text-3xl sm:text-4xl text-rose-100 font-normal">
            {isZh ? '写给你的心动盲盒' : 'The Jar of 100 Reasons'}
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm font-light mt-2 leading-relaxed">
            {isZh
              ? `玻璃罐里的每一张折叠纸条，都写着一个我如此深爱 ${partnerName} 的笃定理由。轻点下方的折纸便签，或摇动玻璃罐随机抽取。`
              : `Every folded note inside this glass jar holds an eternal truth about why ${partnerName} has my whole heart. Tap any origami capsule below or shake the jar to draw one at random.`}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              id="pick-random-note-btn"
              onClick={handlePickRandom}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-600 via-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs sm:text-sm font-medium shadow-lg shadow-rose-950/60 transition-all cursor-pointer hover:scale-105"
            >
              <Shuffle className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
              <span>{isZh ? '摇一摇 · 抽取便签' : 'Shake Jar & Pick Note'}</span>
            </button>

            <span className="text-xs text-stone-400 font-mono">
              {isZh ? (
                <>
                  已拆开 <strong className="text-rose-300">{unlockedCount}</strong> / {reasons.length} 个理由
                </>
              ) : (
                <>
                  <strong className="text-rose-300">{unlockedCount}</strong> / {reasons.length} discovered
                </>
              )}
            </span>
          </div>
        </div>

        {/* Animated Glass Jar Vessel */}
        <motion.div
          animate={
            isShaking
              ? {
                  rotate: [-8, 8, -6, 6, -3, 3, 0],
                  scale: [1, 1.05, 1],
                }
              : {
                  y: [0, -4, 0],
                }
          }
          transition={
            isShaking
              ? { duration: 0.5 }
              : { repeat: Infinity, duration: 4.5, ease: 'easeInOut' }
          }
          onClick={handlePickRandom}
          className="relative cursor-pointer group select-none shrink-0"
          title={isZh ? '点击摇一摇玻璃罐！' : 'Click to shake the jar!'}
        >
          {/* Outer glow ring */}
          <div className="absolute -inset-4 rounded-3xl bg-rose-500/20 blur-xl group-hover:bg-rose-500/30 transition-all pointer-events-none" />

          {/* Glass Jar Body */}
          <div className="relative w-32 h-44 sm:w-36 sm:h-48 rounded-b-3xl rounded-t-xl bg-gradient-to-b from-white/15 via-rose-500/10 to-rose-950/40 border-2 border-rose-300/40 shadow-2xl backdrop-blur-md flex flex-col items-center justify-between p-3 overflow-hidden">
            {/* Wooden Cork Stopper */}
            <div className="absolute -top-3 w-16 h-5 rounded-t-md bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900 border border-amber-600/50 shadow-sm" />

            {/* Twine ribbon with tiny heart tag */}
            <div className="absolute top-2 w-full flex items-center justify-center">
              <div className="w-24 h-1 bg-amber-200/40 rounded-full" />
              <div className="absolute -top-1 w-3 h-3 rounded-full bg-rose-500 border border-white/60 flex items-center justify-center shadow-xs">
                <Heart className="w-1.5 h-1.5 fill-white text-white" />
              </div>
            </div>

            {/* Specular glass reflections */}
            <div className="absolute left-2 top-4 bottom-4 w-1 bg-gradient-to-b from-white/60 via-white/20 to-transparent rounded-full pointer-events-none" />
            <div className="absolute right-3 top-6 bottom-8 w-0.5 bg-gradient-to-b from-white/30 to-transparent rounded-full pointer-events-none" />

            {/* Floating Origami Hearts & Stars inside Jar */}
            <div className="relative w-full h-full flex flex-wrap items-center justify-center gap-2 pt-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <motion.div
                  key={`mini-jar-heart-${i}`}
                  animate={{
                    y: [0, -6 - (i % 3) * 2, 0],
                    rotate: [0, (i % 2 === 0 ? 12 : -12), 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.5 + i * 0.4,
                    ease: 'easeInOut',
                  }}
                  className={`w-5 h-5 rounded-md flex items-center justify-center shadow-xs ${
                    i % 3 === 0
                      ? 'bg-rose-500/80 text-white'
                      : i % 3 === 1
                      ? 'bg-amber-300/80 text-amber-950'
                      : 'bg-pink-400/80 text-white'
                  }`}
                >
                  <Heart className="w-3 h-3 fill-current" />
                </motion.div>
              ))}
            </div>

            <span className="text-[10px] font-mono tracking-wider text-rose-200/80 uppercase mt-auto">
              {isZh ? '轻摇盲盒' : 'Tap to shake'}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 no-scrollbar">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                soundEngine.playTine(783.99, 0, 0.5);
                setActiveCategory(cat.id);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-200 shadow-sm'
                  : 'bg-[#141520] border-rose-500/10 text-stone-400 hover:text-stone-200 hover:border-rose-500/30'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Progress pill */}
      <div className="mb-6 flex items-center justify-between text-xs text-stone-400 bg-[#141520]/80 border border-rose-500/15 rounded-2xl px-4 py-2">
        <span>
          {isZh ? '已启封便签：' : 'Discovered so far: '}
          <strong className="text-rose-300">{unlockedCount}</strong> / {reasons.length}
        </span>
        <span className="font-script text-base text-rose-300">
          {isZh ? '句句皆是真心话' : 'Each one is 100% true'}
        </span>
      </div>

      {/* Origami Love Capsules Grid */}
      <div
        className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 transition-transform duration-300 ${
          isShaking ? 'animate-bounce' : ''
        }`}
      >
        {filtered.map((reason, idx) => {
          const isOpened = openedCount[reason.id];
          const text = getReasonText(reason);
          return (
            <motion.div
              key={reason.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.04 }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleOpenReason(reason)}
              className={`group cursor-pointer relative p-4 rounded-2xl border transition-all duration-300 text-center flex flex-col items-center justify-center min-h-[120px] shadow-lg ${
                isOpened
                  ? 'bg-[#181a29]/90 border-rose-500/30 text-rose-200'
                  : 'bg-gradient-to-b from-[#1b1c2a] to-[#12131e] border-rose-500/15 hover:border-rose-400/50 hover:shadow-rose-900/20'
              }`}
            >
              {/* Origami fold visual design */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-fuchsia-500/10 border border-rose-500/30 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    isOpened ? 'fill-rose-400 text-rose-400' : 'text-rose-300'
                  }`}
                />
              </div>

              <span className="text-[11px] font-mono tracking-wider text-stone-400 uppercase">
                {isZh ? `便签 #${idx + 1}` : `Note #${idx + 1}`}
              </span>

              <span className="text-xs text-rose-200/90 font-medium mt-1 line-clamp-1">
                {isOpened ? text : (isZh ? '轻点展开' : 'Tap to unfold')}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Unfolded Love Note Modal */}
      <AnimatePresence>
        {selectedReason && (
          <div
            id="reason-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedReason(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, rotate: -2 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.85, opacity: 0, rotate: 2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-[#fefbf6] to-[#f7f2e9] text-stone-900 p-8 sm:p-10 shadow-2xl shadow-rose-950/60 border border-rose-200"
            >
              {/* Cute patterned washi tape */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-rose-300/60 backdrop-blur-xs rotate-[1deg] border border-rose-400/40 shadow-xs" />

              <button
                onClick={() => setSelectedReason(null)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <span className="font-script text-2xl sm:text-3xl text-rose-600 block mb-1">
                  {isZh ? '爱你的心动理由' : 'Why I Love You'}
                </span>

                <div className="w-12 h-0.5 bg-rose-300 mx-auto my-3" />

                <p className="font-serif-romantic text-2xl sm:text-3xl text-stone-800 leading-relaxed font-normal my-6">
                  &ldquo;{getReasonText(selectedReason)}&rdquo;
                </p>

                <div className="pt-4 border-t border-stone-300/70 flex items-center justify-between text-xs text-stone-500 font-sans-clean">
                  <span>{isZh ? '执子之手' : 'Forever & always'}</span>
                  <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                  <span>{isZh ? '与子偕老' : 'Only yours'}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
