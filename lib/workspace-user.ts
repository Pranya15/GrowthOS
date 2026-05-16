import { achievements, defaultProgress, reminderFeed } from "@/lib/data";
import { ChatConversationRecord, ChatMessageRecord, GoalRecord, PublicUserRecord } from "@/lib/models";
import { calculateActivityStreak } from "@/lib/progress";
import { DomainKey } from "@/lib/types";

function randomId() {
  return globalThis.crypto.randomUUID();
}

function createBootstrapMessage(createdAt: string): ChatMessageRecord {
  return {
    id: randomId(),
    role: "assistant",
    content: "Ask me any learning or career question. I can help with study plans, projects, exams, and next steps.",
    createdAt
  };
}

export function createConversation(input?: {
  id?: string;
  title?: string;
  domain?: DomainKey;
  createdAt?: string;
  updatedAt?: string;
  messages?: ChatMessageRecord[];
}): ChatConversationRecord {
  const createdAt = input?.createdAt ?? new Date().toISOString();
  const messages = input?.messages?.length ? input.messages : [createBootstrapMessage(createdAt)];

  return {
    id: input?.id ?? randomId(),
    title: input?.title ?? "New chat",
    domain: input?.domain ?? "engineering",
    createdAt,
    updatedAt: input?.updatedAt ?? messages[messages.length - 1]?.createdAt ?? createdAt,
    messages
  };
}

function createFallbackGoal(): GoalRecord {
  return {
    id: randomId(),
    title: "New goal",
    domain: "engineering",
    targetDate: "2026-09-30",
    hoursPerDay: 2,
    performanceScore: 70,
    status: "active"
  };
}

export function createStarterUser(input: { id: string; name: string; email: string }): PublicUserRecord {
  const createdAt = new Date().toISOString();
  const starterConversation = createConversation({
    title: "Getting started",
    domain: "engineering",
    createdAt,
    updatedAt: createdAt,
    messages: [
      {
        id: randomId(),
        role: "assistant",
        content: "Welcome. Ask for a roadmap, study help, or career guidance to start your workspace.",
        createdAt
      }
    ]
  });

  return {
    id: input.id,
    name: input.name,
    email: input.email,
    activeGoalId: "goal-starter",
    streak: defaultProgress.streak,
    level: defaultProgress.level,
    weakAreas: defaultProgress.weakAreas,
    goals: [
      {
        id: "goal-starter",
        title: "My first growth roadmap",
        domain: "engineering",
        targetDate: "2026-09-30",
        hoursPerDay: 2,
        performanceScore: 70,
        status: "active"
      }
    ],
    assets: [],
    reminders: reminderFeed.slice(0, 2).map((item, index) => ({
      id: `starter-reminder-${index + 1}`,
      text: item,
      dueLabel: index === 0 ? "Today" : "This week",
      completed: false
    })),
    activity: [],
    achievements: achievements.slice(0, 1).map((item, index) => ({
      id: `starter-achievement-${index + 1}`,
      title: item.title,
      detail: item.detail,
      unlockedAt: createdAt.slice(0, 10)
    })),
    chatMessages: starterConversation.messages,
    chatConversations: [starterConversation],
    activeChatId: starterConversation.id
  };
}

export function normalizeUserRecord(user: PublicUserRecord): PublicUserRecord {
  const goals = user.goals?.length ? user.goals : [createFallbackGoal()];
  const activeGoalId = goals.some((goal) => goal.id === user.activeGoalId) ? user.activeGoalId : goals[0].id;

  const normalizedConversations = (user.chatConversations ?? []).map((conversation, index) =>
    createConversation({
      id: conversation.id,
      title: conversation.title || `Chat ${index + 1}`,
      domain: conversation.domain ?? goals.find((goal) => goal.id === activeGoalId)?.domain ?? "engineering",
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      messages: conversation.messages
    })
  );

  const activeConversation =
    normalizedConversations.find((conversation) => conversation.id === user.activeChatId) ??
    normalizedConversations[0] ??
    createConversation({
      id: user.activeChatId || randomId(),
      domain: goals.find((goal) => goal.id === activeGoalId)?.domain ?? "engineering"
    });

  const chatConversations =
    normalizedConversations.length > 0
      ? normalizedConversations.map((conversation) => (conversation.id === activeConversation.id ? activeConversation : conversation))
      : [activeConversation];

  return {
    ...user,
    goals: goals.map((goal) => ({
      ...goal,
      status: goal.id === activeGoalId ? "active" : goal.status === "active" ? "paused" : goal.status
    })),
    activeGoalId,
    streak: calculateActivityStreak(user.activity ?? []),
    weakAreas: user.weakAreas ?? [],
    assets: user.assets ?? [],
    reminders: user.reminders ?? [],
    activity: user.activity ?? [],
    achievements: user.achievements ?? [],
    chatMessages: activeConversation.messages,
    chatConversations,
    activeChatId: activeConversation.id
  };
}
