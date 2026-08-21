"use client";

import Image from "next/image";
import React, { useState, useRef, useEffect, useCallback } from "react";

// Types for animated landscape items
interface Bird {
  id: number;
  baseX: number; // base percentage position (0-100)
  baseY: number; // base percentage position (0-100)
  scale: number;
  speed: number;
  wingSpeed: number;
  depthZ: number;
  pathOffset: number;
}

interface BirdRenderState {
  id: number;
  posX: number;
  posY: number;
  scale: number;
  depthZ: number;
  wingSpeed: number;
}

interface Petal {
  id: number;
  x: number; // %
  y: number; // %
  size: number;
  rotation: number;
  speedX: number;
  speedY: number;
  rotSpeed: number;
  color: string;
  opacity: number;
  depthZ: number;
}

const INITIAL_BIRDS: Bird[] = [
  { id: 1, baseX: 42, baseY: 32, scale: 0.95, speed: 0.8, wingSpeed: 1.2, depthZ: 52, pathOffset: 0 },
  { id: 2, baseX: 48, baseY: 28, scale: 0.75, speed: 0.9, wingSpeed: 1.4, depthZ: 44, pathOffset: 1.2 },
  { id: 3, baseX: 55, baseY: 23, scale: 1.15, speed: 0.7, wingSpeed: 1.0, depthZ: 60, pathOffset: 2.5 },
  { id: 4, baseX: 62, baseY: 19, scale: 0.65, speed: 1.1, wingSpeed: 1.6, depthZ: 38, pathOffset: 3.8 },
  { id: 5, baseX: 35, baseY: 37, scale: 0.85, speed: 0.85, wingSpeed: 1.3, depthZ: 48, pathOffset: 4.9 },
];

const INITIAL_PETALS: Petal[] = [
  { id: 1, x: 80, y: 15, size: 7, rotation: 12, speedX: -0.12, speedY: 0.15, rotSpeed: 1.5, color: "#A52A20", opacity: 0.85, depthZ: 68 },
  { id: 2, x: 75, y: 25, size: 5, rotation: 45, speedX: -0.18, speedY: 0.22, rotSpeed: 2.2, color: "#171717", opacity: 0.75, depthZ: 58 },
  { id: 3, x: 88, y: 10, size: 8, rotation: -20, speedX: -0.09, speedY: 0.12, rotSpeed: 1.1, color: "#A52A20", opacity: 0.9, depthZ: 75 },
  { id: 4, x: 70, y: 35, size: 6, rotation: 80, speedX: -0.15, speedY: 0.18, rotSpeed: 2.8, color: "#2E2B26", opacity: 0.8, depthZ: 62 },
  { id: 5, x: 65, y: 45, size: 4, rotation: 110, speedX: -0.22, speedY: 0.25, rotSpeed: 3.5, color: "#A52A20", opacity: 0.7, depthZ: 50 },
  { id: 6, x: 82, y: 30, size: 6.5, rotation: 30, speedX: -0.14, speedY: 0.16, rotSpeed: 1.8, color: "#171717", opacity: 0.82, depthZ: 65 },
];

