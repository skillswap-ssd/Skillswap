import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { SkillGapInsightData } from "@/lib/recommendations";
import { Sparkles, ArrowRight } from "lucide-react";

interface SkillGapInsightProps {
  insight: SkillGapInsightData;
  className?: string;
}

export function SkillGapInsight({ insight, className = "" }: SkillGapInsightProps) {
  return (
    <Card className={`border-2 border-[var(--primary)] ${className}`}>
      <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-[var(--primary)]">
        <Sparkles size={14} /> Your Learning Opportunity
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3 text-xs">
        <div className="p-2.5 border border-[var(--border)] bg-[var(--surface-muted)]">
          <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">You want to learn</span>
          <b className="text-sm font-display text-[var(--foreground)]">{insight.targetSkillName}</b>
        </div>

        <div className="p-2.5 border border-[var(--border)] bg-[var(--surface-muted)]">
          <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">You already teach</span>
          <b className="text-sm font-display text-[var(--foreground)]">{insight.currentSkillName}</b>
        </div>

        <div className="p-2.5 border border-[var(--primary)] bg-[var(--surface)]">
          <span className="text-[10px] uppercase font-bold text-[var(--primary)] block">Useful next exchange</span>
          <b className="text-sm font-display text-[var(--primary)]">{insight.suggestedExchangeSkillName}</b>
        </div>
      </div>

      <p className="text-xs text-[var(--muted)] mt-3 leading-relaxed">&ldquo;{insight.explanation}&rdquo;</p>

      <div className="mt-4 flex justify-end">
        <Button href={`/discover?q=${encodeURIComponent(insight.suggestedExchangeSkillName)}`} className="text-xs py-1.5">
          Find {insight.suggestedExchangeSkillName} SkillSwaps <ArrowRight size={14} className="ml-1 inline" />
        </Button>
      </div>
    </Card>
  );
}
