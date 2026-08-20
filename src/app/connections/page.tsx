"use client";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import type { SwapStatus } from "@/data/models";
import { useSkillSwap } from "@/lib/context/skillswap-context";
import {
  Check,
  CheckCircle,
  MessageSquare,
  Star,
  UserCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ConnectionsPage() {
  const {
    currentUserId,
    users,
    skills,
    connections,
    swapRequests,
    updateSwapStatus,
    updateConnectionStatus,
    getOrCreateConversation,
    addReview,
    reviews,
  } = useSkillSwap();

  const [reviewModalRequest, setReviewModalRequest] = useState<any | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewBody, setReviewBody] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const [tab, setTab] = useState<"swaps" | "connections">("swaps");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const mySwapRequests = swapRequests.filter(
    (sr) => sr.requesterId === currentUserId || sr.recipientId === currentUserId
  );

  const filteredSwaps = mySwapRequests.filter((sr) => {
    if (statusFilter === "all") return true;
    return sr.status === statusFilter;
  });

  const myConnections = connections.filter(
    (c) => c.requesterId === currentUserId || c.recipientId === currentUserId
  );

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalRequest) return;

    const otherUserId =
      reviewModalRequest.requesterId === currentUserId
        ? reviewModalRequest.recipientId
        : reviewModalRequest.requesterId;

    addReview({
      recipientId: otherUserId,
      swapRequestId: reviewModalRequest.id,
      skillId: reviewModalRequest.requestedSkillId,
      rating: reviewRating,
      body: reviewBody,
    });

    setReviewSubmitted(true);
    setTimeout(() => {
      setReviewModalRequest(null);
      setReviewSubmitted(false);
      setReviewBody("");
    }, 1200);
  };

  const statusBadge = (status: SwapStatus) => {
    switch (status) {
      case "pending":
        return <Badge>Pending Response</Badge>;
      case "accepted":
        return <Badge>Accepted</Badge>;
      case "active":
        return <Badge>Active Session</Badge>;
      case "completed":
        return <Badge>Completed</Badge>;
      case "declined":
        return <Badge>Declined</Badge>;
      case "cancelled":
        return <Badge>Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Connections & SkillSwaps"
        title="Manage active exchanges and connections."
        body="Track SkillSwap proposals, manage session progress, start conversations, and review completed exchanges."
      />

      <div className="flex border-b border-[var(--border)] mb-6 gap-6 font-bold text-sm">
        <button
          onClick={() => setTab("swaps")}
          className={`pb-3 border-b-2 transition-colors ${
            tab === "swaps"
              ? "border-[var(--primary)] text-[var(--primary)]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          SkillSwap Exchanges ({mySwapRequests.length})
        </button>
        <button
          onClick={() => setTab("connections")}
          className={`pb-3 border-b-2 transition-colors ${
            tab === "connections"
              ? "border-[var(--primary)] text-[var(--primary)]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          Peer Connections ({myConnections.length})
        </button>
      </div>

      {tab === "swaps" && (
        <div className="grid gap-6">
          <div className="flex flex-wrap gap-2 text-sm">
            {["all", "pending", "accepted", "active", "completed"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 border font-bold capitalize transition-colors ${
                  statusFilter === st
                    ? "bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]"
                    : "border-[var(--border)] hover:bg-[var(--surface-muted)]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {filteredSwaps.length === 0 ? (
            <div className="space-y-6">
              <EmptyState
                title="No exchange requests found"
                body="Discover complementary peers or practice skills with simulated partners first."
              />
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/discover"
                  className="rounded-lg bg-[#1c2430] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2d3748]"
                >
                  Explore Community Matches
                </Link>
                <Link
                  href="/practice"
                  className="rounded-lg border border-[#e2ded8] bg-white px-4 py-2 text-sm font-semibold text-[#1c2430] hover:bg-[#f0ece1]"
                >
                  Practice First
                </Link>
              </div>
            </div>
          ) : (
            filteredSwaps.map((sr) => {
              const isRequester = sr.requesterId === currentUserId;
              const otherUserId = isRequester ? sr.recipientId : sr.requesterId;
              const otherUser = users.find((u) => u.id === otherUserId);

              const offeredSkill = skills.find((s) => s.id === sr.offeredSkillId);
              const requestedSkill = skills.find((s) => s.id === sr.requestedSkillId);

              const hasBeenReviewed = reviews.some(
                (r) => r.swapRequestId === sr.id && r.authorId === currentUserId
              );

              return (
                <Card key={sr.id} className="grid gap-4 lg:grid-cols-[1fr_auto]">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      {statusBadge(sr.status)}
                      <span className="text-xs font-bold text-[var(--muted)]">
                        Format: {sr.preferredFormat} · Updated {sr.updatedAt}
                      </span>
                    </div>

                    <div className="mt-3 flex items-start gap-4">
                      {otherUser && <Avatar name={otherUser.name} />}
                      <div>
                        <h3 className="font-display text-2xl">
                          Exchange with{" "}
                          <Link href={`/profile/${otherUser?.username}`} className="hover:underline">
                            {otherUser?.name}
                          </Link>
                        </h3>
                        <p className="text-xs font-bold text-[var(--muted)]">@{otherUser?.username}</p>
                      </div>
                    </div>

                    <div className="mt-4 p-3 border border-[var(--border)] bg-[var(--surface-muted)] grid sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-bold text-xs block text-[var(--muted)] uppercase">
                          {isRequester ? "You Offer" : `${otherUser?.name.split(" ")[0]} Offers`}:
                        </span>
                        <span className="font-semibold text-lg">{offeredSkill?.name || sr.offeredSkillId}</span>
                      </div>
                      <div>
                        <span className="font-bold text-xs block text-[var(--muted)] uppercase">
                          {isRequester ? "You Want to Learn" : `${otherUser?.name.split(" ")[0]} Wants`}:
                        </span>
                        <span className="font-semibold text-lg">{requestedSkill?.name || sr.requestedSkillId}</span>
                      </div>
                    </div>

                    {sr.message && (
                      <div className="mt-3 text-sm italic text-[var(--muted)]">
                        &ldquo;{sr.message}&rdquo;
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 justify-center lg:w-48 pt-2 border-t lg:border-t-0 lg:border-l border-[var(--border)] lg:pl-5">
                    {otherUser && (
                      <Link
                        href="/messages"
                        onClick={() => getOrCreateConversation(otherUser.id, sr.id)}
                        className="inline-flex items-center justify-center border border-[var(--border)] py-2 px-3 text-sm font-bold hover:bg-[var(--surface-muted)] text-center"
                      >
                        <MessageSquare size={16} className="mr-2 inline" /> Open Chat
                      </Link>
                    )}

                    {!isRequester && sr.status === "pending" && (
                      <>
                        <Button
                          onClick={() => updateSwapStatus(sr.id, "accepted")}
                          className="w-full text-xs justify-center"
                        >
                          <Check size={14} className="mr-1 inline" /> Accept Request
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => updateSwapStatus(sr.id, "declined")}
                          className="w-full text-xs justify-center text-rose-700"
                        >
                          Decline
                        </Button>
                      </>
                    )}

                    {isRequester && sr.status === "pending" && (
                      <Button
                        variant="ghost"
                        onClick={() => updateSwapStatus(sr.id, "cancelled")}
                        className="w-full text-xs justify-center"
                      >
                        Cancel Request
                      </Button>
                    )}

                    {sr.status === "accepted" && (
                      <Button
                        onClick={() => updateSwapStatus(sr.id, "active")}
                        className="w-full text-xs justify-center"
                      >
                        Start Active Session
                      </Button>
                    )}

                    {sr.status === "active" && (
                      <Button
                        onClick={() => updateSwapStatus(sr.id, "completed")}
                        className="w-full text-xs justify-center bg-emerald-800 hover:bg-emerald-900 text-white"
                      >
                        <CheckCircle size={14} className="mr-1 inline" /> Mark as Completed
                      </Button>
                    )}

                    {sr.status === "completed" && (
                      hasBeenReviewed ? (
                        <div className="text-center text-xs font-bold text-emerald-800 bg-emerald-50 p-2 border border-emerald-300">
                          ✓ Review Submitted
                        </div>
                      ) : (
                        <Button
                          onClick={() => {
                            setReviewModalRequest(sr);
                            setReviewRating(5);
                            setReviewBody("");
                          }}
                          className="w-full text-xs justify-center bg-[var(--primary)] text-white"
                        >
                          <Star size={14} className="mr-1 inline" /> Leave Review
                        </Button>
                      )
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {tab === "connections" && (
        <div className="grid gap-4">
          {myConnections.length === 0 ? (
            <div className="space-y-6">
              <EmptyState
                title="No connections yet"
                body="Connect with peers on profiles or matches to keep a directory of trusted learning partners."
              />
              <div className="flex justify-center">
                <Link
                  href="/discover"
                  className="rounded-lg bg-[#1c2430] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2d3748]"
                >
                  Discover Peers to Connect With
                </Link>
              </div>
            </div>
          ) : (
            myConnections.map((conn) => {
              const isRequester = conn.requesterId === currentUserId;
              const otherUserId = isRequester ? conn.recipientId : conn.requesterId;
              const otherUser = users.find((u) => u.id === otherUserId);

              return (
                <Card key={conn.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {otherUser && <Avatar name={otherUser.name} />}
                    <div>
                      <h3 className="font-bold text-lg">{otherUser?.name}</h3>
                      <p className="text-xs text-[var(--muted)]">
                        @{otherUser?.username} · {otherUser?.location}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        {conn.status === "connected" ? (
                          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                            <UserCheck size={14} /> Connected
                          </span>
                        ) : (
                          <Badge>
                            {isRequester ? "Pending Acceptance" : "Connection Request Received"}
                          </Badge>
                        )}
                        <span className="text-[10px] text-[var(--muted)]">• Connected {conn.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {conn.status === "pending" && !isRequester && (
                      <>
                        <Button
                          onClick={() => updateConnectionStatus(conn.id, "connected")}
                          className="text-xs"
                        >
                          <Check size={14} className="mr-1 inline" /> Accept
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => updateConnectionStatus(conn.id, "declined")}
                          className="text-xs text-rose-700"
                        >
                          Decline
                        </Button>
                      </>
                    )}

                    {conn.status === "pending" && isRequester && (
                      <Button
                        variant="ghost"
                        onClick={() => updateConnectionStatus(conn.id, "cancelled")}
                        className="text-xs"
                      >
                        <X size={14} className="mr-1 inline" /> Cancel Request
                      </Button>
                    )}

                    {otherUser && (
                      <Link
                        href="/messages"
                        onClick={() => getOrCreateConversation(otherUser.id)}
                        className="border border-[var(--border)] px-3 py-1.5 text-xs font-bold hover:bg-[var(--surface-muted)]"
                      >
                        Message
                      </Link>
                    )}

                    <Button variant="ghost" href={`/profile/${otherUser?.username}`} className="text-xs">
                      View Profile
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {reviewModalRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg">
            <Dialog title="Leave Review for Completed Exchange">
              {reviewSubmitted ? (
                <div className="p-6 text-center space-y-2">
                  <CheckCircle size={40} className="mx-auto text-emerald-600" />
                  <h3 className="font-display text-2xl">Review Posted!</h3>
                  <p className="text-sm text-[var(--muted)]">
                    Thank you! Your feedback builds trust in the SkillSwap community.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="grid gap-4 py-2 text-sm">
                  <div>
                    <label className="font-bold block mb-1">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className={`p-2 border text-lg font-bold ${
                            star <= reviewRating
                              ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                              : "border-[var(--border)] bg-[var(--background)]"
                          }`}
                        >
                          ★ {star}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Written Review</label>
                    <textarea
                      required
                      rows={4}
                      value={reviewBody}
                      onChange={(e) => setReviewBody(e.target.value)}
                      className="focus-ring w-full border border-[var(--border)] bg-[var(--background)] p-3 text-sm"
                      placeholder="Share how the session went, what you learned, and why you would recommend them..."
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-2">
                    <Button type="button" variant="ghost" onClick={() => setReviewModalRequest(null)}>
                      Cancel
                    </Button>
                    <Button type="submit">Submit Review</Button>
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
