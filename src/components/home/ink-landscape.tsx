"use client";

import { useEffect, useRef, useState } from "react";

export function InkLandscape() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [isReducedMotion, setIsReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (isReducedMotion) return;

    // Detect if device supports touch as primary input
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    if (isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calculate normalized offsets (-1 to 1)
      const normX = (e.clientX - centerX) / (window.innerWidth / 2);
      const normY = (e.clientY - centerY) / (window.innerHeight / 2);

      // Bound values
      const clampedX = Math.max(-1, Math.min(1, normX));
      const clampedY = Math.max(-1, Math.min(1, normY));

      setParallax({ x: clampedX, y: clampedY });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isReducedMotion]);

  // Transform offsets for planes
  const backTransform = isReducedMotion
    ? "none"
    : `translate3d(${parallax.x * 1}px, ${parallax.y * 1}px, 0)`;

  const midTransform = isReducedMotion
    ? "none"
    : `translate3d(${parallax.x * 2.5}px, ${parallax.y * 2.5}px, 0)`;

  const frontTransform = isReducedMotion
    ? "none"
    : `translate3d(${parallax.x * 4}px, ${parallax.y * 4}px, 0)`;

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/3] md:aspect-[16/11] max-w-[560px] mx-auto select-none overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm pointer-events-none"
      aria-hidden="true"
    >
      <style jsx global>{`
        @keyframes driftLeaf1 {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg) scale(0.8);
            opacity: 0;
          }
          15% {
            opacity: 0.85;
          }
          85% {
            opacity: 0.75;
          }
          100% {
            transform: translate3d(-140px, 90px, 0) rotate(160deg) scale(1.1);
            opacity: 0;
          }
        }

        @keyframes driftLeaf2 {
          0% {
            transform: translate3d(0, 0, 0) rotate(20deg) scale(0.9);
            opacity: 0;
          }
          20% {
            opacity: 0.9;
          }
          80% {
            opacity: 0.6;
          }
          100% {
            transform: translate3d(-180px, 110px, 0) rotate(-140deg) scale(0.7);
            opacity: 0;
          }
        }

        @keyframes driftLeaf3 {
          0% {
            transform: translate3d(0, 0, 0) rotate(-10deg) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.5;
          }
          100% {
            transform: translate3d(-160px, 75px, 0) rotate(210deg) scale(0.85);
            opacity: 0;
          }
        }

        @keyframes driftLeaf4 {
          0% {
            transform: translate3d(0, 0, 0) rotate(45deg) scale(0.75);
            opacity: 0;
          }
          25% {
            opacity: 0.85;
          }
          85% {
            opacity: 0.4;
          }
          100% {
            transform: translate3d(-200px, 130px, 0) rotate(-90deg) scale(1.05);
            opacity: 0;
          }
        }

        @keyframes foliageSway {
          0%, 100% {
            transform: rotate(0deg) translate3d(0, 0, 0);
          }
          50% {
            transform: rotate(0.8deg) translate3d(-1.5px, 1px, 0);
          }
        }

        @keyframes sunPulse {
          0%, 100% {
            opacity: 0.88;
          }
          50% {
            opacity: 0.94;
          }
        }

        .animate-leaf-1 {
          animation: driftLeaf1 14s ease-in-out infinite;
        }
        .animate-leaf-2 {
          animation: driftLeaf2 18s ease-in-out 3s infinite;
        }
        .animate-leaf-3 {
          animation: driftLeaf3 16s ease-in-out 7s infinite;
        }
        .animate-leaf-4 {
          animation: driftLeaf4 20s ease-in-out 11s infinite;
        }
        .animate-leaf-5 {
          animation: driftLeaf1 17s ease-in-out 5s infinite;
        }
        .animate-leaf-6 {
          animation: driftLeaf2 15s ease-in-out 9s infinite;
        }

        .animate-foliage {
          animation: foliageSway 8s ease-in-out infinite;
          transform-origin: 80% 30%;
        }

        .animate-sun {
          animation: sunPulse 12s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-leaf-1,
          .animate-leaf-2,
          .animate-leaf-3,
          .animate-leaf-4,
          .animate-leaf-5,
          .animate-leaf-6,
          .animate-foliage,
          .animate-sun {
            animation: none !important;
          }
        }
      `}</style>

      {/* SVG Canvas */}
      <svg
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover"
      >
        <defs>
          {/* Subtle Paper & Atmospheric Gradients */}
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F7F2E9" />
            <stop offset="60%" stopColor="#F1EBE0" />
            <stop offset="100%" stopColor="#EADECB" />
          </linearGradient>

          <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#A52A20" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#A52A20" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8A2118" stopOpacity="0.65" />
          </radialGradient>

          <linearGradient id="mistGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F7F2E9" stopOpacity="0" />
            <stop offset="70%" stopColor="#F1EBE0" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#E8DFCF" stopOpacity="0.9" />
          </linearGradient>

          {/* Ink Filters */}
          <filter id="inkBleed" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        {/* Layer 1: Atmospheric Background */}
        <rect width="800" height="600" fill="url(#skyGrad)" />

        {/* LAYER - BACK PLANE */}
        <g style={{ transform: backTransform, transition: "transform 0.2s ease-out" }}>
          {/* Vermilion Imperfect Sun */}
          <g className="animate-sun">
            <path
              d="M 280 230 C 280 160, 390 155, 390 230 C 390 305, 275 300, 280 230 Z"
              fill="url(#sunGrad)"
              filter="url(#inkBleed)"
            />
          </g>

          {/* Distant Pale Mountains */}
          <path
            d="M -20 420 Q 90 280 220 340 T 480 310 Q 620 250 820 380 L 820 600 L -20 600 Z"
            fill="#C3BAAA"
            opacity="0.32"
            filter="url(#inkBleed)"
          />

          <path
            d="M 120 400 Q 260 250 410 320 T 720 280 L 820 410 L 820 600 L 120 600 Z"
            fill="#B4AA98"
            opacity="0.25"
          />

          {/* Distant Birds */}
          <g opacity="0.6" stroke="#2B2925" strokeWidth="1.8" strokeLinecap="round" fill="none">
            {/* Group 1 */}
            <path d="M 180 180 Q 186 174 192 180 Q 198 174 204 180" />
            <path d="M 206 168 Q 210 163 215 168 Q 220 163 224 168" />
            {/* Group 2 */}
            <path d="M 450 140 Q 455 135 460 140 Q 465 135 470 140" />
            <path d="M 474 132 Q 477 128 481 132 Q 485 128 489 132" opacity="0.7" />
          </g>
        </g>

        {/* LAYER - MIDDLE PLANE */}
        <g style={{ transform: midTransform, transition: "transform 0.2s ease-out" }}>
          {/* Main Mountain Silhouettes */}
          <path
            d="M -10 460 Q 140 330 290 390 T 590 350 Q 710 320 810 420 L 810 600 L -10 600 Z"
            fill="#4A4740"
            opacity="0.55"
            filter="url(#inkBleed)"
          />

          {/* Ground/Shore & Water Strokes */}
          <path
            d="M -20 510 C 180 490 320 530 540 500 C 680 480 760 515 820 505 L 820 600 L -20 600 Z"
            fill="#23211E"
            opacity="0.85"
          />

          {/* Soft Water Ink Reflections */}
          <g stroke="#171717" strokeWidth="1.2" opacity="0.25" strokeLinecap="round">
            <line x1="120" y1="525" x2="260" y2="525" />
            <line x1="80" y1="535" x2="190" y2="535" />
            <line x1="310" y1="540" x2="480" y2="540" />
            <line x1="240" y1="552" x2="380" y2="552" />
            <line x1="520" y1="530" x2="680" y2="530" />
          </g>

          {/* Atmospheric Mist Layer */}
          <rect y="380" width="800" height="220" fill="url(#mistGrad)" />
        </g>

        {/* LAYER - FOREGROUND PLANE (Tree, Foliage & Floating Leaves) */}
        <g style={{ transform: frontTransform, transition: "transform 0.2s ease-out" }}>
          {/* Main Tree Trunk & Major Branches (Ink Textured) */}
          <g stroke="#171717" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Trunk */}
            <path
              d="M 690 540 C 680 470 660 380 640 300 C 630 260 615 220 590 180 C 585 172 580 160 575 140"
              strokeWidth="18"
              filter="url(#inkBleed)"
            />
            <path
              d="M 685 540 C 678 470 658 380 638 300 C 628 260 613 220 588 180"
              strokeWidth="10"
              stroke="#2B2925"
            />

            {/* Left Primary Branch extending toward center */}
            <path
              d="M 635 310 C 580 290 520 280 460 290 C 420 298 380 315 340 330"
              strokeWidth="8"
              filter="url(#inkBleed)"
            />
            <path
              d="M 460 290 C 430 260 390 240 350 230"
              strokeWidth="4.5"
            />
            <path
              d="M 390 310 C 360 330 330 355 290 370"
              strokeWidth="3.5"
            />

            {/* Upper Right Branches */}
            <path
              d="M 600 200 C 610 160 635 120 670 90"
              strokeWidth="6"
              filter="url(#inkBleed)"
            />
            <path
              d="M 620 140 C 600 110 570 90 530 80"
              strokeWidth="4"
            />
          </g>

          {/* Clustered Ink Foliage (Swaying gently) */}
          <g className="animate-foliage" fill="#171717" opacity="0.92" filter="url(#inkBleed)">
            {/* Foliage Cluster 1 - Upper Right */}
            <path d="M 650 80 Q 710 40 730 100 Q 710 140 650 110 Q 610 90 650 80 Z" />
            <path d="M 520 70 Q 570 40 590 90 Q 560 120 510 100 Q 490 80 520 70 Z" />

            {/* Foliage Cluster 2 - Mid Left (Overhang) */}
            <path d="M 430 270 Q 480 230 510 280 Q 470 320 420 300 Q 390 280 430 270 Z" />
            <path d="M 330 215 Q 380 185 410 230 Q 370 260 320 245 Q 300 225 330 215 Z" />

            {/* Foliage Cluster 3 - Lower Overhang Branch */}
            <path d="M 320 310 Q 370 290 380 340 Q 340 370 290 350 Q 280 320 320 310 Z" />
            <path d="M 270 355 Q 310 340 320 380 Q 280 400 250 380 Q 240 360 270 355 Z" />
          </g>

          {/* Accent Vermilion Leaves on Tree */}
          <g fill="#A52A20" opacity="0.85">
            <circle cx="450" cy="265" r="4" />
            <circle cx="360" cy="225" r="3.5" />
            <circle cx="330" cy="325" r="4.5" />
            <circle cx="660" cy="95" r="5" />
          </g>

          {/* FLOATING LEAF ANIMATIONS (Drifting softly in wind) */}
          <g>
            {/* Leaf 1 */}
            <g className="animate-leaf-1" style={{ transformOrigin: "470px 270px" }}>
              <path
                d="M 470 270 C 475 264 485 266 488 272 C 485 278 475 278 470 270 Z"
                fill="#A52A20"
              />
            </g>

            {/* Leaf 2 */}
            <g className="animate-leaf-2" style={{ transformOrigin: "440px 285px" }}>
              <path
                d="M 440 285 C 446 279 454 280 458 287 C 452 293 444 292 440 285 Z"
                fill="#171717"
              />
            </g>

            {/* Leaf 3 */}
            <g className="animate-leaf-3" style={{ transformOrigin: "360px 230px" }}>
              <path
                d="M 360 230 C 365 224 374 225 377 232 C 373 237 364 237 360 230 Z"
                fill="#A52A20"
              />
            </g>

            {/* Leaf 4 */}
            <g className="animate-leaf-4" style={{ transformOrigin: "380px 330px" }}>
              <path
                d="M 380 330 C 386 324 394 326 397 332 C 392 338 383 337 380 330 Z"
                fill="#2B2925"
              />
            </g>

            {/* Leaf 5 - Hidden on Mobile via Tailwind / CSS */}
            <g className="hidden md:block animate-leaf-5" style={{ transformOrigin: "640px 100px" }}>
              <path
                d="M 640 100 C 646 94 654 96 657 102 C 652 108 643 107 640 100 Z"
                fill="#A52A20"
              />
            </g>

            {/* Leaf 6 - Hidden on Mobile */}
            <g className="hidden md:block animate-leaf-6" style={{ transformOrigin: "530px 85px" }}>
              <path
                d="M 530 85 C 535 79 544 80 548 87 C 543 92 534 92 530 85 Z"
                fill="#171717"
              />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
