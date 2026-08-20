"use client";

interface InkSunProps {
  className?: string;
}

export function InkSun({ className }: InkSunProps) {
  return (
    <g className={className}>
      <defs>
        <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#A52A20" stopOpacity="0.95" />
          <stop offset="65%" stopColor="#A52A20" stopOpacity="0.82" />
          <stop offset="90%" stopColor="#8A2118" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#8A2118" stopOpacity="0" />
        </radialGradient>
        <filter id="sunBrushFilter" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>

      {/* Outer subtle ink haze ring */}
      <circle
        cx="340"
        cy="230"
        r="72"
        fill="#A52A20"
        opacity="0.18"
        filter="url(#sunBrushFilter)"
      />

      {/* Primary organic textured sun body */}
      <path
        d="M 270 230 C 268 180, 310 160, 340 160 C 375 160, 412 182, 410 230 C 408 278, 372 300, 340 300 C 308 300, 272 280, 270 230 Z"
        fill="url(#sunGrad)"
        filter="url(#sunBrushFilter)"
      />

      {/* Central dense sumi pigment */}
      <circle
        cx="340"
        cy="230"
        r="54"
        fill="#A52A20"
        opacity="0.88"
      />
    </g>
  );
}
