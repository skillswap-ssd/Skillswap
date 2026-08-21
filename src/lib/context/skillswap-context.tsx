"use client";

import React, { createContext, useContext, useCallback, useEffect, useRef, useState } from "react";
import {
  categories as initialCategories,
  currentUserId,
  notifications as initialNotifications,
  offers as initialOffers,
  profiles as initialProfiles,
  requests as initialRequests,
  reviews as initialReviews,
  skills as initialSkills,
  users as initialUsers,
} from "@/data/mock/skillswap";
import type {
  Activity,
  Connection,
  ConnectionStatus,
  Conversation,
  ExchangeFormat,
  ID,
  Message,
  Notification,
  Profile,
  Review,
  Skill,
  SkillCategory,
  SkillLevel,
  SkillOffer,
  SkillRequest,
  SkillSwapRequest,
  SwapStatus,
  User,
} from "@/data/models";

interface SkillSwapContextType {
  currentUserId: ID;
  currentUser: User;
  users: User[];
  profiles: Profile[];
  skills: Skill[];
  categories: SkillCategory[];
  offers: SkillOffer[];
  requests: SkillRequest[];
  connections: Connection[];
  swapRequests: SkillSwapRequest[];
  conversations: Conversation[];
  messages: Message[];
  notifications: Notification[];
  reviews: Review[];
  activities: Activity[];

  recentlyViewedSkills: string[];
  recentlyViewedProfiles: string[];

  trackViewedSkill: (skillId: string) => void;
  trackViewedProfile: (userId: string) => void;
  addRecommendationNotification: (data: { title: string; body?: string; link?: string }) => void;

  updateProfile: (data: {
    name?: string;
    username?: string;
    bio?: string;
    avatar?: string;
    headline?: string;
    location?: string;
    availability?: string;
    learningStyle?: string;
    preference?: ExchangeFormat;
    interests?: string[];
  }) => void;

  addOrUpdateSkill: (data: {
    id?: ID;
    name: string;
    categoryId: ID;
    level: SkillLevel;
    description: string;
    tags: string[];
    learningGoals?: string[];
    formats: ExchangeFormat[];
    kind: "offer" | "want" | "both";
  }) => Skill;

  finishOnboarding: (data: {
    name: string;
    username: string;
    bio: string;
    teachableSkills: Array<{ name: string; categoryId: string; level: SkillLevel; description: string }>;
    wantedSkills: Array<{ name: string; categoryId: string; level: SkillLevel; description: string }>;
    learningStyle: string;
    availability: string;
    preference: ExchangeFormat;
  }) => void;

  sendConnectionRequest: (recipientId: ID) => void;
  updateConnectionStatus: (connectionId: ID, status: ConnectionStatus | "declined" | "cancelled") => void;
  createSwapRequest: (data: {
    recipientId: ID;
    offeredSkillId: ID;
    requestedSkillId: ID;
    message: string;
    preferredFormat: ExchangeFormat;
    sessionStyle?: string;
  }) => SkillSwapRequest;
  updateSwapStatus: (requestId: ID, status: SwapStatus) => void;

  sendMessage: (conversationId: ID, text: string) => void;
  getOrCreateConversation: (recipientId: ID, swapRequestId?: ID) => Conversation;
  markConversationAsRead: (conversationId: ID) => void;

  addReview: (data: { recipientId: ID; swapRequestId?: ID; skillId?: ID; rating: number; body: string }) => void;

  markNotificationAsRead: (id: ID) => void;
  markAllNotificationsAsRead: () => void;

  resetState: () => void;
}

const STORAGE_KEY = "skillswap_state_v1";

const defaultConnections: Connection[] = [
  { id: "c1", requesterId: "u2", recipientId: "u1", status: "connected", createdAt: "2026-08-10" },
  { id: "c2", requesterId: "u2", recipientId: "u3", status: "pending", createdAt: "2026-08-15" },
];

