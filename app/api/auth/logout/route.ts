import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCurrentUser, sessionCookieName } from "@/lib/auth";
import { updateUser } from "@/lib/db";

export async function POST() {
  const sessionStore = await cookies();
  const activeSession = sessionStore.get(sessionCookieName)?.value;
  const user = await getCurrentUser();

  if (user && activeSession) {
    await updateUser(user.id, (current) => ({
      ...current,
      sessions: current.sessions.filter((session) => session !== activeSession)
    }));
  }

  sessionStore.delete(sessionCookieName);
  return NextResponse.json({ ok: true });
}
