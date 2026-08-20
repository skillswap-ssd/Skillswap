"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePractice } from "@/lib/context/practice-context";
import type { PracticeMode, SimulatedRole } from "@/data/models";

const CATEGORIES: { id: SimulatedRole | "all"; label: string; desc: string }[] = [
  { id: "all", label: "All Partners", desc: "View all practice partners" },
  { id: "mentor", label: "Learn", desc: "Patient guidance & concept breakdown" },
  { id: "peer", label: "Practice", desc: "Collaborative skill exchange" },
  { id: "beginner", label: "Teach", desc: "Practice explaining to a beginner" },
  { id: "interviewer", label: "Interview", desc: "Structured interview questions" },
  { id: "client", label: "Explore Scenarios", desc: "Client meetings & pitches" },
];

export default function PracticeCenterPage() {
  const { simulatedPeople, scenarios, sessions, getPracticeProgressBySkill } = usePractice();
  const [selectedCategory, setSelectedCategory] = useState<SimulatedRole | "all">("all");

  const filteredPeople = simulatedPeople.filter(
    (p) => selectedCategory === "all" || p.role === selectedCategory
  );

  const skillProgress = getPracticeProgressBySkill();
  const recentSessions = sessions.slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      {/* Banner / Header */}
      <div className="rounded-xl border border-[#e2ded8] bg-[#f7f5f0] p-6 text-[#1c2430] sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded bg-[#1c2430] px-2.5 py-0.5 text-xs font-semibold tracking-wide text-white">
                SIMULATED PRACTICE CENTER
              </span>
              <span className="text-xs text-[#64748b]">Safe, private environment</span>
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-[#1c2430] sm:text-4xl">
              Practice before you SkillSwap
            </h1>
            <p className="mt-2 max-w-2xl text-base text-[#64748b]">
              Sharpen your skills, rehearse technical interviews, or practice teaching with AI-simulated partners — then take your confidence directly into the community.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/practice/history"
              className="rounded-lg border border-[#e2ded8] bg-white px-4 py-2 text-sm font-medium text-[#1c2430] hover:bg-[#f0ece1] transition"
            >
              Practice History
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Progress Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#e2ded8] bg-white p-5 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wider text-[#64748b]">Total Sessions</div>
          <div className="mt-1 font-serif text-3xl font-bold text-[#1c2430]">{sessions.length}</div>
          <p className="mt-1 text-xs text-[#64748b]">Local practice activity</p>
        </div>
        <div className="rounded-xl border border-[#e2ded8] bg-white p-5 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wider text-[#64748b]">Skills Practiced</div>
          <div className="mt-1 font-serif text-3xl font-bold text-[#1c2430]">{Object.keys(skillProgress).length}</div>
          <p className="mt-1 text-xs text-[#64748b]">Topics explored</p>
        </div>
        <div className="rounded-xl border border-[#e2ded8] bg-white p-5 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wider text-[#64748b]">Available Scenarios</div>
          <div className="mt-1 font-serif text-3xl font-bold text-[#1c2430]">{scenarios.length}</div>
          <p className="mt-1 text-xs text-[#64748b]">Interactive roleplay scenarios</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl font-bold text-[#1c2430]">Select a Practice Partner</h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                selectedCategory === cat.id
                  ? "bg-[#1c2430] text-white"
                  : "border border-[#e2ded8] bg-white text-[#1c2430] hover:bg-[#f0ece1]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Simulated Partners List */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {filteredPeople.map((person) => (
          <div
            key={person.id}
            className="flex flex-col justify-between rounded-xl border border-[#e2ded8] bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div>
              <div className="flex items-start gap-4">
                <img
                  src={person.avatar}
                  alt={person.name}
                  className="h-16 w-16 rounded-full border border-[#e2ded8] object-cover"
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-serif text-xl font-bold text-[#1c2430]">{person.name}</h3>
                    <span className="rounded border border-[#e2ded8] bg-[#f7f5f0] px-2 py-0.5 text-xs font-semibold text-[#1c2430]">
                      SIMULATED
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs font-medium text-[#64748b]">
                    {person.badgeLabel} • {person.difficulty}
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm text-[#1c2430]">{person.shortBio}</p>

              <div className="mt-4 space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-[#1c2430]">Specialties: </span>
                  <span className="text-[#64748b]">{person.expertise.join(", ")}</span>
                </div>
                <div>
                  <span className="font-semibold text-[#1c2430]">Style: </span>
                  <span className="text-[#64748b]">{person.communicationStyle}</span>
                </div>
              </div>

              {/* Practice topics */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {person.practiceTopics.map((topic, i) => (
                  <span
                    key={i}
                    className="rounded bg-[#f7f5f0] px-2 py-0.5 text-xs text-[#1c2430] border border-[#e2ded8]"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-[#e2ded8] pt-4">
              <span className="text-xs text-[#64748b]">Practice Partner</span>
              <Link
                href={`/practice/partner/${person.id}`}
                className="rounded-lg bg-[#1c2430] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2d3748] transition"
              >
                View & Practice →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Featured Scenarios */}
      <div className="rounded-xl border border-[#e2ded8] bg-white p-6 shadow-sm">
        <h2 className="font-serif text-xl font-bold text-[#1c2430]">Featured Practice Scenarios</h2>
        <p className="mt-1 text-sm text-[#64748b]">Step into realistic roleplay situations designed for skill growth.</p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {scenarios.map((scen) => {
            const person = simulatedPeople.find((p) => p.id === scen.simulatedPersonId);
            return (
              <div
                key={scen.id}
                className="rounded-lg border border-[#e2ded8] bg-[#f7f5f0] p-4 transition hover:bg-[#f0ece1]"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded bg-white px-2 py-0.5 text-xs font-semibold text-[#1c2430] border border-[#e2ded8]">
                    {scen.difficulty}
                  </span>
                  <span className="text-xs font-medium text-[#64748b]">{scen.topic}</span>
                </div>
                <h3 className="mt-2 font-serif text-base font-bold text-[#1c2430]">{scen.title}</h3>
                <p className="mt-1 text-xs text-[#64748b]">{scen.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-[#64748b]">Partner: {person?.name || "Practice Partner"}</span>
                  <Link
                    href={`/practice/partner/${scen.simulatedPersonId}?scenarioId=${scen.id}`}
                    className="text-xs font-semibold text-[#1c2430] underline hover:text-[#2d3748]"
                  >
                    Start Scenario →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
