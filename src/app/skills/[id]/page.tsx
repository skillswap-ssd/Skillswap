"use client";

import { PageContainer } from "@/components/layout/page-container";
import { SkillCard } from "@/components/shared/skill-card";
import { UserCard } from "@/components/shared/user-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useSkillSwap } from "@/lib/context/skillswap-context";
import { use } from "react";

export default function SkillDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { skills, categories, offers, requests, users, profiles } = useSkillSwap();

  const skill = skills.find((s) => s.id === id);
  const category = categories.find((c) => c.id === skill?.categoryId);

  const offeringUsers = offers
    .filter((o) => o.skillId === id)
    .map((o) => users.find((u) => u.id === o.userId))
    .filter((u): u is typeof users[0] => Boolean(u));

  const wantingUsers = requests
    .filter((r) => r.skillId === id)
    .map((r) => users.find((u) => u.id === r.userId))
    .filter((u): u is typeof users[0] => Boolean(u));

  const relatedSkills = skill
    ? skill.relatedSkillIds
        .map((rid) => skills.find((s) => s.id === rid))
        .filter((s): s is typeof skills[0] => Boolean(s))
    : [];

  if (!skill) {
    return (
      <PageContainer>
        <EmptyState title="Skill not found" body="Return to the skill library and choose an available skill." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <p className="text-sm font-bold uppercase tracking-[.2em] text-[var(--primary)]">{category?.name || "Category"}</p>
      <h1 className="font-display text-5xl md:text-6xl mt-1">{skill.name}</h1>
      <p className="lede max-w-3xl mt-2">{skill.description}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Badge>{skill.level}</Badge>
        <Badge>{skill.popularity} discovery signal{skill.popularity === 1 ? "" : "s"}</Badge>
        {skill.formats.map((f) => (
          <Badge key={f}>{f}</Badge>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/discover">Find People</Button>
        <Button href={`/skills/new?editId=${skill.id}`}>Edit Skill</Button>
        <Button variant="secondary" href="/skills/new">
          Offer Another Skill
        </Button>
      </div>

      <section className="mt-12 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-4xl mb-4">People Offering It ({offeringUsers.length})</h2>
          {offeringUsers.length > 0 ? (
            offeringUsers.map((u) => {
              const p = profiles.find((prof) => prof.userId === u.id);
              return <UserCard key={u.id} user={u} headline={p?.headline || ""} />;
            })
          ) : (
            <EmptyState title="No offers yet" body="Be the first member to offer this skill." />
          )}
        </div>

        <div>
          <h2 className="font-display text-4xl mb-4">People Looking for It ({wantingUsers.length})</h2>
          {wantingUsers.length > 0 ? (
            wantingUsers.map((u) => {
              const p = profiles.find((prof) => prof.userId === u.id);
              return <UserCard key={u.id} user={u} headline={p?.headline || ""} />;
            })
          ) : (
            <EmptyState title="No requests yet" body="Add this skill to your learning goals to build discovery." />
          )}
        </div>
      </section>

      {relatedSkills.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-4xl mb-4">Related Skills</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {relatedSkills.map((s) => (
              <SkillCard key={s.id} skill={s} />
            ))}
          </div>
        </section>
      )}
    </PageContainer>
  );
}
