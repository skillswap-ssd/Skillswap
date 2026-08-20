import type {
  ID,
  Profile,
  Skill,
  SkillOffer,
  SkillRequest,
  User,
  SkillSwapRequest,
  Connection,
  Activity,
} from "@/data/models";
import { computeMatches, type ComputedMatch } from "@/lib/matching";
import { getRelatedSkillsForSkill } from "@/lib/skillRelations";

export interface RecommendationReasonDetail {
  label: string;
  category: "learning_goal" | "teaching_match" | "reciprocal" | "interest" | "availability" | "activity" | "explored";
}

export interface RecommendedUser {
  user: User;
  profile: Profile;
  matchScore: number;
  quality: "Strong Match" | "Good Fit" | "Potential Exchange";
  primaryReason: string;
  reasons: RecommendationReasonDetail[];
  offeredSkillNames: string[];
  wantedSkillNames: string[];
}

export interface SkillGapInsightData {
  targetSkillName: string;
  currentSkillName: string;
  suggestedExchangeSkillName: string;
  explanation: string;
}

export interface ProfileCompleteness {
  score: number; // 0 to 100
  level: "Starting" | "Developing" | "Strong" | "Complete";
  missingItems: { field: string; suggestion: string; weight: number }[];
}

export interface WeeklyInsightSummary {
  matchingLearningGoalCount: number;
  lookingForMySkillCount: number;
  mostRequestedSkillName: string;
  activeOpportunitiesCount: number;
}

export interface PersonalLearningSnapshotData {
  teachableSkillsCount: number;
  wantedSkillsCount: number;
  strongOpportunitiesCount: number;
  completedSwapsCount: number;
}

export interface BehavioralContext {
  recentlyViewedSkillIds?: string[];
  recentlyViewedUserIds?: string[];
}

/**
 * Calculates profile completeness score (0-100) and provides actionable prompts.
 */
export function calculateProfileStrength(
  user: User | undefined,
  profile: Profile | undefined,
  offers: SkillOffer[],
  requests: SkillRequest[]
): ProfileCompleteness {
  if (!user || !profile) {
    return {
      score: 20,
      level: "Starting",
      missingItems: [
        { field: "profile", suggestion: "Set up your display name and bio.", weight: 30 },
      ],
    };
  }

  const userOffers = offers.filter((o) => o.userId === user.id);
  const userRequests = requests.filter((r) => r.userId === user.id);

  let score = 0;
  const missingItems: ProfileCompleteness["missingItems"] = [];

  // Name & Bio
  if (user.name && user.name.length > 2) score += 15;
  else missingItems.push({ field: "name", suggestion: "Add your full display name.", weight: 15 });

  if (profile.bio && profile.bio.length > 10) score += 15;
  else missingItems.push({ field: "bio", suggestion: "Write a short bio introducing your background.", weight: 15 });

  if (profile.headline && profile.headline.length > 5) score += 10;
  else missingItems.push({ field: "headline", suggestion: "Add a headline summarizing your skill exchange goals.", weight: 10 });

  // Skills
  if (userOffers.length > 0) score += 20;
  else missingItems.push({ field: "offers", suggestion: "Add at least one skill you can teach.", weight: 20 });

  if (userRequests.length > 0) score += 20;
  else missingItems.push({ field: "requests", suggestion: "Add at least one skill you want to learn.", weight: 20 });

  // Availability & Preferences
  if (user.availability && !user.availability.toLowerCase().includes("not set")) score += 10;
  else missingItems.push({ field: "availability", suggestion: "Add your weekly availability.", weight: 10 });

  if (user.interests && user.interests.length > 0) score += 10;
  else missingItems.push({ field: "interests", suggestion: "Add a few interests or hobbies.", weight: 10 });

  score = Math.min(score, 100);

  let level: ProfileCompleteness["level"] = "Starting";
  if (score >= 90) level = "Complete";
  else if (score >= 70) level = "Strong";
  else if (score >= 40) level = "Developing";

  return { score, level, missingItems };
}

/**
 * Computes rich recommendations combining matching score with secondary & behavioral signals.
 */
