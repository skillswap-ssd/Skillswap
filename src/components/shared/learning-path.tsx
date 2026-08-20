import React from "react";
import { Card } from "@/components/ui/card";
import type { LearningPath as LearningPathType } from "@/lib/learningPaths";
import { ArrowRight, Compass } from "lucide-react";
import Link from "next/link";

interface LearningPathProps {
  path: LearningPathType;
  className?: string;
}

export function LearningPath({ path, className = "" }: LearningPathProps) {
  return (
    <Card className={`grid gap-4 ${className}`}>
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--primary)] uppercase tracking-wider">
          <Compass size={14} /> A useful path toward your goal
        </div>
        <h3 className="font-display text-2xl mt-1">{path.title}</h3>
        <p className="text-xs text-[var(--muted)] mt-1">{path.description}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 relative pt-2">
        {path.steps.map((step, idx) => (
          <div
            key={idx}
            className="p-3 border border-[var(--border)] bg-[var(--surface-muted)] flex flex-col justify-between relative"
          >
            <div>
              <span className="text-[10px] font-black uppercase text-[var(--primary)] tracking-widest block mb-1">
                Step {idx + 1}
              </span>
              <h4 className="font-bold text-sm text-[var(--foreground)]">{step.skillName}</h4>
              <p className="text-xs text-[var(--muted)] mt-1">{step.description}</p>
            </div>

            <div className="mt-3 pt-2 border-t border-[var(--border)] flex justify-between items-center text-xs">
              <Link
                href={`/discover?q=${encodeURIComponent(step.skillName)}`}
                className="font-bold text-[var(--primary)] hover:underline flex items-center gap-1 text-[11px]"
              >
                Find mentors <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
