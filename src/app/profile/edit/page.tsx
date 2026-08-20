"use client";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ExchangeFormat, SkillLevel } from "@/data/models";
import { useSkillSwap } from "@/lib/context/skillswap-context";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProfileEditPage() {
  const router = useRouter();
  const {
    currentUser,
    profiles,
    categories,
    offers,
    requests,
    skills,
    updateProfile,
    addOrUpdateSkill,
  } = useSkillSwap();

  const userProfile = profiles.find((p) => p.userId === currentUser.id);

  const [name, setName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username);
  const [avatar, setAvatar] = useState(currentUser.avatar || "");
  const [location, setLocation] = useState(currentUser.location || "");
  const [headline, setHeadline] = useState(userProfile?.headline || "");
  const [bio, setBio] = useState(userProfile?.bio || "");
  const [interests, setInterests] = useState(currentUser.interests.join(", "));
  const [availability, setAvailability] = useState(currentUser.availability || "");
  const [learningStyle, setLearningStyle] = useState(userProfile?.learningStyle || "");
  const [preference, setPreference] = useState<ExchangeFormat>(userProfile?.preference || "remote");

  // Initial skills offered / wanted
  const myOffers = offers
    .filter((o) => o.userId === currentUser.id)
    .map((o) => {
      const s = skills.find((sk) => sk.id === o.skillId);
      return {
        id: s?.id,
        name: s?.name || "",
        categoryId: s?.categoryId || categories[0]?.id || "tech",
        level: o.level,
        description: o.summary || s?.description || "",
      };
    });

  const myRequests = requests
    .filter((r) => r.userId === currentUser.id)
    .map((r) => {
      const s = skills.find((sk) => sk.id === r.skillId);
      return {
        id: s?.id,
        name: s?.name || "",
        categoryId: s?.categoryId || categories[0]?.id || "tech",
        level: r.level,
        description: r.goal || s?.description || "",
      };
    });

  const [offeredSkills, setOfferedSkills] = useState(
    myOffers.length > 0
      ? myOffers
      : [{ id: undefined, name: "", categoryId: categories[0]?.id || "tech", level: "intermediate" as SkillLevel, description: "" }]
  );

  const [wantedSkills, setWantedSkills] = useState(
    myRequests.length > 0
      ? myRequests
      : [{ id: undefined, name: "", categoryId: categories[0]?.id || "tech", level: "beginner" as SkillLevel, description: "" }]
  );

  const [saved, setSaved] = useState(false);

  const handleAddOfferedSkill = () => {
    setOfferedSkills([
      ...offeredSkills,
      { id: undefined, name: "", categoryId: categories[0]?.id || "tech", level: "intermediate", description: "" },
    ]);
  };

  const handleRemoveOfferedSkill = (index: number) => {
    setOfferedSkills(offeredSkills.filter((_, i) => i !== index));
  };

  const handleAddWantedSkill = () => {
    setWantedSkills([
      ...wantedSkills,
      { id: undefined, name: "", categoryId: categories[0]?.id || "tech", level: "beginner", description: "" },
    ]);
  };

  const handleRemoveWantedSkill = (index: number) => {
    setWantedSkills(wantedSkills.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateProfile({
      name,
      username,
      avatar,
      location,
      headline,
      bio,
      availability,
      learningStyle,
      preference,
      interests: interests
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean),
    });

    // Process offered skills
    offeredSkills.forEach((s) => {
      if (s.name.trim()) {
        addOrUpdateSkill({
          id: s.id,
          name: s.name.trim(),
          categoryId: s.categoryId,
          level: s.level,
          description: s.description || `Teachable skill: ${s.name}`,
          tags: [s.name.trim().toLowerCase()],
          formats: [preference],
          kind: "offer",
        });
      }
    });

    // Process wanted skills
    wantedSkills.forEach((s) => {
      if (s.name.trim()) {
        addOrUpdateSkill({
          id: s.id,
          name: s.name.trim(),
          categoryId: s.categoryId,
          level: s.level,
          description: s.description || `Skill goal: ${s.name}`,
          tags: [s.name.trim().toLowerCase()],
          formats: [preference],
          kind: "want",
        });
      }
    });

    setSaved(true);
    setTimeout(() => {
      router.push(`/profile/${username}`);
    }, 1000);
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Edit profile"
        title="Tune your exchange identity."
        body="Update your bio, availability, learning preferences, and skills to keep your SkillSwap identity accurate."
      />

      {saved && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold flex items-center gap-2">
          <CheckCircle2 size={20} className="text-emerald-600" />
          Profile updated successfully! Preserving changes for your session...
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h2 className="font-display text-3xl">Identity & Bio</h2>
            <div className="mt-4 grid gap-3.5 text-sm font-bold">
              <div>
                <label className="block mb-1">Display Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Full Name" />
              </div>

              <div>
                <label className="block mb-1">Username</label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="username" />
              </div>

              <div>
                <label className="block mb-1">Location</label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, State / Remote" />
              </div>

              <div>
                <label className="block mb-1">Headline</label>
                <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Short tagline" />
              </div>

              <div>
                <label className="block mb-1">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="focus-ring w-full border border-[var(--border)] bg-[var(--background)] p-2.5 font-normal text-sm"
                  placeholder="Tell peers about your background and approach..."
                />
              </div>

              <div>
                <label className="block mb-1">Avatar Image URL (Optional)</label>
                <Input value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://..." />
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-3xl">Preferences & Availability</h2>
            <div className="mt-4 grid gap-3.5 text-sm font-bold">
              <div>
                <label className="block mb-1">Availability</label>
                <Input
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  placeholder="e.g. Evenings, 2 hrs/week, Weekends"
                />
              </div>

              <div>
                <label className="block mb-1">Learning Style</label>
                <Input
                  value={learningStyle}
                  onChange={(e) => setLearningStyle(e.target.value)}
                  placeholder="e.g. Pair programming, structured feedback, casual practice"
                />
              </div>

              <div>
                <label className="block mb-1">Exchange Format Preference</label>
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

              <div>
                <label className="block mb-1">Interests (Comma Separated)</label>
                <Input
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="e.g. open-source, photography, design, languages"
                />
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <h2 className="font-display text-3xl">Skills I Can Teach (Offers)</h2>
            <Button type="button" variant="secondary" onClick={handleAddOfferedSkill} className="text-xs">
              <Plus size={14} className="mr-1 inline" /> Add Skill
            </Button>
          </div>

          <div className="mt-4 grid gap-4">
            {offeredSkills.map((sk, idx) => (
              <div key={idx} className="p-3 border border-[var(--border)] bg-[var(--surface-muted)] grid sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-4">
                  <label className="block text-xs font-bold mb-1">Skill Name</label>
                  <Input
                    value={sk.name}
                    onChange={(e) => {
                      const updated = [...offeredSkills];
                      updated[idx].name = e.target.value;
                      setOfferedSkills(updated);
                    }}
                    placeholder="e.g. Python Automation"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold mb-1">Category</label>
                  <select
                    value={sk.categoryId}
                    onChange={(e) => {
                      const updated = [...offeredSkills];
                      updated[idx].categoryId = e.target.value;
                      setOfferedSkills(updated);
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
                      const updated = [...offeredSkills];
                      updated[idx].level = e.target.value as SkillLevel;
                      setOfferedSkills(updated);
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
                  {offeredSkills.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOfferedSkill(idx)}
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
            <h2 className="font-display text-3xl">Skills I Want to Learn (Requests)</h2>
            <Button type="button" variant="secondary" onClick={handleAddWantedSkill} className="text-xs">
              <Plus size={14} className="mr-1 inline" /> Add Skill
            </Button>
          </div>

          <div className="mt-4 grid gap-4">
            {wantedSkills.map((sk, idx) => (
              <div key={idx} className="p-3 border border-[var(--border)] bg-[var(--surface-muted)] grid sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-4">
                  <label className="block text-xs font-bold mb-1">Skill Name</label>
                  <Input
                    value={sk.name}
                    onChange={(e) => {
                      const updated = [...wantedSkills];
                      updated[idx].name = e.target.value;
                      setWantedSkills(updated);
                    }}
                    placeholder="e.g. Spanish Conversation"
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
                      onClick={() => handleRemoveWantedSkill(idx)}
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

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" href={`/profile/${username}`}>
            Cancel
          </Button>
          <Button type="submit">Save Profile Changes</Button>
        </div>
      </form>
    </PageContainer>
  );
}
