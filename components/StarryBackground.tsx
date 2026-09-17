'use client';

import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  baseAlpha: number;
  twinkleSpeed: number;
  color: string;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
  active: boolean;
}

interface StardustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  hue: number;
  pulseSpeed: number;
}

export default function StarryBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
      initStardust();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Stars pool
    const starCount = Math.min(240, Math.floor((width * height) / 5500));
    let stars: Star[] = [];

    const starPalette = [
      '#ffffff',
      '#fef3c7', // warm champagne
      '#fde68a', // starlight gold
      '#e0e7ff', // starlight blue
      '#f1f5f9', // crisp celestial white
      '#fafaf9', // warm starlight
    ];

    const initStars = () => {
      stars = [];
      for (let i = 0; i < starCount; i++) {
        const baseAlpha = Math.random() * 0.7 + 0.2;
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.5 + 0.4,
          alpha: baseAlpha,
          baseAlpha,
          twinkleSpeed: Math.random() * 0.025 + 0.006,
          color: starPalette[Math.floor(Math.random() * starPalette.length)],
        });
      }
    };

    // Warm floating stardust embers / fairy lights
    const stardustCount = 35;
    let stardust: StardustParticle[] = [];

    const initStardust = () => {
      stardust = [];
      for (let i = 0; i < stardustCount; i++) {
        stardust.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -Math.random() * 0.5 - 0.15, // gently floating upward
          radius: Math.random() * 2.0 + 0.6,
          alpha: Math.random() * 0.5 + 0.2,
          hue: 45, // pure warm golden starlight
          pulseSpeed: Math.random() * 0.03 + 0.01,
        });
      }
    };

    initStars();
    initStardust();

    // Shooting stars
    const shootingStars: ShootingStar[] = [];
    const spawnShootingStar = () => {
      shootingStars.push({
        x: Math.random() * width * 0.85,
        y: Math.random() * height * 0.35,
        length: Math.random() * 90 + 50,
        speed: Math.random() * 9 + 7,
        angle: (Math.PI / 4) + (Math.random() * 0.2 - 0.1),
        alpha: 1,
        active: true,
      });
    };

    let shootingStarInterval = setInterval(() => {
      if (Math.random() > 0.3) {
        spawnShootingStar();
      }
    }, 4000);

    let frame = 0;
    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Deep space celestial gradient
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#090a0f');
      grad.addColorStop(0.5, '#0c0d16');
      grad.addColorStop(1, '#08080d');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Subtle atmospheric starlight depth
      const depthGlow = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        100,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.75
      );
      depthGlow.addColorStop(0, 'rgba(15, 17, 30, 0.4)');
      depthGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = depthGlow;
      ctx.fillRect(0, 0, width, height);

      // Interactive mouse starlight halo
      if (mouseRef.current.active) {
        const mouseGlow = ctx.createRadialGradient(
          mouseRef.current.x,
          mouseRef.current.y,
          0,
          mouseRef.current.x,
          mouseRef.current.y,
          180
        );
        mouseGlow.addColorStop(0, 'rgba(244, 63, 94, 0.08)');
        mouseGlow.addColorStop(0.5, 'rgba(251, 207, 232, 0.02)');
        mouseGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = mouseGlow;
        ctx.fillRect(0, 0, width, height);
      }

      // Render static/twinkling stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.alpha = star.baseAlpha + Math.sin(frame * star.twinkleSpeed + i) * 0.35;
        const clampedAlpha = Math.max(0.1, Math.min(1, star.alpha));

        ctx.save();
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = clampedAlpha;
        ctx.shadowBlur = star.radius > 1.2 ? 7 : 3;
        ctx.shadowColor = star.color;
        ctx.fill();
        ctx.restore();
      }

      // Render floating fairy stardust / fireflies
      for (let i = 0; i < stardust.length; i++) {
        const p = stardust[i];
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around gracefully
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const pulseAlpha = Math.max(0.1, p.alpha + Math.sin(frame * p.pulseSpeed + i) * 0.25);

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 85%, 75%, ${pulseAlpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `hsla(${p.hue}, 90%, 70%, ${pulseAlpha})`;
        ctx.fill();
        ctx.restore();
      }

      // Render shooting stars with romantic rose-gold tail
      for (let i = 0; i < shootingStars.length; i++) {
        const s = shootingStars[i];
        if (!s.active) continue;

        ctx.save();
        ctx.beginPath();
        ctx.globalAlpha = Math.max(0, s.alpha);

        const endX = s.x - Math.cos(s.angle) * s.length;
        const endY = s.y - Math.sin(s.angle) * s.length;

        const sGrad = ctx.createLinearGradient(s.x, s.y, endX, endY);
        sGrad.addColorStop(0, '#ffffff');
        sGrad.addColorStop(0.3, '#fbcfe8');
        sGrad.addColorStop(0.7, 'rgba(244, 63, 94, 0.4)');
        sGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.strokeStyle = sGrad;
        ctx.lineWidth = 2.2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffe4e6';
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Little bright head glow
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();

        // Move
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.alpha -= 0.014;

        if (s.alpha <= 0 || s.x > width + 120 || s.y > height + 120) {
          s.active = false;
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(shootingStarInterval);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      id="starry-canvas"
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}
