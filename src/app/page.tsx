"use client";

import { MatchIndicator } from "@/components/shared/match-indicator";
import { SkillCard } from "@/components/shared/skill-card";
import { UserCard } from "@/components/shared/user-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useSkillSwap } from "@/lib/context/skillswap-context";
import { computeMatches } from "@/lib/matching";
import { ArrowLeftRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const {
    currentUserId,
    currentUser,
    users,
    profiles,
    skills,
    offers,
    requests,
    activities,
  } = useSkillSwap();

  const myOffers = offers.filter((o) => o.userId === currentUserId);
  const myRequests = requests.filter((r) => r.userId === currentUserId);

  const myOfferedSkills = myOffers
    .map((o) => skills.find((s) => s.id === o.skillId))
    .filter((s): s is typeof skills[0] => Boolean(s));

  const myWantedSkills = myRequests
    .map((r) => skills.find((s) => s.id === r.skillId))
    .filter((s): s is typeof skills[0] => Boolean(s));

  const matches = computeMatches(currentUserId, users, profiles, skills, offers, requests);
  const topMatch = matches[0];

  const discoveryUsers = users.filter((u) => u.id !== currentUserId).slice(0, 3);

  return (
    <div className="page">
      <section className="container editorial">
        <div>
          <p className="text-sm font-black uppercase tracking-[.2em] text-[var(--primary)]">
            Personal discovery hub
          </p>
          <h1 className="font-display text-6xl leading-[.9] md:text-8xl mt-1">
            Welcome back, {currentUser.name.split(" ")[0]}.
          </h1>
          <p className="lede max-w-2xl mt-3">
            SkillSwap helps you find peers where learning is mutual: you bring something useful, they bring something useful, and a reciprocal exchange can begin.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button href="/discover">Find a swap</Button>
            <Button variant="secondary" href="/skills/new">
              Add a skill
            </Button>
          </div>
        </div>

        {topMatch ? (
          <Card className="rotate-[-1deg] border-2 border-[var(--primary)]">
            <div className="flex items-center gap-1.5 font-bold text-sm text-[var(--primary)]">
              <Sparkles size={16} /> Top Complementary Fit
            </div>
            <h3 className="font-display text-2xl mt-1">{topMatch.user.name}</h3>

            <div className="my-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm">
              <div className="p-2 border border-[var(--border)] bg-[var(--surface-muted)] text-center">
                <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">You Teach</span>
                <b>{topMatch.wantedByThem[0]?.name || myOfferedSkills[0]?.name || "Skills"}</b>
              </div>
              <ArrowLeftRight className="text-[var(--primary)] mx-auto" size={20} />
              <div className="p-2 border border-[var(--border)] bg-[var(--surface-muted)] text-center">
                <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">They Teach</span>
                <b>{topMatch.offeredByThem[0]?.name || "Skills"}</b>
              </div>
            </div>

            <p className="text-xs font-semibold text-[var(--foreground)] mb-3">&ldquo;{topMatch.reason}&rdquo;</p>
            <MatchIndicator score={topMatch.score} />

            <div className="mt-4 pt-3 border-t border-[var(--border)] flex justify-between items-center text-xs">
              <span className="font-bold text-[var(--muted)]">{topMatch.quality}</span>
              <Link href="/matches" className="font-bold text-[var(--primary)] hover:underline">
                View Matches →
              </Link>
            </div>
          </Card>
        ) : (
          <Card className="rotate-[-1deg]">
            <p className="font-bold text-[var(--primary)]">No Active Matches Yet</p>
            <p className="text-sm mt-2">Add skills you offer or want to learn to unlock complementary match scoring.</p>
            <Button className="mt-4 text-xs" href="/skills/new">
              Add Skills
            </Button>
          </Card>
        )}
      </section>

      <section className="container mt-16">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <h2 className="font-display text-4xl">Your Skill Shelf</h2>
          <Link href="/skills" className="font-bold text-sm text-[var(--primary)] hover:underline">
            Manage Shelf →
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {myOfferedSkills.slice(0, 2).map((s) => (
            <SkillCard key={s.id} skill={s} mode="offer" />
          ))}
          {myWantedSkills.slice(0, 1).map((s) => (
            <SkillCard key={s.id} skill={s} mode="want" />
          ))}
          {myOfferedSkills.length === 0 && myWantedSkills.length === 0 && (
            <EmptyState title="Your skill shelf is empty" body="Add skills you offer or want to learn to populate your shelf." />
          )}
        </div>
      </section>

      <section className="container mt-16 editorial">
        <div>
          <h2 className="font-display text-5xl">People Worth Discovering</h2>
          <p className="lede">Discover peers with active skills, complementary learning goals, and visible trust signals.</p>
        </div>
        <div>
          {discoveryUsers.map((u) => {
            const p = profiles.find((prof) => prof.userId === u.id);
            const userMatch = matches.find((m) => m.user.id === u.id);
            return (
              <UserCard
                key={u.id}
                user={u}
                headline={p?.headline || ""}
                match={userMatch ? userMatch.reason : undefined}
              />
            );
          })}
        </div>
      </section>

      <section className="container mt-16 pb-12">
        <h2 className="font-display text-4xl">Recent Activity</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {activities.length > 0 ? (
            activities.slice(0, 3).map((act) => (
              <Card key={act.id} className="grid gap-1">
                <b className="text-sm font-bold text-[var(--primary)]">{act.title}</b>
                <p className="text-xs text-[var(--foreground)]">{act.description}</p>
                <span className="text-[10px] text-[var(--muted)] mt-2">{act.createdAt}</span>
              </Card>
            ))
          ) : (
            <Card>No recent community activity.</Card>
          )}
        </div>
      </section>
    </div>
  );
}