const defaultSwapRequests: SkillSwapRequest[] = [
  {
    id: "sr1",
    requesterId: "u2",
    recipientId: "u1",
    offeredSkillId: "python",
    requestedSkillId: "photo",
    message: "Hey Mara! Would love to trade Python automation for photo critique.",
    preferredFormat: "hybrid",
    sessionStyle: "Pairing & critique",
    status: "active",
    createdAt: "2026-08-12",
    updatedAt: "2026-08-14",
  },
  {
    id: "sr2",
    requesterId: "u3",
    recipientId: "u2",
    offeredSkillId: "design",
    requestedSkillId: "python",
    message: "Interested in setting up Python scripts for design workflows.",
    preferredFormat: "remote",
    sessionStyle: "Screen share",
    status: "pending",
    createdAt: "2026-08-16",
    updatedAt: "2026-08-16",
  },
  {
    id: "sr3",
    requesterId: "u2",
    recipientId: "u4",
    offeredSkillId: "python",
    requestedSkillId: "spanish",
    message: "Hi Lina! Happy to trade Python practice for conversational Spanish.",
    preferredFormat: "remote",
    sessionStyle: "Casual practice",
    status: "completed",
    createdAt: "2026-07-20",
    updatedAt: "2026-08-01",
  },
];

const defaultConversations: Conversation[] = [
  {
    id: "conv1",
    participantIds: ["u2", "u1"],
    swapRequestId: "sr1",
    lastMessageAt: "2026-08-18 10:30",
    unreadCount: { u2: 0, u1: 0 },
  },
  {
    id: "conv2",
    participantIds: ["u2", "u3"],
    swapRequestId: "sr2",
    lastMessageAt: "2026-08-16 14:15",
    unreadCount: { u2: 1, u3: 0 },
  },
];

const defaultMessages: Message[] = [
  { id: "msg1", conversationId: "conv1", senderId: "u2", text: "Hey Mara! Ready for our Python and photo session this week?", createdAt: "2026-08-18 09:10" },
  { id: "msg2", conversationId: "conv1", senderId: "u1", text: "Yes! Let's do Thursday afternoon. I'll bring some gallery cleanup script ideas.", createdAt: "2026-08-18 10:30" },
  { id: "msg3", conversationId: "conv2", senderId: "u3", text: "Hey Ezra! Let me know if you are open to swapping design critique for Python.", createdAt: "2026-08-16 14:15" },
];

const defaultActivities: Activity[] = [
  {
    id: "act1",
    type: "swap_completed",
    userId: "u2",
    targetUserId: "u4",
    skillId: "spanish",
    title: "Completed SkillSwap",
    description: "Ezra Vale & Lina Ortega completed a Python ↔ Spanish exchange.",
    createdAt: "2026-08-01",
  },
  {
    id: "act2",
    type: "skill_added",
    userId: "u1",
    skillId: "photo",
    title: "New Skill Offered",
    description: "Mara Chen added Photography critique to offers.",
    createdAt: "2026-08-05",
  },
];

