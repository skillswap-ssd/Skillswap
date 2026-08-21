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
];

export function MainNav() {
  const pathname = usePathname();
  const { notifications, currentUser } = useSkillSwap();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-[var(--background)]/95 backdrop-blur-sm transition-colors">
      <nav className="container flex min-h-16 items-center justify-between gap-4 px-4 py-3">
        <div className="flex flex-col items-start shrink-0">
          <Link href="/" className="font-display text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Skill<span className="text-[var(--primary)]">Swap</span>
          </Link>
          <div className="w-5 h-5 border-[1.5px] border-[var(--primary)] text-[var(--primary)] rounded-xs flex flex-col justify-between p-0.5 text-[7px] font-extrabold leading-none select-none mt-0.5">
            <div className="flex justify-between"><span>技</span><span>能</span></div>
            <div className="flex justify-between"><span>交</span><span>换</span></div>
          </div>
        </div>

        <div className="hidden items-center gap-8 md:flex text-sm font-medium text-[var(--secondary)]">
          {links.map(([l, h]) => {
            const isActive = pathname === h || (h !== "/" && pathname.startsWith(h));
            return (
              <Link
                key={h}
                href={h}
                className={`relative py-1 transition-colors hover:text-[var(--foreground)] ${
                  isActive
                    ? "text-[var(--foreground)] font-semibold after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-[2px] after:bg-[var(--primary)]"
                    : "text-[var(--secondary)]"
                }`}
              >
                {l}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            aria-label="Notifications"
            href="/notifications"
            className="relative p-2 rounded-full text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--primary)]" />
            )}
          </Link>

          <Link
            aria-label="Profile"
            href={`/profile/${currentUser?.username || "ezra"}`}
            className="flex items-center gap-1 p-0.5 rounded-full text-[var(--foreground)] hover:opacity-80 transition"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-300 border border-[var(--border)] flex items-center justify-center">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                <UserRound size={18} />
              )}
            </div>
            <span className="text-xs text-[var(--muted)]">▾</span>
          </Link>
        </div>
      </nav>

      {/* Mobile Horizontal Navigation Bar */}
      <div className="container flex items-center gap-5 overflow-x-auto pb-2.5 pt-0.5 text-xs font-medium text-[var(--secondary)] md:hidden px-4 no-scrollbar border-t border-[var(--border)]/40">
        {links.map(([l, h]) => {
          const isActive = pathname === h || (h !== "/" && pathname.startsWith(h));
          return (
            <Link
              key={h}
              href={h}
              className={`shrink-0 py-1 transition-colors ${
                isActive
                  ? "text-[var(--primary)] font-bold border-b-2 border-[var(--primary)]"
                  : "hover:text-[var(--foreground)]"
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
