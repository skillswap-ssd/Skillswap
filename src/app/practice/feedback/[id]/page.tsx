"use client";

import React, { use } from "react";
import Link from "next/link";
import { usePractice } from "@/lib/context/practice-context";
import { useSkillSwap } from "@/lib/context/skillswap-context";
import { getRelatedSkillsForSkill } from "@/lib/skillRelations";

export default function PracticeFeedbackPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { getSessionById, getSessionFeedback, getPersonById } = usePractice();
  const { users, skills, offers } = useSkillSwap();

  const session = getSessionById(resolvedParams.id);
  const feedback = getSessionFeedback(resolvedParams.id);
  const person = session ? getPersonById(session.simulatedPersonId) : undefined;

  if (!session || !feedback || !person) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="font-serif text-2xl font-bold text-[#1c2430]">Feedback Not Found</h1>
        <p className="mt-2 text-sm text-[#64748b]">The feedback summary for this session could not be found.</p>
        <Link
          href="/practice"
          className="mt-6 inline-block rounded-lg bg-[#1c2430] px-4 py-2 text-sm font-semibold text-white"
        >
          Return to Practice Center
        </Link>
      </div>
    );
  }

  // Find exact real SkillSwap opportunities matching the session topic
  const targetTopicLower = session.topic.toLowerCase();
  const directSkill = skills.find(
    (s) => s.name.toLowerCase() === targetTopicLower || s.id.toLowerCase() === targetTopicLower || targetTopicLower.includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(targetTopicLower)
  );

  // Get matching user offers for direct skill match
  let matchedUsers = directSkill
    ? offers
        .filter((o) => o.skillId === directSkill.id)
        .map((o) => users.find((u) => u.id === o.userId))
        .filter((u): u is typeof users[0] => Boolean(u))
    : [];

  // Deduplicate matched users
  matchedUsers = Array.from(new Set(matchedUsers));

  // If no exact match, find genuine related skills
  let relatedSkillsList: { id: string; name: string }[] = [];
  if (matchedUsers.length === 0) {
    relatedSkillsList = getRelatedSkillsForSkill(session.topic, skills);
    if (relatedSkillsList.length > 0) {
      const relatedSkillIds = new Set(relatedSkillsList.map((r) => r.id));
      const relatedOffers = offers.filter((o) => relatedSkillIds.has(o.skillId));
      matchedUsers = Array.from(
        new Set(
          relatedOffers
            .map((o) => users.find((u) => u.id === o.userId))
            .filter((u): u is typeof users[0] => Boolean(u))
        )
      );
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      {/* Header */}
      <div className="rounded-xl border border-[#e2ded8] bg-[#f7f5f0] p-6 text-[#1c2430] sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded bg-[#1c2430] px-2.5 py-0.5 text-xs font-semibold text-white">
                PRACTICE FEEDBACK
              </span>
              <span className="text-xs text-[#64748b]">{session.topic}</span>
            </div>
            <h1 className="font-serif text-3xl font-bold text-[#1c2430]">Session Performance Summary</h1>
            <p className="mt-1 text-sm text-[#64748b]">
              Evaluated based on practice interaction data with <strong className="text-[#1c2430]">{person.name}</strong>.
            </p>
          </div>
          <Link
            href="/practice/history"
            className="rounded-lg border border-[#e2ded8] bg-white px-4 py-2 text-xs font-semibold text-[#1c2430] hover:bg-[#f0ece1]"
          >
            All Practice Logs
          </Link>
        </div>
      </div>

      {/* Readiness Score Breakdown */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div className="rounded-xl border border-[#e2ded8] bg-white p-6 text-center shadow-sm sm:col-span-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">Practice Readiness</div>
          <div className="mt-3 font-serif text-5xl font-bold text-[#1c2430]">{feedback.readinessScore}</div>
          <p className="mt-2 text-xs text-[#64748b]">Out of 100 metric scale</p>
        </div>

        <div className="rounded-xl border border-[#e2ded8] bg-white p-6 shadow-sm sm:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="text-xs font-medium text-[#64748b]">Clarity</div>
            <div className="font-serif text-2xl font-bold text-[#1c2430]">{feedback.clarityScore}%</div>
            <p className="text-[11px] text-[#64748b]">Explanation structure</p>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-[#64748b]">Technical Depth</div>
            <div className="font-serif text-2xl font-bold text-[#1c2430]">{feedback.technicalScore}%</div>
            <p className="text-[11px] text-[#64748b]">Concept coverage</p>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-[#64748b]">Confidence</div>
            <div className="font-serif text-2xl font-bold text-[#1c2430]">{feedback.confidenceScore}%</div>
            <p className="text-[11px] text-[#64748b]">Dialogue rhythm</p>
          </div>
        </div>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-[#e2ded8] bg-white p-6 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-[#1c2430] flex items-center gap-2">
            <span className="text-emerald-700">✓</span> What Went Well
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-[#1c2430]">
            {feedback.strengths.map((str, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-[#e2ded8] bg-white p-6 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-[#1c2430] flex items-center gap-2">
            <span className="text-amber-700">⚡</span> Areas to Refine
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-[#1c2430]">
            {feedback.improvements.map((imp, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* BRIDGE: Practice -> Real SkillSwap Opportunities */}
      <div className="rounded-xl border-2 border-[#1c2430] bg-[#f7f5f0] p-6 shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <span className="rounded bg-[#1c2430] px-2.5 py-0.5 text-xs font-semibold text-white">
            COMMUNITY OPPORTUNITIES
          </span>
        </div>

        {matchedUsers.length > 0 ? (
          <>
            <h2 className="font-serif text-2xl font-bold text-[#1c2430]">
              Connect with real SkillSwap members in {session.topic}
            </h2>
            <p className="mt-1 text-sm text-[#64748b]">
              Now that you&apos;ve completed simulated practice, exchange skills directly with real student peers.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {matchedUsers.slice(0, 2).map((mUser) => (
                <div key={mUser.id} className="rounded-lg border border-[#e2ded8] bg-white p-4 flex items-center gap-3">
                  <img
                    src={mUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80"}
                    alt={mUser.name}
                    className="h-12 w-12 rounded-full border border-[#e2ded8] object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-serif text-base font-bold text-[#1c2430]">{mUser.name}</h4>
                    <p className="text-xs text-[#64748b]">Community Member • {mUser.completedSwaps} swaps completed</p>
                    <Link
                      href={`/profile/${mUser.username}`}
                      className="mt-1 inline-block text-xs font-semibold text-[#1c2430] underline"
                    >
                      View Community Profile →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-[#1c2430]">
              No direct SkillSwap found yet.
            </h2>
            <p className="text-sm text-[#64748b]">
              No active community members are currently offering exact or related swaps in <strong>{session.topic}</strong>.
            </p>

            {relatedSkillsList.length > 0 && (
              <div className="mt-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#64748b] block mb-2">
                  Genuinely Related Skills:
                </span>
                <div className="flex flex-wrap gap-2">
                  {relatedSkillsList.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/discover?q=${encodeURIComponent(rel.name)}`}
                      className="rounded bg-white border border-[#e2ded8] px-3 py-1 text-xs font-semibold text-[#1c2430] hover:bg-[#f0ece1]"
                    >
                      Explore {rel.name} →
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3 pt-4 border-t border-[#e2ded8]">
          <Link
            href="/discover"
            className="rounded-lg bg-[#1c2430] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2d3748] transition"
          >
            Return to Discovery
          </Link>
          <Link
            href="/profile/edit"
            className="rounded-lg border border-[#e2ded8] bg-white px-4 py-2 text-xs font-semibold text-[#1c2430] hover:bg-[#f0ece1] transition"
          >
            Edit Learning Goals
          </Link>
          <Link
            href="/practice"
            className="rounded-lg border border-[#e2ded8] bg-white px-4 py-2 text-xs font-semibold text-[#1c2430] hover:bg-[#f0ece1] transition"
          >
            Continue Practicing
          </Link>
        </div>
      </div>
    </div>
  );
}
