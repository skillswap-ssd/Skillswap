import React from "react";
import Link from "next/link";
import { getRelatedSkillsForSkill } from "@/lib/skillRelations";

interface RelatedSkillsProps {
  skillIdOrName: string;
  label?: string;
  className?: string;
}

export function RelatedSkills({ skillIdOrName, label = "Related Skills", className = "" }: RelatedSkillsProps) {
  const related = getRelatedSkillsForSkill(skillIdOrName);

  if (related.length === 0) return null;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <span className="text-xs font-bold text-[var(--muted)] block uppercase tracking-wider">{label}:</span>}
      <div className="flex flex-wrap gap-1.5">
        {related.map((item) => (
          <Link
            key={item.id}
            href={`/discover?q=${encodeURIComponent(item.name)}`}
            className="inline-block px-2.5 py-1 text-xs font-semibold bg-[var(--surface-muted)] hover:bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] transition-colors"
          >
            + {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
