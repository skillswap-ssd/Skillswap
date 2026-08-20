"use client";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { SkillCard } from "@/components/shared/skill-card";
import { RelatedSkills } from "@/components/shared/related-skills";
import { LearningPath } from "@/components/shared/learning-path";
import { SkillGapInsight } from "@/components/shared/skill-gap-insight";
import { RecommendationReason } from "@/components/shared/recommendation-reason";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useSkillSwap } from "@/lib/context/skillswap-context";
import { CURATED_LEARNING_PATHS } from "@/lib/learningPaths";
import { getSkillGapInsights, getSkillSuggestions } from "@/lib/recommendations";
import { Plus, TrendingUp, Sparkles, BookOpen, Compass } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SkillsPage() {
  const { currentUserId, currentUser, skills, categories, offers, requests, trackViewedSkill } = useSkillSwap();

  const [activeTab, setActiveTab] = useState<"shelf" | "discover" | "paths">("shelf");

  const myOffers = offers.filter((o) => o.userId === currentUserId);
  const myRequests = requests.filter((r) => r.userId === currentUserId);

  const offeredSkills = myOffers
    .map((o) => skills.find((s) => s.id === o.skillId))
    .filter((s): s is typeof skills[0] => Boolean(s));

  const wantedSkills = myRequests
    .map((r) => skills.find((s) => s.id === r.skillId))
    .filter((s): s is typeof skills[0] => Boolean(s));

  const skillGapInsights = getSkillGapInsights(currentUserId, skills, offers, requests);
  const skillSuggestions = getSkillSuggestions(currentUserId, skills, offers, requests);

  // Popular and Rising skills
  const popularSkills = [...skills].sort((a, b) => b.popularity - a.popularity).slice(0, 4);
  const risingSkills = [...skills].reverse().slice(0, 3);

  // Interest-matching skills
  const myInterests = currentUser?.interests.map((i) => i.toLowerCase()) || [];
  const interestMatchingSkills = skills.filter((s) =>
    s.tags.some((t) => myInterests.some((i) => i.includes(t) || t.includes(i)))
  );

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Skill Discovery & Management"
        title="Explore skills, learning paths, and mutual opportunities."
        body="Organize your teachable skills, set learning goals, explore related skill trees, and discover structured paths."
      />

      {/* Tabs */}
      <div className="flex border-b border-[var(--border)] mb-8 gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab("shelf")}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === "shelf"
              ? "border-[var(--primary)] text-[var(--primary)]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          Your Skill Shelf
        </button>

        <button
          onClick={() => setActiveTab("discover")}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === "discover"
              ? "border-[var(--primary)] text-[var(--primary)]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          Skill Intelligence & Discovery
        </button>

        <button
          onClick={() => setActiveTab("paths")}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === "paths"
              ? "border-[var(--primary)] text-[var(--primary)]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          Learning Paths
        </button>
      </div>

      {activeTab === "shelf" && (
        <div className="space-y-12">
          <div className="flex justify-between items-center border-b border-[var(--border)] pb-3">
            <span className="font-bold text-sm text-[var(--muted)]">Your Teachable & Wanted Skills</span>
            <Button href="/skills/new">
              <Plus size={16} className="mr-1 inline" /> Add Skill
            </Button>
          </div>

          <div>
            <h2 className="font-display text-4xl">Skills I Offer</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {offeredSkills.length > 0 ? (
                offeredSkills.map((s) => (
                  <div key={s.id} onClick={() => trackViewedSkill(s.id)}>
                    <SkillCard skill={s} mode="offer" />
                  </div>
                ))
              ) : (
                <div className="col-span-full space-y-4">
                  <EmptyState title="No skills offered yet" body="Add skills you can teach or share with peers, or test teaching with a practice partner." />
                  <div className="flex justify-center">
                    <Link
                      href="/skills/new"
                      className="rounded-lg bg-[#1c2430] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2d3748]"
                    >
                      Add a Skill
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="font-display text-4xl">Skills I Want to Learn</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {wantedSkills.length > 0 ? (
                wantedSkills.map((s) => (
                  <div key={s.id} onClick={() => trackViewedSkill(s.id)}>
                    <SkillCard skill={s} mode="want" />
                  </div>
                ))
              ) : (
                <div className="col-span-full space-y-4">
                  <EmptyState title="No learning goals set" body="Add skills you want to learn to help discover complementary mentors." />
                  <div className="flex justify-center">
                    <Link
                      href="/skills/new"
                      className="rounded-lg bg-[#1c2430] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2d3748]"
                    >
                      Add a Learning Goal
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Skill Gap Insight on Shelf */}
          {skillGapInsights.length > 0 && (
            <div>
              <h2 className="font-display text-4xl mb-4">Recommended Next Step</h2>
              <SkillGapInsight insight={skillGapInsights[0]} />
            </div>
          )}
        </div>
      )}

      {activeTab === "discover" && (
        <div className="space-y-12">
          {/* Skill Gap Insights */}
          {skillGapInsights.length > 0 && (
            <div>
              <h2 className="font-display text-4xl mb-4">Skill Gap Analysis</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {skillGapInsights.map((insight, idx) => (
                  <SkillGapInsight key={idx} insight={insight} />
                ))}
              </div>
            </div>
          )}

          {/* Popular & Rising Skills */}
          <div>
            <div className="flex justify-between items-center border-b border-[var(--border)] pb-2 mb-4">
              <h2 className="font-display text-4xl flex items-center gap-2">
                <TrendingUp size={24} className="text-[var(--primary)]" /> Popular & Frequently Exchanged Skills
              </h2>
              <span className="text-xs text-[var(--muted)] font-bold">Community Demand</span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {popularSkills.map((skill) => (
                <Card key={skill.id} className="flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--primary)] bg-[var(--surface-muted)] px-2 py-0.5 border border-[var(--border)]">
                      {skill.popularity} exchanges requested
                    </span>
                    <h3 className="font-display text-2xl mt-3">{skill.name}</h3>
                    <p className="text-xs text-[var(--muted)] mt-1">{skill.description}</p>
                    <div className="mt-3">
                      <RelatedSkills skillIdOrName={skill.id} label="Related" />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[var(--border)]">
                    <Button href={`/discover?q=${encodeURIComponent(skill.name)}`} className="w-full justify-center text-xs">
                      Explore {skill.name}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Skills Matching Current Interests */}
          {interestMatchingSkills.length > 0 && (
            <div>
              <div className="border-b border-[var(--border)] pb-2 mb-4">
                <h2 className="font-display text-4xl flex items-center gap-2">
                  <Sparkles size={24} className="text-[var(--primary)]" /> Matching Your Interests
                </h2>
                <p className="text-xs text-[var(--muted)]">Based on your saved profile interest tags.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {interestMatchingSkills.map((skill) => (
                  <SkillCard key={skill.id} skill={skill} />
                ))}
              </div>
            </div>
          )}

          {/* Personalized Skill Suggestions */}
          <div>
            <div className="border-b border-[var(--border)] pb-2 mb-4">
              <h2 className="font-display text-4xl flex items-center gap-2">
                <Compass size={24} className="text-[var(--primary)]" /> Personalized Skill Suggestions
              </h2>
              <p className="text-xs text-[var(--muted)]">Complementary areas derived from what you currently teach and request.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {skillSuggestions.map(({ skill, reason }) => (
                <Card key={skill.id} className="flex flex-col justify-between">
                  <div>
                    <RecommendationReason reason={reason} category="explored" />
                    <h3 className="font-display text-2xl mt-3">{skill.name}</h3>
                    <p className="text-xs text-[var(--muted)] mt-1">{skill.description}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[var(--border)] flex justify-between items-center text-xs">
                    <span className="font-bold text-[var(--muted)]">{skill.popularity} exchanges</span>
                    <Link
                      href={`/discover?q=${encodeURIComponent(skill.name)}`}
                      className="font-bold text-[var(--primary)] hover:underline"
                    >
                      Explore →
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "paths" && (
        <div className="space-y-8">
          <div>
            <h2 className="font-display text-4xl">Lightweight Learning Paths</h2>
            <p className="text-sm text-[var(--muted)] mt-1 max-w-2xl">
              Learning paths suggest practical skill progressions based on community exchange patterns.
            </p>
          </div>

          <div className="grid gap-6">
            {CURATED_LEARNING_PATHS.map((path) => (
              <LearningPath key={path.id} path={path} />
            ))}
          </div>
        </div>
      )}

      <section className="mt-16">
        <h2 className="font-display text-4xl">Category System</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-5">
          {categories.map((c) => (
            <article className="border border-[var(--border)] bg-[var(--surface)] p-4" key={c.id}>
              <b className="block">{c.name}</b>
              <p className="text-sm text-[var(--muted)] mt-1">{c.description}</p>
            </article>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
