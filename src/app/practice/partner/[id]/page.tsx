"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { usePractice } from "@/lib/context/practice-context";
import type { PracticeMode } from "@/data/models";

export default function PartnerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialScenarioId = searchParams.get("scenarioId") || "";

  const { getPersonById, getPersonScenarios, startNewSession } = usePractice();
  const person = getPersonById(resolvedParams.id);
  const scenarios = getPersonScenarios(resolvedParams.id);

  const [selectedTopic, setSelectedTopic] = useState(person?.practiceTopics[0] || "General Practice");
  const [selectedMode, setSelectedMode] = useState<PracticeMode>("practice");
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(initialScenarioId);
  const [customGoal, setCustomGoal] = useState("");

  if (!person) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="font-serif text-2xl font-bold text-[#1c2430]">Partner Not Found</h1>
        <p className="mt-2 text-sm text-[#64748b]">The requested practice partner could not be found.</p>
        <Link
          href="/practice"
          className="mt-6 inline-block rounded-lg bg-[#1c2430] px-4 py-2 text-sm font-semibold text-white"
        >
          Return to Practice Center
        </Link>
      </div>
    );
  }

  const handleStartSession = (e: React.FormEvent) => {
    e.preventDefault();
    const session = startNewSession({
      simulatedPersonId: person.id,
      topic: selectedTopic,
      mode: selectedMode,
      scenarioId: selectedScenarioId || undefined,
      goal: customGoal || undefined,
    });

    router.push(`/practice/session/${session.id}`);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      {/* Breadcrumb / Back */}
      <div className="flex items-center gap-2 text-xs text-[#64748b]">
        <Link href="/practice" className="hover:text-[#1c2430]">
          Practice Center
        </Link>
        <span>/</span>
        <span className="text-[#1c2430] font-medium">{person.name}</span>
      </div>

      {/* Profile Header */}
      <div className="rounded-xl border border-[#e2ded8] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <img
            src={person.avatar}
            alt={person.name}
            className="h-24 w-24 rounded-full border-2 border-[#e2ded8] object-cover"
          />
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-serif text-3xl font-bold text-[#1c2430]">{person.name}</h1>
              <span className="rounded border border-[#e2ded8] bg-[#f7f5f0] px-2.5 py-0.5 text-xs font-semibold text-[#1c2430]">
                SIMULATED
              </span>
              <span className="rounded bg-[#1c2430] px-2.5 py-0.5 text-xs font-semibold text-white">
                {person.badgeLabel}
              </span>
            </div>
            <p className="text-sm font-medium text-[#64748b]">
              Difficulty: <span className="text-[#1c2430]">{person.difficulty}</span> • Role:{" "}
              <span className="text-[#1c2430] capitalize">{person.role}</span>
            </p>
            <p className="text-sm text-[#1c2430] max-w-2xl">{person.shortBio}</p>
          </div>
        </div>

        {/* Detailed Characteristics Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 border-t border-[#e2ded8] pt-6 sm:grid-cols-2">
          <div>
            <h3 className="font-serif text-sm font-bold text-[#1c2430]">Communication Style</h3>
            <p className="mt-1 text-xs text-[#64748b] leading-relaxed">{person.communicationStyle}</p>
          </div>
          <div>
            <h3 className="font-serif text-sm font-bold text-[#1c2430]">Personality & Approach</h3>
            <p className="mt-1 text-xs text-[#64748b] leading-relaxed">{person.personality}</p>
          </div>
          <div>
            <h3 className="font-serif text-sm font-bold text-[#1c2430]">Key Strengths</h3>
            <ul className="mt-1 list-disc list-inside text-xs text-[#64748b] space-y-0.5">
              {person.strengths.map((str, i) => (
                <li key={i}>{str}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-serif text-sm font-bold text-[#1c2430]">Simulated Scope</h3>
            <ul className="mt-1 list-disc list-inside text-xs text-[#64748b] space-y-0.5">
              {person.limitations.map((lim, i) => (
                <li key={i}>{lim}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Session Setup Form */}
      <div className="rounded-xl border border-[#e2ded8] bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-serif text-xl font-bold text-[#1c2430]">Configure Practice Session</h2>
        <p className="mt-1 text-sm text-[#64748b]">Select your desired topic, practice mode, and goal.</p>

        <form onSubmit={handleStartSession} className="mt-6 space-y-6">
          {/* Topic Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#1c2430]">
              Practice Topic
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {person.practiceTopics.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => setSelectedTopic(topic)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    selectedTopic === topic
                      ? "bg-[#1c2430] text-white"
                      : "border border-[#e2ded8] bg-[#f7f5f0] text-[#1c2430] hover:bg-[#f0ece1]"
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#1c2430]">
              Practice Mode
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(["practice", "learn", "teach", "interview", "scenario"] as PracticeMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSelectedMode(mode)}
                  className={`rounded-lg p-3 text-left transition ${
                    selectedMode === mode
                      ? "border-2 border-[#1c2430] bg-[#f7f5f0]"
                      : "border border-[#e2ded8] bg-white hover:bg-[#f7f5f0]"
                  }`}
                >
                  <div className="text-xs font-bold capitalize text-[#1c2430]">{mode}</div>
                  <div className="text-[11px] text-[#64748b]">
                    {mode === "learn" && "Partner explains concepts"}
                    {mode === "practice" && "Interactive Q&A exchange"}
                    {mode === "teach" && "Explain to a beginner"}
                    {mode === "interview" && "Technical interview format"}
                    {mode === "scenario" && "Structured roleplay scenario"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Scenarios Option (if any exist for partner) */}
          {scenarios.length > 0 && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1c2430]">
                Roleplay Scenario (Optional)
              </label>
              <select
                value={selectedScenarioId}
                onChange={(e) => {
                  setSelectedScenarioId(e.target.value);
                  const found = scenarios.find((s) => s.id === e.target.value);
                  if (found) {
                    setSelectedTopic(found.topic);
                    setSelectedMode(found.mode);
                  }
                }}
                className="mt-2 w-full rounded-lg border border-[#e2ded8] bg-white p-2.5 text-sm text-[#1c2430] focus:border-[#1c2430] focus:outline-none"
              >
                <option value="">No scenario (open practice)</option>
                {scenarios.map((scen) => (
                  <option key={scen.id} value={scen.id}>
                    {scen.title} ({scen.difficulty})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Optional Goal */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#1c2430]">
              Session Goal (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Prepare for upcoming technical interview next week"
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              className="mt-2 w-full rounded-lg border border-[#e2ded8] bg-white p-2.5 text-sm text-[#1c2430] focus:border-[#1c2430] focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-[#e2ded8] flex items-center justify-between">
            <span className="text-xs text-[#64748b]">
              Starts an interactive local practice conversation
            </span>
            <button
              type="submit"
              className="rounded-lg bg-[#1c2430] px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#2d3748] transition"
            >
              Start Practice Session →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
