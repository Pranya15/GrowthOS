import { buildMentorReply, buildStaticResourceRecommendations, getBlueprint } from "@/lib/data";
import { ChatMessageRecord } from "@/lib/models";
import { DomainKey, MentorReply } from "@/lib/types";

type ChatMode = "study-help" | "career-advice" | "project-review" | "exam-strategy";

interface ResourceRecommendation {
  summary: string;
  recommendedResources: Array<{
    title: string;
    reason: string;
    link: string;
  }>;
}

function cleanChatText(value: string) {
  return value
    .replace(/\\n/g, "\n")
    .replace(/\*\*/g, "")
    .replace(/^[*-]\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanChatPayload(payload: {
  answer: string;
  quickActions: string[];
  followUp: string;
}) {
  return {
    answer: cleanChatText(payload.answer),
    quickActions: payload.quickActions.map((item) => cleanChatText(item)).filter(Boolean).slice(0, 3),
    followUp: cleanChatText(payload.followUp)
  };
}

async function callGemini(systemPrompt: string, userPrompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.8,
          responseMimeType: "application/json"
        }
      }),
      cache: "no-store"
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            text?: string;
          }>;
        };
      }>;
    };

    return data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? null;
  } catch {
    return null;
  }
}

async function callOpenAI(systemPrompt: string, userPrompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content: [{ type: "input_text", text: systemPrompt }]
          },
          {
            role: "user",
            content: [{ type: "input_text", text: userPrompt }]
          }
        ]
      }),
      cache: "no-store"
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      output_text?: string;
    };

    return data.output_text ?? null;
  } catch {
    return null;
  }
}

export async function generateMentorReply(prompt: string, domain: DomainKey): Promise<MentorReply> {
  const blueprint = getBlueprint(domain);
  const fallback = buildMentorReply(prompt, domain);

  const aiText = await callOpenAI(
    "You are an AI learning mentor. Answer briefly and practically. Return JSON with answer, nextSteps, warnings.",
    `Domain: ${blueprint.label}
Prompt: ${prompt}
Career tracks: ${blueprint.careerTracks.join(", ")}
Portfolio ideas: ${blueprint.portfolioIdeas.join(", ")}`
  );

  if (!aiText) {
    return fallback;
  }

  try {
    return JSON.parse(aiText) as MentorReply;
  } catch {
    return {
      ...fallback,
      answer: aiText
    };
  }
}

export async function generateResourceRecommendations(domain: DomainKey, goal: string): Promise<ResourceRecommendation> {
  const blueprint = getBlueprint(domain);
  const fallback = buildStaticResourceRecommendations(domain, goal);

  const aiText = await callOpenAI(
    "You recommend practical learning resources. Return JSON with summary and recommendedResources array of title, reason, link.",
    `Domain: ${blueprint.label}
Goal: ${goal}
Available curated resources: ${blueprint.resources.map((item) => `${item.title} (${item.link})`).join("; ")}
Weekly study tracks: ${blueprint.weeklyPlanTemplate.map((week) => `${week.title}: ${week.links.map((item) => item.title).join(", ")}`).join("; ")}`
  );

  if (!aiText) {
    return fallback;
  }

  try {
    return JSON.parse(aiText) as ResourceRecommendation;
  } catch {
    return {
      ...fallback,
      summary: aiText
    };
  }
}

export async function generateChatbotReply(args: {
  prompt: string;
  domain: DomainKey;
  history: ChatMessageRecord[];
  userName?: string;
  mode: ChatMode;
}) {
  const blueprint = getBlueprint(args.domain);
  const fallbackMentor = buildMentorReply(args.prompt, args.domain);
  const modeInstructions: Record<ChatMode, string> = {
    "study-help": "Resolve concept doubts, explain simply, break learning into small steps, and recommend practice.",
    "career-advice": "Give practical career guidance, next moves, portfolio advice, and job-readiness direction.",
    "project-review": "Help scope projects, suggest improvements, review execution quality, and propose better deliverables.",
    "exam-strategy": "Help with preparation strategy, revision cycles, mock analysis, weak areas, and score improvement."
  };
  const historyText = args.history
    .slice(-8)
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join("\n");

  const geminiPrompt = `User: ${args.userName ?? "Learner"}
Domain: ${blueprint.label}
Mode: ${args.mode}
Mode instruction: ${modeInstructions[args.mode]}
Current goal examples: ${blueprint.portfolioIdeas.join(", ")}
Career tracks: ${blueprint.careerTracks.join(", ")}
Recent chat:
${historyText || "No prior messages."}

New query:
${args.prompt}

Requirements:
- Make the answer specific to the user's actual question
- Give a deeper explanation when needed
- Mention concrete next steps instead of repeating generic advice
- If the user asks for comparison, provide a comparison
- If the user asks how to do something, provide a step-by-step answer
- quickActions must contain 3 short actionable items
- followUp must be one smart next question the user should ask`;

  const aiText =
    (await callGemini(
      "You are an AI query-resolution chatbot for a learning and career growth platform. Answer the user's exact question in a detailed, specific, practical way. Avoid generic encouragement. Return valid JSON with keys: answer, quickActions, followUp.",
      geminiPrompt
    )) ??
    (await callOpenAI(
      "You are a detailed AI query-resolution chatbot for learning and career growth. Return JSON with answer, quickActions, followUp.",
      `User: ${args.userName ?? "Learner"}
Domain: ${blueprint.label}
Mode: ${args.mode}
Mode instruction: ${modeInstructions[args.mode]}
Career tracks: ${blueprint.careerTracks.join(", ")}
Recent chat:
${historyText}

New query:
${args.prompt}`
    ));

  if (!aiText) {
    return cleanChatPayload({
      answer: `${fallbackMentor.answer} (${args.mode.replace("-", " ")})`,
      quickActions: fallbackMentor.nextSteps,
      followUp: fallbackMentor.warnings[0] ?? "Ask for a step-by-step breakdown if you need it."
    });
  }

  try {
    return cleanChatPayload(JSON.parse(aiText) as {
      answer: string;
      quickActions: string[];
      followUp: string;
    });
  } catch {
    return cleanChatPayload({
      answer: aiText,
      quickActions: fallbackMentor.nextSteps,
      followUp: "Ask another question to continue the thread."
    });
  }
}
