import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ProfileCompleteness } from "@/lib/recommendations";
import { CheckCircle2, ArrowRight } from "lucide-react";

interface ProfileStrengthProps {
  completeness: ProfileCompleteness;
  className?: string;
}

export function ProfileStrength({ completeness, className = "" }: ProfileStrengthProps) {
  const { score, level, missingItems } = completeness;

  return (
    <Card className={`grid gap-3.5 ${className}`}>
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Profile Strength</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <h3 className="font-display text-2xl">{level}</h3>
            <span className="font-bold text-sm text-[var(--primary)]">{score}%</span>
          </div>
        </div>

        {score === 100 && (
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1">
            <CheckCircle2 size={14} className="text-emerald-600" /> Complete Profile
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[var(--surface-muted)] border border-[var(--border)] h-3 p-0.5 overflow-hidden">
        <div
          className="bg-[var(--primary)] h-full transition-all duration-300"
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Actionable suggestions */}
      {missingItems.length > 0 && (
        <div className="space-y-2 mt-1">
          <span className="text-xs font-bold text-[var(--foreground)] block">Next steps to increase match discovery:</span>
          <ul className="space-y-1.5 text-xs text-[var(--muted)]">
            {missingItems.slice(0, 3).map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <ArrowRight size={14} className="text-[var(--primary)] shrink-0 mt-0.5" />
                <span>{item.suggestion}</span>
              </li>
            ))}
          </ul>
          <div className="pt-2">
            <Button href="/profile/edit" variant="secondary" className="text-xs py-1.5 px-3">
              Complete Profile →
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
