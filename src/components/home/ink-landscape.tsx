"use client";

import { useEffect, useRef, useState } from "react";
import { InkSun } from "./ink-sun";
import { InkMountains } from "./ink-mountains";
import { JapaneseTree } from "./japanese-tree";

export function InkLandscape() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Raw target position from mouse/pointer
  const targetParallax = useRef({ x: 0, y: 0 });
  // Lerped animated position for silky 60fps 3D motion
  const [currentParallax, setCurrentParallax] = useState({ x: 0, y: 0 });

  const [isReducedMotion, setIsReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Lerp Animation Loop & Pointer Listeners
  useEffect(() => {
    if (isReducedMotion) return;

    let animationFrameId: number;
    let idleAngle = 0;

    const updateParallax = () => {
      idleAngle += 0.015;

      // Ambient gentle floating motion when idle / mobile
      const ambientX = Math.sin(idleAngle) * 0.25;
      const ambientY = Math.cos(idleAngle * 0.7) * 0.18;

      const destX = targetParallax.current.x + ambientX;
      const destY = targetParallax.current.y + ambientY;

      setCurrentParallax((prev) => {
        const dx = destX - prev.x;
        const dy = destY - prev.y;

        // Smooth dampening (0.08 lerp factor)
        return {
          x: prev.x + dx * 0.08,
          y: prev.y + dy * 0.08,
        };
      });

      animationFrameId = requestAnimationFrame(updateParallax);
    };

    animationFrameId = requestAnimationFrame(updateParallax);

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calculate normalized offsets (-1 to 1)
      const normX = (e.clientX - centerX) / (window.innerWidth / 2);
      const normY = (e.clientY - centerY) / (window.innerHeight / 2);

      targetParallax.current = {
        x: Math.max(-1, Math.min(1, normX)),
        y: Math.max(-1, Math.min(1, normY)),
      };
    };

    const handleMouseLeave = () => {
      targetParallax.current = { x: 0, y: 0 };
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isReducedMotion]);

  const px = currentParallax.x;
  const py = currentParallax.y;

  // 3D Perspective Transforms
  const containerTilt = isReducedMotion
    ? "none"
    : `perspective(1200px) rotateY(${px * 10}deg) rotateX(${-py * 8}deg)`;

  const layerSky = isReducedMotion
    ? "none"
    : `translate3d(${px * 8}px, ${py * 8}px, -40px)`;

  const layerDistantPeaks = isReducedMotion
    ? "none"
    : `translate3d(${px * 16}px, ${py * 16}px, -20px)`;

  const layerMainPeaks = isReducedMotion
    ? "none"
    : `translate3d(${px * 28}px, ${py * 28}px, 0px)`;

  const layerForeground = isReducedMotion
    ? "none"
    : `translate3d(${px * 44}px, ${py * 44}px, 35px)`;

  const layerFloating3D = isReducedMotion
    ? "none"
    : `translate3d(${px * 65}px, ${py * 65}px, 60px)`;

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/3] md:aspect-[16/11] max-w-[660px] mx-auto select-none overflow-visible pointer-events-none transition-transform duration-100 ease-out"
      style={{ transform: containerTilt, transformStyle: "preserve-3d" }}
      aria-hidden="true"
    >
      <style jsx global>{`
        @keyframes driftNeedle3D-1 {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg) scale(0.8);
            opacity: 0;
          }
          15% {
            opacity: 0.95;
          }
          85% {
            opacity: 0.8;
          }
          100% {
            transform: translate3d(-240px, 140px, 80px) rotate(220deg) scale(1.25);
            opacity: 0;
          }
        }

        @keyframes driftNeedle3D-2 {
          0% {
            transform: translate3d(0, 0, 0) rotate(25deg) scale(0.9);
            opacity: 0;
          }
          20% {
            opacity: 0.9;
          }
          80% {
            opacity: 0.7;
          }
          100% {
            transform: translate3d(-310px, 180px, 50px) rotate(-180deg) scale(0.75);
            opacity: 0;
          }
        }

        @keyframes driftNeedle3D-3 {
          0% {
            transform: translate3d(0, 0, 0) rotate(-15deg) scale(1.1);
            opacity: 0;
          }
          10% {
            opacity: 0.85;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translate3d(-280px, 120px, 100px) rotate(290deg) scale(0.9);
            opacity: 0;
          }
        }

        @keyframes driftBirds {
          0% {
            transform: translate3d(0, 0, 0) scale(0.9);
          }
          50% {
            transform: translate3d(-40px, -15px, 0) scale(1.05);
          }
          100% {
            transform: translate3d(0, 0, 0) scale(0.9);
          }
        }

        @keyframes foliageSway {
          0%, 100% {
            transform: rotate(0deg) translate3d(0, 0, 0);
          }
          50% {
            transform: rotate(1.6deg) translate3d(-3px, 2px, 0);
          }
        }

        @keyframes sunPulse {
          0%, 100% {
            opacity: 0.9;
            transform: scale(1);
          }
          50% {
            opacity: 0.98;
            transform: scale(1.03);
          }
        }

        @keyframes manBreathing {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(-0.5px, -1px, 0) rotate(-0.5deg);
          }
        }

        .animate-needle-1 {
          animation: driftNeedle3D-1 12s ease-in-out infinite;
        }
        .animate-needle-2 {
          animation: driftNeedle3D-2 16s ease-in-out 3.5s infinite;
        }
        .animate-needle-3 {
          animation: driftNeedle3D-3 14s ease-in-out 7s infinite;
        }
        .animate-birds {
          animation: driftBirds 22s ease-in-out infinite;
        }
        .animate-foliage {
          animation: foliageSway 7.5s ease-in-out infinite;
          transform-origin: 660px 310px;
        }
        .animate-sun {
          animation: sunPulse 9s ease-in-out infinite;
          transform-origin: 680px 140px;
        }
        .animate-man-subtle {
          animation: manBreathing 6s ease-in-out infinite;
          transform-origin: 612px 480px;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-needle-1,
          .animate-needle-2,
          .animate-needle-3,
          .animate-birds,
          .animate-foliage,
          .animate-sun,
          .animate-man-subtle {
            animation: none !important;
          }
        }
      `}</style>

      {/* Main Vector Canvas */}
      <svg
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Layer 1: Sky Base Blend */}
        <rect width="800" height="600" fill="#F7F2E9" />

        {/* 3D DEPTH LAYER 1: SKY & RED SUN */}
        <g style={{ transform: layerSky, transition: "transform 0.15s ease-out", transformStyle: "preserve-3d" }}>
          <InkSun className="animate-sun" />
        </g>

        {/* 3D DEPTH LAYER 2: FLYING BIRDS & DISTANT SKY */}
        <g style={{ transform: layerDistantPeaks, transition: "transform 0.15s ease-out", transformStyle: "preserve-3d" }}>
          <g className="animate-birds" opacity="0.75" stroke="#2B2925" strokeWidth="1.8" strokeLinecap="round" fill="none">
            <path d="M 320 220 Q 326 214 332 220 Q 338 214 344 220" />
            <path d="M 350 205 Q 354 200 359 205 Q 364 200 368 205" />
            <path d="M 480 180 Q 485 175 490 180 Q 495 175 500 180" />
            <path d="M 508 168 Q 512 163 516 168 Q 520 163 524 168" opacity="0.8" />
            <path d="M 280 250 Q 284 246 288 250 Q 292 246 296 250" opacity="0.65" />
          </g>
        </g>

        {/* 3D DEPTH LAYER 3: MOUNTAINS & MISTY LAKE */}
        <g style={{ transform: layerMainPeaks, transition: "transform 0.15s ease-out", transformStyle: "preserve-3d" }}>
          <InkMountains />
        </g>

        {/* 3D DEPTH LAYER 4: FOREGROUND CLIFF, MAN & JAPANESE PINE TREE */}
        <g style={{ transform: layerForeground, transition: "transform 0.15s ease-out", transformStyle: "preserve-3d" }}>
          <JapaneseTree />
        </g>

        {/* 3D DEPTH LAYER 5: DRIFTING 3D PARTICLES (NEEDLES & VERMILION PETALS) */}
        <g style={{ transform: layerFloating3D, transition: "transform 0.15s ease-out", transformStyle: "preserve-3d" }}>
          {/* Drifting Pine Needle / Vermilion Petal 1 */}
          <g className="animate-needle-1" style={{ transformOrigin: "470px 265px" }}>
            <path
              d="M 470 265 C 476 258, 488 260, 492 268 C 488 275, 476 275, 470 265 Z"
              fill="#A52A20"
            />
          </g>

          {/* Drifting Sumi Needle Particle 2 */}
          <g className="animate-needle-2" style={{ transformOrigin: "410px 240px" }}>
            <path
              d="M 410 240 C 418 232, 428 234, 432 243 C 424 250, 414 248, 410 240 Z"
              fill="#171717"
            />
          </g>

          {/* Drifting Vermilion Blossom Particle 3 */}
          <g className="animate-needle-3" style={{ transformOrigin: "350px 215px" }}>
            <path
              d="M 350 215 C 356 208, 366 210, 370 218 Q 362 225, 350 215 Z"
              fill="#A52A20"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
