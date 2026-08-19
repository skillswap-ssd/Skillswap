"use client";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useSkillSwap } from "@/lib/context/skillswap-context";
import { Bell, Check, CheckCheck, MessageSquare, Sparkles, Star, UserPlus } from "lucide-react";
import Link from "next/link";

export default function NotificationsPage() {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, currentUserId } =
    useSkillSwap();

  const myNotifications = notifications.filter(
    (n) => n.userId === currentUserId || n.userId === "u1" || n.userId === "u2"
  );

  const unreadCount = myNotifications.filter((n) => !n.read).length;

  const iconForType = (type: string) => {
    switch (type) {
      case "match":
        return <Sparkles size={18} className="text-amber-600" />;
      case "message":
        return <MessageSquare size={18} className="text-blue-600" />;
      case "review":
        return <Star size={18} className="text-emerald-600" />;
      case "connection":
        return <UserPlus size={18} className="text-purple-600" />;
      default:
        return <Bell size={18} className="text-[var(--primary)]" />;
    }
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Notifications"
        title="Signals, not noise."
        body="Stay informed about SkillSwap proposals, new messages, complementary matches, and reviews."
      />

      <div className="flex items-center justify-between mb-6 border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-3 font-bold text-sm">
          <span>{myNotifications.length} Total</span>
          {unreadCount > 0 && <Badge>{unreadCount} Unread</Badge>}
        </div>

        {unreadCount > 0 && (
          <Button variant="ghost" onClick={markAllNotificationsAsRead} className="text-xs">
            <CheckCheck size={14} className="mr-1 inline" /> Mark all as read
          </Button>
        )}
      </div>

      {myNotifications.length === 0 ? (
        <EmptyState
          title="No notifications"
          body="When you receive SkillSwap proposals, messages, or review feedback, they will appear here."
        />
      ) : (
        <div className="grid gap-3">
          {myNotifications.map((n) => (
            <Card
              key={n.id}
              className={`flex items-start justify-between gap-4 transition-colors ${
                !n.read ? "border-l-4 border-l-[var(--primary)] bg-[var(--surface-muted)]" : ""
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 p-2 border border-[var(--border)] bg-[var(--background)]">
                  {iconForType(n.type)}
                </div>
                <div>
                  <h3 className={`font-bold text-base ${!n.read ? "text-[var(--foreground)]" : "text-[var(--muted)]"}`}>
                    {n.title}
                  </h3>
                  {n.body && <p className="text-sm mt-1 text-[var(--muted)]">{n.body}</p>}
                  <span className="text-xs text-[var(--muted)] mt-1.5 block">{n.createdAt}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!n.read && (
                  <button
                    onClick={() => markNotificationAsRead(n.id)}
                    className="p-1.5 text-xs font-bold border border-[var(--border)] hover:bg-[var(--background)]"
                    title="Mark as read"
                  >
                    <Check size={14} />
                  </button>
                )}
                <Link
                  href={
                    n.type === "message"
                      ? "/messages"
                      : n.type === "match"
                      ? "/matches"
                      : "/connections"
                  }
                  onClick={() => markNotificationAsRead(n.id)}
                  className="px-3 py-1.5 text-xs font-bold border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--surface-muted)]"
                >
                  View
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
