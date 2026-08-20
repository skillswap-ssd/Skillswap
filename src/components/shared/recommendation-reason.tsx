import React from "react";
import { Sparkles, Target, Compass, Clock, Heart, Users } from "lucide-react";

interface RecommendationReasonProps {
  reason: string;
  category?: "learning_goal" | "teaching_match" | "reciprocal" | "interest" | "availability" | "activity" | "explored";
  className?: string;
}

export function RecommendationReason({ reason, category = "reciprocal", className = "" }: RecommendationReasonProps) {
  const getIcon = () => {
    switch (category) {
      case "learning_goal":
        return <Target size={14} className="text-[var(--primary)] shrink-0" />;
      case "teaching_match":
        return <Compass size={14} className="text-[var(--primary)] shrink-0" />;
      case "interest":
        return <Heart size={14} className="text-[var(--primary)] shrink-0" />;
      case "availability":
        return <Clock size={14} className="text-[var(--primary)] shrink-0" />;
      case "activity":
        return <Users size={14} className="text-[var(--primary)] shrink-0" />;
      default:
        return <Sparkles size={14} className="text-[var(--primary)] shrink-0" />;
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-[var(--surface-muted)] text-[var(--foreground)] border border-[var(--border)] ${className}`}
    >
      {getIcon()}
      <span>{reason}</span>
    </div>
  );
}
