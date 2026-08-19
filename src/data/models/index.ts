export type ID = string;
export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";
export type ExchangeFormat = "remote" | "in-person" | "hybrid";
export type SwapStatus = "pending" | "accepted" | "active" | "completed" | "declined" | "cancelled";
export type ConnectionStatus = "pending" | "connected";

export type SkillCategory = { id: ID; name: string; tone: "craft" | "tech" | "voice" | "motion" | "business"; description: string };
export type Skill = { id: ID; name: string; categoryId: ID; level: SkillLevel; description: string; tags: string[]; popularity: number; relatedSkillIds: ID[]; learningGoals?: string[]; formats: ExchangeFormat[] };
export type User = { id: ID; username: string; name: string; avatar?: string; location: string; reputation: number; completedSwaps: number; responseRate: number; availability: string; interests: string[] };
export type Profile = { userId: ID; headline: string; bio: string; offers: ID[]; requests: ID[]; learningStyle: string; preference: ExchangeFormat };
export type SkillOffer = { id: ID; userId: ID; skillId: ID; level: SkillLevel; format: ExchangeFormat; summary: string; experience: string };
export type SkillRequest = { id: ID; userId: ID; skillId: ID; goal: string; urgency: "low" | "medium" | "high"; level: SkillLevel; format: ExchangeFormat };
export type Match = { id: ID; offerId: ID; requestId: ID; reciprocalOfferId?: ID; reciprocalRequestId?: ID; score: number; reason: string };

export type SkillSwapRequest = {
  id: ID;
  requesterId: ID;
  recipientId: ID;
  offeredSkillId: ID;
  requestedSkillId: ID;
  message: string;
  preferredFormat: ExchangeFormat;
  sessionStyle?: string;
  status: SwapStatus;
  createdAt: string;
  updatedAt: string;
};

export type Connection = {
  id: ID;
  requesterId: ID;
  recipientId: ID;
  status: ConnectionStatus;
  createdAt: string;
};

export type Message = {
  id: ID;
  conversationId: ID;
  senderId: ID;
  text: string;
  createdAt: string;
};

export type Conversation = {
  id: ID;
  participantIds: [ID, ID];
  swapRequestId?: ID;
  lastMessageAt: string;
  unreadCount: Record<ID, number>;
};

export type Review = {
  id: ID;
  swapRequestId?: ID;
  authorId: ID;
  recipientId: ID;
  skillId?: ID;
  rating: number;
  body: string;
  createdAt: string;
};

export type Notification = {
  id: ID;
  userId: ID;
  type: "match" | "message" | "review" | "swap_request" | "swap_status" | "connection" | "system";
  title: string;
  body?: string;
  link?: string;
  read: boolean;
  createdAt: string;
};

export type Activity = {
  id: ID;
  type: "swap_completed" | "skill_added" | "review_posted";
  userId: ID;
  targetUserId?: ID;
  skillId?: ID;
  title: string;
  description: string;
  createdAt: string;
};
