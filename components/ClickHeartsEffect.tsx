'use client';

import React, { useEffect, useState } from 'react';

interface HeartSpark {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  vx: number;
}

export default function ClickHeartsEffect() {
  const [sparks, setSparks] = useState<HeartSpark[]>([]);

  useEffect(() => {
    let nextId = 0;

    const colors = [
      '#f43f5e', // rose-500
      '#fb7185', // rose-400
      '#fda4af', // rose-300
      '#f472b6', // pink-400
      '#e879f9', // fuchsia-400
      '#fef08a', // warm gold
    ];

    const handleClick = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;

      if ('touches' in e) {
        if (e.touches.length === 0) return;
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }

      // Spawn 3-5 gentle floating hearts
      const count = Math.floor(Math.random() * 3) + 3;
      const newSparks: HeartSpark[] = [];

      for (let i = 0; i < count; i++) {
        newSparks.push({
          id: nextId++,
          x: clientX + (Math.random() - 0.5) * 24,
          y: clientY + (Math.random() - 0.5) * 16,
          size: Math.random() * 12 + 10,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: (Math.random() - 0.5) * 45,
          vx: (Math.random() - 0.5) * 40,
        });
      }

      setSparks((prev) => [...prev.slice(-20), ...newSparks]);
    };

    window.addEventListener('click', handleClick);

    // Clean up expired sparks every 1.5s
    const cleanupInterval = setInterval(() => {
      setSparks((prev) => (prev.length > 0 ? prev.slice(-15) : prev));
    }, 1500);

    return () => {
      window.removeEventListener('click', handleClick);
      clearInterval(cleanupInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {sparks.map((spark) => (
        <div
          key={spark.id}
          className="absolute animate-fade-heart"
          style={{
            left: `${spark.x}px`,
            top: `${spark.y}px`,
            transform: `translate(-50%, -50%) rotate(${spark.rotation}deg)`,
            '--vx': `${spark.vx}px`,
          } as React.CSSProperties}
        >
          <svg
            width={spark.size}
            height={spark.size}
            viewBox="0 0 24 24"
            fill={spark.color}
            stroke="none"
            className="filter drop-shadow-[0_2px_6px_rgba(244,63,94,0.45)]"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      ))}
    </div>
  );
}
