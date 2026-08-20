"use client";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { RecommendationReason } from "@/components/shared/recommendation-reason";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ExchangeFormat, SkillLevel } from "@/data/models";
import { useSkillSwap } from "@/lib/context/skillswap-context";
import { getRelatedSkillsForSkill } from "@/lib/skillRelations";
import { CheckCircle2, Plus, Sparkles, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OnboardingPage() {
  const router = useRouter();
  const { currentUser, profiles, categories, users, finishOnboarding } = useSkillSwap();

  const userProfile = profiles.find((p) => p.userId === currentUser.id);

  const [name, setName] = useState(currentUser.name || "");
  const [username, setUsername] = useState(currentUser.username || "");
  const [bio, setBio] = useState(userProfile?.bio || "");
  const [learningStyle, setLearningStyle] = useState(userProfile?.learningStyle || "Pairing & practice");
  const [availability, setAvailability] = useState(currentUser.availability || "3 hrs/week");
  const [preference, setPreference] = useState<ExchangeFormat>(userProfile?.preference || "remote");

  const [teachableSkills, setTeachableSkills] = useState<
    Array<{ name: string; categoryId: string; level: SkillLevel; description: string }>
  >([
    { name: "Python Automation", categoryId: categories[0]?.id || "tech", level: "advanced", description: "Scripting and workflow automation" },
  ]);

  const [wantedSkills, setWantedSkills] = useState<
    Array<{ name: string; categoryId: string; level: SkillLevel; description: string }>
  >([
    { name: "Photography Critique", categoryId: categories[1]?.id || "craft", level: "beginner", description: "Portfolio review and lighting advice" },
  ]);

  const [completed, setCompleted] = useState(false);

  const primaryWantedName = wantedSkills[0]?.name || "Photography";
  const relatedWantedSkills = getRelatedSkillsForSkill(primaryWantedName);

  // Suggested people who teach wanted skills
  const suggestedPeers = users.filter((u) => u.id !== currentUser.id).slice(0, 2);

  const handleAddTeachable = () => {
    setTeachableSkills([
      ...teachableSkills,
      { name: "", categoryId: categories[0]?.id || "tech", level: "intermediate", description: "" },
    ]);
  };

  const handleRemoveTeachable = (index: number) => {
    setTeachableSkills(teachableSkills.filter((_, i) => i !== index));
  };

  const handleAddWanted = () => {
    setWantedSkills([
      ...wantedSkills,
      { name: "", categoryId: categories[0]?.id || "tech", level: "beginner", description: "" },
    ]);
  };

  const handleRemoveWanted = (index: number) => {
    setWantedSkills(wantedSkills.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    finishOnboarding({
      name,
      username,
      bio,
      teachableSkills: teachableSkills.filter((s) => s.name.trim() !== ""),
      wantedSkills: wantedSkills.filter((s) => s.name.trim() !== ""),
      learningStyle,
      availability,
      preference,
    });

    setCompleted(true);
    setTimeout(() => {
      router.push("/discover");
    }, 1000);
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Smart Onboarding"
        title="Build your SkillSwap identity."
        body="Set up your exchange profile with what you can teach and what you want to learn, and see immediate personalized recommendations."
      />

      {completed && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold flex items-center gap-2">
          <CheckCircle2 size={20} className="text-emerald-600" />
          Onboarding complete! Redirecting to discovery...
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h2 className="font-display text-3xl">Identity</h2>
            <div className="mt-4 grid gap-3.5 text-sm font-bold">
              <div>
                <label className="block mb-1">Display Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your Name" />
              </div>

              <div>
                <label className="block mb-1">Username</label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="username" />
              </div>

              <div>
                <label className="block mb-1">Short Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="focus-ring w-full border border-[var(--border)] bg-[var(--background)] p-2.5 font-normal text-sm"
                  placeholder="Share your goals and background..."
                />
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-3xl">Learning Preferences</h2>
            <div className="mt-4 grid gap-3.5 text-sm font-bold">
              <div>
                <label className="block mb-1">Preferred Learning Style</label>
                <Input
                  value={learningStyle}
                  onChange={(e) => setLearningStyle(e.target.value)}
                  placeholder="e.g. Hands-on projects, weekly chats"
                />
              </div>

              <div>
                <label className="block mb-1">Availability</label>
                <Input
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  placeholder="e.g. 2 hrs/week, evenings"
                />
              </div>

              <div>
                <label className="block mb-1">Exchange Format</label>
                <select
                  value={preference}
                  onChange={(e) => setPreference(e.target.value as ExchangeFormat)}
                  className="focus-ring w-full border border-[var(--border)] bg-[var(--background)] p-2.5 font-bold"
                >
                  <option value="remote">Remote (Video calls)</option>
                  <option value="in-person">In-Person</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <h2 className="font-display text-3xl">Skills I Can Teach</h2>
            <Button type="button" variant="secondary" onClick={handleAddTeachable} className="text-xs">
              <Plus size={14} className="mr-1 inline" /> Add Skill
            </Button>
          </div>

          <div className="mt-4 grid gap-4">
            {teachableSkills.map((sk, idx) => (
              <div key={idx} className="p-3 border border-[var(--border)] bg-[var(--surface-muted)] grid sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-4">
                  <label className="block text-xs font-bold mb-1">Skill Name</label>
                  <Input
                    required
                    value={sk.name}
                    onChange={(e) => {
                      const updated = [...teachableSkills];
                      updated[idx].name = e.target.value;
                      setTeachableSkills(updated);
                    }}
                    placeholder="e.g. Python"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold mb-1">Category</label>
                  <select
                    value={sk.categoryId}
                    onChange={(e) => {
                      const updated = [...teachableSkills];
                      updated[idx].categoryId = e.target.value;
                      setTeachableSkills(updated);
                    }}
                    className="focus-ring w-full border border-[var(--border)] bg-[var(--background)] p-2.5 text-xs font-bold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold mb-1">Proficiency</label>
                  <select
                    value={sk.level}
                    onChange={(e) => {
                      const updated = [...teachableSkills];
                      updated[idx].level = e.target.value as SkillLevel;
                      setTeachableSkills(updated);
                    }}
                    className="focus-ring w-full border border-[var(--border)] bg-[var(--background)] p-2.5 text-xs font-bold"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div className="sm:col-span-2 flex justify-end">
                  {teachableSkills.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTeachable(idx)}
                      className="p-2 text-rose-700 hover:bg-rose-50 border border-rose-200 text-xs font-bold"
                      title="Remove skill"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <h2 className="font-display text-3xl">Skills I Want to Learn</h2>
            <Button type="button" variant="secondary" onClick={handleAddWanted} className="text-xs">
              <Plus size={14} className="mr-1 inline" /> Add Skill
            </Button>
          </div>

          <div className="mt-4 grid gap-4">
            {wantedSkills.map((sk, idx) => (
              <div key={idx} className="p-3 border border-[var(--border)] bg-[var(--surface-muted)] grid sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-4">
                  <label className="block text-xs font-bold mb-1">Skill Name</label>
                  <Input
                    required
                    value={sk.name}
                    onChange={(e) => {
                      const updated = [...wantedSkills];
                      updated[idx].name = e.target.value;
                      setWantedSkills(updated);
                    }}
                    placeholder="e.g. Photography"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold mb-1">Category</label>
                  <select
                    value={sk.categoryId}
                    onChange={(e) => {
                      const updated = [...wantedSkills];
                      updated[idx].categoryId = e.target.value;
                      setWantedSkills(updated);
                    }}
                    className="focus-ring w-full border border-[var(--border)] bg-[var(--background)] p-2.5 text-xs font-bold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold mb-1">Target Proficiency</label>
                  <select
                    value={sk.level}
                    onChange={(e) => {
                      const updated = [...wantedSkills];
                      updated[idx].level = e.target.value as SkillLevel;
                      setWantedSkills(updated);
                    }}
                    className="focus-ring w-full border border-[var(--border)] bg-[var(--background)] p-2.5 text-xs font-bold"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div className="sm:col-span-2 flex justify-end">
                  {wantedSkills.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveWanted(idx)}
                      className="p-2 text-rose-700 hover:bg-rose-50 border border-rose-200 text-xs font-bold"
                      title="Remove skill"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Smart Onboarding Preview Section */}
        {primaryWantedName && (
          <Card className="border-2 border-[var(--primary)] bg-[var(--surface)]">
            <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-[var(--primary)]">
              <Sparkles size={14} /> Based on what you want to learn ({primaryWantedName})...
            </div>

            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] block mb-1.5">
                  Suggested Related Skills:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {relatedWantedSkills.map((rel) => (
                    <span key={rel.id} className="text-xs font-bold bg-[var(--surface-muted)] px-2.5 py-1 border border-[var(--border)]">
                      + {rel.name}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] block mb-1.5">
                  Possible SkillSwap Peers:
                </span>
                <div className="space-y-1.5">
                  {suggestedPeers.map((p) => (
                    <div key={p.id} className="text-xs font-bold p-2 border border-[var(--border)] bg-[var(--surface-muted)] flex justify-between items-center">
                      <span>{p.name} ({p.location})</span>
                      <span className="text-[var(--primary)]">{p.reputation}★</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="flex justify-end gap-3">
          <Button type="submit">Complete Onboarding</Button>
        </div>
      </form>
    </PageContainer>
  );
}
