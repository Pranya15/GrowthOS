import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { resolveApiUser } from "@/lib/api-user";
import { publicUser, updateUser } from "@/lib/db";

async function readJsonBody(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const user = await resolveApiUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await readJsonBody(request)) as
    | { consistency?: number; productivity?: number; completedTopics?: number }
    | null;

  const updated = await updateUser(user.id, (current) => ({
    ...current,
    activity: [
      ...current.activity,
      {
        id: crypto.randomUUID(),
        date: new Date().toISOString().slice(0, 10),
        consistency: Math.max(0, Math.min(100, Math.round(body?.consistency ?? 0))),
        productivity: Math.max(0, Math.min(100, Math.round(body?.productivity ?? 0))),
        completedTopics: Math.max(0, Math.round(body?.completedTopics ?? 0))
      }
    ]
  }));

  return NextResponse.json(updated ? publicUser(updated) : null);
}
