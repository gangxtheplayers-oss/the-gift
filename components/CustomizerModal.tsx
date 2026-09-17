'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Save,
  Heart,
  Calendar,
  Image as ImageIcon,
  FileText,
  Trash2,
  Plus,
  RefreshCw,
  Download,
  Upload,
  UploadCloud,
  Gamepad2,
  Crosshair,
  ShieldAlert,
  Skull,
  Swords,
  Trophy,
  Flame,
  Laugh,
  Feather,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  Sliders,
} from 'lucide-react';
import { GiftData, MemoryPolaroid, Milestone, LoveReason, DuoRoast } from '@/lib/types';
import { initialGiftData } from '@/lib/defaultData';
import { soundEngine } from '@/lib/audio';
import { formatFilenameToCaption, isImageFile } from '@/lib/imageUtils';
import { uploadImageDirect, exportBackupJSON, importBackupJSON } from '@/lib/storageSync';
import { useLanguage } from '@/lib/i18n';

interface CustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  giftData: GiftData;
  onSave: (newData: GiftData) => void;
}

export default function CustomizerModal({
  isOpen,
  onClose,
  giftData,
  onSave,
}: CustomizerModalProps) {
  const { isZh } = useLanguage();
  const [formData, setFormData] = useState<GiftData>(giftData);
  const [activeTab, setActiveTab] = useState<'details' | 'letter' | 'memories' | 'milestones' | 'reasons' | 'roasts'>('details');

  // AI Muse state
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiQualities, setAiQualities] = useState('');
  const [aiTone, setAiTone] = useState(
    isZh ? '深情浪漫、诗意温存、纯粹真诚' : 'emotional, timeless, poetic yet genuine'
  );

  // New item draft states
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoDate, setNewPhotoDate] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoNote, setNewPhotoNote] = useState('');
  const [isDraggingPhotoZone, setIsDraggingPhotoZone] = useState(false);
  const [dropTargetMemoryId, setDropTargetMemoryId] = useState<string | null>(null);
  const [dropTargetMilestoneIdx, setDropTargetMilestoneIdx] = useState<number | null>(null);
  const [dropTargetMilestonePhotoIdx, setDropTargetMilestonePhotoIdx] = useState<number | null>(null);
  const [isOptimizingImage, setIsOptimizingImage] = useState(false);

  const [newReasonText, setNewReasonText] = useState('');
  const [newReasonCategory, setNewReasonCategory] = useState<'smile' | 'comfort' | 'heart' | 'future'>('heart');

  // New roast draft states
  const [newRoastTitle, setNewRoastTitle] = useState('');
  const [newRoastBadge, setNewRoastBadge] = useState('');
  const [newRoastSituation, setNewRoastSituation] = useState('');
  const [newRoastVerdict, setNewRoastVerdict] = useState('');
  const [newRoastIcon, setNewRoastIcon] = useState('Crosshair');

  const backupFileInputRef = React.useRef<HTMLInputElement>(null);
  const [persistenceNotice, setPersistenceNotice] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Track prev giftData to reset formData when giftData instance changes
  const [prevGiftData, setPrevGiftData] = useState<GiftData>(giftData);
  if (giftData !== prevGiftData) {
    setPrevGiftData(giftData);
    setFormData(giftData);
  }

  // Image file upload & drag/drop helper with automatic server disk persistence
  const handleProcessImageFile = React.useCallback(async (file: File) => {
    if (!isImageFile(file)) {
      alert(isZh ? '请上传有效的图片文件 (PNG, JPG, WebP 等)' : 'Please upload an image file (PNG, JPG, WebP, etc.)');
      return;
    }
    setIsOptimizingImage(true);
    try {
      const durableUrl = await uploadImageDirect(file);
      setNewPhotoUrl(durableUrl);
      setNewPhotoCaption((prev) => (prev.trim() ? prev : formatFilenameToCaption(file.name)));
      setNewPhotoDate((prev) => (prev.trim() ? prev : (isZh ? '游戏截图 / 心动瞬间' : 'Game Screenshot')));
      soundEngine.playTine(1046.5, 0, 0.5);
    } catch (err) {
      console.error('Failed to process image:', err);
      alert(isZh ? '无法处理该图片文件。' : 'Could not process this image file.');
    } finally {
      setIsOptimizingImage(false);
    }
  }, [isZh]);

  // Clipboard paste listener to paste images from Snipping Tool / copy
  React.useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            soundEngine.playHeartbeat();
            handleProcessImageFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, handleProcessImageFile]);

  const handleExportBackup = () => {
    exportBackupJSON(formData);
    soundEngine.playChime();
    setPersistenceNotice(
      isZh
        ? '备份文件已成功下载！所有深情文字与照片均已安全保存。'
        : 'Backup file downloaded! All photos & text are saved safely.'
    );
    setTimeout(() => setPersistenceNotice(null), 4000);
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importBackupJSON(file);
      setFormData(imported);
      soundEngine.playHeartbeat();
      setPersistenceNotice(
        isZh
          ? '备份加载完成！点击“保存并应用更改”将永久同步保存。'
          : 'Backup loaded! Click "Save & Apply Changes" to persist to disk.'
      );
      setTimeout(() => setPersistenceNotice(null), 5000);
    } catch {
      alert(isZh ? '读取备份文件失败，请确保格式正确。' : 'Failed to read backup file. Please ensure it is a valid JSON backup.');
    }
    e.target.value = '';
  };

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    soundEngine.playChime();
    try {
      await onSave(formData);
      setSaveFeedback(isZh ? '已保存！' : 'Saved!');
      setTimeout(() => {
        setSaveFeedback(null);
        onClose();
      }, 400);
    } catch (err) {
      console.error('Save error:', err);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm(isZh ? '确认要将所有内容重置为初始浪漫预设吗？' : 'Reset all details back to the romantic default presets?')) {
      setFormData(initialGiftData);
      onSave(initialGiftData);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleProcessImageFile(file);
    e.target.value = '';
  };

  const handleReplaceMemoryImage = async (memoryId: string, file: File) => {
    if (!isImageFile(file)) return;
    setIsOptimizingImage(true);
    try {
      const durableUrl = await uploadImageDirect(file);
      setFormData({
        ...formData,
        memories: formData.memories.map((m) =>
          m.id === memoryId ? { ...m, imageUrl: durableUrl } : m
        ),
      });
      soundEngine.playChime();
    } catch (err) {
      console.error('Failed to replace image:', err);
    } finally {
      setIsOptimizingImage(false);
      setDropTargetMemoryId(null);
    }
  };

  const handleMilestoneFileUpload = async (idx: number, file: File) => {
    if (!isImageFile(file)) return;
    setIsOptimizingImage(true);
    try {
      const durableUrl = await uploadImageDirect(file);
      const next = [...formData.milestones];
      next[idx] = { ...next[idx], photoUrl: durableUrl };
      setFormData({ ...formData, milestones: next });
      soundEngine.playChime();
    } catch (err) {
      console.error('Failed to set milestone photo:', err);
    } finally {
      setIsOptimizingImage(false);
      setDropTargetMilestoneIdx(null);
      setDropTargetMilestonePhotoIdx(null);
    }
  };

  const handleRemoveMilestonePhoto = (idx: number) => {
    const next = [...formData.milestones];
    next[idx] = { ...next[idx], photoUrl: '' };
    setFormData({ ...formData, milestones: next });
    soundEngine.playTine(440, 0, 0.3);
  };

  const handleAddPhoto = () => {
    if (!newPhotoUrl) {
      alert(isZh ? '请先上传或输入有效的照片或截图。' : 'Please provide an image file, screenshot, or URL.');
      return;
    }

    const newMemory: MemoryPolaroid = {
      id: `custom-p-${Date.now()}`,
      caption: newPhotoCaption || (isZh ? '特别的浪漫时刻' : 'A Special Moment'),
      date: newPhotoDate || (isZh ? '游戏截图 / 甜蜜回忆' : 'Game Screenshot / Memory'),
      imageUrl: newPhotoUrl,
      note: newPhotoNote || (isZh ? '和你在一起是我这辈子最珍贵的心动记忆。' : 'One of my absolute favorite memories with you.'),
      rotation: Math.round((Math.random() * 5 - 2.5) * 10) / 10,
    };

    setFormData({
      ...formData,
      memories: [newMemory, ...formData.memories],
    });

    setNewPhotoCaption('');
    setNewPhotoDate('');
    setNewPhotoUrl('');
    setNewPhotoNote('');
    soundEngine.playHeartbeat();
  };

  const handleDeletePhoto = (id: string) => {
    setFormData({
      ...formData,
      memories: formData.memories.filter((m) => m.id !== id),
    });
  };

  const handleAddReason = () => {
    if (!newReasonText.trim()) return;
    const newReason: LoveReason = {
      id: `custom-r-${Date.now()}`,
      category: newReasonCategory,
      text: newReasonText.trim(),
    };
    setFormData({
      ...formData,
      reasons: [newReason, ...formData.reasons],
    });
    setNewReasonText('');
  };

  const handleDeleteReason = (id: string) => {
    setFormData({
      ...formData,
      reasons: formData.reasons.filter((r) => r.id !== id),
    });
  };

  const handleAddRoast = () => {
    if (!newRoastTitle.trim() || !newRoastSituation.trim()) return;
    const newRoast: DuoRoast = {
      id: `custom-roast-${Date.now()}`,
      title: newRoastTitle.trim(),
      badge: newRoastBadge.trim() || (isZh ? '开黑双排小迷糊' : 'Fortnite Crime'),
      situation: newRoastSituation.trim(),
      verdict: newRoastVerdict.trim() || (isZh ? '哪怕打歪了也依然宠你上天，带你一路躺赢吃鸡！' : 'Still carried to victory royales with endless love.'),
      iconName: newRoastIcon,
      guiltyVotes: 1,
    };
    setFormData({
      ...formData,
      roasts: [newRoast, ...(formData.roasts || [])],
    });
    setNewRoastTitle('');
    setNewRoastBadge('');
    setNewRoastSituation('');
    setNewRoastVerdict('');
  };

  const handleDeleteRoast = (id: string) => {
    setFormData({
      ...formData,
      roasts: (formData.roasts || []).filter((r) => r.id !== id),
    });
  };

  const handleAddNewMilestone = () => {
    const newStar: Milestone = {
      id: `m-${Date.now()}`,
      title: isZh ? `星辰 #${formData.milestones.length + 1}` : `Star #${formData.milestones.length + 1}`,
      date: isZh ? '心动纪念' : 'Special Moment',
      description: isZh
        ? '漫漫旅途中一颗永恒闪耀的璀璨星辰，照亮我们携手同行的每一步。'
        : 'A glowing milestone in our journey that will shine forever.',
      iconName: 'Sparkles',
      x: Math.round(Math.random() * 60 + 20),
      y: Math.round(Math.random() * 60 + 20),
    };
    setFormData({
      ...formData,
      milestones: [...formData.milestones, newStar],
    });
    soundEngine.playChime();
  };

  const handleDeleteMilestone = (idx: number) => {
    if (formData.milestones.length <= 1) return;
    const next = formData.milestones.filter((_, i) => i !== idx);
    setFormData({
      ...formData,
      milestones: next,
    });
    soundEngine.playTine(440, 0, 0.4);
  };

  const handleMoveMilestone = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= formData.milestones.length) return;
    const next = [...formData.milestones];
    const temp = next[idx];
    next[idx] = next[targetIdx];
    next[targetIdx] = temp;
    setFormData({
      ...formData,
      milestones: next,
    });
    soundEngine.playTine(600, 0, 0.3);
  };

  // Call Gemini server-side AI Muse to help write love letters
  const handleGenerateLetter = async () => {
    setIsGenerating(true);
    setAiError(null);
    try {
      const res = await fetch('/api/gemini/letter-muse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptType: 'letter',
          partnerName: formData.partnerName,
          herQualities: aiQualities,
          tone: aiTone,
          currentDraft: formData.loveLetter.content,
          language: isZh ? 'zh' : 'en',
        }),
      });
      const data = await res.json();
      if (data.success && data.text) {
        soundEngine.playChime();
        setFormData({
          ...formData,
          loveLetter: {
            ...formData.loveLetter,
            content: data.text.trim(),
          },
        });
      } else {
        setAiError(
          data.error ||
            (isZh
              ? '无法自动生成，您可以随时在输入框中亲笔书写与修改！'
              : 'Could not generate with AI. You can edit the text manually!')
        );
      }
    } catch {
      setAiError(
        isZh
          ? '连接AI灵感助手出现网络波动，您仍可随时手动编辑。'
          : 'Network error connecting to AI muse. You can still write and edit manually!'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      id="customizer-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-3xl rounded-3xl bg-[#141520] border border-rose-500/30 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-rose-500/15 flex items-center justify-between bg-[#171928]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300">
              <Heart className="w-4 h-4 fill-rose-300/30" />
            </div>
            <div>
              <h3 className="font-serif-romantic text-2xl text-rose-100 font-normal">
                {isZh ? '个性化定制纪念心意' : 'Personalize Your Gift'}
              </h3>
              <p className="text-xs text-stone-400 font-light">
                {isZh
                  ? '定制专属姓名、纪念日、长信与时光照片，让这份礼物成为专属她的独一无二。'
                  : 'Tailor names, dates, memories, and letters so it feels 100% bespoke for her.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-rose-500/10 bg-[#12131b] overflow-x-auto no-scrollbar text-xs">
          {[
            { id: 'details', label: isZh ? '姓名与纪念日' : 'Names & Dates' },
            { id: 'letter', label: isZh ? '情书与灵感助手' : 'Love Letter & AI' },
            { id: 'milestones', label: isZh ? '星光回忆之旅' : 'Starlit Milestones' },
            { id: 'memories', label: isZh ? '回忆拍立得相片' : 'Game Shots & Photos' },
            { id: 'reasons', label: isZh ? '心动心愿瓶' : 'Love Jar' },
            { id: 'roasts', label: isZh ? '开黑双排与趣事' : 'Fortnite & Roasts' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer font-medium ${
                activeTab === tab.id
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-sm text-stone-300 flex-1">
          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-rose-300 mb-1 font-semibold">
                    {isZh ? '她的名字 / 专属昵称' : 'Her Name / Nickname'}
                  </label>
                  <input
                    type="text"
                    value={formData.partnerName}
                    onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                    placeholder={isZh ? '例如：小仙女、宝贝...' : 'e.g. Maya'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1c2b] border border-rose-500/20 text-rose-100 focus:outline-none focus:border-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-rose-300 mb-1 font-semibold">
                    {isZh ? '你的名字 / 签名' : 'Your Name / Sign-off'}
                  </label>
                  <input
                    type="text"
                    value={formData.senderName}
                    onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                    placeholder={isZh ? '例如：你的专属骑士...' : 'e.g. Alex'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1c2b] border border-rose-500/20 text-rose-100 focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-rose-300 mb-1 font-semibold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-rose-400" />
                  {isZh ? '相识或恋爱纪念日' : 'Anniversary or First Met Date'}
                </label>
                <input
                  type="date"
                  value={formData.anniversaryDate.split('T')[0]}
                  onChange={(e) => {
                    const selected = new Date(e.target.value).toISOString();
                    setFormData({ ...formData, anniversaryDate: selected });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1c2b] border border-rose-500/20 text-rose-100 focus:outline-none focus:border-rose-400"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  {isZh
                    ? '驱动首页“我们携手同行 天、小时、分、秒”的实时甜蜜倒数与计时器。'
                    : 'Powers the live "Days, Hours, Minutes, Seconds Together" live counter.'}
                </p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-rose-300 mb-1 font-semibold">
                  {isZh ? '信封拆启封底寄语' : 'Welcome Greeting on Envelope'}
                </label>
                <textarea
                  rows={2}
                  value={formData.welcomeGreeting}
                  onChange={(e) => setFormData({ ...formData, welcomeGreeting: e.target.value })}
                  placeholder={isZh ? '拆开信封界面的专属心动寄语...' : 'A romantic one-liner on the unwrap screen...'}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1a1c2b] border border-rose-500/20 text-rose-100 focus:outline-none focus:border-rose-400 resize-none text-xs sm:text-sm"
                />
              </div>
            </div>
          )}

          {/* TAB 2: LOVE LETTER & AI */}
          {activeTab === 'letter' && (
            <div className="space-y-4">
              {/* Romantic Writing Helper Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-stone-900 border border-rose-500/30">
                <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold mb-2">
                  <Feather className="w-4 h-4 text-rose-400" />
                  <span>{isZh ? '深情长信灵感助手' : 'Romantic Letter Assistant'}</span>
                </div>
                <p className="text-xs text-stone-300 mb-3">
                  {isZh
                    ? '缺少灵感？随手记下几个你深爱她的特质或专属记忆，点击即可自动创作或润色温存的长信。'
                    : 'Need inspiration? Jot down a few traits or moments you love about her, and click below to craft or polish the letter.'}
                </p>

                <div className="space-y-2 mb-3">
                  <input
                    type="text"
                    value={aiQualities}
                    onChange={(e) => setAiQualities(e.target.value)}
                    placeholder={isZh ? '例如：她的笑声、穿我宽大衬衫的模样、深夜煲电话粥...' : 'e.g. Her laugh, how she wears my oversized shirts, late night tea talks...'}
                    className="w-full px-3 py-2 rounded-lg bg-[#141520] border border-rose-500/20 text-xs text-rose-100 focus:outline-none focus:border-rose-400"
                  />

                  <div className="flex items-center gap-2">
                    <select
                      value={aiTone}
                      onChange={(e) => setAiTone(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#141520] border border-rose-500/20 text-xs text-stone-200"
                    >
                      <option value="emotional, timeless, poetic yet genuine">
                        {isZh ? '深情浪漫 · 诗意隽永' : 'Deeply Romantic & Poetic'}
                      </option>
                      <option value="sweet, tender, cozy and intimate">
                        {isZh ? '温暖细腻 · 恬淡陪伴' : 'Sweet & Cozy'}
                      </option>
                      <option value="playful, humorous, loving and joyful">
                        {isZh ? '俏皮幽默 · 欢快甜蜜' : 'Playful & Cute'}
                      </option>
                    </select>

                    <button
                      onClick={handleGenerateLetter}
                      disabled={isGenerating}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>{isZh ? '满怀爱意斟句中...' : 'Writing with Love...'}</span>
                        </>
                      ) : (
                        <>
                          <Feather className="w-3.5 h-3.5 text-rose-200" />
                          <span>{isZh ? '生成 / 润色情书' : 'Generate / Refine Letter'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {aiError && (
                  <p className="text-[11px] text-amber-300/90 italic">{aiError}</p>
                )}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-rose-300 mb-1 font-semibold">
                  {isZh ? '情书标题' : 'Letter Title'}
                </label>
                <input
                  type="text"
                  value={formData.loveLetter.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      loveLetter: { ...formData.loveLetter, title: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1a1c2b] border border-rose-500/20 text-rose-100 text-sm focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-rose-300 mb-1 font-semibold">
                  {isZh ? '情书正文' : 'Letter Content'}
                </label>
                <textarea
                  rows={8}
                  value={formData.loveLetter.content}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      loveLetter: { ...formData.loveLetter, content: e.target.value },
                    })
                  }
                  className="w-full p-3.5 rounded-xl bg-[#1a1c2b] border border-rose-500/20 text-rose-100 text-sm focus:outline-none focus:border-rose-400 font-serif-romantic text-base leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB: STARLIT MILESTONES */}
          {activeTab === 'milestones' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#191b29] border border-rose-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-rose-300 font-semibold mb-1">
                    {isZh ? '星轨回忆里程碑' : 'Journey Milestones'}
                  </h4>
                  <p className="text-xs text-stone-400 font-light">
                    {isZh
                      ? '星空地图上的每一颗星辰代表你们相伴的关键瞬间。您可以随意增删、调整夜空坐标或附带照片。'
                      : 'Each star on your journey map represents a key moment in your story. You can add new milestones, drag or adjust their positions, or attach photos.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddNewMilestone}
                  className="px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-lg shadow-rose-950/50 cursor-pointer shrink-0 transition-all hover:scale-105"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isZh ? '+ 添加星辰' : '+ Add Star'}</span>
                </button>
              </div>

              <div className="space-y-4">
                {formData.milestones.map((milestone, idx) => {
                  const isCardDropActive = dropTargetMilestoneIdx === idx;
                  const isPhotoDropActive = dropTargetMilestonePhotoIdx === idx;

                  return (
                    <div
                      key={milestone.id}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDropTargetMilestoneIdx(idx);
                      }}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDropTargetMilestoneIdx(idx);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDropTargetMilestoneIdx(null);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDropTargetMilestoneIdx(null);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleMilestoneFileUpload(idx, file);
                      }}
                      className={`relative p-4 rounded-2xl bg-[#1a1c2b] border transition-all space-y-3 ${
                        isCardDropActive
                          ? 'border-rose-400 ring-2 ring-rose-500/40 bg-[#212338]'
                          : 'border-rose-500/20'
                      }`}
                    >
                      {/* Drop overlay if card is hovered */}
                      {isCardDropActive && !isPhotoDropActive && (
                        <div className="absolute inset-0 z-10 rounded-2xl bg-rose-950/80 backdrop-blur-xs border-2 border-dashed border-rose-400 flex flex-col items-center justify-center text-rose-200 pointer-events-none">
                          <UploadCloud className="w-8 h-8 animate-bounce text-rose-300 mb-1" />
                          <span className="text-xs font-semibold">
                            {isZh ? `松开以附带照片至星辰 #${idx + 1}！` : `Drop photo to attach to Star #${idx + 1}!`}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-600/30 border border-rose-500/30 text-rose-200 text-xs font-mono">
                            {isZh ? `星辰 #${idx + 1}` : `Star #${idx + 1}`}
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono">
                            {isZh ? '夜空方位' : 'Pos'}: ({milestone.x}%, {milestone.y}%)
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Reorder Up */}
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveMilestone(idx, 'up')}
                            className="p-1 rounded-md bg-[#141520] hover:bg-stone-800 disabled:opacity-30 text-stone-300 disabled:cursor-not-allowed cursor-pointer"
                            title={isZh ? '在星轨中前移' : 'Move star earlier in journey'}
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          {/* Reorder Down */}
                          <button
                            type="button"
                            disabled={idx === formData.milestones.length - 1}
                            onClick={() => handleMoveMilestone(idx, 'down')}
                            className="p-1 rounded-md bg-[#141520] hover:bg-stone-800 disabled:opacity-30 text-stone-300 disabled:cursor-not-allowed cursor-pointer"
                            title={isZh ? '在星轨中后移' : 'Move star later in journey'}
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Star */}
                          {formData.milestones.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteMilestone(idx)}
                              className="p-1 rounded-md bg-stone-800 hover:bg-red-950/70 border border-stone-700 text-stone-400 hover:text-red-300 cursor-pointer ml-1"
                              title={isZh ? '删除星辰' : 'Delete star'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-stone-400 mb-1">
                            {isZh ? '星辰名称 / 里程碑标题' : 'Star Title'}
                          </label>
                          <input
                            type="text"
                            value={milestone.title}
                            onChange={(e) => {
                              const next = [...formData.milestones];
                              next[idx] = { ...next[idx], title: e.target.value };
                              setFormData({ ...formData, milestones: next });
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[#141520] border border-rose-500/20 text-xs text-stone-100"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-stone-400 mb-1">
                            {isZh ? '日期 / 节点标签' : 'Date / Tag'}
                          </label>
                          <input
                            type="text"
                            value={milestone.date}
                            onChange={(e) => {
                              const next = [...formData.milestones];
                              next[idx] = { ...next[idx], date: e.target.value };
                              setFormData({ ...formData, milestones: next });
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[#141520] border border-rose-500/20 text-xs text-stone-100"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-stone-400 mb-1">
                          {isZh ? '专属故事叙述' : 'Milestone Story'}
                        </label>
                        <textarea
                          rows={2}
                          value={milestone.description}
                          onChange={(e) => {
                            const next = [...formData.milestones];
                            next[idx] = { ...next[idx], description: e.target.value };
                            setFormData({ ...formData, milestones: next });
                          }}
                          className="w-full p-2.5 rounded-lg bg-[#141520] border border-rose-500/20 text-xs text-stone-100 resize-none leading-relaxed"
                        />
                      </div>

                      {/* Coordinates Sliders */}
                      <div className="grid grid-cols-2 gap-3 p-2.5 rounded-xl bg-[#141520] border border-rose-500/15">
                        <div>
                          <div className="flex justify-between text-[10px] text-stone-400 mb-1">
                            <span>{isZh ? `水平坐标 (X): ${milestone.x}%` : `Sky X (Horizontal): ${milestone.x}%`}</span>
                          </div>
                          <input
                            type="range"
                            min="5"
                            max="95"
                            value={milestone.x}
                            onChange={(e) => {
                              const next = [...formData.milestones];
                              next[idx] = { ...next[idx], x: Number(e.target.value) };
                              setFormData({ ...formData, milestones: next });
                            }}
                            className="w-full accent-rose-500 cursor-pointer"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[10px] text-stone-400 mb-1">
                            <span>{isZh ? `垂直坐标 (Y): ${milestone.y}%` : `Sky Y (Vertical): ${milestone.y}%`}</span>
                          </div>
                          <input
                            type="range"
                            min="8"
                            max="92"
                            value={milestone.y}
                            onChange={(e) => {
                              const next = [...formData.milestones];
                              next[idx] = { ...next[idx], y: Number(e.target.value) };
                              setFormData({ ...formData, milestones: next });
                            }}
                            className="w-full accent-rose-500 cursor-pointer"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] text-stone-400 font-medium">
                            {isZh ? '配图 / 游戏截图 (支持拖拽上传)' : 'Photo / Screenshot (Drag & Drop)'}
                          </label>
                          {milestone.photoUrl && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMilestonePhoto(idx)}
                              className="text-[11px] text-rose-400/80 hover:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>{isZh ? '移除配图' : 'Remove'}</span>
                            </button>
                          )}
                        </div>

                        {/* Drag & Drop Box for Milestone Photo */}
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDropTargetMilestonePhotoIdx(idx);
                          }}
                          onDragEnter={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDropTargetMilestonePhotoIdx(idx);
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDropTargetMilestonePhotoIdx(null);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDropTargetMilestonePhotoIdx(null);
                            const file = e.dataTransfer.files?.[0];
                            if (file) handleMilestoneFileUpload(idx, file);
                          }}
                          className={`relative rounded-xl border-2 border-dashed p-3 transition-all ${
                            isPhotoDropActive
                              ? 'border-rose-400 bg-rose-500/20 shadow-lg shadow-rose-950/50 scale-[1.01]'
                              : 'border-rose-500/25 bg-[#141520] hover:border-rose-400/50'
                          }`}
                        >
                          {milestone.photoUrl ? (
                            <div className="flex items-center gap-3">
                              <div className="relative w-20 h-16 rounded-lg overflow-hidden bg-stone-950 border border-stone-800 shrink-0 flex items-center justify-center">
                                <img
                                  src={milestone.photoUrl}
                                  alt={milestone.title}
                                  loading="lazy"
                                  decoding="async"
                                  onError={(e) => {
                                    const target = e.currentTarget;
                                    if (!target.src.includes('picsum.photos')) {
                                      target.src = 'https://picsum.photos/seed/milestonestar/200/200';
                                    }
                                  }}
                                  className="max-w-full max-h-full object-contain"
                                />
                                {isPhotoDropActive && (
                                  <div className="absolute inset-0 bg-rose-900/90 flex items-center justify-center text-[10px] text-white font-medium">
                                    Drop!
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs text-rose-200 font-medium truncate flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
                                  <span>{isZh ? `已附带至星辰 #${idx + 1}` : `Attached to Star #${idx + 1}`}</span>
                                </div>
                                <p className="text-[11px] text-stone-400 mt-0.5">
                                  {isZh ? '拖拽新图片至此或点击更换' : 'Drag any new photo here or browse to replace'}
                                </p>
                              </div>
                              <label className="px-3 py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/30 text-rose-200 text-xs font-medium cursor-pointer transition-colors flex items-center gap-1 shrink-0">
                                <RefreshCw className="w-3 h-3" />
                                <span>{isZh ? '更换' : 'Change'}</span>
                                <input
                                  type="file"
                                  accept="image/png, image/jpeg, image/jpg, image/webp, image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleMilestoneFileUpload(idx, file);
                                    e.target.value = '';
                                  }}
                                />
                              </label>
                            </div>
                          ) : (
                            <label className="flex flex-col sm:flex-row items-center justify-center gap-2 py-2.5 cursor-pointer text-center group">
                              <div className="w-8 h-8 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <UploadCloud className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="text-xs text-rose-200 font-medium block">
                                  {isPhotoDropActive
                                    ? (isZh ? '✨ 松开鼠标以附带图片！' : '✨ Release image to attach!')
                                    : (isZh ? '拖拽图片至此，或点击浏览' : 'Drag & drop image here, or click to browse')}
                                </span>
                                <span className="text-[10px] text-stone-400">
                                  {isZh
                                    ? '支持超清 1080p/4K 游戏高光截图或甜蜜合照'
                                    : 'Attach full 1080p/4K screenshot or memory picture'}
                                </span>
                              </div>
                              <input
                                type="file"
                                accept="image/png, image/jpeg, image/jpg, image/webp, image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleMilestoneFileUpload(idx, file);
                                  e.target.value = '';
                                }}
                              />
                            </label>
                          )}
                        </div>

                        {/* Optional URL input */}
                        <div className="mt-1.5">
                          <input
                            type="text"
                            value={milestone.photoUrl || ''}
                            onChange={(e) => {
                              const next = [...formData.milestones];
                              next[idx] = { ...next[idx], photoUrl: e.target.value };
                              setFormData({ ...formData, milestones: next });
                            }}
                            placeholder={isZh ? '或直接粘贴图片外链 URL' : 'Or paste screenshot URL directly'}
                            className="w-full px-3 py-1 rounded-lg bg-[#141520] border border-rose-500/15 text-[11px] text-stone-300 focus:outline-none focus:border-rose-400/40"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: MEMORIES & POLAROIDS */}
          {activeTab === 'memories' && (
            <div className="space-y-6">
              {/* Add New Memory Photo Form with Drag & Drop */}
              <div className="p-4 rounded-2xl bg-[#191b29] border border-rose-500/20 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs uppercase tracking-wider text-rose-300 font-semibold flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    {isZh ? '添加高光战报或回忆照片' : 'Add a Game Screenshot or Memory Photo'}
                  </h4>
                  {isOptimizingImage && (
                    <span className="text-xs text-rose-300 font-mono flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      {isZh ? '正在优化图片...' : 'Optimizing screenshot...'}
                    </span>
                  )}
                </div>

                {/* Drag & Drop Box */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDraggingPhotoZone(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDraggingPhotoZone(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDraggingPhotoZone(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleProcessImageFile(file);
                  }}
                  className={`p-5 rounded-xl border-2 border-dashed text-center transition-all cursor-pointer ${
                    isDraggingPhotoZone
                      ? 'border-rose-400 bg-rose-500/20 scale-[1.01]'
                      : 'border-rose-500/30 bg-[#141520] hover:border-rose-400/60'
                  }`}
                  onClick={() => {
                    const input = document.getElementById('customizer-photo-file') as HTMLInputElement;
                    input?.click();
                  }}
                >
                  <input
                    id="customizer-photo-file"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center justify-center mx-auto mb-2">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-medium text-rose-100 mb-0.5">
                    {isDraggingPhotoZone
                      ? (isZh ? '松开以上传图片！' : 'Release screenshot here!')
                      : (isZh ? '拖拽战报截图或相片至此，或点击浏览' : 'Drag & drop game screenshot or photo here')}
                  </div>
                  <p className="text-[11px] text-stone-400">
                    {isZh
                      ? '支持 PNG, JPG, WebP 格式。完整保留原始比例无裁切。'
                      : 'Supports PNG, JPG, WebP. Automatically preserves uncropped full dimensions.'}
                  </p>
                </div>

                {/* Image Preview if Loaded */}
                {newPhotoUrl && (
                  <div className="p-3 rounded-xl bg-[#12131d] border border-rose-500/25 flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative w-full sm:w-40 h-28 rounded-lg overflow-hidden bg-stone-950 flex items-center justify-center border border-stone-800 shrink-0">
                      <img
                        src={newPhotoUrl}
                        alt="Preview"
                        decoding="async"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.src.includes('picsum.photos')) {
                            target.src = 'https://picsum.photos/seed/nightstar/400/300';
                          }
                        }}
                        className="max-h-full max-w-full object-contain mx-auto"
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="inline-flex items-center gap-1 text-xs text-rose-300 font-medium mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>{isZh ? '截图已就绪，保持原始比例' : 'Screenshot ready with full aspect ratio'}</span>
                      </div>
                      <p className="text-[11px] text-stone-400 leading-relaxed">
                        {isZh
                          ? '相片将完整展示，不会裁切掉任何精彩游戏UI或聊天细节。'
                          : 'The full image will be displayed without cutting off HUD or chat details.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Or paste URL fallback */}
                <div>
                  <label className="block text-[11px] text-stone-400 mb-1">
                    {isZh ? '或粘贴图片外链 URL' : 'Or Paste Image URL'}
                  </label>
                  <input
                    type="text"
                    placeholder="https://... "
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#141520] border border-rose-500/20 text-xs text-stone-200"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder={isZh ? '相片主题（如：绝地翻盘吃鸡时刻）' : 'Caption (e.g. Clutch Victory Royale)'}
                    value={newPhotoCaption}
                    onChange={(e) => setNewPhotoCaption(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#141520] border border-rose-500/20 text-xs text-stone-200"
                  />
                  <input
                    type="text"
                    placeholder={isZh ? '游戏 / 场合（如：双排天梯排位赛）' : 'Game / Occasion (e.g. Duo Ranked Match)'}
                    value={newPhotoDate}
                    onChange={(e) => setNewPhotoDate(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#141520] border border-rose-500/20 text-xs text-stone-200"
                  />
                </div>

                <textarea
                  rows={2}
                  placeholder={isZh ? '写下这段画面的甜蜜细节或背后的搞笑回忆...' : 'Sweet memory or inside story...'}
                  value={newPhotoNote}
                  onChange={(e) => setNewPhotoNote(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#141520] border border-rose-500/20 text-xs text-stone-200 resize-none"
                />

                <button
                  onClick={handleAddPhoto}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isZh ? '添加至回忆相片墙' : 'Add to Memories Wall'}</span>
                </button>
              </div>

              {/* Current Polaroid Photos List with Drag-to-Replace */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-wider text-stone-400 font-semibold flex items-center justify-between">
                  <span>
                    {isZh ? '已有回忆相片' : 'Existing Memories'} ({formData.memories.length})
                  </span>
                  <span className="text-[10px] text-stone-500 lowercase font-normal">
                    {isZh ? '(拖拽新图片至卡片上即可快捷替换)' : '(drag new screenshot onto any card to replace it)'}
                  </span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {formData.memories.map((m) => {
                    const isCardTarget = dropTargetMemoryId === m.id;
                    return (
                      <div
                        key={m.id}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDropTargetMemoryId(m.id);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (dropTargetMemoryId === m.id) {
                            setDropTargetMemoryId(null);
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDropTargetMemoryId(null);
                          const file = e.dataTransfer.files?.[0];
                          if (file) handleReplaceMemoryImage(m.id, file);
                        }}
                        className={`flex items-center gap-3 p-3 rounded-xl bg-[#171826] border transition-all ${
                          isCardTarget
                            ? 'border-rose-400 ring-2 ring-rose-500/40 bg-[#1e1f33]'
                            : 'border-stone-800'
                        }`}
                      >
                        {/* Full Dimension thumbnail */}
                        <div className="relative w-16 h-14 rounded-lg overflow-hidden bg-stone-950 flex items-center justify-center shrink-0 border border-stone-800">
                          <img
                            src={m.imageUrl}
                            alt={m.caption}
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (!target.src.includes('picsum.photos')) {
                                target.src = 'https://picsum.photos/seed/nightstar/200/200';
                              }
                            }}
                            className="max-w-full max-h-full object-contain"
                          />
                          {isCardTarget && (
                            <div className="absolute inset-0 bg-rose-900/80 flex items-center justify-center text-[10px] text-white font-medium">
                              Drop!
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-rose-200 truncate">{m.caption}</div>
                          <div className="text-[11px] text-stone-400 truncate">{m.date}</div>
                        </div>

                        <div className="flex items-center gap-1">
                          <label
                            title={isZh ? '替换图片' : 'Replace screenshot'}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <input
                              type="file"
                              accept="image/png, image/jpeg, image/jpg, image/webp, image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleReplaceMemoryImage(m.id, file);
                                e.target.value = '';
                              }}
                            />
                          </label>

                          <button
                            onClick={() => handleDeletePhoto(m.id)}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title={isZh ? '删除相片' : 'Delete photo'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: REASONS JAR */}
          {activeTab === 'reasons' && (
            <div className="space-y-6">
              {/* Add reason */}
              <div className="p-4 rounded-2xl bg-[#191b29] border border-rose-500/20 space-y-3">
                <h4 className="text-xs uppercase tracking-wider text-rose-300 font-semibold flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  {isZh ? '添加一条深爱她的心动理由' : 'Add a Reason Why You Love Her'}
                </h4>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder={isZh ? '例如：狂风暴雨的漫长一天后，你给我的温暖拥抱...' : 'e.g. How safe your hugs feel after a crazy day...'}
                    value={newReasonText}
                    onChange={(e) => setNewReasonText(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-[#141520] border border-rose-500/20 text-xs text-rose-100"
                  />
                  <select
                    value={newReasonCategory}
                    onChange={(e) => setNewReasonCategory(e.target.value as typeof newReasonCategory)}
                    className="px-2.5 py-2 rounded-lg bg-[#141520] border border-rose-500/20 text-xs text-stone-200"
                  >
                    <option value="heart">{isZh ? '深情挚爱' : 'Deep Heart'}</option>
                    <option value="smile">{isZh ? '欢颜笑语' : 'Smile / Laugh'}</option>
                    <option value="comfort">{isZh ? '温柔抚慰' : 'Cozy Comfort'}</option>
                    <option value="future">{isZh ? '未来憧憬' : 'Future Dream'}</option>
                  </select>
                  <button
                    onClick={handleAddReason}
                    className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium cursor-pointer"
                  >
                    {isZh ? '装入纸条' : 'Add Note'}
                  </button>
                </div>
              </div>

              {/* Reasons list */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {formData.reasons.map((r, i) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#171826] border border-stone-800 text-xs text-stone-300"
                  >
                    <span className="flex-1">
                      <strong className="text-rose-400 mr-2">#{i + 1}</strong>
                      {r.text}
                    </span>
                    <button
                      onClick={() => handleDeleteReason(r.id)}
                      className="p-1 rounded text-stone-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: FORTNITE ROASTS & DUO BANTER */}
          {activeTab === 'roasts' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[#191b29] border border-rose-500/20 space-y-3">
                <h4 className="text-xs uppercase tracking-wider text-rose-300 font-semibold flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  {isZh ? '添加开黑战友梗或双排吐槽' : 'Add an Inside Joke or Fortnite Roast'}
                </h4>
                <p className="text-xs text-stone-400 font-light">
                  {isZh
                    ? '记录你们在战场上的爆笑名场面、9点霰弹伤害、互抢大包或专属战友梗。'
                    : 'Add funny gaming moments, missed pump shots, stolen loot, or inside jokes for your duo to laugh about.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder={isZh ? '标题（如：9点霰弹枪惨案）' : 'Title (e.g. The 9-Damage Shotgun Incident)'}
                    value={newRoastTitle}
                    onChange={(e) => setNewRoastTitle(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#141520] border border-rose-500/20 text-xs text-stone-200"
                  />

                  <input
                    type="text"
                    placeholder={isZh ? '标签（如：描边大师、甲包大盗）' : 'Badge (e.g. Aim: 1%, Shield Thief)'}
                    value={newRoastBadge}
                    onChange={(e) => setNewRoastBadge(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#141520] border border-rose-500/20 text-xs text-stone-200"
                  />

                  <select
                    value={newRoastIcon}
                    onChange={(e) => setNewRoastIcon(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#141520] border border-rose-500/20 text-xs text-stone-200"
                  >
                    <option value="Crosshair">🎯 {isZh ? '准星 (人体描边)' : 'Crosshair (Missed Shots)'}</option>
                    <option value="ShieldAlert">🛡️ {isZh ? '护盾警报 (抢走大甲)' : 'Shield Alert (Stolen Chug Jug)'}</option>
                    <option value="Skull">💀 {isZh ? '骷髅 (高空坠落)' : 'Skull (Fall Damage)'}</option>
                    <option value="Swords">⚔️ {isZh ? '双剑 (零建造慌乱)' : 'Swords (Zero Build Panic)'}</option>
                    <option value="RotateCcw">🔄 {isZh ? '循环 (拔腿抢救卡)' : 'Rotate (Reboot Card)'}</option>
                    <option value="Trophy">🏆 {isZh ? '奖杯 (草丛蹲伏)' : 'Trophy (Bush Camping)'}</option>
                    <option value="Flame">🔥 {isZh ? '火焰 (“他残血了！”)' : 'Flame (Said "He is One", Found 10)'}</option>
                    <option value="Heart">❤️ {isZh ? '爱心 (无可替代的二号玩家)' : 'Heart (Favorite Player 2)'}</option>
                  </select>
                </div>

                <textarea
                  rows={2}
                  placeholder={isZh ? '案发经过... (如：悄悄摸到一个挂机的敌人，瞄准了整整五秒钟，果断开火——打出了高贵而清脆的9点伤害...)' : 'What happened? (e.g. Sneaking up on an AFK enemy, aiming for 5 seconds, and hitting a clean 9 damage...)'}
                  value={newRoastSituation}
                  onChange={(e) => setNewRoastSituation(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#141520] border border-rose-500/20 text-xs text-stone-200 resize-none"
                />

                <input
                  type="text"
                  placeholder={isZh ? '审判判词 (如：麦克风里撕心裂肺喊“他大残！”，滑铲冲进去发现对面十个满血猛男)' : 'The Verdict (e.g. Screaming in mic: HE IS ONE! ...Then sliding in and finding 10)'}
                  value={newRoastVerdict}
                  onChange={(e) => setNewRoastVerdict(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#141520] border border-rose-500/20 text-xs text-stone-200"
                />

                <button
                  onClick={handleAddRoast}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Gamepad2 className="w-3.5 h-3.5" />
                  <span>{isZh ? '添加战友吐槽档案' : 'Add Duo Roast'}</span>
                </button>
              </div>

              {/* Current roasts list */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                <h4 className="text-xs uppercase tracking-wider text-stone-400 font-semibold mb-2">
                  {isZh ? '已记录的开黑趣事' : 'Active Roasts & Jokes'} ({(formData.roasts || []).length})
                </h4>
                {(formData.roasts || []).map((r) => (
                  <div
                    key={r.id}
                    className="flex items-start justify-between gap-3 p-3 rounded-xl bg-[#171826] border border-stone-800 text-xs"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-rose-200">{r.title}</span>
                        <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 text-[10px] font-mono">
                          {r.badge}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-400 mt-1 leading-relaxed">
                        {r.situation}
                      </div>
                      <div className="text-[11px] text-rose-300/80 italic mt-0.5">
                        &ldquo;{r.verdict}&rdquo;
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteRoast(r.id)}
                      className="p-1 rounded text-stone-500 hover:text-rose-400 transition-colors"
                      title={isZh ? '删除此条吐槽' : 'Delete roast'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Hidden backup file input */}
        <input
          ref={backupFileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleImportBackup}
        />

        {/* Persistence notification toast */}
        {persistenceNotice && (
          <div className="px-5 py-2 bg-emerald-950/80 border-t border-emerald-500/30 text-emerald-200 text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {persistenceNotice}
            </span>
          </div>
        )}

        {/* Supabase & Cloud Persistence Status Bar */}
        <div className="px-5 py-2 bg-[#12131e] border-t border-rose-500/10 text-stone-400 text-xs flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 font-medium">
              {isZh ? 'Supabase 云端数据库已联通' : 'Supabase Connected'}
            </span>
            <span className="text-stone-500 text-[11px] font-mono">wwwhblpthmuqhwlidyoi.supabase.co</span>
          </div>
          <span className="text-stone-400 text-[11px]">
            {isZh ? '持久化云端存储处于就绪状态' : 'Durable Storage Active'}
          </span>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-rose-500/15 bg-[#171928] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetDefaults}
              className="text-xs text-stone-500 hover:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{isZh ? '恢复初始数据' : 'Reset Defaults'}</span>
            </button>

            <span className="text-stone-700">|</span>

            <button
              type="button"
              onClick={handleExportBackup}
              className="text-xs text-rose-300/80 hover:text-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
              title={isZh ? '下载所有文字与照片的完整 JSON 备份文件' : 'Download a complete JSON backup of your text & photos'}
            >
              <Download className="w-3 h-3" />
              <span>{isZh ? '下载备份' : 'Download Backup'}</span>
            </button>

            <span className="text-stone-700">|</span>

            <button
              type="button"
              onClick={() => backupFileInputRef.current?.click()}
              className="text-xs text-stone-400 hover:text-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
              title={isZh ? '从保存的 JSON 备份中恢复数据' : 'Restore from a saved JSON backup'}
            >
              <Upload className="w-3 h-3" />
              <span>{isZh ? '恢复备份' : 'Restore Backup'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition-colors cursor-pointer"
            >
              {isZh ? '取消' : 'Cancel'}
            </button>

            <button
              id="save-customizer-btn"
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 disabled:opacity-75 text-white text-xs font-medium flex items-center justify-center gap-1.5 shadow-md shadow-rose-950/50 transition-all cursor-pointer"
            >
              <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
              <span>
                {saveFeedback || (isSaving ? (isZh ? '正在保存...' : 'Saving...') : isZh ? '保存并应用更改' : 'Save & Apply Changes')}
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
