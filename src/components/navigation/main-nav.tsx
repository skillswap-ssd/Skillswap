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
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-md transition-colors">
      <nav className="container flex min-h-16 items-center justify-between gap-3 px-4">
        <Link href="/" className="font-display text-2xl font-bold tracking-tight text-[var(--foreground)]">
          Skill<span className="text-[var(--primary)]">Swap</span>
        </Link>

        <div className="hidden items-center gap-6 lg:flex text-sm font-semibold text-[var(--secondary)]">
          {links.map(([l, h]) => {
            const isActive = pathname === h || (h !== "/" && pathname.startsWith(h));
            return (
              <Link
                key={h}
                href={h}
                className={`transition-colors hover:text-[var(--primary)] ${
                  isActive
                    ? "text-[var(--foreground)] font-bold border-b-2 border-[var(--primary)] pb-1"
                    : "text-[var(--secondary)]"
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
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface)] transition"
          >
            <Sparkles size={13} className="text-[var(--primary)]" /> Practice
          </Link>

          <Link
            aria-label="Notifications"
            href="/notifications"
            className="relative p-2 rounded-lg text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[var(--primary)]" />
            )}
          </Link>

          <Link
            aria-label="Profile"
            href={`/profile/${currentUser?.username || "ezra"}`}
            className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition"
          >
            <UserRound size={18} />
          </Link>
        </div>
      </nav>

      {/* Mobile Horizontal Navigation Bar */}
      <div className="container flex items-center gap-4 overflow-x-auto pb-2.5 pt-1 text-xs font-semibold text-[var(--secondary)] lg:hidden px-4 no-scrollbar">
        {links.map(([l, h]) => {
          const isActive = pathname === h || (h !== "/" && pathname.startsWith(h));
          return (
            <Link
              key={h}
              href={h}
              className={`shrink-0 transition-colors ${
                isActive
                  ? "text-[var(--primary)] font-bold underline underline-offset-4 decoration-[var(--primary)]"
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