function loadSavedState() {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

const Context = createContext<SkillSwapContextType | null>(null);

export function SkillSwapProvider({ children }: { children: React.ReactNode }) {
  const isFirstRender = useRef(true);

  const [users, setUsers] = useState<User[]>(() => loadSavedState()?.users || initialUsers);
  const [profiles, setProfiles] = useState<Profile[]>(() => loadSavedState()?.profiles || initialProfiles);
  const [skills, setSkills] = useState<Skill[]>(() => loadSavedState()?.skills || initialSkills);
  const [categories] = useState<SkillCategory[]>(initialCategories);
  const [offers, setOffers] = useState<SkillOffer[]>(() => loadSavedState()?.offers || initialOffers);
  const [requests, setRequests] = useState<SkillRequest[]>(() => loadSavedState()?.requests || initialRequests);
  const [connections, setConnections] = useState<Connection[]>(() => loadSavedState()?.connections || defaultConnections);
  const [swapRequests, setSwapRequests] = useState<SkillSwapRequest[]>(() => loadSavedState()?.swapRequests || defaultSwapRequests);
  const [conversations, setConversations] = useState<Conversation[]>(() => loadSavedState()?.conversations || defaultConversations);
  const [messages, setMessages] = useState<Message[]>(() => loadSavedState()?.messages || defaultMessages);
  const [notifications, setNotifications] = useState<Notification[]>(() => loadSavedState()?.notifications || initialNotifications);
  const [reviews, setReviews] = useState<Review[]>(() => loadSavedState()?.reviews || initialReviews);
  const [activities, setActivities] = useState<Activity[]>(() => loadSavedState()?.activities || defaultActivities);

  const [recentlyViewedSkills, setRecentlyViewedSkills] = useState<string[]>([]);
  const [recentlyViewedProfiles, setRecentlyViewedProfiles] = useState<string[]>([]);

  const trackViewedSkill = (skillId: string) => {
    if (!skillId) return;
    setRecentlyViewedSkills((prev) => Array.from(new Set([skillId, ...prev])).slice(0, 5));
  };

  const trackViewedProfile = (userId: string) => {
    if (!userId || userId === currentUserId) return;
    setRecentlyViewedProfiles((prev) => Array.from(new Set([userId, ...prev])).slice(0, 5));
  };

  const addRecommendationNotification = (data: { title: string; body?: string; link?: string }) => {
    const now = new Date().toISOString().split("T")[0];
    const newNotif: Notification = {
      id: `n_rec_${Date.now()}`,
      userId: currentUserId,
      type: "match",
      title: data.title,
      body: data.body,
      link: data.link || "/discover",
      read: false,
      createdAt: now,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Save to localStorage when state changes (skip first mount to preserve initial values)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    try {
      const stateToSave = {
        users,
        profiles,
        skills,
        offers,
        requests,
        connections,
        swapRequests,
        conversations,
        messages,
        notifications,
        reviews,
        activities,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error("Failed to save local state", e);
    }
  }, [
    users,
    profiles,
    skills,
    offers,
    requests,
    connections,
    swapRequests,
    conversations,
    messages,
    notifications,
    reviews,
    activities,
  ]);

  const currentUser = users.find((u) => u.id === currentUserId) || users[1];

  const updateProfile: SkillSwapContextType["updateProfile"] = (data) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== currentUserId) return u;
        return {
          ...u,
          name: data.name ?? u.name,
          username: data.username ?? u.username,
          avatar: data.avatar ?? u.avatar,
          location: data.location ?? u.location,
          availability: data.availability ?? u.availability,
          interests: data.interests ?? u.interests,
        };
      })
    );

    setProfiles((prev) =>
      prev.map((p) => {
        if (p.userId !== currentUserId) return p;
        return {
          ...p,
          bio: data.bio ?? p.bio,
          headline: data.headline ?? p.headline,
          learningStyle: data.learningStyle ?? p.learningStyle,
          preference: data.preference ?? p.preference,
        };
      })
    );
  };

  const addOrUpdateSkill: SkillSwapContextType["addOrUpdateSkill"] = (data) => {
    let targetSkillId = data.id;

    if (!targetSkillId) {
      const existing = skills.find((s) => s.name.toLowerCase() === data.name.trim().toLowerCase());
      if (existing) {
        targetSkillId = existing.id;
      } else {
        targetSkillId = `skill_${Date.now()}`;
        const newSkill: Skill = {
          id: targetSkillId,
          name: data.name.trim(),
          categoryId: data.categoryId,
          level: data.level,
          description: data.description,
          tags: data.tags,
          popularity: 1,
          relatedSkillIds: [],
          learningGoals: data.learningGoals,
          formats: data.formats.length > 0 ? data.formats : ["remote"],
        };
        setSkills((prev) => [...prev, newSkill]);
      }
    } else {
      setSkills((prev) =>
        prev.map((s) =>
          s.id === targetSkillId
            ? {
                ...s,
                name: data.name.trim(),
                categoryId: data.categoryId,
                level: data.level,
                description: data.description,
                tags: data.tags,
                learningGoals: data.learningGoals,
                formats: data.formats.length > 0 ? data.formats : s.formats,
              }
            : s
        )
      );
    }

    if (data.kind === "offer" || data.kind === "both") {
      const offerId = `o_${Date.now()}`;
      setOffers((prev) => {
        const filtered = prev.filter((o) => !(o.userId === currentUserId && o.skillId === targetSkillId));
        return [
          ...filtered,
          {
            id: offerId,
            userId: currentUserId,
            skillId: targetSkillId!,
            level: data.level,
            format: data.formats[0] || "remote",
            summary: data.description,
            experience: `Experienced in ${data.name}`,
          },
        ];
      });

      setProfiles((prev) =>
        prev.map((p) =>
          p.userId === currentUserId
            ? { ...p, offers: Array.from(new Set([...p.offers, offerId])) }
            : p
        )
      );
    }

    if (data.kind === "want" || data.kind === "both") {
      const requestId = `r_${Date.now()}`;
      setRequests((prev) => {
        const filtered = prev.filter((r) => !(r.userId === currentUserId && r.skillId === targetSkillId));
        return [
          ...filtered,
          {
            id: requestId,
            userId: currentUserId,
            skillId: targetSkillId!,
            goal: data.description,
            urgency: "medium",
            level: data.level,
            format: data.formats[0] || "remote",
          },
        ];
      });

      setProfiles((prev) =>
        prev.map((p) =>
          p.userId === currentUserId
            ? { ...p, requests: Array.from(new Set([...p.requests, requestId])) }
            : p
        )
      );
    }

    if (!data.id) {
      setActivities((prev) => [
        {
          id: `act_${Date.now()}`,
          type: "skill_added",
          userId: currentUserId,
          skillId: targetSkillId,
          title: "New Skill Added",
          description: `${currentUser.name} added ${data.name} (${data.kind === "want" ? "learning goal" : "offer"}).`,
          createdAt: new Date().toISOString().split("T")[0],
        },
        ...prev,
      ]);
    }

    const resultSkill = skills.find((s) => s.id === targetSkillId) || {
      id: targetSkillId!,
      name: data.name,
      categoryId: data.categoryId,
      level: data.level,
      description: data.description,
      tags: data.tags,
      popularity: 1,
      relatedSkillIds: [],
      learningGoals: data.learningGoals,
      formats: data.formats,
    };

    return resultSkill;
  };

  const finishOnboarding: SkillSwapContextType["finishOnboarding"] = (data) => {
    updateProfile({
      name: data.name,
      username: data.username,
      bio: data.bio,
      availability: data.availability,
      learningStyle: data.learningStyle,
      preference: data.preference,
    });

    data.teachableSkills.forEach((s) => {
      addOrUpdateSkill({
        name: s.name,
        categoryId: s.categoryId || "tech",
        level: s.level || "intermediate",
        description: s.description || "Teachable skill added during onboarding",
        tags: [s.name.toLowerCase()],
        formats: [data.preference || "remote"],
        kind: "offer",
      });
    });

    data.wantedSkills.forEach((s) => {
      addOrUpdateSkill({
        name: s.name,
        categoryId: s.categoryId || "tech",
        level: s.level || "beginner",
        description: s.description || "Skill I want to learn",
        tags: [s.name.toLowerCase()],
        formats: [data.preference || "remote"],
        kind: "want",
      });
    });
  };

  const sendConnectionRequest = (recipientId: ID) => {
    const existing = connections.find(
      (c) =>
        (c.requesterId === currentUserId && c.recipientId === recipientId) ||
        (c.requesterId === recipientId && c.recipientId === currentUserId)
    );
    if (existing) return;

    const now = new Date().toISOString().split("T")[0];
    const newConn: Connection = {
      id: `c_${Date.now()}`,
      requesterId: currentUserId,
      recipientId,
      status: "pending",
      createdAt: now,
    };
    setConnections((prev) => [...prev, newConn]);

    setNotifications((prev) => [
      {
        id: `n_${Date.now()}`,
        userId: recipientId,
        type: "connection",
        title: `${currentUser.name} sent you a connection request`,
        read: false,
        createdAt: now,
      },
      ...prev,
    ]);
  };

  const updateConnectionStatus = (
    connectionId: ID,
    status: ConnectionStatus | "declined" | "cancelled"
  ) => {
    const targetConn = connections.find((c) => c.id === connectionId);
    if (!targetConn) return;

    const now = new Date().toISOString().split("T")[0];

    if (status === "declined" || status === "cancelled") {
      setConnections((prev) => prev.filter((c) => c.id !== connectionId));
    } else {
      setConnections((prev) =>
        prev.map((c) => (c.id === connectionId ? { ...c, status } : c))
      );

      const otherUserId =
        targetConn.requesterId === currentUserId ? targetConn.recipientId : targetConn.requesterId;

      setNotifications((prev) => [
        {
          id: `n_${Date.now()}`,
          userId: otherUserId,
          type: "connection",
          title: `${currentUser.name} accepted your connection request`,
          read: false,
          createdAt: now,
        },
        ...prev,
      ]);
    }
  };

  const getOrCreateConversation = (recipientId: ID, swapRequestId?: ID) => {
    const existing = conversations.find(
      (c) => c.participantIds.includes(currentUserId) && c.participantIds.includes(recipientId)
    );

    if (existing) {
      if (swapRequestId && !existing.swapRequestId) {
        setConversations((prev) =>
          prev.map((c) => (c.id === existing.id ? { ...c, swapRequestId } : c))
        );
      }
      return existing;
    }

    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      participantIds: [currentUserId, recipientId],
      swapRequestId,
      lastMessageAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      unreadCount: { [currentUserId]: 0, [recipientId]: 0 },
    };

    setConversations((prev) => [newConv, ...prev]);
    return newConv;
  };

  const sendMessage = (conversationId: ID, text: string) => {
    if (!text.trim()) return;

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId: currentUserId,
      text: text.trim(),
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };

    setMessages((prev) => [...prev, newMsg]);

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== conversationId) return c;
        const recipientId = c.participantIds.find((id) => id !== currentUserId) || "";
        return {
          ...c,
          lastMessageAt: newMsg.createdAt,
          unreadCount: {
            ...c.unreadCount,
            [recipientId]: (c.unreadCount[recipientId] || 0) + 1,
          },
        };
      })
    );
  };

  const createSwapRequest: SkillSwapContextType["createSwapRequest"] = (data) => {
    const now = new Date().toISOString().split("T")[0];
    const newReq: SkillSwapRequest = {
      id: `sr_${Date.now()}`,
      requesterId: currentUserId,
      recipientId: data.recipientId,
      offeredSkillId: data.offeredSkillId,
      requestedSkillId: data.requestedSkillId,
      message: data.message,
      preferredFormat: data.preferredFormat,
      sessionStyle: data.sessionStyle,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    setSwapRequests((prev) => [newReq, ...prev]);

    const conv = getOrCreateConversation(data.recipientId, newReq.id);
    if (data.message) {
      sendMessage(conv.id, data.message);
    }

    const recipient = users.find((u) => u.id === data.recipientId);
    if (recipient) {
      setNotifications((prev) => [
        {
          id: `n_${Date.now()}`,
          userId: data.recipientId,
          type: "swap_request",
          title: `${currentUser.name} sent you a SkillSwap request`,
          body: data.message,
          read: false,
          createdAt: now,
        },
        ...prev,
      ]);
    }

    return newReq;
  };

  const updateSwapStatus = (requestId: ID, status: SwapStatus) => {
    const now = new Date().toISOString().split("T")[0];
    setSwapRequests((prev) =>
      prev.map((sr) => (sr.id === requestId ? { ...sr, status, updatedAt: now } : sr))
    );

    const targetReq = swapRequests.find((sr) => sr.id === requestId);
    if (targetReq) {
      const otherUserId = targetReq.requesterId === currentUserId ? targetReq.recipientId : targetReq.requesterId;
      setNotifications((prev) => [
        {
          id: `n_${Date.now()}`,
          userId: otherUserId,
          type: "swap_status",
          title: `SkillSwap request status updated to ${status}`,
          read: false,
          createdAt: now,
        },
        ...prev,
      ]);

      if (status === "completed") {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === targetReq.requesterId || u.id === targetReq.recipientId
              ? { ...u, completedSwaps: u.completedSwaps + 1 }
              : u
          )
        );

        // Ensure connection exists and is connected
        setConnections((prev) => {
          const existing = prev.find(
            (c) =>
              (c.requesterId === targetReq.requesterId && c.recipientId === targetReq.recipientId) ||
              (c.requesterId === targetReq.recipientId && c.recipientId === targetReq.requesterId)
          );
          if (existing) {
            return prev.map((c) => (c.id === existing.id ? { ...c, status: "connected" } : c));
          }
          return [
            ...prev,
            {
              id: `c_${Date.now()}`,
              requesterId: targetReq.requesterId,
              recipientId: targetReq.recipientId,
              status: "connected",
              createdAt: now,
            },
          ];
        });

        const requesterUser = users.find((u) => u.id === targetReq.requesterId);
        const recipientUser = users.find((u) => u.id === targetReq.recipientId);

        setActivities((prev) => [
          {
            id: `act_${Date.now()}`,
            type: "swap_completed",
            userId: targetReq.requesterId,
            targetUserId: targetReq.recipientId,
            skillId: targetReq.requestedSkillId,
            title: "Completed SkillSwap",
            description: `${requesterUser?.name || "Member"} & ${recipientUser?.name || "Member"} completed a SkillSwap.`,
            createdAt: now,
          },
          ...prev,
        ]);
      }
    }
  };

  const markConversationAsRead = useCallback((conversationId: ID) => {
    setConversations((prev) => {
      const target = prev.find((c) => c.id === conversationId);
      if (!target || (target.unreadCount[currentUserId] || 0) === 0) {
        return prev;
      }
      return prev.map((c) =>
        c.id === conversationId
          ? { ...c, unreadCount: { ...c.unreadCount, [currentUserId]: 0 } }
          : c
      );
    });
  }, []);

  const addReview = (data: { recipientId: ID; swapRequestId?: ID; skillId?: ID; rating: number; body: string }) => {
    if (data.swapRequestId && reviews.some((r) => r.swapRequestId === data.swapRequestId && r.authorId === currentUserId)) {
      return; // Prevent duplicate review for same swap request
    }

    const now = new Date().toISOString().split("T")[0];
    const newRev: Review = {
      id: `rev_${Date.now()}`,
      authorId: currentUserId,
      recipientId: data.recipientId,
      swapRequestId: data.swapRequestId,
      skillId: data.skillId,
      rating: data.rating,
      body: data.body,
      createdAt: now,
    };

    setReviews((prev) => {
      const updated = [newRev, ...prev];
      const targetReviews = updated.filter((r) => r.recipientId === data.recipientId);
      const avgRating = Number(
        (targetReviews.reduce((sum, r) => sum + r.rating, 0) / targetReviews.length).toFixed(1)
      );

      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === data.recipientId ? { ...u, reputation: avgRating } : u))
      );

      return updated;
    });

    setActivities((prev) => [
      {
        id: `act_${Date.now()}`,
        type: "review_posted",
        userId: currentUserId,
        targetUserId: data.recipientId,
        skillId: data.skillId,
        title: "Review Posted",
        description: `${currentUser.name} left a ${data.rating}★ review for a SkillSwap partner.`,
        createdAt: now,
      },
      ...prev,
    ]);

    setNotifications((prev) => [
      {
        id: `n_${Date.now()}`,
        userId: data.recipientId,
        type: "review",
        title: `${currentUser.name} left you a review (${data.rating}★)`,
        body: data.body,
        read: false,
        createdAt: now,
      },
      ...prev,
    ]);
  };

  const markNotificationAsRead = (id: ID) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const resetState = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    setUsers(initialUsers);
    setProfiles(initialProfiles);
    setSkills(initialSkills);
    setOffers(initialOffers);
    setRequests(initialRequests);
    setConnections(defaultConnections);
    setSwapRequests(defaultSwapRequests);
    setConversations(defaultConversations);
    setMessages(defaultMessages);
    setNotifications(initialNotifications);
    setReviews(initialReviews);
    setActivities(defaultActivities);
  };

  return (
    <Context.Provider
      value={{
        currentUserId,
        currentUser,
        users,
        profiles,
        skills,
        categories,
        offers,
        requests,
        connections,
        swapRequests,
        conversations,
        messages,
        notifications,
        reviews,
        activities,
        recentlyViewedSkills,
        recentlyViewedProfiles,
        trackViewedSkill,
        trackViewedProfile,
        addRecommendationNotification,
        updateProfile,
        addOrUpdateSkill,
        finishOnboarding,
        sendConnectionRequest,
        updateConnectionStatus,
        createSwapRequest,
        updateSwapStatus,
        sendMessage,
        getOrCreateConversation,
        markConversationAsRead,
        addReview,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        resetState,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useSkillSwap() {
  const ctx = useContext(Context);
  if (!ctx) {
    throw new Error("useSkillSwap must be used within a SkillSwapProvider");
  }
  return ctx;
}
