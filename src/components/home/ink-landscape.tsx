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
  depthZ: number;
  pathOffset: number;
}

interface BirdRenderState {
  id: number;
  posX: number;
  posY: number;
  scale: number;
  depthZ: number;
  angle: number;
  wingFlex: number;
  glideFactor: number;
  bankAngle: number;
  opacity: number;
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
  wobbleOffset: number;
}

const INITIAL_BIRDS: Bird[] = [
  { id: 1, baseX: 38, baseY: 26, scale: 0.85, speed: 0.35, depthZ: 55, pathOffset: 0 },
  { id: 2, baseX: 44, baseY: 22, scale: 0.65, speed: 0.38, depthZ: 42, pathOffset: 0.8 },
  { id: 3, baseX: 52, baseY: 18, scale: 1.05, speed: 0.32, depthZ: 65, pathOffset: 1.7 },
  { id: 4, baseX: 59, baseY: 15, scale: 0.55, speed: 0.42, depthZ: 35, pathOffset: 2.6 },
  { id: 5, baseX: 31, baseY: 30, scale: 0.75, speed: 0.36, depthZ: 48, pathOffset: 3.4 },
];

const INITIAL_PETALS: Petal[] = [
  { id: 1, x: 78, y: 18, size: 6, rotation: 15, speedX: -0.06, speedY: 0.08, rotSpeed: 0.6, color: "rgba(153, 27, 27, 0.65)", opacity: 0.7, depthZ: 68, wobbleOffset: 0 },
  { id: 2, x: 72, y: 28, size: 4.5, rotation: 40, speedX: -0.08, speedY: 0.11, rotSpeed: 0.9, color: "rgba(39, 39, 42, 0.55)", opacity: 0.6, depthZ: 55, wobbleOffset: 1.2 },
  { id: 3, x: 86, y: 12, size: 7, rotation: -10, speedX: -0.05, speedY: 0.07, rotSpeed: 0.5, color: "rgba(153, 27, 27, 0.75)", opacity: 0.75, depthZ: 75, wobbleOffset: 2.4 },
  { id: 4, x: 68, y: 38, size: 5, rotation: 65, speedX: -0.07, speedY: 0.09, rotSpeed: 0.8, color: "rgba(39, 39, 42, 0.5)", opacity: 0.55, depthZ: 60, wobbleOffset: 3.6 },
  { id: 5, x: 63, y: 48, size: 4, rotation: 90, speedX: -0.09, speedY: 0.12, rotSpeed: 1.1, color: "rgba(153, 27, 27, 0.55)", opacity: 0.5, depthZ: 48, wobbleOffset: 4.8 },
  { id: 6, x: 81, y: 32, size: 5.5, rotation: 25, speedX: -0.06, speedY: 0.08, rotSpeed: 0.7, color: "rgba(24, 24, 27, 0.6)", opacity: 0.65, depthZ: 64, wobbleOffset: 5.5 },
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

      // Aesthetic Layer: Birds gliding & soaring in formation with natural thermal floating dynamics
      if (activeMotionMode === "all") {
        const nextBirdsState = INITIAL_BIRDS.map((bird) => {
          // Flight timeline
          const t = time * bird.speed + bird.pathOffset;

          // Thermal breeze drift + graceful wide soaring path
          const oscX = Math.sin(t * 0.9) * 10 + Math.cos(t * 0.35) * 5;
          // Thermal updrafts: gentle rising and buoyant floating bobbing
          const thermalUpdraft = Math.sin(t * 1.4) * 2.5;
          const oscY = Math.cos(t * 0.6) * 5 + thermalUpdraft;

          // Trajectory derivative for natural flight vector pitching
          const dx = Math.cos(t * 0.9) * 9 - Math.sin(t * 0.35) * 1.75;
          const dy = -Math.sin(t * 0.6) * 3 + Math.cos(t * 1.4) * 3.5;
          const flightAngle = Math.atan2(dy, dx) * (180 / Math.PI) * 0.22;

          // Banking (roll tilt) proportional to turning curvature (dx acceleration)
          const bankAngle = Math.sin(t * 0.8) * 12;

          // Natural Flap vs Glide Cycle:
          // Birds float on thermals in long glides, punctuated by gentle wing strokes
          const cycle = (time * 1.2 + bird.pathOffset * 2.1) % (Math.PI * 2);
          const isGlidingPhase = cycle < Math.PI * 1.4;

          let wingFlex = 0;
          let glideFactor = 1;

          if (isGlidingPhase) {
            // Smooth soaring glide with slight atmospheric thermal micro-flex
            glideFactor = 1;
            wingFlex = Math.sin(time * 0.8 + bird.pathOffset) * 0.12; // subtle hold
          } else {
            // Soft active wing stroke cycle during transition
            glideFactor = 0;
            wingFlex = Math.sin((cycle - Math.PI * 1.4) * 6.5);
          }

          const parallaxX = currentRotY.current * (bird.depthZ / 35);
          const parallaxY = -currentRotX.current * (bird.depthZ / 35);

          return {
            id: bird.id,
            posX: bird.baseX + (oscX / 10) + (parallaxX / 6),
            posY: bird.baseY + (oscY / 10) + (parallaxY / 6),
            scale: bird.scale,
            depthZ: bird.depthZ,
            angle: flightAngle,
            wingFlex,
            glideFactor,
            bankAngle,
            opacity: 0.88 + Math.sin(t * 0.5) * 0.12,
          };
        });

        setBirdsRenderState(nextBirdsState);

        // Aesthetic Layer: Gentle drifting ink petals with organic micro-oscillations
        const windX = -0.04 + (isHovered ? -pos.x * 0.05 : 0);
        const windY = 0.06 + (isHovered ? pos.y * 0.04 : 0);

        petalsRef.current = petalsRef.current.map((p) => {
          const wobble = Math.sin(time * 1.2 + p.wobbleOffset) * 0.08;
          let newX = p.x + (p.speedX + windX + wobble) * 0.4;
          let newY = p.y + (p.speedY + windY) * 0.4;
          let newRot = p.rotation + p.rotSpeed * 0.4;

          if (newX < -5) newX = 95;
          if (newX > 105) newX = 5;
          if (newY > 90) {
            newY = 5 + Math.random() * 10;
            newX = 70 + Math.random() * 20; // gentle respawn near tree line
          }

          return {
            ...p,
            x: newX,
            y: newY,
            rotation: newRot,
          };
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
      {/* Inline styles for solar pulse & water shimmer */}
      <style>{`
        @keyframes sunAuraPulse {
          0%, 100% { transform: scale(1); opacity: 0.35; }
          50% { transform: scale(1.15); opacity: 0.55; }
        }
        @keyframes waterShimmer {
          0% { transform: translateX(-10px); opacity: 0.3; }
          50% { transform: translateX(12px); opacity: 0.6; }
          100% { transform: translateX(-10px); opacity: 0.3; }
        }
        @keyframes treeSway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(0.8deg); }
        }
        .animate-sun-aura {
          animation: sunAuraPulse 5s ease-in-out infinite;
        }
        .animate-water-shimmer {
          animation: waterShimmer 7s ease-in-out infinite;
        }
        .animate-tree-sway {
          animation: treeSway 9s ease-in-out infinite;
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

        {/* Aesthetic Soaring Sumi-e Ink Birds Flock */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ transformStyle: "preserve-3d" }}
        >
          {birdsRenderState.map((bird) => {
            // Wing flex angle in degrees (flapping vs thermal glide dihedral arc)
            const baseFlapAngle = bird.glideFactor === 1 ? -4 : 0; // Gentle dihedral uplift during glide
            const wingAngle = baseFlapAngle + bird.wingFlex * (bird.glideFactor === 1 ? 6 : 22);

            return (
              <div
                key={bird.id}
                className="absolute transition-transform duration-100 ease-out"
                style={{
                  left: `${bird.posX}%`,
                  top: `${bird.posY}%`,
                  transform: `translateZ(${bird.depthZ}px) scale(${bird.scale}) rotate(${bird.angle}deg) rotateX(${bird.bankAngle * 0.4}deg)`,
                  opacity: bird.opacity,
                }}
              >
                {/* Refined Japanese Sumi-e Calligraphic Bird Silhouette */}
                <svg
                  width="30"
                  height="16"
                  viewBox="0 0 36 20"
                  fill="none"
                  className="filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.22)]"
                >
                  {/* Left Wing - Elegant Sweeping Ink Brush Stroke */}
                  <path
                    d="M 18 11 C 12 6, 5 3, 1 8 C 7 11, 13 12, 18 11 Z"
                    fill="#1C1917"
                    style={{
                      transform: `rotate(${-wingAngle}deg)`,
                      transformOrigin: "18px 11px",
                      transition: "transform 0.12s ease-out",
                    }}
                  />
                  {/* Right Wing - Elegant Sweeping Ink Brush Stroke */}
                  <path
                    d="M 18 11 C 24 6, 31 3, 35 8 C 29 11, 23 12, 18 11 Z"
                    fill="#1C1917"
                    style={{
                      transform: `rotate(${wingAngle}deg)`,
                      transformOrigin: "18px 11px",
                      transition: "transform 0.12s ease-out",
                    }}
                  />
                  {/* Tail Fan - Delicate Sumi stroke extension */}
                  <path
                    d="M 18 11 L 16 17 C 18 18, 18 18, 20 17 Z"
                    fill="#27272A"
                    opacity="0.85"
                  />
                  {/* Central Body & Head - Fluid Sumi Calligraphy Dot */}
                  <path
                    d="M 14 11 C 16 9.5, 20 9.5, 22 11 C 20 13, 16 13, 14 11 Z"
                    fill="#09090B"
                  />
                </svg>
              </div>
            );
          })}
        </div>

        {/* Aesthetic Drifting Vermilion & Ink Petals / Mist */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ transformStyle: "preserve-3d" }}
        >
          {petalRenderState.map((petal) => (
            <div
              key={petal.id}
              className="absolute transition-transform duration-300 ease-out"
              style={{
                left: `${petal.x}%`,
                top: `${petal.y}%`,
                transform: `translateZ(${petal.depthZ}px) rotate(${petal.rotation}deg)`,
                opacity: petal.opacity,
              }}
            >
              {/* Soft organic Sumi-e Leaf / Petal */}
              <svg
                width={petal.size * 2}
                height={petal.size * 2.2}
                viewBox="0 0 16 20"
                fill="none"
                className="filter blur-[0.2px]"
              >
                <path
                  d="M 8 0 C 14 5, 15 14, 8 20 C 1 14, 2 5, 8 0 Z"
                  fill={petal.color}
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
          <span>{activeMotionMode === "all" ? "✨ Dynamic Depth" : "🍃 Subtle Motion"}</span>
        </button>
      </div>
    </div>
  );
}