export function InkLandscape() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Interaction State
  const [isHovered, setIsHovered] = useState(false);
  const [activeMotionMode, setActiveMotionMode] = useState<"all" | "subtle">("all");

  // Normalized mouse coordinates (-1 to 1)
  const mousePosRef = useRef({ x: 0, y: 0 });

  // Animated 3D spatial values for spring interpolation
  const currentRotX = useRef(0);
  const currentRotY = useRef(0);
  const currentScale = useRef(1);
  const currentGlareX = useRef(50);
  const currentGlareY = useRef(50);
  const currentGlareOpacity = useRef(0);

  const petalsRef = useRef<Petal[]>(INITIAL_PETALS);

  // Motion states for React render pass
  const [birdsRenderState, setBirdsRenderState] = useState<BirdRenderState[]>([]);
  const [petalRenderState, setPetalRenderState] = useState<Petal[]>(INITIAL_PETALS);

  // Solar aura tilt offsets
  const [sunOffset, setSunOffset] = useState({ x: 0, y: 0 });

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

      // Smooth Lerp (Linear Interpolation)
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

      setSunOffset({
        x: -currentRotY.current * 0.4,
        y: currentRotX.current * 0.4,
      });

      // Update Motion 3: Birds positions
      if (activeMotionMode === "all") {
        const nextBirdsState = INITIAL_BIRDS.map((bird) => {
          const oscX = Math.sin(time * bird.speed + bird.pathOffset) * 18;
          const oscY = Math.cos(time * bird.speed * 0.8 + bird.pathOffset) * 8;

          const parallaxX = currentRotY.current * (bird.depthZ / 30);
          const parallaxY = -currentRotX.current * (bird.depthZ / 30);

          return {
            id: bird.id,
            posX: bird.baseX + (oscX / 10) + (parallaxX / 5),
            posY: bird.baseY + (oscY / 10) + (parallaxY / 5),
            scale: bird.scale,
            depthZ: bird.depthZ,
            wingSpeed: bird.wingSpeed,
          };
        });

        setBirdsRenderState(nextBirdsState);

        // Update Motion 3: Drifting Petals physics with wind vector & hover disturbance
        const windX = -0.08 + (isHovered ? -pos.x * 0.12 : 0);
        const windY = 0.14 + (isHovered ? pos.y * 0.08 : 0);

        petalsRef.current = petalsRef.current.map((p) => {
          let newX = p.x + (p.speedX + windX) * 0.6;
          let newY = p.y + (p.speedY + windY) * 0.6;
          let newRot = p.rotation + p.rotSpeed * 0.8;

          if (newX < -5) newX = 95;
          if (newX > 105) newX = 5;
          if (newY > 95) {
            newY = 5 + Math.random() * 15;
            newX = 70 + Math.random() * 25; // respawn near pine tree
          }

          const parallaxX = currentRotY.current * (p.depthZ / 25);
          const parallaxY = -currentRotX.current * (p.depthZ / 25);

          return {
            ...p,
            x: newX,
            y: newY,
            rotation: newRot,
            speedX: p.speedX,
            speedY: p.speedY,
            // computed display coordinates offset by parallax
            depthZ: p.depthZ,
            opacity: p.opacity,
            size: p.size,
            color: p.color,
            rotSpeed: p.rotSpeed,
            // Save temporary spatial coordinates in state pass
            xWithParallax: newX + (parallaxX / 10),
            yWithParallax: newY + (parallaxY / 10),
          } as Petal;
        });

        setPetalRenderState([...petalsRef.current]);
      }

      animFrameId.current = requestAnimationFrame(updateAnimation);
    };

    animFrameId.current = requestAnimationFrame(updateAnimation);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isHovered, activeMotionMode]);

  return (
    <div className="relative w-full max-w-[660px] mx-auto py-6 px-3 select-none">
      {/* Inline styles for wing-flapping, solar pulse & water shimmer */}
      <style>{`
        @keyframes wingFlapLeft {
          0%, 100% { transform: rotate(0deg) scaleY(1); }
          50% { transform: rotate(-28deg) scaleY(0.7); }
        }
        @keyframes wingFlapRight {
          0%, 100% { transform: rotate(0deg) scaleY(1); }
          50% { transform: rotate(28deg) scaleY(0.7); }
        }
        @keyframes sunAuraPulse {
          0%, 100% { transform: scale(1); opacity: 0.35; }
          50% { transform: scale(1.18); opacity: 0.65; }
        }
        @keyframes waterShimmer {
          0% { transform: translateX(-10px); opacity: 0.3; }
          50% { transform: translateX(12px); opacity: 0.7; }
          100% { transform: translateX(-10px); opacity: 0.3; }
        }
        @keyframes treeSway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(1.2deg); }
        }
        .animate-wing-left {
          animation: wingFlapLeft 0.5s ease-in-out infinite;
          transform-origin: right center;
        }
        .animate-wing-right {
          animation: wingFlapRight 0.5s ease-in-out infinite;
          transform-origin: left center;
        }
        .animate-sun-aura {
          animation: sunAuraPulse 4s ease-in-out infinite;
        }
        .animate-water-shimmer {
          animation: waterShimmer 6s ease-in-out infinite;
        }
        .animate-tree-sway {
          animation: treeSway 7s ease-in-out infinite;
          transform-origin: bottom right;
        }
      `}</style>

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
        {/* Parallax Layer 1: Base Background Ink Landscape Image */}
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
            className="w-full h-auto object-cover rounded-2xl transition-all duration-300 animate-tree-sway"
            priority
          />
        </div>

        {/* Motion 2 Layer A: Red Sun Solar Radiant Pulse Aura Overlay */}
        <div
          className="absolute pointer-events-none rounded-full animate-sun-aura"
          style={{
            top: "8%",
            right: "12%",
            width: "22%",
            height: "19%",
            background: "radial-gradient(circle, rgba(165, 42, 32, 0.45) 0%, rgba(165, 42, 32, 0.15) 55%, transparent 75%)",
            transform: `translateZ(32px) translate3d(${sunOffset.x}px, ${sunOffset.y}px, 0)`,
          }}
        />

        {/* Motion 2 Layer B: Lake Water Shimmer Line Overlay */}
        <div
          className="absolute pointer-events-none animate-water-shimmer"
          style={{
            bottom: "22%",
            left: "15%",
            width: "55%",
            height: "2px",
            background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.7), rgba(247, 242, 233, 0.9), transparent)",
            transform: "translateZ(20px)",
          }}
        />

        {/* MOTION 3 (THE GREAT 3RD MOTION): Soaring Sumi-e Ink Birds Flock */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ transformStyle: "preserve-3d" }}
        >
          {birdsRenderState.map((bird) => (
            <div
              key={bird.id}
              className="absolute transition-transform duration-75 ease-out"
              style={{
                left: `${bird.posX}%`,
                top: `${bird.posY}%`,
                transform: `translateZ(${bird.depthZ}px) scale(${bird.scale})`,
              }}
            >
              {/* SVG Bird with animated flapping wings */}
              <svg
                width="28"
                height="16"
                viewBox="0 0 32 18"
                fill="none"
                className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
              >
                {/* Left Wing */}
                <path
                  d="M 16 9 Q 8 2 1 7 Q 7 11 16 9 Z"
                  fill="#171717"
                  className="animate-wing-left"
                  style={{ animationDuration: `${0.45 / bird.wingSpeed}s` }}
                />
                {/* Right Wing */}
                <path
                  d="M 16 9 Q 24 2 31 7 Q 25 11 16 9 Z"
                  fill="#171717"
                  className="animate-wing-right"
                  style={{ animationDuration: `${0.45 / bird.wingSpeed}s` }}
                />
                {/* Body Center */}
                <ellipse cx="16" cy="9.5" rx="2.5" ry="1.2" fill="#0D0D0D" />
              </svg>
            </div>
          ))}
        </div>

        {/* MOTION 3 (THE GREAT 3RD MOTION): Drifting Vermilion & Charcoal Sumi Petals */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ transformStyle: "preserve-3d" }}
        >
          {petalRenderState.map((petal) => (
            <div
              key={petal.id}
              className="absolute transition-transform duration-100 ease-out"
              style={{
                left: `${petal.x}%`,
                top: `${petal.y}%`,
                transform: `translateZ(${petal.depthZ}px) rotate(${petal.rotation}deg)`,
                opacity: petal.opacity,
              }}
            >
              {/* Sumi-e Leaf / Petal organic shape */}
              <svg
                width={petal.size * 2}
                height={petal.size * 2.5}
                viewBox="0 0 16 20"
                fill="none"
              >
                <path
                  d="M 8 0 C 14 6, 15 14, 8 20 C 1 14, 2 6, 8 0 Z"
                  fill={petal.color}
                />
                <path
                  d="M 8 2 L 8 18"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="0.8"
                />
              </svg>
            </div>
          ))}
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

        {/* Parallax Badge 1: 3D Perspective & Motion Badge */}
        <div
          className="absolute top-4 right-4 pointer-events-none transition-all duration-300 ease-out hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md text-amber-100 text-[11px] font-semibold tracking-wider border border-white/20 shadow-lg"
          style={{
            transform: isHovered ? "translateZ(55px) translateY(-2px)" : "translateZ(30px)",
          }}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>3D PERSPECTIVE · 3 ANIMATED LAYERS</span>
        </div>

        {/* Parallax Badge 2: Motion Switch Control */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setActiveMotionMode((prev) => (prev === "all" ? "subtle" : "all"));
          }}
          className="absolute top-4 left-4 z-20 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white backdrop-blur-md text-zinc-900 text-[11px] font-medium border border-zinc-200/80 shadow-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          style={{
            transform: "translateZ(50px)",
          }}
          title="Click to toggle motion density"
        >
          <span>{activeMotionMode === "all" ? "✨ Motion 3 Active" : "🍃 Subtle Motion"}</span>
        </button>

        {/* Interactive Floating Motion Guide Hint */}
        <div
          className={`absolute bottom-4 left-4 right-4 sm:right-auto pointer-events-none transition-all duration-500 text-[11px] font-medium tracking-wide text-zinc-800 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-zinc-200/80 shadow-md ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-90 translate-y-0 sm:opacity-0 sm:translate-y-2"
          }`}
          style={{
            transform: "translateZ(48px)",
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-amber-700 font-bold">Great 3rd Motion:</span>
            <span>Birds soaring & sumi petals drifting in wind 🍃</span>
          </div>
        </div>
      </div>
    </div>
  );
}
