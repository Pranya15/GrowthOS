"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { PublicUserRecord } from "@/lib/models";
import { DomainKey } from "@/lib/types";

const LazyChatbotPanel = dynamic(() => import("@/components/chatbot-panel").then((mod) => mod.ChatbotPanel), {
  ssr: false,
  loading: () => <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-600">Loading assistant...</div>
});

export function ChatbotPageClient({
  userId,
  initialUser,
  initialDomain
}: {
  userId: string;
  initialUser: PublicUserRecord;
  initialDomain: DomainKey;
}) {
  const [user, setUser] = useState(initialUser);

  return <LazyChatbotPanel userId={userId} user={user} selectedDomain={initialDomain} onUserUpdate={setUser} />;
}
