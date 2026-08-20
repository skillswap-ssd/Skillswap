"use client";

import Link from "next/link";
import type { User } from "@/data/models";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Rating } from "./rating";
import { useSkillSwap } from "@/lib/context/skillswap-context";

export function UserCard({ user, headline, match }: { user: User; headline: string; match?: string }) {
  const { offers, requests, skills } = useSkillSwap();

  const offerNames = offers
    .filter((o) => o.userId === user.id)
    .map((o) => skills.find((s) => s.id === o.skillId)?.name)
    .filter(Boolean);

  const wantNames = requests
    .filter((r) => r.userId === user.id)
    .map((r) => skills.find((s) => s.id === r.skillId)?.name)
    .filter(Boolean);

  return (
    <article className="border-t border-[var(--border)] bg-[linear-gradient(90deg,transparent,var(--surface)_55%,transparent)] py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <Link href={`/profile/${user.username}`} className="flex gap-4">
          <Avatar name={user.name} />
          <div>
            <h3 className="font-bold">
              {user.name} <span className="text-[var(--muted)]">@{user.username}</span>
            </h3>
            <p className="text-sm font-medium">{headline}</p>
            <Rating value={user.reputation} />
            <p className="mt-1 text-xs font-bold text-[var(--muted)]">
              {user.completedSwaps} swaps · {user.responseRate}% response · {user.availability}
            </p>
          </div>
        </Link>
        <Button variant="secondary" href={`/profile/${user.username}`}>
          Request swap
        </Button>
      </div>

      <div className="mt-4 grid gap-2 text-sm md:grid-cols-2">
        <p>
          <b>Offers:</b> {offerNames.length > 0 ? offerNames.join(", ") : "Various skills"}
        </p>
        <p>
          <b>Wants:</b> {wantNames.length > 0 ? wantNames.join(", ") : "Various skills"}
        </p>
      </div>

      {match && <p className="mt-3 border-l-4 border-[var(--primary)] pl-3 font-bold text-[var(--primary)] text-sm">{match}</p>}
    </article>
  );
}
