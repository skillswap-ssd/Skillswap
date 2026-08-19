"use client";

import Link from "next/link";
import { Bell, UserRound } from "lucide-react";
import { useSkillSwap } from "@/lib/context/skillswap-context";

const links = [
  ["Discover", "/discover"],
  ["Matches", "/matches"],
  ["Connections", "/connections"],
  ["Messages", "/messages"],
  ["Skills", "/skills"],
];

export function MainNav() {
  const { notifications, currentUser } = useSkillSwap();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_92%,transparent)] backdrop-blur">
      <nav className="container flex min-h-16 items-center justify-between gap-3 px-4">
        <Link href="/" className="font-display text-2xl">
          Skill<span className="text-[var(--primary)]">Swap</span>
        </Link>
        <div className="hidden gap-6 md:flex">
          {links.map(([l, h]) => (
            <Link className="font-bold hover:text-[var(--primary)] transition-colors" key={h} href={h}>
              {l}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <Link aria-label="Notifications" href="/notifications" className="relative p-1">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-[var(--primary)] border-2 border-[var(--background)]" />
            )}
          </Link>
          <Link aria-label="Profile" href={`/profile/${currentUser?.username || "ezra"}`} className="p-1">
            <UserRound size={20} />
          </Link>
        </div>
      </nav>
      <div className="container flex gap-4 overflow-x-auto pb-3 text-sm font-bold md:hidden px-4">
        {links.map(([l, h]) => (
          <Link key={h} href={h}>
            {l}
          </Link>
        ))}
      </div>
    </header>
  );
}
