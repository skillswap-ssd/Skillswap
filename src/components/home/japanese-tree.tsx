"use client";

interface JapaneseTreeProps {
  className?: string;
  isMobile?: boolean;
}

export function JapaneseTree({ className, isMobile = false }: JapaneseTreeProps) {
  return (
    <g className={className}>
      <defs>
        <filter id="treeInkBleed" x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>

      {/* Structured Layer 1: Trunk & Main Bough Structures */}
      <g stroke="#171717" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Main Tapered Trunk anchored in foreground */}
        <path
          d={
            isMobile
              ? "M 680 580 C 660 500 630 380 610 280 C 595 210 575 160 540 100"
              : "M 700 580 C 685 490 660 380 635 290 C 620 230 600 180 565 120"
          }
          strokeWidth="22"
          filter="url(#treeInkBleed)"
        />
        <path
          d={
            isMobile
              ? "M 675 580 C 655 500 626 380 606 280 C 591 210 572 160 538 100"
              : "M 694 580 C 680 490 655 380 631 290 C 616 230 596 180 562 120"
          }
          strokeWidth="12"
          stroke="#2A2824"
        />

        {/* Primary Leftward Sweeping Bough */}
        <path
          d="M 635 300 C 565 280 495 270 425 285 C 375 296 325 320 275 345"
          strokeWidth="10"
          filter="url(#treeInkBleed)"
        />
        <path
          d="M 525 275 C 475 235 425 210 365 200"
          strokeWidth="6"
        />
        <path
          d="M 415 288 C 375 315 335 350 285 375"
          strokeWidth="5"
        />

        {/* Secondary Upper Branch System */}
        <path
          d="M 595 190 C 610 140 640 90 685 50"
          strokeWidth="7"
          filter="url(#treeInkBleed)"
        />
        <path
          d="M 625 120 C 595 85 555 60 505 50"
          strokeWidth="5"
        />
        <path
          d="M 370 200 C 330 180 290 175 245 180"
          strokeWidth="4"
        />
      </g>

      {/* Structured Layer 2: Organic Ink Leaf Clusters (Sumi Silhouette) */}
      <g className="animate-foliage" fill="#171717" opacity="0.94" filter="url(#treeInkBleed)">
        {/* Upper Crown Clusters */}
        <path d="M 660 45 Q 730 10 750 70 Q 720 120 650 90 Q 610 70 660 45 Z" />
        <path d="M 500 40 Q 560 10 580 60 Q 540 95 480 75 Q 460 50 500 40 Z" />

        {/* Major Overhanging Branch Foliage */}
        <path d="M 400 250 Q 460 210 490 260 Q 450 305 390 285 Q 360 260 400 250 Z" />
        <path d="M 340 180 Q 400 145 425 195 Q 380 230 325 210 Q 300 190 340 180 Z" />
        <path d="M 230 165 Q 280 140 300 180 Q 260 210 215 190 Q 200 170 230 165 Z" />

        {/* Lower Sweeping Branch Clusters */}
        <path d="M 280 325 Q 340 300 350 355 Q 305 388 250 365 Q 240 335 280 325 Z" />
        <path d="M 220 360 Q 270 340 280 385 Q 235 410 200 385 Q 190 365 220 360 Z" />
      </g>

      {/* Structured Layer 3: Vermilion Blossom / Autumn Accents */}
      <g fill="#A52A20" opacity="0.88">
        <circle cx="420" cy="245" r="4.5" />
        <circle cx="330" cy="190" r="4" />
        <circle cx="290" cy="340" r="5" />
        <circle cx="230" cy="370" r="3.5" />
        <circle cx="670" cy="55" r="5" />
        <circle cx="510" cy="45" r="4" />
      </g>
    </g>
  );
}
