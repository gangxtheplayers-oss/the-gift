'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  Heart,
  Calendar,
  X,
  ChevronRight,
  ChevronLeft,
  List,
  Orbit,
  UploadCloud,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Camera,
  Edit2,
  Plus,
  Trash2,
  Move,
  Sliders,
  Check,
  Lock,
} from 'lucide-react';
import { Milestone } from '@/lib/types';
import { soundEngine } from '@/lib/audio';
import { isImageFile } from '@/lib/imageUtils';
import { uploadImageDirect } from '@/lib/storageSync';
import { useLanguage, CHINESE_DEFAULTS } from '@/lib/i18n';
import ScaryPumpkin from '@/components/ScaryPumpkin';

interface ConstellationMilestonesProps {
  milestones: Milestone[];
  partnerName: string;
  onUpdateMilestones?: (updated: Milestone[]) => void;
  isEditUnlocked?: boolean;
  onRequestEditAuth?: (onSuccess: () => void) => void;
}

export default function ConstellationMilestones({
  milestones,
  partnerName,
  onUpdateMilestones,
  isEditUnlocked = false,
  onRequestEditAuth,
}: ConstellationMilestonesProps) {
  const { isZh } = useLanguage();
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const rawSelectedMilestone = milestones.find((m) => m.id === selectedMilestoneId) || null;
  const [viewMode, setViewMode] = useState<'constellation' | 'timeline'>('constellation');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isEditingModalStar, setIsEditingModalStar] = useState(false);
  const [draggingStarId, setDraggingStarId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingOverMilestonePhoto, setIsDraggingOverMilestonePhoto] = useState(false);
  const [dropTargetTimelineId, setDropTargetTimelineId] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const skyRef = useRef<HTMLDivElement>(null);
  const milestoneFileInputRef = useRef<HTMLInputElement>(null);

  const getMilestoneData = (m: Milestone) => {
    if (!isZh) return m;
    const zhMatch = CHINESE_DEFAULTS.milestones.find((z) => z.id === m.id);
    if (zhMatch) {
      return {
        ...m,
        title: zhMatch.title,
        date: zhMatch.date,
        description: zhMatch.description,
      };
    }
    return m;
  };

  const selectedMilestone = rawSelectedMilestone ? getMilestoneData(rawSelectedMilestone) : null;

  const handleUploadMilestonePhoto = async (targetMilestoneId: string, file: File) => {
    if (!isImageFile(file)) return;
    setIsUploadingPhoto(true);
    soundEngine.playTine(600, 0, 0.4);

    try {
      const durableUrl = await uploadImageDirect(file);
      const updated = milestones.map((m) => {
        if (m.id === targetMilestoneId) {
          return { ...m, photoUrl: durableUrl };
        }
        return m;
      });

      if (onUpdateMilestones) {
        onUpdateMilestones(updated);
      }

      soundEngine.playChime();
      setUploadNotice(isZh ? '照片已成功附带至此星辰！' : 'Photo attached to star successfully!');
      setTimeout(() => setUploadNotice(null), 3500);
    } catch (err) {
      console.error('Failed to attach photo to milestone:', err);
    } finally {
      setIsUploadingPhoto(false);
      setIsDraggingOverMilestonePhoto(false);
      setDropTargetTimelineId(null);
    }
  };

  const handleStarClick = (m: Milestone) => {
    if (isDragging) return;
    soundEngine.playChime();
    setSelectedMilestoneId(m.id);
    setIsEditingModalStar(false);
  };

  const handleNext = () => {
    if (!rawSelectedMilestone) return;
    const idx = milestones.findIndex((m) => m.id === rawSelectedMilestone.id);
    const next = milestones[(idx + 1) % milestones.length];
    handleStarClick(next);
  };

  const handlePrev = () => {
    if (!rawSelectedMilestone) return;
    const idx = milestones.findIndex((m) => m.id === rawSelectedMilestone.id);
    const prev = milestones[(idx - 1 + milestones.length) % milestones.length];
    handleStarClick(prev);
  };

  // Add new star
  const handleAddNewStar = (clickX?: number, clickY?: number) => {
    const x = clickX ?? Math.round(Math.random() * 50 + 25);
    const y = clickY ?? Math.round(Math.random() * 50 + 25);

    const newStar: Milestone = {
      id: `m-${Date.now()}`,
      title: isZh ? `星辰 #${milestones.length + 1}` : `Star #${milestones.length + 1}`,
      date: isZh ? '特殊纪念日' : 'Special Moment',
      description: isZh
        ? '漫漫旅途中一颗永恒闪耀的璀璨星辰，照亮我们携手同行的每一步。'
        : 'A glowing milestone in our journey that will shine forever.',
      iconName: 'Sparkles',
      x,
      y,
    };

    const updated = [...milestones, newStar];
    if (onUpdateMilestones) {
      onUpdateMilestones(updated);
    }

    soundEngine.playChime();
    setSelectedMilestoneId(newStar.id);
    setIsEditingModalStar(true);
    setUploadNotice(isZh ? '新星辰已点亮！在下方定制专属回忆。' : 'New star created! Customize its details below.');
    setTimeout(() => setUploadNotice(null), 3500);
  };

  // Delete star
  const handleDeleteStar = (starId: string) => {
    if (milestones.length <= 1) {
      return;
    }

    const updated = milestones.filter((m) => m.id !== starId);
    if (onUpdateMilestones) {
      onUpdateMilestones(updated);
    }

    soundEngine.playTine(440, 0, 0.4);
    if (selectedMilestoneId === starId) {
      setSelectedMilestoneId(null);
      setIsEditingModalStar(false);
    }
  };

  // Update specific field of a star
  const handleUpdateStarField = (starId: string, field: keyof Milestone, value: any) => {
    const updated = milestones.map((m) => {
      if (m.id === starId) {
        return { ...m, [field]: value };
      }
      return m;
    });

    if (onUpdateMilestones) {
      onUpdateMilestones(updated);
    }
  };

  // Pointer drag for stars on sky canvas
  const handleStarPointerDown = (e: React.PointerEvent, starId: string) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    setDraggingStarId(starId);
    setIsDragging(false);
  };

  const handleSkyPointerMove = (e: React.PointerEvent) => {
    if (!draggingStarId || !skyRef.current) return;
    setIsDragging(true);

    const rect = skyRef.current.getBoundingClientRect();
    const newX = Math.round(Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100)));
    const newY = Math.round(Math.max(6, Math.min(94, ((e.clientY - rect.top) / rect.height) * 100)));

    const updated = milestones.map((m) => (m.id === draggingStarId ? { ...m, x: newX, y: newY } : m));
    if (onUpdateMilestones) {
      onUpdateMilestones(updated);
    }
  };

  const handleSkyPointerUp = (e: React.PointerEvent) => {
    if (draggingStarId) {
      soundEngine.playTine(880, 0, 0.35);
      setDraggingStarId(null);
      setTimeout(() => setIsDragging(false), 50);
    }
  };

  const handleSkyBackgroundClick = (e: React.MouseEvent) => {
    if (!isEditMode || !skyRef.current || isDragging) return;

    const rect = skyRef.current.getBoundingClientRect();
    const clickX = Math.round(Math.max(6, Math.min(94, ((e.clientX - rect.left) / rect.width) * 100)));
    const clickY = Math.round(Math.max(8, Math.min(92, ((e.clientY - rect.top) / rect.height) * 100)));

    handleAddNewStar(clickX, clickY);
  };

  return (
    <div id="constellation-section" className="relative w-full max-w-5xl mx-auto py-6 px-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs tracking-wider uppercase mb-2">
            <Heart className="w-3 h-3 text-rose-400 fill-rose-400/30" />
            {isZh ? '漫天星河 · 专属轨迹' : 'Our Starlit Journey'}
          </div>
          <h2 className="font-serif-romantic text-3xl sm:text-4xl text-rose-100 font-normal">
            {isZh ? '我们的星光回忆之旅' : 'The Journey of Us'}
          </h2>
          <p className="text-stone-400 text-xs sm:text-sm font-light mt-1">
            {isZh
              ? '浩瀚夜空中的每一颗星辰，都镌刻着一段让心贴得更紧的瞬间。点击或拖拽星辰，重温我们的故事。'
              : 'Every star in this sky marks a moment that bonded our souls forever. Tap or drag each star to explore and customize.'}
          </p>
        </div>

        {/* View mode & Edit mode toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Constellation Studio Editor Toggle */}
          <button
            onClick={() => {
              if (!isEditMode && !isEditUnlocked && onRequestEditAuth) {
                onRequestEditAuth(() => {
                  setIsEditMode(true);
                  setViewMode('constellation');
                  soundEngine.playTine(659.25, 0, 0.4);
                });
                return;
              }
              const next = !isEditMode;
              setIsEditMode(next);
              if (next) {
                setViewMode('constellation');
                soundEngine.playTine(659.25, 0, 0.4);
              } else {
                soundEngine.playTine(523.25, 0, 0.4);
              }
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
              isEditMode
                ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-950/60 ring-2 ring-rose-400/50 scale-105'
                : 'bg-[#14151f] hover:bg-[#1b1c2b] text-rose-300 border border-rose-500/25 hover:border-rose-400/40'
            }`}
          >
            {isEditMode ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{isZh ? '完成星空编辑' : 'Done Editing Sky'}</span>
              </>
            ) : (
              <>
                {isEditUnlocked ? (
                  <Edit2 className="w-3.5 h-3.5" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-rose-400/80" />
                )}
                <span>
                  {isEditUnlocked
                    ? (isZh ? '编辑星轨之旅' : 'Edit Journey')
                    : (isZh ? '编辑星轨（已锁定）' : 'Edit Journey (Locked)')}
                </span>
              </>
            )}
          </button>

          {/* View mode toggle */}
          <div className="flex items-center bg-[#14151f] border border-rose-500/20 rounded-full p-1 text-xs text-stone-400">
            <button
              onClick={() => setViewMode('constellation')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                viewMode === 'constellation' ? 'bg-rose-600 text-white shadow-sm' : 'hover:text-stone-200'
              }`}
            >
              <Orbit className="w-3.5 h-3.5" />
              <span>{isZh ? '天空星图' : 'Sky Map'}</span>
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                viewMode === 'timeline' ? 'bg-rose-600 text-white shadow-sm' : 'hover:text-stone-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>{isZh ? '时光长轴' : 'Timeline'}</span>
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'constellation' ? (
        /* Constellation Sky Canvas View */
        <div
          id="constellation-sky"
          ref={skyRef}
          onPointerMove={handleSkyPointerMove}
          onPointerUp={handleSkyPointerUp}
          onClick={handleSkyBackgroundClick}
          className={`relative w-full h-[520px] sm:h-[580px] rounded-3xl bg-gradient-to-b from-[#11121d] via-[#0d0e18] to-[#080910] border shadow-2xl shadow-rose-950/40 overflow-hidden p-4 select-none transition-colors ${
            isEditMode ? 'border-rose-400/60 ring-2 ring-rose-500/20 cursor-crosshair' : 'border-rose-500/25'
          }`}
        >
          {/* Rotating celestial coordinate rings & sacred geometry */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-[340px] h-[340px] sm:w-[500px] sm:h-[500px] rounded-full border border-rose-400/30 animate-celestial" />
            <div className="absolute w-[220px] h-[220px] sm:w-[360px] sm:h-[360px] rounded-full border border-dashed border-rose-300/40 animate-celestial-reverse" />
            <div className="absolute w-[120px] h-[120px] sm:w-[200px] sm:h-[200px] rounded-full border border-rose-400/20" />
          </div>

          {/* Ambient nebulas inside sky */}
          <div className="absolute top-1/4 left-1/3 w-64 h-64 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full bg-fuchsia-500/10 blur-3xl pointer-events-none" />

          {/* Studio Banner when in Edit Mode */}
          {isEditMode && (
            <div className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
              <div className="pointer-events-auto flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141524]/90 border border-rose-500/40 text-rose-200 text-xs backdrop-blur-md shadow-xl">
                <Move className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>
                  {isZh ? (
                    <>
                      <strong className="font-semibold text-white">按住星辰拖动</strong> 可调整位置 •{' '}
                      <strong className="font-semibold text-white">点击空白星空</strong> 可添加星辰
                    </>
                  ) : (
                    <>
                      <strong className="font-semibold text-white">Drag stars</strong> to move •{' '}
                      <strong className="font-semibold text-white">Click sky</strong> to place a star
                    </>
                  )}
                </span>
              </div>

              <div className="pointer-events-auto flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddNewStar();
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium shadow-lg shadow-rose-950/60 cursor-pointer transition-all hover:scale-105"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isZh ? '+ 添加新星辰' : '+ Add Star'}</span>
                </button>
              </div>
            </div>
          )}

          {/* SVG Constellation lines connecting milestones */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9f1239" stopOpacity="0.45" />
                <stop offset="50%" stopColor="#e11d48" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#9f1239" stopOpacity="0.45" />
              </linearGradient>
            </defs>

            {/* Connecting dashed constellation lines */}
            {milestones.map((m, idx) => {
              if (idx === milestones.length - 1) return null;
              const next = milestones[idx + 1];
              return (
                <g key={`line-group-${m.id}-${next.id}`}>
                  <line
                    x1={`${m.x}%`}
                    y1={`${m.y}%`}
                    x2={`${next.x}%`}
                    y2={`${next.y}%`}
                    stroke="url(#lineGrad)"
                    strokeWidth={isEditMode ? '2.4' : '1.8'}
                    strokeDasharray="5 4"
                    className="animate-pulse"
                  />
                </g>
              );
            })}
          </svg>

          {/* Milestones Stars on Canvas */}
          {milestones.map((rawMilestone, idx) => {
            const milestone = getMilestoneData(rawMilestone);
            const isDraggingThis = draggingStarId === rawMilestone.id;

            return (
              <div
                key={rawMilestone.id}
                style={{
                  left: `${rawMilestone.x}%`,
                  top: `${rawMilestone.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="absolute z-20"
              >
                <div
                  onPointerDown={(e) => {
                    if (isEditMode) {
                      handleStarPointerDown(e, rawMilestone.id);
                    }
                  }}
                  onClick={() => {
                    if (!isDragging) {
                      handleStarClick(rawMilestone);
                    }
                  }}
                  className={`group relative flex items-center justify-center cursor-pointer transition-transform ${
                    isDraggingThis ? 'scale-125 z-40' : 'hover:scale-115'
                  }`}
                >
                  {/* Dark Cosmic Ambient Halo */}
                  <div className="absolute w-10 h-10 rounded-full bg-rose-950/60 blur-md pointer-events-none" />
                  <div className="absolute w-8 h-8 rounded-full bg-rose-900/30 blur-xs pointer-events-none group-hover:bg-rose-800/40 transition-colors" />

                  {/* Core Star Node - Dark, rich jewel-tone crimson/wine matching the sky */}
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-xl shadow-black/90 transition-all ${
                      isEditMode
                        ? 'bg-[#141525] border border-rose-500/50 text-rose-300 ring-2 ring-rose-500/30'
                        : 'bg-gradient-to-tr from-[#160513] via-[#2a081c] to-rose-950 border border-rose-500/40 text-rose-200 ring-1 ring-rose-500/25 group-hover:border-rose-400/60 group-hover:ring-rose-400/40'
                    }`}
                  >
                    {isEditMode ? (
                      <Move className="w-4 h-4 text-rose-300" />
                    ) : (
                      <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-rose-300/80 text-rose-200 drop-shadow-[0_0_8px_rgba(225,29,72,0.6)] group-hover:scale-110 transition-transform" />
                    )}
                  </div>

                  {/* Photo Pin Indicator */}
                  {rawMilestone.photoUrl && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-950 border border-rose-400/50 flex items-center justify-center shadow-sm text-rose-300">
                      <Camera className="w-2.5 h-2.5" />
                    </div>
                  )}

                  {/* Step order index badge */}
                  <span className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-[#0d0e19] border border-rose-500/30 text-[9px] font-mono text-rose-300/90 flex items-center justify-center shadow-xs">
                    {idx + 1}
                  </span>
                </div>

                {/* Floating Title Label */}
                {isEditMode ? (
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap z-30">
                    <span className="px-2 py-0.5 rounded-full bg-[#12131d]/95 border border-rose-400/50 text-[10px] font-mono text-rose-300 shadow-md">
                      {rawMilestone.x}%, {rawMilestone.y}%
                    </span>
                  </div>
                ) : (
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 pointer-events-none opacity-80 group-hover:opacity-100 transition-all group-hover:scale-105 whitespace-nowrap z-30">
                    <span className="px-3 py-1 rounded-full bg-[#12131d]/95 border border-rose-500/35 text-[11px] font-sans-clean text-rose-200 shadow-lg backdrop-blur-sm">
                      {milestone.title}
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Scary Pumpkins in bottom-left and bottom-right matching screenshot circles */}
          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-8 z-20 pointer-events-auto">
            <ScaryPumpkin side="left" size="md" rotation={16} />
          </div>

          <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-8 z-20 pointer-events-auto">
            <ScaryPumpkin side="right" size="md" rotation={-16} />
          </div>

          {/* Bottom subtle hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-xs text-stone-300/80 font-light flex items-center gap-1.5 z-20 bg-[#12131d]/80 px-4 py-1.5 rounded-full border border-rose-500/20 backdrop-blur-sm pointer-events-none">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/40 animate-pulse" />
            <span>
              {isEditMode
                ? (isZh
                    ? '提示：拖拽星辰编织星轨 • 点击空白夜空添加新星辰'
                    : 'Tip: Drag stars to shape your journey • Click empty sky to add a star')
                : (isZh
                    ? '点击任意星辰揭晓回忆故事 • 点击“编辑星轨”可随意排布或添加星辰'
                    : 'Click on any star to reveal our story • Tap "Edit Journey" to move or add stars')}
            </span>
          </div>
        </div>
      ) : (
        /* Vertical Romance Timeline View */
        <div id="timeline-view" className="relative space-y-6 pl-6 sm:pl-10 border-l border-rose-500/30 my-8">
          {milestones.map((rawMilestone, idx) => {
            const milestone = getMilestoneData(rawMilestone);
            const isTimelineDropTarget = dropTargetTimelineId === rawMilestone.id;

            return (
              <motion.div
                key={rawMilestone.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => handleStarClick(rawMilestone)}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDropTargetTimelineId(rawMilestone.id);
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDropTargetTimelineId(rawMilestone.id);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (dropTargetTimelineId === rawMilestone.id) setDropTargetTimelineId(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDropTargetTimelineId(null);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleUploadMilestonePhoto(rawMilestone.id, file);
                }}
                className={`group relative cursor-pointer rounded-2xl p-5 transition-all shadow-md ${
                  isTimelineDropTarget
                    ? 'border-2 border-rose-400 ring-4 ring-rose-500/40 bg-[#212338] scale-[1.01]'
                    : 'bg-[#141520]/80 hover:bg-[#191b29] border border-rose-500/20 hover:border-rose-400/50'
                }`}
              >
                {/* Drop Overlay */}
                {isTimelineDropTarget && (
                  <div className="absolute inset-0 z-20 rounded-2xl bg-rose-950/85 backdrop-blur-xs flex flex-col items-center justify-center text-rose-200 pointer-events-none">
                    <UploadCloud className="w-7 h-7 animate-bounce text-rose-300 mb-1" />
                    <span className="text-xs font-semibold">
                      {isZh ? `松开以附带照片到 ${milestone.title}！` : `Drop photo to attach to ${milestone.title}!`}
                    </span>
                  </div>
                )}

                {/* Timeline pin node */}
                <div className="absolute -left-[31px] sm:-left-[47px] top-6 w-5 h-5 rounded-full bg-gradient-to-tr from-[#160513] via-[#2a081c] to-rose-950 border border-rose-500/50 flex items-center justify-center shadow-md shadow-black/80 ring-1 ring-rose-500/30">
                  <Star className="w-2.5 h-2.5 fill-rose-300 text-rose-200" />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h3 className="font-serif-romantic text-xl text-rose-100 font-medium group-hover:text-rose-300 transition-colors flex items-center gap-2">
                    <span>{milestone.title}</span>
                    {rawMilestone.photoUrl && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/25 text-rose-300 text-[10px] font-mono">
                        {isZh ? '已附照片' : 'Photo Attached'}
                      </span>
                    )}
                  </h3>
                  <span className="text-xs text-rose-400/90 font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {milestone.date}
                  </span>
                </div>

                {rawMilestone.photoUrl && (
                  <div className="w-full h-36 sm:h-44 rounded-xl overflow-hidden bg-stone-950 mb-3 flex items-center justify-center border border-stone-800">
                    <img
                      src={rawMilestone.photoUrl}
                      alt={milestone.title}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.includes('picsum.photos')) {
                          target.src = 'https://picsum.photos/seed/milestonestar/800/600';
                        }
                      }}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}

                <p className="text-stone-300 text-xs sm:text-sm leading-relaxed font-light">
                  {milestone.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Radiant Milestone Modal Viewer */}
      <AnimatePresence>
        {selectedMilestone && rawSelectedMilestone && (
          <div
            id="milestone-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto"
            onClick={() => setSelectedMilestoneId(null)}
          >
            {/* Hidden file input for modal photo upload */}
            <input
              ref={milestoneFileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp, image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && rawSelectedMilestone) {
                  handleUploadMilestonePhoto(rawSelectedMilestone.id, file);
                }
                e.target.value = '';
              }}
            />

            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#191b26] to-[#12131c] border border-rose-500/30 shadow-2xl shadow-rose-950/50 overflow-hidden my-auto max-h-[90vh] flex flex-col"
            >
              {/* Modal Top Action Bar */}
              <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!isEditingModalStar && !isEditUnlocked && onRequestEditAuth) {
                      onRequestEditAuth(() => {
                        setIsEditingModalStar(true);
                        soundEngine.playTine(659.25, 0, 0.4);
                      });
                      return;
                    }
                    setIsEditingModalStar(!isEditingModalStar);
                    soundEngine.playTine(isEditingModalStar ? 523.25 : 659.25, 0, 0.4);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 cursor-pointer transition-all shadow-md ${
                    isEditingModalStar
                      ? 'bg-rose-600 border-rose-400 text-white shadow-rose-950/50 scale-105'
                      : 'bg-stone-900/85 border-rose-500/30 text-rose-200 hover:text-white hover:bg-stone-800 backdrop-blur-xs'
                  }`}
                  title={isZh ? '编辑星辰故事、日期与配图' : 'Edit star story, date, coordinates & photo'}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>
                    {isEditingModalStar
                      ? (isZh ? '查看故事' : 'View Story')
                      : isEditUnlocked
                      ? (isZh ? '编辑星辰' : 'Edit Star')
                      : (isZh ? '编辑星辰（锁定）' : 'Edit Star (Locked)')}
                  </span>
                </button>

                <button
                  id="close-milestone-modal"
                  onClick={() => setSelectedMilestoneId(null)}
                  className="w-8 h-8 rounded-full bg-stone-900/85 border border-rose-500/20 flex items-center justify-center text-stone-300 hover:text-white hover:bg-stone-800 transition-all cursor-pointer backdrop-blur-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isEditingModalStar ? (
                /* Star Edit Mode Form */
                <div className="p-6 sm:p-8 overflow-y-auto max-h-[85vh] space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-rose-500/20">
                    <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300">
                      <Star className="w-4 h-4 fill-rose-300" />
                    </div>
                    <div>
                      <h3 className="font-serif-romantic text-xl text-rose-100 font-medium">
                        {isZh ? '编辑纪念里程碑' : 'Edit Journey Milestone'}
                      </h3>
                      <p className="text-xs text-stone-400">
                        {isZh
                          ? '调整该星辰的标题、故事文字、夜空坐标及配图。'
                          : "Adjust this star's name, moment story, position, and photo."}
                      </p>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-xs font-medium text-rose-300 mb-1">
                      {isZh ? '星辰名称 / 里程碑标题' : 'Star Title / Milestone Name'}
                    </label>
                    <input
                      type="text"
                      value={rawSelectedMilestone.title}
                      onChange={(e) =>
                        handleUpdateStarField(rawSelectedMilestone.id, 'title', e.target.value)
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-[#10111a] border border-rose-500/30 text-rose-100 text-sm focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400/50"
                      placeholder={isZh ? '例如：第一次并肩作战、彻夜长谈...' : 'e.g., First Game Won Together, Our Late Night Call...'}
                    />
                  </div>

                  {/* Date / Moment */}
                  <div>
                    <label className="block text-xs font-medium text-rose-300 mb-1">
                      {isZh ? '时间或心动时刻描述' : 'Date or Moment Description'}
                    </label>
                    <input
                      type="text"
                      value={rawSelectedMilestone.date}
                      onChange={(e) =>
                        handleUpdateStarField(rawSelectedMilestone.id, 'date', e.target.value)
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-[#10111a] border border-rose-500/30 text-rose-100 text-sm focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400/50"
                      placeholder={isZh ? '例如：2024年10月14日、第42天...' : 'e.g., Day 42 • In The Arena, October 14, 2024...'}
                    />
                  </div>

                  {/* Description / Story */}
                  <div>
                    <label className="block text-xs font-medium text-rose-300 mb-1">
                      {isZh ? '浪漫回忆 / 专属故事' : 'Our Romantic Memory / Story'}
                    </label>
                    <textarea
                      rows={3}
                      value={rawSelectedMilestone.description}
                      onChange={(e) =>
                        handleUpdateStarField(rawSelectedMilestone.id, 'description', e.target.value)
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-[#10111a] border border-rose-500/30 text-rose-100 text-sm focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400/50 leading-relaxed"
                      placeholder={isZh ? '写下这颗星辰背后动人的深情故事...' : 'Write the heartfelt story behind this star...'}
                    />
                  </div>

                  {/* Sky Coordinates Sliders */}
                  <div className="p-3.5 rounded-2xl bg-[#10111c] border border-rose-500/25 space-y-3">
                    <div className="flex items-center justify-between text-xs font-medium text-rose-200">
                      <span className="flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-rose-400" />
                        {isZh ? '星空坐标' : 'Sky Coordinates'}
                      </span>
                      <span className="text-[11px] font-mono text-rose-300/80">
                        X: {rawSelectedMilestone.x}%, Y: {rawSelectedMilestone.y}%
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-stone-400 mb-1">
                        <span>{isZh ? `水平方位 (X): ${rawSelectedMilestone.x}%` : `Horizontal (X): ${rawSelectedMilestone.x}%`}</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="95"
                        value={rawSelectedMilestone.x}
                        onChange={(e) =>
                          handleUpdateStarField(rawSelectedMilestone.id, 'x', Number(e.target.value))
                        }
                        className="w-full accent-rose-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-stone-400 mb-1">
                        <span>{isZh ? `垂直方位 (Y): ${rawSelectedMilestone.y}%` : `Vertical (Y): ${rawSelectedMilestone.y}%`}</span>
                      </div>
                      <input
                        type="range"
                        min="8"
                        max="92"
                        value={rawSelectedMilestone.y}
                        onChange={(e) =>
                          handleUpdateStarField(rawSelectedMilestone.id, 'y', Number(e.target.value))
                        }
                        className="w-full accent-rose-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Photo Attachment Manager */}
                  <div>
                    <label className="block text-xs font-medium text-rose-300 mb-1.5">
                      {isZh ? '附带的回忆照片或游戏截图' : 'Attached Memory Photo / Screenshot'}
                    </label>
                    {rawSelectedMilestone.photoUrl ? (
                      <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#10111a] border border-rose-500/20">
                        <img
                          src={rawSelectedMilestone.photoUrl}
                          alt={rawSelectedMilestone.title}
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.src.includes('picsum.photos')) {
                              target.src = 'https://picsum.photos/seed/milestonestar/400/400';
                            }
                          }}
                          className="w-16 h-16 rounded-xl object-cover border border-rose-500/30"
                        />
                        <div className="flex-1 space-y-1">
                          <p className="text-xs text-rose-200 font-medium truncate">
                            {isZh ? '已附带照片' : 'Photo Attached'}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => milestoneFileInputRef.current?.click()}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-1 cursor-pointer transition-all"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>{isZh ? '替换' : 'Replace'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateStarField(rawSelectedMilestone.id, 'photoUrl', undefined)
                              }
                              className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-red-950/60 border border-stone-700 text-stone-300 hover:text-red-300 text-xs flex items-center gap-1 cursor-pointer transition-all"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>{isZh ? '移除' : 'Remove'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => milestoneFileInputRef.current?.click()}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDraggingOverMilestonePhoto(true);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDraggingOverMilestonePhoto(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file && isImageFile(file)) {
                            soundEngine.playHeartbeat();
                            handleUploadMilestonePhoto(rawSelectedMilestone.id, file);
                          }
                        }}
                        className={`p-4 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
                          isDraggingOverMilestonePhoto
                            ? 'border-rose-400 bg-rose-500/20'
                            : 'border-rose-500/30 bg-[#10111a] hover:bg-[#151724]'
                        }`}
                      >
                        <UploadCloud className="w-6 h-6 text-rose-300 mx-auto mb-1" />
                        <span className="text-xs text-rose-200 font-medium block">
                          {isZh ? '拖拽或点击上传照片/截图' : 'Drag & drop or click to add screenshot'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-rose-500/20">
                    {milestones.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => handleDeleteStar(rawSelectedMilestone.id)}
                        className="px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{isZh ? '删除此星辰' : 'Delete Star'}</span>
                      </button>
                    ) : (
                      <div />
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingModalStar(false);
                        soundEngine.playChime();
                      }}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-950/50 transition-all hover:scale-105"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isZh ? '保存并查看星辰' : 'Save & View Star'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Regular Romantic Star View */
                <div className="overflow-y-auto max-h-[85vh]">
                  {/* Photo header if available with drag & drop replace */}
                  {rawSelectedMilestone.photoUrl ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingOverMilestonePhoto(true);
                      }}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingOverMilestonePhoto(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingOverMilestonePhoto(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingOverMilestonePhoto(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file && rawSelectedMilestone) {
                          handleUploadMilestonePhoto(rawSelectedMilestone.id, file);
                        }
                      }}
                      className={`relative w-full max-h-72 sm:max-h-80 overflow-hidden bg-stone-950 flex items-center justify-center p-2 border-b transition-all ${
                        isDraggingOverMilestonePhoto
                          ? 'border-rose-400 ring-2 ring-rose-500/50 bg-rose-950/30'
                          : 'border-rose-500/15'
                      }`}
                    >
                      <img
                        src={rawSelectedMilestone.photoUrl}
                        alt={selectedMilestone.title}
                        decoding="async"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.src.includes('picsum.photos')) {
                            target.src = 'https://picsum.photos/seed/milestonestar/1000/700';
                          }
                        }}
                        className="max-h-64 sm:max-h-76 w-auto max-w-full object-contain mx-auto rounded-lg shadow-lg"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#191b26] via-transparent to-transparent pointer-events-none" />

                      {/* Drop Overlay */}
                      {isDraggingOverMilestonePhoto && (
                        <div className="absolute inset-0 bg-rose-950/85 backdrop-blur-xs flex flex-col items-center justify-center text-rose-200 z-20">
                          <RefreshCw className="w-8 h-8 animate-spin text-rose-300 mb-1" />
                          <span className="text-xs font-semibold">
                            {isZh ? '松开以替换此星辰配图！' : 'Drop to replace this star photo!'}
                          </span>
                        </div>
                      )}

                      {/* Quick Replace Button */}
                      <button
                        onClick={() => milestoneFileInputRef.current?.click()}
                        title={isZh ? '点击或拖入新图片进行替换' : 'Drag & drop new photo or click to replace'}
                        className="absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-xs text-rose-200 text-xs flex items-center gap-1.5 border border-rose-500/30 cursor-pointer shadow-md transition-all hover:scale-105"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>{isZh ? '更换配图' : 'Replace Photo'}</span>
                      </button>
                    </div>
                  ) : (
                    /* Drag & drop upload zone when no photo exists */
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingOverMilestonePhoto(true);
                      }}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingOverMilestonePhoto(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingOverMilestonePhoto(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingOverMilestonePhoto(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file && rawSelectedMilestone) {
                          handleUploadMilestonePhoto(rawSelectedMilestone.id, file);
                        }
                      }}
                      onClick={() => milestoneFileInputRef.current?.click()}
                      className={`m-5 p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center ${
                        isDraggingOverMilestonePhoto
                          ? 'border-rose-400 bg-rose-500/20 scale-[1.01] shadow-xl'
                          : 'border-rose-500/25 bg-[#141520]/80 hover:border-rose-400/50 hover:bg-[#181928]'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center justify-center mx-auto mb-2">
                        {isUploadingPhoto ? (
                          <RefreshCw className="w-5 h-5 animate-spin text-rose-300" />
                        ) : (
                          <UploadCloud className="w-5 h-5" />
                        )}
                      </div>
                      <div className="text-xs font-medium text-rose-100 mb-0.5">
                        {isDraggingOverMilestonePhoto
                          ? (isZh ? '✨ 松开鼠标以附带照片到此星辰！' : '✨ Release image to attach to this star!')
                          : (isZh ? '拖拽战报截图或照片至此' : 'Drag & drop photo or screenshot here')}
                      </div>
                      <p className="text-[11px] text-stone-400">
                        {isZh
                          ? '为这段故事附上高光时刻或甜蜜照片（也可点击浏览文件）'
                          : 'Attach a game moment or memory picture (or click to browse)'}
                      </p>
                    </div>
                  )}

                  <div className="p-6 sm:p-8 pt-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
                        <Calendar className="w-3 h-3 text-rose-400" />
                        {selectedMilestone.date}
                      </div>

                      <span className="text-[11px] font-mono text-stone-400">
                        {isZh ? '星空坐标：' : 'Position: '}
                        {rawSelectedMilestone.x}%, {rawSelectedMilestone.y}%
                      </span>
                    </div>

                    <h3 className="font-serif-romantic text-2xl sm:text-3xl text-rose-100 font-normal mb-3">
                      {selectedMilestone.title}
                    </h3>

                    <p className="text-stone-300 text-sm sm:text-base leading-relaxed font-light mb-6">
                      {selectedMilestone.description}
                    </p>

                    {uploadNotice && (
                      <div className="mb-4 px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{uploadNotice}</span>
                      </div>
                    )}

                    {/* Footer navigation between stars */}
                    <div className="flex items-center justify-between pt-4 border-t border-rose-500/15 text-xs text-stone-400">
                      <button
                        onClick={handlePrev}
                        className="flex items-center gap-1 hover:text-rose-300 transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>{isZh ? '上一颗星辰' : 'Previous Star'}</span>
                      </button>
                      <button
                        onClick={() => {
                          if (!isEditUnlocked && onRequestEditAuth) {
                            onRequestEditAuth(() => {
                              setIsEditingModalStar(true);
                              soundEngine.playTine(659.25, 0, 0.4);
                            });
                            return;
                          }
                          setIsEditingModalStar(true);
                          soundEngine.playTine(659.25, 0, 0.4);
                        }}
                        className="px-3 py-1 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>
                          {isEditUnlocked
                            ? (isZh ? '编辑此星辰' : 'Edit This Star')
                            : (isZh ? '编辑星辰（锁定）' : 'Edit Star (Locked)')}
                        </span>
                      </button>
                      <button
                        onClick={handleNext}
                        className="flex items-center gap-1 hover:text-rose-300 transition-colors cursor-pointer"
                      >
                        <span>{isZh ? '下一颗星辰' : 'Next Star'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
