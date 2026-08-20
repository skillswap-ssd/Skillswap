"use client";

import Link from "next/link";
import { Sparkles, Play } from "lucide-react";

export default function Theme5Page() {
  return (
    <div className="min-h-screen bg-[#07090e] text-white relative overflow-hidden font-sans select-none flex flex-col justify-between">
      {/* Background Neon Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-purple-600/30 via-cyan-500/20 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-pink-600/20 blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-20 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-xl tracking-wider text-white">FLUTTERTOP.</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
          <Link href="#" className="hover:text-white transition-colors">Home page</Link>
          <Link href="#" className="hover:text-white transition-colors">About us</Link>
          <Link href="#" className="hover:text-white transition-colors">Pricing- plane</Link>
          <Link href="#" className="hover:text-white transition-colors">Contact us</Link>
        </nav>
      </header>

      {/* Hero Visual Section */}
      <main className="relative z-20 max-w-7xl mx-auto w-full px-6 py-8 flex flex-col items-center text-center space-y-6">
        {/* Central Glowing Cyberpunk Portrait Visual */}
        <div className="relative w-72 sm:w-96 h-72 sm:h-96 rounded-full flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500 via-purple-600 to-pink-500 opacity-60 blur-2xl animate-pulse" />
          <img
            src="https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop"
            alt="Cyberpunk AI visual"
            className="w-full h-full object-cover rounded-full border-2 border-cyan-400/40 relative z-10 shadow-2xl filter contrast-125"
          />
        </div>

        {/* Duotone Headline */}
        <h1 className="text-5xl sm:text-8xl font-black uppercase tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 font-mono">
          NEW WAY TO GENERATE
        </h1>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button className="px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-purple-500/30">
            <Sparkles size={14} /> Generate
          </button>
          <button className="px-8 py-3.5 rounded-full bg-black/60 border border-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-white/10 transition-all">
            How it works <Play size={12} fill="white" />
          </button>
        </div>
      </main>

      {/* How it works & Stats Bar Footer */}
      <footer className="relative z-20 max-w-7xl mx-auto w-full px-6 pb-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
        <div className="md:col-span-6 space-y-2 text-xs text-slate-400">
          <h3 className="text-sm font-bold text-white">How it works?</h3>
          <ul className="space-y-1.5 list-disc list-inside font-medium">
            <li>Input Your Concept: Provide a description of your idea.</li>
            <li>Generate the Image: AI creates an image based on your input.</li>
            <li>Refine and Save: Adjust the image as needed and save it.</li>
          </ul>
        </div>

        <div className="md:col-span-6 grid grid-cols-3 gap-6 text-right border-l md:border-slate-800 md:pl-8">
          <div>
            <span className="text-2xl sm:text-4xl font-mono font-black text-white block">10k+</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active user</span>
          </div>
          <div>
            <span className="text-2xl sm:text-4xl font-mono font-black text-white block">4k</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Resolution image</span>
          </div>
          <div>
            <span className="text-2xl sm:text-4xl font-mono font-black text-white block">12k+</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Our monthly artboards</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
