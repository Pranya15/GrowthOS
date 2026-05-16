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
    quickActions: payload.quickActions
      .map((item) => cleanChatText(item))
      .filter(Boolean)
      .slice(0, 3),

    followUp: cleanChatText(payload.followUp)
  };
}

async function callGemini(
  systemPrompt: string,
  userPrompt: string
) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log("Gemini API key missing");
    return null;
  }

  const model =
    process.env.GEMINI_MODEL ??
    "gemini-2.5-flash";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          contents: [
            {
              role: "user",

              parts: [
                {
                  text: `${systemPrompt}\n\n${userPrompt}`
                }
              ]
            }
          ],

          generationConfig: {
            temperature: 0.9,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 2048
          }
        }),

        cache: "no-store"
      }
    );

    console.log(
      "Gemini status:",
      response.status
    );

    if (!response.ok) {
      const errorText =
        await response.text();

      console.log(
        "Gemini error:",
        errorText
      );

      return null;
    }

    const data = await response.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]
        ?.text;

    if (!text) {
      return null;
    }

    return text.trim();
  } catch (error) {
    console.log(
      "Gemini fetch error:",
      error
    );

    return null;
  }
}

async function callOpenAI(
  systemPrompt: string,
  userPrompt: string
) {
  const apiKey =
    process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${apiKey}`
        },

        body: JSON.stringify({
          model:
            process.env.OPENAI_MODEL ??
            "gpt-4.1-mini",

          input: [
            {
              role: "system",

              content: [
                {
                  type: "input_text",
                  text: systemPrompt
                }
              ]
            },

            {
              role: "user",

              content: [
                {
                  type: "input_text",
                  text: userPrompt
                }
              ]
            }
          ]
        }),

        cache: "no-store"
      }
    );

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

export async function generateMentorReply(
  prompt: string,
  domain: DomainKey
): Promise<MentorReply> {
  const blueprint =
    getBlueprint(domain);

  const fallback =
    buildMentorReply(prompt, domain);

  const aiText =
    await callOpenAI(
      "You are an AI learning mentor. Answer briefly and practically.",

      `Domain: ${blueprint.label}
Prompt: ${prompt}`
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

export async function generateResourceRecommendations(
  domain: DomainKey,
  goal: string
): Promise<ResourceRecommendation> {
  const blueprint =
    getBlueprint(domain);

  const fallback =
    buildStaticResourceRecommendations(
      domain,
      goal
    );

  const aiText =
    await callOpenAI(
      "You recommend practical learning resources.",

      `Domain: ${blueprint.label}
Goal: ${goal}`
    );

  if (!aiText) {
    return fallback;
  }

  try {
    return JSON.parse(
      aiText
    ) as ResourceRecommendation;
  } catch {
    return {
      ...fallback,
      summary: aiText
    };
  }
}

export async function generateChatbotReply(
  args: {
    prompt: string;
    domain: DomainKey;
    history: ChatMessageRecord[];
    userName?: string;
    mode: ChatMode;
  }
) {
  const blueprint =
    getBlueprint(args.domain);

  const fallbackMentor =
    buildMentorReply(
      args.prompt,
      args.domain
    );

  const modeInstructions: Record<
    ChatMode,
    string
  > = {
    "study-help":
      "Resolve concept doubts simply.",

    "career-advice":
      "Give practical career guidance.",

    "project-review":
      "Help improve projects.",

    "exam-strategy":
      "Help with exam preparation."
  };

  const historyText = args.history
    .slice(-8)
    .map(
      (message) =>
        `${message.role.toUpperCase()}: ${message.content}`
    )
    .join("\n");

  const aiText =
    (await callGemini(
      "You are a smart AI chatbot. Give detailed, practical, dynamic answers based on the user's exact question. Avoid generic responses.",

      `User: ${
        args.userName ?? "Learner"
      }

Domain: ${blueprint.label}

Mode: ${args.mode}

Instruction:
${modeInstructions[args.mode]}

Recent chat:
${historyText || "No prior messages"}

User question:
${args.prompt}`
    )) ??

    (await callOpenAI(
      "You are a smart AI chatbot.",

      `Question: ${args.prompt}`
    ));

  if (!aiText) {
    return cleanChatPayload({
      answer: `${fallbackMentor.answer}`,

      quickActions:
        fallbackMentor.nextSteps,

      followUp:
        fallbackMentor.warnings[0] ??
        "Ask another question."
    });
  }

  try {
    const parsed = JSON.parse(aiText);

    return cleanChatPayload({
      answer:
        parsed.answer || aiText,

      quickActions:
        parsed.quickActions || [
          "Ask for examples",
          "Request roadmap",
          "Continue learning"
        ],

      followUp:
        parsed.followUp ||
        "Ask another related question."
    });
  } catch {
    return cleanChatPayload({
      answer: aiText,

      quickActions: [
        "Ask for examples",
        "Request roadmap",
        "Continue learning"
      ],

      followUp:
        "Ask another related question."
    });
  }
}