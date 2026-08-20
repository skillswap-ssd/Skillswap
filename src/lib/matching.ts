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
  const currentUserProfile = profiles.find((p) => p.userId === currentUserId);

  const myOfferedSkillIds = new Set(currentUserOffers.map((o) => o.skillId));
  const myWantedSkillIds = new Set(currentUserRequests.map((r) => r.skillId));

  const myOfferedCategories = new Set(
    currentUserOffers
      .map((o) => skills.find((s) => s.id === o.skillId)?.categoryId)
      .filter(Boolean)
  );
  const myWantedCategories = new Set(
    currentUserRequests
      .map((r) => skills.find((s) => s.id === r.skillId)?.categoryId)
      .filter(Boolean)
  );

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

    let score = 0;
    const explanations: string[] = [];

    const isReciprocal = matchingOfferedByThem.length > 0 && matchingWantedByThem.length > 0;
    const isOneWayTeach = matchingOfferedByThem.length > 0 && matchingWantedByThem.length === 0;
    const isOneWayLearn = matchingWantedByThem.length > 0 && matchingOfferedByThem.length === 0;

    if (isReciprocal) {
      score += 65;
      const teachNames = matchingWantedByThem
        .map((id) => skills.find((s) => s.id === id)?.name)
        .filter(Boolean)
        .join(", ");
      const learnNames = matchingOfferedByThem
        .map((id) => skills.find((s) => s.id === id)?.name)
        .filter(Boolean)
        .join(", ");
      explanations.push(`Reciprocal match: You teach ${teachNames} ⇄ They teach ${learnNames}.`);
    } else if (isOneWayTeach) {
      score += 35;
      const skillNames = matchingOfferedByThem
        .map((id) => skills.find((s) => s.id === id)?.name)
        .filter(Boolean)
        .join(", ");
      explanations.push(`They offer ${skillNames}, which matches your learning goals.`);
    } else if (isOneWayLearn) {
      score += 30;
      const skillNames = matchingWantedByThem
        .map((id) => skills.find((s) => s.id === id)?.name)
        .filter(Boolean)
        .join(", ");
      explanations.push(`They want to learn ${skillNames}, which you offer.`);
    } else {
      // Check category compatibility
      const userOfferCategories = userOffers
        .map((o) => skills.find((s) => s.id === o.skillId)?.categoryId)
        .filter(Boolean);
      const userRequestCategories = userRequests
        .map((r) => skills.find((s) => s.id === r.skillId)?.categoryId)
        .filter(Boolean);

      const hasCategoryMatch =
        userOfferCategories.some((catId) => myWantedCategories.has(catId)) ||
        userRequestCategories.some((catId) => myOfferedCategories.has(catId));

      if (hasCategoryMatch) {
        score += 15;
        explanations.push("Shared interest in related skill categories.");
      }
    }

    // Only apply secondary trust multipliers if there is some baseline compatibility
    if (score > 0) {
      if (user.reputation >= 4.8) {
        score += 5;
        explanations.push(`High member trust (${user.reputation}★).`);
      } else if (user.reputation >= 4.5) {
        score += 3;
      }

      if (user.responseRate >= 90) {
        score += 5;
        explanations.push(`Responsive member (${user.responseRate}% response rate).`);
      }

      if (currentUserProfile && userProfile.preference === currentUserProfile.preference) {
        score += 5;
        explanations.push(`Matching exchange preference (${userProfile.preference}).`);
      }
    }

    // If zero score (no skill or category match), skip or keep at baseline low
    if (score < 10) {
      return; // Exclude users with no meaningful compatibility
    }

    const offeredByThemSkills = matchingOfferedByThem
      .map((id) => skills.find((s) => s.id === id))
      .filter((s): s is Skill => Boolean(s));

    const wantedByThemSkills = matchingWantedByThem
      .map((id) => skills.find((s) => s.id === id))
      .filter((s): s is Skill => Boolean(s));

    let quality: ComputedMatch["quality"] = "Potential Exchange";
    if (score >= 70 && isReciprocal) {
      quality = "Strong Match";
    } else if (score >= 35 || isOneWayTeach || isOneWayLearn) {
      quality = "Good Fit";
    }

    let reason = "Complementary skill categories and learning goals.";
    if (isReciprocal) {
      const teachName = skills.find((s) => s.id === matchingWantedByThem[0])?.name || "skills";
      const learnName = skills.find((s) => s.id === matchingOfferedByThem[0])?.name || "skills";
      reason = `Direct 2-way exchange: You teach ${teachName}; they teach ${learnName}.`;
    } else if (isOneWayTeach) {
      const learnName = skills.find((s) => s.id === matchingOfferedByThem[0])?.name || "skills";
      reason = `They can teach you ${learnName}.`;
    } else if (isOneWayLearn) {
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
