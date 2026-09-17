'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Gamepad2,
  Crosshair,
  ShieldAlert,
  Skull,
  Swords,
  RotateCcw,
  Trophy,
  Flame,
  Heart,
  Laugh,
  CheckCircle2,
  AlertTriangle,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DuoRoast } from '@/lib/types';
import { soundEngine } from '@/lib/audio';
import { useLanguage, CHINESE_DEFAULTS } from '@/lib/i18n';

interface FortniteBanterProps {
  roasts: DuoRoast[];
  partnerName: string;
  senderName: string;
  onUpdateRoasts: (updated: DuoRoast[]) => void;
}

export default function FortniteBanter({
  roasts,
  partnerName,
  senderName,
  onUpdateRoasts,
}: FortniteBanterProps) {
  const { isZh } = useLanguage();
  const [laggingIds, setLaggingIds] = useState<Record<string, boolean>>({});
  const [treatySigned, setTreatySigned] = useState<boolean>(false);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Crosshair':
        return Crosshair;
      case 'ShieldAlert':
        return ShieldAlert;
      case 'Skull':
        return Skull;
      case 'Swords':
        return Swords;
      case 'RotateCcw':
        return RotateCcw;
      case 'Trophy':
        return Trophy;
      case 'Flame':
        return Flame;
      case 'Heart':
        return Heart;
      default:
        return Gamepad2;
    }
  };

  const getRoastData = (roast: DuoRoast) => {
    if (!isZh) return roast;
    const zhMatch = CHINESE_DEFAULTS.roasts.find((r) => r.id === roast.id);
    if (!zhMatch) return roast;
    return {
      ...roast,
      title: zhMatch.title,
      badge: zhMatch.badge,
      situation: zhMatch.situation,
      verdict: zhMatch.verdict,
    };
  };

  const handleVoteGuilty = (id: string) => {
    soundEngine.playUnwrapCelebration();
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f43f5e', '#fb7185', '#fef08a'],
      });
    } catch {
      // Safe fallback
    }

    const updated = roasts.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          guiltyVotes: (r.guiltyVotes || 0) + 1,
          admitted: true,
        };
      }
      return r;
    });
    onUpdateRoasts(updated);
  };

  const handleToggleLagging = (id: string) => {
    soundEngine.playTine(520, 0, 0.3);
    setLaggingIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSignTreaty = () => {
    soundEngine.playUnwrapCelebration();
    setTreatySigned(true);
    try {
      confetti({
        particleCount: 90,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#ec4899', '#e11d48', '#fb7185'],
      });
    } catch {
      // Safe fallback
    }
  };

  return (
    <div id="fortnite-banter-section" className="relative w-full max-w-5xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs tracking-wider uppercase mb-2">
          <Gamepad2 className="w-3.5 h-3.5 text-rose-400" />
          {isZh ? '堡垒之夜双排战报与趣味互损' : 'Fortnite Zero Build Duo Match Report & Banter'}
        </div>
        <h2 className="font-serif-romantic text-3xl sm:text-4xl text-rose-100 font-normal">
          {isZh ? '双排互损殿堂 & 甜蜜战报' : 'Duo Roasts & Hall of Fame'}
        </h2>
        <p className="text-stone-400 text-xs sm:text-sm font-light mt-1">
          {isZh
            ? '致敬那些空掉的喷子子弹、被顺走的大灌桶、空旷大平地上的肉身拉枪线，以及——你永远是我在全宇宙中最无可替代的二号玩家。'
            : 'A loving tribute to whiffed shotgun shots, stolen Chug Jugs, running with zero cover in Zero Build, and why you are still my favorite player 2 in the universe.'}
        </p>
      </div>

      {/* Fortnite Match Report Stat Card */}
      <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#181928] via-[#141522] to-[#1a1526] border border-rose-500/25 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-rose-500/15 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300">
              <Award className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="font-serif-romantic text-lg sm:text-xl text-rose-100 font-medium">
                {isZh ? '官方双排生涯羁绊档案' : 'Official Fortnite Zero Build Career Stats'}
              </h3>
              <p className="text-xs text-stone-400">
                {isZh
                  ? `双排搭档：${senderName} & ${partnerName} • 零建造默契组合`
                  : `Zero Build Duo: ${senderName} & ${partnerName} • Keyboard & Mouse Duo`}
              </p>
            </div>
          </div>
          <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono font-medium">
            {isZh ? '战队状态：S级天生绝配' : 'Status: S-Tier Duo Chemistry'}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-xl bg-[#10111a]/80 border border-rose-500/15">
            <div className="text-xl sm:text-2xl font-bold text-rose-200 font-mono">99+</div>
            <div className="text-[11px] text-stone-400 mt-0.5">
              {isZh ? '躺进决赛圈次数' : 'Times Carried to Top 10'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#10111a]/80 border border-rose-500/15">
            <div className="text-xl sm:text-2xl font-bold text-rose-300 font-mono">2.1%</div>
            <div className="text-[11px] text-stone-400 mt-0.5">
              {isZh ? '重炮喷子描边命中率' : 'Pump Shotgun Accuracy'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#10111a]/80 border border-rose-500/15">
            <div className="text-xl sm:text-2xl font-bold text-rose-200 font-mono">64 - 0</div>
            <div className="text-[11px] text-stone-400 mt-0.5">
              {isZh ? `悬崖重力 vs ${partnerName}` : `Gravity vs ${partnerName}`}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#10111a]/80 border border-rose-500/15">
            <div className="text-xl sm:text-2xl font-bold text-emerald-300 font-mono">10,000%</div>
            <div className="text-[11px] text-stone-400 mt-0.5">
              {isZh ? '忠诚与专属偏爱' : 'Love & Loyalty'}
            </div>
          </div>
        </div>
      </div>

      {/* Roasts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        {roasts.map((roastItem, idx) => {
          const roast = getRoastData(roastItem);
          const Icon = getIcon(roast.iconName);
          const isLagging = laggingIds[roast.id];

          return (
            <motion.div
              key={roast.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-5 rounded-2xl bg-[#151623]/90 border border-rose-500/20 hover:border-rose-400/40 transition-all flex flex-col justify-between shadow-xl relative overflow-hidden group"
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center text-rose-300 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] font-mono font-medium">
                      {roast.badge}
                    </span>
                  </div>

                  {roast.admitted && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {isZh ? '已认罪 🤍' : 'Guilty!'}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-serif-romantic text-lg sm:text-xl text-rose-100 font-medium mb-2 leading-snug">
                  {roast.title}
                </h3>

                {/* Situation */}
                <p className="text-stone-300 text-xs sm:text-sm font-light leading-relaxed mb-3">
                  {roast.situation}
                </p>

                {/* Verdict */}
                <div className="p-3 rounded-xl bg-[#10111c] border border-rose-500/15 mb-4">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-rose-400 font-semibold mb-1 flex items-center gap-1">
                    <Laugh className="w-3 h-3" />
                    {isZh ? '法庭亲昵判决：' : 'The Official Verdict:'}
                  </div>
                  <p className="text-xs text-rose-100 font-serif-romantic italic leading-relaxed">
                    &ldquo;{roast.verdict}&rdquo;
                  </p>
                </div>

                {/* Lagging Defense Toast */}
                {isLagging && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                    <span>
                      {isZh ? (
                        <>
                          <strong>抗辩成立：</strong>延迟999ms、丢包率100%，绝对是键盘按错键啦 :3
                        </>
                      ) : (
                        <>
                          <strong>Defense accepted:</strong> Ping was 999ms, packet loss was 100%, and you definitely fat-fingered the keyboard keys :3
                        </>
                      )}
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-rose-500/10">
                <button
                  onClick={() => handleVoteGuilty(roast.id)}
                  className="flex-1 py-2 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/30 text-rose-200 text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Laugh className="w-3.5 h-3.5 text-rose-400" />
                  <span>
                    {isZh
                      ? `确实有罪，认罚！(${roast.guiltyVotes || 0})`
                      : `Guilty as charged (${roast.guiltyVotes || 0})`}
                  </span>
                </button>

                <button
                  onClick={() => handleToggleLagging(roast.id)}
                  className="py-2 px-3 rounded-xl bg-stone-800/50 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs transition-colors cursor-pointer"
                  title={isZh ? '坚称是网络卡顿！' : 'Claim it was lag!'}
                >
                  {isLagging
                    ? (isZh ? '掉帧啦！😤' : 'Lagged! 😤')
                    : (isZh ? '我那是卡了！！' : 'I was lagging!!')}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Official Duo Treaty Card */}
      <div className="relative p-7 rounded-3xl bg-gradient-to-br from-[#1b172c] via-[#151322] to-[#1f1426] border-2 border-rose-500/30 shadow-2xl shadow-rose-950/50 text-center max-w-xl mx-auto overflow-hidden">
        {/* Soft atmospheric aura */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-rose-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300 mx-auto mb-3 shadow-lg shadow-rose-900/30">
            <Heart className="w-7 h-7 fill-rose-400 text-rose-400 animate-heartbeat" />
          </div>
          <h3 className="font-serif-romantic text-2xl sm:text-3xl text-rose-100 font-medium mb-2 tracking-wide">
            {isZh ? '堡垒之夜双排终身誓约' : 'The Official Fortnite Zero Build Treaty'}
          </h3>
          <p className="text-stone-300 text-xs sm:text-sm font-light leading-relaxed mb-5 px-2">
            {isZh ? (
              <>
                &ldquo;我，<strong className="text-rose-200">{partnerName}</strong>
                ，特此自愿承认将继续空枪、按错键、零建造大平原跑步，并坚持在99甲时把大灌桶全炫光。作为交换，
                <strong className="text-rose-200">{senderName}</strong>{' '}
                承诺哪怕横穿800米毒圈也必定赶去重启车捡我的战术卡，带我吃鸡直到永远。&rdquo;
              </>
            ) : (
              <>
                &ldquo;I, <strong className="text-rose-200">{partnerName}</strong>, hereby agree
                to continue whiffing pump shotgun shots, fat-fingering my keyboard keybinds, running
                in open fields with zero cover in Zero Build, and chugging the entire Chug Jug at 99
                shield. In return, <strong className="text-rose-200">{senderName}</strong> promises
                to always sprint 800 meters across the storm to reboot my card and carry me to victory
                royales forever.&rdquo;
              </>
            )}
          </p>

          {treatySigned ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-950/40"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-bounce" />
              <span>
                {isZh
                  ? '终身誓约已缔结生效，生生世世！💍🏆'
                  : 'Treaty Signed & Sealed for Eternity! 💍🏆'}
              </span>
            </motion.div>
          ) : (
            <button
              onClick={handleSignTreaty}
              className="px-7 py-3 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs sm:text-sm font-medium shadow-xl shadow-rose-950/60 transition-all cursor-pointer inline-flex items-center gap-2 hover:scale-105"
            >
              <Award className="w-4 h-4 animate-pulse" />
              <span>{isZh ? '签署并封存双排誓约 ✍️' : 'Sign & Seal Duo Treaty ✍️'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
