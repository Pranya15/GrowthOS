"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { toClientErrorMessage } from "@/lib/client-errors";
import { ChatConversationRecord, ChatMessageRecord, PublicUserRecord } from "@/lib/models";
import { DomainKey } from "@/lib/types";

type ChatMode = "study-help" | "career-advice" | "project-review" | "exam-strategy";

type ReplyPayload = {
  answer: string;
  quickActions: string[];
  followUp: string;
};

const chatModes: Array<{
  id: ChatMode;
  label: string;
  description: string;
}> = [
  { id: "study-help", label: "Study Help", description: "Explain concepts and remove learning blockers." },
  { id: "career-advice", label: "Career Advice", description: "Guide next moves, job readiness, and positioning." },
  { id: "project-review", label: "Project Review", description: "Improve project quality, scope, and portfolio value." },
  { id: "exam-strategy", label: "Exam Strategy", description: "Plan revision, mocks, and score improvement." }
];

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

function buildConversationLabel(conversation: ChatConversationRecord) {
  const firstUserMessage = conversation.messages.find((message) => message.role === "user");
  return firstUserMessage?.content || conversation.title || "New chat";
}

function createDraftConversation(domain: DomainKey): ChatConversationRecord {
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
        content: "Start a new conversation. Your previous chats stay saved in the sidebar.",
        createdAt
      }
    ]
  };
}

