import type {
  PracticeFeedback,
  PracticeMessage,
  PracticeMode,
  PracticeScenario,
  PracticeSession,
  SimulatedPerson,
} from "@/data/models";
import { SIMULATED_PEOPLE, SIMULATED_SCENARIOS } from "@/data/mock/simulatedPeople";

export interface GenerateResponseOptions {
  session: PracticeSession;
  person: SimulatedPerson;
  scenario?: PracticeScenario;
  history: PracticeMessage[];
  userText: string;
}

export interface SimulationEngine {
  startSession(data: {
    simulatedPersonId: string;
    topic: string;
    mode: PracticeMode;
    scenarioId?: string;
    goal?: string;
  }): { session: PracticeSession; initialMessage: PracticeMessage };

  generateResponse(options: GenerateResponseOptions): PracticeMessage;

  evaluateSession(session: PracticeSession, history: PracticeMessage[]): PracticeFeedback;
}

export class LocalSimulationEngine implements SimulationEngine {
  startSession(data: {
    simulatedPersonId: string;
    topic: string;
    mode: PracticeMode;
    scenarioId?: string;
    goal?: string;
  }): { session: PracticeSession; initialMessage: PracticeMessage } {
    const person = SIMULATED_PEOPLE.find((p) => p.id === data.simulatedPersonId) || SIMULATED_PEOPLE[0];
    const scenario = data.scenarioId
      ? SIMULATED_SCENARIOS.find((s) => s.id === data.scenarioId)
      : undefined;

    const now = new Date().toISOString();
    const session: PracticeSession = {
      id: `psess_${Date.now()}`,
      simulatedPersonId: person.id,
      topic: data.topic,
      mode: data.mode,
      difficulty: scenario?.difficulty || person.difficulty,
      scenarioId: data.scenarioId,
      goal: data.goal,
      status: "active",
      startedAt: now,
    };

    let openingText = "";
    if (scenario?.openingMessage) {
      openingText = scenario.openingMessage;
    } else {
      switch (data.mode) {
        case "interview":
          openingText = `Hello! I'm ${person.name}, your practice interviewer today. We'll be focusing on ${data.topic}. To get started, please introduce yourself and share how you approach ${data.topic}.`;
          break;
        case "teach":
          openingText = `Hi! I'm ${person.name}. I'm really curious to learn more about ${data.topic}. How would you explain the basic idea to someone getting started?`;
          break;
        case "scenario":
          openingText = `Hi there! I'm ${person.name}. Ready to dive into our ${data.topic} scenario? Let's discuss your plan and key objectives.`;
          break;
        case "learn":
          openingText = `Hello! I'm ${person.name}, your mentor for ${data.topic}. What specific questions or concepts would you like to explore first?`;
          break;
        case "practice":
        default:
          openingText = `Hi! Ready for a practice session on ${data.topic}? Tell me what goal you'd like to focus on during this conversation.`;
          break;
      }
    }

    const initialMessage: PracticeMessage = {
      id: `pmsg_${Date.now()}`,
      sessionId: session.id,
      sender: "simulated",
      text: openingText,
      createdAt: now,
    };

    return { session, initialMessage };
  }

