'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, Eye, EyeOff, ShieldCheck, X, AlertCircle } from 'lucide-react';
import { soundEngine } from '@/lib/audio';
import { useLanguage } from '@/lib/i18n';

interface EditPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditPasswordModal({
  isOpen,
  onClose,
  onSuccess,
}: EditPasswordModalProps) {
  const { isZh } = useLanguage();
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setPasscode('');
    setError(null);
    setShake(false);
    onClose();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const normalized = passcode.trim().toLowerCase();
    if (normalized === 'deep') {
      soundEngine.playChime();
      setError(null);
      setPasscode('');
      onSuccess();
      onClose();
    } else {
      soundEngine.playTine(240, 0, 0.4);
      setError(
        isZh
          ? '暗号密码错误。编辑已锁定以守护这份珍贵的心意。'
          : 'Incorrect passcode. Editing is locked so no one ruins the gift.'
      );
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            x: shake ? [-8, 8, -6, 6, -3, 3, 0] : 0,
          }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.22 }}
          className="relative w-full max-w-md rounded-2xl bg-[#11121d] border border-rose-500/30 p-6 sm:p-7 shadow-2xl shadow-black/90 overflow-hidden text-stone-200"
        >
          {/* Subtle atmospheric glow */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-rose-200 hover:bg-stone-800/80 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center text-center">
            {/* Lock Icon Emblem */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-600/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-inner shadow-rose-500/20">
              <Lock className="w-7 h-7" />
            </div>

            <h3 className="font-serif-romantic text-2xl text-rose-100 font-normal mb-1">
              {isZh ? '专属心动圣地 · 密码保护' : 'Protected Gift Sanctuary'}
            </h3>

            <p className="text-xs text-stone-400 font-light leading-relaxed max-w-xs mb-5">
              {isZh
                ? '本纪念网站已开启保护模式，防止深情长信、星辰轨迹、回忆照片被意外篡改。请输入专属暗号密码以解锁编辑。'
                : 'This anniversary website is locked so its love letter, milestones, photos, and words cannot be accidentally edited or ruined. Enter the secret passcode to unlock editing.'}
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <div className="relative">
                <input
                  ref={inputRef}
                  type={showPassword ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder={isZh ? '请输入暗号密码...' : 'Enter secret passcode...'}
                  className="w-full pl-4 pr-11 py-3 rounded-xl bg-[#090a12] border border-rose-500/30 text-rose-100 placeholder-stone-500 text-sm focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400/50 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors p-1"
                  aria-label={showPassword ? 'Hide passcode' : 'Show passcode'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Error feedback */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-xs text-left"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 rounded-xl border border-stone-700 bg-stone-800/50 text-stone-300 hover:bg-stone-800 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  {isZh ? '取消' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-medium shadow-lg shadow-rose-950/60 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>{isZh ? '解锁编辑' : 'Unlock Edits'}</span>
                </button>
              </div>
            </form>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 mt-4">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400/60" />
              <span>{isZh ? '唯有专属之人知晓这枚心之钥匙' : 'Only the creator holds the key'}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
