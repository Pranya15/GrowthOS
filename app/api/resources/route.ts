import { NextRequest, NextResponse } from "next/server";
import { generateResourceRecommendations } from "@/lib/ai";
import { DomainKey } from "@/lib/types";

async function readJsonBody(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const body = (await readJsonBody(request)) as { domain?: DomainKey; goal?: string } | null;
  const data = await generateResourceRecommendations(body?.domain ?? "engineering", body?.goal?.trim() || "Career growth");
  return NextResponse.json(data);
}