export function getRecommendedUsers(
  currentUserId: ID,
  users: User[],
  profiles: Profile[],
  skills: Skill[],
  offers: SkillOffer[],
  requests: SkillRequest[],
  swapRequests: SkillSwapRequest[] = [],
  connections: Connection[] = [],
  behavioral: BehavioralContext = {}
): RecommendedUser[] {
  const baseMatches = computeMatches(currentUserId, users, profiles, skills, offers, requests);
  const currentUser = users.find((u) => u.id === currentUserId);
  const currentUserProfile = profiles.find((p) => p.userId === currentUserId);

  const currentUserOffers = offers.filter((o) => o.userId === currentUserId);
  const currentUserRequests = requests.filter((r) => r.userId === currentUserId);

  const myOfferedSkillNames = currentUserOffers
    .map((o) => skills.find((s) => s.id === o.skillId)?.name)
    .filter((n): n is string => Boolean(n));

  const myWantedSkillNames = currentUserRequests
    .map((r) => skills.find((s) => s.id === r.skillId)?.name)
    .filter((n): n is string => Boolean(n));

  const myInterests = currentUser?.interests.map((i) => i.toLowerCase()) || [];

  // Excluded users (declined connections or existing active swaps)
  const excludedUserIds = new Set<string>([currentUserId]);

  const recommendedList: RecommendedUser[] = [];

  // Evaluate each other user
  const otherUsers = users.filter((u) => !excludedUserIds.has(u.id));

  otherUsers.forEach((user) => {
    const profile = profiles.find((p) => p.userId === user.id);
    if (!profile) return;

    const baseMatch = baseMatches.find((m) => m.user.id === user.id);

    const userOffers = offers.filter((o) => o.userId === user.id);
    const userRequests = requests.filter((r) => r.userId === user.id);

    const offeredSkillNames = userOffers
      .map((o) => skills.find((s) => s.id === o.skillId)?.name)
      .filter((n): n is string => Boolean(n));

    const wantedSkillNames = userRequests
      .map((r) => skills.find((s) => s.id === r.skillId)?.name)
      .filter((n): n is string => Boolean(n));

    const reasons: RecommendationReasonDetail[] = [];
    let score = baseMatch ? baseMatch.score : 0;

    // Check direct overlaps
    const teachMatches = offeredSkillNames.filter((name) =>
      myWantedSkillNames.some((wanted) => wanted.toLowerCase() === name.toLowerCase())
    );
    const learnMatches = wantedSkillNames.filter((name) =>
      myOfferedSkillNames.some((offered) => offered.toLowerCase() === name.toLowerCase())
    );

    if (teachMatches.length > 0 && learnMatches.length > 0) {
      reasons.push({
        label: `Strong reciprocal opportunity: You teach ${learnMatches[0]} ⇄ They teach ${teachMatches[0]}`,
        category: "reciprocal",
      });
      if (score === 0) score += 65;
    } else if (teachMatches.length > 0) {
      reasons.push({
        label: `Matches your learning goal: They teach ${teachMatches.join(", ")}`,
        category: "learning_goal",
      });
      if (score === 0) score += 35;
    } else if (learnMatches.length > 0) {
      reasons.push({
        label: `Complements your teaching skill: They want to learn ${learnMatches.join(", ")} from you`,
        category: "teaching_match",
      });
      if (score === 0) score += 30;
    }

    // Secondary signals: Interests
    const sharedInterests = user.interests.filter((i) =>
      myInterests.some((myI) => myI.includes(i.toLowerCase()) || i.toLowerCase().includes(myI))
    );
    if (sharedInterests.length > 0) {
      score += 5;
      reasons.push({
        label: `Shared interest in ${sharedInterests[0]}`,
        category: "interest",
      });
    }

    // Secondary signals: Availability & Format
    if (
      currentUser?.availability &&
      user.availability &&
      currentUser.availability.toLowerCase() === user.availability.toLowerCase()
    ) {
      score += 5;
      reasons.push({
        label: `Available at similar times (${user.availability})`,
        category: "availability",
      });
    }

    // Behavioral signals: Recently viewed skills or profile
    if (behavioral.recentlyViewedUserIds?.includes(user.id)) {
      score += 3;
      reasons.push({
        label: "Recently viewed profile in this session",
        category: "explored",
      });
    }

    if (
      behavioral.recentlyViewedSkillIds &&
      offeredSkillNames.some((skName) =>
        behavioral.recentlyViewedSkillIds?.some((id) => id.toLowerCase().includes(skName.toLowerCase()))
      )
    ) {
      score += 4;
      reasons.push({
        label: "Teaches a skill you recently explored",
        category: "explored",
      });
    }

    // Response rate & reputation boost
    if (user.responseRate >= 90) {
      reasons.push({
        label: `Responsive member (${user.responseRate}% response rate)`,
        category: "activity",
      });
    }

    // Minimum baseline score cutoff
    if (score < 15 && reasons.length === 0) return;

    let primaryReason = reasons[0]?.label || "Complementary skill background";
    if (baseMatch?.reason) {
      primaryReason = baseMatch.reason;
    }

    let quality: RecommendedUser["quality"] = "Potential Exchange";
    if (score >= 70 && teachMatches.length > 0 && learnMatches.length > 0) {
      quality = "Strong Match";
    } else if (score >= 35 || teachMatches.length > 0 || learnMatches.length > 0) {
      quality = "Good Fit";
    }

    recommendedList.push({
      user,
      profile,
      matchScore: Math.min(score, 99),
      quality,
      primaryReason,
      reasons,
      offeredSkillNames,
      wantedSkillNames,
    });
  });

  return recommendedList.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Gets people who can teach what the current user wants.
 */
export function getPeopleWhoCanTeach(
  currentUserId: ID,
  users: User[],
  profiles: Profile[],
  skills: Skill[],
  offers: SkillOffer[],
  requests: SkillRequest[]
): RecommendedUser[] {
  const recommendations = getRecommendedUsers(
    currentUserId,
    users,
    profiles,
    skills,
    offers,
    requests
  );

  return recommendations.filter(
    (rec) => rec.reasons.some((r) => r.category === "learning_goal" || r.category === "reciprocal")
  );
}

/**
 * Gets people who want to learn what the current user offers.
 */
export function getPeopleWhoWantToLearn(
  currentUserId: ID,
  users: User[],
  profiles: Profile[],
  skills: Skill[],
  offers: SkillOffer[],
  requests: SkillRequest[]
): RecommendedUser[] {
  const recommendations = getRecommendedUsers(
    currentUserId,
    users,
    profiles,
    skills,
    offers,
    requests
  );

  return recommendations.filter(
    (rec) => rec.reasons.some((r) => r.category === "teaching_match" || r.category === "reciprocal")
  );
}

/**
 * Generates personalized skill suggestions outside current list (for exploration).
 */
export function getSkillSuggestions(
  currentUserId: ID,
  skills: Skill[],
  offers: SkillOffer[],
  requests: SkillRequest[]
): { skill: Skill; reason: string }[] {
  const myOfferSkillIds = new Set(offers.filter((o) => o.userId === currentUserId).map((o) => o.skillId));
  const myRequestSkillIds = new Set(requests.filter((r) => r.userId === currentUserId).map((r) => r.skillId));

  const knownSkillIds = new Set([...myOfferSkillIds, ...myRequestSkillIds]);

  const suggestions: { skill: Skill; reason: string }[] = [];

  // Find related skills for currently owned/requested skills
  knownSkillIds.forEach((sId) => {
    const baseSkill = skills.find((s) => s.id === sId);
    if (!baseSkill) return;

    const related = getRelatedSkillsForSkill(baseSkill.id);
    related.forEach((rel) => {
      const matchInRepo = skills.find(
        (s) => s.id === rel.id || s.name.toLowerCase() === rel.name.toLowerCase()
      );
      if (matchInRepo && !knownSkillIds.has(matchInRepo.id)) {
        if (!suggestions.some((s) => s.skill.id === matchInRepo.id)) {
          suggestions.push({
            skill: matchInRepo,
            reason: `Related to ${baseSkill.name}`,
          });
        }
      }
    });
  });

  // Add popular/trending skills if suggestions are few
  if (suggestions.length < 3) {
    const remaining = skills.filter((s) => !knownSkillIds.has(s.id) && !suggestions.some((sg) => sg.skill.id === s.id));
    remaining.slice(0, 3 - suggestions.length).forEach((s) => {
      suggestions.push({
        skill: s,
        reason: "Popular in the community",
      });
    });
  }

  return suggestions;
}

/**
 * Identifies useful gaps between skills wanted and skills currently possessed.
 */
export function getSkillGapInsights(
  currentUserId: ID,
  skills: Skill[],
  offers: SkillOffer[],
  requests: SkillRequest[]
): SkillGapInsightData[] {
  const myOffers = offers.filter((o) => o.userId === currentUserId);
  const myRequests = requests.filter((r) => r.userId === currentUserId);

  const myOfferedSkillNames = myOffers
    .map((o) => skills.find((s) => s.id === o.skillId)?.name)
    .filter((n): n is string => Boolean(n));

  const myWantedSkillNames = myRequests
    .map((r) => skills.find((s) => s.id === r.skillId)?.name)
    .filter((n): n is string => Boolean(n));

  const insights: SkillGapInsightData[] = [];

  myWantedSkillNames.forEach((targetGoal) => {
    const currentHave = myOfferedSkillNames[0] || "Foundational Knowledge";

    const related = getRelatedSkillsForSkill(targetGoal);
    const suggestedExchange = related[0]?.name || "Data Analysis";

    insights.push({
      targetSkillName: targetGoal,
      currentSkillName: currentHave,
      suggestedExchangeSkillName: suggestedExchange,
      explanation: `To bridge from ${currentHave} toward ${targetGoal}, swapping for ${suggestedExchange} provides an ideal stepping stone.`,
    });
  });

  return insights;
}

/**
 * Calculates weekly insight summary metrics.
 */
export function getWeeklyInsightSummary(
  currentUserId: ID,
  users: User[],
  profiles: Profile[],
  skills: Skill[],
  offers: SkillOffer[],
  requests: SkillRequest[]
): WeeklyInsightSummary {
  const myOffers = offers.filter((o) => o.userId === currentUserId);
  const myRequests = requests.filter((r) => r.userId === currentUserId);

  const myWantedIds = new Set(myRequests.map((r) => r.skillId));
  const myOfferedIds = new Set(myOffers.map((o) => o.skillId));

  const otherOffers = offers.filter((o) => o.userId !== currentUserId);
  const otherRequests = requests.filter((r) => r.userId !== currentUserId);

  const matchingLearningGoalCount = new Set(
    otherOffers.filter((o) => myWantedIds.has(o.skillId)).map((o) => o.userId)
  ).size;

  const lookingForMySkillCount = new Set(
    otherRequests.filter((r) => myOfferedIds.has(r.skillId)).map((r) => r.userId)
  ).size;

  // Most requested skill in community
  const requestCounts: Record<string, number> = {};
  otherRequests.forEach((r) => {
    const name = skills.find((s) => s.id === r.skillId)?.name || "Python";
    requestCounts[name] = (requestCounts[name] || 0) + 1;
  });

  let mostRequestedSkillName = "Python";
  let maxCount = 0;
  for (const [name, count] of Object.entries(requestCounts)) {
    if (count > maxCount) {
      maxCount = count;
      mostRequestedSkillName = name;
    }
  }

  const baseMatches = computeMatches(currentUserId, users, profiles, skills, offers, requests);

  return {
    matchingLearningGoalCount,
    lookingForMySkillCount,
    mostRequestedSkillName,
    activeOpportunitiesCount: baseMatches.length,
  };
}

/**
 * Calculates personal learning snapshot numbers.
 */
export function getPersonalLearningSnapshot(
  currentUserId: ID,
  users: User[],
  profiles: Profile[],
  skills: Skill[],
  offers: SkillOffer[],
  requests: SkillRequest[],
  swapRequests: SkillSwapRequest[] = []
): PersonalLearningSnapshotData {
  const teachableSkillsCount = offers.filter((o) => o.userId === currentUserId).length;
  const wantedSkillsCount = requests.filter((r) => r.userId === currentUserId).length;

  const baseMatches = computeMatches(currentUserId, users, profiles, skills, offers, requests);
  const strongOpportunitiesCount = baseMatches.filter((m) => m.quality === "Strong Match" || m.quality === "Good Fit").length;

  const user = users.find((u) => u.id === currentUserId);
  const completedSwapsCount = user ? user.completedSwaps : 0;

  return {
    teachableSkillsCount,
    wantedSkillsCount,
    strongOpportunitiesCount,
    completedSwapsCount,
  };
}
