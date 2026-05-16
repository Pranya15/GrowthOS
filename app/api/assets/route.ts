import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { resolveApiUser } from "@/lib/api-user";
import { publicUser, updateUser } from "@/lib/db";
import { ProjectRecord } from "@/lib/models";

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

  const body = (await readJsonBody(request)) as Partial<ProjectRecord> | null;
  const title = body?.title?.trim();
  const link = body?.link?.trim();

  if (!title || !link) {
    return NextResponse.json({ error: "Asset title and link are required." }, { status: 400 });
  }

  const asset: ProjectRecord = {
    id: crypto.randomUUID(),
    title,
    type: body?.type ?? "project",
    link,
    summary: body?.summary?.trim() ?? "",
    createdAt: new Date().toISOString().slice(0, 10)
  };

  const updated = await updateUser(user.id, (current) => ({
    ...current,
    assets: [asset, ...current.assets]
  }));

  return NextResponse.json(updated ? publicUser(updated) : null);
}
