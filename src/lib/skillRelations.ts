export interface RelatedSkillRelation {
  skillId: string;
  skillName: string;
  relatedIds: string[];
  relatedNames: string[];
  category: string;
}

export const SKILL_RELATIONS_MAP: Record<string, { relatedIds: string[]; relatedNames: string[] }> = {
  python: {
    relatedIds: ["data", "automation", "machine-learning", "web-scraping"],
    relatedNames: ["Data Analysis", "Automation", "Machine Learning", "Web Scraping"],
  },
  data: {
    relatedIds: ["python", "statistics", "marketing", "visualization"],
    relatedNames: ["Python", "Statistics", "Digital Marketing", "Data Visualization"],
  },
  video: {
    relatedIds: ["photo", "design", "motion-graphics", "sound-design"],
    relatedNames: ["Photography", "Graphic Design", "Motion Graphics", "Sound Design"],
  },
  photo: {
    relatedIds: ["video", "design", "lighting", "editing"],
    relatedNames: ["Video Editing", "Graphic Design", "Lighting & Composition", "Photo Post-Processing"],
  },
  design: {
    relatedIds: ["photo", "video", "ui-ux", "branding", "illustration"],
    relatedNames: ["Photography", "Video Editing", "UI/UX Design", "Branding & Identity", "Illustration"],
  },
  speaking: {
    relatedIds: ["marketing", "spanish", "storytelling", "facilitation"],
    relatedNames: ["Digital Marketing", "Conversational Spanish", "Storytelling", "Workshop Facilitation"],
  },
  marketing: {
    relatedIds: ["design", "data", "copywriting", "speaking"],
    relatedNames: ["Graphic Design", "Data Analysis", "Copywriting", "Public Speaking"],
  },
  spanish: {
    relatedIds: ["speaking", "french", "translation", "culture"],
    relatedNames: ["Public Speaking", "French Conversation", "Translation & Localization", "Cultural Studies"],
  },
  guitar: {
    relatedIds: ["music-theory", "audio-production", "singing", "songwriting"],
    relatedNames: ["Music Theory", "Audio Production", "Vocal Performance", "Songwriting"],
  },
};

/**
 * Gets related skill names for a given skill ID or query string.
 * Returns an empty array if no true relationship exists in the curated map.
 */
export function getRelatedSkillsForSkill(
  skillIdOrName: string,
  categorySkills?: { id: string; name: string }[]
): { id: string; name: string }[] {
  if (!skillIdOrName || !skillIdOrName.trim()) return [];

  const normalized = skillIdOrName.trim().toLowerCase();

  // Look up by exact key
  if (SKILL_RELATIONS_MAP[normalized]) {
    const rel = SKILL_RELATIONS_MAP[normalized];
    return rel.relatedIds.map((id, index) => ({
      id,
      name: rel.relatedNames[index] || id,
    }));
  }

  // Look up by partial match in key or related names
  for (const [key, value] of Object.entries(SKILL_RELATIONS_MAP)) {
    if (key.includes(normalized) || value.relatedNames.some((n) => n.toLowerCase().includes(normalized))) {
      return value.relatedIds.map((id, index) => ({
        id,
        name: value.relatedNames[index] || id,
      }));
    }
  }

  // Same category fallback if category skills are supplied
  if (categorySkills && categorySkills.length > 0) {
    return categorySkills.filter((s) => s.id.toLowerCase() !== normalized && s.name.toLowerCase() !== normalized);
  }

  // No meaningful relationship found -> return empty array instead of fabricating relevance
  return [];
}
