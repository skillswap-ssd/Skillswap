"use client";

import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";

interface Bird {
  id: number;
  baseX: number;
  baseY: number;
  scale: number;
  speed: number;
  pathOffset: number;
}

interface BirdRenderState {
  id: number;
  posX: number;
  posY: number;
  scale: number;
  angle: number;
  wingFlex: number;
  glideFactor: number;
  opacity: number;
}

const INITIAL_BIRDS: Bird[] = [
  { id: 1, baseX: 38, baseY: 26, scale: 0.85, speed: 0.35, pathOffset: 0 },
  { id: 2, baseX: 44, baseY: 22, scale: 0.65, speed: 0.38, pathOffset: 0.8 },
  { id: 3, baseX: 52, baseY: 18, scale: 1.05, speed: 0.32, pathOffset: 1.7 },
  { id: 4, baseX: 59, baseY: 15, scale: 0.55, speed: 0.42, pathOffset: 2.6 },
  { id: 5, baseX: 31, baseY: 30, scale: 0.75, speed: 0.36, pathOffset: 3.4 },
];

export function InkLandscape() {
  const [birdsRenderState, setBirdsRenderState] = useState<BirdRenderState[]>([]);
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    const startTime = Date.now();

    const updateAnimation = () => {
      const time = (Date.now() - startTime) / 1000;

      const nextBirdsState = INITIAL_BIRDS.map((bird) => {
        const t = time * bird.speed + bird.pathOffset;
        const oscX = Math.sin(t * 0.9) * 10 + Math.cos(t * 0.35) * 5;
        const thermalUpdraft = Math.sin(t * 1.4) * 2.5;
        const oscY = Math.cos(t * 0.6) * 5 + thermalUpdraft;

        const dx = Math.cos(t * 0.9) * 9 - Math.sin(t * 0.35) * 1.75;
        const dy = -Math.sin(t * 0.6) * 3 + Math.cos(t * 1.4) * 3.5;
        const flightAngle = Math.atan2(dy, dx) * (180 / Math.PI) * 0.22;

        const cycle = (time * 1.2 + bird.pathOffset * 2.1) % (Math.PI * 2);
        const isGlidingPhase = cycle < Math.PI * 1.4;

        let wingFlex = 0;
        let glideFactor = 1;

        if (isGlidingPhase) {
          glideFactor = 1;
          wingFlex = Math.sin(time * 0.8 + bird.pathOffset) * 0.12;
        } else {
          glideFactor = 0;
          wingFlex = Math.sin((cycle - Math.PI * 1.4) * 6.5);
        }

        return {
          id: bird.id,
          posX: bird.baseX + oscX / 10,
          posY: bird.baseY + oscY / 10,
          scale: bird.scale,
          angle: flightAngle,
          wingFlex,
          glideFactor,
          opacity: 0.88 + Math.sin(t * 0.5) * 0.12,
        };
      });

      setBirdsRenderState(nextBirdsState);
      animFrameId.current = requestAnimationFrame(updateAnimation);
    };

    animFrameId.current = requestAnimationFrame(updateAnimation);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  return (
    <div className="relative w-full max-w-[620px] pointer-events-none select-none">
      {/* Base Background Ink Landscape Image - Integrated seamlessly on page */}
      <div className="relative w-full">
        <Image
          src="/hero-landscape.png"
          alt="Japanese ink landscape with sun, mountains, tree and figure"
          width={1177}
          height={1337}
          className="w-full h-auto object-contain"
          priority
        />

        {/* Soaring Sumi-e Ink Birds Flock */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {birdsRenderState.map((bird) => {
            const baseFlapAngle = bird.glideFactor === 1 ? -4 : 0;
            const wingAngle = baseFlapAngle + bird.wingFlex * (bird.glideFactor === 1 ? 6 : 22);

            return (
              <div
                key={bird.id}
                className="absolute transition-transform duration-100 ease-out"
                style={{
                  left: `${bird.posX}%`,
                  top: `${bird.posY}%`,
                  transform: `scale(${bird.scale}) rotate(${bird.angle}deg)`,
                  opacity: bird.opacity,
                }}
              >
                <svg
                  width="30"
                  height="16"
                  viewBox="0 0 36 20"
                  fill="none"
                  className="filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
                >
                  <path
                    d="M 18 11 C 12 6, 5 3, 1 8 C 7 11, 13 12, 18 11 Z"
                    fill="#1C1917"
                    style={{
                      transform: `rotate(${-wingAngle}deg)`,
                      transformOrigin: "18px 11px",
                      transition: "transform 0.12s ease-out",
                    }}
                  />
                  <path
                    d="M 18 11 C 24 6, 31 3, 35 8 C 29 11, 23 12, 18 11 Z"
                    fill="#1C1917"
                    style={{
                      transform: `rotate(${wingAngle}deg)`,
                      transformOrigin: "18px 11px",
                      transition: "transform 0.12s ease-out",
                    }}
                  />
                  <path
                    d="M 18 11 L 16 17 C 18 18, 18 18, 20 17 Z"
                    fill="#27272A"
                    opacity="0.85"
                  />
                  <path
                    d="M 14 11 C 16 9.5, 20 9.5, 22 11 C 20 13, 16 13, 14 11 Z"
                    fill="#09090B"
                  />
                </svg>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
