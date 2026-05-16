import { NextRequest, NextResponse } from "next/server";
import { buildPlanner } from "@/lib/data";
import { DomainKey } from "@/lib/types";

async function readJsonBody(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const body = (await readJsonBody(request)) as
    | { domain?: DomainKey; hoursPerDay?: number; availableDays?: string[] }
    | null;

  return NextResponse.json(
    buildPlanner(
      body?.domain ?? "engineering",
      body?.hoursPerDay ?? 2,
      body?.availableDays?.length ? body.availableDays : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    )
  );
}
