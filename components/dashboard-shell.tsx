"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { DashboardClient } from "@/components/dashboard-client";
import { firebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { ensureFirestoreUser, subscribeToWorkspaceUser } from "@/lib/firebase-user";
import { PublicUserRecord } from "@/lib/models";

export function DashboardShell() {
  const router = useRouter();
  const [user, setUser] = useState<PublicUserRecord | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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
        setError(nextError instanceof Error ? nextError.message : "Could not load workspace.");
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeUser?.();
    };
  }, [router]);

  if (loading) {
    return <div className="section-shell p-6 text-sm text-slate-300">Loading workspace...</div>;
  }

  if (error) {
    return <div className="section-shell p-6 text-sm text-rose-300">{error}</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-black mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-pulse">Growth workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl md:text-5xl">Your AI learning and career command center</h1>
        </div>
        <Link href="/" className="w-full rounded-full border border-slate-700 px-5 py-3 text-center text-sm font-semibold text-slate-300 sm:w-auto">
          Back to overview
        </Link>
      </div>

      <DashboardClient userId={user.id} initialUser={user} />
    </main>
  );
}
