import type { CategoryChipTone } from "@/components/shared/category-chip";
import type { Match, Notification, Profile, Review, Skill, SkillCategory, SkillOffer, SkillRequest, User } from "../models";

export const categories: SkillCategory[] = [
  { id: "tech", name: "Code & systems", tone: "tech" },
  { id: "craft", name: "Visual craft", tone: "craft" },
  { id: "voice", name: "Voice & presence", tone: "voice" },
  { id: "motion", name: "Moving image", tone: "motion" },
  { id: "business", name: "Market fluency", tone: "business" },
];
export const skills: Skill[] = [
  { id: "python", name: "Python", categoryId: "tech", level: "advanced", description: "Build scripts, prototypes, and data tools with calm fundamentals." },
  { id: "video", name: "Video Editing", categoryId: "motion", level: "intermediate", description: "Cut tighter stories for reels, launches, and documentaries." },
  { id: "photo", name: "Photography", categoryId: "craft", level: "expert", description: "Find light, compose scenes, and make people comfortable." },
  { id: "guitar", name: "Guitar", categoryId: "voice", level: "intermediate", description: "Learn rhythm, taste, and songs that survive a campfire." },
  { id: "graphic", name: "Graphic Design", categoryId: "craft", level: "advanced", description: "Design systems, posters, identities, and sharper layouts." },
  { id: "speaking", name: "Public Speaking", categoryId: "voice", level: "expert", description: "Turn nerves into presence and structure ideas that land." },
  { id: "3d", name: "3D Design", categoryId: "craft", level: "beginner", description: "Model useful objects and expressive scenes from primitives." },
  { id: "marketing", name: "Digital Marketing", categoryId: "business", level: "advanced", description: "Understand channels, positioning, experiments, and momentum." },
];
export const users: User[] = [
  { id: "u1", username: "mara", name: "Mara Chen", location: "Oakland", reputation: 4.9 },
  { id: "u2", username: "ezra", name: "Ezra Vale", location: "Brooklyn", reputation: 4.7 },
  { id: "u3", username: "noor", name: "Noor Malik", location: "Chicago", reputation: 4.8 },
];
export const profiles: Profile[] = [
  { userId: "u1", headline: "Photographer trading visual taste for Python fluency.", bio: "Editorial portraits, calm critique, and practical project energy.", offers: ["o1"], requests: ["r1"], interests: ["python", "3d"] },
  { userId: "u2", headline: "Developer who wants to sound better on stage.", bio: "Automation, APIs, debugging, and patient explanations.", offers: ["o2"], requests: ["r2"], interests: ["speaking", "guitar"] },
  { userId: "u3", headline: "Brand designer building a video practice.", bio: "Identity systems, typography, decks, and structured feedback.", offers: ["o3"], requests: ["r3"], interests: ["video", "marketing"] },
];
export const offers: SkillOffer[] = [
  { id: "o1", userId: "u1", skillId: "photo", format: "hybrid", summary: "A two-hour photo walk and critique." },
  { id: "o2", userId: "u2", skillId: "python", format: "remote", summary: "Pair on a real automation problem." },
  { id: "o3", userId: "u3", skillId: "graphic", format: "remote", summary: "Logo and layout feedback with references." },
];
export const requests: SkillRequest[] = [
  { id: "r1", userId: "u1", skillId: "python", goal: "Automate client gallery cleanup.", urgency: "medium" },
  { id: "r2", userId: "u2", skillId: "speaking", goal: "Practice a conference talk.", urgency: "high" },
  { id: "r3", userId: "u3", skillId: "video", goal: "Edit a brand case-study reel.", urgency: "low" },
];
export const matches: Match[] = [{ id: "m1", offerId: "o2", requestId: "r1", score: 92, reason: "Python automation for photography workflow" }];
export const reviews: Review[] = [{ id: "rev1", authorId: "u2", recipientId: "u1", rating: 5, body: "Generous, precise, and easy to learn with.", createdAt: "2026-08-01" }];
export const notifications: Notification[] = [{ id: "n1", userId: "u1", type: "match", title: "Ezra may be a strong Python exchange", read: false, createdAt: "2026-08-18" }];
export const toneFor = (categoryId: string): CategoryChipTone => (categories.find((c) => c.id === categoryId)?.tone ?? "craft") as CategoryChipTone;
export const getSkill = (id: string) => skills.find((skill) => skill.id === id);
export const getUser = (username: string) => users.find((user) => user.username === username);
