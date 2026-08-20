"use client";

interface JapaneseTreeProps {
  className?: string;
  isMobile?: boolean;
}

export function JapaneseTree({ className, isMobile = false }: JapaneseTreeProps) {
  return (
    <g className={className}>
      <defs>
        <filter id="treeInkBleed" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>

        {/* Authentic Japanese Pine Foliage Cushion Pad (Sumi-e Matsu-sho) */}
        <g id="pineNeedlePad">
          {/* Main soft sumi cloud cushion */}
          <path
            d="M -35 0 C -35 -18, -18 -26, 0 -26 C 18 -26, 35 -18, 35 0 C 25 6, -25 6, -35 0 Z"
            fill="#171717"
            filter="url(#treeInkBleed)"
          />
          <path
            d="M -30 -2 C -30 -16, -15 -22, 0 -22 C 15 -22, 30 -16, 30 -2 C 20 4, -20 4, -30 -2 Z"
            fill="#23221F"
          />
          {/* Subtle sumi-e pine needle stroke bursts along top edge */}
          <path
            d="M -32 -4 L -36 -12 M -24 -12 L -27 -20 M -14 -18 L -16 -27 M 0 -22 L 0 -30 M 14 -18 L 16 -27 M 24 -12 L 27 -20 M 32 -4 L 36 -12"
            stroke="#171717"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>
      </defs>

      {/* Layer 1: Dark Sumi-e Rocky Cliff Face (Right Side) */}
      <g opacity="0.95">
        {/* Main Cliff Mass */}
        <path
          d="M 580 600 L 590 520 L 575 490 L 630 480 L 650 510 L 680 470 L 720 500 L 760 450 L 800 480 L 800 600 Z"
          fill="#171717"
          filter="url(#treeInkBleed)"
        />
        {/* Cliff Shadow & Shading Facets */}
        <path
          d="M 630 480 L 610 540 L 650 600 L 680 600 L 650 510 Z"
          fill="#0D0D0D"
        />
        <path
          d="M 680 470 L 660 530 L 710 600 L 740 600 L 720 500 Z"
          fill="#252420"
        />
        <path
          d="M 760 450 L 730 520 L 780 600 L 800 600 L 800 480 Z"
          fill="#111110"
        />
        {/* Rocky Edge Contour Lines */}
        <path
          d="M 575 490 L 630 480 L 650 510 L 680 470 L 720 500 L 760 450 M 590 520 L 610 540 M 650 510 L 660 530 M 720 500 L 730 520"
          stroke="#383530"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </g>

      {/* Layer 2: Traditional Man Figure on Cliff Ledge */}
      <g fill="#171717" opacity="0.95" className="animate-man-subtle">
        {/* Ledge Stand Ground shadow */}
        <ellipse cx="612" cy="482" rx="14" ry="3" fill="#0A0A0A" />

        {/* Traditional Conical Hat / Hair Knot */}
        <path d="M 605 448 L 612 442 L 619 448 Q 612 446 605 448 Z" fill="#23221E" />
        <circle cx="612" cy="450" r="3" fill="#171717" />

        {/* Robe / Body Silhouette */}
        <path d="M 608 453 Q 612 453 616 453 L 620 467 L 622 481 L 602 481 L 604 467 Z" />
        <path d="M 606 462 L 600 472 Q 598 475 601 475 L 608 470 Z" fill="#111110" />

        {/* Angled Staff / Rod in Hand */}
        <line
          x1="603"
          y1="466"
          x2="550"
          y2="512"
          stroke="#171717"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </g>

      {/* Layer 3: Gnarled Japanese Pine Trunk & Major Boughs */}
      <g stroke="#171717" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Main Base Trunk anchored in Cliff */}
        <path
          d={
            isMobile
              ? "M 665 520 C 650 450 635 380 655 310 C 670 250 705 190 700 130"
              : "M 670 520 C 655 450 640 380 660 310 C 675 250 710 190 705 130"
          }
          strokeWidth="20"
          filter="url(#treeInkBleed)"
        />
        <path
          d={
            isMobile
              ? "M 660 520 C 646 450 631 380 651 310 C 666 250 701 190 696 130"
              : "M 665 520 C 651 450 636 380 656 310 C 671 250 706 190 701 130"
          }
          strokeWidth="11"
          stroke="#2A2824"
        />

        {/* Major Upper Left Sweeping Branch */}
        <path
          d="M 660 310 C 600 280 540 260 470 270 C 410 280 350 310 290 340"
          strokeWidth="12"
          filter="url(#treeInkBleed)"
        />
        <path
          d="M 660 310 C 600 280 540 260 470 270 C 410 280 350 310 290 340"
          strokeWidth="6"
          stroke="#2E2C28"
        />

        {/* Mid-level Reaching Branch */}
        <path
          d="M 520 266 C 450 230 380 210 310 205"
          strokeWidth="8"
          filter="url(#treeInkBleed)"
        />
        <path
          d="M 420 280 C 360 310 300 350 240 380"
          strokeWidth="6"
        />

        {/* Crown Top Branches */}
        <path
          d="M 685 200 C 650 150 600 110 530 90"
          strokeWidth="7"
          filter="url(#treeInkBleed)"
        />
        <path
          d="M 703 145 C 730 110 760 80 800 60"
          strokeWidth="6"
        />
        <path
          d="M 330 205 C 270 180 210 170 150 175"
          strokeWidth="4"
        />
      </g>

      {/* Layer 4: Authentic Sumi-e Pine Needle Foliage Clusters (Layered Pads) */}
      <g className="animate-foliage" transform-origin="660px 310px">
        {/* Top Crown Pine Clusters */}
        <g transform="translate(705, 125) scale(1.3) rotate(-5)">
          <use href="#pineNeedlePad" />
        </g>
        <g transform="translate(660, 100) scale(1.2) rotate(-12)">
          <use href="#pineNeedlePad" />
        </g>
        <g transform="translate(530, 90) scale(1.1) rotate(-8)">
          <use href="#pineNeedlePad" />
        </g>
        <g transform="translate(775, 60) scale(1.0) rotate(10)">
          <use href="#pineNeedlePad" />
        </g>

        {/* Upper Sweeping Bough Needle Pads */}
        <g transform="translate(470, 270) scale(1.5) rotate(-2)">
          <use href="#pineNeedlePad" />
        </g>
        <g transform="translate(410, 245) scale(1.3) rotate(-6)">
          <use href="#pineNeedlePad" />
        </g>
        <g transform="translate(350, 218) scale(1.2) rotate(-4)">
          <use href="#pineNeedlePad" />
        </g>
        <g transform="translate(310, 205) scale(1.1) rotate(-8)">
          <use href="#pineNeedlePad" />
        </g>

        {/* Middle Overhanging Foliage Pads */}
        <g transform="translate(390, 295) scale(1.4) rotate(4)">
          <use href="#pineNeedlePad" />
        </g>
        <g transform="translate(330, 325) scale(1.3) rotate(8)">
          <use href="#pineNeedlePad" />
        </g>
        <g transform="translate(285, 348) scale(1.2) rotate(4)">
          <use href="#pineNeedlePad" />
        </g>

        {/* Lower Left Descending Pine Pads */}
        <g transform="translate(240, 382) scale(1.1) rotate(10)">
          <use href="#pineNeedlePad" />
        </g>
        <g transform="translate(190, 396) scale(1.0) rotate(6)">
          <use href="#pineNeedlePad" />
        </g>
        <g transform="translate(150, 178) scale(1.0) rotate(-5)">
          <use href="#pineNeedlePad" />
        </g>
      </g>

      {/* Layer 5: Vermilion Accent Blossoms / Pine Needles */}
      <g fill="#A52A20" opacity="0.9">
        <circle cx="470" cy="255" r="4" />
        <circle cx="410" cy="230" r="3.5" />
        <circle cx="350" cy="205" r="4.5" />
        <circle cx="330" cy="310" r="4" />
        <circle cx="285" cy="335" r="3.5" />
        <circle cx="705" cy="110" r="4.5" />
        <circle cx="530" cy="75" r="3.5" />
      </g>
    </g>
  );
}
