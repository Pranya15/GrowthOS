import { DomainKey } from "@/lib/types";

export interface GoalRecord {
  id: string;
  title: string;
  domain: DomainKey;
  targetDate: string;
  hoursPerDay: number;
  performanceScore: number;
  status: "active" | "paused" | "completed";
}

export interface ProjectRecord {
  id: string;
  title: string;
  type: "project" | "certificate" | "note" | "github" | "link";
  link: string;
  summary: string;
  createdAt: string;
}

export interface ReminderRecord {
  id: string;
  text: string;
  dueLabel: string;
  completed: boolean;
}

export interface ActivityRecord {
  id: string;
  date: string;
  consistency: number;
  productivity: number;
  completedTopics: number;
}

export interface AchievementRecord {
  id: string;
  title: string;
  detail: string;
  unlockedAt: string;
}

export interface ChatMessageRecord {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  mode?: "study-help" | "career-advice" | "project-review" | "exam-strategy";
}

export interface ChatConversationRecord {
  id: string;
  title: string;
  domain: DomainKey;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessageRecord[];
}

export interface UserRecord {
  id: string;
  clerkUserId?: string;
  name: string;
  email: string;
  passwordHash: string;
  activeGoalId: string;
  streak: number;
  level: number;
  weakAreas: string[];
  sessions: string[];
  goals: GoalRecord[];
  assets: ProjectRecord[];
  reminders: ReminderRecord[];
  activity: ActivityRecord[];
  achievements: AchievementRecord[];
  chatMessages: ChatMessageRecord[];
  chatConversations: ChatConversationRecord[];
  activeChatId: string;
}

export interface AppDatabase {
  users: UserRecord[];
}

export interface PublicUserRecord {
  id: string;
  name: string;
  email: string;
  activeGoalId: string;
  streak: number;
  level: number;
  weakAreas: string[];
  goals: GoalRecord[];
  assets: ProjectRecord[];
  reminders: ReminderRecord[];
  activity: ActivityRecord[];
  achievements: AchievementRecord[];
  chatMessages: ChatMessageRecord[];
  chatConversations: ChatConversationRecord[];
  activeChatId: string;
}
