import crypto from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createUser, findUserByEmail } from "@/lib/db";
import { createSessionToken, hashPassword, sessionCookieName } from "@/lib/auth";
import { achievements, defaultProgress, reminderFeed } from "@/lib/data";
import { UserRecord } from "@/lib/models";

async function readJsonBody(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function buildNewUser(name: string, email: string, password: string, session: string): UserRecord {
  const createdAt = new Date().toISOString();
  const conversationId = crypto.randomUUID();

  return {
    id: crypto.randomUUID(),
    name,
    email,
    passwordHash: hashPassword(password),
    activeGoalId: "goal-starter",
    streak: defaultProgress.streak,
    level: defaultProgress.level,
    weakAreas: defaultProgress.weakAreas,
    sessions: [session],
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
    chatMessages: [
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Welcome. Ask for a roadmap, study help, or career guidance to start your workspace.",
        createdAt
      }
    ],
    chatConversations: [
      {
        id: conversationId,
        title: "Getting started",
        domain: "engineering",
        createdAt,
        updatedAt: createdAt,
        messages: [
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Welcome. Ask for a roadmap, study help, or career guidance to start your workspace.",
            createdAt
          }
        ]
      }
    ],
    activeChatId: conversationId
  };
}

export async function POST(request: NextRequest) {
  const body = (await readJsonBody(request)) as { name?: string; email?: string; password?: string } | null;
  const name = body?.name?.trim();
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password ?? "";

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const session = createSessionToken();
  await createUser(buildNewUser(name, email, password, session));

  const store = await cookies();
  store.set(sessionCookieName, session, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });

  return NextResponse.json({ ok: true });
}
