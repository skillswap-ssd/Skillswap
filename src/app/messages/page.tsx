"use client";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { useSkillSwap } from "@/lib/context/skillswap-context";
import { ArrowLeft, ArrowLeftRight, Send } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MessagesPage() {
  const {
    currentUserId,
    users,
    skills,
    conversations,
    messages,
    swapRequests,
    sendMessage,
    markConversationAsRead,
  } = useSkillSwap();

  const myConversations = conversations.filter((c) =>
    c.participantIds.includes(currentUserId)
  );

  const [activeConvId, setActiveConvId] = useState<string | null>(
    myConversations[0]?.id || null
  );
  const [textInput, setTextInput] = useState("");

  const activeConv = myConversations.find((c) => c.id === activeConvId);

  useEffect(() => {
    if (activeConvId) {
      markConversationAsRead(activeConvId);
    }
  }, [activeConvId, markConversationAsRead]);

  const activeOtherUserId = activeConv
    ? activeConv.participantIds.find((id) => id !== currentUserId)
    : null;
  const activeOtherUser = users.find((u) => u.id === activeOtherUserId);

  const activeSwapRequest = activeConv?.swapRequestId
    ? swapRequests.find((sr) => sr.id === activeConv.swapRequestId)
    : swapRequests.find(
        (sr) =>
          (sr.requesterId === currentUserId && sr.recipientId === activeOtherUserId) ||
          (sr.requesterId === activeOtherUserId && sr.recipientId === currentUserId)
      );

  const activeMessages = messages.filter((m) => m.conversationId === activeConvId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConvId || !textInput.trim()) return;

    sendMessage(activeConvId, textInput);
    setTextInput("");
  };

  const offeredSkill = activeSwapRequest
    ? skills.find((s) => s.id === activeSwapRequest.offeredSkillId)
    : null;
  const requestedSkill = activeSwapRequest
    ? skills.find((s) => s.id === activeSwapRequest.requestedSkillId)
    : null;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Messages"
        title="Peer-to-peer coordination."
        body="Direct messaging with contextual SkillSwap exchange information built right in."
      />

      {myConversations.length === 0 ? (
        <EmptyState
          title="No conversations yet"
          body="Start by finding a peer on Discover or Matches, and click 'Message' or 'Start SkillSwap' to start chatting."
        />
      ) : (
        <div className="grid border border-[var(--border)] bg-[var(--surface-elevated)] lg:grid-cols-[300px_1fr] min-h-[600px]">
          {/* Conversation Sidebar */}
          <div
            className={`border-r border-[var(--border)] flex flex-col ${
              activeConvId ? "hidden lg:flex" : "flex"
            }`}
          >
            <div className="p-4 border-b border-[var(--border)] font-display text-xl">
              Conversations ({myConversations.length})
            </div>

            <div className="divide-y divide-[var(--border)] overflow-y-auto flex-1">
              {myConversations.map((c) => {
                const otherId = c.participantIds.find((id) => id !== currentUserId);
                const otherUser = users.find((u) => u.id === otherId);
                const convMessages = messages.filter((m) => m.conversationId === c.id);
                const lastMsg = convMessages[convMessages.length - 1];
                const unread = c.unreadCount[currentUserId] || 0;

                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveConvId(c.id)}
                    className={`w-full text-left p-4 flex items-start gap-3 transition-colors ${
                      activeConvId === c.id ? "bg-[var(--surface-muted)]" : "hover:bg-[var(--surface-muted)]/50"
                    }`}
                  >
                    {otherUser && <Avatar name={otherUser.name} />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold truncate text-sm">{otherUser?.name}</span>
                        {unread > 0 && (
                          <span className="bg-[var(--primary)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {unread}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--muted)] truncate mt-0.5">
                        {lastMsg ? lastMsg.text : "No messages yet"}
                      </p>
                      <span className="text-[10px] text-[var(--muted)] block mt-1">
                        {c.lastMessageAt}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Conversation Chat Window */}
          <div className={`flex flex-col ${!activeConvId ? "hidden lg:flex" : "flex"}`}>
            {activeConv && activeOtherUser ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface)]">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveConvId(null)}
                      className="lg:hidden p-1 text-[var(--muted)] hover:text-[var(--foreground)]"
                      aria-label="Back to conversations"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <Avatar name={activeOtherUser.name} />
                    <div>
                      <h3 className="font-bold text-base">{activeOtherUser.name}</h3>
                      <p className="text-xs text-[var(--muted)]">@{activeOtherUser.username} · {activeOtherUser.location}</p>
                    </div>
                  </div>

                  <Link
                    href={`/profile/${activeOtherUser.username}`}
                    className="text-xs font-bold border border-[var(--border)] px-3 py-1.5 hover:bg-[var(--surface-muted)]"
                  >
                    View Profile
                  </Link>
                </div>

                {/* Contextual SkillSwap Banner */}
                {activeSwapRequest && (
                  <div className="bg-[var(--surface-muted)] border-b border-[var(--border)] p-3 text-xs flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ArrowLeftRight size={16} className="text-[var(--primary)]" />
                      <span className="font-bold uppercase tracking-wider text-[var(--muted)]">SkillSwap Context:</span>
                      <span className="font-semibold">
                        You offer {offeredSkill?.name || "Skill"} ↔ They offer {requestedSkill?.name || "Skill"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>Status: {activeSwapRequest.status}</Badge>
                      <Link
                        href="/connections"
                        className="font-bold underline text-[var(--foreground)] hover:text-[var(--primary)]"
                      >
                        Manage in Connections
                      </Link>
                    </div>
                  </div>
                )}

                {/* Message Stream */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[var(--background)] min-h-[350px]">
                  {activeMessages.map((msg) => {
                    const isMe = msg.senderId === currentUserId;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[80%] ${
                          isMe ? "ml-auto items-end" : "mr-auto items-start"
                        }`}
                      >
                        <div
                          className={`p-3 text-sm font-medium ${
                            isMe
                              ? "bg-[var(--foreground)] text-[var(--background)]"
                              : "bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)]"
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[10px] text-[var(--muted)] mt-1">{msg.createdAt}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Composer */}
                <form onSubmit={handleSend} className="p-3 border-t border-[var(--border)] flex gap-2 bg-[var(--surface)]">
                  <Input
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder={`Message ${activeOtherUser.name.split(" ")[0]}...`}
                    className="flex-1"
                  />
                  <Button type="submit">
                    <Send size={16} className="mr-1 inline" /> Send
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-[var(--muted)]">
                Select a conversation to start messaging.
              </div>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
