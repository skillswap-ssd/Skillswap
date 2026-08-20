import React from "react";
import { Card } from "@/components/ui/card";
import type { WeeklyInsightSummary } from "@/lib/recommendations";
import { Calendar, Users, Target, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

interface WeeklyInsightCardProps {
  summary: WeeklyInsightSummary;
  className?: string;
}

export function WeeklyInsightCard({ summary, className = "" }: WeeklyInsightCardProps) {
  return (
    <Card className={`border-2 border-[var(--primary)] bg-[var(--surface)] ${className}`}>
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
        <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-[var(--primary)]">
          <Calendar size={14} /> Your SkillSwap This Week
        </div>
        <span className="text-[10px] font-bold text-[var(--muted)] uppercase bg-[var(--surface-muted)] px-2 py-0.5 border border-[var(--border)]">
          Weekly Digest
        </span>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div className="flex items-start gap-2.5 p-2.5 border border-[var(--border)] bg-[var(--surface-muted)]">
          <Target size={18} className="text-[var(--primary)] shrink-0 mt-0.5" />
          <div>
            <span className="font-display text-xl block leading-none">{summary.matchingLearningGoalCount}</span>
            <span className="text-xs text-[var(--muted)] font-medium">People match your goals</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-2.5 border border-[var(--border)] bg-[var(--surface-muted)]">
          <Users size={18} className="text-[var(--primary)] shrink-0 mt-0.5" />
          <div>
            <span className="font-display text-xl block leading-none">{summary.lookingForMySkillCount}</span>
            <span className="text-xs text-[var(--muted)] font-medium">People look for what you teach</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-2.5 border border-[var(--border)] bg-[var(--surface-muted)]">
          <TrendingUp size={18} className="text-[var(--primary)] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-sm block truncate leading-none text-[var(--primary)]">
              {summary.mostRequestedSkillName}
            </span>
            <span className="text-xs text-[var(--muted)] font-medium">Most requested skill</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex justify-between items-center text-xs">
        <span className="text-[var(--muted)] font-medium">
          {summary.activeOpportunitiesCount} potential exchange matches available.
        </span>
        <Link href="/matches" className="font-bold text-[var(--primary)] hover:underline flex items-center gap-1">
          Explore Matches <ArrowRight size={12} />
        </Link>
      </div>
    </Card>
  );
}
