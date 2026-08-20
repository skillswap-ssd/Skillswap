"use client";

interface InkMountainsProps {
  className?: string;
}

export function InkMountains({ className }: InkMountainsProps) {
  return (
    <g className={className}>
      <defs>
        <linearGradient id="mountainMistGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F7F2E9" stopOpacity="0" />
          <stop offset="55%" stopColor="#F7F2E9" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#F7F2E9" stopOpacity="0.95" />
        </linearGradient>

        <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#EADECB" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#F7F2E9" stopOpacity="0.1" />
        </linearGradient>

        <filter id="mountainInkFilter" x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>

      {/* Layer 1: Distant Light Ink Wash Peaks */}
      <g opacity="0.4" filter="url(#mountainInkFilter)">
        <path
          d="M 280 430 L 340 310 L 390 350 L 460 260 L 520 310 L 600 220 L 670 290 L 730 250 L 800 370 L 800 520 L 280 520 Z"
          fill="#B0A696"
        />
      </g>

      {/* Layer 2: Main Dramatic Central/Right Vertical Jagged Ink Peaks */}
      <g filter="url(#mountainInkFilter)">
        {/* Main Towering Peak */}
        <path
          d="M 520 480 L 570 380 L 610 320 L 642 195 L 670 280 L 710 340 L 760 310 L 800 420 L 800 540 L 520 540 Z"
          fill="#3D3A34"
          opacity="0.75"
        />
        {/* Shading facets on main peak for sumi brush texture */}
        <path
          d="M 642 195 L 670 280 L 660 420 L 620 500 L 620 350 Z"
          fill="#1C1B18"
          opacity="0.82"
        />
        <path
          d="M 610 320 L 642 195 L 620 350 L 580 440 Z"
          fill="#545048"
          opacity="0.6"
        />

        {/* Secondary Left Jagged Ridge */}
        <path
          d="M 380 480 L 440 350 L 485 310 L 520 370 L 560 320 L 610 420 L 610 520 L 380 520 Z"
          fill="#4A4740"
          opacity="0.65"
        />
        <path
          d="M 485 310 L 520 370 L 500 480 L 460 410 Z"
          fill="#252420"
          opacity="0.7"
        />
      </g>

      {/* Layer 3: Soft Misty Valley Base Overlay */}
      <rect x="0" y="320" width="800" height="200" fill="url(#mountainMistGrad)" />

      {/* Layer 4: Lake Water Expanse & Reflection Lines */}
      <rect x="0" y="470" width="800" height="130" fill="url(#waterGrad)" />

      <g stroke="#2B2925" strokeWidth="1" opacity="0.25" strokeLinecap="round">
        <line x1="80" y1="510" x2="220" y2="510" />
        <line x1="140" y1="522" x2="310" y2="522" />
        <line x1="50" y1="535" x2="190" y2="535" />
        <line x1="240" y1="528" x2="420" y2="528" />
        <line x1="330" y1="542" x2="510" y2="542" />
        <line x1="180" y1="555" x2="380" y2="555" />
        <line x1="280" y1="565" x2="450" y2="565" />
      </g>

      {/* Soft Shoreline Gradient on Bottom Left */}
      <path
        d="M -20 540 Q 180 520 380 550 Q 480 565 580 560 L 580 600 L -20 600 Z"
        fill="#E2D7C5"
        opacity="0.5"
      />
    </g>
  );
}