  generateResponse({ session, person, scenario, history, userText }: GenerateResponseOptions): PracticeMessage {
    const textLower = userText.toLowerCase();
    const userMessageCount = history.filter((m) => m.sender === "user").length;

    let responseText = "";

    // Keyword detection
    const mentionsExample = textLower.includes("example") || textLower.includes("instance") || textLower.includes("project");
    const mentionsDetail = textLower.length > 80;
    const isQuestion = textLower.includes("?") || textLower.includes("how") || textLower.includes("why");

    if (person.role === "interviewer") {
      if (userMessageCount === 1) {
        responseText = `Thank you for that overview. Building on what you just mentioned, how do you handle error cases or unexpected performance bottlenecks when working with ${session.topic}?`;
      } else if (mentionsExample) {
        responseText = `That's a good practical example. What trade-offs did you consider, and if you had to optimize that approach for high scale, what would you change?`;
      } else if (isQuestion) {
        responseText = `In an interview context, I'd typically expect you to outline your initial hypothesis first. But to clarify: focus on explaining your step-by-step logic and performance considerations.`;
      } else {
        responseText = `Understood. Could you break down the core logic into sequential steps, or mention any specific frameworks/data structures you relied on?`;
      }
    } else if (person.role === "beginner") {
      if (userMessageCount === 1) {
        responseText = `Aha, that makes sense! So if I understand correctly, it helps simplify repetitive work. Could you give me a simple real-world analogy so I can remember it better?`;
      } else if (mentionsDetail) {
        responseText = `Thanks! That explanation was really clear. What is a common mistake beginners make when first trying to apply ${session.topic}?`;
      } else {
        responseText = `Got it! I feel like I'm starting to grasp ${session.topic} much better now. Shall we try a quick practice question to see if I understood?`;
      }
    } else if (person.role === "client") {
      if (userMessageCount === 1) {
        responseText = `That's an interesting approach. How soon would we expect to see tangible results, and what specific metrics will we track for ${session.topic}?`;
      } else if (mentionsExample) {
        responseText = `I like the sound of those results. How does this strategy compare in cost and effort relative to alternative approaches?`;
      } else {
        responseText = `Fair points. If we move forward with this ${session.topic} initiative, what would be our first immediate deliverable in week one?`;
      }
    } else {
      // Mentor / Peer / Default
      if (isQuestion) {
        responseText = `Great question! When approaching ${session.topic}, it's best to start by mapping out the primary requirements. From there, break it into smaller testable parts.`;
      } else if (mentionsDetail) {
        responseText = `Spot on reasoning! You described the core concepts of ${session.topic} effectively. How do you plan to practice or apply this next?`;
      } else {
        responseText = `Good point. Let's delve one step deeper into ${session.topic}. What aspect would you like to refine next?`;
      }
    }

    return {
      id: `pmsg_${Date.now()}`,
      sessionId: session.id,
      sender: "simulated",
      text: responseText,
      createdAt: new Date().toISOString(),
    };
  }

  evaluateSession(session: PracticeSession, history: PracticeMessage[]): PracticeFeedback {
    const userMessages = history.filter((m) => m.sender === "user");
    const totalChars = userMessages.reduce((sum, m) => sum + m.text.length, 0);
    const avgLen = userMessages.length > 0 ? totalChars / userMessages.length : 0;

    const containsQuestionMarks = userMessages.some((m) => m.text.includes("?"));
    const containsCodeOrDetails = userMessages.some((m) => m.text.length > 60);

    // Deterministic readiness score computation
    let clarityScore = 65 + Math.min(25, userMessages.length * 5);
    let technicalScore = 60 + (avgLen > 50 ? 25 : 10);
    let confidenceScore = 70 + (containsCodeOrDetails ? 15 : 5);

    clarityScore = Math.min(98, clarityScore);
    technicalScore = Math.min(95, technicalScore);
    confidenceScore = Math.min(96, confidenceScore);

    const readinessScore = Math.round((clarityScore + technicalScore + confidenceScore) / 3);

    const strengths: string[] = [
      `Maintained steady engagement across ${userMessages.length} responses.`,
      avgLen > 40 ? "Provided detailed, multi-sentence explanations." : "Kept responses concise and focused.",
    ];

    if (containsQuestionMarks) {
      strengths.push("Asked proactive clarifying questions during dialogue.");
    } else {
      strengths.push("Responded directly to scenario prompts.");
    }

    const improvements: string[] = [
      avgLen < 50 ? "Expand on step-by-step reasoning with practical examples." : "Summarize takeaways into structured bullet points.",
      "Practice highlighting edge cases and trade-offs early in conversation.",
    ];

    const demonstratedConcepts = [
      session.topic,
      session.mode === "interview" ? "Problem-solving structure" : "Concept communication",
      "Interactive dialogue pacing",
    ];

    const recommendedTopics = [
      `${session.topic} Scenario Challenge`,
      "Peer teaching practice",
    ];

    // Bridge mapping to real skill IDs
    const normTopic = session.topic.toLowerCase();
    let suggestedRealSkillIds = ["python", "design", "speaking"];
    if (normTopic.includes("python")) suggestedRealSkillIds = ["python", "data"];
    else if (normTopic.includes("design") || normTopic.includes("ui")) suggestedRealSkillIds = ["design", "photo"];
    else if (normTopic.includes("marketing")) suggestedRealSkillIds = ["marketing", "speaking"];

    return {
      id: `pfb_${Date.now()}`,
      sessionId: session.id,
      readinessScore,
      clarityScore,
      technicalScore,
      confidenceScore,
      strengths,
      improvements,
      demonstratedConcepts,
      recommendedTopics,
      suggestedRealSkillIds,
      createdAt: new Date().toISOString(),
    };
  }
}

export const defaultSimulationEngine = new LocalSimulationEngine();
