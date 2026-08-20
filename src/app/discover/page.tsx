"use client";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { RecommendationReason } from "@/components/shared/recommendation-reason";
import { RelatedSkills } from "@/components/shared/related-skills";
import { SkillCard } from "@/components/shared/skill-card";
import { UserCard } from "@/components/shared/user-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { useSkillSwap } from "@/lib/context/skillswap-context";
import {
  getPeopleWhoCanTeach,
  getPeopleWhoWantToLearn,
  getRecommendedUsers,
  getSkillSuggestions,
} from "@/lib/recommendations";
import { getRelatedSkillsForSkill } from "@/lib/skillRelations";
import { ArrowRight, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function DiscoverPage() {
  const {
    currentUserId,
    users,
    profiles,
    skills,
    categories,
    offers,
    requests,
    recentlyViewedSkills,
    recentlyViewedProfiles,
  } = useSkillSwap();

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProficiency, setSelectedProficiency] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [highReputationOnly, setHighReputationOnly] = useState(false);
  const [availableThisWeek, setAvailableThisWeek] = useState(false);

  const clearAllFilters = () => {
    setQuery("");
    setSelectedCategory(null);
    setSelectedProficiency(null);
    setSelectedFormat(null);
    setHighReputationOnly(false);
    setAvailableThisWeek(false);
  };

  const hasActiveFilters =
    query.trim() !== "" ||
    selectedCategory !== null ||
    selectedProficiency !== null ||
    selectedFormat !== null ||
    highReputationOnly ||
    availableThisWeek;

  // Search relation lookup
  const relatedSkillsFromQuery = query.trim() ? getRelatedSkillsForSkill(query) : [];

  const filteredSkills = skills.filter((s) => {
    if (selectedCategory && s.categoryId !== selectedCategory) return false;
    if (selectedProficiency && s.level !== selectedProficiency) return false;
    if (selectedFormat && !s.formats.includes(selectedFormat as any)) return false;

    if (query.trim()) {
      const q = query.toLowerCase();
      const matchesName = s.name.toLowerCase().includes(q);
      const matchesDesc = s.description.toLowerCase().includes(q);
      const matchesCategory = categories.find((c) => c.id === s.categoryId)?.name.toLowerCase().includes(q);
      const matchesTags = s.tags.some((t) => t.toLowerCase().includes(q));
      const matchesRelated = relatedSkillsFromQuery.some(
        (rel) => rel.name.toLowerCase().includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(rel.name.toLowerCase())
      );

      if (!matchesName && !matchesDesc && !matchesCategory && !matchesTags && !matchesRelated) return false;
    }

    return true;
  });

  const filteredUsers = users.filter((u) => {
    const profile = profiles.find((p) => p.userId === u.id);
    const userOffers = offers.filter((o) => o.userId === u.id);
    const userRequests = requests.filter((r) => r.userId === u.id);

    const offeredSkills = userOffers
      .map((o) => skills.find((s) => s.id === o.skillId))
      .filter(Boolean);
    const wantedSkills = userRequests
      .map((r) => skills.find((s) => s.id === r.skillId))
      .filter(Boolean);

    if (highReputationOnly && u.reputation < 4.8) return false;
    if (availableThisWeek && u.availability.toLowerCase().includes("not")) return false;

    if (selectedCategory) {
      const hasCategoryInOffer = offeredSkills.some((s) => s?.categoryId === selectedCategory);
      const hasCategoryInWant = wantedSkills.some((s) => s?.categoryId === selectedCategory);
      if (!hasCategoryInOffer && !hasCategoryInWant) return false;
    }

    if (selectedProficiency) {
      const hasProficiencyInOffer = userOffers.some((o) => o.level === selectedProficiency);
      if (!hasProficiencyInOffer) return false;
    }

    if (selectedFormat) {
      const hasFormat = userOffers.some((o) => o.format === selectedFormat) || profile?.preference === selectedFormat;
      if (!hasFormat) return false;
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      const matchesName = u.name.toLowerCase().includes(q);
      const matchesUsername = u.username.toLowerCase().includes(q);
      const matchesBio = profile?.bio.toLowerCase().includes(q) || profile?.headline.toLowerCase().includes(q);
      const matchesInterests = u.interests.some((i) => i.toLowerCase().includes(q));
      const matchesOfferedSkill = offeredSkills.some(
        (s) =>
          s?.name.toLowerCase().includes(q) ||
          s?.tags.some((t) => t.toLowerCase().includes(q)) ||
          relatedSkillsFromQuery.some((rel) => s?.name.toLowerCase().includes(rel.name.toLowerCase()))
      );
      const matchesWantedSkill = wantedSkills.some(
        (s) =>
          s?.name.toLowerCase().includes(q) ||
          s?.tags.some((t) => t.toLowerCase().includes(q)) ||
          relatedSkillsFromQuery.some((rel) => s?.name.toLowerCase().includes(rel.name.toLowerCase()))
      );

      if (
        !matchesName &&
        !matchesUsername &&
        !matchesBio &&
        !matchesInterests &&
        !matchesOfferedSkill &&
        !matchesWantedSkill
      ) {
        return false;
      }
    }

    return true;
  });

  // Intelligent sections when browsing default
  const bestMatches = getRecommendedUsers(
    currentUserId,
    users,
    profiles,
    skills,
    offers,
    requests,
    [],
    [],
    { recentlyViewedSkillIds: recentlyViewedSkills, recentlyViewedUserIds: recentlyViewedProfiles }
  );

  const peopleWhoCanTeach = getPeopleWhoCanTeach(currentUserId, users, profiles, skills, offers, requests);
  const peopleWhoNeedMySkills = getPeopleWhoWantToLearn(currentUserId, users, profiles, skills, offers, requests);
  const skillSuggestions = getSkillSuggestions(currentUserId, skills, offers, requests);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Discover Intelligence"
        title="Find people, skills, and mutual value."
        body="Search by topic or filter by category, proficiency, format, reputation, and availability with intelligent skill relations."
      />

      <div className="grid gap-2">
        <label htmlFor="discover-search" className="font-bold text-sm">
          Search skills, people, interests, or related topics
        </label>
        <div className="relative">
          <Input
            id="discover-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try Python, photography, speaking, design, video..."
            aria-label="Search skills and people"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
              aria-label="Clear search query"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Query Relation Suggestions */}
        {query.trim() !== "" && relatedSkillsFromQuery.length > 0 && (
          <div className="mt-1">
            <RelatedSkills skillIdOrName={query} label="Related topics recognized" />
          </div>
        )}
      </div>

      <div className="my-5 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory || ""}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="focus-ring border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-bold"
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedProficiency || ""}
            onChange={(e) => setSelectedProficiency(e.target.value || null)}
            className="focus-ring border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-bold"
            aria-label="Filter by proficiency"
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>

          <select
            value={selectedFormat || ""}
            onChange={(e) => setSelectedFormat(e.target.value || null)}
            className="focus-ring border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-bold"
            aria-label="Filter by format"
          >
            <option value="">All Formats</option>
            <option value="remote">Remote</option>
            <option value="in-person">In-Person</option>
            <option value="hybrid">Hybrid</option>
          </select>

          <button
            onClick={() => setHighReputationOnly(!highReputationOnly)}
            className={`focus-ring border px-3 py-2 text-sm font-bold transition-colors ${
              highReputationOnly
                ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]"
                : "border-[var(--border)] hover:bg-[var(--surface-muted)]"
            }`}
          >
            High Reputation (4.8+)
          </button>

          <button
            onClick={() => setAvailableThisWeek(!availableThisWeek)}
            className={`focus-ring border px-3 py-2 text-sm font-bold transition-colors ${
              availableThisWeek
                ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]"
                : "border-[var(--border)] hover:bg-[var(--surface-muted)]"
            }`}
          >
            Available This Week
          </button>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-sm font-bold text-[var(--muted)] hover:text-[var(--foreground)] underline ml-auto"
          >
            <X size={14} /> Clear filters
          </button>
        )}
      </div>

      {/* When Active Search/Filters are applied */}
      {hasActiveFilters ? (
        <div>
          <div className="mb-6 text-sm font-bold text-[var(--muted)] flex justify-between items-center border-b border-[var(--border)] pb-2">
            <span>
              Showing {filteredUsers.length} {filteredUsers.length === 1 ? "person" : "people"} and {filteredSkills.length} {filteredSkills.length === 1 ? "skill" : "skills"}
            </span>
          </div>

          {filteredUsers.length === 0 && filteredSkills.length === 0 ? (
            <div className="grid gap-6">
              <EmptyState
                title={`No exact results found for "${query}"`}
                body="No current members or skills matched your active query. Explore related skill areas below:"
              />

              {/* Intelligent Empty State Suggestions */}
              <div className="p-4 border-2 border-[var(--primary)] bg-[var(--surface)]">
                <span className="font-bold text-sm text-[var(--primary)] block mb-2">
                  Try exploring related skill areas:
                </span>
                <div className="flex flex-wrap gap-2">
                  {relatedSkillsFromQuery.map((rel) => (
                    <button
                      key={rel.id}
                      onClick={() => setQuery(rel.name)}
                      className="px-3 py-1.5 border border-[var(--border)] bg-[var(--surface-muted)] font-bold text-xs hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors"
                    >
                      Search &ldquo;{rel.name}&rdquo; →
                    </button>
                  ))}
                  {relatedSkillsFromQuery.length === 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="px-3 py-1.5 bg-[var(--foreground)] text-[var(--background)] font-bold text-xs"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <section className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
              <div>
                <h2 className="font-display text-4xl">Potential exchanges</h2>
                <div className="mt-4 grid gap-4">
                  {filteredUsers.map((u) => {
                    const p = profiles.find((prof) => prof.userId === u.id);
                    const rec = bestMatches.find((m) => m.user.id === u.id);
                    return (
                      <UserCard
                        key={u.id}
                        user={u}
                        headline={p?.headline || ""}
                        match={rec ? rec.primaryReason : undefined}
                      />
                    );
                  })}
                </div>
              </div>

              <div>
                <h2 className="font-display text-4xl">Skills in motion</h2>
                <div className="mt-4 grid gap-4">
                  {filteredSkills.map((s) => (
                    <SkillCard key={s.id} skill={s} />
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      ) : (
        /* Default Intelligent Discovery View */
        <div className="space-y-12 mt-8">
          {/* Section: Best Matches */}
          <section>
            <div className="flex justify-between items-center border-b border-[var(--border)] pb-2 mb-4">
              <div>
                <h2 className="font-display text-3xl">Best matches</h2>
                <p className="text-xs text-[var(--muted)]">Calculated from direct reciprocal and category synergy.</p>
              </div>
              <Link href="/matches" className="text-xs font-bold text-[var(--primary)] hover:underline">
                View Matches →
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bestMatches.slice(0, 3).map((rec) => (
                <div key={rec.user.id} className="border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-display text-xl">
                        <Link href={`/profile/${rec.user.username}`} className="hover:underline">
                          {rec.user.name}
                        </Link>
                      </h3>
                      <span className="text-xs font-bold text-[var(--muted)]">{rec.user.reputation}★</span>
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-0.5">{rec.profile.headline}</p>

                    <div className="my-2.5">
                      <RecommendationReason
                        reason={rec.reasons[0]?.label || rec.primaryReason}
                        category={rec.reasons[0]?.category}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[var(--border)] flex justify-between items-center text-xs">
                    <span className="font-bold text-[var(--muted)]">{rec.quality}</span>
                    <Link href={`/profile/${rec.user.username}`} className="font-bold text-[var(--primary)] hover:underline">
                      Profile →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section: People Who Can Teach What You Want */}
          {peopleWhoCanTeach.length > 0 && (
            <section>
              <div className="border-b border-[var(--border)] pb-2 mb-4">
                <h2 className="font-display text-3xl">People who can teach what you want</h2>
                <p className="text-xs text-[var(--muted)]">Peers offering skills on your learning shelf.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {peopleWhoCanTeach.slice(0, 2).map((t) => (
                  <UserCard key={t.user.id} user={t.user} headline={t.profile.headline} match={t.primaryReason} />
                ))}
              </div>
            </section>
          )}

          {/* Section: People Who Need Your Skills */}
          {peopleWhoNeedMySkills.length > 0 && (
            <section>
              <div className="border-b border-[var(--border)] pb-2 mb-4">
                <h2 className="font-display text-3xl">People who need your skills</h2>
                <p className="text-xs text-[var(--muted)]">Peers seeking skills you currently offer.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {peopleWhoNeedMySkills.slice(0, 2).map((l) => (
                  <UserCard key={l.user.id} user={l.user} headline={l.profile.headline} match={l.primaryReason} />
                ))}
              </div>
            </section>
          )}

          {/* Section: Explore Related Skills */}
          <section>
            <div className="border-b border-[var(--border)] pb-2 mb-4">
              <h2 className="font-display text-3xl">Explore related skills</h2>
              <p className="text-xs text-[var(--muted)]">Recommended skills aligned with community momentum.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {skillSuggestions.map(({ skill, reason }) => (
                <div key={skill.id} className="border border-[var(--border)] bg-[var(--surface-muted)] p-4 flex flex-col justify-between">
                  <div>
                    <RecommendationReason reason={reason} category="explored" />
                    <h3 className="font-display text-2xl mt-2">{skill.name}</h3>
                    <p className="text-xs text-[var(--muted)] mt-1">{skill.description}</p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-[var(--border)] flex justify-between items-center text-xs">
                    <span className="font-bold text-[var(--muted)]">{skill.popularity} interested</span>
                    <button
                      onClick={() => setQuery(skill.name)}
                      className="font-bold text-[var(--primary)] hover:underline flex items-center gap-1"
                    >
                      Find Swaps <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      <section className="mt-12">
        <h2 className="font-display text-4xl">Browse categories</h2>
        <div className="mt-4 grid md:grid-cols-5 gap-4">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(selectedCategory === c.id ? null : c.id)}
              className={`text-left border-t border-[var(--border)] py-4 transition-colors ${
                selectedCategory === c.id ? "bg-[var(--surface-muted)] px-2" : ""
              }`}
            >
              <b className="block">{c.name}</b>
              <p className="text-sm text-[var(--muted)]">{c.description}</p>
            </button>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
