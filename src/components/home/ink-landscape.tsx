"use client";

import Image from "next/image";
import React, { useState, useRef, useEffect, useCallback } from "react";

export function InkLandscape() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Motion state
  const [isHovered, setIsHovered] = useState(false);

  // Normalized mouse coordinates (-1 to 1) kept in a ref to prevent effect teardown on every mousemove
  const mousePosRef = useRef({ x: 0, y: 0 });

  // Animated values (for smooth lerp interpolation)
  const currentRotX = useRef(0);
  const currentRotY = useRef(0);
  const currentScale = useRef(1);
  const currentGlareX = useRef(50);
  const currentGlareY = useRef(50);
  const currentGlareOpacity = useRef(0);

  const [style, setStyle] = useState({
    transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
    glareBackground: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 0%, transparent 70%)",
    glareOpacity: 0,
    shadowTransform: "translateY(12px) scale(0.95)",
  });

  const animFrameId = useRef<number | null>(null);

  // Mouse / Pointer event handler
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0 to 1
    const y = (e.clientY - rect.top) / rect.height; // 0 to 1

    // Normalize to -1 to 1 (center is 0, 0)
    const normX = Math.max(-1, Math.min(1, (x - 0.5) * 2));
    const normY = Math.max(-1, Math.min(1, (y - 0.5) * 2));

    mousePosRef.current = { x: normX, y: normY };
  }, []);

  const handlePointerEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false);
    mousePosRef.current = { x: 0, y: 0 };
  }, []);

  // Main animation loop
  useEffect(() => {
    const startTime = Date.now();

    const updateAnimation = () => {
      const time = (Date.now() - startTime) / 1000;
      const pos = mousePosRef.current;

      let targetRotX = 0;
      let targetRotY = 0;
      let targetScale = 1;
      let targetGlareX = 50;
      let targetGlareY = 50;
      let targetGlareOpacity = 0;

      if (isHovered) {
        // Active 3D tilt based on mouse position
        const maxTiltX = 14; // max degrees pitch
        const maxTiltY = 18; // max degrees yaw

        targetRotX = -pos.y * maxTiltX;
        targetRotY = pos.x * maxTiltY;
        targetScale = 1.03;

        targetGlareX = ((pos.x + 1) / 2) * 100;
        targetGlareY = ((pos.y + 1) / 2) * 100;
        targetGlareOpacity = Math.min(0.35, Math.hypot(pos.x, pos.y) * 0.3);
      } else {
        // Gentle breathing idle floating animation when not hovered
        targetRotX = Math.sin(time * 0.8) * 3;
        targetRotY = Math.cos(time * 0.6) * 4;
        targetScale = 1;
        targetGlareX = 50 + Math.sin(time * 0.5) * 20;
        targetGlareY = 50 + Math.cos(time * 0.5) * 20;
        targetGlareOpacity = 0.08 + Math.sin(time) * 0.04;
      }

      // Smooth Lerp (Linear Interpolation) with spring-like weight
      const ease = isHovered ? 0.1 : 0.05;
      currentRotX.current += (targetRotX - currentRotX.current) * ease;
      currentRotY.current += (targetRotY - currentRotY.current) * ease;
      currentScale.current += (targetScale - currentScale.current) * ease;
      currentGlareX.current += (targetGlareX - currentGlareX.current) * ease;
      currentGlareY.current += (targetGlareY - currentGlareY.current) * ease;
      currentGlareOpacity.current += (targetGlareOpacity - currentGlareOpacity.current) * ease;

      const shadowOffsetX = -currentRotY.current * 1.5;
      const shadowOffsetY = 15 + currentRotX.current * 1.2;

      setStyle({
        transform: `perspective(1000px) rotateX(${currentRotX.current.toFixed(2)}deg) rotateY(${currentRotY.current.toFixed(2)}deg) scale3d(${currentScale.current.toFixed(3)}, ${currentScale.current.toFixed(3)}, 1)`,
        glareBackground: `radial-gradient(circle at ${currentGlareX.current.toFixed(1)}% ${currentGlareY.current.toFixed(1)}%, rgba(255, 255, 255, 0.6) 0%, rgba(255, 245, 220, 0.15) 45%, transparent 75%)`,
        glareOpacity: currentGlareOpacity.current,
        shadowTransform: `translate3d(${shadowOffsetX.toFixed(1)}px, ${shadowOffsetY.toFixed(1)}px, -20px) scale(${isHovered ? 0.98 : 0.95})`,
      });

      animFrameId.current = requestAnimationFrame(updateAnimation);
    };

    animFrameId.current = requestAnimationFrame(updateAnimation);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isHovered]);

  return (
    <div className="relative w-full max-w-[660px] mx-auto py-6 px-3 select-none">
      {/* Dynamic 3D Floating Shadow */}
      <div
        className="absolute inset-x-8 bottom-2 top-8 rounded-3xl bg-black/15 blur-xl transition-opacity duration-500 pointer-events-none"
        style={{
          transform: style.shadowTransform,
          opacity: isHovered ? 0.28 : 0.15,
        }}
      />

      {/* Main 3D Card Container */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        className="relative w-full rounded-2xl border border-[var(--border)] bg-[#F7F2E9] shadow-md transition-shadow duration-300 overflow-hidden cursor-grab active:cursor-grabbing transform-gpu"
        style={{
          transform: style.transform,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {/* Parallax Layer 1: Background Base Image */}
        <div
          className="relative w-full transition-transform duration-75 ease-out"
          style={{
            transform: "translateZ(12px) scale(1.02)",
            transformStyle: "preserve-3d",
          }}
        >
          <Image
            src="/hero-landscape.png"
            alt="Japanese ink landscape with sun, mountains, tree and figure"
            width={1177}
            height={1337}
            className="w-full h-auto object-cover rounded-2xl transition-all duration-300"
            priority
          />
        </div>

        {/* Dynamic Glass Specular Glare Highlight Overlay */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-200 mix-blend-soft-light"
          style={{
            background: style.glareBackground,
            opacity: style.glareOpacity,
            transform: "translateZ(35px)",
          }}
        />

        {/* Subtle Ambient Vignette Border Overlay */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl border border-black/10 shadow-[inset_0_0_40px_rgba(0,0,0,0.06)]"
          style={{ transform: "translateZ(40px)" }}
        />

        {/* Parallax Layer 2: Floating Ink Badge Seal */}
        <div
          className="absolute top-5 right-5 pointer-events-none transition-all duration-300 ease-out hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-amber-100 text-xs font-semibold tracking-wider border border-white/20 shadow-lg"
          style={{
            transform: isHovered ? "translateZ(48px) translateY(-2px)" : "translateZ(25px)",
          }}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>3D PERSPECTIVE</span>
        </div>

        {/* Parallax Layer 3: Interactive Floating Hint Badge */}
        <div
          className={`absolute bottom-5 left-5 pointer-events-none transition-all duration-500 text-[11px] font-medium tracking-wide text-zinc-800 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-zinc-200/80 shadow-md ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
          style={{
            transform: "translateZ(42px)",
          }}
        >
          ✨ Tilt & Hover to explore depth
        </div>
      </div>
    </div>
  );
}
