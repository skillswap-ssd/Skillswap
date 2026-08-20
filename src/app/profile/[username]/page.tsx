"use client";

import { PageContainer } from "@/components/layout/page-container";
import { SkillCard } from "@/components/shared/skill-card";
import { RecommendationReason } from "@/components/shared/recommendation-reason";
import { ProfileStrength } from "@/components/shared/profile-strength";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useSkillSwap } from "@/lib/context/skillswap-context";
import { usePractice } from "@/lib/context/practice-context";
import { calculateProfileStrength, getRecommendedUsers } from "@/lib/recommendations";
import { ArrowLeftRight, Check, CheckCircle2, MessageSquare, Star, UserCheck, UserPlus, Sparkles, Bot } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);

  const {
    currentUserId,
    currentUser,
    users,
    profiles,
    offers,
    requests,
    skills,
    connections,
    reviews,
    sendConnectionRequest,
    getOrCreateConversation,
    createSwapRequest,
    trackViewedProfile,
  } = useSkillSwap();

  const { sessions, feedbacks } = usePractice();

  const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  const profile = profiles.find((p) => p.userId === user?.id);

  const isMe = user?.id === currentUserId;

  useEffect(() => {
    if (user && !isMe) {
      trackViewedProfile(user.id);
    }
  }, [user, isMe, trackViewedProfile]);

  const userOffers = offers.filter((o) => o.userId === user?.id);
  const userRequests = requests.filter((r) => r.userId === user?.id);

  const offeredSkills = userOffers
    .map((o) => skills.find((s) => s.id === o.skillId))
    .filter((s): s is typeof skills[0] => Boolean(s));

  const wantedSkills = userRequests
    .map((r) => skills.find((s) => s.id === r.skillId))
    .filter((s): s is typeof skills[0] => Boolean(s));

  const userReviews = reviews.filter((r) => r.recipientId === user?.id);

  const existingConn = connections.find(
    (c) =>
      (c.requesterId === currentUserId && c.recipientId === user?.id) ||
      (c.requesterId === user?.id && c.recipientId === currentUserId)
  );

  // Profile completeness calculation if viewing own profile
  const profileStrength = isMe
    ? calculateProfileStrength(currentUser, profiles.find((p) => p.userId === currentUserId), offers, requests)
    : null;

  // Profile Intelligence Overlap if viewing peer profile
  const recommendations = !isMe && user
    ? getRecommendedUsers(currentUserId, users, profiles, skills, offers, requests)
    : [];
  const peerRecommendation = recommendations.find((r) => r.user.id === user?.id);

  // SkillSwap Request Modal state
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [offeredSkillId, setOfferedSkillId] = useState("");
  const [requestedSkillId, setRequestedSkillId] = useState("");
  const [messageText, setMessageText] = useState("");
  const [swapSubmitted, setSwapSubmitted] = useState(false);

  const currentUserOffers = offers.filter((o) => o.userId === currentUserId);

  const openSwapModal = () => {
    const defaultOffered = currentUserOffers[0]?.skillId || "";
    const defaultRequested = userOffers[0]?.skillId || "";
    setOfferedSkillId(defaultOffered);
    setRequestedSkillId(defaultRequested);
    setMessageText(`Hi ${user?.name.split(" ")[0]}! I'd love to exchange skills on SkillSwap.`);
    setShowSwapModal(true);
    setSwapSubmitted(false);
  };

  const handleSendSwapRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !offeredSkillId || !requestedSkillId) return;

    createSwapRequest({
      recipientId: user.id,
      offeredSkillId,
      requestedSkillId,
      message: messageText,
      preferredFormat: profile?.preference || "remote",
    });

    setSwapSubmitted(true);
    setTimeout(() => {
      setShowSwapModal(false);
      setSwapSubmitted(false);
    }, 1200);
  };

  if (!user || !profile) {
    return (
      <PageContainer>
        <EmptyState
          title="Profile not found"
          body="The requested user profile does not exist or has been removed."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <section className="editorial">
        <div>
          <Avatar name={user.name} />
          <h1 className="font-display text-5xl md:text-6xl mt-2">{user.name}</h1>
          <p className="font-bold text-[var(--muted)] text-base mt-1">
            @{user.username} · {user.location}
          </p>
          {profile.headline && <p className="lede mt-2">{profile.headline}</p>}
          <p className="mt-3 text-sm leading-relaxed">{profile.bio}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            {isMe ? (
              <Button href="/profile/edit">Edit Profile</Button>
            ) : (
              <>
                <Button onClick={openSwapModal}>
                  <ArrowLeftRight size={16} className="mr-2 inline" /> Request SkillSwap
                </Button>

                <Link
                  href="/messages"
                  onClick={() => getOrCreateConversation(user.id)}
                  className="inline-flex items-center justify-center border border-[var(--border)] py-2 px-4 text-sm font-bold bg-[var(--surface-muted)] hover:bg-[var(--surface)] transition-colors"
                >
                  <MessageSquare size={16} className="mr-2 inline" /> Message
                </Link>

                {existingConn ? (
                  <span className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold border border-[var(--border)] bg-[var(--surface-muted)]">
                    {existingConn.status === "connected" ? (
                      <>
                        <UserCheck size={14} className="text-emerald-700" /> Connected
                      </>
                    ) : (
                      <>
                        <Check size={14} className="text-[var(--muted)]" /> Pending Connection
                      </>
                    )}
                  </span>
                ) : (
                  <Button variant="ghost" onClick={() => sendConnectionRequest(user.id)}>
                    <UserPlus size={16} className="mr-1 inline" /> Connect
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        <aside className="border-y border-[var(--foreground)] py-6 space-y-2 text-sm">
          <p className="flex items-center gap-1.5">
            <Star size={16} className="text-amber-600 fill-amber-500" />
            <b>{user.reputation}</b> Rating ({userReviews.length} {userReviews.length === 1 ? "review" : "reviews"})
          </p>
          <p>
            <b>{user.completedSwaps}</b> Completed SkillSwaps
          </p>
          <p>
            <b>{user.responseRate}%</b> Response Reliability
          </p>
          <p>
            <b>{user.availability}</b> Availability
          </p>
          <p>
            <b>{profile.learningStyle}</b> Learning Style
          </p>
          <p className="capitalize">
            <b>{profile.preference}</b> Format Preference
          </p>

          {user.interests.length > 0 && (
            <div className="mt-4 pt-2 border-t border-[var(--border)] flex flex-wrap gap-1.5">
              {user.interests.map((i) => (
                <Badge key={i}>{i}</Badge>
              ))}
            </div>
          )}
        </aside>
      </section>

      {/* Profile Completeness for Current User */}
      {isMe && profileStrength && (
        <section className="mt-8">
          <ProfileStrength completeness={profileStrength} />
        </section>
      )}

      {/* DISTINCT SECTION: Practice Activity (Separated from Community Reputation) */}
      {isMe && (
        <section className="mt-8 rounded-xl border border-[#e2ded8] bg-[#f7f5f0] p-6 text-[#1c2430]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded bg-[#1c2430] px-2.5 py-0.5 text-xs font-semibold text-white">
                  PRACTICE ACTIVITY
                </span>
                <span className="text-xs text-[#64748b]">Private practice metrics</span>
              </div>
              <h3 className="font-serif text-2xl font-bold">Your Practice Log</h3>
              <p className="text-xs text-[#64748b] mt-1">
                Separated from community reputation. Tracks local simulation sessions with AI practice partners.
              </p>
            </div>
            <Link
              href="/practice/history"
              className="rounded-lg border border-[#e2ded8] bg-white px-4 py-2 text-xs font-semibold text-[#1c2430] hover:bg-[#f0ece1]"
            >
              View Full Log ({sessions.length})
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#e2ded8]">
            <div className="bg-white p-3 rounded-lg border border-[#e2ded8]">
              <div className="text-[11px] font-semibold text-[#64748b] uppercase">Practice Sessions</div>
              <div className="font-serif text-2xl font-bold text-[#1c2430] mt-1">{sessions.length}</div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-[#e2ded8]">
              <div className="text-[11px] font-semibold text-[#64748b] uppercase">Feedback Evaluations</div>
              <div className="font-serif text-2xl font-bold text-[#1c2430] mt-1">{feedbacks.length}</div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-[#e2ded8]">
              <div className="text-[11px] font-semibold text-[#64748b] uppercase">Latest Readiness</div>
              <div className="font-serif text-2xl font-bold text-[#1c2430] mt-1">
                {feedbacks[0] ? `${feedbacks[0].readinessScore}/100` : "N/A"}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Contextual Overlap / Profile Intelligence for Peers */}
      {!isMe && peerRecommendation && (
        <section className="mt-8">
          <Card className="border-2 border-[var(--primary)] bg-[var(--surface)]">
            <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-[var(--primary)]">
              <Sparkles size={14} /> Good fit because...
            </div>
            <p className="text-sm font-semibold text-[var(--foreground)] mt-1">{peerRecommendation.primaryReason}</p>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 text-xs">
              <div className="p-2.5 border border-[var(--border)] bg-[var(--surface-muted)]">
                <span className="font-bold text-[var(--muted)] uppercase block text-[10px]">You may learn from them</span>
                <b className="text-sm font-display text-[var(--primary)]">
                  {peerRecommendation.offeredSkillNames.join(", ") || "Skills"}
                </b>
              </div>

              <div className="p-2.5 border border-[var(--border)] bg-[var(--surface-muted)]">
                <span className="font-bold text-[var(--muted)] uppercase block text-[10px]">You may offer them</span>
                <b className="text-sm font-display text-[var(--primary)]">
                  {peerRecommendation.wantedSkillNames.join(", ") || "Skills"}
                </b>
              </div>
            </div>

            {peerRecommendation.reasons.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {peerRecommendation.reasons.map((r, idx) => (
                  <RecommendationReason key={idx} reason={r.label} category={r.category} />
                ))}
              </div>
            )}
          </Card>
        </section>
      )}

      <h2 className="mt-12 font-display text-4xl">Skills Offered</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {offeredSkills.length > 0 ? (
          offeredSkills.map((s) => <SkillCard key={s.id} skill={s} mode="offer" />)
        ) : (
          <EmptyState title="No skills offered yet" body="This user has not listed any teachable skills." />
        )}
      </div>

      <h2 className="mt-12 font-display text-4xl">Wants to Learn</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {wantedSkills.length > 0 ? (
          wantedSkills.map((s) => <SkillCard key={s.id} skill={s} mode="want" />)
        ) : (
          <EmptyState title="No learning goals listed" body="This user has not listed any requested skills." />
        )}
      </div>

      <h2 className="mt-12 font-display text-4xl">Reviews & Feedback</h2>
      <div className="mt-4 grid gap-4">
        {userReviews.length === 0 ? (
          <EmptyState
            title="No reviews yet"
            body="Reviews are posted after completing a SkillSwap exchange."
          />
        ) : (
          userReviews.map((rev) => {
            const author = users.find((u) => u.id === rev.authorId);
            return (
              <Card key={rev.id} className="grid gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar name={author?.name || "Peer"} />
                    <div>
                      <span className="font-bold text-sm block">{author?.name || "Peer"}</span>
                      <span className="text-xs text-[var(--muted)]">@{author?.username}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-amber-600 text-sm">
                    ★ {rev.rating}.0
                  </div>
                </div>
                <p className="text-sm italic mt-2 text-[var(--foreground)]">&ldquo;{rev.body}&rdquo;</p>
                <span className="text-[10px] text-[var(--muted)]">{rev.createdAt}</span>
              </Card>
            );
          })
        )}
      </div>

      {showSwapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl">
            <Dialog title={`Propose SkillSwap with ${user.name}`}>
              {swapSubmitted ? (
                <div className="p-6 text-center space-y-3">
                  <CheckCircle2 size={40} className="mx-auto text-emerald-600" />
                  <h3 className="font-display text-2xl">SkillSwap Proposal Sent!</h3>
                  <p className="text-sm text-[var(--muted)]">
                    Your request has been delivered. You can track status in Connections.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendSwapRequest} className="grid gap-4 text-sm py-2">
                  <div>
                    <label className="font-bold block mb-1">Skill You Want to Learn from {user.name.split(" ")[0]}</label>
                    <select
                      value={requestedSkillId}
                      onChange={(e) => setRequestedSkillId(e.target.value)}
                      className="focus-ring w-full border border-[var(--border)] bg-[var(--background)] p-2.5 font-bold"
                      required
                    >
                      <option value="">Select skill...</option>
                      {userOffers.map((o) => {
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
                    <label className="font-bold block mb-1">Skill You Offer to Teach</label>
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
                    <label className="font-bold block mb-1">Introductory Message</label>
                    <textarea
                      rows={3}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="focus-ring w-full border border-[var(--border)] bg-[var(--background)] p-2.5 text-sm"
                      placeholder="Explain what you want to learn and how you can structure the exchange..."
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-2">
                    <Button type="button" variant="ghost" onClick={() => setShowSwapModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Send Proposal</Button>
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
