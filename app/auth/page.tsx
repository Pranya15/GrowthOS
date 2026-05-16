"use client";

import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toClientErrorMessage } from "@/lib/client-errors";
import { firebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { ensureFirestoreUser } from "@/lib/firebase-user";

const featureCards = [
  {
    title: "Adaptive roadmaps",
    detail: "The system reshapes your learning path based on domain, available time, and performance signals."
  },
  {
    title: "Saved AI chat threads",
    detail: "Your questions, mentor replies, and past conversations stay reviewable inside the chatbot workspace."
  },
  {
    title: "Portfolio and proof",
    detail: "Projects, certificates, notes, and links are stored next to your active goals instead of scattered across tools."
  }
];

const workflowSteps = [
  "Choose or create a goal after login.",
  "Generate roadmaps, resources, and weekly plans around that goal.",
  "Use the chatbot, reminders, and analytics to stay on track over time."
];

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!firebaseAuth || !isFirebaseConfigured()) {
      return;
    }

    return onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        router.replace("/dashboard");
      }
    });
  }, [router]);

  async function authenticate() {
    setError("");
    const cleanEmail = email.trim();
    const cleanName = name.trim();

    if (!cleanEmail || !password) {
      setError("Enter your email and password.");
      return;
    }

    setSubmitting(true);
    try {
      if (!firebaseAuth || !isFirebaseConfigured()) {
        setError("Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* values.");
        return;
      }

      if (mode === "login") {
        const credentials = await signInWithEmailAndPassword(firebaseAuth, cleanEmail, password);
        await ensureFirestoreUser(credentials.user);
      } else {
        const credentials = await createUserWithEmailAndPassword(firebaseAuth, cleanEmail, password);
        if (cleanName) {
          await updateProfile(credentials.user, { displayName: cleanName });
        }
        await ensureFirestoreUser(credentials.user);
      }

      router.replace("/dashboard");
      router.refresh();
      window.location.assign("/dashboard");
    } catch (error) {
      setError(toClientErrorMessage(error, "Authentication failed."));
    } finally {
      setSubmitting(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await authenticate();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-10 md:px-10">
      <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="section-shell bg-hero-grid p-8 md:p-10">
          <div className="fade-rise">
            <p className="text-sm uppercase tracking-[0.24em] text-pulse">Growth OS access</p>
            <h1 className="display-title mt-4 max-w-2xl text-3xl font-semibold leading-tight text-ink sm:text-4xl md:text-5xl md:leading-[1.02]">
              Sign in to a workspace that keeps your goals, execution, and progress connected.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
              This is not a plain login wall. It is the entry point into a system that generates roadmaps, stores past AI chats, tracks work,
              and keeps portfolio proof tied to the goals you are actually pursuing.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {featureCards.map((card, index) => (
              <div key={card.title} className={`soft-card rounded-3xl p-5 ${index === 0 ? "fade-rise" : index === 1 ? "fade-rise-delay-1" : "fade-rise-delay-2"}`}>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ember">{card.title}</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">{card.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[28px] bg-ink p-6 text-white shadow-glow">
              <p className="text-sm uppercase tracking-[0.22em] text-white/70">What happens after login</p>
              <div className="mt-5 space-y-4">
                {workflowSteps.map((step, index) => (
                  <div key={step} className="flex items-start gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/12 text-sm font-semibold text-white">
                      0{index + 1}
                    </div>
                    <p className="text-sm leading-7 text-white/88">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="soft-card rounded-[28px] p-6">
              <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Inside the workspace</p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                <p>Roadmap generation around your selected domain and target outcome.</p>
                <p>Planner pages with weekly notes, resources, and project prompts.</p>
                <p>Persistent chatbot history with conversation switching and saved threads.</p>
                <p>Analytics, reminders, assets, and progress memory tied to one account.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell p-8 md:p-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${mode === "login" ? "bg-cyan-400 text-slate-950 shadow-glow" : "bg-slate-900 text-slate-300 hover:bg-slate-800"}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${mode === "register" ? "bg-cyan-400 text-slate-950 shadow-glow" : "bg-slate-900 text-slate-300 hover:bg-slate-800"}`}
            >
              Register
            </button>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-sm font-semibold text-slate-100">{mode === "login" ? "Return to your workspace" : "Create your workspace account"}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {mode === "login"
                ? "Your saved chats, goals, analytics, and uploaded proof stay linked to this account."
                : "Registration creates your starting workspace, first goal shell, and a persistent account for future sessions."}
            </p>
          </div>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === "register" ? (
              <input
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-pulse focus:shadow-glow"
              />
            ) : null}
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-pulse focus:shadow-glow"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 pr-14 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-pulse focus:shadow-glow"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 transition hover:text-slate-100"
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-2">
                    <path d="M3 3l18 18" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10.58 10.58A2 2 0 0012 14a2 2 0 001.42-.58" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9.88 5.09A9.77 9.77 0 0112 4.8c4.5 0 8.06 3.15 9.2 7.2a9.78 9.78 0 01-3.32 4.71" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6.61 6.61A9.8 9.8 0 002.8 12c1.14 4.05 4.7 7.2 9.2 7.2a9.77 9.77 0 005.39-1.61" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-2">
                    <path d="M2.8 12C3.94 7.95 7.5 4.8 12 4.8s8.06 3.15 9.2 7.2c-1.14 4.05-4.7 7.2-9.2 7.2S3.94 16.05 2.8 12z" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="2.6" />
                  </svg>
                )}
              </button>
            </div>
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={submitting} className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:shadow-glow disabled:opacity-60">
                {submitting ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
