"use client";

import Link from "next/link";
import { Phone } from "lucide-react";

export default function Theme4Page() {
  return (
    <div className="min-h-screen bg-[#dce1e8] text-slate-900 relative overflow-hidden font-sans select-none flex flex-col justify-between">
      {/* Background Lighting Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/80 via-transparent to-slate-400/30 pointer-events-none" />

      {/* Header Navigation */}
      <header className="relative z-20 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-black text-xl tracking-tight text-black">FLUTTERTOP.</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-700">
          <Link href="#" className="hover:text-black transition-colors">Home</Link>
          <Link href="#" className="hover:text-black transition-colors">About</Link>
          <Link href="#" className="hover:text-black transition-colors">Technology</Link>
          <Link href="#" className="hover:text-black transition-colors">Services</Link>
        </nav>

        <button className="px-6 py-2.5 rounded-full bg-black text-white font-bold text-sm hover:bg-slate-800 transition-all shadow-md">
          Book a call
        </button>
      </header>

      {/* Hero Section */}
      <main className="relative z-20 max-w-7xl mx-auto w-full px-6 py-12 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/70 border border-slate-300 text-xs font-bold text-slate-800 shadow-xs">
            World&apos;s Most Adopted Healthcare AI
          </span>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.05] text-slate-950">
            Revolutionizing Healthcare with AI
          </h1>

          <p className="text-sm sm:text-base font-medium text-slate-600 max-w-lg leading-relaxed">
            Redefine healthcare with AI! Experience the power of faster diagnostics and precisely tailored treatments, designed by Fluttertop. Unveil the immense potential of intelligent care. Bridge the gap between cutting-edge technology and holistic wellness.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button className="px-6 py-3.5 rounded-full bg-black text-white font-bold text-xs flex items-center gap-2 hover:bg-slate-800 transition-all shadow-md">
              <Phone size={14} /> Book a call
            </button>
            <button className="px-6 py-3.5 rounded-full bg-white/60 border border-slate-300 text-slate-800 font-bold text-xs hover:bg-white transition-all">
              Appointment
            </button>
          </div>
        </div>

        {/* 3D Robotic Graphic & Floating Badges */}
        <div className="lg:col-span-6 relative flex justify-center items-center">
          {/* Main Visual Image (3D Robot Hand & Hologram Brain mockup) */}
          <div className="relative w-full max-w-lg h-[400px]">
            <img
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop"
              alt="Healthcare AI visual"
              className="w-full h-full object-cover rounded-3xl shadow-2xl filter brightness-105 contrast-105"
            />

            {/* Floating Top Badge */}
            <div className="absolute top-6 right-6 p-3 rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 shadow-lg flex items-center gap-3">
              <div className="flex -space-x-2">
                <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=100" alt="Doctor" />
                <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=100" alt="Doctor" />
              </div>
              <div>
                <span className="text-xs font-black block text-slate-900">300+</span>
                <span className="text-[10px] font-bold text-slate-500">Expert doctors</span>
              </div>
            </div>

            {/* Floating Bottom Card */}
            <div className="absolute bottom-6 right-6 p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 shadow-xl space-y-2 w-48">
              <div className="h-20 rounded-xl overflow-hidden">
                <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=400" className="w-full h-full object-cover" alt="Diagnostic view" />
              </div>
              <span className="text-sm font-black block text-slate-900">5,000+</span>
              <span className="text-[10px] font-bold text-slate-500 block">Design by Fluttertop</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Reviews Bar */}
      <footer className="relative z-20 max-w-7xl mx-auto w-full px-6 pb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100" alt="User" />
            <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100" alt="User" />
            <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100" alt="User" />
          </div>
          <p className="text-xs font-bold text-slate-700">
            Rated <span className="font-extrabold text-black">5/5</span> & Trusted by <span className="font-extrabold text-black">1000+ Patients</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
