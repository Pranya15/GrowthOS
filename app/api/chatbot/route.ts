import { NextRequest, NextResponse } from "next/server";
import { generateChatbotReply } from "@/lib/ai";
import { ChatMessageRecord } from "@/lib/models";
import { DomainKey } from "@/lib/types";

type ChatMode = "study-help" | "career-advice" | "project-review" | "exam-strategy";

async function readJsonBody(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const body = (await readJsonBody(request)) as
    | {
        prompt?: string;
        domain?: DomainKey;
        mode?: ChatMode;
        history?: ChatMessageRecord[];
        userName?: string;
      }
    | null;

  const prompt = body?.prompt?.trim();
  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
  }

  const domain = body?.domain ?? "engineering";
  const mode = body?.mode ?? "study-help";
  const history = body?.history ?? [];

  const reply = await generateChatbotReply({
    prompt,
    domain,
    history,
    userName: body?.userName,
    mode
  });

  return NextResponse.json({ reply });
}
