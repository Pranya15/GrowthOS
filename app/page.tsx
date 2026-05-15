import Link from "next/link";
import { DomainPill, ProgressCard, SectionTitle, Shell } from "@/components/ui";
import { defaultProgress, domainBlueprints } from "@/lib/data";

const platformModules = [
  {
    title: "Roadmap engine",
    copy: "Users define a goal, choose a domain, and get an adaptive path that can be tuned by available time, performance score, and current focus."
  },
  {
    title: "Planner and weekly pages",
    copy: "The platform turns goals into daily and weekly execution maps with notes, project prompts, and resource links instead of vague advice."
  },
  {
    title: "AI mentor and chatbot",
    copy: "The chatbot resolves doubts, gives step-by-step help, stores history, and lets users continue previous conversations from a saved sidebar."
  },
  {
    title: "Resources and portfolio",
    copy: "Recommended videos, PDFs, notes, and practice material sit next to a vault for projects, certificates, notes, and work samples."
  },
  {
    title: "Analytics and reminders",
    copy: "Consistency, productivity, weak areas, reminders, and milestones stay visible so users can see whether the plan is actually working."
  },
  {
    title: "Persistent account state",
    copy: "Goals, planner output, reminders, achievements, assets, and chat history persist per account using local storage or PostgreSQL-backed state."
  }
];

const explainers = [
  {
    title: "What this project is",
    copy: "Growth OS is an AI-powered learning and career growth platform built as a personal operating system. It is meant for people who do not just want information. They want structure, execution support, progress memory, and proof of work in one place."
  },
  {
    title: "Who it is for",
    copy: "The platform is designed for engineering learners, exam aspirants, creators, marketers, business learners, freelancers, and other domain-specific growth paths. The domain changes, but the core problem stays the same: people need a realistic plan, a way to follow it, and a way to measure whether they are moving."
  },
  {
    title: "What happens after login",
    copy: "After authentication, the user enters a full workspace with roadmap creation, AI recommendations, a saved-chat assistant, planner pages, reminders, portfolio tracking, and progress analytics. The public homepage explains the system. The private workspace runs it."
  }
];

const workflow = [
  "Choose a domain or career direction and define an active goal.",
  "Generate a roadmap, resource stack, and weekly study or execution plan.",
  "Ask the chatbot for clarification, strategy, feedback, or next-step help.",
  "Store projects, certificates, notes, and progress proof inside the same system.",
  "Track consistency, weak areas, reminders, and milestones over time."
];

