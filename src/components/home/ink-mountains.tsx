"use client";

interface InkMountainsProps {
  className?: string;
}

export function InkMountains({ className }: InkMountainsProps) {
  return (
    <g className={className}>
      <defs>
        <linearGradient id="mistGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F7F2E9" stopOpacity="0" />
          <stop offset="60%" stopColor="#F1EBE0" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#E8DFCF" stopOpacity="0.85" />
        </linearGradient>
        <filter id="mountainInkFilter" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>

      {/* Layer 1: Distant Pale Mountains */}
      <path
        d="M -30 420 Q 90 270 230 330 T 490 300 Q 640 240 830 370 L 830 600 L -30 600 Z"
        fill="#C5BCAC"
        opacity="0.38"
        filter="url(#mountainInkFilter)"
      />

      <path
        d="M 110 410 Q 250 240 410 310 T 730 270 L 830 400 L 830 600 L 110 600 Z"
        fill="#B5AB9A"
        opacity="0.28"
      />

      {/* Layer 2: Midground Silhouettes */}
      <path
        d="M -20 460 Q 140 320 300 380 T 600 340 Q 720 310 820 410 L 820 600 L -20 600 Z"
        fill="#423F39"
        opacity="0.55"
        filter="url(#mountainInkFilter)"
      />

      {/* Shore & Water Ground Mass */}
      <path
        d="M -30 510 C 170 488 310 528 530 498 C 670 478 750 512 830 502 L 830 600 L -30 600 Z"
        fill="#1C1B18"
        opacity="0.88"
      />

      {/* Water Reflection Strokes */}
      <g stroke="#171717" strokeWidth="1.2" opacity="0.22" strokeLinecap="round">
        <line x1="100" y1="525" x2="250" y2="525" />
        <line x1="60" y1="538" x2="180" y2="538" />
        <line x1="290" y1="542" x2="470" y2="542" />
        <line x1="220" y1="555" x2="370" y2="555" />
        <line x1="510" y1="532" x2="670" y2="532" />
        <line x1="440" y1="562" x2="580" y2="562" />
      </g>

      {/* Soft Water Haze */}
      <rect y="370" width="800" height="230" fill="url(#mistGrad)" />
    </g>
  );
}
