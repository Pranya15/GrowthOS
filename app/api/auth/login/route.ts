import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, updateUser } from "@/lib/db";
import { createSessionToken, hashPassword, sessionCookieName } from "@/lib/auth";

async function readJsonBody(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const body = (await readJsonBody(request)) as { email?: string; password?: string } | null;
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const user = await findUserByEmail(email);
  if (!user || user.passwordHash !== hashPassword(password)) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const session = createSessionToken();
  await updateUser(user.id, (current) => ({
    ...current,
    sessions: [...new Set([...current.sessions, session])]
  }));

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
