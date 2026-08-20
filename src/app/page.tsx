"use client";

import { InkLandscape } from "@/components/home/ink-landscape";
import { RecommendationReason } from "@/components/shared/recommendation-reason";
import { UserCard } from "@/components/shared/user-card";
import { PersonalLearningSnapshot } from "@/components/shared/personal-learning-snapshot";
import { WeeklyInsightCard } from "@/components/shared/weekly-insight-card";
import { ProfileStrength } from "@/components/shared/profile-strength";
import { SkillGapInsight } from "@/components/shared/skill-gap-insight";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useSkillSwap } from "@/lib/context/skillswap-context";
import {
  calculateProfileStrength,
  getPeopleWhoCanTeach,
  getPeopleWhoWantToLearn,
  getPersonalLearningSnapshot,
  getRecommendedUsers,
  getSkillGapInsights,
  getSkillSuggestions,
  getWeeklyInsightSummary,
} from "@/lib/recommendations";
import { ArrowLeftRight, ArrowRight, Sparkles, Clock } from "lucide-react";
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
    swapRequests,
    connections,
    activities,
    recentlyViewedSkills,
    recentlyViewedProfiles,
  } = useSkillSwap();

  const userProfile = profiles.find((p) => p.userId === currentUserId);

  const profileStrength = calculateProfileStrength(currentUser, userProfile, offers, requests);
  const weeklySummary = getWeeklyInsightSummary(currentUserId, users, profiles, skills, offers, requests);
  const snapshot = getPersonalLearningSnapshot(currentUserId, users, profiles, skills, offers, requests, swapRequests);

  const recommendedUsers = getRecommendedUsers(
    currentUserId,
    users,
    profiles,
    skills,
    offers,
    requests,
    swapRequests,
    connections,
    { recentlyViewedSkillIds: recentlyViewedSkills, recentlyViewedUserIds: recentlyViewedProfiles }
  );

  const teachersForMe = getPeopleWhoCanTeach(currentUserId, users, profiles, skills, offers, requests);
  const learnersForMe = getPeopleWhoWantToLearn(currentUserId, users, profiles, skills, offers, requests);
  const skillSuggestions = getSkillSuggestions(currentUserId, skills, offers, requests);
  const skillGapInsights = getSkillGapInsights(currentUserId, skills, offers, requests);

  // Active / Pending Exchanges for "Continue your journey"
  const myActiveSwaps = swapRequests.filter(
    (sr) => (sr.requesterId === currentUserId || sr.recipientId === currentUserId) && (sr.status === "active" || sr.status === "pending")
  );

  const topRecommended = recommendedUsers[0];

  return (
    <div className="page space-y-16">
      {/* Editorial Hero Section */}
      <section className="container pt-4 pb-8 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
          {/* Left Text Column */}
          <div className="md:col-span-6 lg:col-span-5 space-y-5 text-left z-10">
            <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[var(--primary)]">
              PERSONAL DISCOVERY HUB
            </p>

            <h1 className="font-display text-5xl leading-[0.92] sm:text-6xl md:text-7xl text-[var(--foreground)] tracking-tight">
              Welcome back,<br />
              <span className="text-[var(--primary)]">{currentUser.name.split(" ")[0]}.</span>
            </h1>

            <p className="lede max-w-md text-base sm:text-lg text-[var(--secondary)] leading-relaxed">
              SkillSwap understands your skills, learning goals, and schedule to surface people and opportunities most useful to you.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Button href="/discover" className="min-w-[140px]">
                Find a swap
              </Button>
              <Button variant="secondary" href="/skills/new" className="min-w-[140px]">
                Add a skill
              </Button>
            </div>
          </div>

          {/* Right Editorial Scene (Integrates directly without card container) */}
          <div className="md:col-span-6 lg:col-span-7 w-full flex justify-center items-center">
            <InkLandscape />
          </div>
        </div>
      </section>

      {/* Top Match Recommendation Banner */}
      <section className="container">
        {topRecommended ? (
          <Card className="border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[var(--primary)] uppercase tracking-wider">
                  <Sparkles size={14} /> TOP RECOMMENDED MATCH
                  <span className="text-xs font-semibold text-[var(--muted)] normal-case tracking-normal">· {topRecommended.quality}</span>
                </div>
                <h3 className="font-display text-3xl sm:text-4xl text-[var(--foreground)] tracking-tight">
                  {topRecommended.user.name} <span className="text-base font-sans font-normal text-[var(--muted)]">({topRecommended.user.reputation}★)</span>
                </h3>
                <p className="text-sm text-[var(--secondary)] leading-relaxed">{topRecommended.profile.headline}</p>

                <div className="pt-1">
                  <RecommendationReason
                    reason={topRecommended.primaryReason}
                    category={topRecommended.reasons[0]?.category}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-5 shrink-0 border-t lg:border-t-0 lg:border-l border-[var(--border)] pt-5 lg:pt-0 lg:pl-8">
                {/* Reciprocal Skills Exchange Module */}
                <div className="flex flex-col sm:flex-row items-center gap-3 text-xs bg-[var(--surface-muted)]/80 p-3.5 rounded-xl border border-[var(--border)] min-w-[240px]">
                  <div className="text-center sm:text-left w-full sm:w-auto">
                    <span className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider block">THEY OFFER</span>
                    <b className="truncate block max-w-[130px] text-sm text-[var(--foreground)]">{topRecommended.offeredSkillNames[0] || "Skills"}</b>
                  </div>

                  <div className="py-1 sm:py-0 text-[var(--primary)] shrink-0 font-bold">
                    <ArrowLeftRight size={18} className="hidden sm:block" />
                    <span className="sm:hidden text-xs">↕</span>
                  </div>

                  <div className="text-center sm:text-left w-full sm:w-auto">
                    <span className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider block">THEY WANT</span>
                    <b className="truncate block max-w-[130px] text-sm text-[var(--foreground)]">{topRecommended.wantedSkillNames[0] || "Skills"}</b>
                  </div>
                </div>

                <Button href={`/profile/${topRecommended.user.username}`} className="text-xs px-6 py-3 shrink-0">
                  View Profile →
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-6 border border-[var(--border)] bg-[var(--surface)]">
            <p className="font-bold text-[var(--primary)]">Add skills to unlock recommendations</p>
            <p className="text-sm mt-1 text-[var(--secondary)]">Specify what you teach and want to learn to get personalized peer matches.</p>
            <Button className="mt-4 text-xs" href="/skills/new">
              Add Skills
            </Button>
          </Card>
        )}
      </section>

      {/* Snapshot & Insights Section */}
      <section className="container">
        <div className="grid gap-6 lg:grid-cols-2">
          <WeeklyInsightCard summary={weeklySummary} />
          <PersonalLearningSnapshot snapshot={snapshot} />
        </div>
      </section>

      {/* Skill Gap Insights */}
      {skillGapInsights.length > 0 && (
        <section className="container">
          <SkillGapInsight insight={skillGapInsights[0]} />
        </section>
      )}

      {/* Recommended For You */}
      <section className="container">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div>
            <h2 className="font-display text-3xl text-[var(--foreground)]">Recommended for you</h2>
            <p className="text-xs text-[var(--muted)] mt-1">Peers with complementary skills, schedules, and learning goals.</p>
          </div>
          <Link href="/matches" className="font-bold text-xs text-[var(--primary)] hover:underline">
            View All Matches →
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recommendedUsers.slice(0, 3).map((rec) => (
            <Card key={rec.user.id} className="flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-display text-xl text-[var(--foreground)]">
                    <Link href={`/profile/${rec.user.username}`} className="hover:underline">
                      {rec.user.name}
                    </Link>
                  </h3>
                  <span className="text-xs font-bold text-[var(--muted)]">{rec.user.reputation}★</span>
                </div>
                <p className="text-xs text-[var(--secondary)] mt-1">{rec.profile.headline}</p>

                <div className="my-3">
                  <RecommendationReason
                    reason={rec.reasons[0]?.label || rec.primaryReason}
                    category={rec.reasons[0]?.category}
                  />
                </div>

                <div className="text-xs space-y-1 text-[var(--secondary)]">
                  <p><b className="text-[var(--foreground)]">Teaches:</b> {rec.offeredSkillNames.join(", ") || "Various"}</p>
                  <p><b className="text-[var(--foreground)]">Wants:</b> {rec.wantedSkillNames.join(", ") || "Various"}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--border)] flex justify-between items-center text-xs">
                <span className="font-bold text-[var(--muted)]">{rec.quality}</span>
                <Link
                  href={`/profile/${rec.user.username}`}
                  className="font-bold text-[var(--primary)] hover:underline"
                >
                  View Profile →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Because you want to learn & You could teach */}
      <section className="container grid gap-8 lg:grid-cols-2">
        <div>
          <div className="border-b border-[var(--border)] pb-2 mb-4">
            <h2 className="font-display text-2xl text-[var(--foreground)]">Because you want to learn...</h2>
            <p className="text-xs text-[var(--muted)]">Peers offering skills on your learning shelf.</p>
          </div>
          <div className="grid gap-3">
            {teachersForMe.length > 0 ? (
              teachersForMe.slice(0, 2).map((t) => (
                <UserCard
                  key={t.user.id}
                  user={t.user}
                  headline={t.profile.headline}
                  match={t.primaryReason}
                />
              ))
            ) : (
              <EmptyState title="No direct teachers found" body="Add more requested skills to discover matching mentors." />
            )}
          </div>
        </div>

        <div>
          <div className="border-b border-[var(--border)] pb-2 mb-4">
            <h2 className="font-display text-2xl text-[var(--foreground)]">You could teach...</h2>
            <p className="text-xs text-[var(--muted)]">Peers actively looking for skills you offer.</p>
          </div>
          <div className="grid gap-3">
            {learnersForMe.length > 0 ? (
              learnersForMe.slice(0, 2).map((l) => (
                <UserCard
                  key={l.user.id}
                  user={l.user}
                  headline={l.profile.headline}
                  match={l.primaryReason}
                />
              ))
            ) : (
              <EmptyState title="No learners found" body="Add more teachable skills to match with prospective students." />
            )}
          </div>
        </div>
      </section>

      {/* Continue your SkillSwap journey */}
      <section className="container">
        <div className="border-b border-[var(--border)] pb-3 flex justify-between items-center">
          <div>
            <h2 className="font-display text-3xl text-[var(--foreground)]">Continue your SkillSwap journey</h2>
            <p className="text-xs text-[var(--muted)] mt-1">Pending requests, active exchanges, and useful next actions.</p>
          </div>
          <Link href="/connections" className="font-bold text-xs text-[var(--primary)] hover:underline">
            Manage Connections →
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {myActiveSwaps.length > 0 ? (
            myActiveSwaps.map((sr) => {
              const otherUserId = sr.requesterId === currentUserId ? sr.recipientId : sr.requesterId;
              const otherUser = users.find((u) => u.id === otherUserId);
              const offerSkill = skills.find((s) => s.id === sr.offeredSkillId);
              const requestSkill = skills.find((s) => s.id === sr.requestedSkillId);

              return (
                <Card key={sr.id} className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)] bg-[var(--surface-muted)] px-2 py-0.5 border border-[var(--border)] rounded">
                        Status: {sr.status}
                      </span>
                      <span className="text-xs text-[var(--muted)]">{sr.preferredFormat}</span>
                    </div>
                    <h3 className="font-display text-xl mt-2 text-[var(--foreground)]">{otherUser?.name || "Peer"}</h3>
                    <p className="text-xs text-[var(--muted)] mt-1">
                      Exchange: {offerSkill?.name || "Skill"} ⇄ {requestSkill?.name || "Skill"}
                    </p>
                  </div>

                  <Button href="/messages" variant="secondary" className="text-xs">
                    Open Messages
                  </Button>
                </Card>
              );
            })
          ) : (
            <Card className="flex items-center justify-between">
              <div>
                <b className="block text-sm text-[var(--foreground)]">No active exchanges right now</b>
                <p className="text-xs text-[var(--muted)]">Propose an exchange or connect with recommended peers to get started.</p>
              </div>
              <Button href="/discover" className="text-xs">
                Explore Discover →
              </Button>
            </Card>
          )}

          {/* Profile Completeness Insight */}
          <ProfileStrength completeness={profileStrength} />
        </div>
      </section>

      {/* Explore something new */}
      <section className="container">
        <div className="border-b border-[var(--border)] pb-3">
          <h2 className="font-display text-3xl text-[var(--foreground)]">Explore something new</h2>
          <p className="text-xs text-[var(--muted)] mt-1">Relevant skills and opportunities outside your current shelf.</p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {skillSuggestions.map(({ skill, reason }) => (
            <Card key={skill.id} className="flex flex-col justify-between">
              <div>
                <RecommendationReason reason={reason} category="explored" />
                <h3 className="font-display text-2xl mt-3 text-[var(--foreground)]">{skill.name}</h3>
                <p className="text-xs text-[var(--secondary)] mt-1">{skill.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--border)] flex justify-between items-center text-xs">
                <span className="font-bold text-[var(--muted)]">{skill.popularity} interested</span>
                <Link
                  href={`/discover?q=${encodeURIComponent(skill.name)}`}
                  className="font-bold text-[var(--primary)] hover:underline flex items-center gap-1"
                >
                  Discover SkillSwaps <ArrowRight size={12} />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Community Activity */}
      <section className="container pb-12">
        <h2 className="font-display text-3xl text-[var(--foreground)]">Recent Activity</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {activities.length > 0 ? (
            activities.slice(0, 3).map((act) => (
              <Card key={act.id} className="grid gap-1">
                <b className="text-sm font-bold text-[var(--primary)]">{act.title}</b>
                <p className="text-xs text-[var(--foreground)]">{act.description}</p>
                <span className="text-[10px] text-[var(--muted)] mt-2 flex items-center gap-1">
                  <Clock size={10} /> {act.createdAt}
                </span>
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
