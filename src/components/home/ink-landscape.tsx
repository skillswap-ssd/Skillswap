"use client";

import { useEffect, useRef, useState } from "react";
import { InkSun } from "./ink-sun";
import { InkMountains } from "./ink-mountains";
import { JapaneseTree } from "./japanese-tree";

export function InkLandscape() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
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

  useEffect(() => {
    if (isReducedMotion) return;

    // Detect if primary input is touch
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

      const clampedX = Math.max(-1, Math.min(1, normX));
      const clampedY = Math.max(-1, Math.min(1, normY));

      setParallax({ x: clampedX, y: clampedY });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isReducedMotion]);

  // Transform offsets for layered parallax depth
  const backTransform = isReducedMotion
    ? "none"
    : `translate3d(${parallax.x * 1.5}px, ${parallax.y * 1.5}px, 0)`;

  const midTransform = isReducedMotion
    ? "none"
    : `translate3d(${parallax.x * 3.5}px, ${parallax.y * 3.5}px, 0)`;

  const frontTransform = isReducedMotion
    ? "none"
    : `translate3d(${parallax.x * 6}px, ${parallax.y * 6}px, 0)`;

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/3] md:aspect-[16/11] max-w-[620px] mx-auto select-none overflow-visible pointer-events-none"
      aria-hidden="true"
    >
      <style jsx global>{`
        @keyframes driftLeaf1 {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg) scale(0.85);
            opacity: 0;
          }
          15% {
            opacity: 0.9;
          }
          85% {
            opacity: 0.75;
          }
          100% {
            transform: translate3d(-150px, 95px, 0) rotate(160deg) scale(1.1);
            opacity: 0;
          }
        }

        @keyframes driftLeaf2 {
          0% {
            transform: translate3d(0, 0, 0) rotate(20deg) scale(0.9);
            opacity: 0;
          }
          20% {
            opacity: 0.85;
          }
          80% {
            opacity: 0.6;
          }
          100% {
            transform: translate3d(-190px, 115px, 0) rotate(-140deg) scale(0.7);
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
            transform: translate3d(-170px, 80px, 0) rotate(210deg) scale(0.85);
            opacity: 0;
          }
        }

        @keyframes foliageSway {
          0%, 100% {
            transform: rotate(0deg) translate3d(0, 0, 0);
          }
          50% {
            transform: rotate(1.2deg) translate3d(-2px, 1.5px, 0);
          }
        }

        @keyframes sunPulse {
          0%, 100% {
            opacity: 0.88;
          }
          50% {
            opacity: 0.96;
          }
        }

        .animate-leaf-1 {
          animation: driftLeaf1 13s ease-in-out infinite;
        }
        .animate-leaf-2 {
          animation: driftLeaf2 17s ease-in-out 3s infinite;
        }
        .animate-leaf-3 {
          animation: driftLeaf3 15s ease-in-out 7s infinite;
        }
        .animate-foliage {
          animation: foliageSway 8s ease-in-out infinite;
          transform-origin: 75% 35%;
        }
        .animate-sun {
          animation: sunPulse 10s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-leaf-1,
          .animate-leaf-2,
          .animate-leaf-3,
          .animate-foliage,
          .animate-sun {
            animation: none !important;
          }
        }
      `}</style>

      {/* Main SVG Canvas - seamlessly blends into warm page background without border/card */}
      <svg
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain"
      >
        {/* Layer 1: Sky Base Blend */}
        <rect width="800" height="600" fill="#F7F2E9" />

        {/* LAYER - BACK PLANE (Sun, Pale Mountains, Birds) */}
        <g style={{ transform: backTransform, transition: "transform 0.25s ease-out" }}>
          <InkSun className="animate-sun" />

          {/* Distant Flock of Birds */}
          <g opacity="0.65" stroke="#2B2925" strokeWidth="1.8" strokeLinecap="round" fill="none">
            <path d="M 180 180 Q 186 174 192 180 Q 198 174 204 180" />
            <path d="M 206 168 Q 210 163 215 168 Q 220 163 224 168" />
            <path d="M 450 140 Q 455 135 460 140 Q 465 135 470 140" />
            <path d="M 474 132 Q 477 128 481 132 Q 485 128 489 132" opacity="0.7" />
          </g>
        </g>

        {/* LAYER - MID PLANE (Mountains & Water Reflection) */}
        <g style={{ transform: midTransform, transition: "transform 0.25s ease-out" }}>
          <InkMountains />
        </g>

        {/* LAYER - FOREGROUND PLANE (Tree, Figures, Rocks & Wind Drift) */}
        <g style={{ transform: frontTransform, transition: "transform 0.25s ease-out" }}>
          <JapaneseTree />

          {/* Distant Human Figure in Landscape */}
          <g fill="#171717" opacity="0.85">
            {/* Figure head */}
            <circle cx="215" cy="488" r="3" />
            {/* Figure torso & robe */}
            <path d="M 211 492 L 219 492 L 222 506 L 208 506 Z" />
          </g>

          {/* Ink Foreground Rocks */}
          <g fill="#1C1B18" opacity="0.9">
            <path d="M 180 508 C 190 498 210 500 225 508 C 215 515 195 515 180 508 Z" />
            <path d="M 640 502 C 660 492 685 496 705 504 C 690 512 665 512 640 502 Z" />
          </g>

          {/* Floating Sumi & Vermilion Leaves */}
          <g>
            <g className="animate-leaf-1" style={{ transformOrigin: "420px 245px" }}>
              <path
                d="M 420 245 C 425 239 435 241 438 247 C 435 253 425 253 420 245 Z"
                fill="#A52A20"
              />
            </g>

            <g className="animate-leaf-2" style={{ transformOrigin: "390px 260px" }}>
              <path
                d="M 390 260 C 396 254 404 255 408 262 C 402 268 394 267 390 260 Z"
                fill="#171717"
              />
            </g>

            <g className="animate-leaf-3" style={{ transformOrigin: "330px 190px" }}>
              <path
                d="M 330 190 C 335 184 344 185 347 192 C 343 197 334 197 330 190 Z"
                fill="#A52A20"
              />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
