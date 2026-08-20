"use client";

import React, { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePractice } from "@/lib/context/practice-context";

export default function PracticeSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    getSessionById,
    getSessionMessages,
    getPersonById,
    getScenarioById,
    sendPracticeMessage,
    finishPracticeSession,
  } = usePractice();

  const session = getSessionById(resolvedParams.id);
  const messages = getSessionMessages(resolvedParams.id);
  const person = session ? getPersonById(session.simulatedPersonId) : undefined;
  const scenario = session?.scenarioId ? getScenarioById(session.scenarioId) : undefined;

  const [input, setInput] = useState("");
  const [isEnding, setIsEnding] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!session || !person) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="font-serif text-2xl font-bold text-[#1c2430]">Session Not Found</h1>
        <p className="mt-2 text-sm text-[#64748b]">The practice session could not be retrieved.</p>
        <Link
          href="/practice"
          className="mt-6 inline-block rounded-lg bg-[#1c2430] px-4 py-2 text-sm font-semibold text-white"
        >
          Return to Practice Center
        </Link>
      </div>
    );
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || session.status === "completed") return;

    sendPracticeMessage(session.id, input);
    setInput("");
  };

  const handleFinish = () => {
    setIsEnding(true);
    const feedback = finishPracticeSession(session.id);
    if (feedback) {
      router.push(`/practice/feedback/${session.id}`);
    } else {
      router.push("/practice/history");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 flex flex-col h-[calc(100vh-6rem)]">
      {/* Session Top Bar */}
      <div className="rounded-t-xl border border-[#e2ded8] bg-[#f7f5f0] p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={person.avatar}
            alt={person.name}
            className="h-10 w-10 rounded-full border border-[#e2ded8] object-cover"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-base font-bold text-[#1c2430]">{person.name}</span>
              <span className="rounded bg-[#1c2430] px-2 py-0.5 text-[10px] font-semibold text-white tracking-wide">
                SIMULATED PRACTICE
              </span>
            </div>
            <p className="text-xs text-[#64748b]">
              Topic: <span className="font-medium text-[#1c2430]">{session.topic}</span> • Mode:{" "}
              <span className="font-medium text-[#1c2430] capitalize">{session.mode}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/practice/partner/${person.id}`}
            className="text-xs font-medium text-[#64748b] hover:text-[#1c2430]"
          >
            Restart / Change
          </Link>
          <button
            onClick={handleFinish}
            disabled={isEnding}
            className="rounded-lg bg-[#1c2430] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#2d3748] transition disabled:opacity-50"
          >
            {isEnding ? "Ending..." : "End & Get Feedback →"}
          </button>
        </div>
      </div>

      {/* Scenario Banner if active */}
      {scenario && (
        <div className="border-x border-[#e2ded8] bg-[#fffdfa] px-4 py-2.5 text-xs text-[#1c2430] flex items-center justify-between">
          <span>
            <strong className="font-semibold">Scenario:</strong> {scenario.title} — {scenario.description}
          </span>
        </div>
      )}

      {/* Live Conversation Stream */}
      <div
        className="flex-1 overflow-y-auto border-x border-[#e2ded8] bg-white p-4 space-y-4"
        aria-live="polite"
        aria-label="Practice conversation transcript"
      >
        <div className="text-center my-2">
          <span className="rounded-full bg-[#f7f5f0] border border-[#e2ded8] px-3 py-1 text-[11px] text-[#64748b]">
            Practice Session Started • Safe local simulation environment
          </span>
        </div>

        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-[11px] text-[#64748b]">
                <span>{isUser ? "You" : person.name}</span>
                {!isUser && (
                  <span className="rounded bg-[#e2ded8] px-1.5 py-0.2 text-[9px] font-bold text-[#1c2430]">
                    SIM
                  </span>
                )}
              </div>
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  isUser
                    ? "bg-[#1c2430] text-white rounded-br-none"
                    : "bg-[#f7f5f0] border border-[#e2ded8] text-[#1c2430] rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Composer Footer */}
      <div className="rounded-b-xl border border-[#e2ded8] bg-[#f7f5f0] p-3">
        {session.status === "completed" ? (
          <div className="text-center py-2 text-xs text-[#64748b]">
            This practice session has ended.{" "}
            <Link
              href={`/practice/feedback/${session.id}`}
              className="font-bold text-[#1c2430] underline"
            >
              View Feedback Summary
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              type="text"
              placeholder={`Respond to ${person.name}...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-lg border border-[#e2ded8] bg-white px-3.5 py-2.5 text-sm text-[#1c2430] focus:border-[#1c2430] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="rounded-lg bg-[#1c2430] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#2d3748] transition disabled:opacity-50"
            >
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
