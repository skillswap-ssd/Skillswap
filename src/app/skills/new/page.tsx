"use client";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ExchangeFormat, SkillLevel } from "@/data/models";
import { useSkillSwap } from "@/lib/context/skillswap-context";
import { CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

export function SkillForm({ editId }: { editId?: string }) {
  const router = useRouter();
  const { categories, skills, offers, requests, currentUserId, addOrUpdateSkill } = useSkillSwap();

  const existingSkill = editId ? skills.find((s) => s.id === editId) : null;
  const existingOffer = editId ? offers.find((o) => o.skillId === editId && o.userId === currentUserId) : null;
  const existingRequest = editId ? requests.find((r) => r.skillId === editId && r.userId === currentUserId) : null;

  const [name, setName] = useState(existingSkill?.name || "");
  const [categoryId, setCategoryId] = useState(existingSkill?.categoryId || categories[0]?.id || "tech");
  const [level, setLevel] = useState<SkillLevel>(
    existingSkill?.level || existingOffer?.level || existingRequest?.level || "intermediate"
  );
  const [description, setDescription] = useState(
    existingSkill?.description || existingOffer?.summary || existingRequest?.goal || ""
  );
  const [tags, setTags] = useState(existingSkill?.tags.join(", ") || "");
  const [kind, setKind] = useState<"offer" | "want" | "both">(
    existingOffer && existingRequest ? "both" : existingRequest ? "want" : "offer"
  );
  const [format, setFormat] = useState<ExchangeFormat>(existingSkill?.formats[0] || "remote");
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addOrUpdateSkill({
      id: editId || undefined,
      name: name.trim(),
      categoryId,
      level,
      description: description || `Skill: ${name}`,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      formats: [format],
      kind,
    });

    setSaved(true);
    setTimeout(() => {
      router.push("/skills");
    }, 1000);
  };

  return (
    <Card>
      {saved && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold flex items-center gap-2 text-sm">
          <CheckCircle2 size={18} className="text-emerald-600" />
          Skill saved successfully! Updating profile and discovery...
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 text-sm">
        <div>
          <label className="font-bold block mb-1">Skill Name</label>
          <Input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Python Automation, Photo Editing, Conversational Spanish"
          />
        </div>

        <div>
          <label className="font-bold block mb-1">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="focus-ring w-full border border-[var(--border)] bg-[var(--background)] p-2.5 font-bold"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-bold block mb-1">Proficiency Level</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as SkillLevel)}
            className="focus-ring w-full border border-[var(--border)] bg-[var(--background)] p-2.5 font-bold"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
        </div>

        <div>
          <label className="font-bold block mb-1">Exchange Format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as ExchangeFormat)}
            className="focus-ring w-full border border-[var(--border)] bg-[var(--background)] p-2.5 font-bold"
          >
            <option value="remote">Remote (Video session)</option>
            <option value="in-person">In-Person</option>
            <option value="hybrid">Hybrid / Flexible</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="font-bold block mb-1">Tags (Comma Separated)</label>
          <Input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. python, automation, scripts, beginner-friendly"
          />
        </div>

        <div className="md:col-span-2">
          <label className="font-bold block mb-1">Description & Goals</label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="focus-ring w-full border border-[var(--border)] bg-[var(--background)] p-2.5 text-sm"
            placeholder="Describe what you offer or hope to learn, experience level, or specific topics..."
          />
        </div>

        <div className="md:col-span-2 border-t border-[var(--border)] pt-3 font-bold space-y-2">
          <label className="block text-xs uppercase tracking-wider text-[var(--muted)]">Skill Relationship</label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="kind"
                checked={kind === "offer"}
                onChange={() => setKind("offer")}
              />
              I can teach/offer this skill
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="kind"
                checked={kind === "want"}
                onChange={() => setKind("want")}
              />
              I want to learn this skill
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="kind"
                checked={kind === "both"}
                onChange={() => setKind("both")}
              />
              Both teach and learn
            </label>
          </div>
        </div>

        <div className="md:col-span-2 flex justify-end gap-3 mt-3">
          <Button type="button" variant="ghost" href="/skills">
            Cancel
          </Button>
          <Button type="submit">{editId ? "Update Skill" : "Save Skill"}</Button>
        </div>
      </form>
    </Card>
  );
}

function SkillNewContent() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId") || undefined;
  return <SkillForm editId={editId} />;
}

export default function SkillNewPage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Skill Library"
        title="Offer a skill or request one."
        body="Add or edit a skill in your profile. Your skills are used across discovery and complementary match calculations."
      />
      <Suspense fallback={<Card><p className="p-4 text-sm font-bold text-[var(--muted)]">Loading skill editor...</p></Card>}>
        <SkillNewContent />
      </Suspense>
    </PageContainer>
  );
}
