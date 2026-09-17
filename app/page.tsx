'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import StarryBackground from '@/components/StarryBackground';
import ClickHeartsEffect from '@/components/ClickHeartsEffect';
import UnwrapExperience from '@/components/UnwrapExperience';
import SanctuaryHeader from '@/components/SanctuaryHeader';
import ConstellationMilestones from '@/components/ConstellationMilestones';
import LoveLetterView from '@/components/LoveLetterView';
import MemoryPolaroids from '@/components/MemoryPolaroids';
import ReasonsJar from '@/components/ReasonsJar';
import FortniteBanter from '@/components/FortniteBanter';
import CustomizerModal from '@/components/CustomizerModal';
import EditPasswordModal from '@/components/EditPasswordModal';
import { initialGiftData } from '@/lib/defaultData';
import { GiftData, DuoRoast, MemoryPolaroid, Milestone } from '@/lib/types';
import { Heart, RefreshCw, Edit3 } from 'lucide-react';
import { soundEngine } from '@/lib/audio';
import { persistGiftData, loadInitialGiftData, LOCAL_STORAGE_KEY } from '@/lib/storageSync';
import { useLanguage } from '@/lib/i18n';

const emptySubscribe = () => () => {};

function loadLocalCachedGiftData(): GiftData {
  if (typeof window === 'undefined') return initialGiftData;
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // Safe fallback
  }
  return initialGiftData;
}

