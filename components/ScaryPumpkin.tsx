'use client';

import React, { useId } from 'react';

interface ScaryPumpkinProps {
  side?: 'left' | 'right';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  rotation?: number | string;
}

export default function ScaryPumpkin({
  side = 'left',
  className = '',
  size = 'md',
  rotation,
}: ScaryPumpkinProps) {
  const isRight = side === 'right';
  const reactId = useId().replace(/:/g, '');

  const sizeClasses = {
    sm: 'w-20 h-16 sm:w-24 sm:h-20',
    md: 'w-24 h-20 sm:w-32 sm:h-26 md:w-36 md:h-30',
    lg: 'w-28 h-24 sm:w-36 sm:h-30 md:w-44 md:h-36',
  }[size];

  const uniqueId = `pumpkin-${side}-${reactId}`;

  // Direct screen rotation
  const transformStyle: React.CSSProperties = {
    transform: rotation !== undefined ? `rotate(${typeof rotation === 'number' ? `${rotation}deg` : rotation})` : undefined,
  };

  return (
    <div
      aria-label="Scary Pumpkin"
      style={transformStyle}
      className={`relative group pointer-events-auto select-none transition-transform duration-500 hover:scale-110 cursor-pointer ${className}`}
    >
      <svg
        viewBox="0 0 130 110"
        className={`${sizeClasses} ${isRight ? 'scale-x-[-1]' : ''} drop-shadow-[0_12px_28px_rgba(0,0,0,0.95)]`}
      >
        <defs>
          {/* Surface: Charcoal black with deep indigo, purple & magenta undertones */}
          <radialGradient id={`pumpBody-${uniqueId}`} cx="52%" cy="46%" r="58%" fx="42%" fy="32%">
            <stop offset="0%" stopColor="#251633" />
            <stop offset="35%" stopColor="#1a1126" />
            <stop offset="70%" stopColor="#100b18" />
            <stop offset="92%" stopColor="#0a0710" />
            <stop offset="100%" stopColor="#060509" />
          </radialGradient>

          {/* Controlled neon magenta/purple rim lighting on outer edges */}
          <linearGradient id={`pumpRim-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e879f9" stopOpacity="0.55" />
            <stop offset="30%" stopColor="#c026d3" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#818cf8" stopOpacity="0.25" />
            <stop offset="85%" stopColor="#4c1d95" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#2e1065" stopOpacity="0.6" />
          </linearGradient>

          {/* Carve Core: Rich hot pink, crimson, and subtle warm orange core */}
          <linearGradient id={`fireCarve-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fff1f2" />
            <stop offset="18%" stopColor="#fed7aa" />
            <stop offset="38%" stopColor="#fda4af" />
            <stop offset="62%" stopColor="#fb7185" />
            <stop offset="82%" stopColor="#f43f5e" />
            <stop offset="94%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#881337" />
          </linearGradient>

          {/* Stem gradient: Dark charcoal with purple-magenta edge accent */}
          <linearGradient id={`stemBody-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2e1065" />
            <stop offset="40%" stopColor="#1c1917" />
            <stop offset="100%" stopColor="#0c0a09" />
          </linearGradient>

          <linearGradient id={`stemEdge-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d946ef" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#581c87" stopOpacity="0.3" />
          </linearGradient>

          {/* Multi-tier cinematic bloom filter */}
          <filter id={`carveBloom-${uniqueId}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.5" result="blur1" />
            <feGaussianBlur stdDeviation="4.5" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Twisted spooky dark stem with subtle purple edge lighting */}
        <path
          d="M65 24 C68 14 63 7 51 3 C56 7 59 13 58 24 Z"
          fill={`url(#stemBody-${uniqueId})`}
          stroke={`url(#stemEdge-${uniqueId})`}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Organic sculpted pumpkin silhouette with neon magenta/purple rim highlight */}
        <path
          d="M 65 24 
             C 78 22, 98 28, 108 42 
             C 120 58, 122 78, 106 94 
             C 94 104, 76 102, 65 99 
             C 54 102, 36 104, 24 94 
             C 8 78, 10 58, 22 42 
             C 32 28, 52 22, 65 24 Z"
          fill={`url(#pumpBody-${uniqueId})`}
          stroke={`url(#pumpRim-${uniqueId})`}
          strokeWidth="1.2"
        />

        {/* Internal rib ridges with subtle colored bounce light spill */}
        <path d="M 46 27 C 32 42 32 82 48 98" fill="none" stroke="#25122e" strokeWidth="2" opacity="0.85" />
        <path d="M 84 27 C 98 42 98 82 82 98" fill="none" stroke="#25122e" strokeWidth="2" opacity="0.85" />
        <path d="M 65 25 C 57 45 57 80 65 99" fill="none" stroke="#1d0e24" strokeWidth="1.8" opacity="0.8" />

        {/* Creepy angular triangular eyes with hot pink, crimson & warm orange core glow */}
        <g filter={`url(#carveBloom-${uniqueId})`}>
          <polygon
            points="40,48 53,55 42,60"
            fill={`url(#fireCarve-${uniqueId})`}
          />
          <polygon
            points="90,48 77,55 88,60"
            fill={`url(#fireCarve-${uniqueId})`}
          />

          {/* Menacing carved nose */}
          <polygon
            points="65,58 60,65 70,65"
            fill={`url(#fireCarve-${uniqueId})`}
          />

          {/* Menacing jagged evil grin with sharp teeth and rich glowing core */}
          <path
            d="M 34 72 Q 65 98 96 72 Q 86 81 80 75 Q 75 86 70 75 Q 65 87 60 75 Q 55 86 50 76 Q 44 82 34 72 Z"
            fill={`url(#fireCarve-${uniqueId})`}
          />
        </g>
      </svg>
    </div>
  );
}
