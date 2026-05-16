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

  const body = (await readJsonBody(request)) as { text?: string; dueLabel?: string } | null;
  const text = body?.text?.trim();

  if (!text) {
    return NextResponse.json({ error: "Reminder text is required." }, { status: 400 });
  }

  const updated = await updateUser(user.id, (current) => ({
    ...current,
    reminders: [
      {
        id: crypto.randomUUID(),
        text,
        dueLabel: body?.dueLabel?.trim() || "Soon",
        completed: false
      },
      ...current.reminders
    ]
  }));

  return NextResponse.json(updated ? publicUser(updated) : null);
}

export async function PATCH(request: NextRequest) {
  const user = await resolveApiUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await readJsonBody(request)) as { id?: string; completed?: boolean } | null;
  if (!body?.id || typeof body.completed !== "boolean") {
    return NextResponse.json({ error: "Reminder id and completed state are required." }, { status: 400 });
  }
  const completed = body.completed;

  const updated = await updateUser(user.id, (current) => ({
    ...current,
    reminders: current.reminders.map((reminder) =>
      reminder.id === body.id ? { ...reminder, completed } : reminder
    )
  }));

  return NextResponse.json(updated ? publicUser(updated) : null);
}
