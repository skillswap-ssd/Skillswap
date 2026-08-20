"use client";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { SkillCard } from "@/components/shared/skill-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useSkillSwap } from "@/lib/context/skillswap-context";
import { Plus } from "lucide-react";

export default function SkillsPage() {
  const { currentUserId, skills, categories, offers, requests } = useSkillSwap();

  const myOffers = offers.filter((o) => o.userId === currentUserId);
  const myRequests = requests.filter((r) => r.userId === currentUserId);

  const offeredSkills = myOffers
    .map((o) => skills.find((s) => s.id === o.skillId))
    .filter((s): s is typeof skills[0] => Boolean(s));

  const wantedSkills = myRequests
    .map((r) => skills.find((s) => s.id === r.skillId))
    .filter((s): s is typeof skills[0] => Boolean(s));

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Skills"
        title="Manage what you offer and want to learn."
        body="The skill shelf distinguishes teachable offers from learning requests and powers complementary skill matching."
      />

      <div className="flex justify-between items-center mb-6 border-b border-[var(--border)] pb-3">
        <span className="font-bold text-sm text-[var(--muted)]">Your Skill Shelf</span>
        <Button href="/skills/new">
          <Plus size={16} className="mr-1 inline" /> Add Skill
        </Button>
      </div>

      <h2 className="mt-8 font-display text-4xl">Skills I Offer</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {offeredSkills.length > 0 ? (
          offeredSkills.map((s) => <SkillCard key={s.id} skill={s} mode="offer" />)
        ) : (
          <EmptyState title="No skills offered yet" body="Add skills you can teach or share with peers." />
        )}
      </div>

      <h2 className="mt-12 font-display text-4xl">Skills I Want to Learn</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {wantedSkills.length > 0 ? (
          wantedSkills.map((s) => <SkillCard key={s.id} skill={s} mode="want" />)
        ) : (
          <EmptyState title="No learning goals set" body="Add skills you want to learn to help discover complementary mentors." />
        )}
      </div>

      <h2 className="mt-12 font-display text-4xl">Category System</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-5">
        {categories.map((c) => (
          <article className="border border-[var(--border)] bg-[var(--surface)] p-4" key={c.id}>
            <b className="block">{c.name}</b>
            <p className="text-sm text-[var(--muted)] mt-1">{c.description}</p>
          </article>
        ))}
      </div>
    </PageContainer>
  );
}
