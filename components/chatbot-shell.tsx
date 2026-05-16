"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { ChatbotPageClient } from "@/components/chatbot-page-client";
import { firebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { ensureFirestoreUser, subscribeToWorkspaceUser } from "@/lib/firebase-user";
import { PublicUserRecord } from "@/lib/models";

export function ChatbotShell() {
  const router = useRouter();
  const [user, setUser] = useState<PublicUserRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isFirebaseConfigured() || !firebaseAuth) {
      setError("Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* values.");
      setLoading(false);
      return;
    }

    let unsubscribeUser: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(firebaseAuth, async (authUser) => {
      if (!authUser) {
        setLoading(false);
        router.replace("/auth");
        return;
      }

      try {
        await ensureFirestoreUser(authUser);
        unsubscribeUser?.();
        unsubscribeUser = subscribeToWorkspaceUser(authUser.uid, (nextUser) => {
          setUser(nextUser);
          setLoading(false);
        });
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Could not load chatbot workspace.");
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeUser?.();
    };
  }, [router]);

  if (loading) {
    return <div className="section-shell p-6 text-sm text-slate-300">Loading assistant...</div>;
  }

  if (error) {
    return <div className="section-shell p-6 text-sm text-rose-300">{error}</div>;
  }

  if (!user) {
    return null;
  }

  const activeGoal = user.goals.find((goal) => goal.id === user.activeGoalId) ?? user.goals[0];

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

      <ChatbotPageClient userId={user.id} initialUser={user} initialDomain={activeGoal?.domain ?? "engineering"} />
    </main>
  );
}