export default function HomePage() {
  return (
    <main className="pb-16 sm:pb-20">
      <section className="bg-hero-grid">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          <div className="glass fade-rise rounded-[2rem] border border-white/10 px-4 py-4 sm:rounded-full sm:px-5 sm:py-3">
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <Link href="/" className="display-title text-xl font-semibold tracking-tight text-ink sm:text-[1.35rem]">
                Growth OS
              </Link>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-300">
                <a href="#overview" className="nav-link">
                  Overview
                </a>
                <a href="#platform" className="nav-link">
                  Platform
                </a>
                <a href="#domains" className="nav-link">
                  Domains
                </a>
                <a href="#how-it-works" className="nav-link">
                  How it works
                </a>
              </div>
              <Link href="/auth" className="w-full rounded-full bg-cyan-400 px-5 py-2.5 text-center text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-300 sm:w-auto">
                Login to continue
              </Link>
            </div>
          </div>

          <div className="grid gap-8 pt-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-start lg:pt-10">
            <div className="fade-rise-delay-1 space-y-5 lg:space-y-6 lg:pt-6">
              <div className="inline-flex max-w-full rounded-full border border-pulse/30 bg-slate-950/40 px-4 py-2 text-sm font-medium text-pulse shadow-glow">
                AI-powered roadmap, planner, mentor, analytics, and portfolio system
              </div>
              <div className="space-y-4">
                <h1 className="hero-title max-w-4xl text-left text-3xl font-medium leading-[1.02] tracking-tight text-ink sm:text-5xl lg:text-6xl">
                  One workspace to plan learning, ask for help, track progress, and turn effort into visible proof.
                </h1>
                <p className="max-w-3xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                  Growth OS is built as a complete personal growth operating system. It helps users choose a target, generate a structured roadmap,
                  organize resources, use an AI mentor, save chat history, manage reminders, track consistency, and store projects or certificates
                  in a single account-based workspace.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                <Link href="/auth" className="rounded-full bg-cyan-400 px-6 py-3 text-center text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:shadow-glow">
                  Start your workspace
                </Link>
                <a
                  href="#overview"
                  className="rounded-full border border-slate-700 bg-slate-950/40 px-6 py-3 text-center text-sm font-semibold text-slate-200 transition hover:-translate-y-0.5 hover:border-pulse hover:text-pulse"
                >
                  See what the project does
                </a>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <Shell className="p-5 fade-rise">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Adaptive guidance</p>
                  <p className="mt-3 text-3xl font-semibold text-ink">24/7</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">Roadmaps, planner output, chatbot help, and mentor suggestions inside one flow.</p>
                </Shell>
                <Shell className="p-5 fade-rise-delay-1">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Supported domains</p>
                  <p className="mt-3 text-3xl font-semibold text-ink">{domainBlueprints.length}+</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">Engineering, exams, creative work, business, freelancing, and more.</p>
                </Shell>
                <Shell className="p-5 fade-rise-delay-2">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Account memory</p>
                  <p className="mt-3 text-3xl font-semibold text-ink">360°</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">Goals, chats, reminders, analytics, and portfolio proof stay linked together.</p>
                </Shell>
              </div>
            </div>

            <div className="fade-rise-delay-2 space-y-5">
              <ProgressCard progress={defaultProgress} />
              <Shell className="p-5 sm:p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Inside the workspace</p>
                <div className="mt-4 space-y-4">
                  <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-4 sm:p-5">
                    <p className="text-sm text-slate-400">Core promise</p>
                    <p className="mt-2 text-xl font-semibold text-ink">
                      The platform does not stop at content recommendations. It tries to organize execution from goal selection to proof of work.
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="soft-card rounded-3xl p-5">
                      <p className="text-sm text-slate-400">After login</p>
                      <p className="mt-2 font-semibold text-ink">Roadmaps, planner, resources, chatbot, analytics, reminders, and portfolio vault</p>
                    </div>
                    <div className="soft-card rounded-3xl p-5">
                      <p className="text-sm text-slate-400">Why it matters</p>
                      <p className="mt-2 font-semibold text-ink">Users can keep several active goals without losing track of what to do next.</p>
                    </div>
                  </div>
                </div>
              </Shell>
            </div>
          </div>
        </div>
      </section>

      <section id="overview" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
        <SectionTitle
          eyebrow="Project overview"
          title="A detailed front page explaining what the project actually does"
          copy="Growth OS is not positioned as a generic content site. It is a system for turning a learning or career goal into a structured plan, a repeatable routine, AI guidance, and stored progress evidence."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {explainers.map((item) => (
            <Shell key={item.title} className="p-6">
              <h3 className="display-title text-2xl font-semibold text-ink">{item.title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-300">{item.copy}</p>
            </Shell>
          ))}
        </div>
      </section>

      <section id="platform" className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-10">
        <SectionTitle
          eyebrow="Platform modules"
          title="What the project includes inside the product"
          copy="The application combines multiple layers that usually live in separate tools: goal management, roadmap creation, study planning, AI help, reminders, analytics, and portfolio tracking."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {platformModules.map((module) => (
            <Shell key={module.title} className="p-5">
              <h3 className="display-title text-xl font-semibold text-ink">{module.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{module.copy}</p>
            </Shell>
          ))}
        </div>
      </section>

      <section id="domains" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
        <SectionTitle
          eyebrow="Multi-domain engine"
          title="One system that can adapt across many learning and career tracks"
          copy="The same workflow can support engineering learners, exam preparation, creative fields, business goals, and other domain-specific tracks. Domain blueprints change the roadmap, resources, project ideas, and suggested career directions."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {domainBlueprints.map((domain) => (
            <DomainPill key={domain.key} label={domain.label} tagline={domain.tagline} />
          ))}
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        <SectionTitle
          eyebrow="How it works"
          title="From goal selection to execution and review"
          copy="The public homepage explains the operating model clearly. After login, the user gets a private workspace where those parts become interactive and persistent."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <Shell className="p-6">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Workflow</p>
            <div className="mt-5 space-y-4">
              {workflow.map((step, index) => (
                <div key={step} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500/10 text-sm font-semibold text-cyan-300">
                    0{index + 1}
                  </div>
                  <p className="text-sm leading-7 text-slate-300">{step}</p>
                </div>
              ))}
            </div>
          </Shell>
          <Shell className="p-6">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Why this project exists</p>
            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-300">
              <p>Many users know what they want in broad terms but do not have a system that connects planning, learning, execution, review, and proof of work.</p>
              <p>This project closes that gap by keeping the roadmap layer, the mentor layer, the planning layer, and the progress layer in one persistent workspace.</p>
              <p>The goal is not just to answer a question. The goal is to help the user keep moving, keep context, and keep evidence of progress over time.</p>
            </div>
          </Shell>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        <Shell className="p-5 sm:p-6 md:p-8">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Final module</p>
          <h3 className="display-title mt-2 text-3xl font-semibold text-ink">Saved AI chatbot workspace</h3>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">
            The chatbot supports doubt resolution, project review, career guidance, exam strategy, and saved conversation history. Users can clear
            history, start fresh threads, return to older conversations, and use the assistant as a persistent part of the workspace rather than a one-off prompt box.
          </p>
        </Shell>
      </section>
    </main>
  );
}