const ChatBubble = memo(function ChatBubble({ message }: { message: ChatMessageRecord }) {
  const isUser = message.role === "user";
  const paragraphs = useMemo(
    () =>
      message.content
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    [message.content]
  );

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`w-fit max-w-full sm:max-w-[90%] rounded-3xl px-4 py-3 text-sm leading-7 ${isUser ? "bg-ink text-white" : "bg-slate-100 text-slate-700"}`}>
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
          <p className={`text-xs font-semibold uppercase tracking-[0.15em] ${isUser ? "text-slate-300" : "text-slate-500"}`}>{isUser ? "You" : "AI mentor"}</p>
          <p className={`text-xs ${isUser ? "text-slate-300" : "text-slate-500"}`}>{formatMessageTime(message.createdAt)}</p>
        </div>
        {message.mode ? <p className={`mt-1 text-[11px] uppercase tracking-[0.15em] ${isUser ? "text-slate-300" : "text-slate-400"}`}>{message.mode.replace("-", " ")}</p> : null}
        <div className="mt-3 space-y-3">
          {paragraphs.map((paragraph, index) => (
            <p key={`${message.id}-${index}`}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
});

export function ChatbotPanel({
  user,
  selectedDomain,
  onUserUpdate,
  compact = false
}: {
  user: PublicUserRecord;
  selectedDomain: DomainKey;
  onUserUpdate: (user: PublicUserRecord) => void;
  compact?: boolean;
}) {
  const [mode, setMode] = useState<ChatMode>("study-help");
  const [prompt, setPrompt] = useState("Help me solve my current problem step by step.");
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [reply, setReply] = useState<ReplyPayload | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [draftConversation, setDraftConversation] = useState<ChatConversationRecord | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState(user.activeChatId);

  const conversations = useMemo(
    () => (draftConversation ? [draftConversation, ...user.chatConversations] : user.chatConversations),
    [draftConversation, user.chatConversations]
  );
  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) ?? conversations[0] ?? draftConversation,
    [conversations, draftConversation, selectedConversationId]
  );

  useEffect(() => {
    setSelectedConversationId((currentId) => {
      if (currentId && conversations.some((conversation) => conversation.id === currentId)) {
        return currentId;
      }
      return user.activeChatId;
    });
  }, [conversations, user.activeChatId]);

  useEffect(() => {
    setDraftConversation((currentDraft) => (currentDraft && user.chatConversations.some((conversation) => conversation.id === currentDraft.id) ? null : currentDraft));
  }, [user.chatConversations]);

  const askChatbot = useCallback(async () => {
    if (!prompt.trim()) {
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: selectedDomain,
          prompt,
          mode,
          conversationId: selectedConversation?.id.startsWith("draft-") ? undefined : selectedConversation?.id,
          createNew: selectedConversation?.id.startsWith("draft-") ?? false
        })
      });

      if (!response.ok) {
        setErrorMessage("Chat request failed.");
        return;
      }

      const data = (await response.json()) as {
        reply: ReplyPayload;
        user: PublicUserRecord | null;
      };
      setReply(data.reply);
      if (data.user) {
        onUserUpdate(data.user);
        setDraftConversation(null);
        setSelectedConversationId(data.user.activeChatId);
      }
      setPrompt("");
    } catch (error) {
      setErrorMessage(toClientErrorMessage(error, "Chat request failed."));
    } finally {
      setLoading(false);
    }
  }, [mode, onUserUpdate, prompt, selectedConversation, selectedDomain]);

  const clearHistory = useCallback(async () => {
    const shouldSkipClear =
      user.chatConversations.length <= 1 &&
      (selectedConversation?.messages.length ?? 0) <= 1 &&
      !draftConversation;

    if (shouldSkipClear) {
      setReply(null);
      return;
    }

    setClearing(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/chatbot", {
        method: "DELETE"
      });

      if (!response.ok) {
        setErrorMessage("Could not clear chat history.");
        return;
      }

      const data = (await response.json()) as { user: PublicUserRecord | null };
      if (data.user) {
        onUserUpdate(data.user);
        setSelectedConversationId(data.user.activeChatId);
      }
      setDraftConversation(null);
      setReply(null);
    } catch (error) {
      setErrorMessage(toClientErrorMessage(error, "Could not clear chat history."));
    } finally {
      setClearing(false);
    }
  }, [draftConversation, onUserUpdate, selectedConversation?.messages.length, user.chatConversations.length]);

  const startNewChat = useCallback(() => {
    const nextDraft = createDraftConversation(selectedDomain);
    setDraftConversation(nextDraft);
    setSelectedConversationId(nextDraft.id);
    setReply(null);
    setPrompt("Help me solve my current problem step by step.");
  }, [selectedDomain]);

  return (
    <section className="section-shell p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-pulse">Chatbot</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Saved chat threads with a reviewable history sidebar</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            Start a fresh chat when you want a new thread, reopen older conversations from the sidebar, and clear the full saved history only when you want a reset.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={startNewChat} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
            New chat
          </button>
          <button onClick={clearHistory} disabled={clearing} className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 disabled:opacity-60">
            {clearing ? "Clearing..." : "Clear history"}
          </button>
        </div>
      </div>

      <div className={`mt-6 grid gap-6 xl:gap-8 ${compact ? "lg:grid-cols-2 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1.2fr)]" : "lg:grid-cols-2 xl:grid-cols-[minmax(0,0.75fr)_minmax(0,0.95fr)_minmax(0,1.3fr)]"}`}>
        <aside className="min-w-0 rounded-[28px] bg-slate-50 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Past history</p>
              <p className="mt-1 text-sm text-slate-600">{user.chatConversations.length} saved chats</p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">Sidebar</span>
          </div>

          <div className="mt-4 grid gap-3 overflow-y-auto overscroll-contain pr-1 [scrollbar-gutter:stable] lg:max-h-[28rem]">
            {conversations.map((conversation) => {
              const isActive = conversation.id === selectedConversation?.id;
              const isDraft = conversation.id.startsWith("draft-");
              return (
                <button
                  key={conversation.id}
                  onClick={() => {
                    setSelectedConversationId(conversation.id);
                    setReply(null);
                  }}
                  className={`rounded-3xl border p-4 text-left transition ${isActive ? "border-pulse bg-sky-50" : "border-slate-200 bg-white"}`}
                >
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink">{conversation.title}</p>
                      <p className="mt-2 break-words text-sm leading-6 text-slate-600">{buildConversationLabel(conversation)}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] ${isDraft ? "bg-cyan-100 text-cyan-700" : "bg-slate-100 text-slate-600"}`}>
                      {isDraft ? "Draft" : "Saved"}
                    </span>
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.15em] text-slate-400">{formatMessageTime(conversation.updatedAt)}</p>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="min-w-0">
          <p className="text-sm uppercase tracking-[0.24em] text-pulse">Chat options</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {chatModes.map((item) => (
              <button
                key={item.id}
                onClick={() => setMode(item.id)}
                className={`rounded-3xl border p-4 text-left ${mode === item.id ? "border-pulse bg-sky-50" : "border-slate-200 bg-white"}`}
              >
                <h3 className="font-semibold text-ink">{item.label}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              </button>
            ))}
          </div>

          <textarea
            rows={compact ? 5 : 6}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            className="mt-6 w-full rounded-3xl border border-slate-200 px-4 py-4 outline-none focus:border-pulse"
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={askChatbot} disabled={loading} className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
              {loading ? "Resolving..." : "Ask chatbot"}
            </button>
          </div>
          {errorMessage ? <p className="mt-3 text-sm text-rose-600">{errorMessage}</p> : null}

          {reply ? (
            <div className="mt-5 space-y-4 rounded-3xl bg-slate-50 p-5">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Latest reply</p>
                <p className="mt-3 text-sm leading-7 text-slate-700">{reply.answer}</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Quick actions</p>
                <div className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                  {reply.quickActions.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Follow-up</p>
                <p className="mt-2 text-sm leading-6 text-cyan-700">{reply.followUp}</p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="min-w-0 rounded-[28px] bg-slate-50 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Conversation view</p>
              <p className="mt-1 text-sm text-slate-600">{selectedConversation?.messages.length ?? 0} messages in this thread</p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">
              {selectedConversation?.id.startsWith("draft-") ? "Draft thread" : "Saved thread"}
            </span>
          </div>
          <div className="mt-4 grid gap-3 overflow-y-auto overscroll-contain pr-1 [scrollbar-gutter:stable] lg:max-h-[28rem]">
            {selectedConversation?.messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
