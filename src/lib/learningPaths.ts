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
  steps: LearningPathStep[];
}

export const CURATED_LEARNING_PATHS: LearningPath[] = [
  {
    id: "path_ml",
    targetSkillName: "Machine Learning",
    title: "Path to Machine Learning",
    description: "A structured progression from scripting basics to statistical learning.",
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
    steps: [
      { skillId: "speaking", skillName: "Public Speaking", description: "Articulate core value propositions clearly and concisely." },
      { skillId: "marketing", skillName: "Digital Marketing", description: "Structure campaign channels, positioning, and funnels." },
      { skillId: "data", skillName: "Data Analysis", description: "Measure campaign ROI and optimize acquisition loops." },
    ],
  },
];

export function getLearningPathForGoal(targetSkillName: string): LearningPath | null {
  const norm = targetSkillName.toLowerCase().trim();
  const found = CURATED_LEARNING_PATHS.find(
    (p) =>
      p.targetSkillName.toLowerCase().includes(norm) ||
      norm.includes(p.targetSkillName.toLowerCase()) ||
      p.steps.some((s) => s.skillName.toLowerCase().includes(norm))
  );
  if (found) return found;

  // Default generated path if not found directly
  return {
    id: `path_${norm.replace(/\s+/g, "_")}`,
    targetSkillName,
    title: `Path toward ${targetSkillName}`,
    description: "A recommended learning progression based on related community skills.",
    steps: [
      { skillId: "foundations", skillName: "Core Foundations", description: "Master fundamental concepts and toolings." },
      { skillId: norm, skillName: targetSkillName, description: "Hands-on project exchanges with experienced peers." },
      { skillId: "applied", skillName: "Applied Practice", description: "Build portfolio projects and receive peer critique." },
    ],
  };
}
