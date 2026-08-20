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
      <section className="container editorial py-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[.25em] text-[var(--primary)]">
            Personal Discovery Hub
          </p>
          <h1 className="font-display text-5xl leading-[.95] md:text-7xl mt-3 text-[var(--foreground)] tracking-tight">
            Welcome back, {currentUser.name.split(" ")[0]}.
          </h1>
          <p className="lede max-w-xl mt-4">
            SkillSwap understands your skills, learning goals, and schedule to surface people and opportunities most useful to you.
          </p>
          <div className="mt-8 flex flex-wrap gap-3.5">
            <Button href="/discover">Find a swap</Button>
            <Button variant="secondary" href="/skills/new">
              Add a skill
            </Button>
          </div>
        </div>

        {/* Right Editorial Scene */}
        <div className="w-full">
          <InkLandscape />
        </div>
      </section>

      {/* Top Match Recommendation Banner (Relocated below Hero) */}
      <section className="container">
        {topRecommended ? (
          <Card className="border-l-4 border-l-[var(--primary)] bg-[var(--surface-elevated)] p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 font-bold text-xs text-[var(--primary)] uppercase tracking-wider">
                  <Sparkles size={14} /> Top Recommended Match
                  <span className="text-xs font-bold text-[var(--muted)] ml-2">· {topRecommended.quality}</span>
                </div>
                <h3 className="font-display text-3xl text-[var(--foreground)]">
                  {topRecommended.user.name} <span className="text-sm font-normal text-[var(--muted)]">({topRecommended.user.reputation}★)</span>
                </h3>
                <p className="text-sm font-medium text-[var(--secondary)]">{topRecommended.profile.headline}</p>

                <div className="pt-2">
                  <RecommendationReason
                    reason={topRecommended.primaryReason}
                    category={topRecommended.reasons[0]?.category}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0 border-t md:border-t-0 md:border-l border-[var(--border)] pt-4 md:pt-0 md:pl-6">
                <div className="flex items-center gap-3 text-xs bg-[var(--surface-muted)] p-3 rounded-lg border border-[var(--border)]">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">They Offer</span>
                    <b className="truncate block max-w-[100px] text-[var(--foreground)]">{topRecommended.offeredSkillNames[0] || "Skills"}</b>
                  </div>
                  <ArrowLeftRight className="text-[var(--primary)] shrink-0" size={16} />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">They Want</span>
                    <b className="truncate block max-w-[100px] text-[var(--foreground)]">{topRecommended.wantedSkillNames[0] || "Skills"}</b>
                  </div>
                </div>

                <Button href={`/profile/${topRecommended.user.username}`} className="text-xs">
                  View Profile →
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card>
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
