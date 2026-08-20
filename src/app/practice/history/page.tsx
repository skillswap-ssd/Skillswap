"use client";

import React from "react";
import Link from "next/link";
import { usePractice } from "@/lib/context/practice-context";

export default function PracticeHistoryPage() {
  const { sessions, feedbacks, simulatedPeople } = usePractice();

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e2ded8] pb-6">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded bg-[#1c2430] px-2 py-0.5 text-xs font-semibold text-white">
              SIMULATED PRACTICE LOG
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#1c2430]">Practice History</h1>
          <p className="mt-1 text-sm text-[#64748b]">
            Review past simulated practice sessions, readiness ratings, and feedback summaries.
          </p>
        </div>
        <Link
          href="/practice"
          className="rounded-lg bg-[#1c2430] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2d3748] transition"
        >
          New Practice Session
        </Link>
      </div>

      {/* History List */}
      {sessions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#e2ded8] bg-[#f7f5f0] p-12 text-center">
          <h3 className="font-serif text-lg font-bold text-[#1c2430]">No Practice History Yet</h3>
          <p className="mt-2 text-sm text-[#64748b] max-w-md mx-auto">
            Start a session with a practice partner to build confidence before swapping skills with real peers.
          </p>
          <Link
            href="/practice"
            className="mt-6 inline-block rounded-lg bg-[#1c2430] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2d3748]"
          >
            Start Your First Practice Session
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const person = simulatedPeople.find((p) => p.id === session.simulatedPersonId);
            const feedback = feedbacks.find((f) => f.sessionId === session.id);

            return (
              <div
                key={session.id}
                className="flex flex-col justify-between rounded-xl border border-[#e2ded8] bg-white p-6 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={person?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80"}
                    alt={person?.name}
                    className="h-12 w-12 rounded-full border border-[#e2ded8] object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-base font-bold text-[#1c2430]">{session.topic}</h3>
                      <span className="rounded bg-[#f7f5f0] border border-[#e2ded8] px-2 py-0.5 text-xs text-[#1c2430]">
                        {session.mode}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748b]">
                      Partner: {person?.name || "Practice Partner"} (SIMULATED) •{" "}
                      {new Date(session.startedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4 border-t border-[#e2ded8] pt-4 sm:mt-0 sm:border-0 sm:pt-0">
                  {feedback ? (
                    <div className="text-right">
                      <div className="text-xs text-[#64748b]">Readiness</div>
                      <div className="font-serif text-lg font-bold text-[#1c2430]">
                        {feedback.readinessScore}/100
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-[#64748b]">Session Active</span>
                  )}

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/practice/session/${session.id}`}
                      className="rounded-lg border border-[#e2ded8] bg-white px-3 py-1.5 text-xs font-semibold text-[#1c2430] hover:bg-[#f0ece1]"
                    >
                      View Chat
                    </Link>
                    <Link
                      href={`/practice/feedback/${session.id}`}
                      className="rounded-lg bg-[#1c2430] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2d3748]"
                    >
                      Feedback Summary
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
