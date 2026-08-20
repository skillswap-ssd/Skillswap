"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function Theme3Page() {
  return (
    <div className="min-h-screen bg-[#1e0705] text-white relative overflow-hidden font-sans select-none flex flex-col justify-between">
      {/* Background Crimson Fiery Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#d9381e] via-[#801308] to-[#120202] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-orange-500/30 via-transparent to-transparent pointer-events-none" />

      {/* Blurred Subject Backdrop */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1/2 bg-cover bg-center opacity-40 blur-sm pointer-events-none mix-blend-screen"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop')`,
        }}
      />

      {/* Header */}
      <header className="relative z-20 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid grid-cols-2 gap-0.5 w-5 h-5">
            <div className="bg-white rounded-xs" />
            <div className="bg-white rounded-xs" />
            <div className="bg-white rounded-xs" />
            <div className="bg-white/50 rounded-xs" />
          </div>
          <span className="font-extrabold text-lg tracking-tight">Genivix</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-bold tracking-widest uppercase text-slate-200">
          <Link href="#" className="hover:text-white transition-colors">REPORTS</Link>
          <Link href="#" className="hover:text-white transition-colors">DASHBOARD</Link>
          <Link href="#" className="hover:text-white transition-colors">FEATURES</Link>
        </nav>

        <button className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white hover:text-slate-200 transition-colors">
          SIGN UP
        </button>
      </header>

      {/* Hero Section */}
      <main className="relative z-20 max-w-7xl mx-auto w-full px-6 py-12 grid lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-8 space-y-6">
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight leading-[1.02] text-white font-mono">
            TURN IDEAS INTO STUNNING IMAGES INSTANTLY
          </h1>
          <p className="text-xs sm:text-sm font-semibold tracking-wider text-slate-200 uppercase max-w-lg leading-relaxed">
            CREATE HIGH-QUALITY VISUALS FROM SIMPLE TEXT PROMPTS USING THE POWER OF NEXT-GEN AI.
          </p>

          {/* Prompt Bar Card */}
          <div className="mt-8 max-w-xl p-2 rounded-xl bg-black/40 border border-white/20 backdrop-blur-md flex items-center gap-3 shadow-2xl">
            <input
              type="text"
              placeholder="Describe what you want to generate"
              className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none"
            />
            <button className="shrink-0 px-6 py-3 rounded-lg bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 hover:opacity-90 transition-all shadow-lg">
              GENERATE NOW <Sparkles size={14} />
            </button>
          </div>
        </div>

        {/* Right Feature Card Overlay */}
        <div className="lg:col-span-4 flex justify-end">
          <div className="w-56 p-4 rounded-xl bg-black/60 border border-white/20 backdrop-blur-lg space-y-3">
            <span className="text-3xl font-mono font-bold block text-white">[50⁺]</span>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-300 block">
              ARTISTIC STYLES
            </span>
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop"
              alt="Artistic style preview"
              className="w-full h-32 object-cover rounded-lg"
            />
          </div>
        </div>
      </main>

      {/* Footer Stats & Visual Grid */}
      <footer className="relative z-20 max-w-7xl mx-auto w-full px-6 pb-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-6 flex items-center gap-4">
          <div className="flex -space-x-3">
            <img className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100" alt="Avatar" />
            <img className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100" alt="Avatar" />
            <img className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=100" alt="Avatar" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-extrabold text-white">[10M+]</span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              IMAGES GENERATED
            </span>
          </div>
        </div>

        <div className="md:col-span-6 flex justify-end">
          <div className="w-full md:w-80 h-36 rounded-xl overflow-hidden border border-white/20 relative">
            <img
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"
              alt="Neural graphic"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </footer>
    </div>
  );
}
