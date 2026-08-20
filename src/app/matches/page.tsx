"use client";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { RecommendationReason } from "@/components/shared/recommendation-reason";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { useSkillSwap } from "@/lib/context/skillswap-context";
import { computeMatches, type ComputedMatch } from "@/lib/matching";
import { ArrowLeftRight, CheckCircle2, MessageSquare, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function MatchesPage() {
  const { currentUserId, users, profiles, skills, offers, requests, createSwapRequest, getOrCreateConversation } =
    useSkillSwap();

  const [selectedMatch, setSelectedMatch] = useState<ComputedMatch | null>(null);
  const [requestModalMatch, setRequestModalMatch] = useState<ComputedMatch | null>(null);

  const [offeredSkillId, setOfferedSkillId] = useState("");
  const [requestedSkillId, setRequestedSkillId] = useState("");
  const [messageText, setMessageText] = useState("");
  const [preferredFormat, setPreferredFormat] = useState<"remote" | "in-person" | "hybrid">("remote");
  const [submittedMessage, setSubmittedMessage] = useState(false);

  const matches = computeMatches(currentUserId, users, profiles, skills, offers, requests);

  const currentUserOffers = offers.filter((o) => o.userId === currentUserId);
  const currentUserRequests = requests.filter((r) => r.userId === currentUserId);

  const openSwapModal = (match: ComputedMatch) => {
    const defaultOffered = match.wantedByThem[0]?.id || currentUserOffers[0]?.skillId || "";
    const defaultRequested = match.offeredByThem[0]?.id || currentUserRequests[0]?.skillId || "";

    setOfferedSkillId(defaultOffered);
    setRequestedSkillId(defaultRequested);
    setMessageText(`Hi ${match.user.name.split(" ")[0]}! I saw our skills match on SkillSwap and would love to exchange sessions.`);
    setRequestModalMatch(match);
    setSubmittedMessage(false);
  };

  const handleSendSwapRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestModalMatch || !offeredSkillId || !requestedSkillId) return;

    createSwapRequest({
      recipientId: requestModalMatch.user.id,
      offeredSkillId,
      requestedSkillId,
      message: messageText,
      preferredFormat,
    });

    setSubmittedMessage(true);
    setTimeout(() => {
      setRequestModalMatch(null);
      setSubmittedMessage(false);
    }, 1200);
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Complementary Matches"
        title="People with reciprocal skill synergy."
        body="Deterministic skill-exchange matching based on what you teach and what others want to learn."
      />

      <div className="grid gap-6">
        {matches.map((match) => {
          const userOffers = offers.filter((o) => o.userId === match.user.id);
          const userRequests = requests.filter((r) => r.userId === match.user.id);

          const offerSkillNames = userOffers
            .map((o) => skills.find((s) => s.id === o.skillId)?.name)
            .filter(Boolean)
            .join(", ");

          const requestSkillNames = userRequests
            .map((r) => skills.find((s) => s.id === r.skillId)?.name)
            .filter(Boolean)
            .join(", ");

          const myTeachName = match.wantedByThem[0]?.name || "Your skills";
          const myLearnName = match.offeredByThem[0]?.name || "Their skills";

          return (
            <Card key={match.id} className="grid gap-5 lg:grid-cols-[1fr_auto] items-start">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge>
                    {match.quality}
                  </Badge>
                  <span className="text-xs font-bold text-[var(--muted)]">
                    {match.user.location} · {match.user.reputation}★ rating
                  </span>
                </div>

                <div className="mt-3 flex items-start gap-4">
                  <Avatar name={match.user.name} />
                  <div>
                    <h3 className="font-display text-2xl">
                      <Link href={`/profile/${match.user.username}`} className="hover:underline">
                        {match.user.name}
                      </Link>{" "}
                      <span className="text-sm font-normal text-[var(--muted)]">@{match.user.username}</span>
                    </h3>
                    <p className="text-sm font-medium">{match.profile.headline}</p>
                  </div>
                </div>

                {/* Smart Match Breakdown */}
                <div className="mt-4 border-l-4 border-[var(--primary)] bg-[var(--surface-muted)] p-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[var(--primary)] uppercase tracking-wider">
                    <Sparkles size={14} /> Smart Match Explanation
                  </div>

                  <p className="text-xs font-bold text-[var(--foreground)]">{match.reason}</p>

                  <div className="grid sm:grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="p-2 border border-[var(--border)] bg-[var(--surface)]">
                      <span className="font-bold text-[var(--muted)] uppercase block text-[10px]">You teach → They want</span>
                      <span className="font-bold text-[var(--primary)]">{myTeachName}</span>
                    </div>

                    <div className="p-2 border border-[var(--border)] bg-[var(--surface)]">
                      <span className="font-bold text-[var(--muted)] uppercase block text-[10px]">They teach → You want</span>
                      <span className="font-bold text-[var(--primary)]">{myLearnName}</span>
                    </div>
                  </div>

                  {match.explanation.length > 0 && (
                    <ul className="mt-2 list-disc list-inside text-xs text-[var(--muted)] space-y-0.5 pt-1">
                      {match.explanation.map((exp, idx) => (
                        <li key={idx}>{exp}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <span className="font-bold block text-xs text-[var(--muted)] uppercase tracking-wider">
                      They offer:
                    </span>
                    <span>{offerSkillNames || "Various skills"}</span>
                  </div>
                  <div>
                    <span className="font-bold block text-xs text-[var(--muted)] uppercase tracking-wider">
                      They want to learn:
                    </span>
                    <span>{requestSkillNames || "Various skills"}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 w-full lg:w-48 pt-2 border-t lg:border-t-0 lg:border-l border-[var(--border)] lg:pl-5">
                <Button onClick={() => openSwapModal(match)} className="w-full justify-center text-sm">
                  <ArrowLeftRight size={16} className="mr-2 inline" /> Start SkillSwap
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => setSelectedMatch(match)}
                  className="w-full justify-center text-sm"
                >
                  View match details
                </Button>

                <Link
                  href="/messages"
                  onClick={() => getOrCreateConversation(match.user.id)}
                  className="inline-flex items-center justify-center border border-[var(--border)] py-2 px-3 text-sm font-bold hover:bg-[var(--surface-muted)] text-center"
                >
                  <MessageSquare size={16} className="mr-2 inline" /> Send Message
                </Link>

                <Link
                  href={`/profile/${match.user.username}`}
                  className="text-center text-xs font-bold text-[var(--muted)] hover:text-[var(--foreground)] mt-1"
                >
                  View Profile →
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl">
            <Dialog title={`Match Breakdown: ${selectedMatch.user.name}`}>
              <div className="grid gap-4 py-2">
                <div className="p-3 border border-[var(--border)] bg-[var(--surface-muted)] text-sm">
                  <span className="font-bold block">{selectedMatch.quality}</span>
                  <p className="mt-1">{selectedMatch.reason}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="p-3 border border-[var(--border)]">
                    <span className="font-bold block mb-1 text-xs uppercase tracking-wider text-[var(--muted)]">
                      You Offer → They Want
                    </span>
                    {selectedMatch.wantedByThem.length > 0 ? (
                      selectedMatch.wantedByThem.map((s) => (
                        <div key={s.id} className="font-semibold text-[var(--primary)]">
                          • {s.name} ({s.level})
                        </div>
                      ))
                    ) : (
                      <span className="text-[var(--muted)]">No direct match listed</span>
                    )}
                  </div>

                  <div className="p-3 border border-[var(--border)]">
                    <span className="font-bold block mb-1 text-xs uppercase tracking-wider text-[var(--muted)]">
                      They Offer → You Want
                    </span>
                    {selectedMatch.offeredByThem.length > 0 ? (
                      selectedMatch.offeredByThem.map((s) => (
                        <div key={s.id} className="font-semibold text-[var(--primary)]">
                          • {s.name} ({s.level})
                        </div>
                      ))
                    ) : (
                      <span className="text-[var(--muted)]">No direct match listed</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-3">
                  <Button variant="secondary" onClick={() => setSelectedMatch(null)}>
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      const m = selectedMatch;
                      setSelectedMatch(null);
                      openSwapModal(m);
                    }}
                  >
                    Request SkillSwap
                  </Button>
                </div>
              </div>
            </Dialog>
          </div>
        </div>
      )}

      {requestModalMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl">
            <Dialog title={`Propose SkillSwap with ${requestModalMatch.user.name}`}>
              {submittedMessage ? (
                <div className="p-6 text-center space-y-3">
                  <CheckCircle2 size={40} className="mx-auto text-emerald-600" />
                  <h3 className="font-display text-2xl">SkillSwap Request Sent!</h3>
                  <p className="text-sm text-[var(--muted)]">
                    Your proposal has been sent to {requestModalMatch.user.name}. You can track it in Connections.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendSwapRequest} className="grid gap-4 text-sm py-2">
                  <div>
                    <label className="font-bold block mb-1">Skill You Want to Learn from {requestModalMatch.user.name.split(" ")[0]}</label>
                    <select
                      value={requestedSkillId}
                      onChange={(e) => setRequestedSkillId(e.target.value)}
                      className="focus-ring w-full border border-[var(--border)] bg-[var(--background)] p-2.5 font-bold"
                      required
                    >
                      <option value="">Select skill...</option>
                      {offers
                        .filter((o) => o.userId === requestModalMatch.user.id)
                        .map((o) => {
                          const s = skills.find((sk) => sk.id === o.skillId);
                          return (
                            <option key={o.id} value={o.skillId}>
                              {s?.name} ({o.level})
                            </option>
                          );
                        })}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Skill You Offer to Teach in Return</label>
                    <select
                      value={offeredSkillId}
                      onChange={(e) => setOfferedSkillId(e.target.value)}
                      className="focus-ring w-full border border-[var(--border)] bg-[var(--background)] p-2.5 font-bold"
                      required
                    >
                      <option value="">Select skill...</option>
                      {currentUserOffers.map((o) => {
                        const s = skills.find((sk) => sk.id === o.skillId);
                        return (
                          <option key={o.id} value={o.skillId}>
                            {s?.name} ({o.level})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Exchange Preference</label>
                    <select
                      value={preferredFormat}
                      onChange={(e) => setPreferredFormat(e.target.value as any)}
                      className="focus-ring w-full border border-[var(--border)] bg-[var(--background)] p-2.5 font-bold"
                    >
                      <option value="remote">Remote (Video session)</option>
                      <option value="in-person">In-Person</option>
                      <option value="hybrid">Flexible / Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Introductory Message</label>
                    <textarea
                      rows={3}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="focus-ring w-full border border-[var(--border)] bg-[var(--background)] p-2.5"
                      placeholder="Introduce yourself and explain what you hope to work on..."
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-2">
                    <Button type="button" variant="ghost" onClick={() => setRequestModalMatch(null)}>
                      Cancel
                    </Button>
                    <Button type="submit">Send SkillSwap Request</Button>
                  </div>
                </form>
              )}
            </Dialog>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
