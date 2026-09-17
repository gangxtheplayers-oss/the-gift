'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Heart,
  Edit3,
  Compass,
  Mail,
  Camera,
  Scroll,
  Gamepad2,
  Lock,
  Unlock,
  Languages,
} from 'lucide-react';
import { soundEngine } from '@/lib/audio';
import { useLanguage } from '@/lib/i18n';

interface SanctuaryHeaderProps {
  partnerName: string;
  anniversaryDate: string;
  activeTab: 'constellation' | 'letter' | 'memories' | 'reasons' | 'roasts';
  setActiveTab: (tab: 'constellation' | 'letter' | 'memories' | 'reasons' | 'roasts') => void;
  onOpenCustomizer: () => void;
  isEditMode: boolean;
  isEditUnlocked?: boolean;
  onLockEdits?: () => void;
}

export default function SanctuaryHeader({
  partnerName,
  anniversaryDate,
  activeTab,
  setActiveTab,
  onOpenCustomizer,
  isEditUnlocked = false,
  onLockEdits,
}: SanctuaryHeaderProps) {
  const { t, toggleLang, isZh } = useLanguage();

  // Live counter state
  const [timeElapsed, setTimeElapsed] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(anniversaryDate).getTime();
      const now = Date.now();
      const diff = Math.max(0, now - start);

      const seconds = Math.floor((diff / 1000) % 60);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      setTimeElapsed({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [anniversaryDate]);

  const tabs = [
    { id: 'constellation' as const, label: t('tabJourney'), icon: Compass },
    { id: 'letter' as const, label: t('tabLetter'), icon: Mail },
    { id: 'memories' as const, label: t('tabMemories'), icon: Camera },
    { id: 'reasons' as const, label: t('tabReasons'), icon: Scroll },
    { id: 'roasts' as const, label: t('tabRoasts'), icon: Gamepad2 },
  ];

  return (
    <header
      id="sanctuary-header"
      className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#0b0c12]/85 border-b border-rose-500/20 shadow-lg shadow-black/40 transition-all"
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Brand & Days Counter */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-rose-600/40 to-pink-500/20 border border-rose-400/40 shadow-inner">
              <Heart className="w-5 h-5 text-rose-400 fill-rose-500 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-lg md:text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-pink-100 to-rose-300">
                  {t('brandTitle')}
                </h1>
                <span className="hidden sm:inline-block text-xs font-serif italic text-rose-300/75">
                  {t('forPartner', { name: partnerName })}
                </span>
              </div>
              {/* Exquisite real-time celestial ticker */}
              <div className="text-[11px] sm:text-xs text-stone-300 font-mono flex items-center gap-1 mt-0.5">
                <span className="px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-500/30 text-rose-300 font-semibold shadow-2xs">
                  {timeElapsed.days}d
                </span>
                <span className="px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-500/30 text-rose-300 font-semibold shadow-2xs">
                  {timeElapsed.hours}h
                </span>
                <span className="px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-500/30 text-rose-300 font-semibold shadow-2xs">
                  {timeElapsed.minutes}m
                </span>
                <span className="px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-500/30 text-rose-300 font-semibold shadow-2xs animate-pulse">
                  {timeElapsed.seconds}s
                </span>
                <span className="text-stone-400 text-[10px] sm:text-[11px] ml-1 font-sans-clean">
                  {isZh ? '相恋时光' : 'of pure love'}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Right Controls: Language & Customizer */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              id="mobile-lang-btn"
              onClick={toggleLang}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs font-medium hover:bg-rose-900/40 transition-colors cursor-pointer"
              title={isZh ? 'Switch to English' : '切换为中文'}
            >
              <Languages className="w-3.5 h-3.5 text-rose-400" />
              <span>{isZh ? 'EN' : '中文'}</span>
            </button>

            <button
              id="mobile-customizer-btn"
              onClick={onOpenCustomizer}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-rose-600/20 border border-rose-500/30 text-rose-200 text-xs font-medium hover:bg-rose-600/30 transition-colors"
            >
              {isEditUnlocked ? (
                <Edit3 className="w-3.5 h-3.5 text-rose-300" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-rose-300/80" />
              )}
              <span>{t('personalizeBtn')}</span>
            </button>
          </div>
        </div>

        {/* Center: Navigation Pill Tabs */}
        <nav
          id="sanctuary-nav"
          className="flex items-center gap-1 p-1 rounded-full bg-[#151620] border border-rose-500/20 overflow-x-auto max-w-full no-scrollbar shadow-inner"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => {
                  soundEngine.playChime();
                  setActiveTab(tab.id);
                }}
                className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-rose-100 shadow-sm'
                    : 'text-stone-400 hover:text-rose-200 hover:bg-stone-800/40'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-600/90 to-rose-700 border border-rose-400/40 shadow-md shadow-rose-900/30"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <Icon className={`w-3.5 h-3.5 z-10 ${isActive ? 'text-rose-100' : 'text-stone-400'}`} />
                <span className="z-10">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right (Desktop): Language Switcher & Customizer Studio */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Language Switcher Button */}
          <button
            id="desktop-lang-toggle"
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#151622] hover:bg-[#1f2133] border border-rose-500/25 text-rose-200 text-xs font-medium transition-all shadow-sm cursor-pointer hover:border-rose-400/50"
            title={isZh ? 'Switch to English' : '切换为中文'}
          >
            <Languages className="w-3.5 h-3.5 text-rose-400" />
            <span className="tracking-wide">{isZh ? 'English' : '中文'}</span>
          </button>

          {/* Personalization Button with Password Lock State */}
          <div className="flex items-center gap-2">
            {isEditUnlocked && onLockEdits && (
              <button
                type="button"
                onClick={onLockEdits}
                title={t('lockTooltip')}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium hover:bg-emerald-500/25 transition-all cursor-pointer"
              >
                <Unlock className="w-3 h-3 text-emerald-400" />
                <span>{t('unlockedBadge')}</span>
              </button>
            )}

            <button
              id="desktop-customizer-btn"
              onClick={onOpenCustomizer}
              title={isEditUnlocked ? t('personalizeGiftBtn') : t('personalizeBtn')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-rose-600/30 to-fuchsia-600/20 border border-rose-500/40 text-rose-200 text-xs font-medium hover:from-rose-600/40 hover:to-fuchsia-600/30 hover:border-rose-400 transition-all shadow-sm cursor-pointer"
            >
              {isEditUnlocked ? (
                <Edit3 className="w-3.5 h-3.5 text-rose-300" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-rose-300/80" />
              )}
              <span>{isEditUnlocked ? t('personalizeGiftBtn') : t('personalizeBtn')}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
