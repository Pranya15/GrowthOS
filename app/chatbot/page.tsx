import Link from "next/link";
import { ChatbotPageClient } from "@/components/chatbot-page-client";
import { staticUser } from "@/lib/static-user";

export default function ChatbotPage() {
  const activeGoal = staticUser.goals.find((goal) => goal.id === staticUser.activeGoalId) ?? staticUser.goals[0];

  return (
    <main className="mx-auto max-w-7xl px-6 py-8 md:px-10 md:py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-pulse">Assistant workspace</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-100 md:text-5xl">AI chatbot for doubt resolution and career guidance</h1>
        </div>
        <Link href="/dashboard" className="rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300">
          Back to dashboard
        </Link>
      </div>

      <ChatbotPageClient initialUser={staticUser} initialDomain={activeGoal?.domain ?? "engineering"} />
    </main>
  );
}
