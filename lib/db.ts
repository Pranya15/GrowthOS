import { promises as fs } from "fs";
import crypto from "crypto";
import path from "path";
import { achievements, defaultProgress, reminderFeed } from "@/lib/data";
import { AppDatabase, ChatConversationRecord, ChatMessageRecord, PublicUserRecord, UserRecord } from "@/lib/models";
import { getPool } from "@/lib/postgres";
import { calculateActivityStreak } from "@/lib/progress";
import { isPostgresConfigured } from "@/lib/runtime-config";
import { hashPassword } from "@/lib/security";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "app-db.json");

function createBootstrapMessage(createdAt: string): ChatMessageRecord {
  return {
    id: "chat-bootstrap",
    role: "assistant",
    content: "Ask me any learning or career question. I can help with study plans, projects, exams, and next steps.",
    createdAt
  };
}

function createConversation(input?: {
  id?: string;
  title?: string;
  domain?: UserRecord["goals"][number]["domain"];
  createdAt?: string;
  updatedAt?: string;
  messages?: ChatMessageRecord[];
}): ChatConversationRecord {
  const createdAt = input?.createdAt ?? new Date().toISOString();
  const messages = input?.messages?.length ? input.messages : [createBootstrapMessage(createdAt)];

  return {
    id: input?.id ?? crypto.randomUUID(),
    title: input?.title ?? "New chat",
    domain: input?.domain ?? "engineering",
    createdAt,
    updatedAt: input?.updatedAt ?? messages[messages.length - 1]?.createdAt ?? createdAt,
    messages
  };
}

function buildDemoUser(): UserRecord {
  const createdAt = "2026-05-13T08:30:00.000Z";
  const starterConversation = createConversation({
    id: "conversation-1",
    title: "Getting started",
    domain: "engineering",
    createdAt,
    updatedAt: createdAt,
    messages: [
      {
        id: "chat-1",
        role: "assistant",
        content: "Ask me any learning or career question. I can break down concepts, recommend next steps, and help you recover when you get stuck.",
        createdAt
      }
    ]
  });

  return {
    id: "user-demo",
    name: "Demo Learner",
    email: "demo@growthos.local",
    passwordHash: hashPassword("demo12345"),
    activeGoalId: "goal-1",
    streak: defaultProgress.streak,
    level: defaultProgress.level,
    weakAreas: defaultProgress.weakAreas,
    sessions: [],
    goals: [
      {
        id: "goal-1",
        title: "Become a job-ready full-stack engineer",
        domain: "engineering",
        targetDate: "2026-08-31",
        hoursPerDay: 2.5,
        performanceScore: 74,
        status: "active"
      },
      {
        id: "goal-2",
        title: "Build a public content system for career visibility",
        domain: "content-creation",
        targetDate: "2026-07-15",
        hoursPerDay: 1,
        performanceScore: 68,
        status: "paused"
      }
    ],
    assets: [
      {
        id: "asset-1",
        title: "AI project assistant",
        type: "project",
        link: "https://github.com/example/ai-project-assistant",
        summary: "Portfolio project proving full-stack execution and API integration.",
        createdAt: "2026-05-01"
      },
      {
        id: "asset-2",
        title: "System design notes",
        type: "note",
        link: "https://www.notion.so/",
        summary: "Revision notebook for backend and scaling concepts.",
        createdAt: "2026-05-06"
      },
      {
        id: "asset-3",
        title: "Frontend certification",
        type: "certificate",
        link: "https://www.coursera.org/",
        summary: "Certificate added as proof of structured learning progress.",
        createdAt: "2026-04-21"
      }
    ],
    reminders: reminderFeed.map((item, index) => ({
      id: `reminder-${index + 1}`,
      text: item,
      dueLabel: index === 0 ? "Today" : index === 1 ? "This week" : index === 2 ? "8:00 PM" : "Sunday",
      completed: false
    })),
    activity: [
      { id: "activity-1", date: "2026-05-07", consistency: 68, productivity: 64, completedTopics: 12 },
      { id: "activity-2", date: "2026-05-08", consistency: 72, productivity: 67, completedTopics: 13 },
      { id: "activity-3", date: "2026-05-09", consistency: 76, productivity: 70, completedTopics: 14 },
      { id: "activity-4", date: "2026-05-10", consistency: 79, productivity: 72, completedTopics: 16 },
      { id: "activity-5", date: "2026-05-11", consistency: 81, productivity: 74, completedTopics: 17 },
      { id: "activity-6", date: "2026-05-12", consistency: 84, productivity: 76, completedTopics: 18 }
    ],
    achievements: achievements.map((item, index) => ({
      id: `achievement-${index + 1}`,
      title: item.title,
      detail: item.detail,
      unlockedAt: `2026-05-0${index + 7}`
    })),
    chatMessages: starterConversation.messages,
    chatConversations: [starterConversation],
    activeChatId: starterConversation.id
  };
}

