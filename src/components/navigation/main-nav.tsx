"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, UserRound, Sparkles } from "lucide-react";
import { useSkillSwap } from "@/lib/context/skillswap-context";

const links = [
  ["Home", "/"],
  ["Discover", "/discover"],
  ["Matches", "/matches"],
  ["Connections", "/connections"],
  ["Messages", "/messages"],
  ["Practice", "/practice"],
  ["Skills", "/skills"],
];

export function MainNav() {
  const pathname = usePathname();
  const { notifications, currentUser } = useSkillSwap();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[#fcfbf9]/90 backdrop-blur-md">
      <nav className="container flex min-h-16 items-center justify-between gap-3 px-4">
        <Link href="/" className="font-display text-2xl font-bold tracking-tight text-[#1c2430]">
          Skill<span className="text-amber-600">Swap</span>
        </Link>

        <div className="hidden items-center gap-6 lg:flex text-sm font-semibold text-[#1c2430]">
          {links.map(([l, h]) => {
            const isActive = pathname === h || (h !== "/" && pathname.startsWith(h));
            return (
              <Link
                key={h}
                href={h}
                className={`transition-colors hover:text-amber-600 ${
                  isActive ? "text-[#1c2430] font-bold border-b-2 border-[#1c2430] pb-1" : "text-[#64748b]"
                }`}
              >
                {l}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/practice"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-[#e2ded8] bg-[#f7f5f0] px-3 py-1.5 text-xs font-semibold text-[#1c2430] hover:bg-[#f0ece1] transition"
          >
            <Sparkles size={13} className="text-amber-600" /> Practice
          </Link>

          <Link
            aria-label="Notifications"
            href="/notifications"
            className="relative p-2 rounded-lg text-[#1c2430] hover:bg-[#f7f5f0] transition"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-600" />
            )}
          </Link>

          <Link
            aria-label="Profile"
            href={`/profile/${currentUser?.username || "ezra"}`}
            className="p-1.5 rounded-lg border border-[#e2ded8] bg-white text-[#1c2430] hover:bg-[#f7f5f0] transition"
          >
            <UserRound size={18} />
          </Link>
        </div>
      </nav>

      {/* Mobile Horizontal Navigation Bar */}
      <div className="container flex items-center gap-4 overflow-x-auto pb-2.5 pt-1 text-xs font-semibold text-[#64748b] lg:hidden px-4 no-scrollbar">
        {links.map(([l, h]) => {
          const isActive = pathname === h || (h !== "/" && pathname.startsWith(h));
          return (
            <Link
              key={h}
              href={h}
              className={`shrink-0 transition-colors ${
                isActive ? "text-[#1c2430] font-bold underline underline-offset-4" : "hover:text-[#1c2430]"
              }`}
            >
              {l}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
