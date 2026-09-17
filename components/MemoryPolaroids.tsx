'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Calendar,
  X,
  Plus,
  Maximize2,
  Lock,
  Layers,
  UploadCloud,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Camera,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PolaroidPhoto } from '@/lib/types';
import { soundEngine } from '@/lib/audio';
import { isImageFile } from '@/lib/imageUtils';
import { uploadImageDirect } from '@/lib/storageSync';
import { useLanguage, CHINESE_DEFAULTS } from '@/lib/i18n';

interface MemoryPolaroidsProps {
  memories: PolaroidPhoto[];
  partnerName: string;
  onOpenAddMemory: () => void;
  onUpdateMemories?: (updated: PolaroidPhoto[]) => void;
  isEditUnlocked?: boolean;
  onRequestEditAuth?: (onSuccess: () => void) => void;
}

export default function MemoryPolaroids({
  memories,
  partnerName,
  onOpenAddMemory,
  onUpdateMemories,
  isEditUnlocked = false,
  onRequestEditAuth,
}: MemoryPolaroidsProps) {
  const { isZh } = useLanguage();
  const [selectedPhoto, setSelectedPhoto] = useState<PolaroidPhoto | null>(null);
  const [likedPhotos, setLikedPhotos] = useState<Record<string, boolean>>({});
  const [displayFit, setDisplayFit] = useState<'contain' | 'cover'>('contain');
  const [isDraggingOverZone, setIsDraggingOverZone] = useState(false);
  const [dropTargetCardId, setDropTargetCardId] = useState<string | null>(null);
  const [isDraggingOverLightbox, setIsDraggingOverLightbox] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const zoneFileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const replacingMemoryIdRef = useRef<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const getPhotoData = (photo: PolaroidPhoto) => {
    if (!isZh) return photo;
    const zhMatch = CHINESE_DEFAULTS.polaroids.find((p) => p.id === photo.id);
    if (!zhMatch) return photo;
    return {
      ...photo,
      caption: zhMatch.caption,
      date: zhMatch.date,
      note: zhMatch.note,
    };
  };

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const wasLiked = likedPhotos[id];
    setLikedPhotos((prev) => ({ ...prev, [id]: !wasLiked }));

    if (!wasLiked) {
      soundEngine.playHeartbeat();
      try {
        confetti({
          particleCount: 25,
          spread: 50,
          origin: {
            x: e.clientX / window.innerWidth,
            y: e.clientY / window.innerHeight,
          },
          colors: ['#f43f5e', '#fb7185', '#fda4af'],
        });
      } catch {
        // Safe fallback
      }
    } else {
      soundEngine.playTine(440, 0, 0.2);
    }
  };

  const handleSelect = (photo: PolaroidPhoto) => {
    soundEngine.playTine(523.25, 0, 0.3);
    setSelectedPhoto(getPhotoData(photo));
  };

  const handleProcessFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(isImageFile);
    if (fileArray.length === 0) {
      showToast(isZh ? '请上传有效的图片格式（PNG、JPG、WebP）' : 'Please select valid image files (PNG, JPG, WebP)');
      return;
    }

    setIsProcessing(true);
    soundEngine.playTine(659.25, 0, 0.4);

    try {
      const newItems: PolaroidPhoto[] = [];

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const dataUrl = await uploadImageDirect(file);
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

        newItems.push({
          id: `memory-${Date.now()}-${i}`,
          imageUrl: dataUrl,
          caption: nameWithoutExt || (isZh ? '珍藏游戏瞬间' : 'Captured Memory'),
          date: isZh ? '最新收录' : 'Recently Captured',
          note: isZh ? '全画幅保存的高清回忆。' : 'Preserved in full uncropped HD glory.',
          rotation: (Math.random() * 6 - 3),
        });
      }

      if (onUpdateMemories) {
        onUpdateMemories([...newItems, ...memories]);
        soundEngine.playUnwrapCelebration();
        showToast(
          isZh
            ? `成功添加 ${newItems.length} 张高清回忆！✨`
            : `Added ${newItems.length} new screenshot${newItems.length > 1 ? 's' : ''}! ✨`
        );
      }
    } catch (err) {
      console.error('Failed to upload dropped files:', err);
      showToast(isZh ? '上传失败，请重试' : 'Failed to process screenshot file');
    } finally {
      setIsProcessing(false);
      setIsDraggingOverZone(false);
    }
  };

  const handleReplaceCardImage = async (targetId: string, file: File) => {
    if (!isImageFile(file)) {
      showToast(isZh ? '请提供有效的图片文件' : 'Please provide a valid image file');
      return;
    }

    setIsProcessing(true);
    soundEngine.playTine(880, 0, 0.4);

    try {
      const newUrl = await uploadImageDirect(file);
      if (onUpdateMemories) {
        const updated = memories.map((m) =>
          m.id === targetId ? { ...m, imageUrl: newUrl } : m
        );
        onUpdateMemories(updated);
        soundEngine.playUnwrapCelebration();
        showToast(isZh ? '截图已成功替换并高清更新！📸' : 'Screenshot replaced and preserved in full dimensions! 📸');

        if (selectedPhoto && selectedPhoto.id === targetId) {
          setSelectedPhoto({ ...selectedPhoto, imageUrl: newUrl });
        }
      }
    } catch (err) {
      console.error('Failed to replace screenshot:', err);
    } finally {
      setIsProcessing(false);
      setDropTargetCardId(null);
    }
  };

  return (
    <div id="polaroid-gallery-section" className="relative w-full max-w-6xl mx-auto py-6 px-4">
      {/* Hidden file picker inputs */}
      <input
        ref={zoneFileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp, image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleProcessFiles(e.target.files);
          }
          e.target.value = '';
        }}
      />

      <input
        ref={replaceFileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp, image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && replacingMemoryIdRef.current) {
            handleReplaceCardImage(replacingMemoryIdRef.current, file);
          }
          e.target.value = '';
        }}
      />

      {/* Header with Title and Mode Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs tracking-wider uppercase mb-2">
            <Camera className="w-3 h-3 text-rose-400" />
            {isZh ? '高光战报与甜蜜瞬间' : 'Game Shots & Captured Moments'}
          </div>
          <h2 className="font-serif-romantic text-3xl sm:text-4xl text-rose-100 font-normal">
            {isZh ? '游戏截图与回忆相册' : 'Our Screenshot & Memory Sanctuary'}
          </h2>
          <p className="text-stone-400 text-xs sm:text-sm font-light mt-1 max-w-xl leading-relaxed">
            {isZh
              ? '把我们双排吃鸡的高光战报、深夜聊天的甜蜜截屏或生活合照直接拖入相册墙。点击任意卡片即可查看高清大图。'
              : 'Drag and drop your Fortnite duo clutch moments, late night IG chat snippets, or photos directly onto the wall. Click any card to inspect in full HD.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Dimension Fit Mode Toggle */}
          <div className="inline-flex items-center p-1 rounded-xl bg-[#141521] border border-rose-500/20 text-xs text-stone-300">
            <button
              onClick={() => {
                setDisplayFit('contain');
                soundEngine.playTine(880, 0, 0.4);
              }}
              title={isZh ? '展示完整截图画幅，不裁剪UI与击败数据' : 'Shows 100% of screenshot dimensions without cropping'}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                displayFit === 'contain'
                  ? 'bg-rose-500/20 text-rose-200 font-medium shadow-xs border border-rose-500/30'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Maximize2 className="w-3 h-3 text-rose-400" />
              <span>{isZh ? '完整原图画幅' : 'Full Dimension'}</span>
            </button>
            <button
              onClick={() => {
                setDisplayFit('cover');
                soundEngine.playTine(700, 0, 0.4);
              }}
              title={isZh ? '经典质感拍立得边框' : 'Classic framed memory fill'}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                displayFit === 'cover'
                  ? 'bg-rose-500/20 text-rose-200 font-medium shadow-xs border border-rose-500/30'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Layers className="w-3 h-3 text-rose-400" />
              <span>{isZh ? '拍立得画框' : 'Classic Frame'}</span>
            </button>
          </div>

          <button
            onClick={() => {
              if (!isEditUnlocked && onRequestEditAuth) {
                onRequestEditAuth(onOpenAddMemory);
                return;
              }
              onOpenAddMemory();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600/20 border border-rose-500/30 text-rose-200 text-xs font-medium hover:bg-rose-600/30 hover:border-rose-400 transition-all cursor-pointer shadow-sm"
          >
            {isEditUnlocked ? (
              <Plus className="w-3.5 h-3.5" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-rose-400/80" />
            )}
            <span>
              {isEditUnlocked
                ? (isZh ? '添加 / 管理相册' : 'Add / Edit Album')
                : (isZh ? '相册（密码保护）' : 'Album (Protected)')}
            </span>
          </button>
        </div>
      </div>

      {/* Interactive Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDraggingOverZone(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDraggingOverZone(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDraggingOverZone(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = e.dataTransfer.files;
            if (!isEditUnlocked && onRequestEditAuth) {
              onRequestEditAuth(() => handleProcessFiles(files));
              return;
            }
            handleProcessFiles(files);
          }
        }}
        onClick={() => {
          if (!isEditUnlocked && onRequestEditAuth) {
            onRequestEditAuth(() => zoneFileInputRef.current?.click());
            return;
          }
          zoneFileInputRef.current?.click();
        }}
        className={`group relative w-full mb-8 p-6 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer text-center overflow-hidden ${
          isDraggingOverZone
            ? 'border-rose-400 bg-rose-500/15 scale-[1.01] shadow-xl shadow-rose-950/40'
            : 'border-rose-500/25 bg-[#141522]/80 hover:border-rose-400/50 hover:bg-[#181928]/90'
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-11 h-11 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-300 group-hover:scale-110 transition-transform">
            {isProcessing ? (
              <RefreshCw className="w-5 h-5 animate-spin text-rose-300" />
            ) : (
              <UploadCloud className="w-5 h-5" />
            )}
          </div>

          <div className="text-sm font-medium text-rose-100 flex items-center gap-1.5">
            <span>
              {isDraggingOverZone
                ? (isZh ? '✨ 松开鼠标即可添加截图/照片！' : '✨ Release to add screenshot(s) now!')
                : (isZh ? '拖拽堡垒之夜截图或照片到这里' : 'Drag & Drop game screenshots or photos here')}
            </span>
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          </div>

          <p className="text-xs text-stone-400 max-w-md font-light leading-relaxed">
            {isZh
              ? '支持拖入 1080p/4K 游戏截图、聊天记录截屏或生活照片。点击此处也可直接从本地文件夹选择。'
              : 'Drop full-size 1080p/4K Fortnite screenshots, Instagram DMs, or memory pictures directly from your folder. Or click anywhere in this box to browse files.'}
          </p>

          <div className="inline-flex items-center gap-2 text-[11px] text-rose-300/80 font-mono mt-1">
            <span>{isZh ? '支持批量多图上传' : 'Supports multiple files'}</span>
            <span>•</span>
            <span>{isZh ? '自动保留完整原始画幅' : 'Auto-preserves full dimension'}</span>
          </div>
        </div>
      </div>

      {/* Floating feedback toast */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#191b2b] border border-rose-500/40 text-rose-200 text-xs shadow-2xl shadow-black/80"
          >
            <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{feedbackMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Polaroid & Screenshot Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
        {memories.map((rawPhoto, idx) => {
          const photo = getPhotoData(rawPhoto);
          const isLiked = likedPhotos[photo.id];
          const isCardDropTarget = dropTargetCardId === photo.id;

          return (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.06, 0.4) }}
              style={{ rotate: `${photo.rotation || 0}deg` }}
              whileHover={{ scale: 1.03, rotate: 0, zIndex: 10 }}
              onClick={() => handleSelect(photo)}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDropTargetCardId(photo.id);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (dropTargetCardId === photo.id) {
                  setDropTargetCardId(null);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDropTargetCardId(null);
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  handleReplaceCardImage(photo.id, file);
                }
              }}
              className={`group cursor-pointer relative bg-[#fdfbf7] p-3 sm:p-4 rounded-xl shadow-xl shadow-black/40 border transition-all duration-300 ${
                isCardDropTarget
                  ? 'border-rose-500 ring-4 ring-rose-500/40 scale-105'
                  : 'border-stone-300/50'
              }`}
            >
              {/* Decorative Washi Tape */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-rose-200/60 backdrop-blur-xs rotate-[-2deg] border border-rose-300/40 shadow-xs pointer-events-none z-10" />

              {/* Photo Area with Full Dimension or Classic View */}
              <div
                className={`relative w-full rounded-lg overflow-hidden bg-stone-950 mb-3 flex items-center justify-center ${
                  displayFit === 'contain'
                    ? 'min-h-[190px] max-h-[240px] aspect-[16/11]'
                    : 'aspect-square'
                }`}
              >
                {/* Specular glass gloss sheen that glides across on hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10" />

                <img
                  src={photo.imageUrl || 'https://picsum.photos/seed/nightstar/800/600'}
                  alt={photo.caption || 'Memory photo'}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('picsum.photos')) {
                      target.src = 'https://picsum.photos/seed/nightstar/800/600';
                    }
                  }}
                  className={`w-full h-full transition-transform duration-500 ${
                    displayFit === 'contain'
                      ? 'object-contain group-hover:scale-102'
                      : 'object-cover group-hover:scale-105'
                  }`}
                />

                {/* Drop-to-replace active overlay */}
                {isCardDropTarget && (
                  <div className="absolute inset-0 bg-rose-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-rose-200 p-2 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-rose-300 mb-1" />
                    <span className="text-xs font-semibold">
                      {isZh ? '松开以替换此截图！' : 'Drop to replace this screenshot!'}
                    </span>
                  </div>
                )}

                {/* Quick actions top bar on photo */}
                <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                  {/* Replace screenshot button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      replacingMemoryIdRef.current = photo.id;
                      replaceFileInputRef.current?.click();
                    }}
                    title={isZh ? '替换这张照片/截图' : 'Replace this screenshot'}
                    className="p-1.5 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-xs text-white hover:text-rose-300 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>

                  {/* Like button */}
                  <button
                    onClick={(e) => handleLike(photo.id, e)}
                    title={isZh ? '心动收藏' : 'Heart this memory'}
                    className="p-1.5 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-xs text-white hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        isLiked ? 'fill-rose-500 text-rose-500' : 'text-white'
                      }`}
                    />
                  </button>
                </div>

                {/* View Full Dimension Pill on Hover */}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/65 backdrop-blur-xs text-[10px] text-stone-200 font-mono flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="w-3 h-3 text-rose-400" />
                  <span>{isZh ? '全屏查看' : 'Inspect Full'}</span>
                </div>
              </div>

              {/* Handwritten style caption */}
              <div className="px-1 text-center">
                <p className="font-script text-xl sm:text-2xl text-stone-800 leading-tight truncate">
                  {photo.caption}
                </p>
                <p className="text-[11px] text-stone-500 font-sans-clean mt-1 uppercase tracking-wider truncate">
                  {photo.date}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Full-Screen Polaroid & Screenshot HD Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <div
            id="photo-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl rounded-3xl bg-[#141521] border border-rose-500/30 shadow-2xl p-4 sm:p-7 text-center my-auto"
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-stone-800 border border-stone-700 text-stone-300 hover:text-white hover:bg-stone-700 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Full Dimension Uncropped Screenshot Container with Drag & Drop */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDraggingOverLightbox(true);
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDraggingOverLightbox(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDraggingOverLightbox(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDraggingOverLightbox(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file && selectedPhoto) {
                    handleReplaceCardImage(selectedPhoto.id, file);
                  }
                }}
                className={`relative w-full max-h-[70vh] flex items-center justify-center rounded-2xl overflow-hidden bg-stone-950 mb-5 shadow-2xl border p-1 sm:p-2 transition-all ${
                  isDraggingOverLightbox
                    ? 'border-rose-400 ring-4 ring-rose-500/50 bg-rose-950/40'
                    : 'border-stone-800/80'
                }`}
              >
                <img
                  src={selectedPhoto.imageUrl || 'https://picsum.photos/seed/nightstar/1200/800'}
                  alt={selectedPhoto.caption || 'Memory Photo'}
                  decoding="async"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('picsum.photos')) {
                      target.src = 'https://picsum.photos/seed/nightstar/1200/800';
                    }
                  }}
                  className="max-h-[65vh] w-auto max-w-full object-contain mx-auto rounded-lg shadow-md"
                />

                {/* Lightbox Drop Overlay */}
                {isDraggingOverLightbox && (
                  <div className="absolute inset-0 bg-rose-950/85 backdrop-blur-xs flex flex-col items-center justify-center text-rose-200 z-10">
                    <RefreshCw className="w-10 h-10 animate-spin text-rose-300 mb-2" />
                    <span className="text-sm font-semibold">
                      {isZh ? '松开以替换此回忆！' : 'Drop image to replace this memory!'}
                    </span>
                  </div>
                )}
              </div>

              <div className="max-w-xl mx-auto">
                <span className="font-script text-3xl sm:text-4xl text-rose-300 block mb-1">
                  {selectedPhoto.caption}
                </span>

                <div className="text-xs font-mono text-stone-400 mb-3 flex items-center justify-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-rose-400" />
                  <span>{selectedPhoto.date}</span>
                </div>

                <p className="text-stone-300 text-sm sm:text-base font-light leading-relaxed italic mb-5 px-4">
                  &ldquo;{selectedPhoto.note}&rdquo;
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                    <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/30" />
                    {isZh ? `与 ${partnerName} 的珍藏记忆` : `Treasured with ${partnerName}`}
                  </div>

                  <button
                    onClick={() => {
                      replacingMemoryIdRef.current = selectedPhoto.id;
                      replaceFileInputRef.current?.click();
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs cursor-pointer transition-colors border border-stone-700"
                  >
                    <RefreshCw className="w-3 h-3 text-stone-400" />
                    {isZh ? '更换照片' : 'Replace Image'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
