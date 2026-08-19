import type { ID, Profile, Skill, SkillOffer, SkillRequest, User } from "@/data/models";

export interface ComputedMatch {
  id: string;
  user: User;
  profile: Profile;
  offeredByThem: Skill[];
  wantedByThem: Skill[];
  score: number;
  quality: "Strong Match" | "Good Fit" | "Potential Exchange";
  reason: string;
  explanation: string[];
}

export function computeMatches(
  currentUserId: ID,
  users: User[],
  profiles: Profile[],
  skills: Skill[],
  offers: SkillOffer[],
  requests: SkillRequest[]
): ComputedMatch[] {
  const currentUserOffers = offers.filter((o) => o.userId === currentUserId);
  const currentUserRequests = requests.filter((r) => r.userId === currentUserId);

  const myOfferedSkillIds = new Set(currentUserOffers.map((o) => o.skillId));
  const myWantedSkillIds = new Set(currentUserRequests.map((r) => r.skillId));

  const otherUsers = users.filter((u) => u.id !== currentUserId);

  const results: ComputedMatch[] = [];

  otherUsers.forEach((user) => {
    const userProfile = profiles.find((p) => p.userId === user.id);
    if (!userProfile) return;

    const userOffers = offers.filter((o) => o.userId === user.id);
    const userRequests = requests.filter((r) => r.userId === user.id);

    const offeredByThemIds = userOffers.map((o) => o.skillId);
    const wantedByThemIds = userRequests.map((r) => r.skillId);

    const matchingOfferedByThem = offeredByThemIds.filter((id) => myWantedSkillIds.has(id));
    const matchingWantedByThem = wantedByThemIds.filter((id) => myOfferedSkillIds.has(id));

    let score = 50;
    const explanations: string[] = [];

    if (matchingOfferedByThem.length > 0) {
      score += 25;
      const skillNames = matchingOfferedByThem
        .map((id) => skills.find((s) => s.id === id)?.name)
        .filter(Boolean)
        .join(", ");
      explanations.push(`They offer ${skillNames}, which you want to learn.`);
    }

    if (matchingWantedByThem.length > 0) {
      score += 25;
      const skillNames = matchingWantedByThem
        .map((id) => skills.find((s) => s.id === id)?.name)
        .filter(Boolean)
        .join(", ");
      explanations.push(`They want to learn ${skillNames}, which you can teach.`);
    }

    if (user.reputation >= 4.8) {
      score += 5;
      explanations.push(`Top-rated member with ${user.reputation}★ rating.`);
    }

    if (user.responseRate >= 90) {
      score += 5;
      explanations.push(`High response rate (${user.responseRate}%).`);
    }

    const offeredByThemSkills = matchingOfferedByThem
      .map((id) => skills.find((s) => s.id === id))
      .filter((s): s is Skill => Boolean(s));

    const wantedByThemSkills = matchingWantedByThem
      .map((id) => skills.find((s) => s.id === id))
      .filter((s): s is Skill => Boolean(s));

    let quality: ComputedMatch["quality"] = "Potential Exchange";
    if (score >= 90 || (matchingOfferedByThem.length > 0 && matchingWantedByThem.length > 0)) {
      quality = "Strong Match";
    } else if (score >= 70 || matchingOfferedByThem.length > 0 || matchingWantedByThem.length > 0) {
      quality = "Good Fit";
    }

    let reason = "Share complementary learning goals and complementary skill sets.";
    if (matchingOfferedByThem.length > 0 && matchingWantedByThem.length > 0) {
      const teachName = skills.find((s) => s.id === matchingWantedByThem[0])?.name || "skills";
      const learnName = skills.find((s) => s.id === matchingOfferedByThem[0])?.name || "skills";
      reason = `Direct 2-way exchange: You teach ${teachName}; they teach ${learnName}.`;
    } else if (matchingOfferedByThem.length > 0) {
      const learnName = skills.find((s) => s.id === matchingOfferedByThem[0])?.name || "skills";
      reason = `They can teach you ${learnName}.`;
    } else if (matchingWantedByThem.length > 0) {
      const teachName = skills.find((s) => s.id === matchingWantedByThem[0])?.name || "skills";
      reason = `They want to learn ${teachName} from you.`;
    }

    results.push({
      id: `match_${user.id}`,
      user,
      profile: userProfile,
      offeredByThem: offeredByThemSkills,
      wantedByThem: wantedByThemSkills,
      score: Math.min(score, 99),
      quality,
      reason,
      explanation: explanations,
    });
  });

  return results.sort((a, b) => b.score - a.score);
}
