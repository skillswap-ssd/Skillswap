"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function Theme2Page() {
  return (
    <div className="min-h-screen bg-[#60695a] text-white relative overflow-hidden font-sans select-none flex flex-col justify-between">
      {/* Background Hill / Nature Photo */}
      <div
        className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-80 pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

      {/* Floating Glass Top Navbar */}
      <header className="relative z-20 max-w-7xl mx-auto w-full px-6 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md border-2 border-white flex items-center justify-center font-black text-xs">
            S
          </div>
        </div>

        <nav className="flex items-center gap-1 p-1.5 rounded-2xl bg-black/30 backdrop-blur-xl border border-white/20 text-xs font-semibold text-slate-200">
          <span className="px-4 py-1.5 rounded-xl bg-amber-950/80 text-amber-200 border border-amber-500/30">Home</span>
          <Link href="#" className="px-4 py-1.5 hover:text-white transition-colors">Generate</Link>
          <Link href="#" className="px-4 py-1.5 hover:text-white transition-colors">Gallery</Link>
          <Link href="#" className="px-4 py-1.5 hover:text-white transition-colors">Pricing</Link>
        </nav>

        <button className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-slate-100 transition-all shadow-md">
          Get In Touch
        </button>
      </header>

      {/* Giant Typography Background Text */}
      <div className="relative z-10 my-auto text-center px-4 py-8">
        <h1 className="text-[15vw] sm:text-[18vw] font-black tracking-tighter leading-none text-white/90 select-none uppercase font-serif">
          VISIONARY
        </h1>

        {/* Central Architectural Structure Feature Image */}
        <div className="relative max-w-xl mx-auto -mt-[8vw] sm:-mt-[10vw]">
          <div className="relative rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-neutral-800">
            <img
              src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop"
              alt="Architectural structure"
              className="w-full h-64 sm:h-80 object-cover object-center filter saturate-[0.8]"
            />

            {/* Get Started Button overlay on container */}
            <div className="absolute top-1/2 left-8 -translate-y-1/2">
              <button className="px-4 py-2 rounded-lg bg-black/40 backdrop-blur-md border border-white/30 text-white text-xs font-semibold flex items-center gap-2 hover:bg-black/60 transition-all">
                Get Started <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Metrics & Description Bar */}
      <footer className="relative z-20 max-w-7xl mx-auto w-full px-6 pb-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
        <div className="md:col-span-8 grid grid-cols-3 gap-6 p-6 rounded-2xl bg-black/30 backdrop-blur-xl border border-white/15">
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold block text-white">+10000</span>
            <span className="text-[11px] font-medium text-slate-300">Images Generated Monthly</span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold block text-white">+120</span>
            <span className="text-[11px] font-medium text-slate-300">Active Creators</span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold block text-white">98%</span>
            <span className="text-[11px] font-medium text-slate-300">User Satisfaction Rate</span>
          </div>
        </div>

        <div className="md:col-span-4 text-right space-y-1">
          <span className="text-xs font-mono font-bold text-slate-300 block">01</span>
          <p className="text-xs sm:text-sm font-semibold text-slate-200 max-w-xs ml-auto">
            Create high-quality AI-generated images & peer learning matches in seconds.
          </p>
        </div>
      </footer>
    </div>
  );
}
