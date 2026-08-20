"use client";

import Link from "next/link";
import { ArrowUpRight, Palette } from "lucide-react";

const themes = [
  {
    id: "theme-1",
    title: "Theme Idea 1: Cosmic Nebula & Regenerative Space",
    refImage: "IMG_5157.jpeg",
    description: "Deep space nebula background, rounded glass pill controls, warm golden landscape horizon glow, and high-contrast typography.",
    bgGradient: "from-purple-900/60 to-slate-950 text-white",
    descColor: "text-slate-300",
    btnStyle: "bg-white/10 hover:bg-white/20 border-white/20 text-white",
  },
  {
    id: "theme-2",
    title: "Theme Idea 2: Architectural Minimalist Brutalist",
    refImage: "IMG_5158.jpeg",
    description: "Serene hilltop background, bold condensed serif headline 'VISIONARY', modular container motif, floating glass pill navbar.",
    bgGradient: "from-stone-700 to-stone-900 text-white",
    descColor: "text-stone-300",
    btnStyle: "bg-white/10 hover:bg-white/20 border-white/20 text-white",
  },
  {
    id: "theme-3",
    title: "Theme Idea 3: High-Energy Crimson Flame",
    refImage: "IMG_5159.jpeg",
    description: "Vibrant fiery burnt orange motion gradient, tech pixel typography, prompt input with glowing action button, dark feature badges.",
    bgGradient: "from-red-800 to-orange-950 text-white",
    descColor: "text-orange-200/80",
    btnStyle: "bg-white/10 hover:bg-white/20 border-white/20 text-white",
  },
  {
    id: "theme-4",
    title: "Theme Idea 4: Soft High-Tech Light Grey",
    refImage: "IMG_5160.jpeg",
    description: "Ultra-clean soft grey backdrop, floating 3D high-tech elements, sleek dark pill action buttons, clean floating stat cards.",
    bgGradient: "from-slate-100 to-slate-300 text-slate-900",
    descColor: "text-slate-700",
    btnStyle: "bg-slate-900 hover:bg-slate-800 text-white border-slate-900",
  },
  {
    id: "theme-5",
    title: "Theme Idea 5: Cyberpunk Dark Neon",
    refImage: "IMG_5161.jpeg",
    description: "Obsidian dark theme with glowing cyan, violet, and magenta neon aura backdrops, duotone cutout header text, electric gradient buttons.",
    bgGradient: "from-cyan-950 via-purple-950 to-slate-950 text-white",
    descColor: "text-purple-200/80",
    btnStyle: "bg-white/10 hover:bg-white/20 border-white/20 text-white",
  },
];

export default function ThemesOverviewPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white p-8 space-y-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-4 border-b border-slate-800 pb-8">
        <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-sky-400 uppercase tracking-widest bg-sky-950/60 px-3 py-1 rounded-full border border-sky-800">
          <Palette size={14} /> Theme Exploration Gallery
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">Theme Mockups & Visual Previews</h1>
        <p className="text-slate-400 text-sm max-w-2xl">
          Visual adaptations of SkillSwap corresponding to your 5 uploaded design theme concepts. Select any theme to view its full interactive layout.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((t) => (
          <div
            key={t.id}
            className={`p-6 rounded-2xl border border-slate-800 bg-gradient-to-b ${t.bgGradient} flex flex-col justify-between space-y-6 shadow-xl hover:border-slate-600 transition-all`}
          >
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold opacity-70 block">{t.refImage}</span>
              <h2 className="text-xl font-bold">{t.title}</h2>
              <p className={`text-xs ${t.descColor} leading-relaxed`}>{t.description}</p>
            </div>

            <Link
              href={`/themes/${t.id}`}
              className={`inline-flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${t.btnStyle}`}
            >
              <span>View Full Theme Screen</span>
              <ArrowUpRight size={16} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