export default function GiftHomePage() {
  const { isZh } = useLanguage();
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [giftData, setGiftData] = useState<GiftData>(() => {
    return loadLocalCachedGiftData();
  });
  const [hasUnwrapped, setHasUnwrapped] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'constellation' | 'letter' | 'memories' | 'reasons' | 'roasts'>('constellation');
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);
  const [isEditUnlocked, setIsEditUnlocked] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return sessionStorage.getItem('gift_edit_auth') === 'deep';
    } catch {
      return false;
    }
  });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const pendingActionRef = React.useRef<(() => void) | null>(null);

  // Guard all edit triggers behind secret passcode 'deep'
  const requireEditAuth = (action: () => void) => {
    if (isEditUnlocked) {
      action();
    } else {
      pendingActionRef.current = action;
      setIsPasswordModalOpen(true);
    }
  };

  const handlePasswordSuccess = () => {
    setIsEditUnlocked(true);
    try {
      sessionStorage.setItem('gift_edit_auth', 'deep');
    } catch {
      // Storage unavailable
    }
    if (pendingActionRef.current) {
      const fn = pendingActionRef.current;
      pendingActionRef.current = null;
      fn();
    }
  };

  const handleLockEdits = () => {
    setIsEditUnlocked(false);
    try {
      sessionStorage.removeItem('gift_edit_auth');
    } catch {
      // Storage unavailable
    }
    setIsCustomizerOpen(false);
    soundEngine.playTine(320, 0, 0.4);
  };

  // Hydrate from server filesystem on mount to ensure all photos and customizations are loaded
  useEffect(() => {
    let isMounted = true;
    loadInitialGiftData()
      .then((serverData) => {
        if (isMounted && serverData) {
          setGiftData(serverData);
        }
      })
      .catch((err) => {
        console.warn('Could not load gift data from server:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Save changes to both browser cache and permanent server disk
  const handleSaveData = async (newData: GiftData) => {
    setGiftData(newData);
    try {
      const persisted = await persistGiftData(newData);
      if (persisted) {
        setGiftData(persisted);
      }
    } catch (e) {
      console.warn('Temporary sync notice, local changes preserved:', e);
    }
  };

  const handleUpdateRoasts = (updated: DuoRoast[]) => {
    const updatedData = { ...giftData, roasts: updated };
    handleSaveData(updatedData);
  };

  const handleUpdateMemories = (updated: MemoryPolaroid[]) => {
    const updatedData = { ...giftData, memories: updated };
    handleSaveData(updatedData);
  };

  const handleUpdateMilestones = (updated: Milestone[]) => {
    const updatedData = { ...giftData, milestones: updated };
    handleSaveData(updatedData);
  };

  const handleReliveUnwrap = () => {
    soundEngine.playChime();
    setHasUnwrapped(false);
  };

  if (!isClient) {
    return (
      <main id="app-root" className="relative min-h-screen bg-[#090a0f] text-[#E0E2EC] overflow-x-hidden">
        <StarryBackground />
      </main>
    );
  }

  return (
    <main id="app-root" className="relative min-h-screen bg-[#090a0f] text-[#E0E2EC] overflow-x-hidden selection:bg-rose-500/30 selection:text-rose-200">
      {/* Interactive Starlit Sky Background */}
      <StarryBackground />

      {/* Romantic Click Sparkles & Floating Hearts */}
      <ClickHeartsEffect />

      {/* Initial Wax Seal Unwrap Experience */}
      {!hasUnwrapped && (
        <UnwrapExperience
          partnerName={giftData.partnerName}
          senderName={giftData.senderName}
          welcomeGreeting={giftData.welcomeGreeting}
          onUnwrapComplete={() => setHasUnwrapped(true)}
        />
      )}

      {/* Main Sanctuary Experience */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Sticky Sanctuary Header */}
        <SanctuaryHeader
          partnerName={giftData.partnerName}
          anniversaryDate={giftData.anniversaryDate}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenCustomizer={() => requireEditAuth(() => setIsCustomizerOpen(true))}
          isEditMode={false}
          isEditUnlocked={isEditUnlocked}
          onLockEdits={handleLockEdits}
        />

        {/* Dynamic Views based on active tab */}
        <div className="flex-1 py-4 sm:py-8">
          {activeTab === 'constellation' && (
            <ConstellationMilestones
              milestones={giftData.milestones}
              partnerName={giftData.partnerName}
              onUpdateMilestones={handleUpdateMilestones}
              isEditUnlocked={isEditUnlocked}
              onRequestEditAuth={requireEditAuth}
            />
          )}

          {activeTab === 'letter' && (
            <LoveLetterView
              partnerName={giftData.partnerName}
              senderName={giftData.senderName}
              letter={giftData.loveLetter}
            />
          )}

          {activeTab === 'memories' && (
            <MemoryPolaroids
              memories={giftData.memories}
              partnerName={giftData.partnerName}
              onOpenAddMemory={() => requireEditAuth(() => setIsCustomizerOpen(true))}
              onUpdateMemories={handleUpdateMemories}
              isEditUnlocked={isEditUnlocked}
              onRequestEditAuth={requireEditAuth}
            />
          )}

          {activeTab === 'reasons' && (
            <ReasonsJar
              reasons={giftData.reasons}
              partnerName={giftData.partnerName}
            />
          )}

          {activeTab === 'roasts' && (
            <FortniteBanter
              roasts={giftData.roasts || initialGiftData.roasts || []}
              partnerName={giftData.partnerName}
              senderName={giftData.senderName}
              onUpdateRoasts={handleUpdateRoasts}
            />
          )}
        </div>

        {/* Emotional Sanctuary Footer */}
        <footer className="relative z-20 border-t border-rose-500/15 py-8 px-4 text-center bg-[#090a0f]/80 backdrop-blur-md mt-auto">
          <div className="max-w-md mx-auto space-y-3">
            <div className="flex items-center justify-center gap-2 text-rose-400">
              <Heart className="w-4 h-4 fill-rose-400 animate-pulse" />
              <span className="font-script text-2xl text-rose-300">
                {isZh ? '此生相伴 · 唯你唯一' : 'Forever & Always'}
              </span>
              <Heart className="w-4 h-4 fill-rose-400 animate-pulse" />
            </div>

            <p className="text-xs text-stone-400 font-light">
              {isZh
                ? `满怀无尽爱意为 ${giftData.partnerName} 专属定制。在亿万星辰构筑的浩瀚夜空中，唯有你是我永恒的归宿。`
                : `Crafted with endless love for ${giftData.partnerName}. In a universe of infinite stars, you are my only home.`}
            </p>

            <div className="flex items-center justify-center gap-4 text-xs text-stone-500 pt-2">
              <button
                onClick={handleReliveUnwrap}
                className="hover:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{isZh ? '重温启封拆信' : 'Relive Opening Envelope'}</span>
              </button>
              <span>•</span>
              <button
                onClick={() => requireEditAuth(() => setIsCustomizerOpen(true))}
                className="hover:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>
                  {isZh
                    ? (isEditUnlocked ? '个性化定制' : '专属定制 (加密保护)')
                    : (isEditUnlocked ? 'Customize Details' : 'Customize (Protected)')}
                </span>
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Secret Passcode Verification Modal */}
      <EditPasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          pendingActionRef.current = null;
        }}
        onSuccess={handlePasswordSuccess}
      />

      {/* Customization Studio Modal */}
      <CustomizerModal
        key={isCustomizerOpen ? `customizer-${giftData.updatedAt || '0'}` : 'closed'}
        isOpen={isCustomizerOpen && isEditUnlocked}
        onClose={() => setIsCustomizerOpen(false)}
        giftData={giftData}
        onSave={handleSaveData}
      />
    </main>
  );
}
