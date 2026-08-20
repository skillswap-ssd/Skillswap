import React from "react";
import { Card } from "@/components/ui/card";
import type { PersonalLearningSnapshotData } from "@/lib/recommendations";
import { ArrowLeftRight, BookOpen, CheckCircle, Sparkles } from "lucide-react";
import Link from "next/link";

interface PersonalLearningSnapshotProps {
  snapshot: PersonalLearningSnapshotData;
  className?: string;
}

export function PersonalLearningSnapshot({ snapshot, className = "" }: PersonalLearningSnapshotProps) {
  return (
    <Card className={`grid gap-4 ${className}`}>
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">SkillSwap Overview</span>
          <h3 className="font-display text-2xl mt-0.5">Personal Snapshot</h3>
        </div>
        <Link href="/skills" className="text-xs font-bold text-[var(--primary)] hover:underline">
          Manage Shelf →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-3 border border-[var(--border)] bg-[var(--surface-muted)]">
          <BookOpen size={16} className="mx-auto text-[var(--primary)] mb-1" />
          <span className="font-display text-2xl block">{snapshot.teachableSkillsCount}</span>
          <span className="text-xs font-bold text-[var(--muted)] uppercase">You Teach</span>
        </div>

        <div className="p-3 border border-[var(--border)] bg-[var(--surface-muted)]">
          <Sparkles size={16} className="mx-auto text-[var(--primary)] mb-1" />
          <span className="font-display text-2xl block">{snapshot.wantedSkillsCount}</span>
          <span className="text-xs font-bold text-[var(--muted)] uppercase">You Want</span>
        </div>

        <div className="p-3 border border-[var(--border)] bg-[var(--surface-muted)]">
          <ArrowLeftRight size={16} className="mx-auto text-[var(--primary)] mb-1" />
          <span className="font-display text-2xl block">{snapshot.strongOpportunitiesCount}</span>
          <span className="text-xs font-bold text-[var(--muted)] uppercase">Opportunities</span>
        </div>

        <div className="p-3 border border-[var(--border)] bg-[var(--surface-muted)]">
          <CheckCircle size={16} className="mx-auto text-[var(--primary)] mb-1" />
          <span className="font-display text-2xl block">{snapshot.completedSwapsCount}</span>
          <span className="text-xs font-bold text-[var(--muted)] uppercase">Completed</span>
        </div>
      </div>
    </Card>
  );
}
