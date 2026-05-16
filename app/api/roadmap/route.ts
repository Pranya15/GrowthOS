import { NextRequest, NextResponse } from "next/server";
import { buildAdaptivePlan } from "@/lib/data";
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
    | { domain?: DomainKey; hoursPerDay?: number; performanceScore?: number }
    | null;

  return NextResponse.json(
    buildAdaptivePlan(body?.domain ?? "engineering", body?.hoursPerDay ?? 2, body?.performanceScore ?? 70)
  );
}
