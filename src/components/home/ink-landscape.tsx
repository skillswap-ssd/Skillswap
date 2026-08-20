"use client";

import Image from "next/image";

export function InkLandscape() {
  return (
    <div className="relative w-full max-w-[660px] mx-auto select-none overflow-hidden rounded-2xl border border-[var(--border)] bg-[#F7F2E9] shadow-sm">
      <Image
        src="/hero-landscape.png"
        alt="Japanese ink landscape with sun, mountains, tree and figure"
        width={1024}
        height={1536}
        className="w-full h-auto object-cover rounded-2xl"
        priority
      />
    </div>
  );
}
