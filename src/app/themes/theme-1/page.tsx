"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Globe, MessageSquare, Share2 } from "lucide-react";

export default function Theme1Page() {
  return (
    <div className="min-h-screen bg-[#0a0d16] text-white relative overflow-hidden font-sans select-none">
      {/* Background Cosmic Nebula FX */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/40 via-blue-950/20 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-amber-600/20 via-orange-950/10 to-transparent pointer-events-none" />
      <div
        className="absolute inset-0 opacity-40 bg-cover bg-center pointer-events-none mix-blend-screen"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=2000&auto=format&fit=crop')`,
        }}
      />
      {/* Mountain Landscape Silhouette */}
      <div
        className="absolute bottom-0 inset-x-0 h-96 bg-contain bg-bottom bg-no-repeat opacity-90 pointer-events-none z-10"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2000&auto=format&fit=crop')`,
          filter: 'brightness(0.15) contrast(1.5)',
        }}
      />

      {/* Navigation Header */}
      <header className="relative z-20 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-xl tracking-wider text-white">SKILLSWAP.</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="#" className="hover:text-white transition-colors">Home</Link>
          <Link href="#" className="hover:text-white transition-colors">About</Link>
          <Link href="#" className="hover:text-white transition-colors">Technology</Link>
          <Link href="#" className="hover:text-white transition-colors">Services</Link>
        </nav>
        <button className="px-5 py-2.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-sm font-medium hover:bg-white/20 transition-all">
          Book a call
        </button>
      </header>

      {/* Main Hero Content */}
      <main className="relative z-20 max-w-7xl mx-auto px-6 pt-16 pb-32 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
            SKILLSWAP.COM
          </p>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.05] text-white">
            The New Era of Intelligence is Regenerative
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
            Intelligence isn&apos;t artificial, it&apos;s evolving with purpose.
            We&apos;re building systems that adapt, regenerate, and empower peer skill sharing across global student networks.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button className="px-6 py-3.5 rounded-full bg-black text-white border border-white/20 font-semibold text-sm flex items-center gap-2 hover:bg-slate-900 transition-all shadow-lg shadow-purple-950/50">
              Meet the System <ArrowRight size={16} />
            </button>
            <button className="px-6 py-3.5 rounded-full bg-white/5 border border-white/20 backdrop-blur-md text-white font-semibold text-sm hover:bg-white/10 transition-all">
              Join the Evolution
            </button>
          </div>
        </div>

        {/* Right Floating Card Mockup */}
        <div className="lg:col-span-5 relative">
          <div className="p-6 rounded-3xl bg-slate-950/60 border border-white/15 backdrop-blur-xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
                <Sparkles size={14} /> Featured Peer Match
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                98% Compatibility
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Alex Rivera & Elena Rostova</h3>
              <p className="text-xs text-slate-400">Full-stack Engineering ⇄ UI Design Exchange</p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Teaches:</span>
                <span className="font-semibold text-white">React, TypeScript, Next.js</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Wants to Learn:</span>
                <span className="font-semibold text-white">Figma, Design Systems</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-400 font-medium">Rating: 4.9 ★ (42 Swaps)</span>
              <button className="px-4 py-2 rounded-lg bg-white text-black font-bold text-xs hover:bg-slate-200 transition-colors">
                Connect Now
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Bottom Social Icons */}
      <div className="absolute bottom-8 right-8 z-20 hidden sm:flex flex-col gap-3">
        <button className="p-3 rounded-full bg-black/60 border border-white/20 text-white hover:bg-white/20 transition-all">
          <Globe size={18} />
        </button>
        <button className="p-3 rounded-full bg-black/60 border border-white/20 text-white hover:bg-white/20 transition-all">
          <MessageSquare size={18} />
        </button>
        <button className="p-3 rounded-full bg-black/60 border border-white/20 text-white hover:bg-white/20 transition-all">
          <Share2 size={18} />
        </button>
      </div>
    </div>
  );
}
