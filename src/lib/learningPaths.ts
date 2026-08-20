import { getRelatedSkillsForSkill } from "@/lib/skillRelations";

export interface LearningPathStep {
  skillId: string;
  skillName: string;
  description: string;
}

export interface LearningPath {
  id: string;
  targetSkillName: string;
  title: string;
  description: string;
  isCurated: boolean;
  steps: LearningPathStep[];
}

export const CURATED_LEARNING_PATHS: LearningPath[] = [
  {
    id: "path_ml",
    targetSkillName: "Machine Learning",
    title: "Path to Machine Learning",
    description: "A structured progression from scripting basics to statistical learning.",
    isCurated: true,
    steps: [
      { skillId: "python", skillName: "Python", description: "Build core programming logic and scripting confidence." },
      { skillId: "data", skillName: "Data Analysis", description: "Clean data and summarize distributions with pandas & charts." },
      { skillId: "statistics", skillName: "Statistics & Probabilities", description: "Understand inference, regression, and model evaluation." },
      { skillId: "machine-learning", skillName: "Machine Learning", description: "Train predictive models and evaluate accuracy." },
    ],
  },
  {
    id: "path_brand",
    targetSkillName: "Graphic Design",
    title: "Path to Visual Systems & Branding",
    description: "From visual critique and layout principles to comprehensive brand design.",
    isCurated: true,
    steps: [
      { skillId: "photo", skillName: "Photography & Lighting", description: "Master visual composition, contrast, and framing." },
      { skillId: "design", skillName: "Graphic Design", description: "Learn typography, grids, color hierarchy, and layout." },
      { skillId: "ui-ux", skillName: "UI/UX Design", description: "Translate design systems into interactive digital interfaces." },
    ],
  },
  {
    id: "path_video",
    targetSkillName: "Video Editing",
    title: "Path to Storytelling & Motion",
    description: "Develop narrative pacing, color correction, and sound design for video.",
    isCurated: true,
    steps: [
      { skillId: "photo", skillName: "Photography", description: "Understand framing, exposure, and color temperature." },
      { skillId: "video", skillName: "Video Editing", description: "Cut rhythmically, sequence narrative, and polish audio." },
      { skillId: "motion-graphics", skillName: "Motion Design", description: "Animate kinetic typography and logo reveals." },
    ],
  },
  {
    id: "path_marketing",
    targetSkillName: "Digital Marketing",
    title: "Path to Growth & Messaging",
    description: "Combine storytelling with analytical feedback loops.",
    isCurated: true,
    steps: [
      { skillId: "speaking", skillName: "Public Speaking", description: "Articulate core value propositions clearly and concisely." },
      { skillId: "marketing", skillName: "Digital Marketing", description: "Structure campaign channels, positioning, and funnels." },
      { skillId: "data", skillName: "Data Analysis", description: "Measure campaign ROI and optimize acquisition loops." },
    ],
  },
];

/**
 * Gets a learning path for a given target skill name.
 * 1. Returns a curated path if available.
 * 2. Attempts to construct a path using actual related skills from the graph.
 * 3. Returns null if no meaningful progression exists (never fabricates generic steps).
 */
export function getLearningPathForGoal(targetSkillName: string): LearningPath | null {
  if (!targetSkillName || !targetSkillName.trim()) return null;

  const norm = targetSkillName.toLowerCase().trim();
  const found = CURATED_LEARNING_PATHS.find(
    (p) =>
      p.targetSkillName.toLowerCase().includes(norm) ||
      norm.includes(p.targetSkillName.toLowerCase()) ||
      p.steps.some((s) => s.skillName.toLowerCase().includes(norm))
  );
  if (found) return found;

  // Check if true related skills exist in the graph
  const related = getRelatedSkillsForSkill(norm);
  if (related && related.length > 0) {
    const steps: LearningPathStep[] = related.slice(0, 3).map((rel) => ({
      skillId: rel.id,
      skillName: rel.name,
      description: `Build prerequisite mastery in ${rel.name} to support ${targetSkillName}.`,
    }));

    steps.push({
      skillId: norm.replace(/\s+/g, "-"),
      skillName: targetSkillName,
      description: `Target Skill: Hands-on peer exchanges for ${targetSkillName}.`,
    });

    return {
      id: `path_${norm.replace(/\s+/g, "_")}`,
      targetSkillName,
      title: `Suggested Exploration for ${targetSkillName}`,
      description: "A progression generated from known related skill connections.",
      isCurated: false,
      steps,
    };
  }

  // If no meaningful path can be generated -> return null
  return null;
}