function normalizeUser(user: UserRecord): UserRecord {
  const fallbackConversation =
    user.chatConversations && user.chatConversations.length > 0
      ? null
      : createConversation({
          id: user.activeChatId || undefined,
          title: "Saved chat",
          domain: user.goals.find((goal) => goal.id === user.activeGoalId)?.domain ?? user.goals[0]?.domain ?? "engineering",
          messages: user.chatMessages
        });

  const normalizedConversations = (user.chatConversations ?? [])
    .map((conversation, index) =>
      createConversation({
        id: conversation.id,
        title: conversation.title || `Chat ${index + 1}`,
        domain: conversation.domain ?? user.goals.find((goal) => goal.id === user.activeGoalId)?.domain ?? "engineering",
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        messages: conversation.messages
      })
    )
    .concat(fallbackConversation ? [fallbackConversation] : []);

  const safeActiveChatId =
    normalizedConversations.find((conversation) => conversation.id === user.activeChatId)?.id ?? normalizedConversations[0]?.id ?? crypto.randomUUID();
  const activeConversation =
    normalizedConversations.find((conversation) => conversation.id === safeActiveChatId) ??
    createConversation({
      id: safeActiveChatId,
      domain: user.goals.find((goal) => goal.id === user.activeGoalId)?.domain ?? user.goals[0]?.domain ?? "engineering"
    });

  const conversations =
    normalizedConversations.length > 0
      ? normalizedConversations.map((conversation) => (conversation.id === activeConversation.id ? activeConversation : conversation))
      : [activeConversation];

  return {
    ...user,
    streak: calculateActivityStreak(user.activity ?? []),
    weakAreas: user.weakAreas ?? [],
    sessions: user.sessions ?? [],
    goals: user.goals ?? [],
    assets: user.assets ?? [],
    reminders: user.reminders ?? [],
    activity: user.activity ?? [],
    achievements: user.achievements ?? [],
    chatMessages: activeConversation.messages,
    chatConversations: conversations,
    activeChatId: activeConversation.id
  };
}

function normalizeDb(db: AppDatabase): AppDatabase {
  return {
    users: (db.users ?? []).map((user) => normalizeUser(user))
  };
}

async function ensureDb() {
  if (isPostgresConfigured()) {
    const pool = getPool();
    if (!pool) {
      return;
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS app_state (
        id INTEGER PRIMARY KEY,
        payload JSONB NOT NULL
      )
    `);

    const existing = await pool.query("SELECT payload FROM app_state WHERE id = 1");
    if (existing.rowCount === 0) {
      const initialDb: AppDatabase = {
        users: [buildDemoUser()]
      };
      await pool.query("INSERT INTO app_state (id, payload) VALUES (1, $1::jsonb)", [JSON.stringify(initialDb)]);
    }
    return;
  }

  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(dbPath);
  } catch {
    const initialDb: AppDatabase = {
      users: [buildDemoUser()]
    };
    await fs.writeFile(dbPath, JSON.stringify(initialDb, null, 2), "utf8");
  }
}

export async function readDb() {
  await ensureDb();

  if (isPostgresConfigured()) {
    const pool = getPool();
    if (!pool) {
      return { users: [] } as AppDatabase;
    }

    const result = await pool.query("SELECT payload FROM app_state WHERE id = 1");
    const normalized = normalizeDb(result.rows[0].payload as AppDatabase);
    await writeDb(normalized);
    return normalized;
  }

  const raw = await fs.readFile(dbPath, "utf8");
  const normalized = normalizeDb(JSON.parse(raw) as AppDatabase);
  await fs.writeFile(dbPath, JSON.stringify(normalized, null, 2), "utf8");
  return normalized;
}

export async function writeDb(data: AppDatabase) {
  await ensureDb();

  if (isPostgresConfigured()) {
    const pool = getPool();
    if (!pool) {
      return;
    }

    await pool.query("UPDATE app_state SET payload = $1::jsonb WHERE id = 1", [JSON.stringify(data)]);
    return;
  }

  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), "utf8");
}

export async function findUserByEmail(email: string) {
  const db = await readDb();
  return db.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function findUserBySession(session: string) {
  const db = await readDb();
  return db.users.find((user) => user.sessions.includes(session)) ?? null;
}

export async function findUserByClerkId(clerkUserId: string) {
  const db = await readDb();
  return db.users.find((user) => user.clerkUserId === clerkUserId) ?? null;
}

export async function createUser(user: UserRecord) {
  const db = await readDb();
  db.users.push(user);
  await writeDb(db);
  return user;
}

export async function upsertClerkUser(input: {
  clerkUserId: string;
  email: string;
  name: string;
}) {
  const existing = await findUserByClerkId(input.clerkUserId);
  if (existing) {
    return updateUser(existing.id, (current) => ({
      ...current,
      email: input.email,
      name: input.name,
      clerkUserId: input.clerkUserId
    }));
  }

  const byEmail = await findUserByEmail(input.email);
  if (byEmail) {
    return updateUser(byEmail.id, (current) => ({
      ...current,
      clerkUserId: input.clerkUserId,
      name: input.name
    }));
  }

  const demo = buildDemoUser();
  const user: UserRecord = {
    ...demo,
    id: crypto.randomUUID(),
    clerkUserId: input.clerkUserId,
    name: input.name,
    email: input.email,
    passwordHash: "",
    sessions: []
  };

  await createUser(user);
  return user;
}

export async function updateUser(userId: string, updater: (user: UserRecord) => UserRecord) {
  const db = await readDb();
  const index = db.users.findIndex((user) => user.id === userId);

  if (index === -1) {
    return null;
  }

  db.users[index] = updater(db.users[index]);
  await writeDb(db);
  return db.users[index];
}

export function publicUser(user: UserRecord): PublicUserRecord {
  const safeUser = normalizeUser(user);
  return {
    id: safeUser.id,
    name: safeUser.name,
    email: safeUser.email,
    activeGoalId: safeUser.activeGoalId,
    streak: safeUser.streak,
    level: safeUser.level,
    weakAreas: safeUser.weakAreas,
    goals: safeUser.goals,
    assets: safeUser.assets,
    reminders: safeUser.reminders,
    activity: safeUser.activity,
    achievements: safeUser.achievements,
    chatMessages: safeUser.chatMessages,
    chatConversations: safeUser.chatConversations,
    activeChatId: safeUser.activeChatId
  };
}
