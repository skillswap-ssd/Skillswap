"use client";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { SkillCard } from "@/components/shared/skill-card";
import { UserCard } from "@/components/shared/user-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { useSkillSwap } from "@/lib/context/skillswap-context";
import { X } from "lucide-react";
import { useState } from "react";

export default function DiscoverPage() {
  const { users, profiles, skills, categories, offers, requests } = useSkillSwap();

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
      if (!matchesName && !matchesDesc && !matchesCategory && !matchesTags) return false;
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
        (s) => s?.name.toLowerCase().includes(q) || s?.tags.some((t) => t.toLowerCase().includes(q))
      );
      const matchesWantedSkill = wantedSkills.some(
        (s) => s?.name.toLowerCase().includes(q) || s?.tags.some((t) => t.toLowerCase().includes(q))
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

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Discover"
        title="Find people, skills, and mutual value."
        body="Search by topic or filter by category, proficiency, format, reputation, and availability."
      />

      <div className="grid gap-2">
        <label htmlFor="discover-search" className="font-bold text-sm">
          Search skills, people, and interests
        </label>
        <div className="relative">
          <Input
            id="discover-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try Python, photography, speaking, Brooklyn, design..."
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

      <div className="mb-6 text-sm font-bold text-[var(--muted)] flex justify-between items-center border-b border-[var(--border)] pb-2">
        <span>
          Showing {filteredUsers.length} {filteredUsers.length === 1 ? "person" : "people"} and {filteredSkills.length} {filteredSkills.length === 1 ? "skill" : "skills"}
        </span>
      </div>

      {filteredUsers.length === 0 && filteredSkills.length === 0 ? (
        <div className="grid gap-4">
          <EmptyState
            title="No results found"
            body="No people or skills matched your active search and filter criteria. Try adjusting your query or resetting filters."
          />
          <div className="flex justify-center">
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 bg-[var(--foreground)] text-[var(--background)] font-bold text-sm"
            >
              Clear all filters
            </button>
          </div>
        </div>
      ) : (
        <section className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <h2 className="font-display text-4xl">Potential exchanges</h2>
            <div className="mt-4 grid gap-4">
              {filteredUsers.map((u) => {
                const p = profiles.find((prof) => prof.userId === u.id);
                return <UserCard key={u.id} user={u} headline={p?.headline || ""} />;
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
