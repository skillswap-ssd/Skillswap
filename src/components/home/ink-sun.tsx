"use client";

interface InkSunProps {
  className?: string;
}

export function InkSun({ className }: InkSunProps) {
  return (
    <g className={className}>
      <defs>
        <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#A52A20" stopOpacity="0.98" />
          <stop offset="65%" stopColor="#A52A20" stopOpacity="0.88" />
          <stop offset="88%" stopColor="#8A2118" stopOpacity="0.78" />
          <stop offset="100%" stopColor="#8A2118" stopOpacity="0" />
        </radialGradient>
        <filter id="sunBrushFilter" x="-25%" y="-25%" width="150%" height="150%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>

      {/* Outer subtle vermilion ink haze ring */}
      <circle
        cx="680"
        cy="140"
        r="68"
        fill="#A52A20"
        opacity="0.18"
        filter="url(#sunBrushFilter)"
      />

      {/* Primary textured sumi red sun body */}
      <path
        d="M 625 140 C 623 100, 655 85, 680 85 C 708 85, 737 102, 735 140 C 733 178, 705 195, 680 195 C 655 195, 627 178, 625 140 Z"
        fill="url(#sunGrad)"
        filter="url(#sunBrushFilter)"
      />

      {/* Dense sumi red center */}
      <circle
        cx="680"
        cy="140"
        r="48"
        fill="#A52A20"
        opacity="0.92"
      />
    </g>
  );
}
