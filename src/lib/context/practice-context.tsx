"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type {
  ID,
  PracticeFeedback,
  PracticeMessage,
  PracticeMode,
  PracticeScenario,
  PracticeSession,
  SimulatedPerson,
} from "@/data/models";
import { SIMULATED_PEOPLE, SIMULATED_SCENARIOS } from "@/data/mock/simulatedPeople";
import { defaultSimulationEngine, SimulationEngine } from "@/lib/simulationEngine";

interface PracticeContextType {
  simulatedPeople: SimulatedPerson[];
  scenarios: PracticeScenario[];
  sessions: PracticeSession[];
  messages: PracticeMessage[];
  feedbacks: PracticeFeedback[];

  startNewSession: (data: {
    simulatedPersonId: ID;
    topic: string;
    mode: PracticeMode;
    scenarioId?: ID;
    goal?: string;
  }) => PracticeSession;

  sendPracticeMessage: (sessionId: ID, userText: string) => void;
  finishPracticeSession: (sessionId: ID) => PracticeFeedback | null;

  getSessionById: (sessionId: ID) => PracticeSession | undefined;
  getSessionMessages: (sessionId: ID) => PracticeMessage[];
  getSessionFeedback: (sessionId: ID) => PracticeFeedback | undefined;
  getPersonById: (personId: ID) => SimulatedPerson | undefined;
  getScenarioById: (scenarioId: ID) => PracticeScenario | undefined;
  getPersonScenarios: (personId: ID) => PracticeScenario[];
  getPracticeProgressBySkill: () => Record<string, number>;
}

const PRACTICE_STORAGE_KEY = "skillswap_practice_state_v1";

const Context = createContext<PracticeContextType | null>(null);

function loadSavedPracticeState() {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(PRACTICE_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function PracticeProvider({
  children,
  engine = defaultSimulationEngine,
}: {
  children: React.ReactNode;
  engine?: SimulationEngine;
}) {
  const [sessions, setSessions] = useState<PracticeSession[]>(
    () => loadSavedPracticeState()?.sessions || []
  );
  const [messages, setMessages] = useState<PracticeMessage[]>(
    () => loadSavedPracticeState()?.messages || []
  );
  const [feedbacks, setFeedbacks] = useState<PracticeFeedback[]>(
    () => loadSavedPracticeState()?.feedbacks || []
  );

  useEffect(() => {
    try {
      localStorage.setItem(
        PRACTICE_STORAGE_KEY,
        JSON.stringify({ sessions, messages, feedbacks })
      );
    } catch (e) {
      console.error("Failed to save local practice state", e);
    }
  }, [sessions, messages, feedbacks]);

  const startNewSession: PracticeContextType["startNewSession"] = (data) => {
    const { session, initialMessage } = engine.startSession(data);
    setSessions((prev) => [session, ...prev]);
    setMessages((prev) => [...prev, initialMessage]);
    return session;
  };

  const sendPracticeMessage: PracticeContextType["sendPracticeMessage"] = (
    sessionId,
    userText
  ) => {
    if (!userText.trim()) return;

    const session = sessions.find((s) => s.id === sessionId);
    if (!session || session.status === "completed") return;

    const person = SIMULATED_PEOPLE.find((p) => p.id === session.simulatedPersonId) || SIMULATED_PEOPLE[0];
    const scenario = session.scenarioId
      ? SIMULATED_SCENARIOS.find((sc) => sc.id === session.scenarioId)
      : undefined;

    const userMsg: PracticeMessage = {
      id: `pmsg_u_${Date.now()}`,
      sessionId,
      sender: "user",
      text: userText.trim(),
      createdAt: new Date().toISOString(),
    };

    const currentHistory = [...messages.filter((m) => m.sessionId === sessionId), userMsg];

    setMessages((prev) => [...prev, userMsg]);

    // Simulate response delay
    setTimeout(() => {
      const responseMsg = engine.generateResponse({
        session,
        person,
        scenario,
        history: currentHistory,
        userText,
      });

      setMessages((prev) => [...prev, responseMsg]);
    }, 400);
  };

  const finishPracticeSession: PracticeContextType["finishPracticeSession"] = (
    sessionId
  ) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return null;

    const history = messages.filter((m) => m.sessionId === sessionId);
    const feedback = engine.evaluateSession(session, history);

    const now = new Date().toISOString();

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, status: "completed", completedAt: now } : s
      )
    );

    setFeedbacks((prev) => {
      const existingIndex = prev.findIndex((f) => f.sessionId === sessionId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = feedback;
        return updated;
      }
      return [feedback, ...prev];
    });

    return feedback;
  };

  const getSessionById = (sessionId: ID) => sessions.find((s) => s.id === sessionId);
  const getSessionMessages = (sessionId: ID) =>
    messages.filter((m) => m.sessionId === sessionId);
  const getSessionFeedback = (sessionId: ID) =>
    feedbacks.find((f) => f.sessionId === sessionId);
  const getPersonById = (personId: ID) =>
    SIMULATED_PEOPLE.find((p) => p.id === personId);
  const getScenarioById = (scenarioId: ID) =>
    SIMULATED_SCENARIOS.find((s) => s.id === scenarioId);
  const getPersonScenarios = (personId: ID) =>
    SIMULATED_SCENARIOS.filter((s) => s.simulatedPersonId === personId);

  const getPracticeProgressBySkill = () => {
    const counts: Record<string, number> = {};
    sessions.forEach((s) => {
      const topic = s.topic || "General";
      counts[topic] = (counts[topic] || 0) + 1;
    });
    return counts;
  };

  return (
    <Context.Provider
      value={{
        simulatedPeople: SIMULATED_PEOPLE,
        scenarios: SIMULATED_SCENARIOS,
        sessions,
        messages,
        feedbacks,
        startNewSession,
        sendPracticeMessage,
        finishPracticeSession,
        getSessionById,
        getSessionMessages,
        getSessionFeedback,
        getPersonById,
        getScenarioById,
        getPersonScenarios,
        getPracticeProgressBySkill,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function usePractice() {
  const ctx = useContext(Context);
  if (!ctx) {
    throw new Error("usePractice must be used within a PracticeProvider");
  }
  return ctx;
}
