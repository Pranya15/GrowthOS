"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import { toClientErrorMessage } from "@/lib/client-errors";

import {
  clearChatHistoryInFirestore,
  saveChatReplyInFirestore
} from "@/lib/firebase-user";

import {
  ChatConversationRecord,
  ChatMessageRecord,
  PublicUserRecord
} from "@/lib/models";

import { DomainKey } from "@/lib/types";

type ChatMode =
  | "study-help"
  | "career-advice"
  | "project-review"
  | "exam-strategy";

type ReplyPayload = {
  answer: string;
  quickActions: string[];
  followUp: string[];
};

const chatModes = [
  {
    id: "study-help",
    label: "Study Help",
    description: "Explain concepts and remove learning blockers."
  },
  {
    id: "career-advice",
    label: "Career Advice",
    description: "Guide next career moves."
  },
  {
    id: "project-review",
    label: "Project Review",
    description: "Improve projects and portfolio."
  },
  {
    id: "exam-strategy",
    label: "Exam Strategy",
    description: "Plan revision and score improvement."
  }
] as const;

function formatMessageTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function createDraftConversation(
  domain: DomainKey
): ChatConversationRecord {
  const createdAt = new Date().toISOString();

  return {
    id: `draft-${createdAt}`,
    title: "New chat",
    domain,
    createdAt,
    updatedAt: createdAt,
    messages: [
      {
        id: `draft-message-${createdAt}`,
        role: "assistant",
        content:
          "Start a new conversation. Previous chats stay saved.",
        createdAt
      }
    ]
  };
}

const ChatBubble = memo(function ChatBubble({
  message
}: {
  message: ChatMessageRecord;
}) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-7 ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-slate-200 text-slate-800"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold">
            {isUser ? "You" : "AI"}
          </p>

          <p className="text-[10px] opacity-70">
            {formatMessageTime(message.createdAt)}
          </p>
        </div>

        <p className="mt-2 whitespace-pre-wrap">
          {message.content}
        </p>
      </div>
    </div>
  );
});

export function ChatbotPanel({
  userId,
  user,
  selectedDomain,
  onUserUpdate
}: {
  userId: string;
  user: PublicUserRecord;
  selectedDomain: DomainKey;
  onUserUpdate: (user: PublicUserRecord) => void;
}) {
  const [mode, setMode] =
    useState<ChatMode>("study-help");

  const [prompt, setPrompt] = useState("");

  const [loading, setLoading] = useState(false);

  const [reply, setReply] =
    useState<ReplyPayload | null>(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [draftConversation, setDraftConversation] =
    useState<ChatConversationRecord | null>(null);

  const [selectedConversationId, setSelectedConversationId] =
    useState(user.activeChatId);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  const conversations = useMemo(() => {
    return draftConversation
      ? [draftConversation, ...user.chatConversations]
      : user.chatConversations;
  }, [draftConversation, user.chatConversations]);

  const selectedConversation = useMemo(() => {
    return (
      conversations.find(
        (conversation) =>
          conversation.id === selectedConversationId
      ) || conversations[0]
    );
  }, [conversations, selectedConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [selectedConversation, reply]);

  const askChatbot = useCallback(async () => {
    if (!prompt.trim()) {
      return;
    }

    setLoading(true);

    setErrorMessage("");

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          domain: selectedDomain,
          prompt,
          mode,

          history:
            selectedConversation?.messages ?? [],

          userName: user.name
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(
          data?.error || "Chat request failed."
        );

        return;
      }

      setReply(data.reply);

      const updatedUser =
        await saveChatReplyInFirestore(userId, {
          prompt,
          answer: data.reply.answer,
          domain: selectedDomain,
          mode
        });

      onUserUpdate(updatedUser);

      setPrompt("");

    } catch (error) {
      setErrorMessage(
        toClientErrorMessage(
          error,
          "Chat request failed."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [
    mode,
    onUserUpdate,
    prompt,
    selectedConversation,
    selectedDomain,
    user.name,
    userId
  ]);

  return (
    <section className="w-full p-4 sm:p-6">

      <div className="rounded-2xl bg-slate-100 p-4">

        <div className="mb-4 flex flex-wrap gap-2">
          {chatModes.map((item) => (
            <button
              key={item.id}
              onClick={() => setMode(item.id)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                mode === item.id
                  ? "bg-blue-600 text-white"
                  : "bg-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mb-4 h-[70vh] overflow-hidden rounded-2xl bg-white">

          <div
            className="flex h-full flex-col gap-4 overflow-y-auto p-4"
            style={{
              scrollBehavior: "smooth"
            }}
          >

            {selectedConversation?.messages.map(
              (message) => (
                <ChatBubble
                  key={message.id}
                  message={message}
                />
              )
            )}

            <div ref={messagesEndRef} />

          </div>

        </div>

        <textarea
          rows={4}
          value={prompt}
          onChange={(e) =>
            setPrompt(e.target.value)
          }
          placeholder="Ask anything..."
          className="w-full rounded-2xl border border-slate-300 p-4 outline-none"
        />

        <button
          onClick={askChatbot}
          disabled={loading}
          className="mt-4 w-full rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white"
        >
          {loading
            ? "Thinking..."
            : "Ask Chatbot"}
        </button>

        {errorMessage ? (
          <p className="mt-3 text-sm text-red-500">
            {errorMessage}
          </p>
        ) : null}

      </div>

    </section>
  );
}